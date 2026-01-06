/**
 * In-Memory Storage (for local testing without D1/KV)
 *
 * This simulates database and cache storage for development.
 * In production, this would be replaced with D1 and KV.
 */

import { Agent, Rule, Log, Tool } from '@agent-auth/shared';

// In-memory stores
const agents: Map<string, Agent> = new Map();
const tools: Map<string, Tool> = new Map();
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

  async updateAgent(id: string, updates: Partial<Omit<Agent, 'id' | 'api_key' | 'created_at'>>): Promise<Agent | null> {
    const agent = agents.get(id);
    if (!agent) {
      return null;
    }

    const updatedAgent: Agent = {
      ...agent,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    agents.set(id, updatedAgent);
    return updatedAgent;
  }

  async regenerateApiKey(id: string, newApiKey: string): Promise<Agent | null> {
    const agent = agents.get(id);
    if (!agent) {
      return null;
    }

    const updatedAgent: Agent = {
      ...agent,
      api_key: newApiKey,
      updated_at: new Date().toISOString(),
    };

    agents.set(id, updatedAgent);
    return updatedAgent;
  }

  async deleteAgent(id: string): Promise<void> {
    agents.delete(id);
    // Also delete associated tools and rules
    for (const [toolId, tool] of tools.entries()) {
      if (tool.agent_id === id) {
        tools.delete(toolId);
      }
    }
    for (const [ruleId, rule] of rules.entries()) {
      if (rule.agent_id === id) {
        rules.delete(ruleId);
      }
    }
  }

  // ==================== TOOLS ====================

  async getTool(id: string): Promise<Tool | null> {
    return tools.get(id) || null;
  }

  async createTool(tool: Tool): Promise<void> {
    tools.set(tool.id, tool);
  }

  async updateTool(id: string, updates: Partial<Omit<Tool, 'id' | 'agent_id' | 'created_at'>>): Promise<Tool | null> {
    const tool = tools.get(id);
    if (!tool) {
      return null;
    }

    const updatedTool: Tool = {
      ...tool,
      ...updates,
    };

    tools.set(id, updatedTool);
    return updatedTool;
  }

  async listToolsForAgent(agentId: string): Promise<Tool[]> {
    const agentTools: Tool[] = [];
    for (const tool of tools.values()) {
      if (tool.agent_id === agentId) {
        agentTools.push(tool);
      }
    }
    return agentTools;
  }

  async deleteTool(id: string): Promise<void> {
    const tool = tools.get(id);
    if (tool) {
      tools.delete(id);
      // Also delete associated rules
      for (const [ruleId, rule] of rules.entries()) {
        if (rule.agent_id === tool.agent_id && rule.tool === tool.name) {
          rules.delete(ruleId);
        }
      }
    }
  }

  // ==================== RULES ====================

  async getRule(id: string): Promise<Rule | null> {
    return rules.get(id) || null;
  }

  async getRulesForAgent(agentId: string, tool: string, scope: string): Promise<Rule[]> {
    const cacheKey = `rules:${agentId}:${tool}:${scope}`;

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
      if (rule.agent_id === agentId && rule.tool === tool && rule.scope === scope) {
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
    this.invalidateRuleCache(rule.agent_id, rule.tool, rule.scope);
  }

  async deleteRule(id: string): Promise<void> {
    const rule = rules.get(id);
    if (rule) {
      rules.delete(id);
      this.invalidateRuleCache(rule.agent_id, rule.tool, rule.scope);
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

  private invalidateRuleCache(agentId: string, tool: string, scope: string): void {
    const cacheKey = `rules:${agentId}:${tool}:${scope}`;
    ruleCache.delete(cacheKey);
    cacheTimes.delete(cacheKey);
  }

  // ==================== LOGS ====================

  async createLog(log: Log): Promise<void> {
    logs.push(log);
  }

  async listLogs(options: {
    limit?: number;
    offset?: number;
    agent_id?: string;
    tool?: string;
    scope?: string;
    allowed?: boolean;
    search?: string;
    from_date?: number;
    to_date?: number;
  } = {}): Promise<{ logs: Log[]; total: number }> {
    const {
      limit = 100,
      offset = 0,
      agent_id,
      tool,
      scope,
      allowed,
      search,
      from_date,
      to_date,
    } = options;

    // Filter logs
    let filteredLogs = [...logs];

    // Agent filter
    if (agent_id) {
      filteredLogs = filteredLogs.filter(log => log.agent_id === agent_id);
    }

    // Tool filter
    if (tool) {
      filteredLogs = filteredLogs.filter(log => log.tool === tool);
    }

    // Scope filter
    if (scope) {
      filteredLogs = filteredLogs.filter(log => log.scope === scope);
    }

    // Status filter
    if (allowed !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.allowed === allowed);
    }

    // Date range filter
    if (from_date) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= from_date);
    }
    if (to_date) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= to_date);
    }

    // Search filter (searches across agent_id, tool, scope, deny_reason)
    if (search) {
      const query = search.toLowerCase();
      filteredLogs = filteredLogs.filter(log =>
        log.agent_id.toLowerCase().includes(query) ||
        log.tool.toLowerCase().includes(query) ||
        log.scope.toLowerCase().includes(query) ||
        (log.deny_reason && log.deny_reason.toLowerCase().includes(query))
      );
    }

    // Sort by timestamp descending (newest first)
    filteredLogs.sort((a, b) => b.timestamp - a.timestamp);

    const total = filteredLogs.length;

    // Paginate
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);

    return { logs: paginatedLogs, total };
  }

  async listLogsForAgent(agentId: string, limit: number = 100): Promise<Log[]> {
    const result = await this.listLogs({ agent_id: agentId, limit });
    return result.logs;
  }

  // ==================== UTILITY ====================

  async clearAll(): Promise<void> {
    agents.clear();
    tools.clear();
    rules.clear();
    logs.length = 0;
    ruleCache.clear();
    cacheTimes.clear();
  }

  async getStats(): Promise<{
    totalAgents: number;
    totalLogs: number;
    denialsToday: number;
    apiCallsToday: number;
  }> {
    // Calculate today's start time
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    // Filter today's logs
    const todayLogs = logs.filter(log => new Date(log.timestamp).getTime() >= todayTimestamp);
    const denialsToday = todayLogs.filter(log => !log.allowed).length;
    const apiCallsToday = todayLogs.length;

    return {
      totalAgents: agents.size,
      totalLogs: logs.length,
      denialsToday,
      apiCallsToday,
    };
  }
}

// Singleton instance
export const storage = new InMemoryStorage();
