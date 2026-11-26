import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Megaphone, Sparkles, Download, Share2, Save, Settings, Plus, Trash2, Eye, Image as ImageIcon, Type, Layout, Palette, Globe, Smartphone, Check, ArrowRight, X, ChevronLeft, ChevronRight, Zap, RotateCcw, Copy, AlertCircle, CheckCircle, Loader2, Zap as ZapIcon
} from 'lucide-react';
import { cn } from '@utils/cn';
import { MobileLayout } from '@shared/components/MobileLayout';

interface VehicleData {
  make: string;
  model: string;
  year: string;
  trim: string;
  mileage: string;
  price: string;
  color: string;
  fuelType: string;
  transmission: string;
  engine: string;
  vin: string;
  description: string;
  features: string[];
}

interface GeneratedContent {
  title: string;
  description: string;
}

const steps = [
  { id: 'data', label: 'Vehicle Data', labelAr: 'بيانات السيارة', icon: Layout },
  { id: 'images', label: 'Images', labelAr: 'الصور', icon: ImageIcon },
  { id: 'content', label: 'Content', labelAr: 'المحتوى', icon: Type },
  { id: 'preview', label: 'Preview', labelAr: 'معاينة', icon: Eye },
  { id: 'publish', label: 'Publish', labelAr: 'نشر', icon: Globe },
];

const fuelTypes = [
  { value: '', label: 'Select fuel type', labelAr: 'اختر نوع الوقود' },
  { value: 'gasoline', label: 'Gasoline', labelAr: 'بنزين' },
  { value: 'diesel', label: 'Diesel', labelAr: 'ديزل' },
  { value: 'hybrid', label: 'Hybrid', labelAr: 'هايبرد' },
  { value: 'electric', label: 'Electric', labelAr: 'كهربائية' },
  { value: 'plug-in-hybrid', label: 'Plug-in Hybrid', labelAr: 'هايبرد قابلة للشحن' },
];

const transmissions = [
  { value: '', label: 'Select transmission', labelAr: 'اختر ناقل الحركة' },
  { value: 'automatic', label: 'Automatic', labelAr: 'أوتوماتيك' },
  { value: 'manual', label: 'Manual', labelAr: 'يدوي' },
  { value: 'cvt', label: 'CVT', labelAr: 'CVT' },
  { value: 'dual-clutch', label: 'Dual Clutch', labelAr: 'قزدوجة القابض' },
];

const templates = [
  { id: 'modern', name: 'Modern', nameAr: 'عصري', color: 'bg-blue-500' },
  { id: 'classic', name: 'Classic', nameAr: 'كلاسيكي', color: 'bg-amber-500' },
  { id: 'minimal', name: 'Minimal', nameAr: 'بسيط', color: 'bg-gray-500' },
  { id: 'bold', name: 'Bold', nameAr: 'جريء', color: 'bg-red-500' },
];

const platforms = [
  { name: 'Haraj', icon: Globe, desc: 'Largest car marketplace in KSA', color: 'green' },
  { name: 'Facebook Marketplace', icon: Globe, desc: 'Reach millions of buyers', color: 'blue' },
  { name: 'Instagram', icon: Smartphone, desc: 'Post & Story', color: 'pink' },
  { name: 'Snapchat', icon: Smartphone, desc: 'Interactive Story', color: 'yellow' },
  { name: 'Export PDF', icon: Download, desc: 'Print-ready file', color: 'red' },
  { name: 'Share Link', icon: Share2, desc: 'Direct link to listing', color: 'purple' },
];

