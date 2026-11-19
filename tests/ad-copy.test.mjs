import test from 'node:test';
import assert from 'node:assert/strict';

function formatPrice(price) {
  if (price === undefined || price === null || price === '') return '';
  const n = Number(String(price).replace(/[^\d.]/g, ''));
  if (!Number.isFinite(n) || n <= 0) return String(price);
  return new Intl.NumberFormat('ar-SA').format(n) + ' ر.س';
}

function buildWhatsAppAd(p) {
  const title = [p.make, p.model, p.year].filter(Boolean).join(' ') || 'سيارة للبيع';
  return [
    title,
    p.price ? `السعر: ${formatPrice(p.price)}` : '',
    p.city ? `الموقع: ${p.city}` : '',
    'للاستفسار أو المعاينة راسلنا هنا.',
  ].filter(Boolean).join('\n');
}

test('formats Saudi price with Arabic numerals grouping', () => {
  const fp = formatPrice(85000);
  assert.ok(fp.includes('ر.س'));
  assert.ok(/[0-9٠-٩]/.test(fp));
});

test('whatsapp ad is concise and has no money emoji spam', () => {
  const t = buildWhatsAppAd({ make: 'تويوتا', model: 'كامري', year: 2022, price: 85000, city: 'جدة' });
  assert.match(t, /تويوتا كامري 2022/);
  assert.match(t, /السعر:/);
  assert.equal(t.includes('💰'), false);
  assert.match(t, /جدة/);
});
