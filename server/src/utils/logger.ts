import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { config } from '@config';

// Ensure log directory exists
const logDir = config.logDir;
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...metadata }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      log += ` ${JSON.stringify(metadata)}`;
    }
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  })
);

// Console format with colors
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
  winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let log = `${timestamp} ${level}: ${message}`;
    if (Object.keys(metadata).length > 0) {
      log += ` ${JSON.stringify(metadata)}`;
    }
    return log;
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: config.logLevel,
  format: logFormat,
  defaultMeta: { service: 'mshkur-api' },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(config.logDir, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
    }),
    // Combined logs
    new winston.transports.File({
      filename: path.join(config.logDir, 'combined.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
    }),
    // Debug logs (only in development)
    ...(process.env.NODE_ENV === 'development'
      ? [
          new winston.transports.File({
            filename: path.join(config.logDir, 'debug.log'),
            level: 'debug',
            maxsize: 10 * 1024 * 1024,
            maxFiles: 5,
          }),
        ]
      : []),
  ],
});

// Console transport for development
if (config.nodeEnv !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// Express logger middleware
export const expressLogger = (req: any, res: any, next: any) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id,
    };

    if (res.statusCode >= 400) {
      logger.warn(`${req.method} ${req.originalUrl} - ${res.statusCode}`, logData);
    } else {
      logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode}`, logData);
    }
  });

  next();
};

// Structured logging helpers
export const loggers = {
  auth: (action: string, data: any) => logger.info(`AUTH: ${action}`, data),
  api: (endpoint: string, data: any) => logger.info(`API: ${endpoint}`, data),
  db: (operation: string, data: any) => logger.debug(`DB: ${operation}`, data),
  queue: (job: string, data: any) => logger.info(`QUEUE: ${job}`, data),
  integration: (service: string, action: string, data: any) =>
    logger.info(`INTEGRATION: ${service} - ${action}`, data),
  ai: (model: string, action: string, data: any) =>
    logger.info(`AI: ${model} - ${action}`, data),
  upload: (filename: string, data: any) => logger.info(`UPLOAD: ${filename}`, data),
  error: (context: string, error: Error, data?: any) =>
    logger.error(`${context}: ${error.message}`, {
      stack: error.stack,
      ...data,
    }),
  performance: (operation: string, duration: number, data: any) =>
    logger.info(`PERF: ${operation} - ${duration}ms`, data),
  security: (event: string, data: any) => logger.warn(`SECURITY: ${event}`, data),
};

export default {
  logger,
  expressLogger,
  loggers,
};