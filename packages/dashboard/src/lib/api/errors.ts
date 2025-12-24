/**
 * Custom API Error Classes
 * Provides type-safe error handling for all API requests
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isValidationError(): boolean {
    return this.status === 422;
  }
}

/**
 * Convert any error to a user-friendly message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Authentication required';
    if (error.status === 403) return 'Permission denied';
    if (error.status === 404) return 'Resource not found';
    if (error.status === 422) return 'Validation error';
    if (error.status === 429) return 'Too many requests. Please try again later';
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}
