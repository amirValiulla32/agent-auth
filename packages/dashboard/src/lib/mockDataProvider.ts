import type { DataProvider } from './dataProvider';
import type {
  TimeRange,
  DashboardAgent,
  AgentInstance,
  AuditLogEvent,
  Alert,
  AlertStatus,
  Budget,
  UpdateBudgetPayload,
  User,
  UserRole,
  OverviewMetrics,
  LogFilters,
  TimeSeriesPoint,
} from '@/types';

// --- Seeded Data ---

const AGENTS: DashboardAgent[] = [
  {
    id: 'agent-1',
    name: 'CRM Assistant',
    description: 'Handles CRM queries and customer data lookups',
    environment: 'prod',
    status: 'active',
    ownerUserId: 'user-2',
    teamId: 'team-1',
    createdAt: '2025-11-01T10:00:00Z',
    lastSeenAt: '2026-02-22T08:30:00Z',
  },
  {
    id: 'agent-2',
    name: 'Data Pipeline Bot',
    description: 'Orchestrates ETL workflows and data transformations',
    environment: 'prod',
    status: 'active',
    ownerUserId: 'user-2',
    teamId: 'team-1',
    createdAt: '2025-12-15T14:00:00Z',
    lastSeenAt: '2026-02-22T09:15:00Z',
  },
  {
    id: 'agent-3',
    name: 'Security Scanner',
    description: 'Automated vulnerability scanning and compliance checks',
    environment: 'prod',
    status: 'rate_limited',
    ownerUserId: 'user-1',
    teamId: 'team-1',
    createdAt: '2026-01-05T09:00:00Z',
    lastSeenAt: '2026-02-22T07:00:00Z',
  },
  {
    id: 'agent-4',
    name: 'Staging Test Agent',
    description: 'Integration testing agent for staging environment',
    environment: 'dev',
    status: 'active',
    ownerUserId: 'user-2',
    teamId: 'team-1',
    createdAt: '2026-02-01T11:00:00Z',
    lastSeenAt: '2026-02-21T16:45:00Z',
  },
  {
    id: 'agent-5',
    name: 'Legacy Connector',
    description: 'Bridges legacy API systems with new infrastructure',
    environment: 'prod',
    status: 'disabled',
    ownerUserId: 'user-1',
    teamId: 'team-1',
    createdAt: '2025-09-20T08:00:00Z',
    lastSeenAt: '2026-02-10T12:00:00Z',
  },
];

const INSTANCES: AgentInstance[] = Array.from({ length: 20 }, (_, i) => {
  const agentId = AGENTS[i % 5].id;
  const isFailed = i === 3 || i === 11 || i === 17;
  const isRunning = i === 0 || i === 5;
  const status = isFailed ? 'failed' as const : isRunning ? 'running' as const : 'finished' as const;
  const startedAt = new Date(Date.now() - (20 - i) * 3600 * 1000).toISOString();
  return {
    id: `inst-${i + 1}`,
    agentId,
    status,
    startedAt,
    endedAt: isRunning ? null : new Date(Date.now() - (20 - i) * 3600 * 1000 + 900000).toISOString(),
    apiCalls: Math.floor(Math.random() * 500) + 10,
    tokensUsed: Math.floor(Math.random() * 50000) + 1000,
    costUsd: parseFloat((Math.random() * 2 + 0.01).toFixed(4)),
    ...(isFailed && { failureReason: ['Rate limit exceeded', 'Timeout after 30s', 'Permission denied on resource'][i % 3] }),
  };
});

const ACTIONS = [
  'agent.invoke', 'agent.create', 'agent.update', 'agent.delete',
  'tool.access', 'tool.denied', 'data.read', 'data.write',
  'auth.login', 'auth.logout', 'budget.exceeded', 'compliance.check',
];

const LOG_EVENTS: AuditLogEvent[] = Array.from({ length: 50 }, (_, i) => {
  const isDenial = i === 5 || i === 12 || i === 23 || i === 37 || i === 44;
  const isCompliance = i === 8 || i === 19 || i === 31;
  const severity = isDenial ? 'critical' as const : isCompliance ? 'warn' as const : 'info' as const;
  return {
    id: `log-${i + 1}`,
    timestamp: new Date(Date.now() - (50 - i) * 1800 * 1000).toISOString(),
    actorType: i % 3 === 0 ? 'user' as const : 'agent' as const,
    actorId: i % 3 === 0 ? `user-${(i % 3) + 1}` : AGENTS[i % 5].id,
    agentId: i % 3 !== 0 ? AGENTS[i % 5].id : undefined,
    action: isDenial ? 'tool.denied' : isCompliance ? 'compliance.check' : ACTIONS[i % ACTIONS.length],
    severity,
    ip: `192.168.1.${(i % 254) + 1}`,
    metadata: {
      ...(isDenial && { reason: 'Insufficient permissions', resource: 'customer_data' }),
      ...(isCompliance && { result: i === 19 ? 'violation' : 'pass', standard: 'SOC2' }),
      duration_ms: Math.floor(Math.random() * 2000) + 50,
    },
  };
});

