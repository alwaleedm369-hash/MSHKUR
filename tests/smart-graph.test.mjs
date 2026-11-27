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

test('forbids private-to-workspace links across owners', () => {
  const graph = new InMemorySmartGraphRepository();
  graph.addNode({id:'private',type:'memory',scope:{visibility:'private',ownerId:'u1'}});
  graph.addNode({id:'workspace',type:'task',scope:{visibility:'workspace',ownerId:'u2',workspaceId:'w2'}});
  assert.throws(() => graph.addEdge({id:'cross',type:'REFERENCES',from:'private',to:'workspace'}), /Cross-user scoped/);
});
import test from 'node:test';
import assert from 'node:assert/strict';
import { InMemorySmartGraphRepository } from '../src/shared/graph/smartGraph.mjs';
import { indexCapabilityCatalog } from '../src/shared/graph/capabilityIndex.mjs';

test('projects skill, assistant and workflow catalogues into one graph', () => {
  const graph = new InMemorySmartGraphRepository();
  const report = indexCapabilityCatalog(graph, {
    skills: [{id:'removebackground',name:'Remove Background',version:'1.2',status:'verified',license:'MIT',permissions:['image-processing']}],
    assistants: [{id:'photo',nameAr:'مساعد الصور',canHandoff:true,skills:['removebackground','not-installed']}],
    workflows: [{id:'vehicle-photo',name:'Vehicle Photo',steps:[{id:'cutout',skillId:'removebackground'},{id:'missing',skillId:'not-installed'}]}],
  });
  assert.deepEqual({skills:report.skills,assistants:report.assistants,workflows:report.workflows,relationships:report.relationships},{skills:1,assistants:1,workflows:1,relationships:2});
  assert.equal(graph.related('assistant:photo',{actor:{userId:'__system__'},direction:'out'})[0].node.id,'skill:removebackground');
  assert.equal(graph.related('workflow:vehicle-photo',{actor:{userId:'__system__'},direction:'out'})[0].node.id,'skill:removebackground');
  assert.equal(report.unresolved.length,2);
});
