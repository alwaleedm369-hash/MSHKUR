import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveLocale, getDirection, translateText } from '../src/localeCore.mjs';

test('locale defaults to English and preserves Arabic selection', () => {
  assert.equal(resolveLocale(null), 'en');
  assert.equal(resolveLocale('en'), 'en');
  assert.equal(resolveLocale('ar'), 'ar');
  assert.equal(resolveLocale('unexpected'), 'en');
});

test('locale selection maps to the correct document direction', () => {
  assert.equal(getDirection('en'), 'ltr');
  assert.equal(getDirection('ar'), 'rtl');
});

test('English locale translates known navigation labels and Arabic mode restores source text', () => {
  const dictionary = {
    'الرئيسية': 'Home',
    'سيارة جديدة': 'New vehicle',
  };
  assert.equal(translateText('الرئيسية', 'en', dictionary), 'Home');
  assert.equal(translateText('سيارة جديدة', 'en', dictionary), 'New vehicle');
  assert.equal(translateText('الرئيسية', 'ar', dictionary), 'الرئيسية');
  assert.equal(translateText('Unknown state', 'en', dictionary), 'Unknown state');
});
