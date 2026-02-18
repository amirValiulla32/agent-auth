# OakAuth Production Roadmap

## Current State (Honest Assessment)

### What Works
- ✅ Permission validation API (`POST /v1/validate`)
- ✅ Reasoning capture + enforcement (unique differentiator)
- ✅ Rate limiting (token bucket, per-agent configurable)
- ✅ Audit logging with filtering
- ✅ Agent/Tool/Rule CRUD APIs
- ✅ Landing page live at oakauth.com

### What's Broken/Missing
- ❌ **In-memory storage** - all data lost on restart
- ❌ **No deployment** - worker only runs locally
- ❌ **No npm package** - can't `npm install oakauth`
- ❌ **No MCP integration** - table stakes in 2026
- ❌ **No user accounts** - can't self-serve
- ❌ **No dashboard** - API-only management
- ❌ **API keys not hashed** - security issue
- ❌ **No docs** - no getting started guide

---

## Phase 1: Foundation (Week 1)
**Goal:** Persistent storage + deployed backend

### 1.1 Cloudflare D1 Database Setup
**File:** `packages/worker/src/storage-d1.ts`

```sql
-- Schema for D1
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  api_key_hash TEXT NOT NULL,  -- SHA-256 hash, not plaintext
  api_key_prefix TEXT NOT NULL, -- First 8 chars for identification
  enabled INTEGER DEFAULT 1,
  rate_limit INTEGER DEFAULT 60,
  created_at TEXT NOT NULL,
  updated_at TEXT
);

CREATE TABLE tools (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  name TEXT NOT NULL,
  scopes TEXT NOT NULL,  -- JSON array stored as text
  description TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

CREATE TABLE rules (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  tool TEXT NOT NULL,
  scope TEXT NOT NULL,
  require_reasoning TEXT DEFAULT 'none',  -- 'none' | 'soft' | 'hard'
  created_at INTEGER NOT NULL,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

CREATE TABLE logs (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  tool TEXT NOT NULL,
  scope TEXT NOT NULL,
  allowed INTEGER NOT NULL,
  deny_reason TEXT,
  request_details TEXT,  -- JSON
  reasoning TEXT,
  reasoning_required TEXT,
  reasoning_provided INTEGER,
  timestamp INTEGER NOT NULL
);

CREATE INDEX idx_logs_agent_id ON logs(agent_id);
CREATE INDEX idx_logs_timestamp ON logs(timestamp DESC);
CREATE INDEX idx_logs_allowed ON logs(allowed);
CREATE INDEX idx_tools_agent_id ON tools(agent_id);
CREATE INDEX idx_rules_agent_id ON rules(agent_id);
CREATE INDEX idx_rules_lookup ON rules(agent_id, tool, scope);
```

**Tasks:**
- [ ] Create `wrangler.toml` with D1 binding
- [ ] Create `storage-d1.ts` implementing same interface as `storage.ts`
- [ ] Add migration scripts in `packages/worker/migrations/`
- [ ] Hash API keys with SHA-256 before storing
- [ ] Store first 8 chars as `api_key_prefix` for key identification
- [ ] Update `getAgentByApiKey` to hash input and compare
- [ ] Add environment detection to switch between in-memory (dev) and D1 (prod)

### 1.2 API Key Security
**File:** `packages/worker/src/utils.ts`

```typescript
import { createHash } from 'crypto';

export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

export function getApiKeyPrefix(apiKey: string): string {
  return apiKey.substring(0, 8);
}
```

**Flow change:**
- On agent create: Generate key → show to user ONCE → store hash + prefix
- On validate: Hash incoming key → compare to stored hash

### 1.3 Deploy Worker to Cloudflare
**File:** `packages/worker/wrangler.toml`

```toml
name = "oakauth-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
ENVIRONMENT = "production"

[[d1_databases]]
binding = "DB"
database_name = "oakauth-prod"
database_id = "<will be generated>"

[env.dev]
vars = { ENVIRONMENT = "development" }
```

