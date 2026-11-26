/**
 * MSHKUR Assistants Manager
 * Central manager for all AI assistants with handoff, context sharing, and workflow orchestration
 */

import { AssistantManager, AssistantDefinition, AssistantMessage, ToolCall, ToolResult } from './index';
import { ProcessingContext } from '@engines/MSHKURCore';
import { skillsRegistryManager, executeSkillDirect } from '@skills/registry';

export interface AssistantSession {
  id: string;
  userId: string;
  activeAssistantId: string;
  context: ProcessingContext;
  messageHistory: AssistantMessage[];
  sharedContext: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export interface HandoffRequest {
  fromAssistant: string;
  toAssistant: string;
  reason: string;
  context: Record<string, unknown>;
  message: string;
}

export class AssistantsManager {
  private assistantManager: AssistantManager;
  private sessions: Map<string, AssistantSession> = new Map();
  private globalContext: Record<string, unknown> = {};
  private handoffHistory: HandoffRequest[] = [];

  constructor(core: any) {
    this.assistantManager = new AssistantManager(core);
  }

  async initialize(): Promise<void> {
    // Load any persisted sessions
    await this.loadSessions();
  }

  private async loadSessions(): Promise<void> {
    // In real implementation, load from IndexedDB or backend
    // For now, start fresh
  }

  createSession(userId: string, context: ProcessingContext): AssistantSession {
    const session: AssistantSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      userId,
      activeAssistantId: 'general',
      context,
      messageHistory: [],
      sharedContext: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.sessions.set(session.id, session);
    this.persistSession(session);
    return session;
  }

  getSession(sessionId: string): AssistantSession | undefined {
    return this.sessions.get(sessionId);
  }

  getSessionByUser(userId: string): AssistantSession | undefined {
    for (const session of this.sessions.values()) {
      if (session.userId === userId) return session;
    }
    return undefined;
  }

  async processMessage(
    sessionId: string,
    message: string,
    attachments?: { type: string; url: string; name: string }[]
  ): Promise<{
    response: string;
    actions?: Array<{ type: string; payload: unknown }>;
    handoff?: { assistantId: string; reason: string };
    metadata: Record<string, unknown>;
  }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Add user message to history
    const userMessage: AssistantMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: Date.now(),
      metadata: { attachments },
    };
    session.messageHistory.push(userMessage);

    // Keep history manageable
    if (session.messageHistory.length > 50) {
      session.messageHistory = session.messageHistory.slice(-50);
    }

    // Find best assistant for this message
    const bestAssistant = this.assistantManager.findBestAssistant(message, session.context);
    const assistantId = bestAssistant?.id ?? 'general';

    // Check if handoff needed
    let handoffInfo: { assistantId: string; reason: string } | undefined;
    if (assistantId !== session.activeAssistantId && bestAssistant?.canHandoff) {
      handoffInfo = {
        assistantId,
        reason: `تخصص أفضل: ${bestAssistant.nameAr}`,
      };
      session.activeAssistantId = assistantId;
      this.recordHandoff({
        fromAssistant: session.activeAssistantId,
        toAssistant: assistantId,
        reason: handoffInfo.reason,
        context: { message, sessionContext: session.sharedContext },
        message,
      });
    }

    // Execute with assistant
    const assistant = this.assistantManager.getAssistant(assistantId);
    if (!assistant) {
      throw new Error(`Assistant not found: ${assistantId}`);
    }

    // Build context with shared context
    const fullContext: ProcessingContext = {
      ...session.context,
      assistantId,
      conversationHistory: session.messageHistory.slice(-10),
      metadata: {
        ...session.context.metadata,
        sharedContext: session.sharedContext,
        sessionId,
        userId: session.userId,
      },
    };

    // Process message through assistant
    const response = await this.assistantManager.processMessage(
      sessionId,
      message,
      fullContext
    );

