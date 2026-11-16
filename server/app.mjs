import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerRoutes } from './routes.mjs';
import { db } from './db.mjs';
import { getLocalModelStatus } from './engine/model-router.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function createApp({ serveWeb = process.env.NODE_ENV === 'production' } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet({ crossOriginEmbedderPolicy: false }));
  app.use(express.json({ limit: '20mb' }));
  app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false }));

  app.get('/api/health', (_req, res) => {
    res.set('Cache-Control', 'no-store');
    res.status(200).json({ status: 'ok', service: 'mshkur-api', version: '0.2.0' });
  });

  app.get('/api/readiness', (_req, res) => {
    res.set('Cache-Control', 'no-store');
    res.status(200).json({
      status: 'ready',
      capabilities: {
        api: true,
        database: db.open ? 'sqlite-connected' : 'unavailable',
        googleOAuth: false,
        googleMaps: false,
        whatsapp: false,
        localSkills: true,
        localModel: getLocalModelStatus().status,
      },
    });
  });

  registerRoutes(app);

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
    if (status >= 500) console.error('API error:', error);
    res.status(status).json({ error: status >= 500 ? 'internal_error' : 'bad_request' });
  });
  return app;
}
