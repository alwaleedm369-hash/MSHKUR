import test from 'node:test';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import { SqliteSmartGraphRepository } from '../server/graph-store.mjs';

test('SQLite graph persists nodes and edges across repository instances',()=>{
 const database=new Database(':memory:');
 const first=new SqliteSmartGraphRepository(database);
 first.addNode({id:'task',type:'task',scope:{visibility:'private',ownerId:'u1'}});
 first.addNode({id:'skill',type:'skill',scope:{visibility:'system'}});
 first.addEdge({id:'uses',type:'USES_SKILL',from:'task',to:'skill'});
 const second=new SqliteSmartGraphRepository(database);
 assert.equal(second.getNode('task',{userId:'u1'}).id,'task');
 assert.equal(second.related('task',{actor:{userId:'u1'},direction:'out'})[0].node.id,'skill');
 database.close();
});

test('SQLite graph enforces actor scope and cross-workspace isolation',()=>{
 const database=new Database(':memory:');
 const graph=new SqliteSmartGraphRepository(database);
 graph.addNode({id:'a',type:'memory',scope:{visibility:'workspace',ownerId:'u1',workspaceId:'w1'}});
 graph.addNode({id:'b',type:'memory',scope:{visibility:'workspace',ownerId:'u1',workspaceId:'w2'}});
 assert.equal(graph.getNode('a',{userId:'u1',workspaceId:'w2'}),undefined);
 assert.throws(()=>graph.addEdge({id:'bad',type:'REFERENCES',from:'a',to:'b'}),/Cross-workspace/);
 database.close();
});

test('SQLite graph cascades edge cleanup and scopes exports',()=>{
 const database=new Database(':memory:');
 const graph=new SqliteSmartGraphRepository(database);
 graph.addNode({id:'secret',type:'memory',scope:{visibility:'private',ownerId:'u1'}});
 graph.addNode({id:'public',type:'source_document',scope:{visibility:'public'}});
 graph.addEdge({id:'ref',type:'REFERENCES',from:'secret',to:'public'});
 assert.deepEqual(graph.snapshot({userId:'u2'}).nodes.map(n=>n.id),['public']);
 assert.equal(graph.removeNode('secret',{userId:'u2'}),false);
 assert.equal(graph.removeNode('secret',{userId:'u1'}),true);
 assert.equal(graph.snapshot({userId:'u1'}).edges.length,0);
 database.close();
});