    // Add assistant response to history
    const assistantMessage: AssistantMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: response.content,
      timestamp: Date.now(),
      metadata: {
        assistantId,
        actions: response.actions,
        confidence: response.confidence,
        toolCalls: response.metadata?.toolCalls,
        toolResults: response.metadata?.toolResults,
      },
    };
    session.messageHistory.push(assistantMessage);

    // Update session
    session.updatedAt = Date.now();
    this.persistSession(session);

    // Check for skill executions in response
    if (response.actions) {
      for (const action of response.actions) {
        if (action.type === 'skill') {
          await this.executeSkillAction(action.payload, session);
        }
      }
    }

    return {
      response: response.content,
      actions: response.actions,
      handoff: handoffInfo,
      metadata: {
        assistantId,
        confidence: response.confidence,
        sessionId,
      },
    };
  }

  private async executeSkillAction(
    payload: unknown,
    session: AssistantSession
  ): Promise<void> {
    const { skillId, ...args } = payload as { skillId: string; [key: string]: unknown };

    try {
      const result = await executeSkillDirect(skillId, args, session.context);

      // Store result in shared context
      session.sharedContext[`skill_${skillId}_result`] = result;
      session.sharedContext[`skill_${skillId}_timestamp`] = Date.now();

      // Add tool result to message history
      const toolMessage: AssistantMessage = {
        id: `msg-${Date.now()}`,
        role: 'tool',
        content: `تم تنفيذ ${skillId} بنجاح`,
        timestamp: Date.now(),
        metadata: { skillId, result },
      };
      session.messageHistory.push(toolMessage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      session.sharedContext[`skill_${skillId}_error`] = errorMessage;

      const toolMessage: AssistantMessage = {
        id: `msg-${Date.now()}`,
        role: 'tool',
        content: `فشل تنفيذ ${skillId}: ${errorMessage}`,
        timestamp: Date.now(),
        metadata: { skillId, error: errorMessage },
      };
      session.messageHistory.push(toolMessage);
    }
  }

  async handoff(
    sessionId: string,
    targetAssistantId: string,
    reason: string,
    message?: string
  ): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const targetAssistant = this.assistantManager.getAssistant(targetAssistantId);
    if (!targetAssistant) return false;

    const fromAssistant = session.activeAssistantId;
    session.activeAssistantId = targetAssistantId;

    this.recordHandoff({
      fromAssistant,
      toAssistant: targetAssistantId,
      reason,
      context: session.sharedContext,
      message: message || '',
    });

    session.updatedAt = Date.now();
    this.persistSession(session);
    return true;
  }

  private recordHandoff(handoff: HandoffRequest): void {
    this.handoffHistory.push(handoff);
    if (this.handoffHistory.length > 100) {
      this.handoffHistory.shift();
    }
  }

  getHandoffHistory(): HandoffRequest[] {
    return [...this.handoffHistory];
  }

  setGlobalContext(key: string, value: unknown): void {
    this.globalContext[key] = value;
  }

  getGlobalContext(key: string): unknown {
    return this.globalContext[key];
  }

  getAllGlobalContext(): Record<string, unknown> {
    return { ...this.globalContext };
  }

  updateSessionContext(sessionId: string, context: Partial<ProcessingContext>): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.context = { ...session.context, ...context };
    session.updatedAt = Date.now();
    this.persistSession(session);
    return true;
  }

  updateSharedContext(sessionId: string, key: string, value: unknown): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.sharedContext[key] = value;
    session.updatedAt = Date.now();
    this.persistSession(session);
    return true;
  }

  getSharedContext(sessionId: string): Record<string, unknown> {
    const session = this.sessions.get(sessionId);
    return session?.sharedContext ?? {};
  }

  clearSession(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId);
    // Also clear from storage
    return deleted;
  }

  getActiveAssistant(sessionId: string): string | null {
    const session = this.sessions.get(sessionId);
    return session?.activeAssistantId ?? null;
  }

  setActiveAssistant(sessionId: string, assistantId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const assistant = this.assistantManager.getAssistant(assistantId);
    if (!assistant) return false;

    session.activeAssistantId = assistantId;
    session.updatedAt = Date.now();
    this.persistSession(session);
    return true;
  }

  getAvailableAssistants(): AssistantDefinition[] {
    return this.assistantManager.getAllAssistants();
  }

  getAssistant(assistantId: string): AssistantDefinition | undefined {
    return this.assistantManager.getAssistant(assistantId);
  }

  private persistSession(session: AssistantSession): void {
    // In real implementation, save to IndexedDB
    // For now, just update in memory
  }

  // Utility: Get session stats
  getSessionStats(sessionId: string): {
    messageCount: number;
    assistantSwitches: number;
    skillsUsed: string[];
    duration: number;
  } | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const skillsUsed = new Set<string>();
    for (const msg of session.messageHistory) {
      if (msg.metadata?.toolCalls) {
        for (const call of msg.metadata.toolCalls) {
          skillsUsed.add(call.name);
        }
      }
    }

    const assistantSwitches = session.messageHistory.filter(
      (msg, i) => i > 0 && msg.metadata?.assistantId !== session.messageHistory[i - 1].metadata?.assistantId
    ).length;

    return {
      messageCount: session.messageHistory.length,
      assistantSwitches,
      skillsUsed: Array.from(skillsUsed),
      duration: Date.now() - session.createdAt,
    };
  }
}

