/**
 * OakAuth Client - Validates agent permissions before executing actions
 */

export interface ValidationRequest {
  agent_id: string;
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
  private agentId: string;

  constructor(baseUrl: string, agentId: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.agentId = agentId;
  }

  async validate(
    tool: string,
    scope: string,
    context?: Record<string, any>,
    reasoning?: string
  ): Promise<ValidationResponse> {
    const body: ValidationRequest = {
      agent_id: this.agentId,
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
