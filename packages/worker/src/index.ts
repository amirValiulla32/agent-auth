/**
 * OakAuth API Worker
 * AI Agent Permission & Audit Platform
 */

import { ErrorCode } from '@agent-auth/shared';
import { generateId, generateApiKey, hashApiKey, hashPassword, verifyPassword, safeCompare } from './utils';
import { seedTestData } from './seed';
import { createStorage, Storage } from './storage';
import { generateTokenPair, verifyToken, refreshAccessToken } from './jwt';
import { checkRateLimit, getRetryAfter, getRateLimitStatus } from './rate-limiter';

export interface Env {
  DB?: D1Database;
  JWT_SECRET?: string;
  ADMIN_API_KEY?: string;
  ENVIRONMENT?: string;
}

const ALLOWED_ORIGINS = [
  'https://oakauth.com',
  'https://www.oakauth.com',
  'http://localhost:3000',
];

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function json(data: any, status = 200, request?: Request): Response {
  const corsHeaders = request ? getCorsHeaders(request) : { 'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0], 'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' };
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

function getJwtSecret(env: Env): string {
  if (env.JWT_SECRET) return env.JWT_SECRET;
  if (env.ENVIRONMENT === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  return 'dev-secret-not-for-production';
}

/** Authenticate admin routes via JWT user token or superadmin key. Returns user_id or null (superadmin). */
async function authenticateAdmin(request: Request, env: Env, jwtSecret: string): Promise<{ userId: string | null } | Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return json({ error: 'Authorization required' }, 401, request);
  }

  const token = authHeader.slice(7);

  // Check superadmin key first
  if (env.ADMIN_API_KEY && safeCompare(token, env.ADMIN_API_KEY)) {
    return { userId: null }; // superadmin — no user scoping
  }

  // Try JWT user token
  const payload = await verifyToken(token, jwtSecret);
  if (!payload || payload.type !== 'access') {
    return json({ error: 'Invalid or expired token' }, 401, request);
  }

  return { userId: payload.sub };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: getCorsHeaders(request) });
    }

    const url = new URL(request.url);
    const storage = createStorage(env);
    const jwtSecret = getJwtSecret(env);

    // ==================== ROOT ====================

    if (url.pathname === '/' || url.pathname === '') {
      return json({
        name: 'OakAuth API',
        version: '0.1.0',
        status: 'running',
        docs: 'https://oakauth.com',
      }, 200, request);
    }

    // ==================== AUTH ENDPOINTS ====================

    if (url.pathname === '/auth/login' && request.method === 'POST') {
      try {
        const body = await request.json() as any;
        const { api_key } = body;

        if (!api_key) return json({ error: 'api_key is required' }, 400);

        // Hash the provided key and look up
        const keyHash = await hashApiKey(api_key);
        const agent = await storage.getAgentByApiKey(keyHash);
        if (!agent) return json({ error: 'Invalid API key' }, 401);
        if (!agent.enabled) return json({ error: 'Agent is disabled' }, 403);

        const tokens = await generateTokenPair(agent.id, jwtSecret);
        return json(tokens);
      } catch {
        return json({ error: 'Invalid request body' }, 400);
      }
    }

    if (url.pathname === '/auth/refresh' && request.method === 'POST') {
      try {
        const body = await request.json() as any;
        const { refresh_token } = body;

        if (!refresh_token) return json({ error: 'refresh_token is required' }, 400);

        const newAccessToken = await refreshAccessToken(refresh_token, jwtSecret);
        if (!newAccessToken) return json({ error: 'Invalid or expired refresh token' }, 401);

        return json({ access_token: newAccessToken, expires_in: 3600, token_type: 'Bearer' });
      } catch {
        return json({ error: 'Invalid request body' }, 400);
      }
    }

    if (url.pathname === '/auth/revoke' && request.method === 'POST') {
      try {
        const body = await request.json() as any;
        const { token } = body;

        if (!token) return json({ error: 'token is required' }, 400);

        const payload = await verifyToken(token, jwtSecret);
        if (!payload) return json({ error: 'Invalid token' }, 400);

        await storage.revokeToken(payload.jti);
        return json({ message: 'Token revoked successfully' });
      } catch {
        return json({ error: 'Invalid request body' }, 400);
      }
    }

    // POST /auth/signup
    if (url.pathname === '/auth/signup' && request.method === 'POST') {
      try {
        const body = await request.json() as any;
        const { email, password, name } = body;

        if (!email || !password || !name) return json({ error: 'email, password, and name are required' }, 400, request);
        if (password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400, request);

        const existing = await storage.getUserByEmail(email.toLowerCase().trim());
        if (existing) return json({ error: 'Email already registered' }, 409, request);

        const passwordHash = await hashPassword(password);
        const user = {
          id: generateId(),
          email: email.toLowerCase().trim(),
          password_hash: passwordHash,
          name: name.trim(),
          created_at: new Date().toISOString(),
        };

        await storage.createUser(user);
        const tokens = await generateTokenPair(user.id, jwtSecret);
        return json({ ...tokens, user: { id: user.id, email: user.email, name: user.name } }, 201, request);
      } catch {
        return json({ error: 'Invalid request body' }, 400, request);
      }
    }

    // POST /auth/user-login
    if (url.pathname === '/auth/user-login' && request.method === 'POST') {
      try {
        const body = await request.json() as any;
        const { email, password } = body;

        if (!email || !password) return json({ error: 'email and password are required' }, 400, request);

        const user = await storage.getUserByEmail(email.toLowerCase().trim());
        if (!user) return json({ error: 'Invalid email or password' }, 401, request);

        const valid = await verifyPassword(password, user.password_hash);
        if (!valid) return json({ error: 'Invalid email or password' }, 401, request);

        const tokens = await generateTokenPair(user.id, jwtSecret);
        return json({ ...tokens, user: { id: user.id, email: user.email, name: user.name } }, 200, request);
      } catch {
        return json({ error: 'Invalid request body' }, 400, request);
      }
    }

    // GET /auth/me
    if (url.pathname === '/auth/me' && request.method === 'GET') {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return json({ error: 'Authorization required' }, 401, request);
      }
      const payload = await verifyToken(authHeader.slice(7), jwtSecret);
      if (!payload) return json({ error: 'Invalid token' }, 401, request);

      const user = await storage.getUserById(payload.sub);
      if (!user) return json({ error: 'User not found' }, 404, request);
      return json({ id: user.id, email: user.email, name: user.name }, 200, request);
    }

    // ==================== ADMIN ENDPOINTS ====================

    if (url.pathname.startsWith('/admin/')) {
      const authResult = await authenticateAdmin(request, env, jwtSecret);
      if (authResult instanceof Response) return authResult;

      return handleAdmin(url, request, storage, authResult.userId);
    }

    // ==================== VALIDATION ENDPOINT ====================

    if (url.pathname === '/v1/validate' && request.method === 'POST') {
      return handleValidate(request, storage);
    }

    // ==================== 404 ====================

    return json({ error: 'Not found' }, 404, request);
  },
};

