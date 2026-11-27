import test from 'node:test';
import assert from 'node:assert/strict';
import { InMemorySmartGraphRepository, createCapabilityResolver } from '../src/shared/graph/smartGraph.mjs';

test('isolates private memory between users', () => {
  const graph = new InMemorySmartGraphRepository();
  graph.addNode({ id:'m1', type:'memory', label:'private note', scope:{visibility:'private',ownerId:'u1'} });
  assert.equal(graph.getNode('m1',{userId:'u2'}), undefined);
  assert.equal(graph.getNode('m1',{userId:'u1'}).label, 'private note');
  assert.equal(graph.listNodes({actor:{userId:'u2'}}).length, 0);
});

test('isolates workspace nodes and forbids cross-workspace edges', () => {
  const graph = new InMemorySmartGraphRepository();
  graph.addNode({id:'a',type:'task',scope:{visibility:'workspace',ownerId:'u1',workspaceId:'w1'}});
  graph.addNode({id:'b',type:'memory',scope:{visibility:'workspace',ownerId:'u1',workspaceId:'w2'}});
  assert.throws(() => graph.addEdge({id:'e',type:'REFERENCES',from:'a',to:'b'}), /Cross-workspace/);
});

test('requires valid typed nodes and edges', () => {
  const graph = new InMemorySmartGraphRepository();
  assert.throws(() => graph.addNode({id:'x',type:'unknown'}), /Unsupported node type/);
  graph.addNode({id:'x',type:'task',scope:{visibility:'workspace',ownerId:'u1',workspaceId:'w1'}});
  assert.throws(() => graph.addEdge({id:'e',type:'GRANTS_PERMISSION',from:'x',to:'x'}), /Unsupported edge type/);
});

test('traversal returns only actor-visible linked nodes', () => {
  const graph = new InMemorySmartGraphRepository();
  graph.addNode({id:'task',type:'task',scope:{visibility:'private',ownerId:'u1'}});
  graph.addNode({id:'skill',type:'skill',scope:{visibility:'system'}});
  graph.addEdge({id:'uses',type:'USES_SKILL',from:'task',to:'skill'});
  assert.equal(graph.related('task',{actor:{userId:'u2'}}).length,0);
  assert.equal(graph.related('task',{actor:{userId:'u1'}})[0].node.id,'skill');
});

test('graph relationship does not grant skill execution', async () => {
  const graph = new InMemorySmartGraphRepository();
  graph.addNode({id:'task',type:'task',scope:{visibility:'private',ownerId:'u1'}});
  graph.addNode({id:'legacy',type:'skill',scope:{visibility:'system'}});
  graph.addEdge({id:'uses',type:'USES_SKILL',from:'task',to:'legacy'});
  const resolve = createCapabilityResolver({graph,verifySkill:async id=>({verified:id==='trusted',enabled:id==='trusted'})});
  assert.deepEqual(await resolve('task',{userId:'u1'}),[]);
});

test('only authoritative verified and enabled skills are returned', async () => {
  const graph = new InMemorySmartGraphRepository();
  graph.addNode({id:'task',type:'task',scope:{visibility:'private',ownerId:'u1'}});
  graph.addNode({id:'trusted',type:'skill',scope:{visibility:'system'}});
  graph.addEdge({id:'uses',type:'USES_SKILL',from:'task',to:'trusted'});
  const resolve = createCapabilityResolver({graph,verifySkill:async()=>({verified:true,enabled:true})});
  assert.equal((await resolve('task',{userId:'u1'}))[0].skillId,'trusted');
});

test('removal deletes incident edges and snapshot respects scope', () => {
  const graph = new InMemorySmartGraphRepository();
  graph.addNode({id:'a',type:'memory',scope:{visibility:'private',ownerId:'u1'}});
  graph.addNode({id:'b',type:'source_document',scope:{visibility:'public'}});
  graph.addEdge({id:'e',type:'DERIVED_FROM',from:'a',to:'b'});
  assert.equal(graph.snapshot({userId:'u2'}).nodes.length,1);
  assert.equal(graph.snapshot({userId:'u2'}).edges.length,0);
  assert.equal(graph.removeNode('a',{userId:'u2'}),false);
  assert.equal(graph.removeNode('a',{userId:'u1'}),true);
  assert.deepEqual(graph.size,{nodes:1,edges:0});
});