**Tasks:**
- [ ] Create wrangler.toml
- [ ] Create D1 database: `wrangler d1 create oakauth-prod`
- [ ] Run migrations: `wrangler d1 migrations apply oakauth-prod`
- [ ] Deploy: `wrangler deploy`
- [ ] Set up custom domain: api.oakauth.com
- [ ] Verify health check: `curl https://api.oakauth.com/`

### 1.4 Environment Switching
**File:** `packages/worker/src/storage/index.ts`

```typescript
import { InMemoryStorage } from './storage-memory';
import { D1Storage } from './storage-d1';

export function getStorage(env: Env) {
  if (env.ENVIRONMENT === 'production' && env.DB) {
    return new D1Storage(env.DB);
  }
  return new InMemoryStorage();
}
```

---

## Phase 2: SDK (Week 2)
**Goal:** `npm install oakauth` works

### 2.1 Package Structure
```
packages/
├── sdk/                      # NEW - Core SDK
│   ├── src/
│   │   ├── index.ts          # Main exports
│   │   ├── client.ts         # OakAuth client
│   │   ├── guard.ts          # guard() wrapper function
│   │   ├── types.ts          # TypeScript types
│   │   └── errors.ts         # Custom errors
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── mcp/                      # NEW - MCP integration
│   ├── src/
│   │   ├── index.ts
│   │   └── wrapper.ts        # MCP server wrapper
│   ├── package.json
│   └── README.md
```

### 2.2 Core SDK
**File:** `packages/sdk/src/client.ts`

```typescript
export interface OakAuthConfig {
  apiKey: string;           // Agent's API key
  baseUrl?: string;         // Default: https://api.oakauth.com
  timeout?: number;         // Default: 5000ms
  retries?: number;         // Default: 2
}

export interface GuardOptions {
  tool: string;
  scope: string;
  reasoning?: string;
  context?: Record<string, any>;
}

export class OakAuth {
  private config: Required<OakAuthConfig>;
  private agentId: string | null = null;

  constructor(config: OakAuthConfig) {
    this.config = {
      baseUrl: 'https://api.oakauth.com',
      timeout: 5000,
      retries: 2,
      ...config,
    };
  }

  /**
   * Validate permission and execute action if allowed
   */
  async guard<T>(
    options: GuardOptions,
    action: () => Promise<T>
  ): Promise<T> {
    const validation = await this.validate(options);

    if (!validation.allowed) {
      throw new OakAuthDeniedError(
        validation.reason || 'Permission denied',
        options.tool,
        options.scope
      );
    }

    return action();
  }

  /**
   * Check permission without executing
   */
  async validate(options: GuardOptions): Promise<ValidationResult> {
    const response = await this.request('/v1/validate', {
      method: 'POST',
      body: {
        tool: options.tool,
        scope: options.scope,
        reasoning: options.reasoning,
        context: options.context,
      },
    });

    return response as ValidationResult;
  }

  /**
   * Check if agent is properly configured
   */
  async healthcheck(): Promise<boolean> {
    try {
      await this.request('/health');
      return true;
    } catch {
      return false;
    }
  }

  private async request(path: string, options?: RequestOptions) {
    // Implementation with retries, timeout, error handling
  }
}
```

### 2.3 Guard Function (Standalone)
**File:** `packages/sdk/src/guard.ts`

```typescript
import { OakAuth, GuardOptions } from './client';

let defaultClient: OakAuth | null = null;

export function configure(config: OakAuthConfig) {
  defaultClient = new OakAuth(config);
}

export async function guard<T>(
  options: GuardOptions,
  action: () => Promise<T>
): Promise<T> {
  if (!defaultClient) {
    throw new Error('OakAuth not configured. Call configure() first.');
  }
  return defaultClient.guard(options, action);
}
```

