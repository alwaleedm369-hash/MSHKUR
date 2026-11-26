/**
 * MSHKUR Skills System
 * نظام المهارات - تسجيل، تنفيذ، وتنسيق المهارات
 */

import { Skill, SkillSchema, ParameterSchema, ProcessingContext } from '@engines/MSHKURCore';

export interface SkillDefinition {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  category: string;
  version: string;
  author: string;
  license: string;
  tags: string[];
  inputSchema: SkillSchema['input'];
  outputSchema: SkillSchema['output'];
  handler: (input: unknown, context: ProcessingContext) => Promise<unknown>;
  validateInput: (input: unknown) => boolean;
  dependencies?: string[];
  permissions?: string[];
}

export interface SkillRegistry {
  register(skill: SkillDefinition): void;
  unregister(skillId: string): void;
  get(skillId: string): SkillDefinition | undefined;
  list(): SkillDefinition[];
  listByCategory(category: string): SkillDefinition[];
  execute(skillId: string, input: unknown, context: ProcessingContext): Promise<unknown>;
}

class SkillRegistryImpl implements SkillRegistry {
  private skills: Map<string, SkillDefinition> = new Map();
  private categories: Map<string, Set<string>> = new Map();

  register(skill: SkillDefinition): void {
    if (this.skills.has(skill.id)) {
      console.warn(`Skill ${skill.id} already registered, overwriting`);
    }

    this.skills.set(skill.id, skill);

    if (!this.categories.has(skill.category)) {
      this.categories.set(skill.category, new Set());
    }
    this.categories.get(skill.category)!.add(skill.id);
  }

  unregister(skillId: string): void {
    const skill = this.skills.get(skillId);
    if (skill) {
      this.skills.delete(skillId);
      this.categories.get(skill.category)?.delete(skillId);
    }
  }

  get(skillId: string): SkillDefinition | undefined {
    return this.skills.get(skillId);
  }

  list(): SkillDefinition[] {
    return Array.from(this.skills.values());
  }

  listByCategory(category: string): SkillDefinition[] {
    const ids = this.categories.get(category) || new Set();
    return Array.from(ids).map(id => this.skills.get(id)!).filter(Boolean);
  }

  async execute(skillId: string, input: unknown, context: ProcessingContext): Promise<unknown> {
    const skill = this.skills.get(skillId);
    if (!skill) {
      throw new Error(`Skill not found: ${skillId}`);
    }

    if (!skill.validateInput(input)) {
      throw new Error(`Invalid input for skill: ${skillId}`);
    }

    return await skill.handler(input, context);
  }
}

export const skillRegistry = new SkillRegistryImpl();

