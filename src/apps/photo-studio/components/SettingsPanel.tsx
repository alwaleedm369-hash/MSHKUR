import { motion } from 'framer-motion';
import { X, ChevronDown, ChevronUp, Palette, Image as ImageIcon, Download, Share2, Globe, Smartphone, Shield, Zap, Sparkles, Layers } from 'lucide-react';
import { cn } from '@utils/cn';
import { BackgroundOption } from '../types';

interface SettingsPanelProps {
  onClose: () => void;
  backgroundOptions: BackgroundOption[];
}

export const SettingsPanel = ({ onClose, backgroundOptions }: SettingsPanelProps) => {
  const [activeTab, setActiveTab] = useState<'general' | 'backgrounds' | 'export' | 'advanced'>('general');
  const [settings, setSettings] = useState({
    autoSave: true,
    keepOriginal: true,
    defaultQuality: 90,
    defaultFormat: 'png',
    showTooltips: true,
    animations: true,
    language: 'ar',
    theme: 'system',
  });

  const tabs = [
    { id: 'general', label: 'عام', icon: SlidersHorizontal },
    { id: 'backgrounds', label: 'الخلفيات', icon: Palette },
    { id: 'export', label: 'التصدير', icon: Download },
    { id: 'advanced', label: 'متقدم', icon: Sparkles },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-16 right-0 bottom-0 z-50 w-full md:w-96 bg-white dark:bg-surface-900 shadow-2xl border-l border-surface-200 flex flex-col"
      role="dialog"
      aria-label="الإعدادات"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-200 sticky top-0 bg-white/95 dark:bg-surface-900/95 backdrop-blur z-10">
        <h2 className="text-heading-md font-semibold text-surface-900 dark:text-white">الإعدادات</h2>
        <button
          onClick={onClose}
          className="btn-icon p-2 text-surface-400 hover:text-surface-600"
          aria-label="إغلاق الإعدادات"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-200 overflow-x-auto px-4" role="tablist">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-body-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'text-brand-600 border-brand-600'
                  : 'text-surface-500 hover:text-surface-700 border-transparent'
              )}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            id={`panel-${activeTab}`}
            role="tabpanel"
          >
            {activeTab === 'general' && <GeneralSettings settings={settings} onChange={setSettings} />}
            {activeTab === 'backgrounds' && <BackgroundSettings backgrounds={backgroundOptions} />}
            {activeTab === 'export' && <ExportSettings settings={settings} onChange={setSettings} />}
            {activeTab === 'advanced' && <AdvancedSettings settings={settings} onChange={setSettings} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const GeneralSettings = ({
  settings,
  onChange,
}: {
  settings: any;
  onChange: (settings: any) => void;
}) => {
  const handleChange = (key: string, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-heading-sm font-semibold text-surface-900 dark:text-white mb-4">سلوك التطبيق</h3>
        <div className="space-y-3">
          <SettingToggle
            label="الحفظ التلقائي"
            description="حفظ العمل تلقائياً أثناء المعالجة"
            value={settings.autoSave}
            onChange={v => handleChange('autoSave', v)}
          />
          <SettingToggle
            label="حفظ الأصل (KeepOriginal)"
            description="الاحتفاظ بالصور الأصلية وعدم الكتابة عليها أبداً"
            value={settings.keepOriginal}
            onChange={v => handleChange('keepOriginal', v)}
          />
          <SettingToggle
            label="إظهار التلميحات"
            description="عرض تلميحات مساعدة للأدوات والإعدادات"
            value={settings.showTooltips}
            onChange={v => handleChange('showTooltips', v)}
          />
          <SettingToggle
            label="الرسوم المتحركة"
            description="تمكين الحركات والانتقالات في الواجهة"
            value={settings.animations}
            onChange={v => handleChange('animations', v)}
          />
        </div>
      </div>

      <div className="border-t border-surface-200 pt-6">
        <h3 className="text-heading-sm font-semibold text-surface-900 dark:text-white mb-4">اللغة والمظهر</h3>
        <div className="space-y-4">
          <SettingSelect
            label="اللغة"
            value={settings.language}
            options={[
              { value: 'ar', label: 'العربية' },
              { value: 'en', label: 'English' },
            ]}
            onChange={v => handleChange('language', v)}
          />
          <SettingSelect
            label="المظهر"
            value={settings.theme}
            options={[
              { value: 'light', label: 'فاتح' },
              { value: 'dark', label: 'داكن' },
              { value: 'system', label: 'حسب النظام' },
            ]}
            onChange={v => handleChange('theme', v)}
          />
        </div>
      </div>
    </div>
  );
};

const BackgroundSettings = ({
  backgrounds,
}: {
  backgrounds: BackgroundOption[];
}) => {
  const categories = ['white', 'studio', 'outdoor', 'ad-compatible', 'custom'] as const;
  const categoryLabels: Record<string, string> = {
    white: 'أبيض',
    studio: 'استوديو',
    outdoor: 'خارجية',
    'ad-compatible': 'متوافقة مع الإعلانات',
    custom: 'مخصصة',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-heading-sm font-semibold text-surface-900 dark:text-white">
          الخلفيات المتاحة
        </h3>
        <span className="badge badge-primary">{backgrounds.length} خلفية</span>
      </div>

      <div className="space-y-4">
        {categories.map(category => {
          const categoryBackgrounds = backgrounds.filter(b => b.category === category);
          if (categoryBackgrounds.length === 0) return null;

          return (
            <div key={category} className="space-y-2">
              <h4 className="text-body-sm font-medium text-surface-600 dark:text-surface-400 uppercase tracking-wider">
                {categoryLabels[category]}
              </h4>
              <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))' }}>
                {categoryBackgrounds.map(bg => (
                  <div
                    key={bg.id}
                    className="relative aspect-square rounded-lg overflow-hidden border border-surface-200 cursor-pointer hover:ring-2 hover:ring-brand-500 transition-all"
                    title={`${bg.nameAr} (${bg.category})`}
                  >
                    {bg.type === 'color' ? (
                      <div className="w-full h-full" style={{ backgroundColor: bg.value }} />
                    ) : bg.type === 'gradient' ? (
                      <div className="w-full h-full" style={{ background: bg.value }} />
                    ) : (
                      <div className="w-full h-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-surface-400" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-body-xs px-1 py-0.5 truncate">
                      {bg.nameAr}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-surface-200 pt-4">
        <h4 className="text-body-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
          إضافة خلفية مخصصة
        </h4>
        <div className="flex gap-2">
          <input type="file" accept="image/*" className="input flex-1" />
          <button className="btn btn-primary">إضافة</button>
        </div>
      </div>
    </div>
  );
};

const ExportSettings = ({
  settings,
  onChange,
}: {
  settings: any;
  onChange: (settings: any) => void;
}) => {
  const handleChange = (key: string, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-heading-sm font-semibold text-surface-900 dark:text-white mb-4">إعدادات التصدير الافتراضية</h3>
        <div className="space-y-4">
          <SettingSelect
            label="التنسيق الافتراضي"
            value={settings.defaultFormat}
            options={[
              { value: 'png', label: 'PNG (بدون فقدان)' },
              { value: 'jpg', label: 'JPG (ضغط)' },
              { value: 'webp', label: 'WebP (حديث)' },
            ]}
            onChange={v => handleChange('defaultFormat', v)}
          />
          <SettingSlider
            label="الجودة الافتراضية"
            value={settings.defaultQuality}
            min={10}
            max={100}
            step={5}
            unit="%"
            onChange={v => handleChange('defaultQuality', v)}
          />
        </div>
      </div>

      <div className="border-t border-surface-200 pt-6">
        <h3 className="text-heading-sm font-semibold text-surface-900 dark:text-white mb-4">خيارات التصدير</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="h-4 w-4 rounded border-surface-300 text-brand-600" defaultChecked />
            <span className="text-body-sm text-surface-700 dark:text-surface-300">تضمين النسخة الأصلية في التصدير</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="h-4 w-4 rounded border-surface-300 text-brand-600" />
            <span className="text-body-sm text-surface-700 dark:text-surface-300">إنشاء ملف ZIP للتصدير المتعدد</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="h-4 w-4 rounded border-surface-300 text-brand-600" />
            <span className="text-body-sm text-surface-700 dark:text-surface-300">إضافة بيانات التعريف (EXIF)</span>
          </label>
        </div>
      </div>
    </div>
  );
};

const AdvancedSettings = ({
  settings,
  onChange,
}: {
  settings: any;
  onChange: (settings: any) => void;
}) => {
  const handleChange = (key: string, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-heading-sm font-semibold text-surface-900 dark:text-white mb-4">محرك المعالجة</h3>
        <div className="space-y-3">
          <SettingSelect
            label="نموذج إزالة الخلفية الافتراضي"
            value="car-optimized"
            options={[
              { value: 'fast', label: 'سريع (أقل دقة)' },
              { value: 'high-quality', label: 'جودة عالية' },
              { value: 'car-optimized', label: 'محسّن للسيارات (افتراضي)' },
            ]}
            onChange={() => {}}
          />
          <SettingSelect
            label="وحدة المعالجة"
            value="webgpu"
            options={[
              { value: 'webgpu', label: 'WebGPU (الأسرع)' },
              { value: 'wasm', label: 'WASM (التوافق)' },
              { value: 'cpu', label: 'CPU (الاحتياطي)' },
            ]}
            onChange={() => {}}
          />
        </div>
      </div>

      <div className="border-t border-surface-200 pt-6">
        <h3 className="text-heading-sm font-semibold text-surface-900 dark:text-white mb-4">الأداء والتخزين</h3>
        <div className="space-y-3">
          <SettingSlider
            label="حد ذاكرة المعالجة"
            value={512}
            min={128}
            max={2048}
            step={128}
            unit=" ميجابايت"
            onChange={() => {}}
          />
          <SettingToggle
            label="معالجة متوازية"
            description="معالجة صور متعددة في نفس الوقت"
            value={true}
            onChange={() => {}}
          />
          <SettingToggle
            label="تخزين مؤقت للنتائج"
            description="حفظ النتائج المؤقتة لتسريع المعاينة"
            value={true}
            onChange={() => {}}
          />
        </div>
      </div>

      <div className="border-t border-surface-200 pt-6">
        <h3 className="text-heading-sm font-semibold text-surface-900 dark:text-white mb-4">إعادة الضبط</h3>
        <div className="flex gap-3">
          <button className="btn btn-secondary">إعادة تعيين الإعدادات</button>
          <button className="btn btn-ghost text-error-DEFAULT hover:bg-error-light/10">مسح ذاكرة التخزين المؤقت</button>
        </div>
      </div>
    </div>
  );
};

const SettingToggle = ({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) => (
  <label className="flex items-start gap-3 cursor-pointer">
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={cn(
        'relative h-6 w-11 rounded-full transition-colors flex-shrink-0 mt-0.5',
        value ? 'bg-brand-600' : 'bg-surface-300 dark:bg-surface-600'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-lg transition-transform',
          value ? 'translate-x-5' : 'translate-x-0.5'
        )}
      />
    </button>
    <div className="flex-1">
      <span className="text-body-sm font-medium text-surface-700 dark:text-surface-300">{label}</span>
      <p className="text-body-xs text-surface-500 mt-0.5">{description}</p>
    </div>
  </label>
);

const SettingSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) => (
  <div className="space-y-1">
    <label className="text-body-sm font-medium text-surface-700 dark:text-surface-300">{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="input py-2"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const SettingSlider = ({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="text-body-sm font-medium text-surface-700 dark:text-surface-300">{label}</label>
      <span className="text-body-sm font-mono text-brand-600">{value}{unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none accent-brand-600"
    />
  </div>
);

import { useState } from 'react';
import { ImageIcon } from 'lucide-react';