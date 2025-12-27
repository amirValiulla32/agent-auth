/**
 * Application Constants
 * Centralized constants for routes, pagination, caching, and more
 */

/**
 * Application Routes
 */
export const ROUTES = {
  HOME: '/',
  AGENTS: '/agents',
  AGENTS_NEW: '/agents/new',
  AGENTS_DETAIL: (id: string) => `/agents/${id}`,
  AGENTS_EDIT: (id: string) => `/agents/${id}/edit`,
  PERMISSIONS: '/permissions',
  PERMISSIONS_NEW: '/permissions/new',
  PERMISSIONS_DETAIL: (id: string) => `/permissions/${id}`,
  LOGS: '/logs',
} as const;

/**
 * API Endpoints (relative to Worker base URL)
 */
export const API_ENDPOINTS = {
  // Admin endpoints
  ADMIN_SEED: '/admin/seed',
  ADMIN_AGENTS: '/admin/agents',
  ADMIN_AGENT: (id: string) => `/admin/agents/${id}`,
  ADMIN_AGENT_REGENERATE_KEY: (id: string) => `/admin/agents/${id}/regenerate-key`,
  ADMIN_RULES: '/admin/rules',
  ADMIN_RULE: (id: string) => `/admin/rules/${id}`,
  ADMIN_AGENT_RULES: (agentId: string) => `/admin/agents/${agentId}/rules`,
  ADMIN_LOGS: '/admin/logs',

  // Proxy endpoints
  GOOGLE_CALENDAR_EVENTS: '/v1/google-calendar/events',
} as const;

/**
 * Pagination Defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Cache Configuration (milliseconds)
 */
export const CACHE = {
  TTL: 5 * 60 * 1000, // 5 minutes
  STALE_TIME: 2 * 60 * 1000, // 2 minutes - data considered fresh
  REFETCH_INTERVAL: 30 * 1000, // 30 seconds - background refetch
} as const;

/**
 * Debounce Delays (milliseconds)
 */
export const DEBOUNCE = {
  SEARCH: 500, // Search input delay
  FILTER: 300, // Filter input delay
  RESIZE: 150, // Window resize delay
} as const;

/**
 * Toast Configuration
 */
export const TOAST = {
  DEFAULT_DURATION: 5000, // 5 seconds
  SUCCESS_DURATION: 3000, // 3 seconds
  ERROR_DURATION: 7000, // 7 seconds
} as const;

/**
 * Form Field Limits
 */
export const LIMITS = {
  AGENT_NAME_MIN: 1,
  AGENT_NAME_MAX: 100,
  RULE_MAX_DURATION_MIN: 1, // minutes
  RULE_MAX_DURATION_MAX: 1440, // minutes (24 hours)
  RULE_MAX_ATTENDEES_MIN: 1,
  RULE_MAX_ATTENDEES_MAX: 1000,
  API_KEY_VISIBLE_CHARS: 6, // Number of visible chars in masked API key
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Supported Tools
 */
export const TOOLS = ['google_calendar'] as const;
export type Tool = (typeof TOOLS)[number];

/**
 * Supported Actions (per tool)
 */
export const ACTIONS = {
  google_calendar: ['create_event', 'update_event', 'delete_event', 'list_events'],
} as const;

/**
 * Tool Display Names
 */
export const TOOL_DISPLAY_NAMES: Record<Tool, string> = {
  google_calendar: 'Google Calendar',
} as const;

/**
 * Action Display Names
 */
export const ACTION_DISPLAY_NAMES: Record<string, string> = {
  create_event: 'Create Event',
  update_event: 'Update Event',
  delete_event: 'Delete Event',
  list_events: 'List Events',
} as const;

/**
 * Condition Types
 */
export const CONDITION_TYPES = {
  MAX_DURATION: 'max_duration',
  MAX_ATTENDEES: 'max_attendees',
  BUSINESS_HOURS_ONLY: 'business_hours_only',
  ALLOWED_ACTIONS: 'allowed_actions',
} as const;

/**
 * Condition Display Names
 */
export const CONDITION_DISPLAY_NAMES: Record<string, string> = {
  [CONDITION_TYPES.MAX_DURATION]: 'Max Duration',
  [CONDITION_TYPES.MAX_ATTENDEES]: 'Max Attendees',
  [CONDITION_TYPES.BUSINESS_HOURS_ONLY]: 'Business Hours Only',
  [CONDITION_TYPES.ALLOWED_ACTIONS]: 'Allowed Actions',
} as const;

/**
 * Log Filter Options
 */
export const LOG_FILTERS = {
  ALL: 'all',
  ALLOWED: 'allowed',
  DENIED: 'denied',
} as const;

/**
 * Date Range Presets (for log filtering)
 */
export const DATE_RANGES = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last_7_days',
  LAST_30_DAYS: 'last_30_days',
  CUSTOM: 'custom',
} as const;

/**
 * Export Formats
 */
export const EXPORT_FORMATS = {
  CSV: 'csv',
  JSON: 'json',
} as const;

/**
 * Regular Expressions
 */
export const REGEX = {
  // Agent name: alphanumeric, spaces, hyphens, underscores
  AGENT_NAME: /^[a-zA-Z0-9\s\-_]+$/,
  // Agent ID: alphanumeric, hyphens, underscores
  AGENT_ID: /^[a-zA-Z0-9\-_]+$/,
  // API key format: sk_[live|test]_[alphanumeric]
  API_KEY: /^sk_(live|test)_[a-zA-Z0-9]+$/,
} as const;

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  THEME: 'agent-auth-theme',
  SIDEBAR_COLLAPSED: 'agent-auth-sidebar-collapsed',
  AGENT_LIST_PAGE_SIZE: 'agent-auth-agent-list-page-size',
  RULE_LIST_PAGE_SIZE: 'agent-auth-rule-list-page-size',
  LOG_LIST_PAGE_SIZE: 'agent-auth-log-list-page-size',
  LOG_FILTERS: 'agent-auth-log-filters',
} as const;

/**
 * Animation Durations (milliseconds)
 */
export const ANIMATION = {
  FAST: 150,
  NORMAL: 250,
  SLOW: 350,
} as const;

/**
 * Breakpoints (pixels)
 * Match Tailwind CSS defaults
 */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;