// Export factory
export function createAssistantsManager(core: any): AssistantsManager {
  return new AssistantsManager(core);
}

// Assistant workflows - predefined sequences
export const assistantWorkflows = {
  'photo-processing': {
    name: 'Photo Processing Workflow',
    nameAr: 'سير عمل معالجة الصور',
    description: 'Complete photo processing with multiple skills',
    steps: [
      { assistant: 'photo', skill: 'background-removal', params: { backgroundType: 'transparent' } },
      { assistant: 'photo', skill: 'license-plate-blur', params: { autoDetect: true } },
      { assistant: 'photo', skill: 'lighting-enhancement', params: { autoBalance: true } },
      { assistant: 'photo', skill: 'shadow-generation', params: { perspective: true } },
      { assistant: 'photo', skill: 'centering-crop', params: { mode: 'auto', aspectRatio: '4:3' } },
      { assistant: 'photo', skill: 'image-enhancement', params: { preserveNaturalLook: true } },
    ],
  },
  'ad-creation': {
    name: 'Ad Creation Workflow',
    nameAr: 'سير عمل إنشاء الإعلان',
    description: 'Create complete vehicle ad from data to publication',
    steps: [
      { assistant: 'ad', skill: 'vehicle-data-extraction', params: { source: 'user-input' } },
      { assistant: 'ad', skill: 'ad-content-generation', params: { tone: 'professional', length: 'medium' } },
      { assistant: 'ad', skill: 'template-rendering', params: { platform: 'haraj', templateId: 'modern' } },
    ],
  },
  'dealer-onboarding': {
    name: 'Dealer Onboarding',
    nameAr: 'إعداد التاجر الجديد',
    description: 'Set up new dealer with profile, inventory, and marketing',
    steps: [
      { assistant: 'dealer', skill: 'inventory-management', params: { action: 'list' } },
      { assistant: 'dealer', skill: 'marketing-automation', params: { action: 'create-campaign' } },
    ],
  },
};

export async function runAssistantWorkflow(
  workflowId: keyof typeof assistantWorkflows,
  initialInput: Record<string, unknown>,
  session: AssistantSession,
  assistantsManager: AssistantsManager
): Promise<Record<string, unknown>> {
  const workflow = assistantWorkflows[workflowId];
  if (!workflow) throw new Error(`Workflow not found: ${workflowId}`);

  const results: Record<string, unknown> = { ...initialInput };

  for (const step of workflow.steps) {
    const assistant = assistantsManager.getAssistant(step.assistant);
    if (!assistant) continue;

    // Build message for this step
    const message = `نفذ ${step.skill} مع المعطيات: ${JSON.stringify({ ...results, ...step.params })}`;

    const response = await assistantsManager.processMessage(
      session.id,
      message,
      { ...session.context, appId: step.assistant as any }
    );

    results[`${step.assistant}-${step.skill}`] = {
      content: response.response,
      actions: response.actions,
      metadata: response.metadata,
    };
  }

  return results;
}