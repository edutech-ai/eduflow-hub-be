import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '@/utils/error.util.js';
import { HTTP_STATUS } from '@/constants/http.constant.js';
import { envConfig } from '@/configs/env.config.js';
import logger from '@/configs/logger.config.js';

interface ErrorResponse {
  success: false;
  message: string;
  errorCode?: string;
  errors?: any;
  stack?: string;
}

export const errorHandler = (
  err: Error | ApiError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = 'Internal Server Error';
  let errorCode: string | undefined;
  let errors: any;

  // Handle ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.errorCode;
  }
  // Handle Zod validation errors
  else if (err instanceof ZodError) {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    message = 'Validation error';
    errorCode = 'VALIDATION_ERROR';
    errors = err.errors.map((error) => ({
      field: error.path.join('.'),
      message: error.message,
    }));
  }
  // Handle Mongoose validation errors
  else if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    message = 'Validation error';
    errorCode = 'VALIDATION_ERROR';
  }
  // Handle Mongoose duplicate key error
  else if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    message = 'Resource already exists';
    errorCode = 'DUPLICATE_KEY';
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Invalid token';
    errorCode = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Token expired';
    errorCode = 'TOKEN_EXPIRED';
  }

  // Log error
  logger.error(`${statusCode} - ${message}`, {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Prepare response
  const response: ErrorResponse = {
    success: false,
    message,
    errorCode,
    errors,
  };

  // Include stack trace in development
  if (envConfig.isDevelopment) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response, _next: NextFunction) => {
  const message = `Route ${req.originalUrl} not found`;
  logger.warn(message);
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message,
    errorCode: 'NOT_FOUND',
  });
};

export default errorHandler;
