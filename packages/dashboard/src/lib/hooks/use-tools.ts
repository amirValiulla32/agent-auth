'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import type { Tool } from '@agent-auth/shared';
import { toast } from '@/hooks/use-toast';

export interface CreateToolInput {
  agent_id: string;
  name: string;
  actions: string[];
  description?: string;
}

interface UseToolsReturn {
  tools: Tool[];
  loading: boolean;
  error: Error | null;
  createTool: (data: CreateToolInput) => Promise<Tool | null>;
  deleteTool: (id: string) => Promise<boolean>;
  fetchToolsForAgent: (agentId: string) => Promise<void>;
}

export function useTools(agentId?: string): UseToolsReturn {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchToolsForAgent = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<Tool[]>(`/admin/agents/${id}/tools`);
      setTools(Array.isArray(response) ? response : []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch tools');
      setError(error);
      setTools([]); // Reset to empty array on error
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch tools if agentId is provided
  useEffect(() => {
    if (agentId) {
      fetchToolsForAgent(agentId);
    }
  }, [agentId, fetchToolsForAgent]);

  const createTool = useCallback(async (data: CreateToolInput): Promise<Tool | null> => {
    try {
      const newTool = await apiClient.post<Tool>('/admin/tools', data);

      // Optimistic update
      setTools(prev => [...prev, newTool]);

      toast({
        title: 'Tool created',
        description: `Tool "${newTool.name}" has been registered successfully.`,
      });

      // Refresh in background
      if (data.agent_id) {
        fetchToolsForAgent(data.agent_id);
      }

      return newTool;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create tool');
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  }, [fetchToolsForAgent]);

  const deleteTool = useCallback(async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/admin/tools/${id}`);

      // Optimistic update
      setTools(prev => prev.filter(t => t.id !== id));

      toast({
        title: 'Tool deleted',
        description: 'Tool has been deleted successfully.',
      });

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete tool');
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  }, []);

  return {
    tools,
    loading,
    error,
    createTool,
    deleteTool,
    fetchToolsForAgent,
  };
}
