/**
 * Enhanced API Client
 * Provides type-safe HTTP methods with error handling and caching
 */

import { ApiError } from './errors';

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private baseUrl: string;
  private cache: Map<string, { data: unknown; timestamp: number }>;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
    this.cache = new Map();
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
  private async request<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = this.buildUrl(endpoint, config?.params);

    try {
      const response = await fetch(url, {
        ...config,
        headers: {
          'Content-Type': 'application/json',
          ...config?.headers,
        },
      });

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
}

// Export singleton instance
export const apiClient = new ApiClient();
