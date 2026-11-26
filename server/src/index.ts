import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './config';
import { logger, expressLogger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { rateLimiter } from './middleware/rateLimiter';
import { setupSwagger } from './utils/swagger';
import { setupSocketIO } from './services/socket';
import { initializeServices } from './services';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import photoStudioRoutes from './routes/photoStudio';
import adStudioRoutes from './routes/adStudio';
import dealerPortalRoutes from './routes/dealerPortal';
import aiAssistantRoutes from './routes/aiAssistant';
import adminBrowserRoutes from './routes/adminBrowser';
import integrationRoutes from './routes/integrations';
import uploadRoutes from './routes/upload';
import webhookRoutes from './routes/webhooks';
import healthRoutes from './routes/health';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Trust proxy for rate limiting behind proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: ["'self'", 'ws:', 'wss:'],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", 'blob:'],
      frameSrc: ["'none'"],
    },
  },
}));

// CORS
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
app.use(expressLogger);

// Rate limiting
app.use(rateLimiter);

// Static files for uploads
app.use('/uploads', express.static(config.uploadDir));

// Health check (no auth required)
app.use(`${config.apiPrefix}/health`, healthRoutes);

// API Routes
app.use(`${config.apiPrefix}/auth`, authRoutes);
app.use(`${config.apiPrefix}/users`, authMiddleware, userRoutes);
app.use(`${config.apiPrefix}/photo-studio`, authMiddleware, photoStudioRoutes);
app.use(`${config.apiPrefix}/ad-studio`, authMiddleware, adStudioRoutes);
app.use(`${config.apiPrefix}/dealer-portal`, authMiddleware, dealerPortalRoutes);
app.use(`${config.apiPrefix}/ai-assistant`, authMiddleware, aiAssistantRoutes);
app.use(`${config.apiPrefix}/admin-browser`, authMiddleware, adminBrowserRoutes);
app.use(`${config.apiPrefix}/integrations`, authMiddleware, integrationRoutes);
app.use(`${config.apiPrefix}/upload`, authMiddleware, uploadRoutes);
app.use(`${config.apiPrefix}/webhooks`, webhookRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

// Global error handler
app.use(errorHandler);

// Setup Socket.IO
setupSocketIO(io);

// Initialize services
initializeServices();

// Start server
httpServer.listen(config.port, () => {
  logger.info(`🚀 MSHKUR API Server running on port ${config.port}`);
  logger.info(`📚 Environment: ${config.nodeEnv}`);
  logger.info(`📚 API Prefix: ${config.apiPrefix}`);
  logger.info(`📚 CORS Origin: ${config.corsOrigin}`);

  if (config.swaggerEnabled) {
    logger.info(`📚 Swagger UI: http://localhost:${config.port}/api/docs`);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export { app, io };
export default app;