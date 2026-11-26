import { useState, useEffect } from 'react';
import {
  Megaphone, Sparkles, Download, Save, Plus, Trash2, Eye, Image as ImageIcon,
  Type, Layout, Globe, Check, ChevronLeft, ChevronRight, ShieldAlert, CheckCircle2, Copy
} from 'lucide-react';
import { cn } from '@utils/cn';
import { useLocaleTheme } from '@hooks/useLocaleTheme';
import { useDealerWorkspace, consumeAdPrefill, AdDraft } from '@shared/stores/workspaceStore';
import { taskRuntime, AssistantTask } from '@shared/runtime/taskRuntime';

type StepId = 'data' | 'images' | 'content' | 'preview' | 'publish';

const FEATURE_OPTIONS = [
  { id: 'sunroof', en: 'Sunroof / Panoramic', ar: 'فتحة سقف / بانوراما' },
  { id: 'leather', en: 'Leather Seats', ar: 'مقاعد جلد' },
  { id: 'camera360', en: '360° Camera', ar: 'كاميرا 360 درجة' },
  { id: 'radar', en: 'Adaptive Cruise / Radar', ar: 'مثبت سرعة رادار' },
  { id: 'carplay', en: 'Apple CarPlay / Android Auto', ar: 'أبل كار بلاي / أندرويد أوتو' },
  { id: 'warranty', en: 'Agency Warranty', ar: 'ضمان الوكالة' },
];

const PLATFORMS = [
  { id: 'haraj', nameEn: 'Haraj', nameAr: 'حراج', descEn: 'Saudi automotive marketplace', descAr: 'أكبر منصة سيارات في السعودية' },
  { id: 'facebook', nameEn: 'Facebook Marketplace', nameAr: 'فيسبوك ماركت بليس', descEn: 'Local classifieds reach', descAr: 'الوصول للمشترين المحليين' },
  { id: 'instagram', nameEn: 'Instagram Post/Story', nameAr: 'إنستغرام', descEn: 'Visual social card', descAr: 'منشور وقصة' },
  { id: 'snapchat', nameEn: 'Snapchat Spotlight', nameAr: 'سناب شات', descEn: 'Vertical story format', descAr: 'قصة تفاعلية' },
];