// Built-in skill definitions
export const builtInSkills: SkillDefinition[] = [
  {
    id: 'background-removal',
    name: 'Background Removal',
    nameAr: 'إزالة الخلفية',
    description: 'إزالة خلفية السيارة واستبدالها بخلفية احترافية باستخدام نماذج محسنة للسيارات',
    category: 'image-processing',
    version: '1.0.0',
    author: 'MSHKUR Team',
    license: 'MIT',
    tags: ['background', 'removal', 'car', 'segmentation', 'ai'],
    inputSchema: {
      imageData: { type: 'string', description: 'Base64 encoded image', required: true },
      settings: {
        type: 'object',
        description: 'Processing settings',
        required: false,
        properties: {
          model: { type: 'string', enum: ['fast', 'high-quality', 'car-optimized'], default: 'car-optimized' },
          edgeRefinement: { type: 'number', minimum: 0, maximum: 1, default: 0.85 },
          backgroundType: { type: 'string', enum: ['transparent', 'white', 'studio', 'outdoor', 'custom'], default: 'transparent' },
          backgroundValue: { type: 'string', default: '#ffffff' },
          preserveDetails: { type: 'boolean', default: true },
        },
      },
    },
    outputSchema: {
      processedImage: { type: 'string', description: 'Processed image as base64' },
      mask: { type: 'string', description: 'Alpha mask as base64' },
      metadata: { type: 'object', description: 'Processing metadata' },
    },
    handler: async (input: unknown) => {
      const { imageData, settings } = input as { imageData: string; settings: any };
      // In real implementation: call WebGPU/WASM model
      // For now, return mock result
      return {
        processedImage: imageData,
        mask: imageData,
        metadata: {
          model: settings?.model || 'car-optimized',
          processingTime: 1200,
          edgesRefined: settings?.edgeRefinement || 0.85,
        },
      };
    },
    validateInput: (input: unknown) => {
      return !!input && typeof input === 'object' && 'imageData' in (input as object);
    },
    permissions: ['image-processing'],
  },
  {
    id: 'license-plate-blur',
    name: 'License Plate Blur',
    nameAr: 'طمس اللوحة',
    description: 'كشف وإخفاء لوحة السيارة تلقائياً مع خيارات متعددة للطمس',
    category: 'image-processing',
    version: '1.0.0',
    author: 'MSHKUR Team',
    license: 'MIT',
    tags: ['license-plate', 'blur', 'privacy', 'detection', 'car'],
    inputSchema: {
      imageData: { type: 'string', description: 'Base64 encoded image', required: true },
      settings: {
        type: 'object',
        required: false,
        properties: {
          autoDetect: { type: 'boolean', default: true },
          blurIntensity: { type: 'number', minimum: 0.1, maximum: 1, default: 0.95 },
          blurType: { type: 'string', enum: ['pixelate', 'gaussian', 'solid'], default: 'pixelate' },
          customRegion: { type: 'object', properties: { x: { type: 'number' }, y: { type: 'number' }, width: { type: 'number' }, height: { type: 'number' } } },
        },
      },
    },
    outputSchema: {
      processedImage: { type: 'string' },
      platesDetected: { type: 'number' },
      regions: { type: 'array' },
    },
    handler: async (input: unknown) => {
      const { imageData, settings } = input as { imageData: string; settings: any };
      return {
        processedImage: imageData,
        platesDetected: 1,
        regions: [{ x: 100, y: 200, width: 300, height: 100 }],
        metadata: { blurType: settings?.blurType || 'pixelate', intensity: settings?.blurIntensity || 0.95 },
      };
    },
    validateInput: (input: unknown) => !!input && typeof input === 'object' && 'imageData' in (input as object),
    permissions: ['image-processing'],
  },
  {
    id: 'glass-tinting',
    name: 'Glass Tinting',
    nameAr: 'تضليل الزجاج',
    description: 'تظليل زجاج السيارة بذكاء مع الحفاظ على الواقعية والانعكاسات',
    category: 'image-processing',
    version: '1.0.0',
    author: 'MSHKUR Team',
    license: 'MIT',
    tags: ['glass', 'tint', 'window', 'car', 'enhancement'],
    inputSchema: {
      imageData: { type: 'string', required: true },
      settings: {
        type: 'object',
        required: false,
        properties: {
          tintLevel: { type: 'number', minimum: 0, maximum: 1, default: 0.6 },
          tintColor: { type: 'string', default: '#1a1a2e' },
          preserveReflections: { type: 'boolean', default: true },
          autoDetectGlass: { type: 'boolean', default: true },
        },
      },
    },
    outputSchema: { processedImage: { type: 'string' }, glassRegions: { type: 'array' } },
    handler: async (input: unknown) => {
      const { imageData, settings } = input as { imageData: string; settings: any };
      return { processedImage: imageData, glassRegions: [], metadata: { tintLevel: settings?.tintLevel || 0.6 } };
    },
    validateInput: (input: unknown) => !!input && typeof input === 'object' && 'imageData' in (input as object),
    permissions: ['image-processing'],
  },
  {
    id: 'lighting-enhancement',
    name: 'Lighting Enhancement',
    nameAr: 'تحسين الإضاءة',
    description: 'معادلة الإضاءة، تحسين التباين، إزالة الظلال غير المرغوبة',
    category: 'image-processing',
    version: '1.0.0',
    author: 'MSHKUR Team',
    license: 'MIT',
    tags: ['lighting', 'enhancement', 'exposure', 'contrast', 'shadows', 'highlights'],
    inputSchema: {
      imageData: { type: 'string', required: true },
      settings: {
        type: 'object',
        required: false,
        properties: {
          exposure: { type: 'number', minimum: -1, maximum: 1, default: 0 },
          contrast: { type: 'number', minimum: -1, maximum: 1, default: 0.1 },
          highlights: { type: 'number', minimum: -1, maximum: 1, default: -0.2 },
          shadows: { type: 'number', minimum: -1, maximum: 1, default: 0.2 },
          whites: { type: 'number', minimum: -1, maximum: 1, default: 0.1 },
          blacks: { type: 'number', minimum: -1, maximum: 1, default: -0.1 },
          autoBalance: { type: 'boolean', default: true },
          removeHarshShadows: { type: 'boolean', default: false },
        },
      },
    },
    outputSchema: { processedImage: { type: 'string' }, adjustments: { type: 'object' } },
    handler: async (input: unknown) => {
      const { imageData, settings } = input as { imageData: string; settings: any };
      return { processedImage: imageData, adjustments: settings, metadata: { autoBalanced: settings?.autoBalance } };
    },
    validateInput: (input: unknown) => !!input && typeof input === 'object' && 'imageData' in (input as object),
    permissions: ['image-processing'],
  },
  {
    id: 'shadow-generation',
    name: 'Shadow Generation',
    nameAr: 'إضافة الظلال',
    description: 'إنشاء ظل واقعي يربط السيارة بالأرض بمنظور صحيح',
    category: 'image-processing',
    version: '1.0.0',
    author: 'MSHKUR Team',
    license: 'MIT',
    tags: ['shadow', 'ground', 'contact', 'realistic', 'perspective'],
    inputSchema: {
      imageData: { type: 'string', required: true },
      settings: {
        type: 'object',
        required: false,
        properties: {
          intensity: { type: 'number', minimum: 0, maximum: 1, default: 0.5 },
          direction: { type: 'number', minimum: 0, maximum: 360, default: 270 },
          softness: { type: 'number', minimum: 0, maximum: 1, default: 0.7 },
          distance: { type: 'number', minimum: 0, maximum: 1, default: 0.3 },
          perspective: { type: 'boolean', default: true },
          contactPoint: { type: 'string', enum: ['auto', 'front', 'rear', 'center'], default: 'auto' },
        },
      },
    },
    outputSchema: { processedImage: { type: 'string' }, shadowMask: { type: 'string' } },
    handler: async (input: unknown) => {
      const { imageData, settings } = input as { imageData: string; settings: any };
      return { processedImage: imageData, shadowMask: imageData, metadata: { direction: settings?.direction || 270 } };
    },
    validateInput: (input: unknown) => !!input && typeof input === 'object' && 'imageData' in (input as object),
    permissions: ['image-processing'],
  },
  {
    id: 'centering-crop',
    name: 'Centering & Crop',
    nameAr: 'التوسيط والقص',
    description: 'توسيط السيارة، قص ذكي، تجهيز أبعاد متعددة للمنصات المختلفة',
    category: 'image-processing',
    version: '1.0.0',
    author: 'MSHKUR Team',
    license: 'MIT',
    tags: ['crop', 'centering', 'aspect-ratio', 'resize', 'platforms'],
    inputSchema: {
      imageData: { type: 'string', required: true },
      settings: {
        type: 'object',
        required: false,
        properties: {
          mode: { type: 'string', enum: ['auto', 'manual', 'batch'], default: 'auto' },
          aspectRatio: { type: 'string', enum: ['4:3', '16:9', '1:1', '3:4', 'custom'], default: '4:3' },
          padding: { type: 'number', minimum: 0, maximum: 0.5, default: 0.1 },
          centerOn: { type: 'string', enum: ['vehicle', 'center'], default: 'vehicle' },
          outputSizes: { type: 'array', items: { type: 'string' }, default: ['1200x900', '1920x1080', '1080x1080', '1080x1350'] },
          maintainResolution: { type: 'boolean', default: true },
        },
      },
    },
    outputSchema: { processedImages: { type: 'object' }, crops: { type: 'array' } },
    handler: async (input: unknown) => {
      const { imageData, settings } = input as { imageData: string; settings: any };
      return { processedImages: {}, crops: [], metadata: { mode: settings?.mode || 'auto' } };
    },
    validateInput: (input: unknown) => !!input && typeof input === 'object' && 'imageData' in (input as object),
    permissions: ['image-processing'],
  },
  {
    id: 'image-enhancement',
    name: 'Image Enhancement',
    nameAr: 'تحسين الصورة',
    description: 'تحسين الوضوح، تقليل التشويش، تحسين الألوان والتفاصيل',
    category: 'image-processing',
    version: '1.0.0',
    author: 'MSHKUR Team',
    license: 'MIT',
    tags: ['enhancement', 'sharpen', 'denoise', 'clarity', 'color', 'hdr'],
    inputSchema: {
      imageData: { type: 'string', required: true },
      settings: {
        type: 'object',
        required: false,
        properties: {
          sharpen: { type: 'number', minimum: 0, maximum: 1, default: 0.3 },
          denoise: { type: 'number', minimum: 0, maximum: 1, default: 0.2 },
          clarity: { type: 'number', minimum: 0, maximum: 1, default: 0.15 },
          vibrance: { type: 'number', minimum: -1, maximum: 1, default: 0.1 },
          saturation: { type: 'number', minimum: -1, maximum: 1, default: 0 },
          hdr: { type: 'boolean', default: false },
          preserveNaturalLook: { type: 'boolean', default: true },
        },
      },
    },
    outputSchema: { processedImage: { type: 'string' }, enhancements: { type: 'object' } },
    handler: async (input: unknown) => {
      const { imageData, settings } = input as { imageData: string; settings: any };
      return { processedImage: imageData, enhancements: settings, metadata: { hdr: settings?.hdr } };
    },
    validateInput: (input: unknown) => !!input && typeof input === 'object' && 'imageData' in (input as object),
    permissions: ['image-processing'],
  },
  {
    id: 'batch-unify',
    name: 'Batch Unify',
    nameAr: 'توحيد الدفعات',
    description: 'توحيد الخلفيات والإضاءة والأبعاد لمجموعة صور دفعة واحدة',
    category: 'image-processing',
    version: '1.0.0',
    author: 'MSHKUR Team',
    license: 'MIT',
    tags: ['batch', 'unify', 'multiple', 'consistency', 'workflow'],
    inputSchema: {
      images: { type: 'array', items: { type: 'string' }, required: true },
      settings: {
        type: 'object',
        required: false,
        properties: {
          unifyBackground: { type: 'boolean', default: true },
          unifyLighting: { type: 'boolean', default: true },
          unifyDimensions: { type: 'boolean', default: true },
          referenceImageIndex: { type: 'number', default: 0 },
        },
      },
    },
    outputSchema: { processedImages: { type: 'array' }, unified: { type: 'boolean' } },
    handler: async (input: unknown) => {
      const { images, settings } = input as { images: string[]; settings: any };
      return { processedImages: images, unified: true, metadata: { count: images.length } };
    },
    validateInput: (input: unknown) => !!input && typeof input === 'object' && 'images' in (input as object),
    permissions: ['image-processing'],
  },
  {
    id: 'ad-content-generation',
    name: 'Ad Content Generation',
    nameAr: 'توليد محتوى الإعلان',
    description: 'كتابة عنوان ووصف احترافي لإعلان السيارة بناءً على البيانات',
    category: 'content-generation',
    version: '1.0.0',
    author: 'MSHKUR Team',
    license: 'MIT',
    tags: ['ad', 'content', 'generation', 'ai', 'copywriting', 'marketing'],
    inputSchema: {
      vehicleData: {
        type: 'object',
        required: true,
        properties: {
          make: { type: 'string' }, model: { type: 'string' }, year: { type: 'number' },
          trim: { type: 'string' }, mileage: { type: 'number' }, price: { type: 'number' },
          color: { type: 'string' }, fuelType: { type: 'string' }, transmission: { type: 'string' },
          features: { type: 'array', items: { type: 'string' } }, description: { type: 'string' },
        },
      },
      options: {
        type: 'object',
        required: false,
        properties: {
          tone: { type: 'string', enum: ['professional', 'friendly', 'enthusiastic', 'luxury'], default: 'professional' },
          length: { type: 'string', enum: ['short', 'medium', 'long'], default: 'medium' },
          language: { type: 'string', enum: ['ar', 'en'], default: 'ar' },
          includePrice: { type: 'boolean', default: true },
          includeMileage: { type: 'boolean', default: true },
        },
      },
    },
    outputSchema: { title: { type: 'string' }, description: { type: 'string' }, tags: { type: 'array' }, variants: { type: 'array' } },
    handler: async (input: unknown) => {
      const { vehicleData, options } = input as { vehicleData: any; options: any };
      const make = vehicleData.make || '';
      const model = vehicleData.model || '';
      const year = vehicleData.year || '';
      const price = vehicleData.price ? `${vehicleData.price.toLocaleString()} ر.س` : '';
      const mileage = vehicleData.mileage ? `${vehicleData.mileage.toLocaleString()} كم` : '';

      return {
        title: `${year} ${make} ${model} ${vehicleData.trim || ''} - ${price}`.trim(),
        description: `سيارة ${make} ${model} موديل ${year} بحالة ممتازة. ${mileage}. ${vehicleData.description || ''}`,
        tags: ['سيارات', 'للبيع', make, model, String(year)].filter(Boolean),
        variants: [
          { tone: 'professional', title: `${year} ${make} ${model} - ${price}`, description: `عرض مميز لـ ${make} ${model} موديل ${year}` },
          { tone: 'enthusiastic', title: `🔥 ${make} ${model} ${year} - فرصة لا تفوت!`, description: `سيارة أحلامك بانتظارك! ${make} ${model} موديل ${year}` },
        ],
      };
    },
    validateInput: (input: unknown) => !!input && typeof input === 'object' && 'vehicleData' in (input as object),
    permissions: ['content-generation'],
  },
  {
    id: 'vehicle-data-extraction',
    name: 'Vehicle Data Extraction',
    nameAr: 'استخراج بيانات السيارة',
    description: 'استخراج بيانات السيارة من الصور أو النصوص أو المستندات',
    category: 'data-extraction',
    version: '1.0.0',
    author: 'MSHKUR Team',
    license: 'MIT',
    tags: ['extraction', 'vehicle', 'data', 'ocr', 'parsing', 'specs'],
    inputSchema: {
      source: { type: 'string', enum: ['image', 'text', 'document', 'vin'], required: true },
      data: { type: 'string', required: true },
      options: { type: 'object', required: false },
    },
    outputSchema: { make: { type: 'string' }, model: { type: 'string' }, year: { type: 'number' }, specs: { type: 'object' }, confidence: { type: 'number' } },
    handler: async (input: unknown) => {
      return { make: '', model: '', year: 0, specs: {}, confidence: 0 };
    },
    validateInput: (input: unknown) => !!input && typeof input === 'object' && 'source' in (input as object) && 'data' in (input as object),
    permissions: ['data-extraction'],
  },
  {
    id: 'template-rendering',
    name: 'Template Rendering',
    nameAr: 'عرض القوالب',
    description: 'عرض قوالب الإعلانات والمنشورات والقصص للمنصات المختلفة',
    category: 'rendering',
    version: '1.0.0',
    author: 'MSHKUR Team',
    license: 'MIT',
    tags: ['template', 'render', 'html', 'css', 'preview', 'platforms'],
    inputSchema: {
      templateId: { type: 'string', required: true },
      data: { type: 'object', required: true },
      platform: { type: 'string', enum: ['haraj', 'facebook', 'instagram', 'snapchat', 'twitter', 'web', 'print'], default: 'web' },
      options: { type: 'object', required: false },
    },
    outputSchema: { html: { type: 'string' }, css: { type: 'string' }, preview: { type: 'string' }, dimensions: { type: 'object' } },
    handler: async (input: unknown) => {
      return { html: '', css: '', preview: '', dimensions: {} };
    },
    validateInput: (input: unknown) => !!input && typeof input === 'object' && 'templateId' in (input as object) && 'data' in (input as object),
    permissions: ['rendering'],
  },
  {
    id: 'inventory-management',
    name: 'Inventory Management',
    nameAr: 'إدارة المخزون',
    description: 'إضافة وتحديث وتنظيم السيارات في مخزون المعرض',
    category: 'dealer-operations',
    version: '1.0.0',
    author: 'MSHKUR Team',
    license: 'MIT',
    tags: ['inventory', 'vehicle', 'dealer', 'stock', 'management', 'crud'],
    inputSchema: {
      action: { type: 'string', enum: ['create', 'read', 'update', 'delete', 'list', 'search'], required: true },
      vehicle: { type: 'object', required: false },
      filters: { type: 'object', required: false },
      pagination: { type: 'object', required: false },
    },
    outputSchema: { success: { type: 'boolean' }, vehicle: { type: 'object' }, vehicles: { type: 'array' }, total: { type: 'number' } },
    handler: async (input: unknown) => {
      return { success: true };
    },
    validateInput: (input: unknown) => !!input && typeof input === 'object' && 'action' in (input as object),
    permissions: ['dealer-operations'],
  },
  {
    id: 'customer-management',
    name: 'Customer Management',
    nameAr: 'إدارة العملاء',
    description: 'إدارة بيانات العملاء والاستفسارات والمتابعات',
    category: 'dealer-operations',
    version: '1.0.0',
    author: 'MSHKUR Team',
    license: 'MIT',
    tags: ['customer', 'crm', 'inquiries', 'follow-up', 'dealer'],
    inputSchema: {
      action: { type: 'string', enum: ['create', 'read', 'update', 'delete', 'list', 'search', 'add-inquiry', 'add-note'], required: true },
      customer: { type: 'object', required: false },
      inquiry: { type: 'object', required: false },
    },
    outputSchema: { success: { type: 'boolean' }, customer: { type: 'object' }, customers: { type: 'array' } },
    handler: async (input: unknown) => {
      return { success: true };
    },
    validateInput: (input: unknown) => !!input && typeof input === 'object' && 'action' in (input as object),
    permissions: ['dealer-operations'],
  },
  {
    id: 'marketing-automation',
    name: 'Marketing Automation',
    nameAr: 'أتمتة التسويق',
    description: 'إنشاء وجدولة الحملات التسويقية والمنشورات',
    category: 'marketing',
    version: '1.0.0',
    author: 'MSHKUR Team',
    license: 'MIT',
    tags: ['marketing', 'automation', 'campaign', 'schedule', 'social-media', 'posts'],
    inputSchema: {
      action: { type: 'string', enum: ['create-campaign', 'schedule-post', 'generate-content', 'analytics', 'export'], required: true },
      campaign: { type: 'object', required: false },
      post: { type: 'object', required: false },
      platforms: { type: 'array', items: { type: 'string' }, required: false },
    },
    outputSchema: { success: { type: 'boolean' }, campaignId: { type: 'string' }, posts: { type: 'array' }, analytics: { type: 'object' } },
    handler: async (input: unknown) => {
      return { success: true, campaignId: `campaign-${Date.now()}` };
    },
    validateInput: (input: unknown) => !!input && typeof input === 'object' && 'action' in (input as object),
    permissions: ['marketing'],
  },
];

