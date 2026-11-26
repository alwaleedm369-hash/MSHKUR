import { motion } from 'framer-motion';
import { X, Download, Check, FileImage, FileText, Settings, Zap, Share2, Copy, AlertCircle } from 'lucide-react';
import { cn } from '@utils/cn';
import { ImageFile } from '../types';

interface ExportModalProps {
  images: ImageFile[];
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
}

interface ExportOptions {
  format: 'png' | 'jpg' | 'webp';
  quality: number;
  includeOriginal: boolean;
  includeAllVersions: boolean;
  namingPattern: 'original' | 'tool-name' | 'timestamp' | 'custom';
  customPrefix: string;
  width?: number;
  height?: number;
  maintainAspectRatio: boolean;
}

export const ExportModal = ({ images, onClose, onExport }: ExportModalProps) => {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 90,
    includeOriginal: true,
    includeAllVersions: true,
    namingPattern: 'tool-name',
    customPrefix: 'mshkur-',
    maintainAspectRatio: true,
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const totalFiles = images.length * (options.includeAllVersions
    ? Math.max(1, images.reduce((max, img) => Math.max(max, img.processedBlobs.length), 0))
    : 1);

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    // Simulate export progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setExportProgress(i);
    }

    onExport(options);
    setIsExporting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="تصدير الصور"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-heading-md font-semibold text-surface-900 dark:text-white">تصدير الصور</h2>
              <p className="text-body-sm text-surface-500">{images.length} صورة محددة • {totalFiles} ملف للتصدير</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="btn-icon p-2 text-surface-400 hover:text-surface-600 disabled:opacity-50"
            aria-label="إغلاق"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {isExporting ? (
            <ExportProgress progress={exportProgress} />
          ) : (
            <>
              {/* Format & Quality */}
              <div className="space-y-4">
                <h3 className="text-heading-sm font-semibold text-surface-900 dark:text-white">التنسيق والجودة</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-body-sm font-medium text-surface-700 dark:text-surface-300">التنسيق</label>
                    <div className="flex gap-2" role="radiogroup" aria-label="تنسيق التصدير">
                      {[
                        { value: 'png', label: 'PNG', desc: 'بدون فقدان', icon: FileImage },
                        { value: 'jpg', label: 'JPG', desc: 'ضغط عالي', icon: FileImage },
                        { value: 'webp', label: 'WebP', desc: 'حديث وصغير', icon: FileText },
                      ].map(fmt => (
                        <button
                          key={fmt.value}
                          onClick={() => setOptions(prev => ({ ...prev, format: fmt.value as any }))}
                          className={cn(
                            'flex-1 flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all',
                            options.format === fmt.value
                              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                              : 'border-surface-200 hover:border-brand-300'
                          )}
                          role="radio"
                          aria-checked={options.format === fmt.value}
                        >
                          <fmt.icon className={cn('h-6 w-6', options.format === fmt.value ? 'text-brand-600' : 'text-surface-400')} />
                          <span className={cn('font-medium', options.format === fmt.value ? 'text-brand-700' : 'text-surface-900')}>
                            {fmt.label}
                          </span>
                          <span className={cn('text-body-xs', options.format === fmt.value ? 'text-brand-500' : 'text-surface-500')}>
                            {fmt.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-body-sm font-medium text-surface-700 dark:text-surface-300 flex items-center justify-between">
                      الجودة
                      <span className="text-body-sm font-mono text-brand-600">{options.quality}%</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={options.quality}
                      onChange={e => setOptions(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none accent-brand-600"
                    />
                    <div className="flex justify-between text-body-xs text-surface-500">
                      <span>حجم أصغر</span>
                      <span>جودة أعلى</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* What to Export */}
              <div className="border-t border-surface-200 pt-4 space-y-4">
                <h3 className="text-heading-sm font-semibold text-surface-900 dark:text-white">ماذا يتم تصديره</h3>
                <div className="space-y-3">
                  <ExportOption
                    label="تضمين النسخة الأصلية"
                    description="تصدير الصورة الأصلية غير المعدلة"
                    value={options.includeOriginal}
                    onChange={v => setOptions(prev => ({ ...prev, includeOriginal: v }))}
                    icon={FileImage}
                  />
                  <ExportOption
                    label="تضمين جميع النسخ المعالجة"
                    description={`تصدير ${images.reduce((max, img) => Math.max(max, img.processedBlobs.length - 1), 0)} نسخة معالجة لكل صورة`}
                    value={options.includeAllVersions}
                    onChange={v => setOptions(prev => ({ ...prev, includeAllVersions: v }))}
                    icon={Layers}
                  />
                </div>
              </div>

              {/* Naming */}
              <div className="border-t border-surface-200 pt-4 space-y-4">
                <h3 className="text-heading-sm font-semibold text-surface-900 dark:text-white">تسمية الملفات</h3>
                <div className="space-y-3">
                  {[
                    { value: 'original', label: 'الاسم الأصلي', desc: 'image.jpg → image.png', icon: FileImage },
                    { value: 'tool-name', label: 'اسم الأداة', desc: 'image.jpg → image-bg-removal.png', icon: Zap },
                    { value: 'timestamp', label: 'طابع زمني', desc: 'image.jpg → image-20241124-1430.png', icon: Settings },
                    { value: 'custom', label: 'مخصص', desc: 'mshkur-image.png', icon: Share2 },
                  ].map(pattern => (
                    <label key={pattern.value} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-surface-200 hover:border-brand-300 transition-colors">
                      <input
                        type="radio"
                        name="naming"
                        value={pattern.value}
                        checked={options.namingPattern === pattern.value}
                        onChange={() => setOptions(prev => ({ ...prev, namingPattern: pattern.value as any }))}
                        className="h-4 w-4 text-brand-600 border-surface-300"
                      />
                      <pattern.icon className="h-5 w-5 text-surface-400" />
                      <div className="flex-1">
                        <span className="text-body-sm font-medium text-surface-900 dark:text-white">{pattern.label}</span>
                        <p className="text-body-xs text-surface-500">{pattern.desc}</p>
                      </div>
                    </label>
                  ))}

                  {options.namingPattern === 'custom' && (
                    <div className="space-y-1 ml-10">
                      <label className="text-body-sm font-medium text-surface-700 dark:text-surface-300">البادئة</label>
                      <input
                        type="text"
                        value={options.customPrefix}
                        onChange={e => setOptions(prev => ({ ...prev, customPrefix: e.target.value }))}
                        className="input w-64"
                        placeholder="mshkur-"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Dimensions */}
              <div className="border-t border-surface-200 pt-4 space-y-4">
                <h3 className="text-heading-sm font-semibold text-surface-900 dark:text-white">الأبعاد</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.maintainAspectRatio}
                      onChange={e => setOptions(prev => ({ ...prev, maintainAspectRatio: e.target.checked }))}
                      className="h-4 w-4 rounded border-surface-300 text-brand-600"
                    />
                    <span className="text-body-sm text-surface-700 dark:text-surface-300">الحفاظ على نسبة العرض</span>
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2 ml-7">
                    <div className="space-y-1">
                      <label className="text-body-sm font-medium text-surface-700 dark:text-surface-300">العرض (بكسيل)</label>
                      <input
                        type="number"
                        min="100"
                        max="8000"
                        placeholder="أصلي"
                        className="input"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-body-sm font-medium text-surface-700 dark:text-surface-300">الارتفاع (بكسيل)</label>
                      <input
                        type="number"
                        min="100"
                        max="8000"
                        placeholder="أصلي"
                        className="input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!isExporting && (
          <div className="p-4 border-t border-surface-200 flex items-center justify-end gap-3">
            <button onClick={onClose} className="btn btn-secondary">
              <X className="h-4 w-4" />
              إلغاء
            </button>
            <button onClick={handleExport} className="btn btn-primary gap-2" disabled={images.length === 0}>
              <Download className="h-4 w-4" />
              تصدير {totalFiles} ملف
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const ExportOption = ({
  label,
  description,
  value,
  onChange,
  icon: Icon,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-surface-200 hover:border-brand-300 transition-colors">
    <input
      type="checkbox"
      checked={value}
      onChange={e => onChange(e.target.checked)}
      className="h-4 w-4 mt-0.5 rounded border-surface-300 text-brand-600"
    />
    <Icon className="h-5 w-5 text-surface-400 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <span className="text-body-sm font-medium text-surface-900 dark:text-white">{label}</span>
      <p className="text-body-xs text-surface-500 mt-0.5">{description}</p>
    </div>
  </label>
);

const ExportProgress = ({ progress }: { progress: number }) => (
  <div className="flex flex-col items-center justify-center py-12 space-y-6">
    <div className="relative">
      <div className="h-24 w-24 rounded-full border-4 border-surface-200" />
      <div
        className="absolute top-4 left-4 right-4 bottom-4 border-4 border-brand-500 rounded-full border-t-transparent animate-spin"
        style={{ strokeDashoffset: 280 - (progress / 100) * 280 }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-heading-xl font-bold text-surface-900 dark:text-white">{Math.round(progress)}%</span>
      </div>
    </div>
    <div className="w-64">
      <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-brand-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
    <p className="text-body-md text-surface-600 dark:text-surface-400">جاري إعداد التصدير...</p>
  </div>
);

import { useState } from 'react';
import { Layers } from 'lucide-react';