# OakAuth

Permission control and audit logging for AI agents. Define what each agent can do, enforce it at runtime, and see everything they try.

## How It Works

```
Your AI Agent                OakAuth API               External API
     │                           │                          │
     ├── POST /v1/validate ─────►│                          │
     │   { agent, tool, scope }  │                          │
     │                           ├── check rules            │
     │                           ├── log request            │
     │◄── { allowed: true } ─────┤                          │
     │                           │                          │
     ├── (proceed with action) ──┼─────────────────────────►│
     │                           │                          │
```

Your agent calls OakAuth before each action. OakAuth checks the rules you defined, logs the request, and returns allow/deny. The agent then proceeds (or doesn't).

## Quick Start

1. **Visit the dashboard** at [oakauth.com/dashboard](https://oakauth.com/dashboard)
2. **Create an agent** — you'll get an API key
3. **Register tools** — e.g. "stripe" with scopes ["create_charge", "list_charges"]
4. **Add permission rules** — allow specific tool/scope combinations
5. **Call `/v1/validate`** from your agent before each action

## API Reference

### `POST https://api.oakauth.com/v1/validate`

Validate whether an agent is allowed to perform an action.

**Authentication:** Include the agent's API key (from the dashboard) as a Bearer token in the `Authorization` header.

**Request body:**

```json
{
  "tool": "stripe",
  "scope": "create_charge",
  "reasoning": "User requested a refund for order #1234",
  "context": { "amount": 2500 }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `Authorization` header | Yes | `Bearer <agent-api-key>` — the API key from the dashboard |
| `tool` | Yes | Name of the tool being used |
| `scope` | Yes | Specific action within the tool |
| `reasoning` | No* | Why the agent needs this action (*required if rule has `require_reasoning: "hard"`) |
| `context` | No | Additional context for audit logs |

**Response (allowed):**

```json
{ "allowed": true }
```

**Response (denied):**

```json
{
  "allowed": false,
  "reason": "No permission rule exists for scope 'delete_customer' on tool 'stripe'"
}
```

## Examples

### curl

```bash
curl -X POST https://api.oakauth.com/v1/validate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <agent-api-key>" \
  -d '{
    "tool": "stripe",
    "scope": "create_charge",
    "reasoning": "User upgraded to pro plan"
  }'
```

### TypeScript

```typescript
async function checkPermission(tool: string, scope: string, reasoning?: string) {
  const res = await fetch('https://api.oakauth.com/v1/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OAKAUTH_API_KEY}`,
    },
    body: JSON.stringify({ tool, scope, reasoning }),
  });

  const { allowed, reason } = await res.json();
  if (!allowed) throw new Error(`OakAuth denied: ${reason}`);
}

// Before making a Stripe charge:
await checkPermission('stripe', 'create_charge', 'User upgraded to pro plan');
// proceed with Stripe API call...
```

## Self-Hosting

OakAuth runs on Cloudflare Workers + D1. To deploy your own:

```bash
git clone https://github.com/your-org/agent-auth
cd agent-auth && npm install
cd packages/worker
cp ../../.env.example ../../.env.local  # fill in your values
npx wrangler d1 create oakauth-db
npx wrangler d1 migrations apply oakauth-db --remote
npx wrangler secret put ADMIN_API_KEY
npx wrangler secret put JWT_SECRET
npx wrangler deploy
```

## Feedback

This is an early beta. We'd love to hear what works, what's broken, and what you need.

- Email: hello@oakauth.com
- GitHub Issues: open an issue on this repo
