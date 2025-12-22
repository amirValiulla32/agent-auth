/**
 * Agent Authentication
 */

import { Agent } from '@agent-auth/shared';
import { storage } from './storage';
import { AgentAuthError } from './errors';
import { safeCompare } from './utils';

export async function authenticateAgent(request: Request): Promise<Agent> {
  const agentId = request.headers.get('X-Agent-ID');
  const agentKey = request.headers.get('X-Agent-Key');

  if (!agentId || !agentKey) {
    throw new AgentAuthError('Missing X-Agent-ID or X-Agent-Key header');
  }

  // Load agent from storage
  const agent = await storage.getAgent(agentId);

  if (!agent) {
    throw new AgentAuthError('Agent not found');
  }

  if (!agent.enabled) {
    throw new AgentAuthError('Agent is disabled');
  }

  // Verify API key (constant-time comparison)
  if (!safeCompare(agentKey, agent.api_key)) {
    throw new AgentAuthError('Invalid API key');
  }

  return agent;
}
