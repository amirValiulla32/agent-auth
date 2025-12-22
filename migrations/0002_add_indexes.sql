-- Migration 0002: Add Indexes
-- Creates indexes for optimal query performance

-- Index for looking up agents by API key (authentication)
CREATE INDEX idx_agents_api_key ON agents(api_key);

-- Index for looking up rules by agent
CREATE INDEX idx_rules_agent ON rules(agent_id);

-- Index for querying logs by agent and timestamp
CREATE INDEX idx_logs_agent_timestamp ON logs(agent_id, timestamp);

-- Index for querying logs by timestamp (for global log views)
CREATE INDEX idx_logs_timestamp ON logs(timestamp DESC);
