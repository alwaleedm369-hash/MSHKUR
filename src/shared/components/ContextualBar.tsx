import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowUpRight, ShieldAlert, X } from 'lucide-react';
import { cn } from '@utils/cn';
import { useLocaleTheme } from '@hooks/useLocaleTheme';
import { getSuggestionsForRoute, useContextualLayer, ContextualSuggestion } from '@shared/context/contextStore';
import { taskRuntime } from '@shared/runtime/taskRuntime';

export const ContextualBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { locale } = useLocaleTheme();
  const isAr = locale === 'ar';
  const { recordContextAction } = useContextualLayer();
  const [dismissedRoute, setDismissedRoute] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const currentPath = location.pathname;
  if (dismissedRoute === currentPath) {
    return null;
  }

  const suggestions = getSuggestionsForRoute(currentPath);
  if (suggestions.length === 0) {
    return null;
  }

  const handleTriggerSuggestion = async (suggestion: ContextualSuggestion) => {
    if (suggestion.requiresApproval) {
      await taskRuntime.initialize();
      const created = await taskRuntime.intake({
        sessionId: 'contextual-bar-session',
        appId: 'contextual-browser',
        prompt: suggestion.suggestedPrompt,
        grantedPermissions: ['read:input', 'execute:external-approved'],
      });
      const dispatched = await taskRuntime.dispatch(created.taskId);
      recordContextAction({
        route: currentPath,
        targetApp: suggestion.targetApp,
        actionSummary: suggestion.suggestedPrompt,
        status: dispatched.status === 'awaiting_approval' ? 'awaiting_approval' : 'executed_local',
      });
      setStatusMessage(
        isAr
          ? `تم إيقاف "${suggestion.titleAr}" بانتظار موافقتك في المساعد.`
          : `"${suggestion.titleEn}" paused for your approval in Assistant.`
      );
      navigate(`/ai-assistant?task=${encodeURIComponent(created.taskId)}`);
      return;
    }

    recordContextAction({
      route: currentPath,
      targetApp: suggestion.targetApp,
      actionSummary: suggestion.suggestedPrompt,
      status: 'executed_local',
    });

    if (suggestion.targetApp === 'ai-assistant') {
      navigate(`/ai-assistant?q=${encodeURIComponent(suggestion.suggestedPrompt)}`);
    } else if (suggestion.targetApp === 'ad-studio') {
      navigate('/ad-studio');
    } else if (suggestion.targetApp === 'photo-studio') {
      navigate('/photo-studio');
    } else if (suggestion.targetApp === 'dealer-portal') {
      navigate('/dealer');
    } else {
      navigate('/admin');
    }
  };

  return (
    <div
      aria-label={isAr ? 'شريط السياق الذكي' : 'Contextual Browser Strip'}
      className="bg-brand-50/80 dark:bg-brand-950/30 border-b border-brand-200/70 dark:border-brand-800/50 px-3 py-1.5"
    >
      <div className="container-mshkur flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-800 dark:text-brand-200">
            <Sparkles className="h-3.5 w-3.5 text-brand-600" />
            <span>{isAr ? 'سياق الصفحة:' : 'Context:'}</span>
          </span>

          {suggestions.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => void handleTriggerSuggestion(item)}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors min-h-[30px]',
                item.requiresApproval
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 hover:bg-amber-200/80'
                  : 'bg-white dark:bg-surface-900 text-surface-800 dark:text-surface-200 border border-surface-200 dark:border-surface-700 hover:border-brand-400'
              )}
            >
              {item.requiresApproval && <ShieldAlert className="h-3 w-3 text-amber-600" />}
              <span>{isAr ? item.titleAr : item.titleEn}</span>
              <ArrowUpRight className="h-3 w-3 opacity-70" />
            </button>
          ))}

          {statusMessage && (
            <span className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
              {statusMessage}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setDismissedRoute(currentPath)}
          aria-label={isAr ? 'إخفاء شريط السياق' : 'Dismiss context bar'}
          className="p-1 rounded-md text-surface-500 hover:text-surface-800 dark:hover:text-surface-200 shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
