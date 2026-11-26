import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '@utils/AppError';
import { logger } from '@utils/logger';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: Function
): void => {
  let error = err;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    error = new AppError(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code,
      }))
    );
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        error = new AppError(
          'A record with this value already exists',
          409,
          'DUPLICATE_ENTRY',
          { field: err.meta?.target }
        );
        break;
      case 'P2025':
        error = new AppError(
          'Record not found',
          404,
          'NOT_FOUND',
          { cause: err.meta?.cause }
        );
        break;
      case 'P2003':
        error = new AppError(
          'Foreign key constraint failed',
          400,
          'FOREIGN_KEY_ERROR',
          { field: err.meta?.field_name }
        );
        break;
      default:
        error = new AppError(
          'Database error',
          500,
          'DATABASE_ERROR',
          { code: err.code }
        );
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    error = new AppError(
      'Invalid data provided',
      400,
      'VALIDATION_ERROR',
      { message: err.message }
    );
  }

  // Handle Multer errors
  if (err.name === 'MulterError') {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        error = new AppError('File too large', 400, 'FILE_TOO_LARGE', { limit: '50MB' });
        break;
      case 'LIMIT_FILE_COUNT':
        error = new AppError('Too many files', 400, 'TOO_MANY_FILES', { limit: 20 });
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        error = new AppError('Unexpected file field', 400, 'UNEXPECTED_FILE_FIELD');
        break;
      default:
        error = new AppError('File upload error', 400, 'UPLOAD_ERROR', { code: err.code });
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401, 'TOKEN_EXPIRED');
  }

  // Log error
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const code = error instanceof AppError ? error.code : 'INTERNAL_SERVER_ERROR';
  const message = error.message;
  const details = error instanceof AppError ? error.details : undefined;

  // Log error with context
  logger.error(`${req.method} ${req.path} - ${statusCode} - ${code}: ${message}`, {
    error: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: (req as any).user?.id,
    details,
  });

  // Send response
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    },
  });
};

// Async wrapper to catch async errors
export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: Function) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Not found handler
export const notFoundHandler = (req: any, res: any, next: Function) => {
  const error = new AppError(
    `Route ${req.method} ${req.path} not found`,
    404,
    'NOT_FOUND'
  );
  next(error);
};

export default {
  errorHandler,
  asyncHandler,
  notFoundHandler,
};