// Register all built-in skills
builtInSkills.forEach(skill => skillRegistry.register(skill));

// Utility functions
export function getSkill(skillId: string): SkillDefinition | undefined {
  return skillRegistry.get(skillId);
}

export function listSkills(): SkillDefinition[] {
  return skillRegistry.list();
}

export function listSkillsByCategory(category: string): SkillDefinition[] {
  return skillRegistry.listByCategory(category);
}

export function getCategories(): string[] {
  return Array.from(new Set(skillRegistry.list().map(s => s.category)));
}

export async function executeSkill(skillId: string, input: unknown, context: ProcessingContext): Promise<unknown> {
  return skillRegistry.execute(skillId, input, context);
}

// Skill composition - combine multiple skills into a workflow
export interface SkillWorkflow {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  skillId: string;
  inputMapping: Record<string, string>; // Map workflow input to skill input
  outputMapping: Record<string, string>; // Map skill output to workflow output
  condition?: (context: WorkflowContext) => boolean;
}

export interface WorkflowContext {
  input: Record<string, unknown>;
  outputs: Record<string, unknown>;
  stepResults: Record<string, unknown>;
}

export async function executeWorkflow(workflow: SkillWorkflow, input: Record<string, unknown>, context: ProcessingContext): Promise<Record<string, unknown>> {
  const workflowContext: WorkflowContext = {
    input,
    outputs: {},
    stepResults: {},
  };

  for (const step of workflow.steps) {
    if (step.condition && !step.condition(workflowContext)) {
      continue;
    }

    // Build skill input from workflow input and previous outputs
    const skillInput: Record<string, unknown> = {};
    for (const [skillKey, workflowKey] of Object.entries(step.inputMapping)) {
      if (workflowKey in workflowContext.input) {
        skillInput[skillKey] = workflowContext.input[workflowKey];
      } else if (workflowKey in workflowContext.outputs) {
        skillInput[skillKey] = workflowContext.outputs[workflowKey];
      }
    }

    const result = await skillRegistry.execute(step.skillId, skillInput, context);
    workflowContext.stepResults[step.skillId] = result;

    // Map skill output to workflow output
    for (const [workflowKey, skillKey] of Object.entries(step.outputMapping)) {
      if (skillKey in (result as object)) {
        workflowContext.outputs[workflowKey] = (result as Record<string, unknown>)[skillKey];
      }
    }
  }

  return workflowContext.outputs;
}

