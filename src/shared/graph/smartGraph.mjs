/**
 * MSHKUR Smart Graph — provider-neutral relationship and retrieval core.
 * In-memory adapter for deterministic tests and local prototypes; not durable production storage.
 */

export const NODE_TYPES = Object.freeze([
  'user','workspace','memory','conversation_summary','source_document',
  'skill','skill_version','assistant','workflow','task','tool','integration',
  'permission','approval','evidence','execution','dataset','model_artifact','evaluation'
]);

export const EDGE_TYPES = Object.freeze([
  'OWNS','SCOPED_TO','DERIVED_FROM','REFERENCES','USES_SKILL',
  'CAN_HANDOFF_TO','COMPOSES','DEPENDS_ON','REQUIRES_PERMISSION',
  'REQUIRES_APPROVAL','EXECUTED_AS','VERIFIED_BY','EVALUATED_ON','SUPERSEDES'
]);

const clone = value => structuredClone(value);
const now = () => new Date().toISOString();

function assertString(value, name) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError(`${name} must be a non-empty string`);
  }
}

function normalizeScope(scope = {}) {
  const visibility = scope.visibility ?? 'workspace';
  if (!['private','workspace','public','system'].includes(visibility)) {
    throw new TypeError('Unsupported graph visibility');
  }
  return {
    visibility,
    ownerId: scope.ownerId ?? null,
    workspaceId: scope.workspaceId ?? null,
  };
}

function canRead(node, actor) {
  if (node.scope.visibility === 'public' || node.scope.visibility === 'system') return true;
  if (!actor) return false;
  if (node.scope.visibility === 'private') return node.scope.ownerId === actor.userId;
  return Boolean(actor.userId && actor.userId === node.scope.ownerId &&
    actor.workspaceId && actor.workspaceId === node.scope.workspaceId);
}

/**
 * Repository contract prototype. Replace with SQLite/IndexedDB/Postgres adapter
 * without changing graph consumers. No network or hosted graph service is used.
 */
export class InMemorySmartGraphRepository {
  #nodes = new Map();
  #edges = new Map();

  addNode(input) {
    assertString(input?.id, 'node.id');
    if (!NODE_TYPES.includes(input.type)) throw new TypeError('Unsupported node type');
    if (this.#nodes.has(input.id)) throw new Error(`Node already exists: ${input.id}`);
    const scope = normalizeScope(input.scope);
    if (['private','workspace'].includes(scope.visibility) && !scope.ownerId) {
      throw new Error('Scoped nodes require ownerId');
    }
    if (scope.visibility === 'workspace' && !scope.workspaceId) {
      throw new Error('Workspace nodes require workspaceId');
    }
    const node = {
      id: input.id,
      type: input.type,
      label: String(input.label ?? input.id),
      data: clone(input.data ?? {}),
      scope,
      provenance: input.provenance ? clone(input.provenance) : null,
      sensitivity: input.sensitivity ?? 'internal',
      createdAt: input.createdAt ?? now(),
      updatedAt: now(),
    };
    this.#nodes.set(node.id, node);
    return clone(node);
  }

  addEdge(input) {
    assertString(input?.id, 'edge.id');
    if (!EDGE_TYPES.includes(input.type)) throw new TypeError('Unsupported edge type');
    if (this.#edges.has(input.id)) throw new Error(`Edge already exists: ${input.id}`);
    const from = this.#nodes.get(input.from);
    const to = this.#nodes.get(input.to);
    if (!from || !to) throw new Error('Both edge endpoints must exist');
    if (input.from === input.to) throw new Error('Self-referential edges are not allowed');
    // System/public capabilities may be referenced by scoped tasks, but graph links
    // never grant permissions or make private data public.
    if (from.scope.visibility === 'private' && to.scope.visibility === 'private' &&
        from.scope.ownerId !== to.scope.ownerId) {
      throw new Error('Cross-user private edges are forbidden');
    }
    if (from.scope.visibility === 'workspace' && to.scope.visibility === 'workspace' &&
        (from.scope.ownerId !== to.scope.ownerId || from.scope.workspaceId !== to.scope.workspaceId)) {
      throw new Error('Cross-workspace edges are forbidden');
    }
    const edge = {
      id: input.id, type: input.type, from: input.from, to: input.to,
      metadata: clone(input.metadata ?? {}), createdAt: now(),
    };
    this.#edges.set(edge.id, edge);
    return clone(edge);
  }

  getNode(id, actor) {
    const node = this.#nodes.get(id);
    return node && canRead(node, actor) ? clone(node) : undefined;
  }

  listNodes({ actor, type, query, limit = 100 } = {}) {
    const needle = typeof query === 'string' ? query.toLocaleLowerCase() : null;
    return [...this.#nodes.values()]
      .filter(node => canRead(node, actor))
      .filter(node => !type || node.type === type)
      .filter(node => !needle || node.label.toLocaleLowerCase().includes(needle))
      .slice(0, Math.max(0, Math.min(limit, 500)))
      .map(clone);
  }

  related(nodeId, { actor, direction = 'both', edgeTypes, limit = 100 } = {}) {
    if (!this.getNode(nodeId, actor)) return [];
    const allowed = edgeTypes ? new Set(edgeTypes) : null;
    const found = [];
    for (const edge of this.#edges.values()) {
      if (allowed && !allowed.has(edge.type)) continue;
      const matches = (direction !== 'in' && edge.from === nodeId) ||
        (direction !== 'out' && edge.to === nodeId);
      if (!matches) continue;
      const targetId = edge.from === nodeId ? edge.to : edge.from;
      const node = this.getNode(targetId, actor);
      if (node) found.push({ edge: clone(edge), node });
      if (found.length >= limit) break;
    }
    return found;
  }

  removeNode(id, actor) {
    const node = this.getNode(id, actor);
    if (!node) return false;
    this.#nodes.delete(id);
    for (const [edgeId, edge] of this.#edges) {
      if (edge.from === id || edge.to === id) this.#edges.delete(edgeId);
    }
    return true;
  }

  snapshot(actor) {
    const nodes = this.listNodes({ actor, limit: 500 });
    const ids = new Set(nodes.map(node => node.id));
    const edges = [...this.#edges.values()]
      .filter(edge => ids.has(edge.from) && ids.has(edge.to))
      .map(clone);
    return { version: 1, exportedAt: now(), nodes, edges };
  }

  get size() {
    return { nodes: this.#nodes.size, edges: this.#edges.size };
  }
}

/**
 * Capability check is deliberately separate from graph traversal.
 * Callers must provide an authoritative runtime verifier.
 */
export function createCapabilityResolver({ graph, verifySkill }) {
  if (!graph || typeof graph.related !== 'function') throw new TypeError('graph repository required');
  if (typeof verifySkill !== 'function') throw new TypeError('authoritative verifySkill callback required');
  return async function resolveSkillsForTask(taskNodeId, actor) {
    const links = graph.related(taskNodeId, { actor, direction: 'out', edgeTypes: ['USES_SKILL'] });
    const resolved = [];
    for (const link of links) {
      if (link.node.type !== 'skill') continue;
      const verification = await verifySkill(link.node.id, actor);
      if (verification?.verified === true && verification?.enabled === true) {
        resolved.push({ skillId: link.node.id, verification });
      }
    }
    return resolved;
  };
}
