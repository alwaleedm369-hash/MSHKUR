import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot, X, Sparkles, MessageSquare, Zap, Settings, HelpCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@utils/cn';

interface QuickAction {
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

const quickActions: QuickAction[] = [
  {
    label: 'دردشة جديدة',
    href: '/ai-assistant?new=true',
    icon: <MessageSquare className="h-5 w-5" />,
    description: 'ابدأ محادثة مع مساعدك',
  },
  {
    label: 'تحليل صورة',
    href: '/photo-studio?assist=true',
    icon: <Zap className="h-5 w-5" />,
    description: 'اطلب تحليل أو معالجة صورة',
  },
  {
    label: 'إنشاء إعلان',
    href: '/ad-studio?assist=true',
    icon: <Sparkles className="h-5 w-5" />,
    description: 'اكتب إعلان سيارة احترافي',
  },
];

export const AIAssistantTrigger = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(e.target as Node) && triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Show notification badge after first visit
  useEffect(() => {
    const visited = localStorage.getItem('ai-assistant-visited');
    if (!visited) {
      const timer = setTimeout(() => {
        setHasInteracted(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      localStorage.setItem('ai-assistant-visited', 'true');
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        ref={triggerRef}
        onClick={handleTriggerClick}
        className={cn(
          'fixed bottom-6 right-6 z-50 btn rounded-2xl shadow-xl',
          'bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 text-white',
          'hover:from-brand-600 hover:via-brand-700 hover:to-brand-800',
          'ring-4 ring-brand-500/20',
          isOpen && 'rotate-45'
        )}
        aria-label={isOpen ? 'إغلاق المساعد الذكي' : 'فتح المساعد الذكي'}
        aria-expanded={isOpen}
        aria-controls="ai-assistant-panel"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Bot className="h-6 w-6 transition-transform duration-200" aria-hidden="true" />
        <span className="sr-only">المساعد الذكي</span>
      </motion.button>

      {/* Notification Badge */}
      <AnimatePresence>
        {hasInteracted && !isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 10 }}
            className="fixed bottom-20 right-6 z-40"
          >
            <div className="relative">
              <div className="bg-white rounded-xl shadow-lg border border-surface-200 p-3 min-w-[200px] max-w-[280px]">
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-brand-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-medium text-surface-900">مساعدك جاهز</p>
                    <p className="text-body-xs text-surface-500 mt-0.5">اضغط للتحدث مع مساعدك الذكي</p>
                  </div>
                  <button
                    onClick={() => setHasInteracted(false)}
                    className="text-surface-400 hover:text-surface-600"
                    aria-label="إخفاء التنبيه"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {/* Arrow pointer */}
              <div className="absolute bottom-0 right-6 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-white border-r border-b border-surface-200" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            id="ai-assistant-panel"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-20 right-6 z-50 w-72"
            role="dialog"
            aria-label="إجراءات المساعد الذكي السريعة"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-surface-200 overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-brand-50 to-brand-100 border-b border-surface-200">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-heading-sm font-semibold text-surface-900">المساعد الذكي</h3>
                  <p className="text-body-xs text-surface-500">نسختك. سكرتيرك. صديقك.</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn-icon text-surface-500 hover:text-surface-700 hover:bg-surface-200"
                  aria-label="إغلاق اللوحة"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="p-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    to={action.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-3',
                      'text-surface-700 hover:bg-surface-100',
                      'dark:text-surface-300 dark:hover:bg-surface-800',
                      'transition-all duration-200',
                      'group'
                    )}
                  >
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 group-hover:bg-brand-200 group-hover:scale-105 transition-all">
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0 text-start">
                      <p className="text-body-sm font-medium truncate">{action.label}</p>
                      <p className="text-body-xs text-surface-500 truncate">{action.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-surface-400 group-hover:text-brand-600 transition-colors" />
                  </Link>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-surface-200 mx-2" />

              {/* Footer Actions */}
              <div className="p-2 grid grid-cols-2 gap-1">
                <Link
                  to="/ai-assistant"
                  onClick={() => setIsOpen(false)}
                  className="btn btn-sm justify-center gap-1.5 text-body-sm"
                >
                  <Settings className="h-4 w-4" />
                  إعدادات
                </Link>
                <Link
                  to="/docs/ai-assistant"
                  onClick={() => setIsOpen(false)}
                  className="btn btn-sm btn-ghost justify-center gap-1.5 text-body-sm"
                >
                  <HelpCircle className="h-4 w-4" />
                  مساعدة
                </Link>
              </div>
            </div>

            {/* Arrow pointer */}
            <motion.div
              initial={{ opacity: 0, rotate: -45 }}
              animate={{ opacity: 1, rotate: 45 }}
              className="absolute bottom-0 right-6 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 bg-white border-r border-b border-surface-200 rotate-45"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/5 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
};