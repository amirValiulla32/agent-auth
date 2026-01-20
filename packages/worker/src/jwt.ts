/**
 * JWT Token Management
 * Uses @tsndr/cloudflare-worker-jwt for secure token generation and verification
 */

import jwt from '@tsndr/cloudflare-worker-jwt';
import { generateId } from './utils';

// JWT secret - in production, this should be in Cloudflare environment variables
// For now, using a hardcoded secret (change in production via wrangler.toml)
const JWT_SECRET = 'super-secret-jwt-key-change-in-production-12345';

// Token expiration times
const ACCESS_TOKEN_EXPIRY = 60 * 60; // 1 hour in seconds
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

export interface TokenPayload {
  sub: string; // subject (agent_id)
  type: 'access' | 'refresh';
  iat: number; // issued at
  exp: number; // expiration
  jti: string; // JWT ID (unique token identifier)
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer';
}

/**
 * Generate access and refresh tokens for an agent
 */
export async function generateTokenPair(agentId: string): Promise<TokenPair> {
  const now = Math.floor(Date.now() / 1000);

  // Generate access token
  const accessTokenId = generateId();
  const accessToken = await jwt.sign(
    {
      sub: agentId,
      type: 'access',
      iat: now,
      exp: now + ACCESS_TOKEN_EXPIRY,
      jti: accessTokenId,
    },
    JWT_SECRET
  );

  // Generate refresh token
  const refreshTokenId = generateId();
  const refreshToken = await jwt.sign(
    {
      sub: agentId,
      type: 'refresh',
      iat: now,
      exp: now + REFRESH_TOKEN_EXPIRY,
      jti: refreshTokenId,
    },
    JWT_SECRET
  );

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: ACCESS_TOKEN_EXPIRY,
    token_type: 'Bearer',
  };
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const isValid = await jwt.verify(token, JWT_SECRET);
    if (!isValid) {
      return null;
    }

    const decoded = jwt.decode(token);
    return decoded.payload as TokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  // Expected format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Generate a new access token from a valid refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const payload = await verifyToken(refreshToken);

  if (!payload || payload.type !== 'refresh') {
    return null;
  }

  // Check if token is expired
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    return null;
  }

  // Generate new access token
  const accessTokenId = generateId();
  const accessToken = await jwt.sign(
    {
      sub: payload.sub,
      type: 'access',
      iat: now,
      exp: now + ACCESS_TOKEN_EXPIRY,
      jti: accessTokenId,
    },
    JWT_SECRET
  );

  return accessToken;
}
