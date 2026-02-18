/**
 * Storage layer for OakAuth
 *
 * D1Storage: Production storage using Cloudflare D1 (SQLite)
 * InMemoryStorage: Local development without D1
 *
 * Use createStorage(env) to get the right implementation.
 */

import { Agent, Rule, Log, Tool } from '@agent-auth/shared';

// ==================== STORAGE INTERFACE ====================

export interface Storage {
  // Agents
  getAgent(id: string): Promise<Agent | null>;
  getAgentByApiKey(apiKeyHash: string): Promise<Agent | null>;
  createAgent(agent: Agent): Promise<void>;
  listAgents(): Promise<Agent[]>;
  updateAgent(id: string, updates: Partial<Omit<Agent, 'id' | 'api_key' | 'created_at'>>): Promise<Agent | null>;
  regenerateApiKey(id: string, newApiKeyHash: string): Promise<Agent | null>;
  deleteAgent(id: string): Promise<void>;

  // Tools
  getTool(id: string): Promise<Tool | null>;
  createTool(tool: Tool): Promise<void>;
  updateTool(id: string, updates: Partial<Omit<Tool, 'id' | 'agent_id' | 'created_at'>>): Promise<Tool | null>;
  listToolsForAgent(agentId: string): Promise<Tool[]>;
  deleteTool(id: string): Promise<void>;

  // Rules
  getRule(id: string): Promise<Rule | null>;
  getRulesForAgent(agentId: string, tool: string, scope: string): Promise<Rule[]>;
  createRule(rule: Rule): Promise<void>;
  deleteRule(id: string): Promise<void>;
  listRulesForAgent(agentId: string): Promise<Rule[]>;

  // Logs
  createLog(log: Log): Promise<void>;
  listLogs(options?: ListLogsOptions): Promise<{ logs: Log[]; total: number }>;
  listLogsForAgent(agentId: string, limit?: number): Promise<Log[]>;

  // Token Revocation
  revokeToken(jti: string): Promise<void>;
  isTokenRevoked(jti: string): Promise<boolean>;

  // Utility
  clearAll(): Promise<void>;
  getStats(): Promise<{ totalAgents: number; totalLogs: number; denialsToday: number; apiCallsToday: number }>;
}

interface ListLogsOptions {
  limit?: number;
  offset?: number;
  agent_id?: string;
  tool?: string;
  scope?: string;
  allowed?: boolean;
  search?: string;
  from_date?: number;
  to_date?: number;
}

// ==================== D1 STORAGE ====================

export class D1Storage implements Storage {
  constructor(private db: D1Database) {}

  // --- Agents ---

  async getAgent(id: string): Promise<Agent | null> {
    const row = await this.db.prepare('SELECT * FROM agents WHERE id = ?').bind(id).first();
    return row ? this.rowToAgent(row) : null;
  }

  async getAgentByApiKey(apiKeyHash: string): Promise<Agent | null> {
    const row = await this.db.prepare('SELECT * FROM agents WHERE api_key_hash = ?').bind(apiKeyHash).first();
    return row ? this.rowToAgent(row) : null;
  }

  async createAgent(agent: Agent): Promise<void> {
    await this.db.prepare(
      'INSERT INTO agents (id, name, api_key_hash, enabled, rate_limit, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      agent.id,
      agent.name,
      agent.api_key, // caller passes the hash in the api_key field
      agent.enabled ? 1 : 0,
      agent.rate_limit ?? null,
      agent.created_at,
      agent.updated_at ?? null,
    ).run();
  }

  async listAgents(): Promise<Agent[]> {
    const { results } = await this.db.prepare('SELECT * FROM agents ORDER BY created_at DESC').all();
    return results.map(row => this.rowToAgent(row));
  }

