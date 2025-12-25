# Agent Auth Platform

AI Agent Permission & Observability Platform - Middleware proxy for controlling and monitoring AI agent API access.

## What It Does

Centralized permission control and audit logging for AI agents:
- **Control** what each agent can/cannot do
- **Monitor** every action in real-time
- **Enforce** granular rules (e.g., "events < 30min only")
- **Audit** complete trail for compliance

## Architecture

```
AI Agent → Worker Proxy → External API (Google Calendar, etc.)
              ↓
         Permission Check
              ↓
         Audit Logging
              ↓
         Dashboard
```

**Stack:** Cloudflare Workers, D1 (SQLite), KV, Next.js 14, TypeScript

## Quick Start

### Prerequisites
- Node.js 18+
- Cloudflare account (free tier works)

### Run Locally

```bash
# Install dependencies
npm install

# Terminal 1: Start Worker
cd packages/worker
npm run dev  # http://localhost:8787

# Terminal 2: Start Dashboard
cd packages/dashboard
npm run dev  # http://localhost:3000
```

### Testing (No External Setup Required)

```bash
# Seed test data
curl -X POST http://localhost:8787/admin/seed

# View agents
curl http://localhost:8787/admin/agents

# Test permission (should allow - 20min event)
curl -X POST http://localhost:8787/v1/google-calendar/events \
  -H "X-Agent-ID: agent-test-1" \
  -H "X-Agent-Key: test-key-123" \
  -H "Content-Type: application/json" \
  -d '{"summary":"Quick Sync","start":{"dateTime":"2025-01-15T10:00:00Z"},"end":{"dateTime":"2025-01-15T10:20:00Z"}}'

# Test denial (should deny - 60min > 30min limit)
curl -X POST http://localhost:8787/v1/google-calendar/events \
  -H "X-Agent-ID: agent-test-1" \
  -H "X-Agent-Key: test-key-123" \
  -H "Content-Type: application/json" \
  -d '{"summary":"Long Meeting","start":{"dateTime":"2025-01-15T10:00:00Z"},"end":{"dateTime":"2025-01-15T11:00:00Z"}}'
```

Full testing guide: [TESTING.md](./TESTING.md)

## Project Structure

```
agent-auth/
├── packages/
│   ├── worker/          # Cloudflare Worker proxy
│   ├── dashboard/       # Next.js admin UI
│   └── shared/          # Shared TypeScript types
└── migrations/          # D1 database schema
```

## Permission Rules

Rules define what agents can do. Examples:

**Duration Limit:**
```json
{ "max_duration": 30 }
```
Agent cannot create events longer than 30 minutes.

**Attendee Limit:**
```json
{ "max_attendees": 5 }
```
Agent cannot create events with more than 5 attendees.

**Time Restriction:**
```json
{ "business_hours_only": true }
```
Agent can only create events Mon-Fri, 9am-5pm UTC.

**Multiple Conditions (AND logic):**
```json
{
  "max_duration": 30,
  "max_attendees": 5,
  "business_hours_only": true
}
```
All conditions must pass.

## API Usage

**Headers:**
- `X-Agent-ID`: Your agent's ID
- `X-Agent-Key`: Your agent's API key

**Responses:**
- `200 OK`: Request allowed
- `403 Forbidden`: Permission denied
- `401 Unauthorized`: Invalid credentials

## Deployment

```bash
# Deploy Worker
cd packages/worker
npx wrangler deploy

# Deploy Dashboard to Cloudflare Pages
cd packages/dashboard
npm run build
npx wrangler pages deploy .next
```

Or connect GitHub repo to Cloudflare Pages for auto-deploy.

## Development

See [CHANGELOG.md](./CHANGELOG.md) for:
- Current implementation status
- What's been built
- What's next
- Detailed progress tracking

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
D1_DATABASE_ID=your-database-id
DASHBOARD_AUTH_TOKEN=your-secret-token
```

## Support

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Next.js Docs](https://nextjs.org/docs)
- Check [TESTING.md](./TESTING.md) for testing guide

---

**Status:** Phase 1 (Foundation) in progress - See [CHANGELOG.md](./CHANGELOG.md) for details
