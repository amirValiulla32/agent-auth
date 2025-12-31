/**
 * useAgents Hook
 * Manages agent CRUD operations with optimistic updates
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Agent } from '@agent-auth/shared';
import { apiClient } from '@/lib/api/client';
import { toast } from '@/hooks/use-toast';
import { CreateAgentInput, UpdateAgentInput } from '@/lib/validators/agent';

interface UseAgentsReturn {
  // Data
  agents: Agent[];
  loading: boolean;
  error: Error | null;

  // Mutations
  createAgent: (data: CreateAgentInput) => Promise<Agent | null>;
  updateAgent: (id: string, data: UpdateAgentInput) => Promise<Agent | null>;
  deleteAgent: (id: string) => Promise<boolean>;
  regenerateKey: (id: string) => Promise<Agent | null>;

  // Utilities
  refresh: () => Promise<void>;
  getAgent: (id: string) => Agent | undefined;
}

/**
 * Hook for managing agents with optimistic updates and caching
 */
export function useAgents(): UseAgentsReturn {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch agents list
  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<{ agents: Agent[] }>('/admin/agents');
      setAgents(response.agents);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch agents');
      setError(error);
      toast({
        title: 'Error loading agents',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Create agent with optimistic update
  const createAgent = useCallback(async (data: CreateAgentInput): Promise<Agent | null> => {
    try {
      const newAgent = await apiClient.createAgent(data);

      // Optimistic update
      setAgents(prev => [...prev, newAgent]);

      toast({
        title: 'Agent created',
        description: `${newAgent.name} has been created successfully.`,
      });

      // Refresh in background to ensure consistency
      fetchAgents();

      return newAgent;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create agent');
      toast({
        title: 'Failed to create agent',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  }, [fetchAgents]);

  // Update agent with optimistic update
  const updateAgent = useCallback(async (id: string, data: UpdateAgentInput): Promise<Agent | null> => {
    // Optimistic update
    const originalAgents = agents;
    const agentIndex = agents.findIndex(a => a.id === id);

    if (agentIndex === -1) {
      toast({
        title: 'Agent not found',
        description: 'The agent you are trying to update does not exist.',
        variant: 'destructive',
      });
      return null;
    }

    const updatedAgent = { ...agents[agentIndex], ...data, updated_at: new Date().toISOString() };
    setAgents(prev => {
      const newAgents = [...prev];
      newAgents[agentIndex] = updatedAgent;
      return newAgents;
    });

    try {
      const result = await apiClient.updateAgent(id, data);

      // Update with server response
      setAgents(prev => prev.map(a => a.id === id ? result : a));

      toast({
        title: 'Agent updated',
        description: `${result.name} has been updated successfully.`,
      });

      return result;
    } catch (err) {
      // Rollback optimistic update
      setAgents(originalAgents);

      const error = err instanceof Error ? err : new Error('Failed to update agent');
      toast({
        title: 'Failed to update agent',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  }, [agents]);

  // Delete agent with optimistic update
  const deleteAgent = useCallback(async (id: string): Promise<boolean> => {
    // Optimistic update
    const originalAgents = agents;
    const agentToDelete = agents.find(a => a.id === id);

    if (!agentToDelete) {
      toast({
        title: 'Agent not found',
        description: 'The agent you are trying to delete does not exist.',
        variant: 'destructive',
      });
      return false;
    }

    setAgents(prev => prev.filter(a => a.id !== id));

    try {
      await apiClient.deleteAgent(id);

      toast({
        title: 'Agent deleted',
        description: `${agentToDelete.name} has been deleted successfully.`,
      });

      return true;
    } catch (err) {
      // Rollback optimistic update
      setAgents(originalAgents);

      const error = err instanceof Error ? err : new Error('Failed to delete agent');
      toast({
        title: 'Failed to delete agent',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  }, [agents]);

  // Regenerate API key
  const regenerateKey = useCallback(async (id: string): Promise<Agent | null> => {
    try {
      const updatedAgent = await apiClient.regenerateApiKey(id);

      // Update local state
      setAgents(prev => prev.map(a => a.id === id ? updatedAgent : a));

      toast({
        title: 'API key regenerated',
        description: 'The new API key has been generated. Make sure to copy it now.',
      });

      return updatedAgent;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to regenerate API key');
      toast({
        title: 'Failed to regenerate API key',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  }, []);

  // Get single agent from local state
  const getAgent = useCallback((id: string): Agent | undefined => {
    return agents.find(a => a.id === id);
  }, [agents]);

  return {
    agents,
    loading,
    error,
    createAgent,
    updateAgent,
    deleteAgent,
    regenerateKey,
    refresh: fetchAgents,
    getAgent,
  };
}