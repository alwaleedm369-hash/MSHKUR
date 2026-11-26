import 'dotenv/config';
import { createApp } from './app.mjs';
import { db } from './db.mjs';
import { recoverQueuedJobs } from './engine/maestro.mjs';

const port = Number(process.env.PORT || 4174);
const host = process.env.HOST || '0.0.0.0';
db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(new Date().toISOString());
const app = createApp();
const server = app.listen(port, host, () => {
  console.log(`MSHKUR API listening on http://${host}:${port}`);
  recoverQueuedJobs().catch(error => console.error('Job recovery failed:', error));
});

function shutdown(signal) {
  console.log(`Received ${signal}; closing HTTP server`);
  server.close(() => { db.close(); process.exit(0); });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