export const AdStudio = () => {
  const { locale } = useLocaleTheme();
  const isAr = locale === 'ar';
  const { drafts, saveAdDraft, deleteAdDraft } = useDealerWorkspace();

  const [step, setStep] = useState<StepId>('data');
  const [draftId, setDraftId] = useState<string>(() => `draft-${Date.now()}`);
  const [vehicleId, setVehicleId] = useState<string | undefined>(undefined);
  const [vehicleData, setVehicleData] = useState({
    make: '',
    model: '',
    year: '',
    trim: '',
    mileage: '',
    price: '',
    color: '',
    fuelType: 'gasoline',
    transmission: 'automatic',
    engine: '',
    vin: '',
    description: '',
    features: [] as string[],
  });
  const [imagePreviews, setImagePreviews] = useState<{ id: string; name: string; url: string }[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'classic' | 'minimal'>('modern');
  const [generatedContent, setGeneratedContent] = useState({ title: '', description: '' });
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['haraj']);
  const [approvalTask, setApprovalTask] = useState<AssistantTask | null>(null);
  const [statusNotice, setStatusNotice] = useState<string>('');

  // Load prefill if navigated from Dealer Workspace
  useEffect(() => {
    const prefill = consumeAdPrefill();
    if (prefill) {
      setVehicleId(prefill.vehicleId);
      setVehicleData(prev => ({
        ...prev,
        make: prefill.make || prev.make,
        model: prefill.model || prev.model,
        year: prefill.year || prev.year,
        trim: prefill.trim || prev.trim,
        mileage: prefill.mileage || prev.mileage,
        price: prefill.price || prev.price,
        color: prefill.color || prev.color,
        fuelType: prefill.fuelType || prev.fuelType,
        transmission: prefill.transmission || prev.transmission,
        vin: prefill.vin || prev.vin,
        description: prefill.description || prev.description,
      }));
      setStatusNotice(
        isAr
          ? 'تم استيراد بيانات المركبة من سجل المعرض بنجاح.'
          : 'Vehicle record imported from Dealer Workspace.'
      );
    }
  }, [isAr]);

  const steps: { id: StepId; label: string; icon: typeof Layout }[] = [
    { id: 'data', label: isAr ? 'بيانات السيارة' : 'Vehicle Data', icon: Layout },
    { id: 'images', label: isAr ? 'الصور' : 'Photos', icon: ImageIcon },
    { id: 'content', label: isAr ? 'المحتوى' : 'Copy', icon: Type },
    { id: 'preview', label: isAr ? 'معاينة' : 'Preview', icon: Eye },
    { id: 'publish', label: isAr ? 'نشر وتصدير' : 'Publish & Export', icon: Globe },
  ];

  const currentIndex = steps.findIndex(s => s.id === step);

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1].id);
    }
  };

  const toggleFeature = (featureId: string) => {
    setVehicleData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId],
    }));
  };

  const handleImagesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const added = files.map(file => ({
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setImagePreviews(prev => [...prev, ...added]);
  };

  const handleGenerateContent = () => {
    const make = vehicleData.make.trim() || (isAr ? 'السيارة' : 'Vehicle');
    const model = vehicleData.model.trim();
    const year = vehicleData.year.trim();
    const trim = vehicleData.trim.trim();
    const price = vehicleData.price.trim();
    const mileage = vehicleData.mileage.trim();

    const activeFeatures = FEATURE_OPTIONS.filter(f => vehicleData.features.includes(f.id))
      .map(f => (isAr ? f.ar : f.en))
      .join(' • ');

    if (isAr) {
      const title = `${year} ${make} ${model} ${trim}`.trim() + (price ? ` — ${price} ر.س` : '');
      const lines = [
        `للبيع ${make} ${model} ${trim} موديل ${year || 'حديث'}.`,
        mileage ? `• الممشى: ${mileage} كم` : '',
        vehicleData.color ? `• اللون الخارجي: ${vehicleData.color}` : '',
        `• ناقل الحركة: ${vehicleData.transmission} | الوقود: ${vehicleData.fuelType}`,
        activeFeatures ? `• أبرز المواصفات: ${activeFeatures}` : '',
        vehicleData.description ? `\nملاحظات إضافية:\n${vehicleData.description}` : '',
      ].filter(Boolean);
      setGeneratedContent({ title, description: lines.join('\n') });
    } else {
      const title = `${year} ${make} ${model} ${trim}`.trim() + (price ? ` — SAR ${price}` : '');
      const lines = [
        `For sale: ${year} ${make} ${model} ${trim}.`.trim(),
        mileage ? `• Mileage: ${mileage} km` : '',
        vehicleData.color ? `• Exterior Color: ${vehicleData.color}` : '',
        `• Transmission: ${vehicleData.transmission} | Fuel: ${vehicleData.fuelType}`,
        activeFeatures ? `• Key Highlights: ${activeFeatures}` : '',
        vehicleData.description ? `\nAdditional Notes:\n${vehicleData.description}` : '',
      ].filter(Boolean);
      setGeneratedContent({ title, description: lines.join('\n') });
    }
  };

  const buildCurrentDraft = (status: AdDraft['status'], taskId?: string): AdDraft => ({
    id: draftId,
    vehicleId,
    make: vehicleData.make,
    model: vehicleData.model,
    year: vehicleData.year,
    trim: vehicleData.trim,
    mileage: vehicleData.mileage,
    price: vehicleData.price,
    color: vehicleData.color,
    fuelType: vehicleData.fuelType,
    transmission: vehicleData.transmission,
    engine: vehicleData.engine,
    vin: vehicleData.vin,
    description: vehicleData.description,
    features: vehicleData.features,
    template: selectedTemplate,
    title: generatedContent.title,
    generatedDescription: generatedContent.description,
    platforms: selectedPlatforms,
    approvalTaskId: taskId || approvalTask?.taskId,
    status,
    updatedAt: Date.now(),
  });

  const handleSaveDraft = () => {
    const draft = buildCurrentDraft('draft');
    saveAdDraft(draft);
    setStatusNotice(isAr ? 'تم حفظ مسودة الإعلان محلياً.' : 'Ad draft saved locally.');
  };

  const handleLoadDraft = (draft: AdDraft) => {
    setDraftId(draft.id);
    setVehicleId(draft.vehicleId);
    setVehicleData({
      make: draft.make,
      model: draft.model,
      year: draft.year,
      trim: draft.trim,
      mileage: draft.mileage,
      price: draft.price,
      color: draft.color,
      fuelType: draft.fuelType,
      transmission: draft.transmission,
      engine: draft.engine,
      vin: draft.vin,
      description: draft.description,
      features: draft.features,
    });
    setSelectedTemplate((draft.template as 'modern' | 'classic' | 'minimal') || 'modern');
    setGeneratedContent({ title: draft.title, description: draft.generatedDescription });
    setSelectedPlatforms(draft.platforms.length ? draft.platforms : ['haraj']);
    setStatusNotice(isAr ? `تم تحميل المسودة: ${draft.title || draft.id}` : `Loaded draft: ${draft.title || draft.id}`);
  };

  const handleExportListingPackage = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      template: selectedTemplate,
      platforms: selectedPlatforms,
      listing: {
        title: generatedContent.title,
        description: generatedContent.description,
        vehicle: vehicleData,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mshkur-ad-${vehicleData.make || 'listing'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    saveAdDraft(buildCurrentDraft('exported'));
    setStatusNotice(isAr ? 'تم تصدير حزمة الإعلان بصيغة JSON.' : 'Listing package exported as JSON.');
  };

  const handleRequestExternalPublish = async () => {
    await taskRuntime.initialize();
    const targetLabel = selectedPlatforms.join(', ') || 'external';
    const intake = await taskRuntime.intake({
      sessionId: `ad-studio-${draftId}`,
      appId: 'ad-studio',
      prompt: `Publish vehicle listing "${generatedContent.title || `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`}" to ${targetLabel}`,
      grantedPermissions: ['read:input', 'execute:external-approved'],
    });
    const dispatched = await taskRuntime.dispatch(intake.taskId);
    setApprovalTask(dispatched);
    saveAdDraft(buildCurrentDraft('awaiting_approval', dispatched.taskId));
  };

  const handleResolvePublishApproval = async (decision: 'approved' | 'denied') => {
    if (!approvalTask) return;
    const resolved = await taskRuntime.resolveApproval(approvalTask.taskId, decision, 'ad-studio-user');
    setApprovalTask(resolved);
    saveAdDraft(
      buildCurrentDraft(decision === 'approved' ? 'approved_ready' : 'draft', resolved.taskId)
    );
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-surface-50 dark:bg-surface-950 flex flex-col">
      {/* Sub-header */}
      <div className="bg-white/95 dark:bg-surface-900/95 border-b border-surface-200 dark:border-surface-800 px-4 py-3">
        <div className="container-mshkur flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Megaphone className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-heading-md font-bold text-surface-900 dark:text-white">
                {isAr ? 'استوديو الإعلانات' : 'Ad Studio'}
              </h1>
              <p className="text-body-xs text-surface-500">
                {isAr ? 'إعداد، معاينة، تصدير ونشر الإعلانات بموافقة صريحة' : 'Draft, preview, export & approval-gated publishing'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={handleSaveDraft} className="btn btn-secondary gap-1.5 min-h-[44px]">
              <Save className="h-4 w-4" />
              <span>{isAr ? 'حفظ المسودة' : 'Save Draft'}</span>
            </button>
            <button type="button" onClick={handleExportListingPackage} className="btn btn-primary gap-1.5 min-h-[44px]">
              <Download className="h-4 w-4" />
              <span>{isAr ? 'تصدير' : 'Export'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 px-4 py-2.5 overflow-x-auto">
        <div className="container-mshkur flex items-center gap-2 min-w-max">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const active = s.id === step;
            const done = idx < currentIndex;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-body-xs font-medium min-h-[44px] transition-colors',
                  active
                    ? 'bg-brand-600 text-white'
                    : done
                      ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                      : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                )}
              >
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Notice */}
      {statusNotice && (
        <div className="container-mshkur pt-4 px-4">
          <div className="rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 px-4 py-2.5 text-body-xs text-brand-800 dark:text-brand-200 flex items-center justify-between">
            <span>{statusNotice}</span>
            <button type="button" onClick={() => setStatusNotice('')} className="text-xs underline">
              {isAr ? 'إغلاق' : 'Dismiss'}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container-mshkur flex-1 py-6 px-4 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {step === 'data' && (
            <div className="card p-6 space-y-4">
              <h2 className="text-heading-md font-bold text-surface-900 dark:text-white">
                {isAr ? 'بيانات المركبة الأساسية' : 'Vehicle Specifications'}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">{isAr ? 'الشركة المصنعة' : 'Make'}</label>
                  <input
                    type="text"
                    value={vehicleData.make}
                    onChange={e => setVehicleData({ ...vehicleData, make: e.target.value })}
                    placeholder={isAr ? 'مثال: تويوتا' : 'e.g. Toyota'}
                    className="input min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="label">{isAr ? 'الموديل' : 'Model'}</label>
                  <input
                    type="text"
                    value={vehicleData.model}
                    onChange={e => setVehicleData({ ...vehicleData, model: e.target.value })}
                    placeholder={isAr ? 'مثال: كامري' : 'e.g. Camry'}
                    className="input min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="label">{isAr ? 'سنة الصنع' : 'Year'}</label>
                  <input
                    type="text"
                    value={vehicleData.year}
                    onChange={e => setVehicleData({ ...vehicleData, year: e.target.value })}
                    placeholder="2023"
                    className="input min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="label">{isAr ? 'الفئة' : 'Trim'}</label>
                  <input
                    type="text"
                    value={vehicleData.trim}
                    onChange={e => setVehicleData({ ...vehicleData, trim: e.target.value })}
                    placeholder="GLE / Limited"
                    className="input min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="label">{isAr ? 'الممشى (كم)' : 'Mileage (km)'}</label>
                  <input
                    type="text"
                    value={vehicleData.mileage}
                    onChange={e => setVehicleData({ ...vehicleData, mileage: e.target.value })}
                    placeholder="15000"
                    className="input min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="label">{isAr ? 'السعر (ر.س)' : 'Price (SAR)'}</label>
                  <input
                    type="text"
                    value={vehicleData.price}
                    onChange={e => setVehicleData({ ...vehicleData, price: e.target.value })}
                    placeholder="125000"
                    className="input min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="label">{isAr ? 'اللون' : 'Exterior Color'}</label>
                  <input
                    type="text"
                    value={vehicleData.color}
                    onChange={e => setVehicleData({ ...vehicleData, color: e.target.value })}
                    placeholder={isAr ? 'أبيض لؤلؤي' : 'Pearl White'}
                    className="input min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="label">{isAr ? 'ناقل الحركة' : 'Transmission'}</label>
                  <select
                    value={vehicleData.transmission}
                    onChange={e => setVehicleData({ ...vehicleData, transmission: e.target.value })}
                    className="input min-h-[44px]"
                  >
                    <option value="automatic">{isAr ? 'أوتوماتيك' : 'Automatic'}</option>
                    <option value="cvt">CVT</option>
                    <option value="manual">{isAr ? 'يدوي' : 'Manual'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label mb-2">{isAr ? 'المميزات الإضافية' : 'Key Features'}</label>
                <div className="flex flex-wrap gap-2">
                  {FEATURE_OPTIONS.map(f => {
                    const selected = vehicleData.features.includes(f.id);
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => toggleFeature(f.id)}
                        className={cn(
                          'px-3 py-2 rounded-xl border text-body-xs font-medium min-h-[40px]',
                          selected
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300'
                        )}
                      >
                        {isAr ? f.ar : f.en}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="label">{isAr ? 'ملاحظات البائع' : 'Seller Notes'}</label>
                <textarea
                  rows={3}
                  value={vehicleData.description}
                  onChange={e => setVehicleData({ ...vehicleData, description: e.target.value })}
                  placeholder={isAr ? 'حالة البدي، المحركات، الصيانة الدورية...' : 'Body condition, service history, warranty...'}
                  className="input"
                />
              </div>
            </div>
          )}

          {step === 'images' && (
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-heading-md font-bold text-surface-900 dark:text-white">
                  {isAr ? 'صور الإعلان' : 'Listing Photos'}
                </h2>
                <button
                  type="button"
                  onClick={() => document.getElementById('ad-images-input')?.click()}
                  className="btn btn-primary gap-1.5 min-h-[44px]"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isAr ? 'إضافة صور' : 'Add Photos'}</span>
                </button>
                <input
                  id="ad-images-input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesSelected}
                  className="hidden"
                />
              </div>

              {imagePreviews.length === 0 ? (
                <div className="border-2 border-dashed border-surface-300 dark:border-surface-700 rounded-2xl p-10 text-center">
                  <ImageIcon className="h-10 w-10 text-surface-400 mx-auto mb-2" />
                  <p className="text-body-sm text-surface-500">
                    {isAr
                      ? 'ارفع صور المركبة الجاهزة من استوديو الصور أو جهازك.'
                      : 'Upload processed vehicle images from Photo Studio or your device.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {imagePreviews.map(img => (
                    <div key={img.id} className="relative rounded-xl overflow-hidden border border-surface-200 aspect-video bg-surface-100">
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImagePreviews(prev => prev.filter(i => i.id !== img.id))}
                        className="absolute top-2 end-2 p-1.5 rounded-lg bg-black/60 text-white"
                        aria-label="Remove image"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'content' && (
            <div className="card p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-heading-md font-bold text-surface-900 dark:text-white">
                  {isAr ? 'صياغة عنوان ووصف الإعلان' : 'Ad Title & Description'}
                </h2>
                <button type="button" onClick={handleGenerateContent} className="btn btn-primary gap-1.5 min-h-[44px]">
                  <Sparkles className="h-4 w-4" />
                  <span>{isAr ? 'توليد النص تلقائياً' : 'Generate Listing Copy'}</span>
                </button>
              </div>

              <div>
                <label className="label">{isAr ? 'عنوان الإعلان' : 'Ad Headline'}</label>
                <input
                  type="text"
                  value={generatedContent.title}
                  onChange={e => setGeneratedContent({ ...generatedContent, title: e.target.value })}
                  className="input min-h-[44px]"
                />
              </div>

              <div>
                <label className="label">{isAr ? 'نص الإعلان' : 'Ad Body'}</label>
                <textarea
                  rows={7}
                  value={generatedContent.description}
                  onChange={e => setGeneratedContent({ ...generatedContent, description: e.target.value })}
                  className="input"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${generatedContent.title}

${generatedContent.description}`);
                    setStatusNotice(isAr ? 'تم نسخ نص الإعلان.' : 'Ad copy copied to clipboard.');
                  }}
                  className="btn btn-secondary gap-1.5 min-h-[40px]"
                >
                  <Copy className="h-4 w-4" />
                  <span>{isAr ? 'نسخ النص' : 'Copy Text'}</span>
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-heading-md font-bold text-surface-900 dark:text-white">
                  {isAr ? 'معاينة بطاقة الإعلان' : 'Listing Card Preview'}
                </h2>
                <div className="flex gap-1.5">
                  {(['modern', 'classic', 'minimal'] as const).map(tpl => (
                    <button
                      key={tpl}
                      type="button"
                      onClick={() => setSelectedTemplate(tpl)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-body-xs font-medium capitalize',
                        selectedTemplate === tpl
                          ? 'bg-brand-600 text-white'
                          : 'bg-surface-100 dark:bg-surface-800 text-surface-600'
                      )}
                    >
                      {tpl}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className={cn(
                  'rounded-2xl border p-5 space-y-4',
                  selectedTemplate === 'modern'
                    ? 'border-brand-300 bg-gradient-to-br from-white to-brand-50/40 dark:from-surface-900 dark:to-brand-950/20'
                    : selectedTemplate === 'classic'
                      ? 'border-amber-300 bg-amber-50/30 dark:bg-surface-900'
                      : 'border-surface-200 bg-white dark:bg-surface-900'
                )}
              >
                {imagePreviews[0] && (
                  <img
                    src={imagePreviews[0].url}
                    alt="Cover"
                    className="w-full h-56 object-cover rounded-xl"
                  />
                )}
                <h3 className="text-heading-lg font-bold text-surface-900 dark:text-white">
                  {generatedContent.title ||
                    `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`.trim() ||
                    (isAr ? 'عنوان الإعلان' : 'Vehicle Listing Headline')}
                </h3>
                <p className="text-body-sm text-surface-700 dark:text-surface-300 whitespace-pre-wrap">
                  {generatedContent.description ||
                    (isAr ? 'انتقل إلى خطوة المحتوى لتوليد وصف الإعلان.' : 'Generate copy in the Copy step.')}
                </p>
              </div>
            </div>
          )}

          {step === 'publish' && (
            <div className="card p-6 space-y-5">
              <div>
                <h2 className="text-heading-md font-bold text-surface-900 dark:text-white">
                  {isAr ? 'النشر الخارجي والتصدير' : 'Approval-Gated Publishing & Export'}
                </h2>
                <p className="text-body-xs text-surface-500 mt-1">
                  {isAr
                    ? 'أي نشر خارجي يتطلب موافقة بشرية صريحة وتسجيل في سجل التدقيق.'
                    : 'External publishing requires explicit human approval and audit logging via Task Runtime.'}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {PLATFORMS.map(p => {
                  const checked = selectedPlatforms.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={cn(
                        'p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer',
                        checked
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/20'
                          : 'border-surface-200 dark:border-surface-800'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setSelectedPlatforms(prev =>
                            prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id]
                          )
                        }
                        className="mt-1 h-4 w-4 text-brand-600 rounded"
                      />
                      <div>
                        <p className="text-body-sm font-semibold text-surface-900 dark:text-white">
                          {isAr ? p.nameAr : p.nameEn}
                        </p>
                        <p className="text-body-xs text-surface-500">{isAr ? p.descAr : p.descEn}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void handleRequestExternalPublish()}
                  className="btn btn-primary gap-2 min-h-[44px]"
                >
                  <Globe className="h-4 w-4" />
                  <span>{isAr ? 'طلب نشر خارجي (بموافقة)' : 'Request External Publish (Approval Gate)'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportListingPackage}
                  className="btn btn-secondary gap-2 min-h-[44px]"
                >
                  <Download className="h-4 w-4" />
                  <span>{isAr ? 'تصدير حزمة الإعلان (JSON)' : 'Export Listing JSON'}</span>
                </button>
              </div>

              {approvalTask && (
                <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-body-xs font-mono text-surface-600">{approvalTask.taskId}</span>
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
                          onClick={() => void handleResolvePublishApproval('approved')}
                          className="btn btn-primary btn-sm min-h-[40px]"
                        >
                          {isAr ? 'موافقة وتأكيد النشر' : 'Approve Publish'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleResolvePublishApproval('denied')}
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
                      <span>
                        {isAr ? approvalTask.resultSummaryAr : approvalTask.resultSummary}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step Navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="btn btn-secondary gap-1.5 min-h-[44px]"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>{isAr ? 'السابق' : 'Previous'}</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex === steps.length - 1}
              className="btn btn-primary gap-1.5 min-h-[44px]"
            >
              <span>{isAr ? 'التالي' : 'Next'}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Saved Drafts Sidebar */}
        <aside className="space-y-4">
          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-heading-sm font-semibold text-surface-900 dark:text-white">
                {isAr ? 'المسودات المحفوظة' : 'Saved Ad Drafts'}
              </h3>
              <span className="badge badge-neutral">{drafts.length}</span>
            </div>

            {drafts.length === 0 ? (
              <p className="text-body-xs text-surface-500">
                {isAr ? 'لا توجد مسودات محفوظة بعد.' : 'No saved drafts yet.'}
              </p>
            ) : (
              <div className="space-y-2">
                {drafts.map(d => (
                  <div
                    key={d.id}
                    className="p-3 rounded-xl border border-surface-200 dark:border-surface-800 flex items-center justify-between gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => handleLoadDraft(d)}
                      className="text-start flex-1 min-w-0"
                    >
                      <p className="text-body-xs font-semibold text-surface-900 dark:text-white truncate">
                        {d.title || `${d.year} ${d.make} ${d.model}`.trim() || d.id}
                      </p>
                      <p className="text-[11px] text-surface-500 uppercase">{d.status}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteAdDraft(d.id)}
                      className="p-1.5 text-surface-400 hover:text-red-600"
                      aria-label="Delete draft"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
