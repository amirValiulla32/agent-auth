/**
 * Request Router
 * Parses incoming requests to determine tool, action, and parameters
 */

import { ParsedRequest, TOOLS, ACTIONS } from '@agent-auth/shared';
import { InvalidRequestError } from './errors';

const ROUTE_PATTERNS = {
  CALENDAR_CREATE: /^\/v1\/google-calendar\/events$/,
  CALENDAR_UPDATE: /^\/v1\/google-calendar\/events\/([^/]+)$/,
  CALENDAR_DELETE: /^\/v1\/google-calendar\/events\/([^/]+)$/,
  CALENDAR_LIST: /^\/v1\/google-calendar\/events$/,
  CALENDAR_GET: /^\/v1\/google-calendar\/events\/([^/]+)$/,
};

export function parseRequest(request: Request): ParsedRequest {
  const url = new URL(request.url);
  const method = request.method;
  const pathname = url.pathname;

  // POST /events -> create_event
  if (method === 'POST' && ROUTE_PATTERNS.CALENDAR_CREATE.test(pathname)) {
    return {
      tool: TOOLS.GOOGLE_CALENDAR,
      action: ACTIONS.CREATE_EVENT,
    };
  }

  // PATCH /events/{id} -> update_event
  if (method === 'PATCH') {
    const match = pathname.match(ROUTE_PATTERNS.CALENDAR_UPDATE);
    if (match) {
      return {
        tool: TOOLS.GOOGLE_CALENDAR,
        action: ACTIONS.UPDATE_EVENT,
        eventId: match[1],
      };
    }
  }

  // DELETE /events/{id} -> delete_event
  if (method === 'DELETE') {
    const match = pathname.match(ROUTE_PATTERNS.CALENDAR_DELETE);
    if (match) {
      return {
        tool: TOOLS.GOOGLE_CALENDAR,
        action: ACTIONS.DELETE_EVENT,
        eventId: match[1],
      };
    }
  }

  // GET /events -> list_events
  // GET /events/{id} -> get_event (also treated as list for simplicity)
  if (method === 'GET' && pathname.includes('/google-calendar/events')) {
    return {
      tool: TOOLS.GOOGLE_CALENDAR,
      action: ACTIONS.LIST_EVENTS,
    };
  }

  throw new InvalidRequestError(`Unsupported route: ${method} ${pathname}`);
}
