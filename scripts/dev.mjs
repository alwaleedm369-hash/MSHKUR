import { spawn } from 'node:child_process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const children = [
  spawn(npm, ['run', 'dev:web'], { stdio: 'inherit', env: process.env }),
  spawn(process.execPath, ['server/index.mjs'], { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'development' } }),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (!child.killed) child.kill('SIGTERM');
  process.exitCode = code;
}
for (const child of children) child.on('exit', (code) => { if (!stopping && code !== 0) stop(code || 1); });
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