let ALERTS: Alert[] = [
  {
    id: 'alert-1',
    type: 'agent_failed',
    severity: 'critical',
    createdAt: '2026-02-22T07:15:00Z',
    targetAgentId: 'agent-3',
    status: 'open',
    message: 'Security Scanner failed: Rate limit exceeded',
  },
  {
    id: 'alert-2',
    type: 'high_denial_rate',
    severity: 'critical',
    createdAt: '2026-02-21T22:00:00Z',
    targetAgentId: 'agent-1',
    status: 'open',
    message: 'CRM Assistant denial rate exceeded 15% in the last hour',
  },
  {
    id: 'alert-3',
    type: 'compliance_violation',
    severity: 'warn',
    createdAt: '2026-02-21T18:30:00Z',
    targetAgentId: 'agent-2',
    status: 'acknowledged',
    message: 'Data Pipeline Bot accessed restricted data without reasoning',
  },
  {
    id: 'alert-4',
    type: 'budget_threshold',
    severity: 'warn',
    createdAt: '2026-02-21T14:00:00Z',
    status: 'open',
    message: 'Organization budget reached 85% of monthly limit',
  },
  {
    id: 'alert-5',
    type: 'agent_disabled',
    severity: 'info',
    createdAt: '2026-02-20T10:00:00Z',
    targetAgentId: 'agent-5',
    status: 'resolved',
    message: 'Legacy Connector was disabled by admin',
  },
];

let BUDGETS: Budget[] = [
  {
    id: 'budget-1',
    scope: 'org',
    scopeId: 'org-1',
    period: 'monthly',
    limitUsd: 500,
    spentUsd: 425,
    behavior: 'alert_only',
    thresholds: [70, 85, 95],
  },
  {
    id: 'budget-2',
    scope: 'team',
    scopeId: 'team-1',
    period: 'monthly',
    limitUsd: 200,
    spentUsd: 142,
    behavior: 'rate_limit',
    thresholds: [80, 95],
  },
  {
    id: 'budget-3',
    scope: 'agent',
    scopeId: 'agent-1',
    period: 'daily',
    limitUsd: 10,
    spentUsd: 7.5,
    behavior: 'disable',
    thresholds: [90],
  },
];

let USERS: User[] = [
  { id: 'user-1', name: 'Admin User', email: 'admin@oakauth.com', role: 'admin' },
  { id: 'user-2', name: 'Jane Developer', email: 'jane@oakauth.com', role: 'agent_owner' },
  { id: 'user-3', name: 'Bob Viewer', email: 'bob@oakauth.com', role: 'viewer' },
];

// --- Helpers ---

function delay(ms = 120): Promise<void> {
  return new Promise((r) => setTimeout(r, ms + Math.random() * 80));
}

function generateTimeSeries(timeRange: TimeRange, baseFn: (i: number, total: number) => number): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  const now = Date.now();
  const count = timeRange === '24h' ? 24 : timeRange === '7d' ? 28 : 30;
  const interval = timeRange === '24h' ? 3600 * 1000 : timeRange === '7d' ? 6 * 3600 * 1000 : 24 * 3600 * 1000;

  for (let i = 0; i < count; i++) {
    points.push({
      timestamp: new Date(now - (count - i) * interval).toISOString(),
      value: baseFn(i, count),
    });
  }
  return points;
}

// --- Provider ---

export class MockDataProvider implements DataProvider {
  async getOverviewMetrics(_timeRange: TimeRange): Promise<OverviewMetrics> {
    await delay();
    const running = INSTANCES.filter((i) => i.status === 'running').length;
    const finished = INSTANCES.filter((i) => i.status === 'finished').length;
    const failed = INSTANCES.filter((i) => i.status === 'failed').length;
    return {
      agentCount: AGENTS.length,
      instancesRunning: running,
      instancesFinished: finished,
      instancesFailed: failed,
      apiCallsTotal: INSTANCES.reduce((s, i) => s + i.apiCalls, 0),
      tokensTotal: INSTANCES.reduce((s, i) => s + i.tokensUsed, 0),
      costTotalUsd: parseFloat(INSTANCES.reduce((s, i) => s + i.costUsd, 0).toFixed(2)),
      denialRate: 0.08,
      complianceRate: 0.96,
    };
  }

