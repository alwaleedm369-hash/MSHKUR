import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@utils/cn';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: 'border-l-4 border-success-DEFAULT bg-success-light/10',
  error: 'border-l-4 border-error-DEFAULT bg-error-light/10',
  info: 'border-l-4 border-brand-500 bg-brand-50 dark:bg-brand-900/20',
  warning: 'border-l-4 border-warning-DEFAULT bg-warning-light/10',
};

const iconColors = {
  success: 'text-success-DEFAULT',
  error: 'text-error-DEFAULT',
  info: 'text-brand-500',
  warning: 'text-warning-DEFAULT',
};

export const Toast = ({ message, type, onClose }: ToastProps) => {
  const Icon = icons[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 300, scale: 0.95 }}
        className={cn(
          'flex items-start gap-3 rounded-xl p-4 shadow-xl min-w-[300px] max-w-md',
          colors[type]
        )}
        role="alert"
        aria-live="polite"
      >
        <div className={cn('flex-shrink-0 mt-0.5', iconColors[type])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-body-sm text-surface-800 dark:text-surface-200">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-surface-400 hover:text-surface-600 p-1"
          aria-label="إخفاء التنبيه"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export const useToast = () => {
  // This would be implemented with a context in a real app
  return {
    success: (message: string) => console.log('success', message),
    error: (message: string) => console.log('error', message),
    info: (message: string) => console.log('info', message),
    warning: (message: string) => console.log('warning', message),
  };
};