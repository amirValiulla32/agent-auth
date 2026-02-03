# OakAuth SDK Design

## Overview

Transform OakAuth from a platform-only product to an **open core** model:
- **Open source SDK** (`oakauth` npm package) - free, builds trust & adoption
- **Hosted backend** (oakauth.com) - paid product, where the money comes from

Start with MCP (Model Context Protocol) integration, expand to LangChain/CrewAI later.

## What We're Building

A simple SDK that wraps AI agent tool calls with permission checks and audit logging.

```typescript
import { OakAuth } from 'oakauth';

const oak = new OakAuth({
  agentId: 'my-agent',
  apiKey: 'oak_...'  // from oakauth.com dashboard
});

// Guard any tool call
const result = await oak.guard({
  tool: 'filesystem',
  action: 'write',
  reasoning: 'Saving user config file',
}, async () => {
  return fs.writeFile(path, data);
});
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Developer's Agent                        │
│                                                             │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│   │ MCP Tool 1  │    │ MCP Tool 2  │    │ MCP Tool 3  │   │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘   │
│          │                  │                  │           │
│          └──────────────────┼──────────────────┘           │
│                             │                               │
│                    ┌────────▼────────┐                     │
│                    │  OakAuth SDK    │                     │
│                    │  (npm package)  │                     │
│                    └────────┬────────┘                     │
└─────────────────────────────┼───────────────────────────────┘
                              │
                              ▼ HTTPS
                    ┌─────────────────┐
                    │  OakAuth API    │
                    │  (Cloudflare)   │
                    │                 │
                    │ • Validate      │
                    │ • Log           │
                    │ • Rate limit    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Dashboard     │
                    │  (oakauth.com)  │
                    │                 │
                    │ • View logs     │
                    │ • Manage perms  │
                    │ • Analytics     │
                    └─────────────────┘
```

## SDK Package Structure

```
oakauth/
├── packages/
│   ├── core/                 # Core SDK (framework-agnostic)
│   │   ├── src/
│   │   │   ├── client.ts     # API client
│   │   │   ├── guard.ts      # Permission guard function
│   │   │   ├── types.ts      # TypeScript types
│   │   │   └── index.ts      # Exports
│   │   └── package.json      # "oakauth"
│   │
│   ├── mcp/                  # MCP integration
│   │   ├── src/
│   │   │   ├── wrapper.ts    # Wraps MCP tool servers
│   │   │   └── index.ts
│   │   └── package.json      # "@oakauth/mcp"
│   │
│   └── langchain/            # Future: LangChain integration
│       └── ...               # "@oakauth/langchain"
```

## Phase 1: Core SDK (Week 1)

### Tasks

1. **Extract & clean oakauth-client.ts**
   - Already exists in test-agent
   - Add proper error handling
   - Add TypeScript types
   - Add retry logic

2. **Create guard() function**
   ```typescript
   async function guard<T>(
     options: {
       tool: string;
       action: string;
       reasoning?: string;
       metadata?: Record<string, any>;
     },
     fn: () => Promise<T>
   ): Promise<T>
   ```

3. **Deploy worker to Cloudflare production**
   - Already built, just needs deployment
   - Set up D1 database in prod
   - Configure custom domain (api.oakauth.com)

4. **Publish to npm**
   - Package name: `oakauth`
   - MIT license
   - Basic README with quick start

### Deliverable
```bash
npm install oakauth
```

## Phase 2: MCP Integration (Week 2)

### How MCP Works

MCP (Model Context Protocol) defines a standard way for AI to call tools:
- **MCP Server**: Exposes tools (filesystem, database, APIs)
- **MCP Client**: The AI agent that calls those tools

### Where OakAuth Plugs In

Wrap MCP tool calls before they execute:

```typescript
import { MCPServer } from '@modelcontextprotocol/sdk';
import { withOakAuth } from '@oakauth/mcp';

// Original MCP server
const server = new MCPServer({
  tools: [readFileTool, writeFileTool]
});

// Wrapped with OakAuth
const protectedServer = withOakAuth(server, {
  agentId: 'my-agent',
  apiKey: 'oak_...'
});
```

### Tasks

1. **Learn MCP SDK internals**
   - How tool calls are structured
   - How to intercept before execution

2. **Build @oakauth/mcp wrapper**
   - Intercept tool calls
   - Call oak.guard() before execution
   - Pass through results or block

3. **Test with real MCP server**
   - Use filesystem MCP server as test case
   - Verify blocking works
   - Verify logs appear in dashboard

4. **Documentation**
   - MCP-specific quick start
   - Example repo

### Deliverable
```bash
npm install @oakauth/mcp
```

## Phase 3: Launch & Learn (Week 3)

1. **Open source the SDK**
   - Push to GitHub (public repo)
   - MIT license
   - Contributing guidelines

2. **Announce**
   - Twitter/X post
   - MCP Discord
   - Hacker News (maybe)

3. **Get 5 beta users**
   - Offer to help set up
   - Collect feedback
   - Learn what's missing

## Future Phases

### Phase 4: LangChain Integration
- Wrap LangChain tools
- `@oakauth/langchain` package

### Phase 5: Dashboard v1
- Actually build out the dashboard (not coming soon)
- View logs
- Manage permissions
- Create agents/API keys

### Phase 6: Monetization
- Free tier: 1 agent, 1k requests/mo
- Pro tier: $20/mo - unlimited agents, 100k requests
- Enterprise: Custom pricing, SSO, compliance features

## Success Metrics

**Week 1-2:**
- SDK published to npm
- MCP integration working
- 5 beta users trying it

**Month 1:**
- 50+ npm downloads
- 10 GitHub stars
- 3 users actively using in production

**Month 3:**
- 500+ npm downloads
- First paying customer
- LangChain integration shipped

## Open Questions

1. Should worker code also be open source? (Probably yes - builds more trust)
2. Local-only mode? (SDK works without calling hosted API - for development)
3. Pricing tiers - validate with early users

## Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Existing oakauth-client.ts](../packages/test-agent/src/oakauth-client.ts)
