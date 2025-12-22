/**
 * Custom error classes
 */

import { ErrorCode } from '@agent-auth/shared';

export class AgentAuthError extends Error {
  code = ErrorCode.AGENT_AUTH_FAILED;
  constructor(message: string) {
    super(message);
    this.name = 'AgentAuthError';
  }
}

export class PermissionDeniedError extends Error {
  code = ErrorCode.PERMISSION_DENIED;
  details?: any;

  constructor(message: string, details?: any) {
    super(message);
    this.name = 'PermissionDeniedError';
    this.details = details;
  }
}

export class InvalidRequestError extends Error {
  code = ErrorCode.INVALID_REQUEST;
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRequestError';
  }
}

export class UpstreamError extends Error {
  code = ErrorCode.UPSTREAM_ERROR;
  constructor(message: string) {
    super(message);
    this.name = 'UpstreamError';
  }
}
