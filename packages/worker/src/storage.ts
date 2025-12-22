/**
 * In-Memory Storage (for local testing without D1/KV)
 *
 * This simulates database and cache storage for development.
 * In production, this would be replaced with D1 and KV.
 */

import { Agent, Rule, Log } from '@agent-auth/shared';

// In-memory stores
const agents: Map<string, Agent> = new Map();
const rules: Map<string, Rule> = new Map();
const logs: Log[] = [];

// Rule cache (simulates KV)
const ruleCache: Map<string, Rule[]> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const cacheTimes: Map<string, number> = new Map();

export class InMemoryStorage {
  // ==================== AGENTS ====================

  async getAgent(id: string): Promise<Agent | null> {
    return agents.get(id) || null;
  }

  async getAgentByApiKey(apiKey: string): Promise<Agent | null> {
    for (const agent of agents.values()) {
      if (agent.api_key === apiKey) {
        return agent;
      }
    }
    return null;
  }

  async createAgent(agent: Agent): Promise<void> {
    agents.set(agent.id, agent);
  }

  async listAgents(): Promise<Agent[]> {
    return Array.from(agents.values());
  }

  async deleteAgent(id: string): Promise<void> {
    agents.delete(id);
    // Also delete associated rules
    for (const [ruleId, rule] of rules.entries()) {
      if (rule.agent_id === id) {
        rules.delete(ruleId);
      }
    }
  }

  // ==================== RULES ====================

  async getRule(id: string): Promise<Rule | null> {
    return rules.get(id) || null;
  }

  async getRulesForAgent(agentId: string, tool: string, action: string): Promise<Rule[]> {
    const cacheKey = `rules:${agentId}:${tool}:${action}`;

    // Check cache first
    const cacheTime = cacheTimes.get(cacheKey);
    if (cacheTime && Date.now() - cacheTime < CACHE_TTL) {
      const cached = ruleCache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Load from storage
    const matchingRules: Rule[] = [];
    for (const rule of rules.values()) {
      if (rule.agent_id === agentId && rule.tool === tool && rule.action === action) {
        matchingRules.push(rule);
      }
    }

    // Cache the result
    ruleCache.set(cacheKey, matchingRules);
    cacheTimes.set(cacheKey, Date.now());

    return matchingRules;
  }

  async createRule(rule: Rule): Promise<void> {
    rules.set(rule.id, rule);
    this.invalidateRuleCache(rule.agent_id, rule.tool, rule.action);
  }

  async deleteRule(id: string): Promise<void> {
    const rule = rules.get(id);
    if (rule) {
      rules.delete(id);
      this.invalidateRuleCache(rule.agent_id, rule.tool, rule.action);
    }
  }

  async listRulesForAgent(agentId: string): Promise<Rule[]> {
    const agentRules: Rule[] = [];
    for (const rule of rules.values()) {
      if (rule.agent_id === agentId) {
        agentRules.push(rule);
      }
    }
    return agentRules;
  }

  private invalidateRuleCache(agentId: string, tool: string, action: string): void {
    const cacheKey = `rules:${agentId}:${tool}:${action}`;
    ruleCache.delete(cacheKey);
    cacheTimes.delete(cacheKey);
  }

  // ==================== LOGS ====================

  async createLog(log: Log): Promise<void> {
    logs.push(log);
  }

  async listLogs(limit: number = 100): Promise<Log[]> {
    return logs.slice(-limit).reverse(); // Last N logs, newest first
  }

  async listLogsForAgent(agentId: string, limit: number = 100): Promise<Log[]> {
    return logs
      .filter(log => log.agent_id === agentId)
      .slice(-limit)
      .reverse();
  }

  // ==================== UTILITY ====================

  async clearAll(): Promise<void> {
    agents.clear();
    rules.clear();
    logs.length = 0;
    ruleCache.clear();
    cacheTimes.clear();
  }

  async getStats(): Promise<{
    agentCount: number;
    ruleCount: number;
    logCount: number;
  }> {
    return {
      agentCount: agents.size,
      ruleCount: rules.size,
      logCount: logs.length,
    };
  }
}

// Singleton instance
export const storage = new InMemoryStorage();
