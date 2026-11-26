/**
 * نصوص إعلان سيارات محسّنة — واتساب / حراج / ستوري
 * بدون مبالغة تسويقية؛ بيانات واضحة وثقة.
 */

export type AdCopyInput = {
  make?: string;
  model?: string;
  year?: string | number;
  price?: string | number;
  city?: string;
  mileage?: string | number;
  notes?: string;
  publicUrl?: string;
  dealerName?: string;
  tone?: 'whatsapp' | 'haraj' | 'story';
};

function formatPrice(price?: string | number): string {
  if (price === undefined || price === null || price === '') return '';
  const n = Number(String(price).replace(/[^\d.]/g, ''));
  if (!Number.isFinite(n) || n <= 0) return String(price);
  return new Intl.NumberFormat('ar-SA').format(n) + ' ر.س';
}

function formatMileage(m?: string | number): string {
  if (m === undefined || m === null || m === '') return '';
  const n = Number(String(m).replace(/[^\d]/g, ''));
  if (!Number.isFinite(n)) return String(m);
  return new Intl.NumberFormat('ar-SA').format(n) + ' كم';
}

function titleLine(p: AdCopyInput): string {
  const t = [p.make, p.model, p.year].filter(Boolean).join(' ');
  return t || 'سيارة للبيع';
}

/** نص واتساب — قصير وواضح للمشاركة السريعة */
export function buildWhatsAppAd(p: AdCopyInput): string {
  const lines = [
    titleLine(p),
    p.price ? `السعر: ${formatPrice(p.price)}` : '',
    p.mileage ? `الممشى: ${formatMileage(p.mileage)}` : '',
    p.city ? `الموقع: ${p.city}` : '',
    p.notes ? String(p.notes).trim() : '',
    '',
    p.dealerName ? `${p.dealerName}` : '',
    'للاستفسار أو المعاينة راسلنا هنا.',
    p.publicUrl || '',
  ].filter((x) => x !== '');
  return lines.join('\n');
}

/** نص حراج / مستعمل — أكثر تفصيلاً بدون إيموجي مزعج */
export function buildHarajAd(p: AdCopyInput): string {
  const lines = [
    titleLine(p),
    '',
    p.price ? `السعر: ${formatPrice(p.price)}` : 'السعر: للتفاوض عند المعاينة',
    p.mileage ? `الممشى: ${formatMileage(p.mileage)}` : '',
    p.city ? `المدينة: ${p.city}` : '',
    '',
    p.notes ? String(p.notes).trim() : 'الصور حديثة بعد تجهيز استوديو.',
    '',
    p.dealerName ? `المعامل / المعرض: ${p.dealerName}` : '',
    'المعاينة متاحة بعد الاتفاق. يُرجى التواصل الجاد فقط.',
    p.publicUrl || '',
  ].filter((x) => x !== '');
  return lines.join('\n');
}

/** سطر واحد لستوري / غلاف */
export function buildStoryHeadline(p: AdCopyInput): string {
  const price = formatPrice(p.price);
  const t = titleLine(p);
  if (price) return `${t} — ${price}`;
  return t;
}

/** يختار القالب حسب القناة */
export function buildAdCopy(p: AdCopyInput): string {
  const tone = p.tone || 'whatsapp';
  if (tone === 'haraj') return buildHarajAd(p);
  if (tone === 'story') return buildStoryHeadline(p);
  return buildWhatsAppAd(p);
}

/** اقتراحات ملاحظات قصيرة جاهزة */
export const NOTE_PRESETS = [
  'مالك أول · استخدام نظيف',
  'فحص دوري في الوكالة',
  'بدون حوادث · جاهزة للتسجيل',
  'استلم فوراً بعد الاتفاق',
  'الصور بعد إزالة الخلفية وتجهيز الاستوديو',
] as const;