**Usage:**
```typescript
import { configure, guard } from 'oakauth';

configure({ apiKey: 'oak_...' });

const result = await guard(
  { tool: 'filesystem', scope: 'write', reasoning: 'Saving config' },
  () => fs.writeFile(path, data)
);
```

### 2.4 MCP Integration
**File:** `packages/mcp/src/wrapper.ts`

```typescript
import { Server } from '@modelcontextprotocol/sdk/server';
import { OakAuth } from 'oakauth';

export interface OakAuthMCPConfig {
  apiKey: string;
  baseUrl?: string;
  toolMapping?: Record<string, { tool: string; scope: string }>;
}

export function withOakAuth(
  server: Server,
  config: OakAuthMCPConfig
): Server {
  const oak = new OakAuth({ apiKey: config.apiKey, baseUrl: config.baseUrl });

  // Intercept tool calls
  const originalCallTool = server.callTool.bind(server);

  server.callTool = async (name: string, args: any) => {
    // Map MCP tool name to OakAuth tool/scope
    const mapping = config.toolMapping?.[name] || {
      tool: name,
      scope: 'execute'
    };

    // Validate with OakAuth
    const validation = await oak.validate({
      tool: mapping.tool,
      scope: mapping.scope,
      context: args,
      reasoning: args._reasoning, // Convention: pass reasoning in args
    });

    if (!validation.allowed) {
      throw new Error(`OakAuth denied: ${validation.reason}`);
    }

    // Execute original tool
    return originalCallTool(name, args);
  };

  return server;
}
```

**Usage:**
```typescript
import { Server } from '@modelcontextprotocol/sdk/server';
import { withOakAuth } from '@oakauth/mcp';

const server = new Server({ name: 'my-mcp-server' });

const protectedServer = withOakAuth(server, {
  apiKey: 'oak_...',
  toolMapping: {
    'read_file': { tool: 'filesystem', scope: 'read' },
    'write_file': { tool: 'filesystem', scope: 'write' },
  }
});
```

### 2.5 Package.json Files

**packages/sdk/package.json:**
```json
{
  "name": "oakauth",
  "version": "0.1.0",
  "description": "Permission control for AI agents with reasoning capture",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  },
  "keywords": ["ai", "agents", "permissions", "security", "mcp", "langchain"],
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/oakauth/oakauth-js"
  }
}
```

**packages/mcp/package.json:**
```json
{
  "name": "@oakauth/mcp",
  "version": "0.1.0",
  "description": "OakAuth integration for MCP servers",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "oakauth": "^0.1.0"
  }
}
```

### 2.6 Tasks
- [ ] Create `packages/sdk` directory structure
- [ ] Implement OakAuth client with retries, timeout, error handling
- [ ] Implement guard() function
- [ ] Add TypeScript types for all public APIs
- [ ] Create `packages/mcp` directory structure
- [ ] Implement MCP wrapper
- [ ] Test MCP integration with filesystem MCP server
- [ ] Publish `oakauth` to npm
- [ ] Publish `@oakauth/mcp` to npm

---

## Phase 3: Documentation (Week 2-3)
**Goal:** Developer can get started in 5 minutes

### 3.1 Documentation Structure
```
docs/
├── getting-started.md        # 5-minute quickstart
├── api-reference.md          # Full API docs
├── mcp-integration.md        # MCP-specific guide
├── reasoning.md              # Reasoning feature deep-dive
└── examples/
    ├── basic-validation/
    ├── mcp-filesystem/
    └── langchain-tools/
```

### 3.2 Getting Started Guide
**File:** `docs/getting-started.md`

