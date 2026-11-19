import test from 'node:test';
import assert from 'node:assert/strict';

function normalizeWaNumber(raw, defaultCountry = '966') {
  let digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length === 10) digits = defaultCountry + digits.slice(1);
  if (digits.length === 9 && digits.startsWith('5')) digits = defaultCountry + digits;
  return digits;
}
function buildWaMeLink(phone, text) {
  const n = normalizeWaNumber(phone);
  const q = encodeURIComponent(text);
  return n ? `https://wa.me/${n}?text=${q}` : `https://wa.me/?text=${q}`;
}

test('normalizes Saudi mobile numbers to 966', () => {
  assert.equal(normalizeWaNumber('0501234567'), '966501234567');
  assert.equal(normalizeWaNumber('501234567'), '966501234567');
  assert.equal(normalizeWaNumber('+966 50 123 4567'), '966501234567');
});

test('wa.me links never use Meta Graph API hosts', () => {
  const link = buildWaMeLink('0501234567', 'مرحبا سيارة للبيع');
  assert.match(link, /^https:\/\/wa\.me\/966501234567\?text=/);
  assert.equal(link.includes('graph.facebook.com'), false);
  assert.equal(link.includes('api.whatsapp.com'), false);
});

test('empty phone still builds share text link', () => {
  const link = buildWaMeLink('', 'نص');
  assert.equal(link.startsWith('https://wa.me/?text='), true);
});
