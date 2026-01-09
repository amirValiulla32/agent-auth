'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import type { Tool } from '@agent-auth/shared';
import { toast } from '@/hooks/use-toast';

export interface CreateToolInput {
  agent_id: string;
  name: string;
  scopes: string[];
  description?: string;
}

interface UseToolsReturn {
  tools: Tool[];
  loading: boolean;
  error: Error | null;
  createTool: (data: CreateToolInput) => Promise<Tool | null>;
  updateTool: (id: string, data: Partial<CreateToolInput>) => Promise<Tool | null>;
  deleteTool: (id: string, agentId?: string) => Promise<boolean>;
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
      const response = await apiClient.get<{ tools: Tool[]; count: number }>(`/admin/agents/${id}/tools`, { cache: false });
      const newTools = Array.isArray(response.tools) ? [...response.tools] : [];
      setTools(newTools);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch tools');
      setError(error);
      setTools([]);
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

      toast({
        title: 'Tool created',
        description: `Tool "${newTool.name}" has been registered successfully.`,
      });

      if (data.agent_id) {
        await fetchToolsForAgent(data.agent_id);
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

  const updateTool = useCallback(async (id: string, data: Partial<CreateToolInput>): Promise<Tool | null> => {
    try {
      // Optimistic update
      setTools(prev => prev.map(t =>
        t.id === id
          ? { ...t, ...data, scopes: data.scopes || t.scopes }
          : t
      ));

      const updatedTool = await apiClient.put<Tool>(`/admin/tools/${id}`, data);

      toast({
        title: 'Tool updated',
        description: `Tool "${updatedTool.name}" has been updated successfully.`,
      });

      // Refresh to ensure consistency
      if (data.agent_id) {
        await fetchToolsForAgent(data.agent_id);
      }

      return updatedTool;
    } catch (err) {
      // Revert optimistic update on error
      if (data.agent_id) {
        await fetchToolsForAgent(data.agent_id);
      }

      const error = err instanceof Error ? err : new Error('Failed to update tool');
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  }, [fetchToolsForAgent]);

  const deleteTool = useCallback(async (id: string, agentId?: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/admin/tools/${id}`);

      toast({
        title: 'Tool deleted',
        description: 'Tool has been deleted successfully.',
      });

      if (agentId) {
        await fetchToolsForAgent(agentId);
      }

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
  }, [fetchToolsForAgent]);

  return {
    tools,
    loading,
    error,
    createTool,
    updateTool,
    deleteTool,
    fetchToolsForAgent,
  };
}
