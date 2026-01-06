// Agent types
export interface Agent {
  id: string;
  name: string;
  api_key: string;
  created_at: string;  // ISO date string
  updated_at?: string; // ISO date string, optional
  enabled: boolean;
}

// Tool types (NEW - for generic platform)
export interface Tool {
  id: string;
  agent_id: string;
  name: string;           // Customer-defined: "crm", "patient_records", etc.
  scopes: string[];       // Customer-defined scopes: ["read:contacts", "write:deals"], etc.
  description?: string;   // Optional description
  created_at: string;     // ISO date string
}

export interface CreateAgentRequest {
  name: string;
}

export interface CreateToolRequest {
  agent_id: string;
  name: string;
  scopes: string[];
  description?: string;
}

export interface CreateAgentResponse {
  id: string;
  name: string;
  apiKey: string;
  created_at: number;
}

// Rule types
export interface Rule {
  id: string;
  agent_id: string;
  tool: string;
  scope: string;          // e.g., "read:contacts", "write:deals"
  created_at: number;
}

export interface CreateRuleRequest {
  agent_id: string;
  tool: string;
  scope: string;
}

// Log types
export interface Log {
  id: string;
  agent_id: string;
  tool: string;
  scope: string;
  allowed: boolean;
  deny_reason: string | null;
  request_details: string; // JSON string
  timestamp: number;
}

export interface LogEntry {
  agentId: string;
  tool: string;
  scope: string;
  allowed: boolean;
  denyReason?: string;
  requestDetails: any;
  requestId: string;
}

// Google Calendar types
export interface GoogleCalendarEvent {
  summary?: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  location?: string;
  recurringEventId?: string;
}

// Error types
export enum ErrorCode {
  AGENT_AUTH_FAILED = 'AGENT_AUTH_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  UPSTREAM_ERROR = 'UPSTREAM_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: any;
    requestId: string;
  };
}

// Permission evaluation types
export interface PermissionContext {
  agent: Agent;
  tool: string;
  scope: string;
  requestBody: any;
  headers: Headers;
}

export interface EvaluationResult {
  allowed: boolean;
  reason?: string;
  metadata?: Record<string, any>;
}

// Request/Response types for routes
export interface ParsedRequest {
  tool: string;
  scope: string;
  eventId?: string;
}
