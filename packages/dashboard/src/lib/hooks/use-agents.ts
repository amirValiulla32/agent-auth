/**
 * useAgents Hook
 * Manages agent data fetching and mutations
 */

import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import type { Agent } from '@agent-auth/shared';

interface UseAgentsReturn {
  agents: Agent[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing agents data
 *
 * @returns Agent data, loading state, error state, and refetch function
 *
 * @example
 * const { agents, isLoading, error, refetch } = useAgents();
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error}</div>;
 * return <div>{agents.map(...)}</div>;
 */
export function useAgents(): UseAgentsReturn {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getAgents();
      setAgents(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch agents';
      setError(errorMessage);
      console.error('Error fetching agents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchAgents();
  }, []);

  return {
    agents,
    isLoading,
    error,
    refetch: fetchAgents,
  };
}
