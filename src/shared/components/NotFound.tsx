import { Link } from 'react-router-dom';
import { Home, Sparkles, ArrowLeft, Search, MessageSquare, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

export const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="mb-6">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-surface-100 to-surface-200 dark:from-surface-800 dark:to-surface-700"
          >
            <Sparkles className="h-10 w-10 text-surface-400 dark:text-surface-500" />
          </motion.div>
        </div>
        <h1 className="text-display-md font-bold text-surface-900 dark:text-white mb-3">
          404
        </h1>
        <h2 className="text-heading-lg font-semibold text-surface-700 dark:text-surface-300 mb-4">
          الصفحة غير موجودة
        </h2>
        <p className="text-body-md text-surface-500 dark:text-surface-400 mb-8 max-w-sm mx-auto">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها. قد يكون الرابط خاطئاً أو تم حذف الصفحة.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="btn btn-primary gap-2"
          >
            <Home className="h-5 w-5" />
            العودة للرئيسية
          </Link>
          <Link
            to="/ai-assistant"
            className="btn btn-secondary gap-2"
          >
            <Bot className="h-5 w-5" />
            اسأل المساعد
          </Link>
        </div>
        <div className="mt-8 flex items-center justify-center gap-4 text-body-sm text-surface-400">
          <Link to="/photo-studio" className="flex items-center gap-1.5 hover:text-brand-600 transition-colors">
            <Search className="h-4 w-4" />
            استوديو الصور
          </Link>
          <Link to="/ad-studio" className="flex items-center gap-1.5 hover:text-brand-600 transition-colors">
            <MessageSquare className="h-4 w-4" />
            استوديو الإعلان
          </Link>
          <Link to="/dealer-portal" className="flex items-center gap-1.5 hover:text-brand-600 transition-colors">
            <Bot className="h-4 w-4" />
            المعرض والتاجر
          </Link>
        </div>
      </motion.div>
    </div>
  );
};