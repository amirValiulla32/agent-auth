/**
 * Enhanced API Client
 * Provides type-safe HTTP methods with error handling and caching
 */

import { ApiError } from './errors';
import type { Agent } from '@agent-auth/shared';
import type { CreateAgentInput, UpdateAgentInput } from '../validators/agent';

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private baseUrl: string;
  private cache: Map<string, { data: unknown; timestamp: number }>;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  // De-dupes concurrent token refreshes so a burst of 401s triggers one refresh.
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
    this.cache = new Map();
  }

  private get authHeaders(): Record<string, string> {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('oakauth_token');
      if (token) return { 'Authorization': `Bearer ${token}` };
    }
    const adminKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY;
    return adminKey ? { 'Authorization': `Bearer ${adminKey}` } : {};
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(endpoint, this.baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Core request method with error handling
   */
  private async request<T>(endpoint: string, config?: RequestConfig, retried = false): Promise<T> {
    const url = this.buildUrl(endpoint, config?.params);

    try {
      const response = await fetch(url, {
        ...config,
        headers: {
          'Content-Type': 'application/json',
          ...this.authHeaders,
          ...config?.headers,
        },
      });

      // A 401 on a user-token request usually means the access token expired.
      // Try a single silent refresh, then retry the original request once.
      if (
        response.status === 401 &&
        !retried &&
        typeof window !== 'undefined' &&
        localStorage.getItem('oakauth_token')
      ) {
        const newToken = await this.refreshAccessToken();
        if (newToken) {
          return this.request<T>(endpoint, config, true);
        }
        // Refresh token is gone or expired — the session is truly over.
        this.handleSessionExpired();
      }

      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          response.status,
          errorData.error?.message || response.statusText,
          errorData.error?.code,
          errorData.error?.details
        );
      }

      // Parse successful response
      const data = await response.json();
      return data as T;
    } catch (error) {
      // Re-throw ApiErrors as-is
      if (error instanceof ApiError) {
        throw error;
      }

      // Network errors or other failures
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError(0, 'Network error. Please check your connection.', 'NETWORK_ERROR');
      }

      // Unknown errors
      throw new ApiError(500, 'An unexpected error occurred', 'UNKNOWN_ERROR');
    }
  }

  /**
   * Exchange the stored refresh token for a fresh access token.
   * Returns the new access token, or null if refresh isn't possible.
   * Concurrent callers share a single in-flight refresh.
   */
  private async refreshAccessToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    const refreshToken = localStorage.getItem('oakauth_refresh');
    if (!refreshToken) return null;

    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        try {
          const res = await fetch(this.buildUrl('/auth/refresh'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });
          if (!res.ok) return null;
          const data = await res.json();
          if (data?.access_token) {
            localStorage.setItem('oakauth_token', data.access_token);
            return data.access_token as string;
          }
          return null;
        } catch {
          return null;
        }
      })();
    }

    const token = await this.refreshPromise;
    this.refreshPromise = null;
    return token;
  }

  /**
   * Clear auth state and send the user back to login when the session can't be
   * recovered (refresh token expired/revoked).
   */
  private handleSessionExpired(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('oakauth_token');
    localStorage.removeItem('oakauth_refresh');
    localStorage.removeItem('oakauth_user');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  /**
   * GET request with optional caching
   */
  async get<T>(endpoint: string, options?: { params?: Record<string, string | number | boolean | undefined>; cache?: boolean }): Promise<T> {
    const cacheKey = `GET:${endpoint}:${JSON.stringify(options?.params || {})}`;

    // Check cache if enabled
    if (options?.cache !== false) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data as T;
      }
    }

    const data = await this.request<T>(endpoint, {
      method: 'GET',
      params: options?.params,
    });

    // Cache the response
    if (options?.cache !== false) {
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
    }

    return data;
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    const data = await this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });

    // Invalidate related GET caches
    this.invalidateCache(endpoint);

    return data;
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    const data = await this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });

    // Invalidate related GET caches
    this.invalidateCache(endpoint);

    return data;
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    const data = await this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });

    // Invalidate related GET caches
    this.invalidateCache(endpoint);

    return data;
  }

  /**
   * DELETE request
   */
  async delete<T = void>(endpoint: string): Promise<T> {
    const data = await this.request<T>(endpoint, {
      method: 'DELETE',
    });

    // Invalidate related GET caches
    this.invalidateCache(endpoint);

    return data;
  }

  /**
   * Invalidate cache entries matching a pattern
   */
  invalidateCache(pattern: string): void {
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  // ========================================
  // Agent CRUD Operations
  // ========================================

  /**
   * Get all agents
   */
  async getAgents(): Promise<Agent[]> {
    const response = await this.get<{ agents: Agent[]; count: number }>('/admin/agents');
    return response.agents;
  }

  /**
   * Create a new agent
   */
  async createAgent(data: CreateAgentInput): Promise<Agent> {
    const response = await this.post<Agent>('/admin/agents', data);
    return response;
  }

  /**
   * Get a single agent by ID
   */
  async getAgent(id: string): Promise<Agent> {
    return this.get<Agent>(`/admin/agents/${id}`);
  }

  /**
   * Update an existing agent
   */
  async updateAgent(id: string, data: UpdateAgentInput): Promise<Agent> {
    const response = await this.patch<Agent>(`/admin/agents/${id}`, data);
    return response;
  }

  /**
   * Delete an agent
   */
  async deleteAgent(id: string): Promise<void> {
    await this.delete(`/admin/agents/${id}`);
  }

  /**
   * Regenerate an agent's API key
   */
  async regenerateApiKey(id: string): Promise<Agent> {
    const response = await this.post<Agent>(`/admin/agents/${id}/regenerate-key`);
    return response;
  }

  // ========================================
  // Stats & Utility
  // ========================================

  async getStats(): Promise<{ totalAgents: number; totalLogs: number; denialsToday: number; apiCallsToday: number }> {
    return this.get('/admin/stats');
  }

  async seedTestData(): Promise<{ message: string }> {
    return this.post('/admin/seed');
  }

  // ========================================
  // Logs Operations
  // ========================================

  /**
   * Get audit logs with filtering and pagination
   */
  async getLogs(options?: {
    limit?: number;
    offset?: number;
    agent_id?: string;
    tool?: string;
    scope?: string;
    allowed?: boolean;
    search?: string;
    from_date?: number;
    to_date?: number;
  }): Promise<{ logs: any[]; total: number; count: number }> {
    const response = await this.get<{ logs: any[]; total: number; count: number }>('/admin/logs', {
      params: options,
      cache: false
    });
    return response;
  }

  /**
   * Get logs for a specific agent
   */
  async getAgentLogs(agentId: string, limit: number = 100): Promise<any[]> {
    const response = await this.get<{ logs: any[]; count: number }>(`/admin/agents/${agentId}/logs`, {
      params: { limit },
      cache: false
    });
    return response.logs;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
