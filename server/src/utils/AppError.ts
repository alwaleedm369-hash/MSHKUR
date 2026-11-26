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

  static badRequest(message: string, details?: any) {
    return new AppError(message, 400, 'BAD_REQUEST', details);
  }

  static unauthorized(message = 'Unauthorized', details?: any) {
    return new AppError(message, 401, 'UNAUTHORIZED', details);
  }

  static forbidden(message = 'Forbidden', details?: any) {
    return new AppError(message, 403, 'FORBIDDEN', details);
  }

  static notFound(message = 'Resource not found', details?: any) {
    return new AppError(message, 404, 'NOT_FOUND', details);
  }

  static conflict(message: string, details?: any) {
    return new AppError(message, 409, 'CONFLICT', details);
  }

  static internal(message = 'Internal server error', details?: any) {
    return new AppError(message, 500, 'INTERNAL_SERVER_ERROR', details);
  }

  static validation(details: any) {
    return new AppError('Validation failed', 400, 'VALIDATION_ERROR', details);
  }

  static tooManyRequests(message = 'Too many requests', details?: any) {
    return new AppError(message, 429, 'TOO_MANY_REQUESTS', details);
  }
}

export default AppError;