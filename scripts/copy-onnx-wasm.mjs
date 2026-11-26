import fs from 'node:fs';
import path from 'node:path';
const target = path.resolve('public/onnx');
fs.mkdirSync(target, { recursive: true });
const searchRoots = [
  path.resolve('node_modules/@huggingface/transformers/dist'),
  path.resolve('node_modules/onnxruntime-web/dist'),
  path.resolve('node_modules/@bg0/browser/node_modules/onnxruntime-web/dist'),
];
const copied = new Set();
for (const source of searchRoots) {
  if (!fs.existsSync(source)) continue;
  for (const name of fs.readdirSync(source)) {
    if (!name.startsWith('ort-wasm-') || !(/\.(wasm|mjs)$/.test(name)) || copied.has(name)) continue;
    fs.copyFileSync(path.join(source, name), path.join(target, name));
    copied.add(name);
  }
}
if (!copied.size) console.warn('WARN: No ONNX assets; browser BG0 may use CDN.');
else console.log(`Copied ${copied.size} ONNX assets to public/onnx.`);
