import { motion } from 'framer-motion';
import {
  Image as ImageIcon, Scan, Eye, EyeOff, SlidersHorizontal, Layers,
  Wind, Sun, Moon, Droplet, Contrast, Crop, Maximize, Minimize,
  Check, AlertCircle, Loader2, Zap, Sparkles, MoreHorizontal
} from 'lucide-react';
import { cn } from '@utils/cn';
import { ProcessingTool, ProcessingJob } from '../types';

interface ToolPanelProps {
  tools: ProcessingTool[];
  activeToolId: string | null;
  toolSettings: Record<string, Record<string, unknown>>;
  selectedCount: number;
  onToolSelect: (toolId: string) => void;
  onSettingChange: (toolId: string, key: string, value: unknown) => void;
  onProcess: () => void;
  processingJobs: ProcessingJob[];
}

const toolIcons: Record<string, React.ReactNode> = {
  'background-removal': <ImageIcon className="h-5 w-5" />,
  'license-plate-blur': <Scan className="h-5 w-5" />,
  'glass-tinting': <Sun className="h-5 w-5" />,
  'lighting-enhancement': <Contrast className="h-5 w-5" />,
  'shadow-generation': <Droplet className="h-5 w-5" />,
  'centering-crop': <Crop className="h-5 w-5" />,
  'image-enhancement': <Sparkles className="h-5 w-5" />,
  'batch-unify': <Layers className="h-5 w-5" />,
};

const categoryLabels: Record<string, string> = {
  background: 'الخلفية',
  enhancement: 'تحسين',
  correction: 'تصحيح',
  composition: 'تركيب',
  batch: 'دفعات',
};

const categoryIcons: Record<string, React.ReactNode> = {
  background: <ImageIcon className="h-4 w-4" />,
  enhancement: <Sparkles className="h-4 w-4" />,
  correction: <Wind className="h-4 w-4" />,
  composition: <Crop className="h-4 w-4" />,
  batch: <Layers className="h-4 w-4" />,
};

