export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  originalPreview: string;
  name: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  error?: string;
  processedBlobs: ProcessedBlob[];
  originalBlob: Blob;
}

export interface ProcessedBlob {
  id: string;
  parentId?: string;
  version: number;
  toolId: string;
  toolName: string;
  blob: Blob;
  preview: string;
  width?: number;
  height?: number;
  mimeType: string;
  byteSize: number;
  durationMs?: number;
  settings: Record<string, unknown>;
  timestamp: number;
  isOriginal: boolean;
}

export interface ProcessingTool {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  icon: React.ReactNode;
  category: 'background' | 'enhancement' | 'correction' | 'composition' | 'batch';
  enabled: boolean;
  requiresSettings: boolean;
  defaultSettings: Record<string, unknown>;
  settingsSchema: ToolSettingsSchema[];
}

export interface ToolSettingsSchema {
  key: string;
  label: string;
  labelAr: string;
  type: 'slider' | 'select' | 'toggle' | 'color' | 'number';
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
  defaultValue: unknown;
  description?: string;
}

export interface ProcessingJob {
  id: string;
  imageIds: string[];
  toolId: string;
  settings: Record<string, unknown>;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  results: ProcessedBlob[];
  error?: string;
  createdAt: number;
  completedAt?: number;
}

export interface BatchProcessingConfig {
  toolId: string;
  settings: Record<string, unknown>;
  applyToAll: boolean;
  selectedImageIds: string[];
}

export interface PhotoStudioState {
  images: ImageFile[];
  selectedImageIds: string[];
  activeToolId: string | null;
  toolSettings: Record<string, Record<string, unknown>>;
  processingJobs: ProcessingJob[];
  history: ProcessingJob[];
  viewMode: 'grid' | 'list' | 'compare';
  compareMode: 'side-by-side' | 'slider';
  showOriginal: boolean;
  zoomLevel: number;
}

export interface ExportOptions {
  format: 'png' | 'jpg' | 'webp';
  quality: number;
  width?: number;
  height?: number;
  maintainAspectRatio: boolean;
  includeOriginal: boolean;
  includeAllVersions: boolean;
  namingPattern: 'original' | 'tool-name' | 'timestamp' | 'custom';
  customPrefix?: string;
}

export interface BackgroundOption {
  id: string;
  name: string;
  nameAr: string;
  type: 'color' | 'gradient' | 'image' | 'studio' | 'outdoor';
  preview: string;
  value: string;
  category: 'white' | 'studio' | 'outdoor' | 'custom' | 'ad-compatible';
}