  async getRequestsTimeSeries(timeRange: TimeRange): Promise<TimeSeriesPoint[]> {
    await delay();
    return generateTimeSeries(timeRange, (i, total) =>
      Math.floor(80 + 40 * Math.sin(i / total * Math.PI * 2) + Math.random() * 20)
    );
  }

  async getCostTimeSeries(timeRange: TimeRange): Promise<TimeSeriesPoint[]> {
    await delay();
    return generateTimeSeries(timeRange, (i) =>
      parseFloat((5 + i * 0.8 + Math.random() * 3).toFixed(2))
    );
  }

  async getDenialRateTimeSeries(timeRange: TimeRange): Promise<TimeSeriesPoint[]> {
    await delay();
    return generateTimeSeries(timeRange, (i, total) =>
      parseFloat((0.05 + 0.03 * Math.sin(i / total * Math.PI * 3) + Math.random() * 0.02).toFixed(4))
    );
  }

  async listAgents(): Promise<DashboardAgent[]> {
    await delay();
    return [...AGENTS];
  }

  async getAgent(id: string): Promise<DashboardAgent> {
    await delay();
    const agent = AGENTS.find((a) => a.id === id);
    if (!agent) throw new Error(`Agent not found: ${id}`);
    return { ...agent };
  }

  async listAgentInstances(agentId: string): Promise<AgentInstance[]> {
    await delay();
    return INSTANCES.filter((i) => i.agentId === agentId).map((i) => ({ ...i }));
  }

  async listLogs(filters: LogFilters): Promise<{ logs: AuditLogEvent[]; total: number }> {
    await delay();
    let result = [...LOG_EVENTS];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (e) => e.action.toLowerCase().includes(q) || e.actorId.toLowerCase().includes(q)
      );
    }
    if (filters.severity) result = result.filter((e) => e.severity === filters.severity);
    if (filters.actorType) result = result.filter((e) => e.actorType === filters.actorType);
    if (filters.agentId) result = result.filter((e) => e.agentId === filters.agentId);
    if (filters.startDate) result = result.filter((e) => e.timestamp >= filters.startDate!);
    if (filters.endDate) result = result.filter((e) => e.timestamp <= filters.endDate!);

    const total = result.length;
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 10;
    result = result.slice((page - 1) * pageSize, page * pageSize);

    return { logs: result, total };
  }

  async getLogEvent(id: string): Promise<AuditLogEvent> {
    await delay();
    const event = LOG_EVENTS.find((e) => e.id === id);
    if (!event) throw new Error(`Log event not found: ${id}`);
    return { ...event };
  }

  async exportLogs(filters: LogFilters): Promise<AuditLogEvent[]> {
    await delay(300);
    const { logs } = await this.listLogs({ ...filters, page: 1, pageSize: 1000 });
    return logs;
  }

  async listAlerts(): Promise<Alert[]> {
    await delay();
    return ALERTS.map((a) => ({ ...a }));
  }

  async updateAlertStatus(id: string, status: AlertStatus): Promise<Alert> {
    await delay();
    const idx = ALERTS.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error(`Alert not found: ${id}`);
    ALERTS = ALERTS.map((a) => (a.id === id ? { ...a, status } : a));
    return { ...ALERTS[idx] };
  }

  async listBudgets(): Promise<Budget[]> {
    await delay();
    return BUDGETS.map((b) => ({ ...b }));
  }

  async updateBudget(id: string, payload: UpdateBudgetPayload): Promise<Budget> {
    await delay();
    const idx = BUDGETS.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error(`Budget not found: ${id}`);
    BUDGETS = BUDGETS.map((b) =>
      b.id === id
        ? {
            ...b,
            ...(payload.limitUsd !== undefined && { limitUsd: payload.limitUsd }),
            ...(payload.behavior !== undefined && { behavior: payload.behavior }),
            ...(payload.thresholds !== undefined && { thresholds: payload.thresholds }),
          }
        : b
    );
    return { ...BUDGETS[idx] };
  }

  async listUsers(): Promise<User[]> {
    await delay();
    return USERS.map((u) => ({ ...u }));
  }

  async updateUserRole(id: string, role: UserRole): Promise<User> {
    await delay();
    const idx = USERS.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error(`User not found: ${id}`);
    USERS = USERS.map((u) => (u.id === id ? { ...u, role } : u));
    return { ...USERS[idx] };
  }
}