```markdown
# Getting Started with OakAuth

OakAuth is the permission layer for AI agents. Define what your agents
can do, see everything they try, and know WHY they did it.

## Installation

\`\`\`bash
npm install oakauth
\`\`\`

## Quick Start

### 1. Get your API key

Sign up at [oakauth.com](https://oakauth.com) or contact us for beta access.

### 2. Configure your agent

\`\`\`typescript
import { OakAuth } from 'oakauth';

const oak = new OakAuth({
  apiKey: process.env.OAKAUTH_API_KEY,
});
\`\`\`

### 3. Guard your tool calls

\`\`\`typescript
// Instead of this:
await fs.writeFile(path, data);

// Do this:
await oak.guard(
  {
    tool: 'filesystem',
    scope: 'write',
    reasoning: 'Saving user preferences to config file'
  },
  () => fs.writeFile(path, data)
);
\`\`\`

### 4. View logs in dashboard

Every call is logged with the reasoning. View at [oakauth.com/logs](https://oakauth.com/logs).

## What makes OakAuth different?

**Reasoning capture**: Your agents explain WHY they need each permission.

\`\`\`typescript
// This gets logged:
{
  "agent": "code-assistant",
  "tool": "filesystem",
  "scope": "write",
  "allowed": true,
  "reasoning": "Saving user preferences to config file",
  "timestamp": "2026-02-06T10:30:00Z"
}
\`\`\`

**Reasoning enforcement**: Require explanations for risky actions.

\`\`\`typescript
// If reasoning is required but not provided:
{
  "allowed": false,
  "reason": "This operation requires reasoning. Please explain why."
}
\`\`\`
```

### 3.3 Tasks
- [ ] Write getting-started.md
- [ ] Write api-reference.md
- [ ] Write mcp-integration.md
- [ ] Write reasoning.md (unique feature deep-dive)
- [ ] Create example projects
- [ ] Add README.md to SDK package
- [ ] Add README.md to MCP package

---

## Phase 4: Dashboard MVP (Week 3-4)
**Goal:** Basic web UI for managing agents and viewing logs

### 4.1 Dashboard Features (MVP)
| Feature | Priority | Description |
|---------|----------|-------------|
| View logs | P0 | Filter by agent, tool, status, date |
| View agents | P0 | List all agents |
| Create agent | P0 | Get API key (shown once) |
| Create tool | P1 | Define tools + scopes for agent |
| Create rule | P1 | Enable tool+scope for agent |
| View stats | P1 | Requests today, denials, etc. |

### 4.2 Auth Strategy (Simple)
For MVP, skip full user auth. Use a simple approach:

**Option A: API key auth for dashboard**
- Dashboard makes requests with admin API key
- Single-tenant for now
- Add real auth later

**Option B: Cloudflare Access**
- Put dashboard behind Cloudflare Access
- You control who can access
- Zero code for auth

**Recommendation:** Option B for MVP. Add real auth in Phase 5.

### 4.3 Dashboard Pages
```
/                     # Landing page (exists)
/coming-soon          # Coming soon (exists, update to redirect)
/dashboard            # Main dashboard (stats overview)
/dashboard/agents     # List agents
/dashboard/agents/new # Create agent
/dashboard/logs       # Audit logs
```

### 4.4 Tasks
- [ ] Set up Cloudflare Access for dashboard
- [ ] Update dashboard to call production API
- [ ] Build agents list page
- [ ] Build agent create page (show API key once)
- [ ] Build tools/rules management
- [ ] Build logs page with filtering
- [ ] Build stats overview
- [ ] Remove "coming soon" redirects
- [ ] Deploy dashboard update to Cloudflare Pages

---

## Phase 5: User Accounts (Week 5-6)
**Goal:** Self-service signup and multi-tenancy

### 5.1 Auth Options
| Option | Pros | Cons |
|--------|------|------|
| Clerk | Fast to implement, good DX | $25/mo after 10k MAU |
| Auth0 | Enterprise-ready | Complex, expensive |
| Supabase Auth | Free tier, PostgreSQL included | Another dependency |
| Roll your own | Full control | Time-consuming |

**Recommendation:** Clerk for MVP. Fast, good Next.js integration.

