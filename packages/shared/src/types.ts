// User types
export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
}

// Agent types
export interface Agent {
  id: string;
  name: string;
  api_key: string;
  created_at: string;  // ISO date string
  updated_at?: string; // ISO date string, optional
  enabled: boolean;
  rate_limit?: number; // Optional: requests per minute (default: 60)
  user_id?: string;    // Owner user ID
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
  require_reasoning?: 'none' | 'soft' | 'hard'; // Default: 'none'. Controls reasoning enforcement per rule
  created_at: number;
}

export interface CreateRuleRequest {
  agent_id: string;
  tool: string;
  scope: string;
  require_reasoning?: 'none' | 'soft' | 'hard';
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
  reasoning?: string; // Optional: AI agent's explanation for why it needs this permission
  reasoning_required?: 'none' | 'soft' | 'hard'; // What level of reasoning was required for this operation
  reasoning_provided: boolean; // Whether reasoning was included in the request (for compliance tracking)
  timestamp: number;
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
