/**
 * Index canonical runtime catalogues into Smart Graph.
 * This is a read-model projection: executable registries remain authoritative.
 */
export function indexCapabilityCatalog(graph, { skills = [], assistants = [], workflows = [] } = {}) {
  if (!graph || typeof graph.addNode !== 'function' || typeof graph.addEdge !== 'function') {
    throw new TypeError('Smart Graph repository required');
  }
  const report = { skills: 0, assistants: 0, workflows: 0, relationships: 0, unresolved: [] };
  const skillIds = new Set();

  for (const skill of skills) {
    if (!skill?.id) { report.unresolved.push({ type: 'skill', reason: 'missing id' }); continue; }
    const nodeId = `skill:${skill.id}`;
    graph.addNode({
      id: nodeId, type: 'skill', label: skill.name ?? skill.id,
      scope: { visibility: 'system' },
      data: {
        skillId: skill.id, version: skill.version ?? 'unknown',
        status: skill.status ?? 'experimental', license: skill.license ?? 'unspecified',
        permissions: Array.isArray(skill.permissions) ? [...skill.permissions] : [],
        engine: skill.engine?.provider ?? 'unspecified',
      },
      provenance: { sourceId: 'SkillRuntime.discover', version: skill.version ?? 'unknown' },
    });
    skillIds.add(skill.id);
    report.skills++;
  }

  for (const assistant of assistants) {
    if (!assistant?.id) { report.unresolved.push({ type: 'assistant', reason: 'missing id' }); continue; }
    graph.addNode({
      id: `assistant:${assistant.id}`, type: 'assistant',
      label: assistant.nameAr ?? assistant.name ?? assistant.id,
      scope: { visibility: 'system' },
      data: { assistantId: assistant.id, canHandoff: assistant.canHandoff === true },
      provenance: { sourceId: 'AssistantManager.catalogue' },
    });
    report.assistants++;
    for (const skillId of assistant.skills ?? []) {
      if (!skillIds.has(skillId)) {
        report.unresolved.push({ type: 'assistant_skill', assistantId: assistant.id, skillId });
        continue;
      }
      graph.addEdge({
        id: `assistant-skill:${assistant.id}:${skillId}`,
        type: 'USES_SKILL', from: `assistant:${assistant.id}`, to: `skill:${skillId}`,
      });
      report.relationships++;
    }
  }

  for (const workflow of workflows) {
    if (!workflow?.id) { report.unresolved.push({ type: 'workflow', reason: 'missing id' }); continue; }
    graph.addNode({
      id: `workflow:${workflow.id}`, type: 'workflow',
      label: workflow.nameAr ?? workflow.name ?? workflow.id,
      scope: { visibility: 'system' },
      data: { workflowId: workflow.id, version: workflow.version ?? 'unversioned' },
      provenance: { sourceId: 'WorkflowRegistry.catalogue' },
    });
    report.workflows++;
    for (const step of workflow.steps ?? []) {
      if (step.skillId && skillIds.has(step.skillId)) {
        graph.addEdge({
          id: `workflow-skill:${workflow.id}:${step.id ?? step.skillId}`,
          type: 'COMPOSES', from: `workflow:${workflow.id}`, to: `skill:${step.skillId}`,
          metadata: { stepId: step.id ?? null },
        });
        report.relationships++;
      } else if (step.skillId) {
        report.unresolved.push({ type: 'workflow_skill', workflowId: workflow.id, skillId: step.skillId });
      }
      if (step.assistantId) {
        const targetId = `assistant:${step.assistantId}`;
        if (graph.getNode(targetId, { userId: '__system__' })) {
          graph.addEdge({
            id: `workflow-assistant:${workflow.id}:${step.id ?? step.assistantId}`,
            type: 'COMPOSES', from: `workflow:${workflow.id}`, to: targetId,
          });
          report.relationships++;
        } else {
          report.unresolved.push({ type: 'workflow_assistant', workflowId: workflow.id, assistantId: step.assistantId });
        }
      }
    }
  }
  return report;
}
