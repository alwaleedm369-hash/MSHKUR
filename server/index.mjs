import 'dotenv/config';
import { createApp } from './app.mjs';

const port = Number(process.env.PORT || 4174);
const host = process.env.HOST || '0.0.0.0';
const app = createApp();
const server = app.listen(port, host, () => {
  console.log(`MSHKUR API listening on http://${host}:${port}`);
});

function shutdown(signal) {
  console.log(`Received ${signal}; closing HTTP server`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
