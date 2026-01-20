/**
 * Token Bucket Rate Limiter
 * Implements per-agent rate limiting with configurable limits
 */

interface TokenBucket {
  tokens: number;           // Current available tokens
  lastRefill: number;       // Timestamp of last refill (ms)
  capacity: number;         // Max tokens (requests per minute)
  refillRate: number;       // Tokens added per millisecond
}

// In-memory storage for token buckets (per agent)
// In production, this would use Cloudflare KV or Durable Objects
const buckets: Map<string, TokenBucket> = new Map();

const DEFAULT_RATE_LIMIT = 60; // 60 requests per minute

/**
 * Check if agent can make a request and consume a token
 * Returns true if allowed, false if rate limited
 */
export function checkRateLimit(agentId: string, limit?: number): boolean {
  const capacity = limit || DEFAULT_RATE_LIMIT;
  const refillRate = capacity / 60000; // tokens per millisecond

  const now = Date.now();

  // Get or create bucket for this agent
  let bucket = buckets.get(agentId);

  if (!bucket) {
    // New agent - create bucket with full capacity
    bucket = {
      tokens: capacity,
      lastRefill: now,
      capacity,
      refillRate,
    };
    buckets.set(agentId, bucket);
  }

  // Calculate tokens to add based on time elapsed
  const timeSinceLastRefill = now - bucket.lastRefill;
  const tokensToAdd = timeSinceLastRefill * bucket.refillRate;

  // Refill tokens (up to capacity)
  bucket.tokens = Math.min(bucket.capacity, bucket.tokens + tokensToAdd);
  bucket.lastRefill = now;

  // Update capacity if changed
  if (bucket.capacity !== capacity) {
    bucket.capacity = capacity;
    bucket.refillRate = refillRate;
  }

  // Check if we have tokens available
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1; // Consume one token
    return true;
  }

  // Rate limited
  return false;
}

/**
 * Get retry-after time in seconds for rate limited agent
 */
export function getRetryAfter(agentId: string, limit?: number): number {
  const capacity = limit || DEFAULT_RATE_LIMIT;
  const refillRate = capacity / 60000; // tokens per millisecond

  const bucket = buckets.get(agentId);
  if (!bucket) {
    return 0;
  }

  // Calculate time needed to get 1 token
  const tokensNeeded = 1 - bucket.tokens;
  const timeNeeded = tokensNeeded / refillRate;

  return Math.ceil(timeNeeded / 1000); // Convert to seconds
}

/**
 * Reset rate limit for an agent (useful for testing)
 */
export function resetRateLimit(agentId: string): void {
  buckets.delete(agentId);
}

/**
 * Get current rate limit status for an agent
 */
export function getRateLimitStatus(agentId: string, limit?: number): {
  remaining: number;
  resetAt: number;
  limit: number;
} {
  const capacity = limit || DEFAULT_RATE_LIMIT;
  const refillRate = capacity / 60000;

  const now = Date.now();
  const bucket = buckets.get(agentId);

  if (!bucket) {
    return {
      remaining: capacity,
      resetAt: now + 60000, // 1 minute from now
      limit: capacity,
    };
  }

  // Calculate current tokens
  const timeSinceLastRefill = now - bucket.lastRefill;
  const tokensToAdd = timeSinceLastRefill * bucket.refillRate;
  const currentTokens = Math.min(bucket.capacity, bucket.tokens + tokensToAdd);

  // Calculate when bucket will be full
  const tokensUntilFull = bucket.capacity - currentTokens;
  const timeUntilFull = tokensUntilFull / bucket.refillRate;
  const resetAt = now + timeUntilFull;

  return {
    remaining: Math.floor(currentTokens),
    resetAt: Math.floor(resetAt),
    limit: capacity,
  };
}
