// Mock data for premium showcase - realistic and engaging

export type AgentStatus = 'active' | 'idle' | 'error' | 'paused';
export type RequestStatus = 'approved' | 'denied' | 'pending';

export interface MockAgent {
  id: string;
  name: string;
  apiKey: string;
  status: AgentStatus;
  requestCount: number;
  successRate: number;
  lastActive: Date;
  createdAt: Date;
  permissions: string[];
  tags: string[];
}

export interface MockAuditLog {
  id: string;
  timestamp: Date;
  agentId: string;
  agentName: string;
  action: string;
  resource: string;
  status: RequestStatus;
  reasoning: string;
  duration: number;
  metadata?: Record<string, any>;
}

export interface MockStats {
  totalAgents: number;
  totalRequests: number;
  uptime: number;
  agentGrowth: number;
  requestGrowth: number;
  avgResponseTime: number;
}

export interface ActivityEvent {
  id: string;
  timestamp: Date;
  type: 'agent_created' | 'request_approved' | 'request_denied' | 'agent_paused' | 'permission_granted';
  agentName: string;
  description: string;
  metadata?: Record<string, any>;
}

const AGENT_NAMES = [
  'DataScribe', 'CodeWeaver', 'InsightMiner', 'QueryMaster', 'SyncEngine',
  'MetricsBot', 'AnalyticsAI', 'AutoPilot', 'SmartFlow', 'DataPulse',
  'CloudRunner', 'TaskMaster', 'InfoSeeker', 'ProcessBot', 'LogicEngine',
  'APIGuard', 'EventStream', 'CacheFlow', 'DataBridge', 'WorkflowAI',
  'MonitorBot', 'InsightAI', 'QueryBot', 'SyncMaster', 'DataFlow',
  'AutoTask', 'SmartSync', 'MetricBot', 'AnalyzeAI', 'ProcessFlow',
  'CodeBot', 'DataMiner', 'QueryFlow', 'SyncBot', 'InsightFlow',
  'TaskBot', 'MetricsFlow', 'AutoSync', 'SmartBot', 'DataQuery',
  'ProcessAI', 'LogicBot', 'InfoBot', 'EventBot', 'CacheBot',
  'DataBot', 'WorkBot', 'MonitorAI', 'InsightBot', 'QueryAI'
];

const ACTIONS = [
  'read:users', 'write:users', 'delete:users', 'read:data', 'write:data',
  'read:analytics', 'write:analytics', 'read:logs', 'admin:access',
  'read:metrics', 'write:metrics', 'read:reports', 'write:reports'
];

const TAGS = ['production', 'staging', 'development', 'critical', 'monitoring', 'analytics', 'automation', 'reporting'];

const REASONING_TEMPLATES = [
  'Agent has explicit permission for {resource} operations with high trust score',
  'Request matches defined access pattern for {resource} during business hours',
  'Permission granted based on role-based access control policy',
  'Agent authentication verified and within rate limit threshold',
  'Request denied: insufficient permissions for {resource} modification',
  'Access blocked: agent not authorized for sensitive data operations',
  'Rate limit exceeded for this agent in current time window',
  'Request denied: resource access restricted to production agents only',
  'Permission granted after multi-factor validation successful',
  'Access approved with conditional monitoring enabled'
];

