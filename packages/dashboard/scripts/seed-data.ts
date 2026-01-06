/**
 * Seed test data for agent-auth platform
 * Run with: npx tsx scripts/seed-data.ts
 */

const API_URL = 'http://localhost:65534';

interface Agent {
  id: string;
  name: string;
  api_key: string;
}

const tools = [
  'read_file',
  'write_file',
  'execute_command',
  'network_request',
  'database_query',
  'send_email',
  'create_user',
  'delete_record',
  'upload_file',
  'process_payment'
];

const scopes = [
  '/home/user/documents',
  '/var/www/html',
  '/etc/config',
  '/tmp/uploads',
  '/data/exports',
  '/api/v1/users',
  '/api/v1/orders',
  '/admin/settings',
  '/public/assets',
  '/backup/daily'
];

async function createAgents(): Promise<Agent[]> {
  const agents: Agent[] = [];

  const agentNames = [
    'Production Bot',
    'Development Assistant',
    'CI/CD Pipeline',
    'Data Processor',
    'Content Moderator',
    'Analytics Agent',
    'Backup Service',
    'Monitoring Bot'
  ];

  for (const name of agentNames) {
    // Create agent
    const response = await fetch(`${API_URL}/admin/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description: `Test agent: ${name}`
      })
    });

    if (response.ok) {
      const agent = await response.json();

      // Pick random tools and scopes for this agent
      const numTools = Math.floor(Math.random() * tools.length) + 2;
      const agentTools = tools.slice(0, numTools);

      // Create tools for this agent
      for (const tool of agentTools) {
        const numScopes = Math.floor(Math.random() * scopes.length) + 2;
        const toolScopes = scopes.slice(0, numScopes);

        const toolResponse = await fetch(`${API_URL}/admin/tools`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agent_id: agent.id,
            name: tool,
            scopes: toolScopes,
            description: `${tool} tool for ${name}`
          })
        });

        if (toolResponse.ok) {
          // Create rules for some of the scopes (60% chance per scope)
          for (const scope of toolScopes) {
            if (Math.random() > 0.4) {
              await fetch(`${API_URL}/admin/rules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  agent_id: agent.id,
                  tool,
                  scope
                })
              });
            }
          }
        }
      }

      agents.push(agent);
      console.log(`✅ Created agent: ${name} with ${agentTools.length} tools`);
    } else {
      console.error(`❌ Failed to create agent: ${name}`);
    }
  }

  return agents;
}

async function createLogs(agents: Agent[]): Promise<void> {
  // Create logs from the past 30 days
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

  let totalLogs = 0;
  let allowedCount = 0;
  let deniedCount = 0;

  // Generate 200 log entries by actually calling the validate endpoint
  for (let i = 0; i < 200; i++) {
    const agent = agents[Math.floor(Math.random() * agents.length)];

    // Fetch agent's tools to understand what's configured
    const toolsResponse = await fetch(`${API_URL}/admin/agents/${agent.id}/tools`);
    const toolsData = await toolsResponse.json();
    const agentTools = toolsData.tools || [];

    let tool: string;
    let scope: string;

    // 70% of the time, use configured tools/scopes
    if (Math.random() > 0.3 && agentTools.length > 0) {
      const randomTool = agentTools[Math.floor(Math.random() * agentTools.length)];
      tool = randomTool.name;
      scope = randomTool.scopes[Math.floor(Math.random() * randomTool.scopes.length)];
    } else {
      // 30% of the time, use random tools/scopes (may not be configured)
      tool = tools[Math.floor(Math.random() * tools.length)];
      scope = scopes[Math.floor(Math.random() * scopes.length)];
    }

    // Make actual validation request
    const response = await fetch(`${API_URL}/v1/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agent_id: agent.id,
        tool,
        scope
      })
    });

    if (response.ok) {
      const result = await response.json();
      totalLogs++;
      if (result.allowed) allowedCount++;
      else deniedCount++;

      if (totalLogs % 20 === 0) {
        console.log(`📝 Created ${totalLogs} logs...`);
      }
    }
  }

  console.log(`\n✅ Created ${totalLogs} total logs`);
  console.log(`   ✓ ${allowedCount} allowed`);
  console.log(`   ✗ ${deniedCount} denied`);
}

async function main() {
  console.log('🌱 Seeding test data...\n');

  try {
    // Create agents
    console.log('Creating agents...');
    const agents = await createAgents();

    if (agents.length === 0) {
      console.error('❌ No agents created. Exiting.');
      return;
    }

    console.log(`\n✅ Created ${agents.length} agents\n`);

    // Create logs
    console.log('Creating logs...');
    await createLogs(agents);

    console.log('\n🎉 Seeding complete!');
    console.log('\n📊 Test data summary:');
    console.log(`   Agents: ${agents.length}`);
    console.log(`   Tools: ${tools.length}`);
    console.log(`   Scopes: ${scopes.length}`);
    console.log('\n🔗 Visit http://localhost:3000/logs to view the data');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

main();
