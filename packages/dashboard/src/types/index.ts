export type TimeRange = '24h' | '7d' | '30d';

export type AgentEnvironment = 'dev' | 'prod';
export type AgentStatus = 'active' | 'disabled' | 'rate_limited';

export interface DashboardAgent {
  id: string;
  name: string;
  description: string;
  environment: AgentEnvironment;
  status: AgentStatus;
  ownerUserId: string;
  teamId: string;
  createdAt: string;
  lastSeenAt: string;
}

export type InstanceStatus = 'running' | 'finished' | 'failed';

export interface AgentInstance {
  id: string;
  agentId: string;
  status: InstanceStatus;
  startedAt: string;
  endedAt: string | null;
  apiCalls: number;
  tokensUsed: number;
  costUsd: number;
  failureReason?: string;
}

export type ActorType = 'user' | 'agent';
export type Severity = 'info' | 'warn' | 'critical';

export interface AuditLogEvent {
  id: string;
  timestamp: string;
  actorType: ActorType;
  actorId: string;
  agentId?: string;
  action: string;
  severity: Severity;
  ip: string;
  metadata: Record<string, unknown>;
}

export type BudgetScope = 'org' | 'team' | 'agent';
export type BudgetPeriod = 'daily' | 'monthly';
export type BudgetBehavior = 'alert_only' | 'rate_limit' | 'disable';

export interface Budget {
  id: string;
  scope: BudgetScope;
  scopeId: string;
  period: BudgetPeriod;
  limitUsd: number;
  spentUsd: number;
  behavior: BudgetBehavior;
  thresholds?: number[];
}

export type AlertType =
  | 'agent_failed'
  | 'high_denial_rate'
  | 'compliance_violation'
  | 'budget_threshold'
  | 'agent_disabled';

export type AlertStatus = 'open' | 'acknowledged' | 'resolved';

export interface Alert {
  id: string;
  type: AlertType;
  severity: Severity;
  createdAt: string;
  targetAgentId?: string;
  status: AlertStatus;
  message: string;
}

export type UserRole = 'admin' | 'viewer' | 'agent_owner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface OverviewMetrics {
  agentCount: number;
  instancesRunning: number;
  instancesFinished: number;
  instancesFailed: number;
  apiCallsTotal: number;
  tokensTotal: number;
  costTotalUsd: number;
  denialRate: number;
  complianceRate: number;
}

export interface LogFilters {
  search?: string;
  severity?: Severity;
  actorType?: ActorType;
  agentId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface UpdateBudgetPayload {
  limitUsd?: number;
  behavior?: BudgetBehavior;
  thresholds?: number[];
}

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}
