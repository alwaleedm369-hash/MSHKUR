import test from 'node:test';
import assert from 'node:assert/strict';
import { runVehicleBatch } from '../src/vehicleBatchPipeline.mjs';

test('batch executes sequentially and records per-image outcomes', async () => {
  const active = new Set(), order = [], progress = [];
  const items = [{id:'one'},{id:'two'},{id:'three'}];
  const result = await runVehicleBatch(items, async item => {
    assert.equal(active.size, 0, 'processing must remain sequential');
    active.add(item.id); order.push(item.id);
    await Promise.resolve();
    active.delete(item.id);
    if (item.id === 'two') throw new Error('decode failed');
    return {blob: new Blob(['ok']), review:{status:item.id==='one'?'passed':'needs-review'}};
  }, {onProgress:event => progress.push(event.status)});
  assert.deepEqual(order, ['one','two','three']);
  assert.deepEqual(result.results.map(x=>x.status), ['ready','failed','needs-review']);
  assert.equal(result.status, 'completed-with-errors');
  assert.equal(result.completed, 3);
  assert.ok(progress.includes('processing'));
});

test('batch rejects empty input and supports fail-fast mode', async () => {
  await assert.rejects(() => runVehicleBatch([], async () => ({})));
  const result = await runVehicleBatch([{id:'bad'},{id:'not-run'}], async () => { throw new Error('bad'); }, {stopOnError:true});
  assert.equal(result.completed, 1);
  assert.equal(result.results[0].status, 'failed');
});
