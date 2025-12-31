/**
 * Cloudflare Worker: AI Agent Permission & Observability Platform
 *
 * This worker acts as a proxy between AI agents and external APIs (starting with Google Calendar).
 * It provides centralized permission control and comprehensive audit logging.
 */

import { ErrorCode, ErrorResponse } from '@agent-auth/shared';
import { authenticateAgent } from './auth';
import { parseRequest } from './router';
import { PermissionEngine } from './permissions';
import { MockGoogleCalendarProxy } from './proxy';
import { AuditLogger } from './logger';
import { generateId } from './utils';
import { seedTestData } from './seed';
import { storage } from './storage';
import {
  AgentAuthError,
  PermissionDeniedError,
  InvalidRequestError,
  UpstreamError,
} from './errors';

export interface Env {
  // For local testing, these won't be used
  // In production, these would be D1Database and KVNamespace
  DB?: any;
  KV?: any;
  ENVIRONMENT?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const requestId = generateId();
    const startTime = Date.now();

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Agent-ID, X-Agent-Key, Authorization',
        },
      });
    }

    const url = new URL(request.url);

    // Admin endpoints (for testing)
    if (url.pathname === '/admin/seed' && request.method === 'POST') {
      await seedTestData();
      return new Response(JSON.stringify({ message: 'Test data seeded successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (url.pathname === '/admin/stats' && request.method === 'GET') {
      const stats = await storage.getStats();
      return new Response(JSON.stringify(stats), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (url.pathname === '/admin/logs' && request.method === 'GET') {
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const logs = await storage.listLogs(limit);
      return new Response(JSON.stringify({ logs, count: logs.length }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (url.pathname === '/admin/agents' && request.method === 'GET') {
      const agents = await storage.listAgents();
      return new Response(JSON.stringify({ agents, count: agents.length }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // POST /admin/agents - Create agent
    if (url.pathname === '/admin/agents' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { name, enabled = true } = body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
          return new Response(JSON.stringify({ error: 'Agent name is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }

        const agent = {
          id: generateId(),
          name: name.trim(),
          api_key: require('./utils').generateApiKey(),
          enabled,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await storage.createAgent(agent);
        return new Response(JSON.stringify(agent), {
          status: 201,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid request body' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
    }

    // GET /admin/agents/:id - Get single agent
    const agentIdMatch = url.pathname.match(/^\/admin\/agents\/([^/]+)$/);
    if (agentIdMatch && request.method === 'GET') {
      const agentId = agentIdMatch[1];
      const agent = await storage.getAgent(agentId);

      if (!agent) {
        return new Response(JSON.stringify({ error: 'Agent not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      return new Response(JSON.stringify(agent), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // PATCH /admin/agents/:id - Update agent
    if (agentIdMatch && request.method === 'PATCH') {
      const agentId = agentIdMatch[1];

      try {
        const body = await request.json();
        const { name, enabled } = body;

        const updates: any = {};
        if (name !== undefined) {
          if (typeof name !== 'string' || name.trim().length === 0) {
            return new Response(JSON.stringify({ error: 'Invalid agent name' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
          }
          updates.name = name.trim();
        }
        if (enabled !== undefined) {
          if (typeof enabled !== 'boolean') {
            return new Response(JSON.stringify({ error: 'Invalid enabled value' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
          }
          updates.enabled = enabled;
        }

        const updatedAgent = await storage.updateAgent(agentId, updates);

        if (!updatedAgent) {
          return new Response(JSON.stringify({ error: 'Agent not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }

        return new Response(JSON.stringify(updatedAgent), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid request body' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
    }

    // DELETE /admin/agents/:id - Delete agent
    if (agentIdMatch && request.method === 'DELETE') {
      const agentId = agentIdMatch[1];
      const agent = await storage.getAgent(agentId);

      if (!agent) {
        return new Response(JSON.stringify({ error: 'Agent not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      await storage.deleteAgent(agentId);
      return new Response(JSON.stringify({ message: 'Agent deleted successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // POST /admin/agents/:id/regenerate-key - Regenerate API key
    const regenerateMatch = url.pathname.match(/^\/admin\/agents\/([^/]+)\/regenerate-key$/);
    if (regenerateMatch && request.method === 'POST') {
      const agentId = regenerateMatch[1];
      const newApiKey = require('./utils').generateApiKey();

      const updatedAgent = await storage.regenerateApiKey(agentId, newApiKey);

      if (!updatedAgent) {
        return new Response(JSON.stringify({ error: 'Agent not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      return new Response(JSON.stringify(updatedAgent), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // GET /admin/agents/:id/tools - List tools for an agent
    const agentToolsMatch = url.pathname.match(/^\/admin\/agents\/([^/]+)\/tools$/);
    if (agentToolsMatch && request.method === 'GET') {
      const agentId = agentToolsMatch[1];

      // Check if agent exists
      const agent = await storage.getAgent(agentId);
      if (!agent) {
        return new Response(JSON.stringify({ error: 'Agent not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const tools = await storage.listToolsForAgent(agentId);
      return new Response(JSON.stringify({ tools, count: tools.length }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // GET /admin/agents/:id/rules - List rules for an agent
    const agentRulesMatch = url.pathname.match(/^\/admin\/agents\/([^/]+)\/rules$/);
    if (agentRulesMatch && request.method === 'GET') {
      const agentId = agentRulesMatch[1];

      // Check if agent exists
      const agent = await storage.getAgent(agentId);
      if (!agent) {
        return new Response(JSON.stringify({ error: 'Agent not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const rules = await storage.listRulesForAgent(agentId);
      return new Response(JSON.stringify({ rules, count: rules.length }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // POST /admin/tools - Create a new tool
    if (url.pathname === '/admin/tools' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { agent_id, name, actions, description } = body;

        // Validate required fields
        if (!agent_id || !name || !actions || !Array.isArray(actions)) {
          return new Response(JSON.stringify({ error: 'agent_id, name, and actions (array) are required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }

        // Check if agent exists
        const agent = await storage.getAgent(agent_id);
        if (!agent) {
          return new Response(JSON.stringify({ error: 'Agent not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }

        const tool = {
          id: generateId(),
          agent_id,
          name: name.trim(),
          actions: actions.map((a: string) => a.trim()),
          description: description?.trim(),
          created_at: new Date().toISOString(),
        };

        await storage.createTool(tool);
        return new Response(JSON.stringify(tool), {
          status: 201,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid request body' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
    }

    // DELETE /admin/tools/:id - Delete a tool
    const toolIdMatch = url.pathname.match(/^\/admin\/tools\/([^/]+)$/);
    if (toolIdMatch && request.method === 'DELETE') {
      const toolId = toolIdMatch[1];
      const tool = await storage.getTool(toolId);

      if (!tool) {
        return new Response(JSON.stringify({ error: 'Tool not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      await storage.deleteTool(toolId);
      return new Response(JSON.stringify({ message: 'Tool deleted successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // POST /admin/rules - Create a new rule
    if (url.pathname === '/admin/rules' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { agent_id, tool, action, conditions } = body;

        // Validate required fields
        if (!agent_id || !tool || !action) {
          return new Response(JSON.stringify({ error: 'agent_id, tool, and action are required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }

        // Check if agent exists
        const agent = await storage.getAgent(agent_id);
        if (!agent) {
          return new Response(JSON.stringify({ error: 'Agent not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }

        // Validate that the tool exists for this agent
        const agentTools = await storage.listToolsForAgent(agent_id);
        const toolExists = agentTools.find(t => t.name === tool);

        if (!toolExists) {
          return new Response(JSON.stringify({
            error: `Tool '${tool}' not found for this agent. Please create the tool first.`
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }

        // Validate that the action exists in the tool
        if (!toolExists.actions.includes(action)) {
          return new Response(JSON.stringify({
            error: `Action '${action}' not found in tool '${tool}'. Available actions: ${toolExists.actions.join(', ')}`
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }

        const rule = {
          id: generateId(),
          agent_id,
          tool,
          action,
          conditions: JSON.stringify(conditions || {}),
          created_at: Date.now(),
        };

        await storage.createRule(rule);
        return new Response(JSON.stringify(rule), {
          status: 201,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid request body' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
    }

    // DELETE /admin/rules/:id - Delete a rule
    const ruleIdMatch = url.pathname.match(/^\/admin\/rules\/([^/]+)$/);
    if (ruleIdMatch && request.method === 'DELETE') {
      const ruleId = ruleIdMatch[1];
      const rule = await storage.getRule(ruleId);

      if (!rule) {
        return new Response(JSON.stringify({ error: 'Rule not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      await storage.deleteRule(ruleId);
      return new Response(JSON.stringify({ message: 'Rule deleted successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // POST /v1/validate - Validate agent permission (NEW - Generic Platform)
    if (url.pathname === '/v1/validate' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { agent_id, tool, action, context } = body;

        // Validate required fields
        if (!agent_id || !tool || !action) {
          return new Response(JSON.stringify({
            allowed: false,
            reason: 'agent_id, tool, and action are required'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }

        // Check if agent exists and is enabled
        const agent = await storage.getAgent(agent_id);
        if (!agent) {
          return new Response(JSON.stringify({
            allowed: false,
            reason: 'Agent not found'
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }

        if (!agent.enabled) {
          return new Response(JSON.stringify({
            allowed: false,
            reason: 'Agent is disabled'
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }

        // Check if tool exists for this agent
        const agentTools = await storage.listToolsForAgent(agent_id);
        const toolExists = agentTools.find(t => t.name === tool);

        if (!toolExists) {
          return new Response(JSON.stringify({
            allowed: false,
            reason: `Tool '${tool}' not registered for this agent`
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }

        // Check if action is valid for this tool
        if (!toolExists.actions.includes(action)) {
          return new Response(JSON.stringify({
            allowed: false,
            reason: `Action '${action}' not valid for tool '${tool}'. Available: ${toolExists.actions.join(', ')}`
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }

        // Get rules for this agent/tool/action combination
        const rules = await storage.getRulesForAgent(agent_id, tool, action);

        // If no rules exist, default to ALLOW (permissive mode)
        if (rules.length === 0) {
          return new Response(JSON.stringify({
            allowed: true,
            reason: 'No rules defined, default allow'
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }

        // Evaluate rules (for now, we'll use simple logic - if ANY rule allows it, allow)
        // In the future, we can add more complex evaluation logic
        const allowingRule = rules.find(rule => {
          try {
            const conditions = JSON.parse(rule.conditions);
            // For now, just check if conditions is empty (meaning unconditional allow)
            return Object.keys(conditions).length === 0;
          } catch {
            return false;
          }
        });

        if (allowingRule) {
          return new Response(JSON.stringify({
            allowed: true
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }

        // Default to deny if rules exist but none explicitly allow
        return new Response(JSON.stringify({
          allowed: false,
          reason: 'No matching rules allow this action'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });

      } catch (error) {
        return new Response(JSON.stringify({
          allowed: false,
          reason: 'Invalid request'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
    }

    if (url.pathname === '/' || url.pathname === '') {
      return new Response(`Agent Auth Worker - Running!

Admin Endpoints:
  POST   /admin/seed - Seed test data
  GET    /admin/stats - View stats
  GET    /admin/logs - View audit logs
  GET    /admin/agents - List all agents
  POST   /admin/agents - Create agent
  GET    /admin/agents/:id - Get single agent
  PATCH  /admin/agents/:id - Update agent
  DELETE /admin/agents/:id - Delete agent
  POST   /admin/agents/:id/regenerate-key - Regenerate API key
  GET    /admin/agents/:id/tools - List tools for agent
  POST   /admin/tools - Create tool
  DELETE /admin/tools/:id - Delete tool
  GET    /admin/agents/:id/rules - List rules for agent
  POST   /admin/rules - Create rule
  DELETE /admin/rules/:id - Delete rule

Validation Endpoint (Generic Platform):
  POST   /v1/validate - Validate agent permission
         Body: { agent_id, tool, action, context? }
         Response: { allowed: boolean, reason?: string }

Proxy Endpoints (Legacy):
  POST   /v1/google-calendar/events - Create event (requires auth)
  PATCH  /v1/google-calendar/events/:id - Update event (requires auth)
  DELETE /v1/google-calendar/events/:id - Delete event (requires auth)
  GET    /v1/google-calendar/events - List events (requires auth)`, {
        status: 200,
        headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' },
      });
    }

    try {
      // 1. Parse request to determine tool and action
      const parsed = parseRequest(request);
      console.log(`[${requestId}] ${request.method} ${new URL(request.url).pathname} -> ${parsed.tool}:${parsed.action}`);

      // 2. Authenticate agent
      const agent = await authenticateAgent(request);
      console.log(`[${requestId}] Authenticated agent: ${agent.name} (${agent.id})`);

      // 3. Parse request body (if present)
      let requestBody: any = {};
      if (request.method !== 'GET' && request.method !== 'DELETE') {
        const contentType = request.headers.get('Content-Type');
        if (contentType?.includes('application/json')) {
          requestBody = await request.json();
        }
      }

      // 4. Evaluate permissions
      const permissionEngine = new PermissionEngine();
      const evaluation = await permissionEngine.evaluate({
        agent,
        tool: parsed.tool,
        action: parsed.action,
        requestBody,
        headers: request.headers,
      });

      // 5. Log the request (async - don't wait)
      const logger = new AuditLogger();
      const logPromise = logger.log({
        agentId: agent.id,
        tool: parsed.tool,
        action: parsed.action,
        allowed: evaluation.allowed,
        denyReason: evaluation.reason,
        requestDetails: {
          body: requestBody,
          eventId: parsed.eventId,
        },
        requestId,
      });

      // Wait for logging if we have ctx.waitUntil, otherwise just fire and forget
      if (ctx?.waitUntil) {
        ctx.waitUntil(logPromise);
      }

      // 6. If denied, return 403
      if (!evaluation.allowed) {
        throw new PermissionDeniedError(evaluation.reason!, evaluation.metadata);
      }

      // 7. Forward request to Google Calendar (mocked)
      const proxy = new MockGoogleCalendarProxy();
      let response: Response;

      switch (parsed.action) {
        case 'create_event':
          response = await proxy.createEvent(requestBody);
          break;
        case 'update_event':
          response = await proxy.updateEvent(parsed.eventId!, requestBody);
          break;
        case 'delete_event':
          response = await proxy.deleteEvent(parsed.eventId!);
          break;
        case 'list_events':
          response = await proxy.listEvents();
          break;
        default:
          throw new InvalidRequestError(`Unsupported action: ${parsed.action}`);
      }

      // 8. Add custom headers and return response
      const duration = Date.now() - startTime;
      console.log(`[${requestId}] Request completed in ${duration}ms`);

      const headers = new Headers(response.headers);
      headers.set('X-Worker-Time-Ms', String(duration));
      headers.set('X-Request-ID', requestId);
      headers.set('X-Agent-ID', agent.id);
      headers.set('Access-Control-Allow-Origin', '*');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (error) {
      // Error handling
      const duration = Date.now() - startTime;
      console.error(`[${requestId}] Error after ${duration}ms:`, error);

      let status = 500;
      let errorResponse: ErrorResponse;

      if (error instanceof AgentAuthError) {
        status = 401;
        errorResponse = {
          error: {
            code: error.code,
            message: error.message,
            requestId,
          },
        };
      } else if (error instanceof PermissionDeniedError) {
        status = 403;
        errorResponse = {
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
            requestId,
          },
        };
      } else if (error instanceof InvalidRequestError) {
        status = 400;
        errorResponse = {
          error: {
            code: error.code,
            message: error.message,
            requestId,
          },
        };
      } else if (error instanceof UpstreamError) {
        status = 502;
        errorResponse = {
          error: {
            code: error.code,
            message: error.message,
            requestId,
          },
        };
      } else {
        errorResponse = {
          error: {
            code: ErrorCode.INTERNAL_ERROR,
            message: 'An internal error occurred',
            requestId,
          },
        };
      }

      return new Response(JSON.stringify(errorResponse), {
        status,
        headers: {
          'Content-Type': 'application/json',
          'X-Worker-Time-Ms': String(duration),
          'X-Request-ID': requestId,
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
