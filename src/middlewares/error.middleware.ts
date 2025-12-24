import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '@/utils/error.util.js';
import { HTTP_STATUS } from '@/constants/http.constant.js';
import logger from '@/configs/logger.config.js';

interface ErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}

export const errorHandler = (
  err: Error | ApiError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = 'Internal Server Error';
  let errors: string[] | undefined;

  // Handle ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Handle Zod validation errors
  else if (err instanceof ZodError) {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    message = 'Validation error';
    errors = err.errors.map((error) => error.message);
  }
  // Handle Mongoose validation errors
  else if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    message = 'Validation error';
    const mongooseErr = err as any;
    errors = Object.values(mongooseErr.errors || {}).map((e: any) => e.message);
  }
  // Handle Mongoose duplicate key error
  else if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    message = 'Resource already exists';
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Token expired';
  }

  // Log error with full details (server-side only)
  logger.error(`${statusCode} - ${message}`, {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Prepare minimal response (security best practice)
  const response: ErrorResponse = {
    success: false,
    message,
  };

  // Only include errors array if validation errors exist
  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response, _next: NextFunction) => {
  const message = `Route ${req.originalUrl} not found`;
  logger.warn(message);
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message,
  });
};

export default errorHandler;
