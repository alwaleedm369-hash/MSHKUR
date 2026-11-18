import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('node_modules/@huggingface/transformers');
const replacements=[
  ['dist/transformers.js','webInitChain = webInitChain.then(load)','webInitChain = webInitChain.then(load, load)'],
  ['dist/transformers.js','webInferenceChain = webInferenceChain.then(run)','webInferenceChain = webInferenceChain.then(run, run)'],
  ['dist/transformers.web.js','webInitChain = webInitChain.then(load)','webInitChain = webInitChain.then(load, load)'],
  ['dist/transformers.web.js','webInferenceChain = webInferenceChain.then(run)','webInferenceChain = webInferenceChain.then(run, run)'],
  ['src/backends/onnx.js','webInitChain = webInitChain.then(load)','webInitChain = webInitChain.then(load, load)'],
  ['src/backends/onnx.js','webInferenceChain = webInferenceChain.then(run)','webInferenceChain = webInferenceChain.then(run, run)'],
];
for(const [relative,from,to] of replacements){
  const file=path.join(root,relative);
  if(!fs.existsSync(file)) throw new Error(`Expected Transformers.js patch target missing: ${relative}`);
  const source=fs.readFileSync(file,'utf8');
  if(source.includes(to)) continue;
  if(!source.includes(from)) throw new Error(`Transformers.js patch context changed in ${relative}; review upstream before continuing.`);
  fs.writeFileSync(file,source.replace(from,to));
}
console.log('Applied the pinned BG0 Transformers.js browser recovery patch.');
