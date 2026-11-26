import rateLimit from 'express-rate-limit';
import { config } from '@config';
import { RedisStore } from 'rate-limit-redis';
import { createClient } from 'redis';

let redisClient: any = null;

const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = createClient({ url: config.redisUrl });
    redisClient.on('error', (err: Error) => console.error('Redis Client Error', err));
    await redisClient.connect();
  }
  return redisClient;
};

export const rateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || 'unknown',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil(config.rateLimitWindowMs / 1000),
      },
    });
  },
});

// Stricter rate limiter for auth endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for upload endpoints
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: {
    success: false,
    error: {
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
      message: 'Upload limit exceeded, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// API rate limiter for external integrations
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: {
    success: false,
    error: {
      code: 'API_RATE_LIMIT_EXCEEDED',
      message: 'API rate limit exceeded',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Redis-based rate limiter for distributed systems
export const createRedisRateLimiter = async (options: {
  windowMs: number;
  max: number;
  keyPrefix?: string;
}) => {
  const redis = await getRedisClient();
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    store: new RedisStore({
      sendCommand: (...args: string[]) => redis.sendCommand(args),
      prefix: options.keyPrefix || 'rl:',
    }),
    keyGenerator: (req) => `${options.keyPrefix || 'rl'}:${req.ip}`,
    standardHeaders: true,
    legacyHeaders: false,
  });
};