// Pre-defined workflows
export const photoProcessingWorkflow: SkillWorkflow = {
  id: 'photo-processing-full',
  name: 'Full Photo Processing',
  nameAr: 'معالجة صور كاملة',
  description: 'إزالة الخلفية، طمس اللوحة، تحسين الإضاءة، إضافة ظل، توسيط',
  steps: [
    { skillId: 'background-removal', inputMapping: { imageData: 'imageData', settings: 'bgSettings' }, outputMapping: { processedImage: 'imageData' } },
    { skillId: 'license-plate-blur', inputMapping: { imageData: 'imageData', settings: 'plateSettings' }, outputMapping: { processedImage: 'imageData' } },
    { skillId: 'lighting-enhancement', inputMapping: { imageData: 'imageData', settings: 'lightingSettings' }, outputMapping: { processedImage: 'imageData' } },
    { skillId: 'shadow-generation', inputMapping: { imageData: 'imageData', settings: 'shadowSettings' }, outputMapping: { processedImage: 'imageData' } },
    { skillId: 'centering-crop', inputMapping: { imageData: 'imageData', settings: 'cropSettings' }, outputMapping: { processedImages: 'finalImages' } },
  ],
};

export const adCreationWorkflow: SkillWorkflow = {
  id: 'ad-creation-full',
  name: 'Full Ad Creation',
  nameAr: 'إنشاء إعلان كامل',
  description: 'استخراج بيانات السيارة، توليد المحتوى، عرض القالب',
  steps: [
    { skillId: 'vehicle-data-extraction', inputMapping: { source: 'source', data: 'sourceData' }, outputMapping: { make: 'vehicleData.make', model: 'vehicleData.model', year: 'vehicleData.year', specs: 'vehicleData.specs' } },
    { skillId: 'ad-content-generation', inputMapping: { vehicleData: 'vehicleData', options: 'contentOptions' }, outputMapping: { title: 'adTitle', description: 'adDescription', tags: 'adTags' } },
    { skillId: 'template-rendering', inputMapping: { templateId: 'templateId', data: 'adData', platform: 'platform' }, outputMapping: { html: 'adHtml', css: 'adCss', preview: 'adPreview' } },
  ],
};