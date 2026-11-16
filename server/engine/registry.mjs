import sharp from 'sharp';
import { z } from 'zod';
import { readImageFile, storeImageBuffer } from '../storage.mjs';

const vehicleCopySchema = z.object({
  make: z.string().min(1).max(60), model: z.string().min(1).max(80),
  year: z.number().int().min(1950).max(2100).optional(),
  trim: z.string().max(80).optional(), mileage: z.number().nonnegative().optional(),
  fuel: z.string().max(40).optional(), transmission: z.string().max(40).optional(),
  color: z.string().max(40).optional(), city: z.string().max(60).optional(),
  price: z.number().nonnegative().optional(), notes: z.string().max(1000).optional(),
});
const optimizeSchema = z.object({ imageFileId: z.string().uuid(), maxWidth: z.number().int().min(320).max(4096).default(2048), quality: z.number().int().min(50).max(95).default(84) });
const plateBlurSchema = z.object({ imageFileId: z.string().uuid(), left: z.number().min(0).max(1), top: z.number().min(0).max(1), width: z.number().min(0.001).max(1), height: z.number().min(0.001).max(1) });
const vehicleValidateSchema = vehicleCopySchema.partial().extend({ make: z.string().optional(), model: z.string().optional() });

const handlers = {
  'vehicle-ad-copy': async input => {
    const v = vehicleCopySchema.parse(input);
    const title = [v.year, v.make, v.model, v.trim].filter(Boolean).join(' ');
    const facts = [
      v.mileage !== undefined ? `الممشى: ${new Intl.NumberFormat('ar-SA').format(v.mileage)} كم` : null,
      v.fuel ? `الوقود: ${v.fuel}` : null,
      v.transmission ? `ناقل الحركة: ${v.transmission}` : null,
      v.color ? `اللون: ${v.color}` : null,
      v.city ? `الموقع: ${v.city}` : null,
      v.price !== undefined ? `السعر: ${new Intl.NumberFormat('ar-SA').format(v.price)} ريال` : null,
      v.notes || null,
    ].filter(Boolean);
    return { title, description: [title, ...facts].join('\n'), source: 'user-provided-fields', generatedBy: 'deterministic-template', warnings: ['راجع الوصف والسعر قبل النشر. لم تتم إضافة مواصفات غير مدخلة.'] };
  },
  'vehicle-validate': async input => {
    const parsed = vehicleValidateSchema.parse(input);
    const missing = ['make','model','year','mileage','fuel','transmission','color','price','city'].filter(key => parsed[key] === undefined || parsed[key] === '');
    const warnings = [];
    if (parsed.year && (parsed.year < 1950 || parsed.year > new Date().getFullYear() + 1)) warnings.push('year_out_of_range');
    if (parsed.price !== undefined && parsed.price < 0) warnings.push('negative_price');
    return { normalized: parsed, missingFields: missing, warnings, readyForDraft: missing.length <= 3 };
  },
  'image-optimize': async (input, context) => {
    const v = optimizeSchema.parse(input);
    const {buffer:source,file:sourceFile} = readImageFile(v.imageFileId,context.tenantId);
    const image = sharp(source, { limitInputPixels: 40_000_000, failOn: 'error' }).rotate();
    const meta = await image.metadata();
    const output = await image.resize({ width: v.maxWidth, withoutEnlargement: true }).webp({ quality: v.quality, effort: 4 }).toBuffer();
    const stored = storeImageBuffer(output, 'image/webp', context);
    return { imageFileId:stored.id, originalFileId:sourceFile.id, original: { width: meta.width, height: meta.height, format: meta.format }, outputBytes: output.length, format: 'webp' };
  },
  'license-plate-blur-region': async (input, context) => {
    const v = plateBlurSchema.parse(input);
    const {buffer:source,file:sourceFile} = readImageFile(v.imageFileId,context.tenantId);
    const oriented = await sharp(source, { limitInputPixels: 40_000_000, failOn: 'error' }).rotate().png().toBuffer();
    const image = sharp(oriented, { limitInputPixels: 40_000_000, failOn: 'error' });
    const meta = await image.metadata();
    if (!meta.width || !meta.height) throw Object.assign(new Error('Invalid image metadata'), { code: 'invalid_image' });
    const left = Math.max(0, Math.min(meta.width - 1, Math.round(v.left * meta.width)));
    const top = Math.max(0, Math.min(meta.height - 1, Math.round(v.top * meta.height)));
    const width = Math.max(1, Math.min(meta.width - left, Math.round(v.width * meta.width)));
    const height = Math.max(1, Math.min(meta.height - top, Math.round(v.height * meta.height)));
    const blurred = await sharp(oriented).extract({ left, top, width, height }).blur(18).png().toBuffer();
    const output = await image.composite([{ input: blurred, left, top }]).png().toBuffer();
    const stored = storeImageBuffer(output, 'image/png', context);
    return { imageFileId:stored.id, originalFileId:sourceFile.id, region: { left, top, width, height }, note: 'تمويه منطقة يحددها المستخدم؛ لا يوجد كشف تلقائي للوحة في هذه المهارة.' };
  },
};

export const skillManifests = [
  { id:'vehicle-ad-copy', name:'كاتب إعلان السيارة', category:'cars', version:'1.0.0', description:'إنشاء مسودة إعلان من الحقول المدخلة فقط دون اختراع المواصفات.', input:'vehicle-copy', output:'ad-draft', permissions:['vehicle:read'], cost:'local' },
  { id:'vehicle-validate', name:'مدقق بيانات السيارة', category:'cars', version:'1.0.0', description:'فحص الحقول الناقصة والتعارضات الأساسية قبل تجهيز الإعلان.', input:'vehicle-record', output:'validation-report', permissions:['vehicle:read'], cost:'local' },
  { id:'image-optimize', name:'تحسين وضغط الصورة', category:'image', version:'1.0.0', description:'تصحيح الاتجاه وتحويل الصورة إلى WebP مع ضبط الحجم والجودة.', input:'image-file', output:'optimized-image', permissions:['image:process'], cost:'local' },
  { id:'license-plate-blur-region', name:'طمس منطقة اللوحة يدوياً', category:'image', version:'1.0.0', description:'تمويه منطقة مستطيلة يحددها المستخدم، دون ادعاء كشف تلقائي.', input:'image-file-region', output:'blurred-image', permissions:['image:process'], cost:'local' },
];
export async function executeSkill(skillId, input, context) {
  const handler = handlers[skillId];
  if (!handler) throw Object.assign(new Error('Skill is not installed or not executable'), { code: 'skill_unavailable' });
  return handler(input, context);
}
