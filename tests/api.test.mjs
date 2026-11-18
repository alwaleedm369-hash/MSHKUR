import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const temp = mkdtempSync(path.join(tmpdir(), 'mshkur-api-test-'));
process.env.MSHKUR_DB_PATH = path.join(temp, 'test.sqlite');
process.env.MSHKUR_STORAGE_DIR = path.join(temp, 'storage');
process.env.NODE_ENV = 'test';
process.env.APP_BASE_URL = 'http://mshkur.test';
const { createApp } = await import('../server/app.mjs');
const { db } = await import('../server/db.mjs');

test.after(() => {
  db.close();
  rmSync(temp, { recursive: true, force: true });
});

async function withServer(run) {
  const server = createApp({ serveWeb: false }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const address = server.address();
  try { await run(`http://127.0.0.1:${address.port}`); }
  finally { await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
}

test('GET /api/health returns a non-cached healthy response', async () => {
  await withServer(async base => {
    const response = await fetch(`${base}/api/health`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), { status: 'ok', service: 'mshkur-api', version: '0.2.0' });
  });
});

test('GET /api/readiness does not claim unconfigured integrations', async () => {
  await withServer(async base => {
    const response = await fetch(`${base}/api/readiness`);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.capabilities.api, true);
    assert.equal(body.capabilities.database, 'sqlite-connected');
    assert.equal(body.capabilities.googleOAuth, false);
    assert.equal(body.capabilities.whatsapp, false);
  });
});


test('derived vehicle assets require an authenticated tenant session', async () => {
  await withServer(async base => {
    const response = await fetch(`${base}/api/vehicles/example/assets/derived`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ fileId: 'not-a-file', processingStatus: 'optimized' })
    });
    assert.equal(response.status, 401);
  });
});


test('derived vehicle assets are saved and linked to an original asset', async () => {
  await withServer(async base => {
    const registration = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Test Owner', tenantName: 'Test Garage', email: `test-${randomUUID()}@example.com`, password: 'correct-horse-battery-staple' })
    });
    assert.equal(registration.status, 201);
    const cookie = registration.headers.get('set-cookie')?.split(';')[0];
    assert.ok(cookie);
    const headers = { 'content-type': 'application/json', cookie };
    const vehicleResponse = await fetch(`${base}/api/vehicles`, {
      method: 'POST', headers, body: JSON.stringify({ make: 'Toyota', model: 'Camry' })
    });
    assert.equal(vehicleResponse.status, 201);
    const vehicle = (await vehicleResponse.json()).vehicle;
    const imageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jXioAAAAASUVORK5CYII=';
    const originalResponse = await fetch(`${base}/api/vehicles/${vehicle.id}/assets`, {
      method: 'POST', headers, body: JSON.stringify({ imageBase64 })
    });
    assert.equal(originalResponse.status, 201);
    const original = (await originalResponse.json()).asset;
    const derivedResponse = await fetch(`${base}/api/vehicles/${vehicle.id}/assets/derived`, {
      method: 'POST', headers,
      body: JSON.stringify({ fileId: original.file_id, originalAssetId: original.id, processingStatus: 'optimized' })
    });
    assert.equal(derivedResponse.status, 201);
    const derived = (await derivedResponse.json()).asset;
    assert.equal(derived.asset_role, 'derived');
    assert.equal(derived.processing_status, 'optimized');
    assert.equal(derived.original_file_id, original.file_id);
  });
});

test('unknown API paths return structured 404', async () => {
  await withServer(async base => {
    const response = await fetch(`${base}/api/unknown`);
    assert.equal(response.status, 404);
    assert.equal((await response.json()).error, 'not_found');
  });
});