export const MobileAdStudio = () => {
  const [step, setStep] = useState(0);
  const [vehicleData, setVehicleData] = useState<VehicleData>({
    make: '', model: '', year: '', trim: '', mileage: '', price: '', color: '',
    fuelType: '', transmission: '', engine: '', vin: '', description: '', features: [],
  });
  const [images, setImages] = useState<File[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({ title: '', description: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const currentStep = steps[step];
  const isFirstStep = step === 0;
  const isLastStep = step === steps.length - 1;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setGeneratedContent({
      title: `${vehicleData.year} ${vehicleData.make} ${vehicleData.model} ${vehicleData.trim || ''} - ${vehicleData.price} SAR`,
      description: `${vehicleData.make} ${vehicleData.model} ${vehicleData.year} in excellent condition. ${vehicleData.mileage} km. ${vehicleData.color}. ${vehicleData.fuelType}, ${vehicleData.transmission}. ${vehicleData.description || 'Well maintained vehicle with full service history.'}`,
    });
    setIsGenerating(false);
  };

  const canProceed = () => {
    switch (step) {
      case 0: return vehicleData.make && vehicleData.model && vehicleData.year && vehicleData.price && vehicleData.mileage;
      case 1: return images.length > 0;
      case 2: return generatedContent.title && generatedContent.description;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0: return <StepVehicleData data={vehicleData} onChange={setVehicleData} />;
      case 1: return <StepImages images={images} onChange={setImages} onPreview={setShowImagePreview} />;
      case 2: return <StepContent data={vehicleData} content={generatedContent} onGenerate={handleGenerateContent} isGenerating={isGenerating} onChange={setGeneratedContent} />;
      case 3: return <StepPreview data={vehicleData} images={images} content={generatedContent} template={selectedTemplate} onTemplateChange={setSelectedTemplate} />;
      case 4: return <StepPublish data={vehicleData} content={generatedContent} />;
      default: return null;
    }
  };

  return (
    <MobileLayout showBottomNav={false} currentTab="ad" onTabChange={() => {}}>
      {/* Header */}
      <header className="sticky top-16 z-30 bg-white/95 dark:bg-surface-900/95 backdrop-blur-md border-b border-surface-200 dark:border-surface-800">
        <div className="container-mshkur">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 h-16 sm:h-14">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Megaphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-heading-lg font-bold text-surface-900 dark:text-white">Ad Studio</h1>
                <p className="text-body-sm text-surface-500">Create professional car listings</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="btn btn-secondary gap-2">
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Save Draft</span>
              </button>
              <button className="btn btn-primary gap-2">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="md:hidden overflow-x-auto pb-2 -mx-4 px-4">
            <div className="flex items-center gap-1 min-w-max">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const active = i === step;
                const completed = i < step;
                return (
                  <div key={s.id} className="flex items-center gap-1.5">
                    <button
                      onClick={() => setStep(i)}
                      className={cn(
                        'flex flex-col items-center gap-1 px-3 py-2 min-w-[70px] transition-all',
                        active ? 'text-brand-600' : 'text-surface-500'
                      )}
                      disabled={!completed && i > step}
                    >
                      <div className={cn(
                        'h-8 w-8 rounded-lg flex items-center justify-center text-body-xs font-medium',
                        active ? 'bg-brand-100 text-brand-600' :
                        completed ? 'bg-emerald-100 text-emerald-600' :
                        'bg-surface-100 dark:bg-surface-800'
                      )}>
                        {completed ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <span className="text-body-xs font-medium">{s.labelAr || s.label}</span>
                    </button>
                    {i < steps.length - 1 && <div className={cn('h-0.5 w-10', completed ? 'bg-emerald-500' : 'bg-surface-200 dark:bg-surface-800')} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Steps (Desktop) */}
      <div className="hidden md:flex md:items-center md:justify-between md:gap-1 md:overflow-x-auto md:pb-2 md:-mx-4 md:px-4">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const active = i === step;
          const completed = i < step;
          return (
            <div key={s.id} className="flex items-center gap-1.5 whitespace-nowrap">
              <button
                onClick={() => setStep(i)}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 min-w-[70px] transition-all',
                  active ? 'text-brand-600' : 'text-surface-500'
                )}
                disabled={!completed && i > step}
              >
                <div className={cn(
                  'h-8 w-8 rounded-lg flex items-center justify-center text-body-xs font-medium',
                  active ? 'bg-brand-100 text-brand-600' :
                  completed ? 'bg-emerald-100 text-emerald-600' :
                  'bg-surface-100 dark:bg-surface-800'
                )}>
                  {completed ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className="text-body-xs font-medium">{s.label}</span>
              </button>
              {i < steps.length - 1 && <div className={cn('h-0.5 w-12', completed ? 'bg-emerald-500' : 'bg-surface-200 dark:bg-surface-800')} />}
            </div>
          );
        })}
      </div>

      {/* Main Content}
      <main className="flex-1 container-mshkur py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: step > 0 ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: step > 0 ? -20 : 20 }}
            transition={{ duration: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800 p-4 safe-bottom z-40">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button onClick={handlePrev} disabled={isFirstStep} className="btn btn-secondary gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <button onClick={handleNext} disabled={isLastStep || !canProceed()} className="btn btn-primary gap-2">
            {isLastStep ? 'Publish' : 'Next'}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </MobileLayout>
  );
};

// Step Components
const StepVehicleData = ({ data, onChange }: { data: any; onChange: (data: any) => void }) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <h2 className="text-heading-lg font-bold text-surface-900 dark:text-white">Vehicle Data</h2>
      <p className="text-body-md text-surface-500 mt-1">Enter vehicle details to create your listing</p>
    </div>

    <div className="card p-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField label="Make *" name="make" value={data.make} onChange={e => onChange({ ...data, make: e.target.value })} placeholder="e.g., Toyota" required />
        <InputField label="Model *" name="model" value={data.model} onChange={e => onChange({ ...data, model: e.target.value })} placeholder="e.g., Camry" required />
        <InputField label="Year *" name="year" value={data.year} onChange={e => onChange({ ...data, year: e.target.value })} type="number" placeholder="2024" required />
        <InputField label="Trim" name="trim" value={data.trim} onChange={e => onChange({ ...data, trim: e.target.value })} placeholder="e.g., GLE" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <InputField label="Price (SAR) *" name="price" value={data.price} onChange={e => onChange({ ...data, price: e.target.value })} type="number" placeholder="150,000" required />
        <InputField label="Mileage (km) *" name="mileage" value={data.mileage} onChange={e => onChange({ ...data, mileage: e.target.value })} type="number" placeholder="45,000" required />
        <InputField label="Color" name="color" value={data.color} onChange={e => onChange({ ...data, color: e.target.value })} placeholder="White" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField label="Fuel Type" name="fuelType" value={data.fuelType} onChange={e => onChange({ ...data, fuelType: e.target.value })} options={fuelTypes} />
        <SelectField label="Transmission" name="transmission" value={data.transmission} onChange={e => onChange({ ...data, transmission: e.target.value })} options={transmissions} />
        <InputField label="Engine" name="engine" value={data.engine} onChange={e => onChange({ ...data, engine: e.target.value })} placeholder="e.g., 2.5L 4-Cylinder" />
      </div>

      <div className="space-y-2">
        <label className="label">Description</label>
        <textarea
          value={data.description}
          onChange={e => onChange({ ...data, description: e.target.value })}
          rows={4}
          className="input resize-y"
          placeholder="Describe condition, features, service history..."
        />
      </div>

      <div className="space-y-2">
        <label className="label">Features (comma separated)</label>
        <input
          value={data.features.join(', ')}
          onChange={e => onChange({ ...data, features: e.target.value.split(',').map(f => f.trim()).filter(Boolean) })}
          className="input"
          placeholder="Backup camera, Panoramic roof, Leather, Navigation..."
        />
      </div>
    </div>
  </div>
);

const StepImages = ({ images, onChange, onPreview }: { images: File[]; onChange: (files: File[]) => void; onPreview: (show: boolean) => void }) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <h2 className="text-heading-lg font-bold text-surface-900 dark:text-white">Photos</h2>
      <p className="text-body-md text-surface-500 mt-1">Add car photos (max 20, recommend 8-12)</p>
    </div>

    <div className="card p-6">
      <DropZone images={images} onChange={onChange} />
    </div>

    {images.length > 0 && (
      <div className="card p-6">
        <h3 className="text-heading-sm font-semibold text-surface-900 dark:text-white mb-4">Added Photos ({images.length})</h3>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
          {images.map((file, i) => (
            <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-surface-100 dark:bg-surface-800" onClick={() => { setPreviewIndex(i); onPreview(true); }}>
              <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
              <button onClick={e => { e.stopPropagation(); onChange(images.filter((_, idx) => idx !== i)); }} className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                <X className="h-3.5 w-3.5" />
              </button>
              <span className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-body-xs px-1 text-center">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const DropZone = ({ images, onChange }: { images: File[]; onChange: (files: File[]) => void }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (images.length + files.length > 20) {
      alert('Maximum 20 images allowed');
      return;
    }
    onChange([...images, ...files]);
  };

  return (
    <div
      className={cn(
        'relative rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer',
        isDragActive ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500' : 'border-surface-300 hover:border-amber-400'
      )}
      onDragOver={e => { e.preventDefault(); setIsDragActive(true); }}
      onDragLeave={e => { e.preventDefault(); setIsDragActive(false); }}
      onDrop={handleDrop}
      onClick={() => document.getElementById('image-upload')?.click()}
    >
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        multiple
        onChange={e => {
          const files = Array.from(e.target.files || []);
          if (images.length + files.length > 20) return;
          onChange([...images, ...files]);
          e.target.value = '';
        }}
        className="hidden"
      />
      <div className="mx-auto mb-4">
        <div className={cn(
          'inline-flex h-16 w-16 items-center justify-center rounded-2xl',
          isDragActive ? 'bg-amber-500 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-400'
        )}>
          <ImageIcon className="h-8 w-8" />
        </div>
      </div>
      <h3 className="text-heading-md font-semibold text-surface-900 dark:text-white mb-1">
        {isDragActive ? 'Drop images here' : 'Drag & drop photos or tap to select'}
      </h3>
      <p className="text-body-sm text-surface-500">JPG, PNG, WebP - Up to 20 images, 50MB each</p>
    </div>
  );
}

const StepContent = ({ data, content, onGenerate, isGenerating, onChange }: { data: any; content: GeneratedContent; onGenerate: () => void; isGenerating: boolean; onChange: (content: GeneratedContent) => void }) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <h2 className="text-heading-lg font-bold text-surface-900 dark:text-white">Ad Content</h2>
      <p className="text-body-md text-surface-500 mt-1">Review and edit AI-generated title and description</p>
    </div>

    <div className="card p-6 space-y-6">
      <button
        onClick={onGenerate}
        className="btn btn-primary gap-2 w-full sm:w-auto"
        disabled={!data.make || !data.model || isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate with AI
          </>
        )}
      </button>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="label">Ad Title *</label>
          <input
            value={content.title}
            onChange={e => onChange({ ...content, title: e.target.value })}
            className="input"
            placeholder="Will be generated automatically..."
          />
        </div>

        <div className="space-y-2">
          <label className="label">Description *</label>
          <textarea
            value={content.description}
            onChange={e => onChange({ ...content, description: e.target.value })}
            rows={6}
            className="input resize-y"
            placeholder="Will be generated automatically..."
          />
        </div>
      </div>
    </div>
  </div>
);

const StepPreview = ({ data, images, content, template, onTemplateChange }: { data: any; images: File[]; content: GeneratedContent; template: string; onTemplateChange: (id: string) => void }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-heading-lg font-bold text-surface-900 dark:text-white">Preview</h2>
        <p className="text-body-md text-surface-500">Choose template and review final look</p>
      </div>
      <div className="flex gap-2">
        {templates.map(t => (
          <button
            key={t.id}
            onClick={() => onTemplateChange(t.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-body-sm font-medium transition-all',
              template === t.id ? 'bg-brand-600 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 hover:bg-surface-200 dark:hover:bg-surface-700'
            )}
          >
            {t.nameAr || t.name}
          </button>
        ))}
      </div>
    </div>

    <div className="card overflow-hidden">
      <div className="p-6 bg-white" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 rounded-xl bg-surface-100 flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-surface-400" />
            </div>
            <div>
              <h3 className="text-heading-md font-bold text-surface-900">{content.title}</h3>
              <p className="text-body-sm text-surface-500">{data.price} SAR • {data.mileage} km</p>
            </div>
          </div>
          <p className="text-body-md text-surface-700 whitespace-pre-wrap">{content.description}</p>
          <div className="flex flex-wrap gap-1">
            {data.features.map((f: string, i: number) => (
              <span key={i} className="badge badge-neutral">{f}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const StepPublish = ({ data, content }: { data: any; content: GeneratedContent }) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <h2 className="text-heading-lg font-bold text-surface-900 dark:text-white">Publish & Export</h2>
      <p className="text-body-md text-surface-500">Choose platforms and export your listing</p>
    </div>

    <div className="card p-6 space-y-6">
      <h3 className="text-heading-sm font-semibold text-surface-900 dark:text-white">Publishing Platforms</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {platforms.map(platform => (
          <label key={platform.name} className="card-interactive p-4 flex items-center gap-4">
            <input type="checkbox" className="h-4 w-4 rounded border-surface-300 text-brand-600" />
            <div className="flex-1">
              <div className="font-medium text-surface-900">{platform.name}</div>
              <div className="text-body-sm text-surface-500">{platform.desc}</div>
            </div>
          </label>
        ))}
      </div>

      <div className="flex gap-3">
        <button className="btn btn-primary flex-1 gap-2">
          <Download className="h-4 w-4" />
          Export All
        </button>
        <button className="btn btn-secondary flex-1 gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>
    </div>
  </div>
);

const InputField = ({ label, name, value, onChange, type = 'text', placeholder, required, ...props }: any) => (
  <div className="space-y-1">
    <label className="label">{label}{required && <span className="text-red-500">*</span>}</label>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className="input" {...props} />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, required }: any) => (
  <div className="space-y-1">
    <label className="label">{label}{required && <span className="text-red-500">*</span>}</label>
    <select value={value} onChange={onChange} className="input">
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.labelAr || opt.label}</option>)}
    </select>
  </div>
);

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm', className)}>
    {children}
  </div>
);

const cardInteractive = 'hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 cursor-pointer';

