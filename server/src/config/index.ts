import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: '/api/v1',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/mshkur',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'mshkur-super-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'mshkur-refresh-secret-change-in-production',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/v1/auth/google/callback',

  // GitHub OAuth
  githubClientId: process.env.GITHUB_CLIENT_ID || '',
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  githubRedirectUri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:3001/api/v1/auth/github/callback',

  // Google Gemini AI
  geminiApiKey: process.env.GEMINI_API_KEY || '',

  // Google Workspace
  googleWorkspaceClientId: process.env.GOOGLE_WORKSPACE_CLIENT_ID || '',
  googleWorkspaceClientSecret: process.env.GOOGLE_WORKSPACE_CLIENT_SECRET || '',
  googleWorkspaceRedirectUri: process.env.GOOGLE_WORKSPACE_REDIRECT_URI || 'http://localhost:3001/api/v1/auth/google-workspace/callback',

  // WhatsApp
  whatsappBridgeUrl: process.env.WHATSAPP_BRIDGE_URL || 'http://localhost:3002',
  whatsappSessionPath: process.env.WHATSAPP_SESSION_PATH || './whatsapp-session',

  // Haraj
  harajUsername: process.env.HARAJ_USERNAME || '',
  harajPassword: process.env.HARAJ_PASSWORD || '',

  // File Upload
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10), // 50MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],

  // Image Processing
  imageProcessingWorkerUrl: process.env.IMAGE_PROCESSING_WORKER_URL || 'http://localhost:3003',
  enableWebGPU: process.env.ENABLE_WEBGPU === 'true',

  // Push Notifications
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY || '',
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || '',
  vapidSubject: process.env.VAPID_SUBJECT || 'mailto:admin@mshkur.ai',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logDir: process.env.LOG_DIR || './logs',

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // Swagger
  swaggerEnabled: process.env.SWAGGER_ENABLED === 'true',
  swaggerPath: '/api/docs',

  // Frontend URL
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};

export default config;