export const ToolPanel = ({
  tools,
  activeToolId,
  toolSettings,
  selectedCount,
  onToolSelect,
  onSettingChange,
  onProcess,
  processingJobs,
}: ToolPanelProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    background: true,
    enhancement: true,
    correction: true,
    composition: true,
    batch: true,
  });

  const isProcessing = processingJobs.some(job => job.status === 'processing');

  const handleCategoryToggle = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const getCategoryTools = (category: string) => tools.filter(t => t.category === category && t.enabled);

  const categories = ['background', 'enhancement', 'correction', 'composition', 'batch'];

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-surface-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-brand-600" />
            <h2 className="text-heading-md font-semibold text-surface-900 dark:text-white">أدوات المعالجة</h2>
          </div>
          <span className="badge badge-primary">{selectedCount} مختارة</span>
        </div>
        <p className="text-body-xs text-surface-500 mt-1">اختر أداة، اضبط الإعدادات، طبق على الصور المحددة</p>
      </div>

      {/* Tools List */}
      <div className="p-3 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
        {categories.map(category => {
          const categoryTools = getCategoryTools(category);
          if (categoryTools.length === 0) return null;

          const isExpanded = expandedCategories[category];

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <button
                onClick={() => handleCategoryToggle(category)}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-body-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors"
                aria-expanded={isExpanded}
              >
                {categoryIcons[category]}
                <span className="flex-1 text-start">{categoryLabels[category]}</span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-surface-400 transition-transform',
                    isExpanded && 'rotate-180'
                  )}
                />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1 pl-6 mt-1 border-s border-surface-200"
                  >
                    {categoryTools.map(tool => {
                      const isActive = activeToolId === tool.id;
                      const job = processingJobs.find(j => j.toolId === tool.id && j.status === 'processing');
                      const toolProgress = job?.progress || 0;

                      return (
                        <motion.button
                          key={tool.id}
                          onClick={() => onToolSelect(tool.id)}
                          className={cn(
                            'relative w-full px-3 py-3 rounded-xl text-start transition-all duration-200',
                            'flex items-start gap-3 group',
                            isActive
                              ? 'bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800'
                              : 'bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-800 border border-transparent'
                          )}
                          aria-pressed={isActive}
                        >
                          <div className={cn(
                            'flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center transition-all',
                            isActive
                              ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                              : 'bg-white dark:bg-surface-700 text-surface-600 dark:text-surface-400'
                          )}>
                            {toolIcons[tool.id] || tool.icon || <SlidersHorizontal className="h-5 w-5" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className={cn(
                                'text-body-sm font-medium truncate',
                                isActive ? 'text-brand-700 dark:text-brand-300' : 'text-surface-900 dark:text-white'
                              )}>
                                {tool.nameAr}
                              </h3>
                              {job && (
                                <span className="badge badge-primary text-body-xs">
                                  {Math.round(toolProgress)}%
                                </span>
                              )}
                            </div>
                            <p className="text-body-xs text-surface-500 dark:text-surface-400 mt-0.5 line-clamp-1">
                              {tool.description}
                            </p>
                          </div>

                          {isActive && (
                            <Check className="h-5 w-5 text-brand-600 shrink-0" />
                          )}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Active Tool Settings */}
      {activeToolId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-surface-200 p-4"
        >
          <ActiveToolSettings
            tool={tools.find(t => t.id === activeToolId)!}
            settings={toolSettings[activeToolId] || {}}
            onSettingChange={(key, value) => onSettingChange(activeToolId, key, value)}
            onProcess={onProcess}
            selectedCount={selectedCount}
            isProcessing={isProcessing}
            onClose={() => onToolSelect(activeToolId)}
          />
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="border-t border-surface-200 p-4 space-y-2">
        <button
          onClick={onProcess}
          disabled={!activeToolId || selectedCount === 0 || isProcessing}
          className={cn(
            'btn w-full justify-center gap-2',
            activeToolId && selectedCount > 0 && !isProcessing
              ? 'btn-primary'
              : 'opacity-50 cursor-not-allowed'
          )}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>جاري المعالجة...</span>
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              <span>تطبيق على {selectedCount} صورة</span>
            </>
          )}
        </button>

        <button
          onClick={() => activeToolId && onToolSelect(activeToolId)}
          disabled={!activeToolId}
          className={cn(
            'btn w-full btn-secondary justify-center gap-2',
            !activeToolId && 'opacity-50 cursor-not-allowed'
          )}
        >
          <X className="h-4 w-4" />
          <span>إغلاق الأداة</span>
        </button>
      </div>
    </div>
  );
};

const ActiveToolSettings = ({
  tool,
  settings,
  onSettingChange,
  onProcess,
  selectedCount,
  isProcessing,
  onClose,
}: {
  tool: ProcessingTool;
  settings: Record<string, unknown>;
  onSettingChange: (key: string, value: unknown) => void;
  onProcess: () => void;
  selectedCount: number;
  isProcessing: boolean;
  onClose: () => void;
}) => {
  if (!tool.requiresSettings || tool.settingsSchema.length === 0) {
    return (
      <div className="text-center py-4 text-surface-500">
        <p>لا توجد إعدادات لهذه الأداة</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
            {toolIcons[tool.id] || tool.icon || <SlidersHorizontal className="h-4 w-4" />}
          </div>
          <h3 className="text-heading-sm font-semibold text-surface-900 dark:text-white">
            إعدادات {tool.nameAr}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="btn-icon p-1 text-surface-400 hover:text-surface-600"
          aria-label="إغلاق الإعدادات"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {tool.settingsSchema.map(schema => (
          <SettingControl
            key={schema.key}
            schema={schema}
            value={settings[schema.key] ?? schema.defaultValue}
            onChange={onSettingChange}
          />
        ))}
      </div>

      <div className="pt-2 border-t border-surface-200">
        <button
          onClick={onProcess}
          disabled={selectedCount === 0 || isProcessing}
          className={cn(
            'btn w-full justify-center gap-2',
            selectedCount > 0 && !isProcessing ? 'btn-primary' : 'opacity-50'
          )}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>جاري المعالجة...</span>
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              <span>تطبيق على {selectedCount} صورة</span>
            </>
          )}
        </button>
      </div>
    </div>
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
          {schema.description && (
            <p className="text-body-xs text-surface-500">{schema.description}</p>
          )}
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
              placeholder="#RRGGBB"
            />
          </div>
        </div>
      );

    case 'number':
      return (
        <div className="space-y-1">
          <label className="text-body-sm font-medium text-surface-700 dark:text-surface-300">
            {schema.labelAr}
          </label>
          <input
            type="number"
            min={schema.min}
            max={schema.max}
            step={schema.step}
            value={value as number}
            onChange={e => handleChange(parseFloat(e.target.value) || 0)}
            className="input"
          />
        </div>
      );

    default:
      return null;
  }
};

// Import ChevronDown
import { ChevronDown } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';