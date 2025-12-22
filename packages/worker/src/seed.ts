/**
 * Test Data Seeding
 * Populates in-memory storage with sample agents and rules
 */

import { Agent, Rule } from '@agent-auth/shared';
import { storage } from './storage';
import { generateId } from './utils';

export async function seedTestData(): Promise<void> {
  console.log('Seeding test data...');

  // Clear existing data
  await storage.clearAll();

  // Create test agents
  const agent1: Agent = {
    id: 'agent-test-1',
    name: 'Calendar Assistant',
    api_key: 'test-key-123',
    created_at: Date.now(),
    enabled: true,
  };

  const agent2: Agent = {
    id: 'agent-test-2',
    name: 'Meeting Scheduler',
    api_key: 'test-key-456',
    created_at: Date.now(),
    enabled: true,
  };

  const agent3: Agent = {
    id: 'agent-disabled',
    name: 'Disabled Agent',
    api_key: 'test-key-disabled',
    created_at: Date.now(),
    enabled: false,
  };

  await storage.createAgent(agent1);
  await storage.createAgent(agent2);
  await storage.createAgent(agent3);

  console.log('✓ Created 3 test agents');

  // Create rules for agent1 (restrictive)
  const rule1: Rule = {
    id: generateId(),
    agent_id: 'agent-test-1',
    tool: 'google_calendar',
    action: 'create_event',
    conditions: JSON.stringify({
      max_duration: 30, // 30 minutes max
      max_attendees: 5, // 5 attendees max
    }),
    created_at: Date.now(),
  };

  const rule2: Rule = {
    id: generateId(),
    agent_id: 'agent-test-1',
    tool: 'google_calendar',
    action: 'update_event',
    conditions: JSON.stringify({
      max_duration: 60, // 60 minutes max for updates
    }),
    created_at: Date.now(),
  };

  await storage.createRule(rule1);
  await storage.createRule(rule2);

  console.log('✓ Created 2 rules for agent-test-1');

  // Create rules for agent2 (more permissive, business hours only)
  const rule3: Rule = {
    id: generateId(),
    agent_id: 'agent-test-2',
    tool: 'google_calendar',
    action: 'create_event',
    conditions: JSON.stringify({
      max_duration: 120, // 2 hours max
      business_hours_only: true,
    }),
    created_at: Date.now(),
  };

  const rule4: Rule = {
    id: generateId(),
    agent_id: 'agent-test-2',
    tool: 'google_calendar',
    action: 'delete_event',
    conditions: JSON.stringify({}), // Allow all deletes
    created_at: Date.now(),
  };

  const rule5: Rule = {
    id: generateId(),
    agent_id: 'agent-test-2',
    tool: 'google_calendar',
    action: 'list_events',
    conditions: JSON.stringify({}), // Allow all lists
    created_at: Date.now(),
  };

  await storage.createRule(rule3);
  await storage.createRule(rule4);
  await storage.createRule(rule5);

  console.log('✓ Created 3 rules for agent-test-2');

  const stats = await storage.getStats();
  console.log(`\nTest data seeded successfully!`);
  console.log(`  Agents: ${stats.agentCount}`);
  console.log(`  Rules: ${stats.ruleCount}`);
  console.log(`  Logs: ${stats.logCount}`);
  console.log('\nTest Agents:');
  console.log('  1. agent-test-1 (Calendar Assistant)');
  console.log('     API Key: test-key-123');
  console.log('     Rules: max 30min events, max 5 attendees');
  console.log('  2. agent-test-2 (Meeting Scheduler)');
  console.log('     API Key: test-key-456');
  console.log('     Rules: max 120min events, business hours only');
  console.log('  3. agent-disabled (Disabled)');
  console.log('     API Key: test-key-disabled (won\'t work)');
}
