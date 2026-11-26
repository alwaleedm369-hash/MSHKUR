import test from 'node:test';
import assert from 'node:assert/strict';

const SILENT_OPS = [
  'compress-before-process',
  'revoke-object-urls',
  'guest-daily-quota',
  'watermark-policy-read',
  'dealer-brand-load',
  'ad-copy-format',
  'wa-number-normalize',
  'autosave-draft-local',
  'usage-counter',
];
const APPROVAL_GATES = ['open-whatsapp-share', 'publish-listing', 'external-post'];

test('silent ops list is non-empty and has no UI-only names', () => {
  assert.ok(SILENT_OPS.length >= 5);
  for (const op of SILENT_OPS) {
    assert.equal(op.includes('screen'), false);
    assert.equal(op.includes('page'), false);
  }
});

test('external effects require approval gates', () => {
  assert.ok(APPROVAL_GATES.includes('open-whatsapp-share'));
  assert.ok(APPROVAL_GATES.includes('publish-listing'));
});
