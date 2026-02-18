-- OakAuth D1 Schema

CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  api_key_hash TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  rate_limit INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT
);

CREATE TABLE tools (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  scopes TEXT NOT NULL,  -- JSON array stored as text
  description TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE rules (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  tool TEXT NOT NULL,
  scope TEXT NOT NULL,
  require_reasoning TEXT NOT NULL DEFAULT 'none',
  created_at INTEGER NOT NULL
);

CREATE TABLE logs (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  tool TEXT NOT NULL,
  scope TEXT NOT NULL,
  allowed INTEGER NOT NULL,
  deny_reason TEXT,
  request_details TEXT,
  reasoning TEXT,
  reasoning_required TEXT DEFAULT 'none',
  reasoning_provided INTEGER NOT NULL DEFAULT 0,
  timestamp INTEGER NOT NULL
);

CREATE TABLE revoked_tokens (
  jti TEXT PRIMARY KEY,
  revoked_at INTEGER NOT NULL
);

CREATE INDEX idx_agents_api_key_hash ON agents(api_key_hash);
CREATE INDEX idx_tools_agent ON tools(agent_id);
CREATE INDEX idx_rules_agent_tool_scope ON rules(agent_id, tool, scope);
CREATE INDEX idx_logs_agent ON logs(agent_id);
CREATE INDEX idx_logs_timestamp ON logs(timestamp DESC);
CREATE INDEX idx_logs_allowed ON logs(allowed);
