import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8');

test('complete car-ad workflow is not restricted to guest sessions', () => {
  assert.match(app, /if\s*\(adWorkflowOpen\)\s*\{/);
  assert.doesNotMatch(app, /if\s*\(adWorkflowOpen\s*&&\s*!user\)/);
});
