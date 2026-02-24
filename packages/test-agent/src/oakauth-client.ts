/**
 * OakAuth Client - Validates agent permissions before executing actions
 */

export interface ValidationRequest {
  tool: string;
  scope: string;
  context?: Record<string, any>;
  reasoning?: string;
}

export interface ValidationResponse {
  allowed: boolean;
  reason?: string;
}

export class OakAuthClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
  }

  async validate(
    tool: string,
    scope: string,
    context?: Record<string, any>,
    reasoning?: string
  ): Promise<ValidationResponse> {
    const body: ValidationRequest = {
      tool,
      scope,
      context,
      reasoning,
    };

    try {
      const response = await fetch(`${this.baseUrl}/v1/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return data as ValidationResponse;
    } catch (error) {
      console.error('OakAuth validation error:', error);
      return {
        allowed: false,
        reason: `Failed to connect to OakAuth: ${error}`,
      };
    }
  }
}
