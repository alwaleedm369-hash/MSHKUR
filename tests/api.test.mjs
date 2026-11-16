import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/app.mjs';

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
    assert.deepEqual(await response.json(), { status: 'ok', service: 'mshkur-api', version: '0.1.0' });
  });
});

test('GET /api/readiness does not claim unconfigured integrations', async () => {
  await withServer(async base => {
    const response = await fetch(`${base}/api/readiness`);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.capabilities.api, true);
    assert.equal(body.capabilities.persistentDatabase, false);
    assert.equal(body.capabilities.googleOAuth, false);
    assert.equal(body.capabilities.whatsapp, false);
  });
});

test('unknown API paths return structured 404', async () => {
  await withServer(async base => {
    const response = await fetch(`${base}/api/unknown`);
    assert.equal(response.status, 404);
    assert.equal((await response.json()).error, 'not_found');
  });
});
