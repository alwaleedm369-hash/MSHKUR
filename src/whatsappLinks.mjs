/** Safe, dependency-free WhatsApp share-link helpers. No unofficial Web automation. */
export function normalizeWhatsAppNumber(value) {
  const digits = String(value ?? '').replace(/\\D/g, '');
  if (digits.length < 8 || digits.length > 15) {
    throw new TypeError('WhatsApp number must contain 8–15 digits in international format');
  }
  return digits;
}

export function buildWhatsAppShareUrl(text, phone) {
  const message = String(text ?? '').trim();
  if (!message) throw new TypeError('Share text is required');
  const base = phone
    ? 'https://wa.me/' + normalizeWhatsAppNumber(phone)
    : 'https://wa.me/';
  return base + '?text=' + encodeURIComponent(message);
}

export function validateWhatsAppChannelUrl(value) {
  let url;
  try { url = new URL(String(value ?? '').trim()); } catch { return null; }
  if (url.protocol !== 'https:' || !['whatsapp.com', 'www.whatsapp.com'].includes(url.hostname)) return null;
  if (!url.pathname.startsWith('/channel/')) return null;
  if (url.pathname.split('/').filter(Boolean).length !== 2) return null;
  return url.href;
}
