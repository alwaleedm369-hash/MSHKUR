/**
 * واتساب بدون Meta API مدفوع:
 * - روابط wa.me فقط (تفتح واتساب ويب أو التطبيق)
 * - مشاركة نص الإعلان + رابط المعرض
 * - لا قوالب رسمية ولا مزامنة رسائل Cloud API
 */

export type AdSharePayload = {
  make?: string;
  model?: string;
  year?: string | number;
  price?: string | number;
  city?: string;
  notes?: string;
  publicUrl?: string;
};

/** تطبيع رقم سعودي/دولي لأرقام فقط مع رمز الدولة */
export function normalizeWaNumber(raw: string, defaultCountry = '966'): string {
  let digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length === 10) digits = defaultCountry + digits.slice(1);
  if (digits.length === 9 && digits.startsWith('5')) digits = defaultCountry + digits;
  return digits;
}

export function buildCarAdMessage(p: AdSharePayload): string {
  const title = [p.year, p.make, p.model].filter(Boolean).join(' ') || 'سيارة';
  const lines = [
    `🚗 ${title}`,
    p.price ? `💰 السعر: ${p.price}` : '',
    p.city ? `📍 ${p.city}` : '',
    p.notes ? String(p.notes).trim() : '',
    p.publicUrl ? `🔗 ${p.publicUrl}` : '',
    '',
    'تم تجهيز الصور عبر مشكور MSHKUR',
  ].filter((x) => x !== '');
  return lines.join('\n');
}

/** رابط واتساب ويب/تطبيق — بدون API */
export function buildWaMeLink(phone: string, text: string): string {
  const n = normalizeWaNumber(phone);
  const q = encodeURIComponent(text);
  if (n) return `https://wa.me/${n}?text=${q}`;
  return `https://wa.me/?text=${q}`;
}

export function openWhatsAppShare(phone: string, text: string): void {
  const url = buildWaMeLink(phone, text);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/** حفظ رقم المعرض محلياً (هوية) — ليس OAuth Meta */
export const WA_NUMBER_KEY = 'mshkur_whatsapp_number';

export function getSavedWaNumber(): string {
  try {
    return localStorage.getItem(WA_NUMBER_KEY) || '';
  } catch {
    return '';
  }
}

export function saveWaNumber(raw: string): string {
  const n = normalizeWaNumber(raw);
  try {
    if (n) localStorage.setItem(WA_NUMBER_KEY, n);
    else localStorage.removeItem(WA_NUMBER_KEY);
  } catch {
    /* ignore */
  }
  return n;
}
