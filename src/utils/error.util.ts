export class ApiError extends Error {
  public statusCode: number;
  public errorCode?: string;
  public isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    errorCode?: string,
    isOperational = true,
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request', errorCode?: string) {
    super(400, message, errorCode);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized', errorCode?: string) {
    super(401, message, errorCode);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden', errorCode?: string) {
    super(403, message, errorCode);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found', errorCode?: string) {
    super(404, message, errorCode);
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Conflict', errorCode?: string) {
    super(409, message, errorCode);
  }
}

export class UnprocessableEntityError extends ApiError {
  constructor(message = 'Unprocessable Entity', errorCode?: string) {
    super(422, message, errorCode);
  }
}

export class TooManyRequestsError extends ApiError {
  constructor(message = 'Too Many Requests', errorCode?: string) {
    super(429, message, errorCode);
  }
}

export class InternalServerError extends ApiError {
  constructor(message = 'Internal Server Error', errorCode?: string) {
    super(500, message, errorCode);
  }
}

export class ServiceUnavailableError extends ApiError {
  constructor(message = 'Service Unavailable', errorCode?: string) {
    super(503, message, errorCode);
  }
}