### 5.2 Multi-tenancy Schema
```sql
CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'free',  -- 'free' | 'pro' | 'enterprise'
  created_at TEXT NOT NULL
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  org_id TEXT NOT NULL,
  role TEXT DEFAULT 'member',  -- 'owner' | 'admin' | 'member'
  created_at TEXT NOT NULL,
  FOREIGN KEY (org_id) REFERENCES organizations(id)
);

-- Add org_id to existing tables
ALTER TABLE agents ADD COLUMN org_id TEXT;
ALTER TABLE logs ADD COLUMN org_id TEXT;
```

### 5.3 Tasks
- [ ] Integrate Clerk
- [ ] Add organizations table
- [ ] Add org_id to agents, tools, rules, logs
- [ ] Update all queries to filter by org_id
- [ ] Build signup flow
- [ ] Build team management (invite users)
- [ ] Update dashboard to show only org's data

---

## Phase 6: Billing (Week 7-8)
**Goal:** Charge money

### 6.1 Pricing Tiers
| Tier | Price | Limits |
|------|-------|--------|
| Free | $0 | 1 agent, 1K requests/mo |
| Pro | $29/mo | 10 agents, 100K requests/mo |
| Enterprise | Custom | Unlimited, SLA, support |

### 6.2 Implementation
- Use Stripe for billing
- Track usage in logs table (already have timestamps)
- Enforce limits at validation time
- Add usage dashboard

### 6.3 Tasks
- [ ] Integrate Stripe
- [ ] Build pricing page
- [ ] Build checkout flow
- [ ] Add usage tracking
- [ ] Add limit enforcement
- [ ] Build usage dashboard
- [ ] Set up Stripe webhooks

---

## Phase 7: Polish & Scale (Week 9+)
**Goal:** Production-ready for real customers

### 7.1 Observability
- [ ] Add structured logging
- [ ] Set up error tracking (Sentry)
- [ ] Add performance monitoring
- [ ] Create alerting for failures

### 7.2 Security Hardening
- [ ] Security audit
- [ ] Add request signing option
- [ ] Add IP allowlisting option
- [ ] SOC2 prep (if enterprise customers)

### 7.3 Additional Integrations
- [ ] LangChain integration (`@oakauth/langchain`)
- [ ] CrewAI integration (`@oakauth/crewai`)
- [ ] Python SDK (`pip install oakauth`)

### 7.4 Features
- [ ] Webhooks (notify on deny, etc.)
- [ ] Custom policies (beyond tool+scope)
- [ ] Approval workflows (human-in-the-loop)
- [ ] Analytics dashboard

---

## Timeline Summary

| Week | Phase | Milestone |
|------|-------|-----------|
| 1 | Foundation | D1 database + deployed worker at api.oakauth.com |
| 2 | SDK | `npm install oakauth` works |
| 2-3 | Docs | Getting started guide live |
| 3-4 | Dashboard | Basic web UI for managing agents |
| 5-6 | Auth | Self-service signup working |
| 7-8 | Billing | Can charge money |
| 9+ | Polish | Production-ready |

**First real milestone (Week 2):** Someone runs `npm install oakauth`, validates a permission against production API, sees the log in dashboard.

---

## Success Metrics

### Week 2
- [ ] SDK published to npm
- [ ] Worker deployed to api.oakauth.com
- [ ] 5 beta users trying it

### Week 4
- [ ] Dashboard MVP live
- [ ] 20 agents created
- [ ] 1000+ validation requests

### Week 8
- [ ] First paying customer
- [ ] 100+ npm downloads/week
- [ ] <100ms p99 latency

---

## Open Questions

1. **Domain:** api.oakauth.com or just oakauth.com/api?
2. **Open source:** SDK definitely. Worker code too?
3. **Pricing:** Is $29/mo right for Pro tier?
4. **First integration:** MCP vs LangChain? (Leaning MCP)
5. **Hosting dashboard:** Keep on Cloudflare Pages or move to Vercel?
