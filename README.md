# Agent Auth Platform

AI Agent Permission & Observability Platform - A middleware proxy that sits between AI agents and external APIs (starting with Google Calendar), providing centralized permission control and comprehensive audit logging.

## Overview

Companies deploying multiple AI agents need a centralized way to:
- Control what each agent can/cannot do
- See every action every agent attempts in real-time
- Enforce granular permission rules (e.g., "Agent can create calendar events if duration < 30min")
- Maintain complete audit trails for compliance

This platform provides all of that through a Cloudflare Worker proxy and Next.js dashboard.

## Architecture

```
AI Agent → Worker Proxy → Google Calendar API
              ↓
         Permission Check
              ↓
         Audit Logging
              ↓
         Dashboard
```

**Tech Stack:**
- **Cloudflare Workers**: Edge proxy for low-latency request handling
- **Cloudflare D1**: SQLite database for agents, rules, and logs
- **Cloudflare KV**: Cache for permission rules
- **Next.js**: Admin dashboard
- **TypeScript**: Monorepo with shared types

## Project Structure

```
agent-auth/
├── packages/
│   ├── worker/          # Cloudflare Worker (proxy service)
│   ├── dashboard/       # Next.js admin dashboard
│   └── shared/          # Shared TypeScript types
├── migrations/          # D1 database migrations
└── package.json         # Root workspace config
```

## Quick Start

### Prerequisites

