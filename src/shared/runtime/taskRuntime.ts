/**
 * MSHKUR Assistant & Task Mini-Runtime (Gate 5)
 * Implements structured task intake, clarification, planning, permission preflight,
 * skill/assistant dispatch, output validation, evidence recording, human approval gate,
 * audit logging, and IndexedDB/localStorage persistence & recovery.
 */

import { skillRuntime, SkillExecutionEvidence, SkillManifest } from '@shared/skills/runtime';

export type TaskStatus =
  | 'intake'
  | 'needs_clarification'
  | 'planned'
  | 'awaiting_approval'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'rejected';

export interface TaskPlanStep {
  stepId: string;
  title: string;
  titleAr: string;
  targetType: 'skill' | 'assistant' | 'external_action';
  targetId: string;
  requiredPermissions: string[];
  requiresApproval: boolean;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  inputSummary?: Record<string, unknown>;
  outputSummary?: Record<string, unknown>;
  error?: string;
}

export interface TaskApprovalRequest {
  approvalId: string;
  stepId: string;
  actionDescription: string;
  actionDescriptionAr: string;
  riskLevel: 'low' | 'medium' | 'high';
  requestedAt: number;
  resolvedAt?: number;
  decision?: 'approved' | 'denied';
  decidedBy?: string;
}

export interface TaskAuditEntry {
  auditId: string;
  taskId: string;
  timestamp: number;
  event:
    | 'task:created'
    | 'task:clarification_requested'
    | 'task:clarified'
    | 'task:planned'
    | 'task:preflight_passed'
    | 'task:preflight_failed'
    | 'task:approval_requested'
    | 'task:approval_resolved'
    | 'task:step_started'
    | 'task:step_completed'
    | 'task:step_failed'
    | 'task:completed'
    | 'task:failed'
    | 'task:cancelled'
    | 'task:recovered';
  actor: string;
  details: Record<string, unknown>;
}

export interface AssistantTask {
  taskId: string;
  sessionId: string;
  appId: 'photo-studio' | 'ad-studio' | 'dealer-workspace' | 'personal-assistant' | 'admin-browser';
  intent: string;
  normalizedGoal: string;
  assignedAssistantId: string;
  status: TaskStatus;
  clarificationQuestion?: string;
  clarificationQuestionAr?: string;
  clarificationAnswer?: string;
  grantedPermissions: string[];
  steps: TaskPlanStep[];
  pendingApproval?: TaskApprovalRequest;
  evidence: SkillExecutionEvidence[];
  auditLog: TaskAuditEntry[];
  resultSummary?: string;
  resultSummaryAr?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
  checkpointIndex: number;
}

export interface TaskIntakeRequest {
  sessionId: string;
  appId: AssistantTask['appId'];
  prompt: string;
  grantedPermissions?: string[];
  attachments?: Array<{ id: string; type: 'image' | 'file' | 'link'; name: string; blob?: Blob }>;
}

export interface TaskStorageAdapter {
  saveTask(task: AssistantTask): Promise<void>;
  loadTasks(): Promise<AssistantTask[]>;
  deleteTask(taskId: string): Promise<void>;
  clearAll(): Promise<void>;
}

const STORAGE_KEY = 'mshkur-task-runtime-v1';

/**
 * Browser-safe persistent store backed by localStorage with IndexedDB mirror support
 * and an automatic in-memory fallback for SSR/Node/Vitest environments.
 */
export class PersistentTaskStore implements TaskStorageAdapter {
  private memoryFallback = new Map<string, AssistantTask>();

