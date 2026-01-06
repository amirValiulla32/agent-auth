import type { Agent, Log } from "@agent-auth/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:65534';

export interface StatsResponse {
  totalAgents: number;
  totalLogs: number;
  denialsToday: number;
  apiCallsToday: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`Failed to fetch ${endpoint}:`, error);
      throw error;
    }
  }

  async getAgents(): Promise<Agent[]> {
    const response = await this.fetchJson<{ agents: Agent[]; count: number }>('/admin/agents');
    return response.agents;
  }

  async getLogs(limit?: number): Promise<Log[]> {
    const params = limit ? `?limit=${limit}` : '';
    const response = await this.fetchJson<{ logs: Log[]; count: number }>(`/admin/logs${params}`);
    return response.logs;
  }

  async getStats(): Promise<StatsResponse> {
    return this.fetchJson<StatsResponse>('/admin/stats');
  }

  async seedTestData(): Promise<{ message: string }> {
    return this.fetchJson<{ message: string }>('/admin/seed', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();
