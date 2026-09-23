export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class ValidationError extends AppError {
  readonly fields?: { field: string; message: string }[];

  constructor(message: string, fields?: { field: string; message: string }[]) {
    super(message, 400, 'VALIDATION_ERROR');
    this.fields = fields;
  }
}

export class ProductNotFoundError extends AppError {
  constructor(productId: string) {
    super(`Product with id '${productId}' not found`, 404, 'PRODUCT_NOT_FOUND');
  }
}

export class DatabaseError extends AppError {
  cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message, 500, 'DATABASE_ERROR');
    this.cause = cause;
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(message, 401, 'AUTH_ERROR');
  }
}

export class RateLimitError extends AppError {
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super('Too many requests', 429, 'RATE_LIMIT_EXCEEDED');
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR');
  }
}
