/**
 * Code Execution Agent - A simple AI agent that can read/write files and run commands
 * Using Groq for fast inference
 */

import * as fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// Define the tools the agent can use
const tools = [
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: 'Read the contents of a file',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'The file path to read',
          },
        },
        required: ['path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'write_file',
      description: 'Write content to a file',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'The file path to write to',
          },
          content: {
            type: 'string',
            description: 'The content to write',
          },
        },
        required: ['path', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'execute_command',
      description: 'Execute a shell command',
      parameters: {
        type: 'object',
        properties: {
          command: {
            type: 'string',
            description: 'The shell command to execute',
          },
        },
        required: ['command'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_directory',
      description: 'List files in a directory',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'The directory path to list',
          },
        },
        required: ['path'],
      },
    },
  },
];

// Execute a tool and return the result
async function executeTool(name: string, input: Record<string, any>): Promise<string> {
  console.log(`\n🔧 Executing: ${name}`);
  console.log(`   Input: ${JSON.stringify(input)}`);

  try {
    switch (name) {
      case 'read_file': {
        const content = await fs.readFile(input.path, 'utf-8');
        console.log(`   ✅ Read ${content.length} chars from ${input.path}`);
        return content.slice(0, 2000); // Limit for context
      }

      case 'write_file': {
        await fs.writeFile(input.path, input.content, 'utf-8');
        console.log(`   ✅ Wrote ${input.content.length} chars to ${input.path}`);
        return `Successfully wrote to ${input.path}`;
      }

      case 'execute_command': {
        const { stdout, stderr } = await execAsync(input.command, {
          timeout: 30000,
          cwd: process.cwd(),
        });
        const output = stdout || stderr || '(no output)';
        console.log(`   ✅ Command completed`);
        return output.slice(0, 2000); // Limit for context
      }

      case 'list_directory': {
        const files = await fs.readdir(input.path);
        console.log(`   ✅ Found ${files.length} items`);
        return files.join('\n');
      }

      default:
        return `Unknown tool: ${name}`;
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    return `Error: ${error.message}`;
  }
}

// Call Groq API
async function callGroq(messages: any[], useTools = true): Promise<any> {
  const body: any = {
    model: GROQ_MODEL,
    messages,
    max_tokens: 4096,
  };

  if (useTools) {
    body.tools = tools;
    body.tool_choice = 'auto';
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    // If tool calling fails, retry without tools
    if (error.includes('tool_use_failed') && useTools) {
      console.log('   ⚠️ Tool call format issue, getting final response...');
      return callGroq(messages, false);
    }
    throw new Error(`Groq API error: ${response.status} ${error}`);
  }

  return response.json();
}

// Main agent loop
export async function runAgent(userPrompt: string) {
  console.log('\n' + '='.repeat(60));
  console.log('🤖 Code Execution Agent (Powered by Groq)');
  console.log('='.repeat(60));
  console.log(`\n📝 Task: ${userPrompt}\n`);

  const messages: any[] = [
    {
      role: 'system',
      content: 'You are a code execution agent. You can read files, write files, list directories, and execute shell commands. Do exactly what the user asks - no more, no less. Be direct and concise. Only use one tool at a time.',
    },
    { role: 'user', content: userPrompt },
  ];

  let response = await callGroq(messages);
  let choice = response.choices[0];

  // Agentic loop - keep going until no more tool calls
  while (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
    // Add assistant message with tool calls
    messages.push(choice.message);

    // Execute each tool call
    for (const toolCall of choice.message.tool_calls) {
      const name = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);

      const result = await executeTool(name, args);

      // Add tool result
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: result,
      });
    }

    // Get next response
    response = await callGroq(messages);
    choice = response.choices[0];
  }

  // Final response
  const finalText = choice.message.content || '(no response)';

  console.log('\n' + '='.repeat(60));
  console.log('✨ Result:');
  console.log('='.repeat(60));
  console.log(finalText);

  return finalText;
}

// Run if called directly
const prompt = process.argv[2];
if (prompt) {
  runAgent(prompt).catch(console.error);
} else {
  console.log('Usage: GROQ_API_KEY=... npx tsx src/agent.ts "your prompt here"');
}
