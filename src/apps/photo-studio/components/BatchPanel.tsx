import { motion } from 'framer-motion';
import { X, ChevronDown, ChevronUp, Check, Minus, Plus, Copy, Trash2, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import { cn } from '@utils/cn';
import { ProcessingTool, ImageFile } from '../types';

interface BatchPanelProps {
  tool: ProcessingTool;
  images: ImageFile[];
  settings: Record<string, unknown>;
  onSettingChange: (key: string, value: unknown) => void;
  onProcess: () => void;
  onClose: () => void;
}

export const BatchPanel = ({
  tool,
  images,
  settings,
  onSettingChange,
  onProcess,
  onClose,
}: BatchPanelProps) => {
  const [showAllSettings, setShowAllSettings] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-surface-900 rounded-t-2xl shadow-2xl border-t border-surface-200 max-h-[80vh] flex flex-col"
      role="dialog"
      aria-label="إعدادات المعالجة الدفعية"
    >
      {/* Handle */}
      <div className="flex items-center justify-center pt-3">
        <div className="h-1 w-10 rounded-full bg-surface-300 dark:bg-surface-600" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
            {tool.icon || <SlidersHorizontal className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="text-heading-md font-semibold text-surface-900 dark:text-white">
              {tool.nameAr}
            </h2>
            <p className="text-body-sm text-surface-500">{images.length} صورة محددة</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="btn-icon p-2 text-surface-400 hover:text-surface-600"
          aria-label="إغلاق اللوحة"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Settings */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Quick Settings (always visible) */}
        <div className="space-y-3">
          {tool.settingsSchema.slice(0, 3).map(schema => (
            <SettingControl
              key={schema.key}
              schema={schema}
              value={settings[schema.key] ?? schema.defaultValue}
              onChange={onSettingChange}
            />
          ))}
        </div>

        {/* Advanced Settings */}
        {tool.settingsSchema.length > 3 && (
          <div className="border-t border-surface-200 pt-4">
            <button
              onClick={() => setShowAllSettings(!showAllSettings)}
              className="flex items-center justify-between w-full text-body-sm font-medium text-brand-600 hover:text-brand-700"
            >
              <span>{showAllSettings ? 'إخفاء الإعدادات المتقدمة' : 'إظهار الإعدادات المتقدمة'}</span>
              {showAllSettings ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>

            <AnimatePresence>
              {showAllSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-3"
                >
                  {tool.settingsSchema.slice(3).map(schema => (
                    <SettingControl
                      key={schema.key}
                      schema={schema}
                      value={settings[schema.key] ?? schema.defaultValue}
                      onChange={onSettingChange}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Preview Images */}
        <div className="border-t border-surface-200 pt-4">
          <h3 className="text-body-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
            الصور التي ستتم معالجتها
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.slice(0, 10).map(image => (
              <div key={image.id} className="flex-shrink-0 relative w-20 h-20 rounded-lg overflow-hidden bg-surface-100 dark:bg-surface-800">
                <img src={image.preview} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            {images.length > 10 && (
              <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                <span className="text-body-sm font-medium text-surface-500">+{images.length - 10}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-4 border-t border-surface-200 flex items-center justify-between gap-4 safe-bottom">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="btn btn-secondary flex-1 sm:flex-none"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">إلغاء</span>
          </button>
        </div>
        <button
          onClick={onProcess}
          disabled={images.length === 0}
          className="btn btn-primary flex-1 sm:flex-none gap-2"
        >
          <Zap className="h-4 w-4" />
          <span>تطبيق على {images.length} صورة</span>
        </button>
      </div>
    </motion.div>
  );
};

const SettingControl = ({
  schema,
  value,
  onChange,
}: {
  schema: any;
  value: unknown;
  onChange: (key: string, value: unknown) => void;
}) => {
  const handleChange = (newValue: unknown) => {
    onChange(schema.key, newValue);
  };

  switch (schema.type) {
    case 'slider':
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-body-sm font-medium text-surface-700 dark:text-surface-300">
              {schema.labelAr}
            </label>
            <span className="text-body-sm font-mono text-brand-600">
              {typeof value === 'number' ? value.toFixed(2) : value}
            </span>
          </div>
          <input
            type="range"
            min={schema.min ?? 0}
            max={schema.max ?? 1}
            step={schema.step ?? 0.01}
            value={value as number}
            onChange={e => handleChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none accent-brand-600"
          />
        </div>
      );

    case 'select':
      return (
        <div className="space-y-1">
          <label className="text-body-sm font-medium text-surface-700 dark:text-surface-300">
            {schema.labelAr}
          </label>
          <select
            value={value as string}
            onChange={e => handleChange(e.target.value)}
            className="input py-2"
          >
            {schema.options?.map((opt: any) => (
              <option key={opt.value} value={opt.value}>
                {opt.labelAr || opt.label}
              </option>
            ))}
          </select>
        </div>
      );

    case 'toggle':
      return (
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-body-sm font-medium text-surface-700 dark:text-surface-300">
            {schema.labelAr}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={value as boolean}
            onClick={() => handleChange(!(value as boolean))}
            className={cn(
              'relative h-6 w-11 rounded-full transition-colors',
              (value as boolean) ? 'bg-brand-600' : 'bg-surface-300 dark:bg-surface-600'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-lg transition-transform',
                (value as boolean) ? 'translate-x-5' : 'translate-x-0.5'
              )}
            />
          </button>
        </label>
      );

    case 'color':
      return (
        <div className="space-y-1">
          <label className="text-body-sm font-medium text-surface-700 dark:text-surface-300">
            {schema.labelAr}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value as string}
              onChange={e => handleChange(e.target.value)}
              className="h-10 w-10 rounded-lg border border-surface-200 cursor-pointer"
            />
            <input
              type="text"
              value={value as string}
              onChange={e => handleChange(e.target.value)}
              className="input flex-1 font-mono text-body-sm"
            />
          </div>
        </div>
      );

    default:
      return null;
  }
};

import { useState } from 'react';
import { SlidersHorizontal, Zap } from 'lucide-react';