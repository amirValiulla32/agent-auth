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

    if (url.pathname === '/' || url.pathname === '') {
      return new Response('Agent Auth Worker - Running!\n\nEndpoints:\n  POST /admin/seed - Seed test data\n  GET /admin/stats - View stats\n  GET /admin/logs - View audit logs\n  GET /admin/agents - View agents\n  POST /v1/google-calendar/events - Create event (requires auth)', {
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
