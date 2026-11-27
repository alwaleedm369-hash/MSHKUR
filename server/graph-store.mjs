import { randomUUID } from 'node:crypto';
import { db as defaultDb, nowIso } from './db.mjs';

const NODE_TYPES = new Set([
  'user','workspace','memory','conversation_summary','source_document','skill','skill_version',
  'assistant','workflow','task','tool','integration','permission','approval','evidence','execution',
  'dataset','model_artifact','evaluation'
]);
const EDGE_TYPES = new Set([
  'OWNS','SCOPED_TO','DERIVED_FROM','REFERENCES','USES_SKILL','CAN_HANDOFF_TO','COMPOSES',
  'DEPENDS_ON','REQUIRES_PERMISSION','REQUIRES_APPROVAL','EXECUTED_AS','VERIFIED_BY',
  'EVALUATED_ON','SUPERSEDES'
]);

function parseJson(value, fallback = {}) {
  try { return JSON.parse(value); } catch { return fallback; }
}
function validateScope(scope = {}) {
  const visibility = scope.visibility ?? 'workspace';
  if (!['private','workspace','public','system'].includes(visibility)) throw new Error('Invalid graph visibility');
  if (['private','workspace'].includes(visibility) && !scope.ownerId) throw new Error('Scoped graph node requires ownerId');
  if (visibility === 'workspace' && !scope.workspaceId) throw new Error('Workspace graph node requires workspaceId');
  return { visibility, ownerId: scope.ownerId ?? null, workspaceId: scope.workspaceId ?? null };
}
function canRead(row, actor) {
  if (row.visibility === 'public' || row.visibility === 'system') return true;
  if (!actor?.userId) return false;
  if (row.visibility === 'private') return row.owner_id === actor.userId;
  return row.owner_id === actor.userId && Boolean(actor.workspaceId) && row.workspace_id === actor.workspaceId;
}
function mapNode(row) {
  return {
    id: row.id, type: row.type, label: row.label,
    data: parseJson(row.data_json), scope: {
      visibility: row.visibility, ownerId: row.owner_id, workspaceId: row.workspace_id
    },
    provenance: parseJson(row.provenance_json, null), sensitivity: row.sensitivity,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

/**
 * Durable SQLite implementation of the Smart Graph repository.
 * Authentication is deliberately external: callers must pass actor identity from
 * the authenticated server session, never from an untrusted request body.
 */
export class SqliteSmartGraphRepository {
  constructor(database = defaultDb) {
    this.db = database;
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS smart_graph_nodes (
        id TEXT PRIMARY KEY, type TEXT NOT NULL, label TEXT NOT NULL, data_json TEXT NOT NULL,
        visibility TEXT NOT NULL CHECK(visibility IN ('private','workspace','public','system')),
        owner_id TEXT, workspace_id TEXT, provenance_json TEXT, sensitivity TEXT NOT NULL,
        created_at TEXT NOT NULL, updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_smart_graph_scope ON smart_graph_nodes(visibility,owner_id,workspace_id,type);
      CREATE TABLE IF NOT EXISTS smart_graph_edges (
        id TEXT PRIMARY KEY, type TEXT NOT NULL, from_id TEXT NOT NULL REFERENCES smart_graph_nodes(id) ON DELETE CASCADE,
        to_id TEXT NOT NULL REFERENCES smart_graph_nodes(id) ON DELETE CASCADE,
        metadata_json TEXT NOT NULL, created_at TEXT NOT NULL,
        UNIQUE(type,from_id,to_id)
      );
      CREATE INDEX IF NOT EXISTS idx_smart_graph_edges_from ON smart_graph_edges(from_id,type);
      CREATE INDEX IF NOT EXISTS idx_smart_graph_edges_to ON smart_graph_edges(to_id,type);
    `);
  }

  addNode(input) {
    if (!input?.id || !NODE_TYPES.has(input.type)) throw new Error('Invalid graph node id/type');
    const scope = validateScope(input.scope);
    const timestamp = nowIso();
    this.db.prepare(`INSERT INTO smart_graph_nodes
      (id,type,label,data_json,visibility,owner_id,workspace_id,provenance_json,sensitivity,created_at,updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?)`).run(
      input.id,input.type,String(input.label ?? input.id),JSON.stringify(input.data ?? {}),
      scope.visibility,scope.ownerId,scope.workspaceId,
      input.provenance == null ? null : JSON.stringify(input.provenance),
      input.sensitivity ?? 'internal',input.createdAt ?? timestamp,timestamp
    );
    return this.getNode(input.id, {userId:scope.ownerId,workspaceId:scope.workspaceId}) ??
      this.getNode(input.id, {userId:'__system__'});
  }

  addEdge(input) {
    if (!input?.id || !EDGE_TYPES.has(input.type)) throw new Error('Invalid graph edge id/type');
    if (input.from === input.to) throw new Error('Self-referential edges are forbidden');
    const a = this.db.prepare('SELECT * FROM smart_graph_nodes WHERE id=?').get(input.from);
    const b = this.db.prepare('SELECT * FROM smart_graph_nodes WHERE id=?').get(input.to);
    if (!a || !b) throw new Error('Both graph endpoints must exist');
    const aScoped = ['private','workspace'].includes(a.visibility);
    const bScoped = ['private','workspace'].includes(b.visibility);
    if (aScoped && bScoped && a.owner_id !== b.owner_id) throw new Error('Cross-owner graph edge forbidden');
    if (a.visibility === 'workspace' && b.visibility === 'workspace' && a.workspace_id !== b.workspace_id) {
      throw new Error('Cross-workspace graph edge forbidden');
    }
    const edge = {id:input.id,type:input.type,from:input.from,to:input.to,metadata:input.metadata ?? {},createdAt:nowIso()};
    this.db.prepare('INSERT INTO smart_graph_edges(id,type,from_id,to_id,metadata_json,created_at) VALUES(?,?,?,?,?,?)')
      .run(edge.id,edge.type,edge.from,edge.to,JSON.stringify(edge.metadata),edge.createdAt);
    return edge;
  }

  getNode(id, actor) {
    const row = this.db.prepare('SELECT * FROM smart_graph_nodes WHERE id=?').get(id);
    return row && canRead(row,actor) ? mapNode(row) : undefined;
  }

  listNodes({actor,type,query,limit=100} = {}) {
    const rows = this.db.prepare('SELECT * FROM smart_graph_nodes ORDER BY created_at DESC LIMIT ?')
      .all(Math.max(0,Math.min(Number(limit)||0,5000)));
    const needle = typeof query === 'string' ? query.toLocaleLowerCase() : null;
    return rows.filter(row=>canRead(row,actor)).filter(row=>!type||row.type===type)
      .filter(row=>!needle||row.label.toLocaleLowerCase().includes(needle)).map(mapNode);
  }

  related(id,{actor,direction='both',edgeTypes,limit=100}={}) {
    if (!this.getNode(id,actor)) return [];
    const clauses = direction==='in' ? 'e.to_id=?' : direction==='out' ? 'e.from_id=?' : '(e.from_id=? OR e.to_id=?)';
    const params = direction==='both' ? [id,id] : [id];
    const rows = this.db.prepare(`SELECT e.*,
      CASE WHEN e.from_id=? THEN e.to_id ELSE e.from_id END AS target_id
      FROM smart_graph_edges e WHERE ${clauses} ORDER BY e.created_at LIMIT ?`)
      .all(id,...params,Math.max(0,Math.min(Number(limit)||0,1000)));
    const allowed = edgeTypes ? new Set(edgeTypes) : null;
    return rows.filter(row=>!allowed||allowed.has(row.type)).map(row=>{
      const node=this.getNode(row.target_id,actor);
      return node ? {edge:{id:row.id,type:row.type,from:row.from_id,to:row.to_id,metadata:parseJson(row.metadata_json),createdAt:row.created_at},node} : null;
    }).filter(Boolean);
  }

  removeNode(id,actor) {
    if (!this.getNode(id,actor)) return false;
    return this.db.prepare('DELETE FROM smart_graph_nodes WHERE id=?').run(id).changes===1;
  }

  snapshot(actor) {
    const nodes=this.listNodes({actor,limit:5000});
    const ids=new Set(nodes.map(n=>n.id));
    const edges=this.db.prepare('SELECT * FROM smart_graph_edges').all()
      .filter(e=>ids.has(e.from_id)&&ids.has(e.to_id))
      .map(e=>({id:e.id,type:e.type,from:e.from_id,to:e.to_id,metadata:parseJson(e.metadata_json),createdAt:e.created_at}));
    return {version:1,exportedAt:nowIso(),nodes,edges};
  }
}

export const smartGraphRepository = new SqliteSmartGraphRepository();
