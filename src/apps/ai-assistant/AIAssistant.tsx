import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bot, Sparkles, Send, Mic, MicOff, X, ChevronDown,
  Plus, Copy, Image as ImageIcon, FileText, Zap, Layers,
  Trash2, Search, Calendar, RotateCcw, CheckCircle2, ShieldAlert, Clock
} from 'lucide-react';
import { cn } from '@utils/cn';
import { useLocaleTheme } from '@hooks/useLocaleTheme';
import { taskRuntime, AssistantTask } from '@shared/runtime/taskRuntime';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  taskId?: string;
}

interface Attachment {
  id: string;
  type: 'image' | 'file' | 'link';
  url: string;
  name: string;
  size?: number;
  blob?: File;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

const QUICK_ACTIONS = [
  {
    labelEn: 'Remove Background',
    labelAr: 'إزالة الخلفية',
    icon: ImageIcon,
    action: 'photo',
    descEn: 'Verified neural vehicle cutout',
    descAr: 'تفريغ خلفية السيارة بالمهارة المعتمدة',
  },
  {
    labelEn: 'Draft Car Ad',
    labelAr: 'مسودة إعلان',
    icon: FileText,
    action: 'ad',
    descEn: 'Structured listing copy (approval-gated)',
    descAr: 'إعداد مسودة إعلان منظمة',
  },
  {
    labelEn: 'Inventory Check',
    labelAr: 'إدارة المخزون',
    icon: Layers,
    action: 'inventory',
    descEn: 'Route to dealer workspace assistant',
    descAr: 'توجيه لمساعد المعرض والمخزون',
  },
  {
    labelEn: 'Publish Listing',
    labelAr: 'نشر إعلان (موافقة)',
    icon: Zap,
    action: 'publish',
    descEn: 'Test human approval gate',
    descAr: 'اختبار بوابة الموافقة البشرية',
  },
];

export const AIAssistant = () => {
  const { locale } = useLocaleTheme();
  const isAr = locale === 'ar';
  const [searchParams, setSearchParams] = useSearchParams();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<AssistantTask[]>([]);
  const [input, setInput] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [clarifyInputs, setClarifyInputs] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const consumedQueryRef = useRef<string | null>(null);

  const refreshTasks = useCallback(() => {
    setTasks(taskRuntime.listTasks());
  }, []);

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: isAr ? 'مهمة جديدة' : 'New Task Session',
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: isAr
            ? 'أهلاً بك في مساعد مشكور. اكتب مهمتك ليتم تحليلها، التخطيط لها، فحص الصلاحيات، وتنفيذ المهارات المعتمدة.'
            : 'Welcome to MSHKUR Assistant. Describe a task to run structured intake, planning, permission preflight, and verified skill execution.',
          timestamp: Date.now(),
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    return newSession.id;
  }, [isAr]);

  useEffect(() => {
    taskRuntime.initialize().then(() => {
      refreshTasks();
    });

    const savedSessions = localStorage.getItem('mshkur-ai-sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions) as ChatSession[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          return;
        }
      } catch {
        // Ignore corrupt localStorage
      }
    }
    createNewSession();
  }, [createNewSession, refreshTasks]);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('mshkur-ai-sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSessionId, sessions, tasks]);

  const appendAssistantSummary = useCallback(
    (sessionId: string, task: AssistantTask) => {
      let summaryText = '';
      if (task.status === 'needs_clarification') {
        summaryText = isAr
          ? `تحتاج المهمة إلى توضيح: ${task.clarificationQuestionAr || task.clarificationQuestion}`
          : `Clarification needed: ${task.clarificationQuestion}`;
      } else if (task.status === 'awaiting_approval') {
        summaryText = isAr
          ? `بانتظار موافقتك الصريحة: ${task.pendingApproval?.actionDescriptionAr}`
          : `Awaiting explicit human approval: ${task.pendingApproval?.actionDescription}`;
      } else if (task.status === 'completed') {
        summaryText = isAr
          ? task.resultSummaryAr || 'تم إكمال المهمة بنجاح.'
          : task.resultSummary || 'Task completed.';
      } else if (task.status === 'failed' || task.status === 'rejected') {
        summaryText = isAr
          ? `تعذر إكمال المهمة: ${task.error || 'خطأ غير معروف'}`
          : `Task stopped (${task.status}): ${task.error || 'Unknown error'}`;
      } else if (task.status === 'cancelled') {
        summaryText = isAr ? 'تم إلغاء المهمة.' : 'Task cancelled.';
      }

      if (!summaryText) return;
      const msg: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: 'assistant',
        content: summaryText,
        timestamp: Date.now(),
        taskId: task.taskId,
      };
      setSessions(prev =>
        prev.map(s =>
          s.id === sessionId ? { ...s, messages: [...s.messages, msg], updatedAt: Date.now() } : s
        )
      );
    },
    [isAr]
  );

  const executePrompt = useCallback(
    async (promptText: string, targetSessionId: string, currentAttachments: Attachment[] = []) => {
      const trimmed = promptText.trim();
      if (!trimmed && currentAttachments.length === 0) return;

      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: trimmed || (isAr ? '[مرفق]' : '[Attachment]'),
        timestamp: Date.now(),
        attachments: currentAttachments.length > 0 ? [...currentAttachments] : undefined,
      };

      setSessions(prev =>
        prev.map(s =>
          s.id === targetSessionId
            ? {
                ...s,
                messages: [...s.messages, userMessage],
                updatedAt: Date.now(),
                title: s.messages.length <= 1 && trimmed ? trimmed.slice(0, 32) : s.title,
              }
            : s
        )
      );

      setIsBusy(true);
      try {
        const intakeTask = await taskRuntime.intake({
          sessionId: targetSessionId,
          appId: 'personal-assistant',
          prompt: trimmed,
          attachments: currentAttachments.map(a => ({
            id: a.id,
            type: a.type,
            name: a.name,
            blob: a.blob,
          })),
        });

        let finalTask = intakeTask;
        if (intakeTask.status === 'planned') {
          const imageBlob = currentAttachments.find(a => a.type === 'image' && a.blob)?.blob;
          finalTask = await taskRuntime.dispatch(intakeTask.taskId, { imageBlob });
        }

        refreshTasks();
        appendAssistantSummary(targetSessionId, finalTask);
      } finally {
        setIsBusy(false);
      }
    },
    [appendAssistantSummary, isAr, refreshTasks]
  );

  // Consume ?q=... from mobile bottom-sheet AI trigger
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && activeSessionId && consumedQueryRef.current !== q) {
      consumedQueryRef.current = q;
      setSearchParams({}, { replace: true });
      void executePrompt(q, activeSessionId, []);
    }
  }, [activeSessionId, executePrompt, searchParams, setSearchParams]);

  const handleSendMessage = async () => {
    if (!activeSessionId || isBusy) return;
    const currentInput = input;
    const currentAttachments = [...attachments];
    setInput('');
    setAttachments([]);
    await executePrompt(currentInput, activeSessionId, currentAttachments);
  };

  const handleClarifySubmit = async (taskId: string) => {
    const answer = (clarifyInputs[taskId] || '').trim();
    const imageAtt = attachments.find(a => a.type === 'image' && a.blob);
    if (!answer && !imageAtt) return;

    setIsBusy(true);
    try {
      const updated = await taskRuntime.provideClarification(
        taskId,
        answer,
        imageAtt ? [{ id: imageAtt.id, type: 'image', name: imageAtt.name, blob: imageAtt.blob }] : undefined
      );
      let finalTask = updated;
      if (updated.status === 'planned') {
        finalTask = await taskRuntime.dispatch(taskId, { imageBlob: imageAtt?.blob });
      }
      setClarifyInputs(prev => ({ ...prev, [taskId]: '' }));
      if (imageAtt) setAttachments([]);
      refreshTasks();
      if (activeSessionId) appendAssistantSummary(activeSessionId, finalTask);
    } finally {
      setIsBusy(false);
    }
  };

  const handleApprovalDecision = async (taskId: string, decision: 'approved' | 'denied') => {
    setIsBusy(true);
    try {
      const resolved = await taskRuntime.resolveApproval(taskId, decision, 'user');
      refreshTasks();
      if (activeSessionId) appendAssistantSummary(activeSessionId, resolved);
    } finally {
      setIsBusy(false);
    }
  };

  const handleQuickAction = (actionKey: string) => {
    const prompts: Record<string, string> = isAr
      ? {
          photo: 'إزالة الخلفية لصورة السيارة',
          ad: 'اكتب مسودة إعلان لسيارة تويوتا كامري 2023 ممشى 30 ألف كم',
          inventory: 'فحص مخزون المعرض الحالي',
          publish: 'نشر إعلان السيارة على المنصات الخارجية',
        }
      : {
          photo: 'Remove background for vehicle image',
          ad: 'Draft vehicle ad for 2023 Toyota Camry 30k km',
          inventory: 'Check current dealer inventory records',
          publish: 'Publish vehicle listing to external platforms',
        };
    setInput(prompts[actionKey] || '');
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => {
      const remaining = prev.filter(s => s.id !== id);
      if (activeSessionId === id) {
        setActiveSessionId(remaining[0]?.id || null);
      }
      return remaining;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments: Attachment[] = files.map(file => ({
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      blob: file,
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const activeMessages = activeSession?.messages || [];
  const sessionTasks = activeSessionId ? tasks.filter(t => t.sessionId === activeSessionId) : tasks;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-surface-50 dark:bg-surface-950 flex flex-col">
      {/* Sub-header */}
      <div className="bg-white/95 dark:bg-surface-900/95 border-b border-surface-200 dark:border-surface-800 px-4 py-3">
        <div className="container-mshkur flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-heading-md font-bold text-surface-900 dark:text-white">
                {isAr ? 'المساعد الذكي ومحرك المهام' : 'Assistant & Task Runtime'}
              </h1>
              <p className="text-body-xs text-surface-500">
                {isAr
                  ? 'استقبال • توضيح • تخطيط • فحص صلاحيات • موافقة وتدقيق'
                  : 'Intake • Clarify • Plan • Permission Preflight • Approval & Audit'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={createNewSession} className="btn btn-primary gap-1.5 min-h-[44px]">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{isAr ? 'جلسة جديدة' : 'New Session'}</span>
            </button>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="btn-icon min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={isAr ? 'تبديل القائمة الجانبية' : 'Toggle sidebar'}
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar: Quick Tasks & Sessions */}
        {showSidebar && (
          <aside className="w-full lg:w-80 bg-white dark:bg-surface-900 border-b lg:border-b-0 lg:border-e border-surface-200 dark:border-surface-800 flex flex-col">
            <div className="p-3 border-b border-surface-200 dark:border-surface-800">
              <p className="text-body-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">
                {isAr ? 'أوامر سريعة' : 'Quick Task Intents'}
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                {QUICK_ACTIONS.map(action => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.action}
                      onClick={() => handleQuickAction(action.action)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl border border-surface-200 dark:border-surface-800 hover:border-brand-300 text-start transition-colors min-h-[44px]"
                    >
                      <div className="h-8 w-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-body-xs font-semibold text-surface-900 dark:text-white truncate">
                          {isAr ? action.labelAr : action.labelEn}
                        </p>
                        <p className="text-[11px] text-surface-500 truncate">
                          {isAr ? action.descAr : action.descEn}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3 flex-1 overflow-y-auto space-y-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-body-xs font-semibold text-surface-500">
                  {isAr ? 'الجلسات المحفوظة' : 'Saved Sessions'}
                </span>
                <span className="badge badge-neutral">{sessions.length}</span>
              </div>
              {sessions.map(session => (
                <div
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className={cn(
                    'flex items-center justify-between gap-2 p-2.5 rounded-xl cursor-pointer min-h-[44px]',
                    activeSessionId === session.id
                      ? 'bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800'
                      : 'hover:bg-surface-100 dark:hover:bg-surface-800'
                  )}
                >
                  <span className="text-body-xs font-medium truncate text-surface-900 dark:text-white">
                    {session.title}
                  </span>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteSession(session.id);
                    }}
                    className="p-1 text-surface-400 hover:text-red-600"
                    aria-label={isAr ? 'حذف الجلسة' : 'Delete session'}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Chat + Runtime Inspector */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeMessages.length === 0 && (
              <div className="text-center py-12">
                <Bot className="h-10 w-10 text-brand-600 mx-auto mb-3" />
                <button onClick={createNewSession} className="btn btn-primary gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>{isAr ? 'ابدأ جلسة جديدة' : 'Start New Session'}</span>
                </button>
              </div>
            )}

            {activeMessages.map(message => {
              const isUser = message.role === 'user';
              return (
                <div key={message.id} className={cn('flex gap-3', isUser ? 'flex-row-reverse' : '')}>
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold',
                      isUser
                        ? 'bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-200'
                        : 'bg-brand-600 text-white'
                    )}
                  >
                    {isUser ? (isAr ? 'أنت' : 'You') : <Bot className="h-4 w-4" />}
                  </div>
                  <div className="max-w-[85%] space-y-1">
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-3 text-body-sm whitespace-pre-wrap',
                        isUser
                          ? 'bg-brand-600 text-white'
                          : 'bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-surface-900 dark:text-white'
                      )}
                    >
                      {message.content}
                    </div>
                    {!isUser && (
                      <div className="flex items-center gap-2 text-[11px] text-surface-400">
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(message.content)}
                          className="hover:text-brand-600 inline-flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          <span>{isAr ? 'نسخ' : 'Copy'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Task Runtime Cards (Plan, Clarification, Approval Gate, Audit Evidence) */}
            {sessionTasks.length > 0 && (
              <div className="pt-2 space-y-3">
                <p className="text-body-xs font-semibold text-surface-500 uppercase tracking-wider">
                  {isAr ? 'سجل تنفيذ المهام والتدقيق (Gate 5)' : 'Task Execution & Audit Ledger (Gate 5)'}
                </p>
                {sessionTasks.map(task => (
                  <div
                    key={task.taskId}
                    className="rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-4 space-y-3 shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : task.status === 'awaiting_approval' || task.status === 'needs_clarification' ? (
                          <ShieldAlert className="h-4 w-4 text-amber-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-brand-600" />
                        )}
                        <span className="text-body-xs font-mono text-surface-500">{task.taskId}</span>
                        <span className="badge badge-neutral">{task.assignedAssistantId}</span>
                      </div>
                      <span className="badge badge-primary uppercase">{task.status}</span>
                    </div>

                    <p className="text-body-sm font-medium text-surface-900 dark:text-white">
                      {task.normalizedGoal}
                    </p>

                    {/* Plan Steps */}
                    {task.steps.length > 0 && (
                      <div className="space-y-1.5">
                        {task.steps.map(step => (
                          <div
                            key={step.stepId}
                            className="flex items-center justify-between text-body-xs px-3 py-2 rounded-lg bg-surface-50 dark:bg-surface-800/60"
                          >
                            <span>{isAr ? step.titleAr : step.title}</span>
                            <span className="font-mono text-surface-500">{step.status}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Clarification Prompt */}
                    {task.status === 'needs_clarification' && (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2">
                        <p className="text-body-xs font-medium text-amber-900 dark:text-amber-200">
                          {isAr ? task.clarificationQuestionAr : task.clarificationQuestion}
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={clarifyInputs[task.taskId] || ''}
                            onChange={e =>
                              setClarifyInputs(prev => ({ ...prev, [task.taskId]: e.target.value }))
                            }
                            placeholder={isAr ? 'أدخل التوضيح أو أرفق صورة أعلاه...' : 'Enter clarification or attach image...'}
                            className="input flex-1 min-h-[40px] text-body-xs"
                          />
                          <button
                            type="button"
                            onClick={() => void handleClarifySubmit(task.taskId)}
                            className="btn btn-primary btn-sm min-h-[40px]"
                          >
                            {isAr ? 'متابعة' : 'Continue'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Human Approval Gate */}
                    {task.status === 'awaiting_approval' && task.pendingApproval && (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-2">
                        <p className="text-body-xs font-semibold text-amber-900 dark:text-amber-200">
                          {isAr
                            ? task.pendingApproval.actionDescriptionAr
                            : task.pendingApproval.actionDescription}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void handleApprovalDecision(task.taskId, 'approved')}
                            className="btn btn-primary btn-sm min-h-[40px]"
                          >
                            {isAr ? 'موافقة وتنفيذ' : 'Approve & Execute'}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleApprovalDecision(task.taskId, 'denied')}
                            className="btn btn-secondary btn-sm min-h-[40px]"
                          >
                            {isAr ? 'رفض' : 'Deny'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Audit Trail Summary */}
                    <div className="text-[11px] text-surface-500 flex flex-wrap items-center gap-3 pt-1 border-t border-surface-100 dark:border-surface-800">
                      <span>
                        {isAr ? 'أحداث التدقيق:' : 'Audit events:'} {task.auditLog.length}
                      </span>
                      <span>
                        {isAr ? 'الأدلة:' : 'Evidence:'} {task.evidence.length}
                      </span>
                      <span>
                        {isAr ? 'نقطة التفتيش:' : 'Checkpoint:'} {task.checkpointIndex}/{task.steps.length}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-3">
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {attachments.map(att => (
                  <span key={att.id} className="badge badge-primary inline-flex items-center gap-1">
                    {att.name}
                    <button
                      type="button"
                      onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => document.getElementById('assistant-file-upload')?.click()}
                className="btn-icon min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={isAr ? 'إرفاق صورة أو ملف' : 'Attach image or file'}
              >
                <Plus className="h-5 w-5" />
              </button>
              <input
                id="assistant-file-upload"
                type="file"
                accept="image/*,.pdf,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSendMessage();
                  }
                }}
                placeholder={
                  isAr
                    ? 'اكتب أمر المهمة (مثلاً: إزالة الخلفية، مسودة إعلان، أو نشر إعلان)...'
                    : 'Enter a task command (e.g., Remove background, Draft car ad, Publish listing)...'
                }
                rows={1}
                className="input flex-1 resize-none min-h-[44px]"
                disabled={!activeSessionId || isBusy}
              />
              <button
                type="button"
                onClick={() => setIsVoiceMode(!isVoiceMode)}
                className={cn(
                  'btn-icon min-h-[44px] min-w-[44px] flex items-center justify-center',
                  isVoiceMode ? 'text-red-600 bg-red-50' : ''
                )}
                aria-label={isAr ? 'وضع الصوت' : 'Voice mode'}
              >
                {isVoiceMode ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
              <button
                type="button"
                onClick={() => void handleSendMessage()}
                disabled={isBusy || (!input.trim() && attachments.length === 0)}
                className="btn btn-primary min-h-[44px] min-w-[44px] px-3"
                aria-label={isAr ? 'إرسال' : 'Send'}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
