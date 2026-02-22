import type { UserRole } from '@/types';

export type Action =
  | 'view_dashboard'
  | 'view_agents'
  | 'manage_agents'
  | 'view_logs'
  | 'export_logs'
  | 'view_alerts'
  | 'manage_alerts'
  | 'view_budgets'
  | 'manage_budgets'
  | 'view_team'
  | 'manage_roles'
  | 'view_analytics'
  | 'view_settings';

const PERMISSIONS: Record<UserRole, Set<Action>> = {
  admin: new Set([
    'view_dashboard',
    'view_agents',
    'manage_agents',
    'view_logs',
    'export_logs',
    'view_alerts',
    'manage_alerts',
    'view_budgets',
    'manage_budgets',
    'view_team',
    'manage_roles',
    'view_analytics',
    'view_settings',
  ]),
  agent_owner: new Set([
    'view_dashboard',
    'view_agents',
    'manage_agents',
    'view_logs',
    'view_alerts',
    'manage_alerts',
    'view_budgets',
    'view_team',
    'view_analytics',
    'view_settings',
  ]),
  viewer: new Set([
    'view_dashboard',
    'view_agents',
    'view_logs',
    'view_alerts',
    'view_budgets',
    'view_team',
    'view_analytics',
    'view_settings',
  ]),
};

export function hasPermission(role: UserRole, action: Action): boolean {
  return PERMISSIONS[role]?.has(action) ?? false;
}

export function canManageAgent(
  role: UserRole,
  agentOwnerId: string,
  currentUserId: string
): boolean {
  if (role === 'admin') return true;
  if (role === 'agent_owner') return agentOwnerId === currentUserId;
  return false;
}
