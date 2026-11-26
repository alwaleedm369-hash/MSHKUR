import { useState, useEffect, useCallback } from 'react';
import {
  Shield, Terminal, Bot, ListTodo, GitBranch, Calendar, MapPin,
  Sparkles, ShieldAlert, CheckCircle2, Play, Download, Plus
} from 'lucide-react';
import { cn } from '@utils/cn';
import { useLocaleTheme } from '@hooks/useLocaleTheme';
import { useAdminWorkspace } from '@shared/admin/adminStore';
import { taskRuntime, AssistantTask } from '@shared/runtime/taskRuntime';

type AdminSection =
  | 'rea'
  | 'agents'
  | 'tasks'
  | 'workflows'
  | 'calendar'
  | 'maps'
  | 'assets';

export const AdminBrowser = () => {
  const { locale } = useLocaleTheme();
  const isAr = locale === 'ar';
  const {
    reaItems,
    agents,
    workflows,
    calendarItems,
    mapNotes,
    runReaSandbox,
    addCalendarItem,
    addMapNote,
  } = useAdminWorkspace();

  const [section, setSection] = useState<AdminSection>('rea');
  const [runtimeTasks, setRuntimeTasks] = useState<AssistantTask[]>([]);
  const [reaSource, setReaSource] = useState('');
  const [reaPayload, setReaPayload] = useState('');
  const [calTitle, setCalTitle] = useState('');
  const [calChannel, setCalChannel] = useState('Haraj');
  const [calDate, setCalDate] = useState('2026-12-05');
  const [mapQuery, setMapQuery] = useState('');
  const [mapZone, setMapZone] = useState('');
  const [mapNotesInput, setMapNotesInput] = useState('');
  const [assetPrompt, setAssetPrompt] = useState('');
  const [assetNotice, setAssetNotice] = useState('');
  const [approvalTask, setApprovalTask] = useState<AssistantTask | null>(null);

  const refreshRuntimeTasks = useCallback(async () => {
    await taskRuntime.initialize();
    setRuntimeTasks(taskRuntime.listTasks());
  }, []);

  useEffect(() => {
    void refreshRuntimeTasks();
  }, [refreshRuntimeTasks]);

  const handleReaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reaPayload.trim()) return;
    runReaSandbox(reaSource, reaPayload);
    setReaSource('');
    setReaPayload('');
  };

  const handleAddCalendar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calTitle.trim()) return;
    addCalendarItem({
      titleEn: calTitle.trim(),
      titleAr: calTitle.trim(),
      channel: calChannel,
      scheduledDate: calDate || '2026-12-05',
      status: 'draft',
    });
    setCalTitle('');
  };

  const handleAddMapNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapQuery.trim()) return;
    addMapNote(mapQuery, mapZone, mapNotesInput);
    setMapQuery('');
    setMapZone('');
    setMapNotesInput('');
  };

  const handleGenerateManifestAsset = () => {
    const brief = assetPrompt.trim() || 'MSHKUR Showroom Campaign Brief';
    const artifact = {
      generatedAt: new Date().toISOString(),
      source: 'admin-browser-asset-generator',
      brief,
      compliance: 'No synthetic/stock substitute; requires explicit human approval for external dispatch.',
    };
    const blob = new Blob([JSON.stringify(artifact, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mshkur-admin-brief-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setAssetNotice(
      isAr
        ? 'تم توليد وتصدير ملف خطة الأصل (JSON) محلياً.'
        : 'Generated and exported structured asset brief (JSON).'
    );
  };

  const handleRequestApprovalGatedAction = async () => {
    await taskRuntime.initialize();
    const goal =
      assetPrompt.trim() || 'Publish external campaign update from Admin Browser';
    const intake = await taskRuntime.intake({
      sessionId: 'admin-browser-session',
      appId: 'admin-browser',
      prompt: `Publish ${goal}`,
      grantedPermissions: ['read:input', 'execute:external-approved'],
    });
    const dispatched = await taskRuntime.dispatch(intake.taskId);
    setApprovalTask(dispatched);
    await refreshRuntimeTasks();
  };

  const handleResolveApproval = async (decision: 'approved' | 'denied') => {
    if (!approvalTask) return;
    const resolved = await taskRuntime.resolveApproval(
      approvalTask.taskId,
      decision,
      'admin-operator'
    );
    setApprovalTask(resolved);
    await refreshRuntimeTasks();
  };

  const navItems: { id: AdminSection; label: string; icon: typeof Shield }[] = [
    { id: 'rea', label: isAr ? 'استقبال REA والعزل' : 'REA & Sandbox', icon: Terminal },
    { id: 'agents', label: isAr ? 'الوكلاء' : 'Agents', icon: Bot },
    { id: 'tasks', label: isAr ? 'المهام والتدقيق' : 'Tasks & Audit', icon: ListTodo },
    { id: 'workflows', label: isAr ? 'سير العمل' : 'Workflows', icon: GitBranch },
    { id: 'calendar', label: isAr ? 'تقويم التسويق' : 'Marketing Calendar', icon: Calendar },
    { id: 'maps', label: isAr ? 'أبحاث الخرائط' : 'Map Research', icon: MapPin },
    { id: 'assets', label: isAr ? 'توليد الأصول والنشر' : 'Assets & Gated Publish', icon: Sparkles },
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-surface-50 dark:bg-surface-950 flex flex-col">
      {/* Sub-header */}
      <div className="bg-white/95 dark:bg-surface-900/95 border-b border-surface-200 dark:border-surface-800 px-4 py-3">
        <div className="container-mshkur flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-heading-md font-bold text-surface-900 dark:text-white">
                {isAr ? 'متصفح الإدارة والتشغيل (Admin Browser)' : 'Admin Browser & Control Plane'}
              </h1>
              <p className="text-body-xs text-surface-500">
                {isAr
                  ? 'عزل REA • مراقبة الوكلاء والمهام • سير العمل • التقويم • الخرائط • نشر مقيد بموافقة'
                  : 'REA Sandbox • Agents & Tasks • Workflows • Calendar • Maps • Approval-Gated Actions'}
              </p>
            </div>
          </div>
          <span className="badge badge-neutral">Gate 7 Control</span>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 px-4 py-2 overflow-x-auto">
        <div className="container-mshkur flex items-center gap-2 min-w-max">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-body-xs font-medium min-h-[44px] transition-colors',
                  section === item.id
                    ? 'bg-brand-600 text-white'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="container-mshkur flex-1 py-6 px-4 space-y-6">
        {section === 'rea' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <form onSubmit={handleReaSubmit} className="card p-6 space-y-4">
              <h2 className="text-heading-sm font-bold text-surface-900 dark:text-white">
                {isAr ? 'استقبال بيانات REA في بيئة معزولة' : 'REA Intake & Sandbox Evaluator'}
              </h2>
              <p className="text-body-xs text-surface-500">
                {isAr
                  ? 'يتم فحص المدخلات في صندوق معزول؛ أي أمر نشر أو تعديل خارجي يُعلّم للموافقة البشرية.'
                  : 'Inputs are evaluated in isolation; external publishing/mutation intents are flagged for human approval.'}
              </p>
              <input
                type="text"
                value={reaSource}
                onChange={e => setReaSource(e.target.value)}
                placeholder={isAr ? 'المصدر (مثال: تغذية معرض جدة)' : 'Source (e.g. Jeddah Showroom Feed)'}
                className="input min-h-[44px]"
              />
              <textarea
                rows={4}
                value={reaPayload}
                onChange={e => setReaPayload(e.target.value)}
                placeholder={
                  isAr
                    ? 'أدخل نص أو سجل للمراجعة في الصندوق المعزول...'
                    : 'Paste raw intake text or record to inspect in sandbox...'
                }
                className="input"
              />
              <button type="submit" className="btn btn-primary gap-1.5 min-h-[44px]">
                <Play className="h-4 w-4" />
                <span>{isAr ? 'تشغيل الفحص المعزول' : 'Run Sandbox Evaluation'}</span>
              </button>
            </form>

            <div className="card p-6 space-y-3">
              <h3 className="text-heading-sm font-bold text-surface-900 dark:text-white">
                {isAr ? 'سجل نتائج الصندوق المعزول' : 'Sandbox Evaluation Log'}
              </h3>
              {reaItems.map(item => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-body-xs font-semibold text-surface-900 dark:text-white">
                      {item.sourceLabel}
                    </span>
                    <span className="badge badge-neutral">{item.sandboxVerdict}</span>
                  </div>
                  <p className="text-body-xs text-surface-600 dark:text-surface-300">{item.rawInput}</p>
                  <p className="text-[11px] text-surface-500">{item.extractedSummary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {section === 'agents' && (
          <div className="grid gap-4 md:grid-cols-2">
            {agents.map(agent => (
              <div key={agent.agentId} className="card p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-heading-sm font-bold text-surface-900 dark:text-white">
                    {isAr ? agent.nameAr : agent.nameEn}
                  </h2>
                  <span className="badge badge-primary uppercase">{agent.status}</span>
                </div>
                <p className="text-body-xs text-surface-500">{agent.role}</p>
                <p className="text-body-xs text-surface-700 dark:text-surface-300 pt-1">
                  {agent.lastTaskSummary}
                </p>
              </div>
            ))}
          </div>
        )}

        {section === 'tasks' && (
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-heading-sm font-bold text-surface-900 dark:text-white">
                {isAr ? 'مهام محرك التنفيذ وسجل التدقيق' : 'Task Runtime Ledger & Audit Events'}
              </h2>
              <button
                type="button"
                onClick={() => void refreshRuntimeTasks()}
                className="btn btn-secondary btn-sm min-h-[36px]"
              >
                {isAr ? 'تحديث' : 'Refresh'}
              </button>
            </div>
            {runtimeTasks.length === 0 ? (
              <p className="text-body-xs text-surface-500">
                {isAr ? 'لا توجد مهام مسجلة بعد في محرك المهام.' : 'No tasks recorded in Task Runtime yet.'}
              </p>
            ) : (
              <div className="space-y-3">
                {runtimeTasks.map(t => (
                  <div
                    key={t.taskId}
                    className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 flex flex-wrap items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-body-xs font-mono text-surface-500">{t.taskId}</p>
                      <p className="text-body-sm font-semibold text-surface-900 dark:text-white">
                        {t.normalizedGoal}
                      </p>
                    </div>
                    <span className="badge badge-neutral uppercase">
                      {t.status} • {t.auditLog.length} events
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {section === 'workflows' && (
          <div className="grid gap-4 md:grid-cols-2">
            {workflows.map(wf => (
              <div key={wf.id} className="card p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-heading-sm font-bold text-surface-900 dark:text-white">
                    {isAr ? wf.nameAr : wf.nameEn}
                  </h2>
                  <span className="badge badge-neutral uppercase">{wf.health}</span>
                </div>
                <p className="text-body-xs text-surface-500">{wf.stage}</p>
              </div>
            ))}
          </div>
        )}

        {section === 'calendar' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <form onSubmit={handleAddCalendar} className="card p-6 space-y-4">
              <h2 className="text-heading-sm font-bold text-surface-900 dark:text-white">
                {isAr ? 'جدولة حملة تسويقية' : 'Schedule Marketing Campaign'}
              </h2>
              <input
                type="text"
                value={calTitle}
                onChange={e => setCalTitle(e.target.value)}
                placeholder={isAr ? 'عنوان الحملة' : 'Campaign title'}
                className="input min-h-[44px]"
              />
              <input
                type="text"
                value={calChannel}
                onChange={e => setCalChannel(e.target.value)}
                placeholder={isAr ? 'القناة (حراج، إنستغرام...)' : 'Channel (Haraj, Instagram...)'}
                className="input min-h-[44px]"
              />
              <input
                type="date"
                value={calDate}
                onChange={e => setCalDate(e.target.value)}
                className="input min-h-[44px]"
              />
              <button type="submit" className="btn btn-primary gap-1.5 min-h-[44px]">
                <Plus className="h-4 w-4" />
                <span>{isAr ? 'إضافة للتقويم' : 'Add to Calendar'}</span>
              </button>
            </form>

            <div className="card p-6 space-y-3">
              <h3 className="text-heading-sm font-bold text-surface-900 dark:text-white">
                {isAr ? 'الجدول التسويقي' : 'Scheduled Campaigns'}
              </h3>
              {calendarItems.map(c => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 flex items-center justify-between"
                >
                  <div>
                    <p className="text-body-sm font-semibold text-surface-900 dark:text-white">
                      {isAr ? c.titleAr : c.titleEn}
                    </p>
                    <p className="text-body-xs text-surface-500">
                      {c.channel} • {c.scheduledDate}
                    </p>
                  </div>
                  <span className="badge badge-neutral uppercase">{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {section === 'maps' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <form onSubmit={handleAddMapNote} className="card p-6 space-y-4">
              <h2 className="text-heading-sm font-bold text-surface-900 dark:text-white">
                {isAr ? 'تسجيل بحث جغرافي للمعارض' : 'Showroom & Market Map Research'}
              </h2>
              <input
                type="text"
                value={mapQuery}
                onChange={e => setMapQuery(e.target.value)}
                placeholder={isAr ? 'الموقع أو المنطقة المستهدفة' : 'Target district or corridor'}
                className="input min-h-[44px]"
              />
              <input
                type="text"
                value={mapZone}
                onChange={e => setMapZone(e.target.value)}
                placeholder={isAr ? 'المدينة / القطاع' : 'City / Zone'}
                className="input min-h-[44px]"
              />
              <textarea
                rows={3}
                value={mapNotesInput}
                onChange={e => setMapNotesInput(e.target.value)}
                placeholder={isAr ? 'ملاحظات المنافسة والوصول' : 'Competitor & accessibility notes'}
                className="input"
              />
              <button type="submit" className="btn btn-primary gap-1.5 min-h-[44px]">
                <Plus className="h-4 w-4" />
                <span>{isAr ? 'حفظ الملاحظة' : 'Save Map Note'}</span>
              </button>
            </form>

            <div className="card p-6 space-y-3">
              <h3 className="text-heading-sm font-bold text-surface-900 dark:text-white">
                {isAr ? 'سجل الأبحاث الجغرافية' : 'Recorded Map Research'}
              </h3>
              {mapNotes.map(m => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl border border-surface-200 dark:border-surface-800 space-y-1"
                >
                  <p className="text-body-sm font-semibold text-surface-900 dark:text-white">{m.query}</p>
                  <p className="text-body-xs text-brand-600">{m.zone}</p>
                  <p className="text-body-xs text-surface-500">{m.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {section === 'assets' && (
          <div className="card p-6 space-y-4 max-w-2xl">
            <h2 className="text-heading-sm font-bold text-surface-900 dark:text-white">
              {isAr ? 'توليد ملف الأصل والنشر المقيد بموافقة' : 'Asset Brief Generation & Approval-Gated Publishing'}
            </h2>
            <p className="text-body-xs text-surface-500">
              {isAr
                ? 'توليد الأصل يحفظ ملف خطة واضح محلياً دون ادعاء إنتاج صور مولدة وهمية، والنشر الخارجي يمر ببوابة الموافقة.'
                : 'Asset generation exports a structured brief locally; external publishing pauses for explicit human approval.'}
            </p>
            <input
              type="text"
              value={assetPrompt}
              onChange={e => setAssetPrompt(e.target.value)}
              placeholder={
                isAr
                  ? 'وصف الأصل أو إجراء النشر الخارجي...'
                  : 'Asset brief or external publishing action...'
              }
              className="input min-h-[44px]"
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleGenerateManifestAsset}
                className="btn btn-secondary gap-1.5 min-h-[44px]"
              >
                <Download className="h-4 w-4" />
                <span>{isAr ? 'توليد وتصدير ملف الأصل (JSON)' : 'Generate Asset Brief (JSON)'}</span>
              </button>
              <button
                type="button"
                onClick={() => void handleRequestApprovalGatedAction()}
                className="btn btn-primary gap-1.5 min-h-[44px]"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isAr ? 'طلب إجراء خارجي (بوابة موافقة)' : 'Request External Action (Approval Gate)'}</span>
              </button>
            </div>

            {assetNotice && (
              <p className="text-body-xs text-emerald-700 dark:text-emerald-300">{assetNotice}</p>
            )}

            {approvalTask && (
              <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-body-xs font-mono">{approvalTask.taskId}</span>
                  <span className="badge badge-primary uppercase">{approvalTask.status}</span>
                </div>
                {approvalTask.status === 'awaiting_approval' && approvalTask.pendingApproval && (
                  <>
                    <p className="text-body-xs font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span>
                        {isAr
                          ? approvalTask.pendingApproval.actionDescriptionAr
                          : approvalTask.pendingApproval.actionDescription}
                      </span>
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => void handleResolveApproval('approved')}
                        className="btn btn-primary btn-sm min-h-[40px]"
                      >
                        {isAr ? 'موافقة' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleResolveApproval('denied')}
                        className="btn btn-secondary btn-sm min-h-[40px]"
                      >
                        {isAr ? 'رفض' : 'Deny'}
                      </button>
                    </div>
                  </>
                )}
                {approvalTask.status === 'completed' && (
                  <p className="text-body-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isAr ? approvalTask.resultSummaryAr : approvalTask.resultSummary}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
