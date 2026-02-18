/**
 * Test Data Seeding
 * Populates storage with sample agents, tools, and rules
 */

import { Agent, Tool, Rule } from '@agent-auth/shared';
import { Storage } from './storage';
import { generateId, generateApiKey, hashApiKey } from './utils';

export async function seedTestData(storage: Storage): Promise<{ agents: Array<{ name: string; apiKey: string }> }> {
  console.log('Seeding test data...');

  await storage.clearAll();

  const createdAgents: Array<{ name: string; apiKey: string }> = [];

  // --- Agent 1: CRM Agent (with reasoning enforcement) ---
  const apiKey1 = generateApiKey();
  const agent1: Agent = {
    id: generateId(),
    name: 'CRM Agent',
    api_key: await hashApiKey(apiKey1),
    created_at: new Date().toISOString(),
    enabled: true,
    rate_limit: 60,
  };
  await storage.createAgent(agent1);
  createdAgents.push({ name: agent1.name, apiKey: apiKey1 });

  const tool1: Tool = {
    id: generateId(),
    agent_id: agent1.id,
    name: 'crm',
    scopes: ['read:contacts', 'write:contacts', 'delete:contacts'],
    description: 'CRM system access',
    created_at: new Date().toISOString(),
  };
  await storage.createTool(tool1);

  // read = no reasoning, write = soft, delete = hard
  await storage.createRule({
    id: generateId(), agent_id: agent1.id, tool: 'crm', scope: 'read:contacts',
    require_reasoning: 'none', created_at: Date.now(),
  });
  await storage.createRule({
    id: generateId(), agent_id: agent1.id, tool: 'crm', scope: 'write:contacts',
    require_reasoning: 'soft', created_at: Date.now(),
  });
  await storage.createRule({
    id: generateId(), agent_id: agent1.id, tool: 'crm', scope: 'delete:contacts',
    require_reasoning: 'hard', created_at: Date.now(),
  });

  // --- Agent 2: Email Agent ---
  const apiKey2 = generateApiKey();
  const agent2: Agent = {
    id: generateId(),
    name: 'Email Agent',
    api_key: await hashApiKey(apiKey2),
    created_at: new Date().toISOString(),
    enabled: true,
  };
  await storage.createAgent(agent2);
  createdAgents.push({ name: agent2.name, apiKey: apiKey2 });

  const tool2: Tool = {
    id: generateId(),
    agent_id: agent2.id,
    name: 'email',
    scopes: ['read:inbox', 'send:email'],
    description: 'Email system access',
    created_at: new Date().toISOString(),
  };
  await storage.createTool(tool2);

  await storage.createRule({
    id: generateId(), agent_id: agent2.id, tool: 'email', scope: 'read:inbox',
    require_reasoning: 'none', created_at: Date.now(),
  });
  await storage.createRule({
    id: generateId(), agent_id: agent2.id, tool: 'email', scope: 'send:email',
    require_reasoning: 'hard', created_at: Date.now(),
  });

  // --- Agent 3: Disabled Agent ---
  const apiKey3 = generateApiKey();
  const agent3: Agent = {
    id: generateId(),
    name: 'Disabled Agent',
    api_key: await hashApiKey(apiKey3),
    created_at: new Date().toISOString(),
    enabled: false,
  };
  await storage.createAgent(agent3);
  createdAgents.push({ name: agent3.name, apiKey: apiKey3 });

  const stats = await storage.getStats();
  console.log('Test data seeded successfully!');
  console.log(`  Agents: ${stats.totalAgents}`);
  console.log(`  Logs: ${stats.totalLogs}`);

  return { agents: createdAgents };
}
