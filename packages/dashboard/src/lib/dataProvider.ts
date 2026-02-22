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

export interface DataProvider {
  // Overview
  getOverviewMetrics(timeRange: TimeRange): Promise<OverviewMetrics>;
  getRequestsTimeSeries(timeRange: TimeRange): Promise<TimeSeriesPoint[]>;
  getCostTimeSeries(timeRange: TimeRange): Promise<TimeSeriesPoint[]>;
  getDenialRateTimeSeries(timeRange: TimeRange): Promise<TimeSeriesPoint[]>;

  // Agents
  listAgents(): Promise<DashboardAgent[]>;
  getAgent(id: string): Promise<DashboardAgent>;
  listAgentInstances(agentId: string): Promise<AgentInstance[]>;

  // Logs
  listLogs(filters: LogFilters): Promise<{ logs: AuditLogEvent[]; total: number }>;
  getLogEvent(id: string): Promise<AuditLogEvent>;
  exportLogs(filters: LogFilters): Promise<AuditLogEvent[]>;

  // Alerts
  listAlerts(): Promise<Alert[]>;
  updateAlertStatus(id: string, status: AlertStatus): Promise<Alert>;

  // Budgets
  listBudgets(): Promise<Budget[]>;
  updateBudget(id: string, payload: UpdateBudgetPayload): Promise<Budget>;

  // Team
  listUsers(): Promise<User[]>;
  updateUserRole(id: string, role: UserRole): Promise<User>;
}
