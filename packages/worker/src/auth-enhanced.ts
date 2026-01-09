/**
 * Enhanced Authentication
 * Supports both API Key and JWT authentication
 */

import { storage } from './storage';
import { verifyToken, extractTokenFromHeader } from './jwt';
import type { Agent } from '@agent-auth/shared';

export class AuthenticationError extends Error {
  constructor(message: string, public code: string = 'AUTH_FAILED') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authenticate request using either JWT or API key
 * Priority: JWT (Bearer token) > API Key (X-Agent-Key header)
 */
export async function authenticateRequest(request: Request): Promise<Agent> {
  const authHeader = request.headers.get('Authorization');
  const apiKeyHeader = request.headers.get('X-Agent-Key');

  // Try JWT authentication first (modern approach)
  if (authHeader) {
    const token = extractTokenFromHeader(authHeader);
    if (token) {
      return await authenticateWithJWT(token);
    }
  }

  // Fallback to API key authentication (legacy approach)
  if (apiKeyHeader) {
    return await authenticateWithApiKey(apiKeyHeader);
  }

  throw new AuthenticationError(
    'No authentication credentials provided. Use Authorization header with Bearer token or X-Agent-Key header.',
    'NO_CREDENTIALS'
  );
}

/**
 * Authenticate with JWT token
 */
async function authenticateWithJWT(token: string): Promise<Agent> {
  // Verify and decode token
  const payload = await verifyToken(token);
  if (!payload) {
    throw new AuthenticationError('Invalid or expired token', 'INVALID_TOKEN');
  }

  // Check if token is an access token
  if (payload.type !== 'access') {
    throw new AuthenticationError('Invalid token type. Use access token for API requests.', 'INVALID_TOKEN_TYPE');
  }

  // Check if token is revoked
  const isRevoked = await storage.isTokenRevoked(payload.jti);
  if (isRevoked) {
    throw new AuthenticationError('Token has been revoked', 'TOKEN_REVOKED');
  }

  // Get agent from database
  const agent = await storage.getAgent(payload.sub);
  if (!agent) {
    throw new AuthenticationError('Agent not found', 'AGENT_NOT_FOUND');
  }

  if (!agent.enabled) {
    throw new AuthenticationError('Agent is disabled', 'AGENT_DISABLED');
  }

  return agent;
}

/**
 * Authenticate with API key (legacy method)
 */
async function authenticateWithApiKey(apiKey: string): Promise<Agent> {
  if (!apiKey || typeof apiKey !== 'string') {
    throw new AuthenticationError('Invalid API key format', 'INVALID_API_KEY');
  }

  const agent = await storage.getAgentByApiKey(apiKey);
  if (!agent) {
    throw new AuthenticationError('Invalid API key', 'INVALID_API_KEY');
  }

  if (!agent.enabled) {
    throw new AuthenticationError('Agent is disabled', 'AGENT_DISABLED');
  }

  return agent;
}
