-- Migration 0001: Initial Schema
-- Creates the core tables for agents, rules, and audit logs

-- Agents table
-- Stores information about AI agents that use the proxy
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  created_at INTEGER NOT NULL,
  enabled BOOLEAN DEFAULT 1
);

-- Rules table
-- Defines permission rules for each agent
CREATE TABLE rules (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  tool TEXT NOT NULL,
  action TEXT NOT NULL,
  conditions TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

-- Logs table
-- Audit trail of all agent requests (allowed and denied)
CREATE TABLE logs (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  tool TEXT NOT NULL,
  action TEXT NOT NULL,
  allowed BOOLEAN NOT NULL,
  deny_reason TEXT,
  request_details TEXT,
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);
