import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeWhatsAppNumber, buildWhatsAppShareUrl, validateWhatsAppChannelUrl } from '../src/whatsappLinks.mjs';

test('normalizes international phone number without changing digits', () => {
  assert.equal(normalizeWhatsAppNumber('+966 55 123 4567'), '966551234567');
});
test('rejects phone numbers outside E.164 length bounds', () => {
  assert.throws(() => normalizeWhatsAppNumber('12345'), /8–15/);
  assert.throws(() => normalizeWhatsAppNumber('1234567890123456'), /8–15/);
});
test('builds a click-to-chat URL with encoded Arabic text', () => {
  const url = new URL(buildWhatsAppShareUrl('إعلان السيارة جاهز', '+966551234567'));
  assert.equal(url.hostname, 'wa.me');
  assert.equal(url.pathname, '/966551234567');
  assert.equal(url.searchParams.get('text'), 'إعلان السيارة جاهز');
});
test('supports opening WhatsApp chat picker without a known phone', () => {
  const url = new URL(buildWhatsAppShareUrl('تم تجهيز الصور'));
  assert.equal(url.pathname, '/');
  assert.equal(url.searchParams.get('text'), 'تم تجهيز الصور');
});
test('accepts only official WhatsApp channel URLs', () => {
  assert.equal(validateWhatsAppChannelUrl('https://whatsapp.com/channel/AbCdEf123'), 'https://whatsapp.com/channel/AbCdEf123');
  assert.equal(validateWhatsAppChannelUrl('https://example.com/channel/AbCdEf123'), null);
  assert.equal(validateWhatsAppChannelUrl('javascript:alert(1)'), null);
  assert.equal(validateWhatsAppChannelUrl('https://whatsapp.com/channel/'), null);
});
