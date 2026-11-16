import express from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function createApp({ serveWeb = process.env.NODE_ENV === 'production' } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet({ crossOriginEmbedderPolicy: false }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.set('Cache-Control', 'no-store');
    res.status(200).json({ status: 'ok', service: 'mshkur-api', version: '0.1.0' });
  });

  app.get('/api/readiness', (_req, res) => {
    const firebaseConfigured = Boolean(
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY,
    );
    res.set('Cache-Control', 'no-store');
    res.status(200).json({
      status: 'ready',
      capabilities: {
        api: true,
        firebaseAdmin: firebaseConfigured,
        persistentDatabase: false,
        googleOAuth: false,
        whatsapp: false,
      },
    });
  });

  if (serveWeb) {
    app.use(express.static(path.join(root, 'dist'), { index: false, maxAge: '1h' }));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(root, 'dist', 'index.html'));
    });
  }

  app.use((req, res) => res.status(404).json({ error: 'not_found', path: req.path }));
  app.use((error, _req, res, _next) => {
    const status = Number.isInteger(error.status) ? error.status : 500;
    res.status(status).json({ error: status >= 500 ? 'internal_error' : 'bad_request' });
  });
  return app;
}