1. **Node.js 18+** installed
2. **Cloudflare account** ([sign up free](https://dash.cloudflare.com/sign-up))
3. **Cloudflare API token** with Workers & D1 permissions

### 1. Install Dependencies

```bash
npm install
```

### 2. Authenticate with Cloudflare

```bash
cd packages/worker
npx wrangler login
```

This will open a browser for OAuth authentication.

**Alternative: API Token**
```bash
export CLOUDFLARE_API_TOKEN=your-api-token-here
```

### 3. Create D1 Database

```bash
cd packages/worker
npx wrangler d1 create agent-auth-db
```

Copy the database ID from the output and update `packages/worker/wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "agent-auth-db"
database_id = "YOUR-DATABASE-ID-HERE"  # Replace this
```

### 4. Create KV Namespace

```bash
npx wrangler kv:namespace create "AGENT_RULES"
```

Copy the namespace ID and update `packages/worker/wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "KV"
id = "YOUR-KV-NAMESPACE-ID-HERE"  # Replace this
```

### 5. Run Database Migrations

```bash
# Apply migrations to local database
npx wrangler d1 migrations apply agent-auth-db --local

# Apply migrations to production database
npx wrangler d1 migrations apply agent-auth-db --remote
```

### 6. Start Development Servers

**Terminal 1 - Worker:**
```bash
npm run dev:worker
# Worker runs on http://localhost:8787
```

**Terminal 2 - Dashboard:**
```bash
npm run dev:dashboard
# Dashboard runs on http://localhost:3000
```

## Database Schema

### Agents Table
Stores AI agents that use the proxy.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key |
| name | TEXT | Agent name |
| api_key | TEXT | API key for authentication |
| created_at | INTEGER | Unix timestamp |
| enabled | BOOLEAN | Whether agent is active |

### Rules Table
Permission rules for each agent.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key |
| agent_id | TEXT | Foreign key to agents |
| tool | TEXT | Target tool (e.g., 'google_calendar') |
| action | TEXT | Action (e.g., 'create_event') |
| conditions | TEXT | JSON conditions |
| created_at | INTEGER | Unix timestamp |

**Example Conditions:**
```json
{
  "max_duration": 30,
  "max_attendees": 5,
  "business_hours_only": true
}
```

### Logs Table
Audit trail of all requests.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key |
| agent_id | TEXT | Foreign key to agents |
| tool | TEXT | Target tool |
| action | TEXT | Action attempted |
| allowed | BOOLEAN | Whether request was allowed |
| deny_reason | TEXT | Reason if denied |
| request_details | TEXT | JSON request data |
| timestamp | INTEGER | Unix timestamp |

## Usage

### 1. Create an Agent (via Dashboard)

1. Open http://localhost:3000
2. Navigate to "Agents"
3. Click "Create Agent"
4. Enter agent name
5. Copy the generated API key (shown once)

### 2. Create Permission Rules

1. Click on an agent
2. Click "Add Rule"
3. Select tool (Google Calendar)
4. Select action (create_event, update_event, delete_event, list_events)
5. Set conditions:
   - Max duration (minutes)
   - Max attendees
   - Business hours only
6. Save

### 3. Use the Proxy from Your Agent

```bash
curl -X POST http://localhost:8787/v1/google-calendar/events \
  -H "X-Agent-ID: agent_123" \
  -H "X-Agent-Key: your-api-key-here" \
  -H "Authorization: Bearer YOUR_GOOGLE_OAUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Team Meeting",
    "start": {"dateTime": "2025-01-15T10:00:00Z"},
    "end": {"dateTime": "2025-01-15T10:30:00Z"},
    "attendees": [
      {"email": "teammate@example.com"}
    ]
  }'
```

**Headers:**
- `X-Agent-ID`: Your agent's ID (from dashboard)
- `X-Agent-Key`: Your agent's API key (from dashboard)
- `Authorization`: Google OAuth token (your agent must obtain this)

**Response:**
- **200 OK**: Request allowed, forwarded to Google Calendar
- **403 Forbidden**: Request denied due to permission rules
- **401 Unauthorized**: Invalid agent credentials

### 4. View Audit Logs

```bash
# Query logs directly via D1
cd packages/worker
npx wrangler d1 execute agent-auth-db --local \
  --command "SELECT * FROM logs ORDER BY timestamp DESC LIMIT 10"
```

Or view via the dashboard (Days 5-7 implementation).

## Permission Rules Reference

### Duration Limits
Restrict event duration in minutes.

```json
{
  "max_duration": 30
}
```

**Example:** Agent cannot create events longer than 30 minutes.

### Attendee Limits
Restrict number of attendees.

```json
{
  "max_attendees": 5
}
```

**Example:** Agent cannot create events with more than 5 attendees.

### Time Restrictions
Restrict when events can be created.

```json
{
  "business_hours_only": true
}
```

**Example:** Agent can only create events Monday-Friday, 9am-5pm UTC.

### Action Restrictions
Control which actions are allowed. If no rule exists for an action, it's denied by default.

```json
{
  "allowed_actions": ["create_event", "update_event"]
}
```

**Example:** Agent can create and update events, but cannot delete them.

### Multiple Conditions (AND Logic)
All conditions in a rule must pass.

```json
{
  "max_duration": 30,
  "max_attendees": 5,
  "business_hours_only": true
}
```

**Example:** Agent can create events only if:
- Duration ≤ 30 minutes AND
- Attendees ≤ 5 AND
- Time is during business hours

## Development Roadmap

### ✅ Day 1: Project Setup (COMPLETE)
- [x] Monorepo structure
- [x] TypeScript configuration
- [x] Database schema
- [x] Dependencies installed

### Day 2: Worker Core
- [ ] Agent authentication
- [ ] Request routing
- [ ] Google Calendar proxy
- [ ] Error handling

### Day 3: Permission Engine
- [ ] Rule loader with KV caching
- [ ] Duration evaluator
- [ ] Attendee evaluator
- [ ] Time restriction evaluator
- [ ] Action restriction evaluator

### Day 4: Logging
- [ ] Audit logger
- [ ] Non-blocking D1 writes
- [ ] Performance tracking

### Day 5: Dashboard Backend
- [ ] Agent API routes
- [ ] Rule API routes
- [ ] Authentication middleware

### Day 6: Dashboard Frontend (Agents)
- [ ] Login page
- [ ] Agent list
- [ ] Agent creation
- [ ] Agent deletion

### Day 7: Dashboard Frontend (Rules)
- [ ] Rule list
- [ ] Rule builder
- [ ] End-to-end testing

## Testing

### Manual Testing (curl)

**Create test agent:**
```bash
cd packages/worker
npx wrangler d1 execute agent-auth-db --local \
  --command "INSERT INTO agents (id, name, api_key, created_at, enabled) VALUES ('test-agent', 'Test Agent', 'test-key-123', $(date +%s), 1)"
```

**Test authentication:**
```bash
curl -X POST http://localhost:8787/v1/google-calendar/events \
  -H "X-Agent-ID: test-agent" \
  -H "X-Agent-Key: wrong-key" \
  -H "Authorization: Bearer token"
# Expected: 401 Unauthorized
```

**Test permission denial:**
```bash
# First, create a rule limiting duration to 30 minutes
npx wrangler d1 execute agent-auth-db --local \
  --command "INSERT INTO rules (id, agent_id, tool, action, conditions, created_at) VALUES ('rule-1', 'test-agent', 'google_calendar', 'create_event', '{\"max_duration\": 30}', $(date +%s))"

# Try to create a 60-minute event
curl -X POST http://localhost:8787/v1/google-calendar/events \
  -H "X-Agent-ID: test-agent" \
  -H "X-Agent-Key: test-key-123" \
  -H "Authorization: Bearer $GOOGLE_OAUTH_TOKEN" \
  -d '{"summary": "Long Meeting", "start": {"dateTime": "2025-01-15T10:00:00Z"}, "end": {"dateTime": "2025-01-15T11:00:00Z"}}'
# Expected: 403 Forbidden
```

## Deployment

### Deploy Worker to Production

```bash
cd packages/worker
npx wrangler deploy
```

### Deploy Dashboard to Cloudflare Pages

```bash
cd packages/dashboard
npm run build
npx wrangler pages deploy .next
```

Or connect your GitHub repo to Cloudflare Pages for automatic deployments.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
# Cloudflare credentials
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
D1_DATABASE_ID=your-database-id

# Dashboard auth
DASHBOARD_AUTH_TOKEN=your-secret-token

# Google OAuth (for testing)
GOOGLE_OAUTH_TOKEN=your-test-token
```

## Troubleshooting

### "Failed to fetch auth token"
Run `npx wrangler login` or set `CLOUDFLARE_API_TOKEN` environment variable.

### "Database not found"
Ensure you've created the D1 database and updated `wrangler.toml` with the correct database ID.

### "Module not found: @agent-auth/shared"
Run `npm install` from the root directory to set up workspaces.

### Worker returns 500 on all requests
Check worker logs: `npx wrangler tail` or view in Cloudflare dashboard.

## Performance Targets

- **Worker Latency**: <20ms overhead (auth + permission check + logging)
- **Cache Hit Rate**: >95% (rules cached in KV)
- **Throughput**: 50+ requests/second

## Security Considerations

1. **Agent API Keys**: Store hashed in production (not implemented in MVP)
2. **Google OAuth Tokens**: Never logged, only passed through
3. **Dashboard Auth**: Simple API key for MVP (upgrade to OAuth later)
4. **Rate Limiting**: Not implemented in MVP (add via Cloudflare dashboard)

## Future Enhancements

- Log viewer UI with filters
- Real-time activity feed
- Analytics dashboard
- Multiple tool support (Slack, GitHub, etc.)
- Complex rule logic (OR conditions, nested rules)
- Rule templates
- Webhooks for alerts
- Comprehensive test suite

## License

MIT

## Support

For issues or questions:
- File an issue on GitHub
- Check the [Cloudflare Workers docs](https://developers.cloudflare.com/workers/)
- Review the [Next.js docs](https://nextjs.org/docs)

---

**Built with Cloudflare Workers + Next.js**
