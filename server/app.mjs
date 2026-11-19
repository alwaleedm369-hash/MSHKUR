import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerRoutes } from './routes.mjs';

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

  if (process.env.NODE_ENV !== 'test') {
    app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: 'draft-8', legacyHeaders: false }));
    app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false }));
  }

  registerRoutes(app);

  if (serveWeb) {
    const dist = path.join(__dirname, '..', 'dist');
    app.use(express.static(dist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(dist, 'index.html'));
    });
  }

  return app;
}