// ==================== ADMIN HANDLER ====================

async function handleAdmin(url: URL, request: Request, storage: Storage, userId: string | null): Promise<Response> {
  // POST /admin/seed — superadmin only
  if (url.pathname === '/admin/seed' && request.method === 'POST') {
    if (userId !== null) return json({ error: 'Superadmin only' }, 403);
    const result = await seedTestData(storage);
    return json({ message: 'Test data seeded successfully', agents: result.agents });
  }

  // GET /admin/stats
  if (url.pathname === '/admin/stats' && request.method === 'GET') {
    const stats = await storage.getStats(userId ?? undefined);
    return json(stats);
  }

  // GET /admin/logs
  if (url.pathname === '/admin/logs' && request.method === 'GET') {
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const agent_id = url.searchParams.get('agent_id') || undefined;
    const tool = url.searchParams.get('tool') || undefined;
    const scope = url.searchParams.get('scope') || undefined;
    const allowedParam = url.searchParams.get('allowed');
    const allowed = allowedParam === 'true' ? true : allowedParam === 'false' ? false : undefined;
    const search = url.searchParams.get('search') || undefined;
    const from_date = url.searchParams.get('from_date') ? parseInt(url.searchParams.get('from_date')!) : undefined;
    const to_date = url.searchParams.get('to_date') ? parseInt(url.searchParams.get('to_date')!) : undefined;

    const result = await storage.listLogs({ limit, offset, agent_id, user_id: userId ?? undefined, tool, scope, allowed, search, from_date, to_date });
    return json({ logs: result.logs, total: result.total, count: result.logs.length });
  }

  // --- Agents CRUD ---

  if (url.pathname === '/admin/agents' && request.method === 'GET') {
    const agents = await storage.listAgents(userId ?? undefined);
    return json({ agents, count: agents.length });
  }

  if (url.pathname === '/admin/agents' && request.method === 'POST') {
    try {
      const body = await request.json() as any;
      const { name, enabled = true } = body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return json({ error: 'Agent name is required' }, 400);
      }

      const plainKey = generateApiKey();
      const keyHash = await hashApiKey(plainKey);

      const agent = {
        id: generateId(),
        name: name.trim(),
        api_key: keyHash,
        enabled,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId ?? undefined,
      };

      await storage.createAgent(agent);

      // Return plaintext key ONCE - it's hashed in storage
      return json({
        id: agent.id,
        name: agent.name,
        api_key: plainKey,
        enabled: agent.enabled,
        created_at: agent.created_at,
        message: 'Save this API key - it cannot be retrieved again.',
      }, 201);
    } catch {
      return json({ error: 'Invalid request body' }, 400);
    }
  }

  // GET/PATCH/DELETE /admin/agents/:id
  const agentIdMatch = url.pathname.match(/^\/admin\/agents\/([^/]+)$/);
  if (agentIdMatch) {
    const agentId = agentIdMatch[1];

    if (request.method === 'GET') {
      const agent = await storage.getAgent(agentId);
      if (!agent) return json({ error: 'Agent not found' }, 404);
      // Don't return the hash
      return json({ ...agent, api_key: '***' });
    }

    if (request.method === 'PATCH') {
      try {
        const body = await request.json() as any;
        const updates: any = {};
        if (body.name !== undefined) {
          if (typeof body.name !== 'string' || body.name.trim().length === 0) return json({ error: 'Invalid agent name' }, 400);
          updates.name = body.name.trim();
        }
        if (body.enabled !== undefined) {
          if (typeof body.enabled !== 'boolean') return json({ error: 'Invalid enabled value' }, 400);
          updates.enabled = body.enabled;
        }
        if (body.rate_limit !== undefined) {
          updates.rate_limit = body.rate_limit;
        }

        const updated = await storage.updateAgent(agentId, updates);
        if (!updated) return json({ error: 'Agent not found' }, 404);
        return json({ ...updated, api_key: '***' });
      } catch {
        return json({ error: 'Invalid request body' }, 400);
      }
    }

    if (request.method === 'DELETE') {
      const agent = await storage.getAgent(agentId);
      if (!agent) return json({ error: 'Agent not found' }, 404);
      await storage.deleteAgent(agentId);
      return json({ message: 'Agent deleted successfully' });
    }
  }

  // POST /admin/agents/:id/regenerate-key
  const regenerateMatch = url.pathname.match(/^\/admin\/agents\/([^/]+)\/regenerate-key$/);
  if (regenerateMatch && request.method === 'POST') {
    const agentId = regenerateMatch[1];
    const plainKey = generateApiKey();
    const keyHash = await hashApiKey(plainKey);

    const updated = await storage.regenerateApiKey(agentId, keyHash);
    if (!updated) return json({ error: 'Agent not found' }, 404);

    return json({
      id: updated.id,
      name: updated.name,
      api_key: plainKey,
      message: 'Save this API key - it cannot be retrieved again.',
    });
  }

  // GET /admin/agents/:id/tools
  const agentToolsMatch = url.pathname.match(/^\/admin\/agents\/([^/]+)\/tools$/);
  if (agentToolsMatch && request.method === 'GET') {
    const agentId = agentToolsMatch[1];
    const agent = await storage.getAgent(agentId);
    if (!agent) return json({ error: 'Agent not found' }, 404);

    const tools = await storage.listToolsForAgent(agentId);
    return json({ tools, count: tools.length });
  }

  // GET /admin/agents/:id/rules
  const agentRulesMatch = url.pathname.match(/^\/admin\/agents\/([^/]+)\/rules$/);
  if (agentRulesMatch && request.method === 'GET') {
    const agentId = agentRulesMatch[1];
    const agent = await storage.getAgent(agentId);
    if (!agent) return json({ error: 'Agent not found' }, 404);

    const rules = await storage.listRulesForAgent(agentId);
    return json({ rules, count: rules.length });
  }

  // --- Tools CRUD ---

  if (url.pathname === '/admin/tools' && request.method === 'POST') {
    try {
      const body = await request.json() as any;
      const { agent_id, name, scopes, description } = body;

      if (!agent_id || !name || !scopes || !Array.isArray(scopes)) {
        return json({ error: 'agent_id, name, and scopes (array) are required' }, 400);
      }

      const agent = await storage.getAgent(agent_id);
      if (!agent) return json({ error: 'Agent not found' }, 404);

      const tool = {
        id: generateId(),
        agent_id,
        name: name.trim(),
        scopes: scopes.map((s: string) => s.trim()),
        description: description?.trim(),
        created_at: new Date().toISOString(),
      };

      await storage.createTool(tool);
      return json(tool, 201);
    } catch {
      return json({ error: 'Invalid request body' }, 400);
    }
  }

  // PUT /admin/tools/:id
  const toolUpdateMatch = url.pathname.match(/^\/admin\/tools\/([^/]+)$/);
  if (toolUpdateMatch && request.method === 'PUT') {
    const toolId = toolUpdateMatch[1];
    const tool = await storage.getTool(toolId);
    if (!tool) return json({ error: 'Tool not found' }, 404);

    try {
      const body = await request.json() as any;
      const updates: any = {};
      if (body.name !== undefined) updates.name = body.name.trim();
      if (body.scopes !== undefined) {
        if (!Array.isArray(body.scopes) || body.scopes.length === 0) return json({ error: 'At least one scope is required' }, 400);
        updates.scopes = body.scopes.map((s: string) => s.trim());
      }
      if (body.description !== undefined) updates.description = body.description?.trim() || undefined;

      const updated = await storage.updateTool(toolId, updates);
      return json(updated);
    } catch {
      return json({ error: 'Invalid request body' }, 400);
    }
  }

  // DELETE /admin/tools/:id
  if (toolUpdateMatch && request.method === 'DELETE') {
    const toolId = toolUpdateMatch[1];
    const tool = await storage.getTool(toolId);
    if (!tool) return json({ error: 'Tool not found' }, 404);

    await storage.deleteTool(toolId);
    return json({ message: 'Tool deleted successfully' });
  }

  // --- Rules CRUD ---

  if (url.pathname === '/admin/rules' && request.method === 'POST') {
    try {
      const body = await request.json() as any;
      const { agent_id, tool, scope } = body;

      if (!agent_id || !tool || !scope) {
        return json({ error: 'agent_id, tool, and scope are required' }, 400);
      }

      const agent = await storage.getAgent(agent_id);
      if (!agent) return json({ error: 'Agent not found' }, 404);

      const agentTools = await storage.listToolsForAgent(agent_id);
      const toolExists = agentTools.find(t => t.name === tool);
      if (!toolExists) return json({ error: `Tool '${tool}' not found for this agent` }, 400);
      if (!toolExists.scopes.includes(scope)) {
        return json({ error: `Scope '${scope}' not in tool '${tool}'. Available: ${toolExists.scopes.join(', ')}` }, 400);
      }

      const rule = {
        id: generateId(),
        agent_id,
        tool,
        scope,
        require_reasoning: body.require_reasoning || 'none',
        created_at: Date.now(),
      };

      await storage.createRule(rule);
      return json(rule, 201);
    } catch {
      return json({ error: 'Invalid request body' }, 400);
    }
  }

  // DELETE /admin/rules/:id
  const ruleIdMatch = url.pathname.match(/^\/admin\/rules\/([^/]+)$/);
  if (ruleIdMatch && request.method === 'DELETE') {
    const ruleId = ruleIdMatch[1];
    const rule = await storage.getRule(ruleId);
    if (!rule) return json({ error: 'Rule not found' }, 404);

    await storage.deleteRule(ruleId);
    return json({ message: 'Rule deleted successfully' });
  }

  return json({ error: 'Not found' }, 404);
}