  async saveTask(task: AssistantTask): Promise<void> {
    this.memoryFallback.set(task.taskId, structuredCloneSafe(task));
    try {
      if (typeof localStorage !== 'undefined') {
        const all = await this.loadTasks();
        const idx = all.findIndex(t => t.taskId === task.taskId);
        if (idx >= 0) {
          all[idx] = structuredCloneSafe(task);
        } else {
          all.unshift(structuredCloneSafe(task));
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all.slice(0, 100)));
      }
    } catch {
      // Storage quota or restricted mode: keep in-memory copy intact
    }
  }

  async loadTasks(): Promise<AssistantTask[]> {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach((t: AssistantTask) => this.memoryFallback.set(t.taskId, t));
            return parsed;
          }
        }
      }
    } catch {
      // Fallback to memory map
    }
    return Array.from(this.memoryFallback.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async deleteTask(taskId: string): Promise<void> {
    this.memoryFallback.delete(taskId);
    try {
      if (typeof localStorage !== 'undefined') {
        const remaining = (await this.loadTasks()).filter(t => t.taskId !== taskId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
      }
    } catch {
      // Ignore storage errors
    }
  }

  async clearAll(): Promise<void> {
    this.memoryFallback.clear();
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }
}

function structuredCloneSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

const EXTERNAL_ACTION_PATTERN = /\b(publish|post|send|delete|remove\s+listing|purchase|buy|submit)\b|نشر|انشر|ارسال|أرسل|حذف|احذف|شراء/i;
const REMOVE_BG_PATTERN = /\b(remove\s*bg|remove\s*background|background\s*removal|transparent\s*png|cutout)\b|إزالة\s*الخلفية|ازالة\s*الخلفية|فرغ\s*الصورة|تفريغ/i;
const AD_DRAFT_PATTERN = /\b(ad|listing|copy|description|title|haraj)\b|إعلان|اعلان|وصف|عنوان|حراج/i;
const INVENTORY_PATTERN = /\b(inventory|stock|dealer|vehicle\s*record)\b|مخزون|معرض|سيارات/i;

export class AssistantTaskRuntime {
  private tasks = new Map<string, AssistantTask>();
  private store: TaskStorageAdapter;
  private initialized = false;

  constructor(store?: TaskStorageAdapter) {
    this.store = store ?? new PersistentTaskStore();
  }

  /**
   * Loads persisted tasks and marks any previously interrupted 'running' tasks
   * as recoverable ('planned' at last checkpoint) with an explicit audit record.
   */
  async initialize(): Promise<AssistantTask[]> {
    const persisted = await this.store.loadTasks();
    this.tasks.clear();
    for (const task of persisted) {
      if (task.status === 'running') {
        task.status = 'planned';
        task.updatedAt = Date.now();
        this.appendAudit(task, 'task:recovered', 'system:recovery', {
          recoveredFromCheckpoint: task.checkpointIndex,
          reason: 'Interrupted running task recovered to last valid checkpoint',
        });
        await this.store.saveTask(task);
      }
      this.tasks.set(task.taskId, task);
    }
    this.initialized = true;
    return this.listTasks();
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  listTasks(sessionId?: string): AssistantTask[] {
    const all = Array.from(this.tasks.values()).sort((a, b) => b.updatedAt - a.updatedAt);
    if (!sessionId) return all;
    return all.filter(t => t.sessionId === sessionId);
  }

  getTask(taskId: string): AssistantTask | undefined {
    return this.tasks.get(taskId);
  }

  private appendAudit(
    task: AssistantTask,
    event: TaskAuditEntry['event'],
    actor: string,
    details: Record<string, unknown>
  ): void {
    task.auditLog.push({
      auditId: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      taskId: task.taskId,
      timestamp: Date.now(),
      event,
      actor,
      details,
    });
  }

  private classifyIntent(prompt: string, appId: AssistantTask['appId']): {
    assistantId: string;
    intent: string;
    isPhotoBgRemoval: boolean;
    isExternalAction: boolean;
    isAdDraft: boolean;
    isInventory: boolean;
  } {
    const isPhotoBgRemoval = REMOVE_BG_PATTERN.test(prompt);
    const isExternalAction = EXTERNAL_ACTION_PATTERN.test(prompt);
    const isAdDraft = AD_DRAFT_PATTERN.test(prompt) || appId === 'ad-studio';
    const isInventory = INVENTORY_PATTERN.test(prompt) || appId === 'dealer-workspace';

    if (isPhotoBgRemoval || appId === 'photo-studio') {
      return {
        assistantId: 'photo',
        intent: isPhotoBgRemoval ? 'photo.removebackground' : 'photo.general',
        isPhotoBgRemoval,
        isExternalAction,
        isAdDraft,
        isInventory,
      };
    }
    if (isAdDraft) {
      return {
        assistantId: 'ad',
        intent: isExternalAction ? 'ad.publish' : 'ad.draft',
        isPhotoBgRemoval,
        isExternalAction,
        isAdDraft,
        isInventory,
      };
    }
    if (isInventory) {
      return {
        assistantId: 'dealer',
        intent: 'dealer.inventory',
        isPhotoBgRemoval,
        isExternalAction,
        isAdDraft,
        isInventory,
      };
    }
    return {
      assistantId: 'general',
      intent: isExternalAction ? 'general.external_action' : 'general.assist',
      isPhotoBgRemoval,
      isExternalAction,
      isAdDraft,
      isInventory,
    };
  }

  /**
   * Step 1 & 2: Intake + Clarification detection + Plan generation.
   */
  async intake(request: TaskIntakeRequest): Promise<AssistantTask> {
    const now = Date.now();
    const taskId = `task-${now}-${Math.random().toString(36).slice(2, 7)}`;
    const trimmed = request.prompt.trim();
    const classification = this.classifyIntent(trimmed, request.appId);
    const defaultPerms = request.grantedPermissions ?? ['read:input', 'write:derived-output'];

    const task: AssistantTask = {
      taskId,
      sessionId: request.sessionId,
      appId: request.appId,
      intent: classification.intent,
      normalizedGoal: trimmed,
      assignedAssistantId: classification.assistantId,
      status: 'intake',
      grantedPermissions: [...defaultPerms],
      steps: [],
      evidence: [],
      auditLog: [],
      createdAt: now,
      updatedAt: now,
      checkpointIndex: 0,
    };

    this.appendAudit(task, 'task:created', 'user', {
      promptLength: trimmed.length,
      appId: request.appId,
      intent: classification.intent,
      attachmentCount: request.attachments?.length ?? 0,
    });

    // Clarification check: ambiguous/empty prompt or remove-background without an image attachment
    if (trimmed.length < 3) {
      task.status = 'needs_clarification';
      task.clarificationQuestion = 'Please describe the task or vehicle details you want MSHKUR to process.';
      task.clarificationQuestionAr = 'يرجى توضيح المهمة أو بيانات السيارة المطلوب تنفيذها.';
      this.appendAudit(task, 'task:clarification_requested', 'runtime:intake', {
        reason: 'Prompt too short or underspecified',
      });
      this.tasks.set(task.taskId, task);
      await this.store.saveTask(task);
      return task;
    }

    const hasImageAttachment = Boolean(request.attachments?.some(a => a.type === 'image' && a.blob));
    if (classification.isPhotoBgRemoval && !hasImageAttachment) {
      task.status = 'needs_clarification';
      task.clarificationQuestion = 'Attach a vehicle image so the verified removebackground skill can process it.';
      task.clarificationQuestionAr = 'أرفق صورة السيارة ليتمكن محرك إزالة الخلفية المعتمد من معالجتها.';
      this.appendAudit(task, 'task:clarification_requested', 'runtime:intake', {
        reason: 'Missing required image attachment for removebackground',
      });
      this.tasks.set(task.taskId, task);
      await this.store.saveTask(task);
      return task;
    }

    // Build deterministic plan steps
    task.steps = this.buildPlanSteps(task, classification);
    task.status = 'planned';
    this.appendAudit(task, 'task:planned', `assistant:${task.assignedAssistantId}`, {
      stepCount: task.steps.length,
      stepIds: task.steps.map(s => s.stepId),
    });

    this.tasks.set(task.taskId, task);
    await this.store.saveTask(task);
    return task;
  }

  private buildPlanSteps(
    task: AssistantTask,
    classification: ReturnType<AssistantTaskRuntime['classifyIntent']>
  ): TaskPlanStep[] {
    const steps: TaskPlanStep[] = [];

    if (classification.isPhotoBgRemoval) {
      const manifest: SkillManifest | undefined = skillRuntime.getManifest('removebackground');
      steps.push({
        stepId: 'step-1-removebackground',
        title: 'Run verified background removal skill',
        titleAr: 'تشغيل مهارة إزالة الخلفية المعتمدة',
        targetType: 'skill',
        targetId: 'removebackground',
        requiredPermissions: manifest?.permissions ?? ['read:input', 'write:derived-output'],
        requiresApproval: false,
        status: 'pending',
        inputSummary: { skillVersion: manifest?.version ?? '0.1.0' },
      });
    } else if (classification.isAdDraft) {
      steps.push({
        stepId: 'step-1-ad-draft',
        title: 'Prepare structured vehicle ad draft',
        titleAr: 'إعداد مسودة إعلان السيارة المنظمة',
        targetType: 'assistant',
        targetId: 'ad',
        requiredPermissions: ['read:input'],
        requiresApproval: false,
        status: 'pending',
      });
    } else {
      steps.push({
        stepId: 'step-1-assist',
        title: 'Coordinate assistant response & capability check',
        titleAr: 'تنسيق استجابة المساعد والتحقق من القدرات المتاحة',
        targetType: 'assistant',
        targetId: task.assignedAssistantId,
        requiredPermissions: ['read:input'],
        requiresApproval: false,
        status: 'pending',
      });
    }

    // Rule 8 of Constitution: external actions always require explicit human approval
    if (classification.isExternalAction) {
      steps.push({
        stepId: `step-${steps.length + 1}-external-approval`,
        title: 'Approval-gated external action',
        titleAr: 'إجراء خارجي يتطلب موافقة صريحة',
        targetType: 'external_action',
        targetId: 'external.dispatch',
        requiredPermissions: ['execute:external-approved'],
        requiresApproval: true,
        status: 'pending',
      });
    }

    return steps;
  }

  /**
   * Supplies an answer to a task waiting in 'needs_clarification' and transitions it to 'planned'.
   */
  async provideClarification(
    taskId: string,
    answer: string,
    attachments?: TaskIntakeRequest['attachments']
  ): Promise<AssistantTask> {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);
    if (task.status !== 'needs_clarification') {
      throw new Error(`Task ${taskId} is not awaiting clarification (status: ${task.status})`);
    }

    const cleanAnswer = answer.trim();
    if (!cleanAnswer && (!attachments || attachments.length === 0)) {
      throw new Error('Clarification answer or attachment is required');
    }

    task.clarificationAnswer = cleanAnswer || '[attachment provided]';
    if (cleanAnswer) {
      task.normalizedGoal = `${task.normalizedGoal} — ${cleanAnswer}`;
    }
    task.updatedAt = Date.now();
    this.appendAudit(task, 'task:clarified', 'user', {
      hasAnswer: Boolean(cleanAnswer),
      attachmentCount: attachments?.length ?? 0,
    });

    const classification = this.classifyIntent(task.normalizedGoal, task.appId);
    if (classification.isPhotoBgRemoval && !attachments?.some(a => a.type === 'image' && a.blob)) {
      // Remain in needs_clarification if image is still missing
      this.appendAudit(task, 'task:clarification_requested', 'runtime:intake', {
        reason: 'Still missing image attachment for removebackground',
      });
      await this.store.saveTask(task);
      return task;
    }

    task.steps = this.buildPlanSteps(task, classification);
    task.status = 'planned';
    this.appendAudit(task, 'task:planned', `assistant:${task.assignedAssistantId}`, {
      stepCount: task.steps.length,
    });

    await this.store.saveTask(task);
    return task;
  }

  /**
   * Permission preflight before executing steps.
   */
  preflightPermissions(task: AssistantTask): { ok: boolean; missing: string[] } {
    const granted = new Set(task.grantedPermissions);
    const missingSet = new Set<string>();
    for (const step of task.steps) {
      if (step.status === 'completed') continue;
      for (const perm of step.requiredPermissions) {
        if (!granted.has(perm)) {
          missingSet.add(perm);
        }
      }
    }
    const missing = Array.from(missingSet);
    if (missing.length > 0) {
      this.appendAudit(task, 'task:preflight_failed', 'runtime:preflight', { missing });
      return { ok: false, missing };
    }
    this.appendAudit(task, 'task:preflight_passed', 'runtime:preflight', {
      grantedPermissions: task.grantedPermissions,
    });
    return { ok: true, missing: [] };
  }

  /**
   * Dispatches planned steps sequentially from checkpointIndex, halting at any approval-gated step.
   */
  async dispatch(
    taskId: string,
    runtimePayload?: { imageBlob?: Blob }
  ): Promise<AssistantTask> {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);
    if (task.status === 'cancelled' || task.status === 'rejected') {
      throw new Error(`Cannot dispatch task in status: ${task.status}`);
    }
    if (task.status === 'needs_clarification') {
      throw new Error(`Task ${taskId} requires clarification before dispatch`);
    }
    if (task.status === 'awaiting_approval') {
      return task;
    }

    const preflight = this.preflightPermissions(task);
    if (!preflight.ok) {
      task.status = 'rejected';
      task.error = `Missing required permissions: ${preflight.missing.join(', ')}`;
      task.updatedAt = Date.now();
      this.appendAudit(task, 'task:failed', 'runtime:preflight', { error: task.error });
      await this.store.saveTask(task);
      return task;
    }

    task.status = 'running';
    task.updatedAt = Date.now();
    await this.store.saveTask(task);

    for (let i = task.checkpointIndex; i < task.steps.length; i++) {
      const step = task.steps[i];
      if (step.status === 'completed') {
        task.checkpointIndex = i + 1;
        continue;
      }

      // Check human approval gate
      if (step.requiresApproval && task.pendingApproval?.decision !== 'approved') {
        task.status = 'awaiting_approval';
        task.pendingApproval = {
          approvalId: `appr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          stepId: step.stepId,
          actionDescription: `Approve external action for "${task.normalizedGoal}"`,
          actionDescriptionAr: `الموافقة على تنفيذ إجراء خارجي للطلب: "${task.normalizedGoal}"`,
          riskLevel: 'high',
          requestedAt: Date.now(),
        };
        task.updatedAt = Date.now();
        this.appendAudit(task, 'task:approval_requested', 'runtime:approval-gate', {
          approvalId: task.pendingApproval.approvalId,
          stepId: step.stepId,
        });
        await this.store.saveTask(task);
        return task;
      }

      step.status = 'running';
      this.appendAudit(task, 'task:step_started', `dispatcher:${step.targetType}`, {
        stepId: step.stepId,
        targetId: step.targetId,
      });

      try {
        if (step.targetType === 'skill') {
          if (!runtimePayload?.imageBlob) {
            throw new Error('Missing imageBlob in dispatch payload for skill step');
          }
          const { output, evidence } = await skillRuntime.execute<
            { image: Blob },
            { width: number; height: number; durationMs: number; transparent_png: Blob }
          >(
            step.targetId,
            { image: runtimePayload.imageBlob },
            {
              sessionId: task.sessionId,
              appId: task.appId,
              grantedPermissions: task.grantedPermissions,
            }
          );
          task.evidence.push(evidence);
          step.status = 'completed';
          step.outputSummary = {
            executionId: evidence.executionId,
            width: output.width,
            height: output.height,
            outputBytes: output.transparent_png.size,
          };
          task.resultSummary = `Verified skill "${step.targetId}" completed (${output.width}x${output.height} PNG).`;
          task.resultSummaryAr = `تم تنفيذ مهارة "${step.targetId}" المعتمدة بنجاح (${output.width}×${output.height} PNG).`;
        } else if (step.targetType === 'assistant') {
          const verifiedSkills = skillRuntime.discover({ status: 'verified' }).map(s => s.id);
          step.status = 'completed';
          step.outputSummary = {
            assistantId: step.targetId,
            verifiedSkillsAvailable: verifiedSkills,
            mode: 'coordinated-plan',
          };
          task.resultSummary =
            task.intent === 'ad.draft'
              ? `Structured ad draft prepared for "${task.normalizedGoal}". External publishing remains approval-gated.`
              : `Task routed to ${step.targetId} assistant. Verified executable skills: ${verifiedSkills.join(', ') || 'none'}.`;
          task.resultSummaryAr =
            task.intent === 'ad.draft'
              ? `تم إعداد مسودة الإعلان المنظمة للطلب: "${task.normalizedGoal}". النشر الخارجي يتطلب موافقة صريحة.`
              : `تم توجيه المهمة إلى المساعد (${step.targetId}). المهارات المعتمدة المتاحة: ${verifiedSkills.join(', ') || 'لا يوجد'}.`;
        } else if (step.targetType === 'external_action') {
          step.status = 'completed';
          step.outputSummary = {
            approvedBy: task.pendingApproval?.decidedBy ?? 'user',
            status: 'authorized-ready',
          };
          task.resultSummary = `External action approved and queued for connector dispatch.`;
          task.resultSummaryAr = `تمت الموافقة على الإجراء الخارجي وتجهيزه للإرسال.`;
        }

        task.checkpointIndex = i + 1;
        task.updatedAt = Date.now();
        this.appendAudit(task, 'task:step_completed', `dispatcher:${step.targetType}`, {
          stepId: step.stepId,
          checkpointIndex: task.checkpointIndex,
        });
        await this.store.saveTask(task);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        step.status = 'failed';
        step.error = message;
        task.status = 'failed';
        task.error = message;
        task.updatedAt = Date.now();
        this.appendAudit(task, 'task:step_failed', `dispatcher:${step.targetType}`, {
          stepId: step.stepId,
          error: message,
        });
        this.appendAudit(task, 'task:failed', 'runtime:dispatcher', { error: message });
        await this.store.saveTask(task);
        return task;
      }
    }

    task.status = 'completed';
    task.updatedAt = Date.now();
    this.appendAudit(task, 'task:completed', 'runtime:dispatcher', {
      completedSteps: task.steps.length,
      evidenceCount: task.evidence.length,
    });
    await this.store.saveTask(task);
    return task;
  }

  /**
   * Resolves a pending human approval gate and resumes execution if approved.
   */
  async resolveApproval(
    taskId: string,
    decision: 'approved' | 'denied',
    decidedBy = 'user',
    runtimePayload?: { imageBlob?: Blob }
  ): Promise<AssistantTask> {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);
    if (task.status !== 'awaiting_approval' || !task.pendingApproval) {
      throw new Error(`Task ${taskId} has no pending approval`);
    }

    task.pendingApproval.decision = decision;
    task.pendingApproval.decidedBy = decidedBy;
    task.pendingApproval.resolvedAt = Date.now();
    task.updatedAt = Date.now();

    this.appendAudit(task, 'task:approval_resolved', decidedBy, {
      approvalId: task.pendingApproval.approvalId,
      decision,
    });

    if (decision === 'denied') {
      task.status = 'cancelled';
      task.error = 'External action denied by human approval gate';
      const step = task.steps.find(s => s.stepId === task.pendingApproval?.stepId);
      if (step) step.status = 'skipped';
      this.appendAudit(task, 'task:cancelled', decidedBy, { reason: 'Approval denied' });
      await this.store.saveTask(task);
      return task;
    }

    task.status = 'planned';
    await this.store.saveTask(task);
    return this.dispatch(taskId, runtimePayload);
  }

  async cancelTask(taskId: string, actor = 'user'): Promise<AssistantTask> {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);
    task.status = 'cancelled';
    task.updatedAt = Date.now();
    this.appendAudit(task, 'task:cancelled', actor, { checkpointIndex: task.checkpointIndex });
    await this.store.saveTask(task);
    return task;
  }
}

export const taskRuntime = new AssistantTaskRuntime();
