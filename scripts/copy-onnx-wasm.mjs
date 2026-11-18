import fs from 'node:fs';
import path from 'node:path';

const source=path.resolve('node_modules/@huggingface/transformers/dist');
const target=path.resolve('public/onnx');
if(!fs.existsSync(source))throw new Error('Transformers.js dist directory is missing; install dependencies first.');
const assets=fs.readdirSync(source).filter(name=>name.startsWith('ort-wasm-')&&(/\.wasm$/.test(name)||/\.mjs$/.test(name)));
if(!assets.length)throw new Error('No ONNX Runtime WebAssembly assets were found in Transformers.js.');
fs.mkdirSync(target,{recursive:true});
for(const name of assets)fs.copyFileSync(path.join(source,name),path.join(target,name));
console.log(`Copied ${assets.length} ONNX Runtime assets to public/onnx for self-hosted inference.`);