// ==================== VALIDATE HANDLER ====================

async function handleValidate(request: Request, storage: Storage): Promise<Response> {
  try {
    // Authenticate via Bearer API key
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return json({ allowed: false, reason: 'Authorization required. Use: Authorization: Bearer <api_key>' }, 401, request);
    }

    const apiKey = authHeader.slice(7);
    if (!apiKey) {
      return json({ allowed: false, reason: 'Authorization required. Use: Authorization: Bearer <api_key>' }, 401, request);
    }

    const keyHash = await hashApiKey(apiKey);
    const agent = await storage.getAgentByApiKey(keyHash);
    if (!agent) {
      return json({ allowed: false, reason: 'Invalid API key' }, 401, request);
    }
    if (!agent.enabled) {
      return json({ allowed: false, reason: 'Agent is disabled' }, 403, request);
    }

    const agent_id = agent.id;

    const body = await request.json() as any;
    const { tool, scope, context, reasoning } = body;

    if (!tool || !scope) {
      return json({ allowed: false, reason: 'tool and scope are required' }, 400);
    }

    // Rate limit check
    const rateLimit = agent.rate_limit;
    if (!checkRateLimit(agent_id, rateLimit)) {
      const retryAfter = getRetryAfter(agent_id, rateLimit);
      const status = getRateLimitStatus(agent_id, rateLimit);
      return new Response(JSON.stringify({
        allowed: false,
        reason: 'Rate limit exceeded',
        retry_after: retryAfter,
        rate_limit: { limit: status.limit, remaining: 0, reset_at: status.resetAt },
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(request),
          'Retry-After': retryAfter.toString(),
        },
      });
    }

    // Check tool exists
    const agentTools = await storage.listToolsForAgent(agent_id);
    const toolExists = agentTools.find(t => t.name === tool);

    if (!toolExists) {
      await storage.createLog({
        id: generateId(), agent_id, tool, scope, allowed: false,
        deny_reason: `Tool '${tool}' not registered for this agent`,
        request_details: JSON.stringify(context || {}),
        reasoning, reasoning_required: 'none', reasoning_provided: !!reasoning, timestamp: Date.now(),
      });
      return json({ allowed: false, reason: `Tool '${tool}' not registered for this agent` });
    }

    // Check scope valid
    if (!toolExists.scopes.includes(scope)) {
      await storage.createLog({
        id: generateId(), agent_id, tool, scope, allowed: false,
        deny_reason: `Scope '${scope}' not valid for tool '${tool}'`,
        request_details: JSON.stringify(context || {}),
        reasoning, reasoning_required: 'none', reasoning_provided: !!reasoning, timestamp: Date.now(),
      });
      return json({ allowed: false, reason: `Scope '${scope}' not valid for tool '${tool}'. Available: ${toolExists.scopes.join(', ')}` });
    }

    // Get rules
    const rules = await storage.getRulesForAgent(agent_id, tool, scope);

    let allowed = false;
    let deny_reason: string | null = null;
    let reasoningRequired: 'none' | 'soft' | 'hard' = 'none';

    if (rules.length === 0) {
      allowed = false;
      deny_reason = `No permission rule exists for scope '${scope}' on tool '${tool}'`;
    } else {
      const rule = rules[0];
      reasoningRequired = rule.require_reasoning || 'none';

      if (reasoningRequired === 'hard' && !reasoning) {
        allowed = false;
        deny_reason = `This operation requires reasoning. Include 'reasoning' field explaining why you need to ${scope} ${tool}.`;
      } else {
        allowed = true;
        deny_reason = null;
      }
    }

    // Audit log
    await storage.createLog({
      id: generateId(), agent_id, tool, scope, allowed,
      deny_reason, request_details: JSON.stringify(context || {}),
      reasoning, reasoning_required: reasoningRequired, reasoning_provided: !!reasoning, timestamp: Date.now(),
    });

    const rateLimitStatus = getRateLimitStatus(agent_id, rateLimit);

    return new Response(JSON.stringify(allowed ? { allowed: true } : { allowed: false, reason: deny_reason }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(request),
        'X-RateLimit-Limit': rateLimitStatus.limit.toString(),
        'X-RateLimit-Remaining': rateLimitStatus.remaining.toString(),
        'X-RateLimit-Reset': rateLimitStatus.resetAt.toString(),
      },
    });
  } catch {
    return json({ allowed: false, reason: 'Invalid request' }, 400);
  }
}
