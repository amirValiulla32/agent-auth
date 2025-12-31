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
  actions: string[];      // Customer-defined: ["read", "write", "delete"], etc.
  description?: string;   // Optional description
  created_at: string;     // ISO date string
}

export interface CreateAgentRequest {
  name: string;
}

export interface CreateToolRequest {
  agent_id: string;
  name: string;
  actions: string[];
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
  action: string;
  conditions: string; // JSON string
  created_at: number;
}

export interface RuleConditions {
  max_duration?: number; // minutes
  max_attendees?: number;
  business_hours_only?: boolean;
  allowed_actions?: string[];
}

export interface CreateRuleRequest {
  agent_id: string;
  tool: string;
  action: string;
  conditions: RuleConditions;
}

// Log types
export interface Log {
  id: string;
  agent_id: string;
  tool: string;
  action: string;
  allowed: boolean;
  deny_reason: string | null;
  request_details: string; // JSON string
  timestamp: number;
}

export interface LogEntry {
  agentId: string;
  tool: string;
  action: string;
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
  action: string;
  requestBody: any;
  headers: Headers;
}

export interface EvaluationResult {
  allowed: boolean;
  reason?: string;
  metadata?: Record<string, any>;
}

// Constants
export const TOOLS = {
  GOOGLE_CALENDAR: 'google_calendar',
} as const;

export const ACTIONS = {
  CREATE_EVENT: 'create_event',
  UPDATE_EVENT: 'update_event',
  DELETE_EVENT: 'delete_event',
  LIST_EVENTS: 'list_events',
} as const;

export type Tool = typeof TOOLS[keyof typeof TOOLS];
export type Action = typeof ACTIONS[keyof typeof ACTIONS];

// Request/Response types for routes
export interface ParsedRequest {
  tool: string;
  action: string;
  eventId?: string;
}