  async updateAgent(id: string, updates: Partial<Omit<Agent, 'id' | 'api_key' | 'created_at'>>): Promise<Agent | null> {
    const existing = await this.getAgent(id);
    if (!existing) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
    if (updates.enabled !== undefined) { fields.push('enabled = ?'); values.push(updates.enabled ? 1 : 0); }
    if (updates.rate_limit !== undefined) { fields.push('rate_limit = ?'); values.push(updates.rate_limit); }

    const now = new Date().toISOString();
    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await this.db.prepare(`UPDATE agents SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
    return this.getAgent(id);
  }

  async regenerateApiKey(id: string, newApiKeyHash: string): Promise<Agent | null> {
    const existing = await this.getAgent(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    await this.db.prepare('UPDATE agents SET api_key_hash = ?, updated_at = ? WHERE id = ?')
      .bind(newApiKeyHash, now, id).run();
    return this.getAgent(id);
  }

  async deleteAgent(id: string): Promise<void> {
    // CASCADE handles tools and rules deletion
    await this.db.prepare('DELETE FROM agents WHERE id = ?').bind(id).run();
  }

  // --- Tools ---

  async getTool(id: string): Promise<Tool | null> {
    const row = await this.db.prepare('SELECT * FROM tools WHERE id = ?').bind(id).first();
    return row ? this.rowToTool(row) : null;
  }

  async createTool(tool: Tool): Promise<void> {
    await this.db.prepare(
      'INSERT INTO tools (id, agent_id, name, scopes, description, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      tool.id,
      tool.agent_id,
      tool.name,
      JSON.stringify(tool.scopes), // store as JSON text
      tool.description ?? null,
      tool.created_at,
    ).run();
  }

  async updateTool(id: string, updates: Partial<Omit<Tool, 'id' | 'agent_id' | 'created_at'>>): Promise<Tool | null> {
    const existing = await this.getTool(id);
    if (!existing) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
    if (updates.scopes !== undefined) { fields.push('scopes = ?'); values.push(JSON.stringify(updates.scopes)); }
    if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }

    if (fields.length === 0) return existing;

    values.push(id);
    await this.db.prepare(`UPDATE tools SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
    return this.getTool(id);
  }

  async listToolsForAgent(agentId: string): Promise<Tool[]> {
    const { results } = await this.db.prepare('SELECT * FROM tools WHERE agent_id = ?').bind(agentId).all();
    return results.map(row => this.rowToTool(row));
  }

  async deleteTool(id: string): Promise<void> {
    const tool = await this.getTool(id);
    if (tool) {
      // Delete associated rules first
      await this.db.prepare('DELETE FROM rules WHERE agent_id = ? AND tool = ?')
        .bind(tool.agent_id, tool.name).run();
      await this.db.prepare('DELETE FROM tools WHERE id = ?').bind(id).run();
    }
  }

  // --- Rules ---

  async getRule(id: string): Promise<Rule | null> {
    const row = await this.db.prepare('SELECT * FROM rules WHERE id = ?').bind(id).first();
    return row ? this.rowToRule(row) : null;
  }

  async getRulesForAgent(agentId: string, tool: string, scope: string): Promise<Rule[]> {
    const { results } = await this.db.prepare(
      'SELECT * FROM rules WHERE agent_id = ? AND tool = ? AND scope = ?'
    ).bind(agentId, tool, scope).all();
    return results.map(row => this.rowToRule(row));
  }

  async createRule(rule: Rule): Promise<void> {
    await this.db.prepare(
      'INSERT INTO rules (id, agent_id, tool, scope, require_reasoning, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      rule.id,
      rule.agent_id,
      rule.tool,
      rule.scope,
      rule.require_reasoning ?? 'none',
      rule.created_at,
    ).run();
  }

  async deleteRule(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM rules WHERE id = ?').bind(id).run();
  }

  async listRulesForAgent(agentId: string): Promise<Rule[]> {
    const { results } = await this.db.prepare('SELECT * FROM rules WHERE agent_id = ?').bind(agentId).all();
    return results.map(row => this.rowToRule(row));
  }

  // --- Logs ---

  async createLog(log: Log): Promise<void> {
    await this.db.prepare(
      'INSERT INTO logs (id, agent_id, tool, scope, allowed, deny_reason, request_details, reasoning, reasoning_required, reasoning_provided, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      log.id,
      log.agent_id,
      log.tool,
      log.scope,
      log.allowed ? 1 : 0,
      log.deny_reason ?? null,
      log.request_details,
      log.reasoning ?? null,
      log.reasoning_required ?? 'none',
      log.reasoning_provided ? 1 : 0,
      log.timestamp,
    ).run();
  }

  async listLogs(options: ListLogsOptions = {}): Promise<{ logs: Log[]; total: number }> {
    const { limit = 100, offset = 0, agent_id, tool, scope, allowed, search, from_date, to_date } = options;

    const conditions: string[] = [];
    const params: any[] = [];

    if (agent_id) { conditions.push('agent_id = ?'); params.push(agent_id); }
    if (tool) { conditions.push('tool = ?'); params.push(tool); }
    if (scope) { conditions.push('scope = ?'); params.push(scope); }
    if (allowed !== undefined) { conditions.push('allowed = ?'); params.push(allowed ? 1 : 0); }
    if (from_date) { conditions.push('timestamp >= ?'); params.push(from_date); }
    if (to_date) { conditions.push('timestamp <= ?'); params.push(to_date); }
    if (search) {
      conditions.push('(agent_id LIKE ? OR tool LIKE ? OR scope LIKE ? OR deny_reason LIKE ?)');
      const q = `%${search}%`;
      params.push(q, q, q, q);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await this.db.prepare(`SELECT COUNT(*) as count FROM logs ${where}`).bind(...params).first();
    const total = (countResult as any)?.count ?? 0;

    // Get paginated results
    const { results } = await this.db.prepare(
      `SELECT * FROM logs ${where} ORDER BY timestamp DESC LIMIT ? OFFSET ?`
    ).bind(...params, limit, offset).all();

    return { logs: results.map(row => this.rowToLog(row)), total };
  }

  async listLogsForAgent(agentId: string, limit: number = 100): Promise<Log[]> {
    const result = await this.listLogs({ agent_id: agentId, limit });
    return result.logs;
  }

  // --- Token Revocation ---

  async revokeToken(jti: string): Promise<void> {
    await this.db.prepare('INSERT OR IGNORE INTO revoked_tokens (jti, revoked_at) VALUES (?, ?)')
      .bind(jti, Date.now()).run();
  }

  async isTokenRevoked(jti: string): Promise<boolean> {
    const row = await this.db.prepare('SELECT jti FROM revoked_tokens WHERE jti = ?').bind(jti).first();
    return row !== null;
  }

  // --- Utility ---

  async clearAll(): Promise<void> {
    await this.db.batch([
      this.db.prepare('DELETE FROM logs'),
      this.db.prepare('DELETE FROM rules'),
      this.db.prepare('DELETE FROM tools'),
      this.db.prepare('DELETE FROM agents'),
      this.db.prepare('DELETE FROM revoked_tokens'),
    ]);
  }

  async getStats(): Promise<{ totalAgents: number; totalLogs: number; denialsToday: number; apiCallsToday: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTs = today.getTime();

    const [agentCount, logCount, todayDenials, todayCalls] = await this.db.batch([
      this.db.prepare('SELECT COUNT(*) as count FROM agents'),
      this.db.prepare('SELECT COUNT(*) as count FROM logs'),
      this.db.prepare('SELECT COUNT(*) as count FROM logs WHERE allowed = 0 AND timestamp >= ?').bind(todayTs),
      this.db.prepare('SELECT COUNT(*) as count FROM logs WHERE timestamp >= ?').bind(todayTs),
    ]);

    return {
      totalAgents: (agentCount.results[0] as any)?.count ?? 0,
      totalLogs: (logCount.results[0] as any)?.count ?? 0,
      denialsToday: (todayDenials.results[0] as any)?.count ?? 0,
      apiCallsToday: (todayCalls.results[0] as any)?.count ?? 0,
    };
  }

  // --- Row mappers ---

  private rowToAgent(row: Record<string, unknown>): Agent {
    return {
      id: row.id as string,
      name: row.name as string,
      api_key: row.api_key_hash as string, // D1 column is api_key_hash, maps to api_key field
      enabled: row.enabled === 1,
      rate_limit: row.rate_limit as number | undefined,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string | undefined,
    };
  }

  private rowToTool(row: Record<string, unknown>): Tool {
    return {
      id: row.id as string,
      agent_id: row.agent_id as string,
      name: row.name as string,
      scopes: JSON.parse(row.scopes as string),
      description: row.description as string | undefined,
      created_at: row.created_at as string,
    };
  }

  private rowToRule(row: Record<string, unknown>): Rule {
    return {
      id: row.id as string,
      agent_id: row.agent_id as string,
      tool: row.tool as string,
      scope: row.scope as string,
      require_reasoning: (row.require_reasoning as Rule['require_reasoning']) ?? 'none',
      created_at: row.created_at as number,
    };
  }

  private rowToLog(row: Record<string, unknown>): Log {
    return {
      id: row.id as string,
      agent_id: row.agent_id as string,
      tool: row.tool as string,
      scope: row.scope as string,
      allowed: row.allowed === 1,
      deny_reason: row.deny_reason as string | null,
      request_details: row.request_details as string,
      reasoning: row.reasoning as string | undefined,
      reasoning_required: (row.reasoning_required as Log['reasoning_required']) ?? 'none',
      reasoning_provided: row.reasoning_provided === 1,
      timestamp: row.timestamp as number,
    };
  }
}

// ==================== IN-MEMORY STORAGE ====================

export class InMemoryStorage implements Storage {
  private agents: Map<string, Agent> = new Map();
  private tools: Map<string, Tool> = new Map();
  private rules: Map<string, Rule> = new Map();
  private logs: Log[] = [];
  private revokedTokens: Set<string> = new Set();

  async getAgent(id: string): Promise<Agent | null> {
    return this.agents.get(id) || null;
  }

  async getAgentByApiKey(apiKey: string): Promise<Agent | null> {
    for (const agent of this.agents.values()) {
      if (agent.api_key === apiKey) return agent;
    }
    return null;
  }

  async createAgent(agent: Agent): Promise<void> {
    this.agents.set(agent.id, agent);
  }

  async listAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async updateAgent(id: string, updates: Partial<Omit<Agent, 'id' | 'api_key' | 'created_at'>>): Promise<Agent | null> {
    const agent = this.agents.get(id);
    if (!agent) return null;
    const updated: Agent = { ...agent, ...updates, updated_at: new Date().toISOString() };
    this.agents.set(id, updated);
    return updated;
  }

  async regenerateApiKey(id: string, newApiKey: string): Promise<Agent | null> {
    const agent = this.agents.get(id);
    if (!agent) return null;
    const updated: Agent = { ...agent, api_key: newApiKey, updated_at: new Date().toISOString() };
    this.agents.set(id, updated);
    return updated;
  }

  async deleteAgent(id: string): Promise<void> {
    this.agents.delete(id);
    for (const [toolId, tool] of this.tools.entries()) {
      if (tool.agent_id === id) this.tools.delete(toolId);
    }
    for (const [ruleId, rule] of this.rules.entries()) {
      if (rule.agent_id === id) this.rules.delete(ruleId);
    }
  }

  async getTool(id: string): Promise<Tool | null> {
    return this.tools.get(id) || null;
  }

  async createTool(tool: Tool): Promise<void> {
    this.tools.set(tool.id, tool);
  }

  async updateTool(id: string, updates: Partial<Omit<Tool, 'id' | 'agent_id' | 'created_at'>>): Promise<Tool | null> {
    const tool = this.tools.get(id);
    if (!tool) return null;
    const updated: Tool = { ...tool, ...updates };
    this.tools.set(id, updated);
    return updated;
  }

  async listToolsForAgent(agentId: string): Promise<Tool[]> {
    return Array.from(this.tools.values()).filter(t => t.agent_id === agentId);
  }

  async deleteTool(id: string): Promise<void> {
    const tool = this.tools.get(id);
    if (tool) {
      this.tools.delete(id);
      for (const [ruleId, rule] of this.rules.entries()) {
        if (rule.agent_id === tool.agent_id && rule.tool === tool.name) this.rules.delete(ruleId);
      }
    }
  }

  async getRule(id: string): Promise<Rule | null> {
    return this.rules.get(id) || null;
  }

  async getRulesForAgent(agentId: string, tool: string, scope: string): Promise<Rule[]> {
    return Array.from(this.rules.values()).filter(
      r => r.agent_id === agentId && r.tool === tool && r.scope === scope
    );
  }

  async createRule(rule: Rule): Promise<void> {
    this.rules.set(rule.id, rule);
  }

  async deleteRule(id: string): Promise<void> {
    this.rules.delete(id);
  }

  async listRulesForAgent(agentId: string): Promise<Rule[]> {
    return Array.from(this.rules.values()).filter(r => r.agent_id === agentId);
  }

  async createLog(log: Log): Promise<void> {
    this.logs.push(log);
  }

  async listLogs(options: ListLogsOptions = {}): Promise<{ logs: Log[]; total: number }> {
    const { limit = 100, offset = 0, agent_id, tool, scope, allowed, search, from_date, to_date } = options;
    let filtered = [...this.logs];

    if (agent_id) filtered = filtered.filter(l => l.agent_id === agent_id);
    if (tool) filtered = filtered.filter(l => l.tool === tool);
    if (scope) filtered = filtered.filter(l => l.scope === scope);
    if (allowed !== undefined) filtered = filtered.filter(l => l.allowed === allowed);
    if (from_date) filtered = filtered.filter(l => l.timestamp >= from_date);
    if (to_date) filtered = filtered.filter(l => l.timestamp <= to_date);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(l =>
        l.agent_id.toLowerCase().includes(q) ||
        l.tool.toLowerCase().includes(q) ||
        l.scope.toLowerCase().includes(q) ||
        (l.deny_reason && l.deny_reason.toLowerCase().includes(q))
      );
    }

    filtered.sort((a, b) => b.timestamp - a.timestamp);
    const total = filtered.length;
    return { logs: filtered.slice(offset, offset + limit), total };
  }

  async listLogsForAgent(agentId: string, limit: number = 100): Promise<Log[]> {
    const result = await this.listLogs({ agent_id: agentId, limit });
    return result.logs;
  }

  async revokeToken(jti: string): Promise<void> {
    this.revokedTokens.add(jti);
  }

  async isTokenRevoked(jti: string): Promise<boolean> {
    return this.revokedTokens.has(jti);
  }

  async clearAll(): Promise<void> {
    this.agents.clear();
    this.tools.clear();
    this.rules.clear();
    this.logs.length = 0;
    this.revokedTokens.clear();
  }

  async getStats(): Promise<{ totalAgents: number; totalLogs: number; denialsToday: number; apiCallsToday: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTs = today.getTime();
    const todayLogs = this.logs.filter(l => l.timestamp >= todayTs);
    return {
      totalAgents: this.agents.size,
      totalLogs: this.logs.length,
      denialsToday: todayLogs.filter(l => !l.allowed).length,
      apiCallsToday: todayLogs.length,
    };
  }
}

// ==================== FACTORY ====================

export function createStorage(env: { DB?: D1Database }): Storage {
  if (env.DB) {
    return new D1Storage(env.DB);
  }
  return new InMemoryStorage();
}
