import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const registry = JSON.parse(fs.readFileSync(path.join(root, 'skills/registry.json'), 'utf8'));

test('every skill has id, name, entrypoint and category', () => {
  assert.ok(Array.isArray(registry) && registry.length >= 5);
  for (const s of registry) {
    assert.ok(s.id, 'missing id');
    assert.ok(s.name, s.id);
    assert.ok(s.entrypoint, s.id);
    assert.ok(s.category, s.id);
  }
});

test('browser background-remove is marked browser runtime', () => {
  const bg = registry.find((s) => s.id === 'background-remove');
  assert.ok(bg);
  assert.equal(bg.runtime, 'browser');
  assert.match(bg.entrypoint, /browser|bg0/i);
});

test('car-studio-pipeline is browser and points at mshkur engine', () => {
  const p = registry.find((s) => s.id === 'car-studio-pipeline');
  assert.ok(p);
  assert.equal(p.runtime, 'browser');
  assert.match(String(p.entrypoint), /mshkurImageEngine|browser/);
});

test('license-plate-blur-region is server-executable builtin', () => {
  const p = registry.find((s) => s.id === 'license-plate-blur-region');
  assert.ok(p);
  assert.equal(p.entrypoint, 'builtin:license-plate-blur-region');
  assert.notEqual(p.runtime, 'browser');
});

test('no skill declares a paid external image API', () => {
  const banned = /remove\.bg|clipdrop|cloudinary.*ai|photoroom/i;
  for (const s of registry) {
    const blob = JSON.stringify(s);
    assert.equal(banned.test(blob), false, s.id);
  }
});
