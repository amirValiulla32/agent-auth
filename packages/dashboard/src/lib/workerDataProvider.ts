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

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8787';

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      // TODO: Add auth headers (e.g. Authorization: Bearer <token>)
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${body || res.statusText}`);
  }
  return res.json();
}

export class WorkerDataProvider implements DataProvider {
  async getOverviewMetrics(timeRange: TimeRange): Promise<OverviewMetrics> {
    return fetchJson(`/dashboard/overview?timeRange=${timeRange}`);
  }

  async getRequestsTimeSeries(timeRange: TimeRange): Promise<TimeSeriesPoint[]> {
    return fetchJson(`/dashboard/metrics/requests?timeRange=${timeRange}`);
  }

  async getCostTimeSeries(timeRange: TimeRange): Promise<TimeSeriesPoint[]> {
    return fetchJson(`/dashboard/metrics/cost?timeRange=${timeRange}`);
  }

  async getDenialRateTimeSeries(timeRange: TimeRange): Promise<TimeSeriesPoint[]> {
    return fetchJson(`/dashboard/metrics/denial-rate?timeRange=${timeRange}`);
  }

  async listAgents(): Promise<DashboardAgent[]> {
    return fetchJson('/dashboard/agents');
  }

  async getAgent(id: string): Promise<DashboardAgent> {
    return fetchJson(`/dashboard/agents/${id}`);
  }

  async listAgentInstances(agentId: string): Promise<AgentInstance[]> {
    return fetchJson(`/dashboard/agents/${agentId}/instances`);
  }

  async listLogs(filters: LogFilters): Promise<{ logs: AuditLogEvent[]; total: number }> {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.severity) params.set('severity', filters.severity);
    if (filters.actorType) params.set('actorType', filters.actorType);
    if (filters.agentId) params.set('agentId', filters.agentId);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
    return fetchJson(`/dashboard/logs?${params}`);
  }

  async getLogEvent(id: string): Promise<AuditLogEvent> {
    return fetchJson(`/dashboard/logs/${id}`);
  }

  async exportLogs(filters: LogFilters): Promise<AuditLogEvent[]> {
    const params = new URLSearchParams();
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.severity) params.set('severity', filters.severity);
    if (filters.agentId) params.set('agentId', filters.agentId);
    return fetchJson(`/dashboard/logs/export?${params}`);
  }

  async listAlerts(): Promise<Alert[]> {
    return fetchJson('/dashboard/alerts');
  }

  async updateAlertStatus(id: string, status: AlertStatus): Promise<Alert> {
    return fetchJson(`/dashboard/alerts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async listBudgets(): Promise<Budget[]> {
    return fetchJson('/dashboard/budgets');
  }

  async updateBudget(id: string, payload: UpdateBudgetPayload): Promise<Budget> {
    return fetchJson(`/dashboard/budgets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async listUsers(): Promise<User[]> {
    return fetchJson('/dashboard/users');
  }

  async updateUserRole(id: string, role: UserRole): Promise<User> {
    return fetchJson(`/dashboard/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }
}