function generateAPIKey(): string {
  const prefix = 'sk_live_';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < 48; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix + key;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomElements<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Generate mock agents
export function generateMockAgents(count: number = 50): MockAgent[] {
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  return Array.from({ length: count }, (_, i) => {
    const createdAt = randomDate(monthAgo, now);
    const lastActive = randomDate(createdAt, now);
    const statuses: AgentStatus[] = ['active', 'idle', 'error', 'paused'];
    const weights = [0.6, 0.25, 0.1, 0.05]; // Weighted distribution

    let status: AgentStatus = 'active';
    const rand = Math.random();
    let cumulative = 0;
    for (let j = 0; j < statuses.length; j++) {
      cumulative += weights[j];
      if (rand <= cumulative) {
        status = statuses[j];
        break;
      }
    }

    return {
      id: `agent_${i.toString().padStart(4, '0')}`,
      name: AGENT_NAMES[i % AGENT_NAMES.length] + (i >= AGENT_NAMES.length ? ` ${Math.floor(i / AGENT_NAMES.length) + 1}` : ''),
      apiKey: generateAPIKey(),
      status,
      requestCount: Math.floor(Math.random() * 10000) + 100,
      successRate: 75 + Math.random() * 24, // 75-99%
      lastActive,
      createdAt,
      permissions: randomElements(ACTIONS, Math.floor(Math.random() * 5) + 2),
      tags: randomElements(TAGS, Math.floor(Math.random() * 3) + 1)
    };
  });
}

// Generate mock audit logs
export function generateMockAuditLogs(agents: MockAgent[], count: number = 1000): MockAuditLog[] {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return Array.from({ length: count }, (_, i) => {
    const agent = randomElement(agents);
    const action = randomElement(ACTIONS);
    const resource = action.split(':')[1];
    const statuses: RequestStatus[] = ['approved', 'denied', 'pending'];
    const statusWeights = [0.75, 0.2, 0.05];

    let status: RequestStatus = 'approved';
    const rand = Math.random();
    let cumulative = 0;
    for (let j = 0; j < statuses.length; j++) {
      cumulative += statusWeights[j];
      if (rand <= cumulative) {
        status = statuses[j];
        break;
      }
    }

    const reasoning = randomElement(REASONING_TEMPLATES).replace('{resource}', resource);

    return {
      id: `log_${i.toString().padStart(6, '0')}`,
      timestamp: randomDate(weekAgo, now),
      agentId: agent.id,
      agentName: agent.name,
      action,
      resource,
      status,
      reasoning,
      duration: Math.floor(Math.random() * 500) + 10,
      metadata: {
        ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: randomElement(['Chrome/120.0', 'Firefox/121.0', 'Safari/17.0', 'Edge/120.0'])
      }
    };
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Generate activity events
export function generateActivityEvents(agents: MockAgent[], count: number = 100): ActivityEvent[] {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const types: ActivityEvent['type'][] = ['agent_created', 'request_approved', 'request_denied', 'agent_paused', 'permission_granted'];

  return Array.from({ length: count }, (_, i) => {
    const agent = randomElement(agents);
    const type = randomElement(types);

    let description = '';
    switch (type) {
      case 'agent_created':
        description = 'New agent registered';
        break;
      case 'request_approved':
        description = `Approved ${randomElement(ACTIONS)} request`;
        break;
      case 'request_denied':
        description = `Denied ${randomElement(ACTIONS)} request`;
        break;
      case 'agent_paused':
        description = 'Agent paused by administrator';
        break;
      case 'permission_granted':
        description = `Granted ${randomElement(ACTIONS)} permission`;
        break;
    }

    return {
      id: `event_${i.toString().padStart(6, '0')}`,
      timestamp: randomDate(dayAgo, now),
      type,
      agentName: agent.name,
      description,
      metadata: { agentId: agent.id }
    };
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Generate stats
export function generateMockStats(agents: MockAgent[]): MockStats {
  const activeAgents = agents.filter(a => a.status === 'active').length;
  const totalRequests = agents.reduce((sum, agent) => sum + agent.requestCount, 0);

  return {
    totalAgents: agents.length,
    totalRequests,
    uptime: 99.8,
    agentGrowth: 12.4,
    requestGrowth: 24.6,
    avgResponseTime: 142
  };
}

// Time series data for charts
export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
}

export function generateRequestVolumeData(days: number = 30): TimeSeriesPoint[] {
  const now = new Date();
  const data: TimeSeriesPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const baseValue = 300 + Math.random() * 200;
    const trend = (days - i) * 5; // Upward trend
    const noise = (Math.random() - 0.5) * 50;

    data.push({
      timestamp: date,
      value: Math.floor(baseValue + trend + noise)
    });
  }

  return data;
}

export function generateSuccessRateData(days: number = 30): TimeSeriesPoint[] {
  const now = new Date();
  const data: TimeSeriesPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const baseValue = 85 + Math.random() * 10; // 85-95%
    const noise = (Math.random() - 0.5) * 3;

    data.push({
      timestamp: date,
      value: Math.min(99, Math.max(80, baseValue + noise))
    });
  }

  return data;
}

// Initialize showcase data
const showcaseAgents = generateMockAgents(50);
const showcaseAuditLogs = generateMockAuditLogs(showcaseAgents, 1000);
const showcaseActivityEvents = generateActivityEvents(showcaseAgents, 100);
const showcaseStats = generateMockStats(showcaseAgents);

export const showcaseData = {
  agents: showcaseAgents,
  auditLogs: showcaseAuditLogs,
  activityEvents: showcaseActivityEvents,
  stats: showcaseStats,
  requestVolumeData: generateRequestVolumeData(30),
  successRateData: generateSuccessRateData(30)
};