export const PROCESSING_TOOLS: ProcessingTool[] = [
  {
    id: 'background-removal',
    name: 'Background Removal',
    nameAr: 'إزالة الخلفية',
    description: 'إزالة خلفية السيارة واستبدالها بخلفية احترافية',
    icon: null,
    category: 'background',
    enabled: true,
    requiresSettings: true,
    defaultSettings: {
      model: 'high-quality',
      edgeRefinement: 0.8,
      backgroundType: 'transparent',
      backgroundValue: '',
      preserveDetails: true,
    },
    settingsSchema: [
      { key: 'model', label: 'Model', labelAr: 'النموذج', type: 'select', options: [
        { value: 'fast', label: 'Fast', labelAr: 'سريع' },
        { value: 'high-quality', label: 'High Quality', labelAr: 'جودة عالية' },
        { value: 'car-optimized', label: 'Car Optimized', labelAr: 'محسّن للسيارات' },
      ], defaultValue: 'car-optimized' },
      { key: 'edgeRefinement', label: 'Edge Refinement', labelAr: 'تنقية الحواف', type: 'slider', min: 0, max: 1, step: 0.05, defaultValue: 0.85 },
      { key: 'backgroundType', label: 'Background Type', labelAr: 'نوع الخلفية', type: 'select', options: [
        { value: 'transparent', label: 'Transparent', labelAr: 'شفافة' },
        { value: 'white', label: 'White', labelAr: 'بيضاء' },
        { value: 'studio', label: 'Studio', labelAr: 'استوديو' },
        { value: 'outdoor', label: 'Outdoor', labelAr: 'خارجية' },
        { value: 'custom', label: 'Custom', labelAr: 'مخصصة' },
      ], defaultValue: 'transparent' },
      { key: 'backgroundValue', label: 'Background', labelAr: 'الخلفية', type: 'color', defaultValue: '#ffffff' },
      { key: 'preserveDetails', label: 'Preserve Details', labelAr: 'الحفاظ على التفاصيل', type: 'toggle', defaultValue: true },
    ],
  },
  {
    id: 'license-plate-blur',
    name: 'License Plate Blur',
    nameAr: 'طمس اللوحة',
    description: 'كشف وإخفاء لوحة السيارة تلقائياً',
    icon: null,
    category: 'correction',
    enabled: true,
    requiresSettings: true,
    defaultSettings: {
      autoDetect: true,
      blurIntensity: 0.9,
      blurType: 'pixelate',
      customRegion: null,
    },
    settingsSchema: [
      { key: 'autoDetect', label: 'Auto Detect', labelAr: 'كشف تلقائي', type: 'toggle', defaultValue: true },
      { key: 'blurIntensity', label: 'Blur Intensity', labelAr: 'شدة الطمس', type: 'slider', min: 0.1, max: 1, step: 0.05, defaultValue: 0.95 },
      { key: 'blurType', label: 'Blur Type', labelAr: 'نوع الطمس', type: 'select', options: [
        { value: 'pixelate', label: 'Pixelate', labelAr: 'تبيكسيل' },
        { value: 'gaussian', label: 'Gaussian', labelAr: 'جوسي' },
        { value: 'solid', label: 'Solid Color', labelAr: 'لون موحد' },
      ], defaultValue: 'pixelate' },
    ],
  },
  {
    id: 'glass-tinting',
    name: 'Glass Tinting',
    nameAr: 'تضليل الزجاج',
    description: 'تظليل زجاج السيارة بذكاء مع الحفاظ على الواقعية',
    icon: null,
    category: 'enhancement',
    enabled: true,
    requiresSettings: true,
    defaultSettings: {
      tintLevel: 0.6,
      tintColor: '#1a1a2e',
      preserveReflections: true,
      autoDetectGlass: true,
    },
    settingsSchema: [
      { key: 'tintLevel', label: 'Tint Level', labelAr: 'درجة التظليل', type: 'slider', min: 0, max: 1, step: 0.05, defaultValue: 0.6 },
      { key: 'tintColor', label: 'Tint Color', labelAr: 'لون التظليل', type: 'color', defaultValue: '#1a1a2e' },
      { key: 'preserveReflections', label: 'Preserve Reflections', labelAr: 'الحفاظ على الانعكاسات', type: 'toggle', defaultValue: true },
      { key: 'autoDetectGlass', label: 'Auto Detect Glass', labelAr: 'كشف الزجاج تلقائياً', type: 'toggle', defaultValue: true },
    ],
  },
  {
    id: 'lighting-enhancement',
    name: 'Lighting Enhancement',
    nameAr: 'تحسين الإضاءة',
    description: 'معادلة الإضاءة، تحسين التباين، إزالة الظلال غير المرغوبة',
    icon: null,
    category: 'enhancement',
    enabled: true,
    requiresSettings: true,
    defaultSettings: {
      exposure: 0,
      contrast: 0.1,
      highlights: -0.2,
      shadows: 0.2,
      whites: 0.1,
      blacks: -0.1,
      autoBalance: true,
      removeHarshShadows: false,
    },
    settingsSchema: [
      { key: 'exposure', label: 'Exposure', labelAr: 'التعرض', type: 'slider', min: -1, max: 1, step: 0.05, defaultValue: 0 },
      { key: 'contrast', label: 'Contrast', labelAr: 'التباين', type: 'slider', min: -1, max: 1, step: 0.05, defaultValue: 0.1 },
      { key: 'highlights', label: 'Highlights', labelAr: 'الأضواء', type: 'slider', min: -1, max: 1, step: 0.05, defaultValue: -0.2 },
      { key: 'shadows', label: 'Shadows', labelAr: 'الظلال', type: 'slider', min: -1, max: 1, step: 0.05, defaultValue: 0.2 },
      { key: 'autoBalance', label: 'Auto Balance', labelAr: 'توازن تلقائي', type: 'toggle', defaultValue: true },
      { key: 'removeHarshShadows', label: 'Remove Harsh Shadows', labelAr: 'إزالة الظلال الحادة', type: 'toggle', defaultValue: false },
    ],
  },
  {
    id: 'shadow-generation',
    name: 'Shadow Generation',
    nameAr: 'إضافة الظلال',
    description: 'إنشاء ظل واقعي يربط السيارة بالأرض',
    icon: null,
    category: 'enhancement',
    enabled: true,
    requiresSettings: true,
    defaultSettings: {
      intensity: 0.5,
      direction: 270,
      softness: 0.7,
      distance: 0.3,
      perspective: true,
      contactPoint: 'auto',
    },
    settingsSchema: [
      { key: 'intensity', label: 'Intensity', labelAr: 'الشدة', type: 'slider', min: 0, max: 1, step: 0.05, defaultValue: 0.5 },
      { key: 'direction', label: 'Direction', labelAr: 'الاتجاه', type: 'slider', min: 0, max: 360, step: 15, defaultValue: 270 },
      { key: 'softness', label: 'Softness', labelAr: 'النعومة', type: 'slider', min: 0, max: 1, step: 0.05, defaultValue: 0.7 },
      { key: 'distance', label: 'Distance', labelAr: 'المسافة', type: 'slider', min: 0, max: 1, step: 0.05, defaultValue: 0.3 },
      { key: 'perspective', label: 'Perspective', labelAr: 'المنظور', type: 'toggle', defaultValue: true },
      { key: 'contactPoint', label: 'Contact Point', labelAr: 'نقطة التماس', type: 'select', options: [
        { value: 'auto', label: 'Auto', labelAr: 'تلقائي' },
        { value: 'front', label: 'Front', labelAr: 'أمامي' },
        { value: 'rear', label: 'Rear', labelAr: 'خلفي' },
        { value: 'center', label: 'Center', labelAr: 'وسط' },
      ], defaultValue: 'auto' },
    ],
  },
  {
    id: 'centering-crop',
    name: 'Centering & Crop',
    nameAr: 'التوسيط والقص',
    description: 'توسيط السيارة، قص ذكي، تجهيز أبعاد متعددة',
    icon: null,
    category: 'composition',
    enabled: true,
    requiresSettings: true,
    defaultSettings: {
      mode: 'auto',
      aspectRatio: '4:3',
      padding: 0.1,
      centerOn: 'vehicle',
      outputSizes: ['1200x900', '1920x1080', '1080x1080', '1080x1350'],
      maintainResolution: true,
    },
    settingsSchema: [
      { key: 'mode', label: 'Mode', labelAr: 'الوضع', type: 'select', options: [
        { value: 'auto', label: 'Auto', labelAr: 'تلقائي' },
        { value: 'manual', label: 'Manual', labelAr: 'يدوي' },
        { value: 'batch', label: 'Batch Presets', labelAr: 'مسبقات دفعية' },
      ], defaultValue: 'auto' },
      { key: 'aspectRatio', label: 'Aspect Ratio', labelAr: 'نسبة العرض', type: 'select', options: [
        { value: '4:3', label: '4:3', labelAr: '4:3' },
        { value: '16:9', label: '16:9', labelAr: '16:9' },
        { value: '1:1', label: '1:1', labelAr: '1:1' },
        { value: '3:4', label: '3:4', labelAr: '3:4' },
        { value: 'custom', label: 'Custom', labelAr: 'مخصص' },
      ], defaultValue: '4:3' },
      { key: 'padding', label: 'Padding', labelAr: 'الحشو', type: 'slider', min: 0, max: 0.5, step: 0.02, defaultValue: 0.1 },
      { key: 'centerOn', label: 'Center On', labelAr: 'التوسيط على', type: 'select', options: [
        { value: 'vehicle', label: 'Vehicle', labelAr: 'السيارة' },
        { value: 'center', label: 'Image Center', labelAr: 'مركز الصورة' },
      ], defaultValue: 'vehicle' },
    ],
  },
  {
    id: 'image-enhancement',
    name: 'Image Enhancement',
    nameAr: 'تحسين الصورة',
    description: 'تحسين الوضوح، تقليل التشويش، تحسين الألوان والتفاصيل',
    icon: null,
    category: 'enhancement',
    enabled: true,
    requiresSettings: true,
    defaultSettings: {
      sharpen: 0.3,
      denoise: 0.2,
      clarity: 0.15,
      vibrance: 0.1,
      saturation: 0,
      hdr: false,
      preserveNaturalLook: true,
    },
    settingsSchema: [
      { key: 'sharpen', label: 'Sharpen', labelAr: 'التوضيح', type: 'slider', min: 0, max: 1, step: 0.05, defaultValue: 0.3 },
      { key: 'denoise', label: 'Denoise', labelAr: 'تقليل التشويش', type: 'slider', min: 0, max: 1, step: 0.05, defaultValue: 0.2 },
      { key: 'clarity', label: 'Clarity', labelAr: 'الوضوح', type: 'slider', min: 0, max: 1, step: 0.05, defaultValue: 0.15 },
      { key: 'vibrance', label: 'Vibrance', labelAr: 'الحيوية', type: 'slider', min: -1, max: 1, step: 0.05, defaultValue: 0.1 },
      { key: 'saturation', label: 'Saturation', labelAr: 'التشبع', type: 'slider', min: -1, max: 1, step: 0.05, defaultValue: 0 },
      { key: 'hdr', label: 'HDR Effect', labelAr: 'تأثير HDR', type: 'toggle', defaultValue: false },
      { key: 'preserveNaturalLook', label: 'Preserve Natural Look', labelAr: 'الحفاظ على المظهر الطبيعي', type: 'toggle', defaultValue: true },
    ],
  },
  {
    id: 'batch-unify',
    name: 'Batch Unify',
    nameAr: 'توحيد الدفعات',
    description: 'توحيد الخلفيات والإضاءة والأبعاد لمجموعة صور',
    icon: null,
    category: 'batch',
    enabled: true,
    requiresSettings: true,
    defaultSettings: {
      unifyBackground: true,
      unifyLighting: true,
      unifyDimensions: true,
      referenceImageId: '',
      backgroundSettings: {},
      lightingSettings: {},
      dimensionSettings: {},
    },
    settingsSchema: [
      { key: 'unifyBackground', label: 'Unify Background', labelAr: 'توحيد الخلفية', type: 'toggle', defaultValue: true },
      { key: 'unifyLighting', label: 'Unify Lighting', labelAr: 'توحيد الإضاءة', type: 'toggle', defaultValue: true },
      { key: 'unifyDimensions', label: 'Unify Dimensions', labelAr: 'توحيد الأبعاد', type: 'toggle', defaultValue: true },
      { key: 'referenceImageId', label: 'Reference Image', labelAr: 'صورة مرجعية', type: 'select', options: [], defaultValue: '' },
    ],
  },
];

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  // White backgrounds
  { id: 'white-pure', name: 'Pure White', nameAr: 'أبيض نقي', type: 'color', preview: '#ffffff', value: '#ffffff', category: 'white' },
  { id: 'white-soft', name: 'Soft White', nameAr: 'أبيض ناعم', type: 'color', preview: '#fafafa', value: '#fafafa', category: 'white' },
  { id: 'white-warm', name: 'Warm White', nameAr: 'أبيض دافئ', type: 'color', preview: '#fdfbf7', value: '#fdfbf7', category: 'white' },

  // Studio backgrounds
  { id: 'studio-gray', name: 'Studio Gray', nameAr: 'رمادي استوديو', type: 'color', preview: '#e5e5e5', value: '#e5e5e5', category: 'studio' },
  { id: 'studio-dark', name: 'Dark Studio', nameAr: 'استوديو داكن', type: 'color', preview: '#262626', value: '#262626', category: 'studio' },
  { id: 'studio-gradient', name: 'Studio Gradient', nameAr: 'تدرج استوديو', type: 'gradient', preview: 'linear-gradient(180deg, #f5f5f5 0%, #e5e5e5 100%)', value: 'linear-gradient(180deg, #f5f5f5 0%, #e5e5e5 100%)', category: 'studio' },

  // Outdoor backgrounds
  { id: 'outdoor-sunny', name: 'Sunny Street', nameAr: 'شارع مشمس', type: 'image', preview: '/backgrounds/outdoor-sunny.jpg', value: 'outdoor-sunny', category: 'outdoor' },
  { id: 'outdoor-parking', name: 'Parking Lot', nameAr: 'موقف سيارات', type: 'image', preview: '/backgrounds/outdoor-parking.jpg', value: 'outdoor-parking', category: 'outdoor' },
  { id: 'outdoor-showroom', name: 'Showroom', nameAr: 'صالة عرض', type: 'image', preview: '/backgrounds/outdoor-showroom.jpg', value: 'outdoor-showroom', category: 'outdoor' },
  { id: 'outdoor-city', name: 'City Street', nameAr: 'شارع مدينة', type: 'image', preview: '/backgrounds/outdoor-city.jpg', value: 'outdoor-city', category: 'outdoor' },
  { id: 'outdoor-sunset', name: 'Sunset Boulevard', nameAr: 'شارع الغروب', type: 'image', preview: '/backgrounds/outdoor-sunset.jpg', value: 'outdoor-sunset', category: 'outdoor' },

  // Ad-compatible backgrounds
  { id: 'ad-haraj', name: 'Haraj Compatible', nameAr: 'متوافق مع حراج', type: 'color', preview: '#ffffff', value: '#ffffff', category: 'ad-compatible' },
  { id: 'ad-sahib', name: 'Sahib Compatible', nameAr: 'متوافق مع صاحب', type: 'color', preview: '#f8f9fa', value: '#f8f9fa', category: 'ad-compatible' },
  { id: 'ad-facebook', name: 'Facebook Marketplace', nameAr: 'فيسبوك ماركت بليس', type: 'color', preview: '#ffffff', value: '#ffffff', category: 'ad-compatible' },
  { id: 'ad-instagram', name: 'Instagram Ready', nameAr: 'جاهز للإنستغرام', type: 'color', preview: '#fafafa', value: '#fafafa', category: 'ad-compatible' },
];