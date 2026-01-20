'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import type { Rule } from '@agent-auth/shared';
import { toast } from '@/hooks/use-toast';

export interface CreateRuleInput {
  agent_id: string;
  tool: string;
  scope: string;
  require_reasoning?: 'none' | 'soft' | 'hard';
}

interface UseRulesReturn {
  rules: Rule[];
  loading: boolean;
  error: Error | null;
  createRule: (data: CreateRuleInput) => Promise<Rule | null>;
  deleteRule: (id: string) => Promise<boolean>;
  fetchRulesForAgent: (agentId: string) => Promise<void>;
}

export function useRules(agentId?: string): UseRulesReturn {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRulesForAgent = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<{ rules: Rule[]; count: number }>(`/admin/agents/${id}/rules`, { cache: false });
      setRules(response.rules);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch rules');
      setError(error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch rules if agentId is provided
  useEffect(() => {
    if (agentId) {
      fetchRulesForAgent(agentId);
    }
  }, [agentId, fetchRulesForAgent]);

  const createRule = useCallback(async (data: CreateRuleInput): Promise<Rule | null> => {
    try {
      const newRule = await apiClient.post<Rule>('/admin/rules', data);

      // Optimistic update
      setRules(prev => [...prev, newRule]);

      toast({
        title: 'Rule created',
        description: 'Permission rule has been created successfully.',
      });

      // Refresh in background
      if (data.agent_id) {
        fetchRulesForAgent(data.agent_id);
      }

      return newRule;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create rule');
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  }, [fetchRulesForAgent]);

  const deleteRule = useCallback(async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/admin/rules/${id}`);

      // Optimistic update
      setRules(prev => prev.filter(r => r.id !== id));

      toast({
        title: 'Rule deleted',
        description: 'Permission rule has been deleted successfully.',
      });

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete rule');
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  }, []);

  return {
    rules,
    loading,
    error,
    createRule,
    deleteRule,
    fetchRulesForAgent,
  };
}
