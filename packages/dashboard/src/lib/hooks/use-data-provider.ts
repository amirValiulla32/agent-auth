'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import type { DataProvider } from '@/lib/dataProvider';
import { getDataProvider } from '@/lib/provider';
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

// --- Provider singleton ---

let _provider: DataProvider | null = null;

export function useDataProvider(): DataProvider {
  if (!_provider) _provider = getDataProvider();
  return _provider;
}

// --- Generic fetch helper ---

function useFetch<T>(
  fetcher: (provider: DataProvider) => Promise<T>,
  deps: unknown[] = []
) {
  const provider = useDataProvider();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher(provider);
      if (mountedRef.current) setData(result);
    } catch (err) {
      if (mountedRef.current) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        toast({ title: 'Error', description: e.message, variant: 'destructive' });
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, ...deps]);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    return () => { mountedRef.current = false; };
  }, [refresh]);

  return { data, loading, error, refresh };
}

// --- Overview ---

export function useOverviewMetrics(timeRange: TimeRange) {
  return useFetch<OverviewMetrics>((p) => p.getOverviewMetrics(timeRange), [timeRange]);
}

export function useRequestsTimeSeries(timeRange: TimeRange) {
  return useFetch<TimeSeriesPoint[]>((p) => p.getRequestsTimeSeries(timeRange), [timeRange]);
}

export function useCostTimeSeries(timeRange: TimeRange) {
  return useFetch<TimeSeriesPoint[]>((p) => p.getCostTimeSeries(timeRange), [timeRange]);
}

export function useDenialRateTimeSeries(timeRange: TimeRange) {
  return useFetch<TimeSeriesPoint[]>((p) => p.getDenialRateTimeSeries(timeRange), [timeRange]);
}

// --- Agents ---

export function useDashboardAgents() {
  return useFetch<DashboardAgent[]>((p) => p.listAgents());
}

export function useAgentDetail(agentId: string) {
  const agent = useFetch<DashboardAgent>((p) => p.getAgent(agentId), [agentId]);
  const instances = useFetch<AgentInstance[]>((p) => p.listAgentInstances(agentId), [agentId]);
  return {
    agent: agent.data,
    instances: instances.data,
    loading: agent.loading || instances.loading,
    error: agent.error || instances.error,
    refresh: () => { agent.refresh(); instances.refresh(); },
  };
}

// --- Logs ---

export function useDashboardLogs(filters: LogFilters) {
  const provider = useDataProvider();
  const [logs, setLogs] = useState<AuditLogEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const filtersKey = JSON.stringify(filters);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await provider.listLogs(filters);
      setLogs(result.logs);
      setTotal(result.total);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, filtersKey]);

  useEffect(() => { refresh(); }, [refresh]);

  return { logs, total, loading, error, refresh };
}

// --- Alerts ---

export function useAlerts() {
  const provider = useDataProvider();
  const { data, loading, error, refresh } = useFetch<Alert[]>((p) => p.listAlerts());

  const updateStatus = useCallback(async (id: string, status: AlertStatus) => {
    try {
      await provider.updateAlertStatus(id, status);
      toast({ title: 'Alert updated' });
      refresh();
    } catch (err) {
      toast({ title: 'Error', description: String(err), variant: 'destructive' });
    }
  }, [provider, refresh]);

  return { alerts: data ?? [], loading, error, refresh, updateStatus };
}

// --- Budgets ---

export function useBudgets() {
  const provider = useDataProvider();
  const { data, loading, error, refresh } = useFetch<Budget[]>((p) => p.listBudgets());

  const updateBudget = useCallback(async (id: string, payload: UpdateBudgetPayload) => {
    try {
      await provider.updateBudget(id, payload);
      toast({ title: 'Budget updated' });
      refresh();
    } catch (err) {
      toast({ title: 'Error', description: String(err), variant: 'destructive' });
    }
  }, [provider, refresh]);

  return { budgets: data ?? [], loading, error, refresh, updateBudget };
}

// --- Team ---

export function useTeam() {
  const provider = useDataProvider();
  const { data, loading, error, refresh } = useFetch<User[]>((p) => p.listUsers());

  const updateRole = useCallback(async (id: string, role: UserRole) => {
    try {
      await provider.updateUserRole(id, role);
      toast({ title: 'Role updated' });
      refresh();
    } catch (err) {
      toast({ title: 'Error', description: String(err), variant: 'destructive' });
    }
  }, [provider, refresh]);

  return { users: data ?? [], loading, error, refresh, updateRole };
}
