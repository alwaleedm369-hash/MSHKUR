import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerRoutes } from './routes.mjs';
import { db } from './db.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp({ serveWeb = process.env.NODE_ENV === 'production' } = {}) {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));
  app.use(express.json({ limit: '12mb' }));
  app.use(express.urlencoded({ extended: false }));

  app.use((req, res, next) => {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
    const origin = req.get('origin');
    if (!origin) return next();
    try {
      const originUrl = new URL(origin);
      const appUrl = process.env.APP_BASE_URL ? new URL(process.env.APP_BASE_URL) : null;
      const sameAppOrigin = appUrl && originUrl.origin === appUrl.origin;
      const loopbackOrigin = ['127.0.0.1', 'localhost'].includes(originUrl.hostname);
      if (sameAppOrigin || loopbackOrigin) return next();
    } catch {
      return res.status(403).json({ error: 'foreign_origin', message: 'State-changing requests require a trusted browser origin.' });
    }
    return res.status(403).json({ error: 'foreign_origin', message: 'State-changing requests require a trusted browser origin.' });
  });

  if (process.env.NODE_ENV !== 'test') {
    app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: 'draft-8', legacyHeaders: false }));
    app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false }));
  }

  registerRoutes(app);

  app.get('/api/health', (_req, res) => {
    res.set('Cache-Control', 'no-store');
    return res.status(200).json({ status: 'ok', service: 'mshkur-api', version: '0.2.0' });
  });

  app.get('/api/readiness', (_req, res) => {
    let database = 'sqlite-unavailable';
    try {
      db.prepare('SELECT 1').get();
      database = 'sqlite-connected';
    } catch {}
    return res.status(200).json({
      status: 'ready',
      capabilities: {
        api: true,
        database,
        googleOAuth: false,
        whatsapp: false,
      },
    });
  });

  app.use('/api', (_req, res) => res.status(404).json({ error: 'not_found' }));

  if (serveWeb) {
    const dist = path.join(__dirname, '..', 'dist');
    app.use(express.static(dist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(dist, 'index.html'));
    });
  }

  return app;
}
