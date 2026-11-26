import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Camera, Megaphone, Store, Shield, Sparkles, Mic, Send, X } from 'lucide-react';
import { Header } from './Header';
import { ContextualBar } from './ContextualBar';
import { cn } from '@utils/cn';
import { useLocaleTheme } from '@hooks/useLocaleTheme';

export const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { locale } = useLocaleTheme();
  const [aiSheetOpen, setAiSheetOpen] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const isActive = (href: string) =>
    href === '/photo-studio'
      ? location.pathname === '/' || location.pathname.startsWith('/photo-studio')
      : location.pathname.startsWith(href);

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    const q = promptText.trim();
    setAiSheetOpen(false);
    setPromptText('');
    navigate(q ? `/ai-assistant?q=${encodeURIComponent(q)}` : '/ai-assistant');
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-50 dark:bg-surface-950">
      <Header />
      <ContextualBar />
      <main className="flex-1 w-full pt-14 pb-20 md:pb-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation: 4 app destinations + central 3-star AI trigger */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-surface-900/95 backdrop-blur-md border-t border-surface-200 dark:border-surface-800 pb-[env(safe-area-inset-bottom)]"
        aria-label="Bottom navigation"
      >
        <div className="grid grid-cols-5 h-16 items-center">
          <Link
            to="/photo-studio"
            className={cn(
              'flex flex-col items-center justify-center gap-1 min-h-[44px] text-[11px] font-medium',
              isActive('/photo-studio') ? 'text-brand-600 dark:text-brand-400' : 'text-surface-500'
            )}
          >
            <Camera className="h-5 w-5" />
            <span>{locale === 'ar' ? 'الصور' : 'Photos'}</span>
          </Link>

          <Link
            to="/ad-studio"
            className={cn(
              'flex flex-col items-center justify-center gap-1 min-h-[44px] text-[11px] font-medium',
              isActive('/ad-studio') ? 'text-brand-600 dark:text-brand-400' : 'text-surface-500'
            )}
          >
            <Megaphone className="h-5 w-5" />
            <span>{locale === 'ar' ? 'الإعلان' : 'Ads'}</span>
          </Link>

          {/* Central Three-Star AI Trigger */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => setAiSheetOpen(true)}
              className="h-12 w-12 -mt-4 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
              aria-label={locale === 'ar' ? 'فتح المساعد الذكي' : 'Open AI Assistant'}
            >
              <Sparkles className="h-6 w-6" />
            </button>
          </div>

          <Link
            to="/dealer-portal"
            className={cn(
              'flex flex-col items-center justify-center gap-1 min-h-[44px] text-[11px] font-medium',
              isActive('/dealer-portal') ? 'text-brand-600 dark:text-brand-400' : 'text-surface-500'
            )}
          >
            <Store className="h-5 w-5" />
            <span>{locale === 'ar' ? 'المعرض' : 'Dealer'}</span>
          </Link>

          <Link
            to="/admin"
            className={cn(
              'flex flex-col items-center justify-center gap-1 min-h-[44px] text-[11px] font-medium',
              isActive('/admin') ? 'text-brand-600 dark:text-brand-400' : 'text-surface-500'
            )}
          >
            <Shield className="h-5 w-5" />
            <span>{locale === 'ar' ? 'الإدارة' : 'Admin'}</span>
          </Link>
        </div>
      </nav>

      {/* Compact Text & Voice AI Sheet */}
      {aiSheetOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setAiSheetOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Contextual AI Input"
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-surface-900 rounded-t-2xl border-t border-surface-200 dark:border-surface-800 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-600" />
                <span className="text-body-sm font-semibold text-surface-900 dark:text-white">
                  {locale === 'ar' ? 'المساعد الذكي' : 'MSHKUR Assistant'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAiSheetOpen(false)}
                className="btn-icon min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSendPrompt} className="flex items-center gap-2">
              <input
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder={locale === 'ar' ? 'اكتب أمرك أو سؤالك...' : 'Ask or command MSHKUR...'}
                className="input flex-1 min-h-[44px]"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setIsListening(!isListening)}
                className={cn(
                  'btn-icon min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border',
                  isListening
                    ? 'bg-red-50 border-red-300 text-red-600'
                    : 'border-surface-200 dark:border-surface-700 text-surface-600'
                )}
                aria-label="Voice input"
                aria-pressed={isListening}
              >
                <Mic className="h-5 w-5" />
              </button>
              <button
                type="submit"
                className="btn btn-primary min-h-[44px] min-w-[44px] px-3"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
