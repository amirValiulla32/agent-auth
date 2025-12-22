# Testing Guide - Basic Version

This guide shows you how to test the Agent Auth Worker **without any external APIs or Cloudflare setup**. Everything runs locally with mock data.

## Prerequisites

Just Node.js 18+ and the code you already have.

## Step 1: Start the Worker

```bash
cd packages/worker
npm run dev
```

You should see:
```
⛅️ wrangler dev
Running wrangler dev...
⎔ Starting local server...
[wrangler:inf] Ready on http://localhost:8787
```

## Step 2: Seed Test Data

In a new terminal:

```bash
curl -X POST http://localhost:8787/admin/seed
```

**Expected Response:**
```json
{"message":"Test data seeded successfully"}
```

This creates 3 test agents with different permission rules:

1. **agent-test-1** (Calendar Assistant)
   - API Key: `test-key-123`
   - Max 30min events
   - Max 5 attendees

2. **agent-test-2** (Meeting Scheduler)
   - API Key: `test-key-456`
   - Max 120min events
   - Business hours only (Mon-Fri, 9am-5pm UTC)

3. **agent-disabled** (Disabled Agent)
   - API Key: `test-key-disabled`
   - Will fail authentication

## Step 3: View Test Agents

```bash
curl http://localhost:8787/admin/agents
```

**Expected Response:**
```json
{
  "agents": [
    {
      "id": "agent-test-1",
      "name": "Calendar Assistant",
      "api_key": "test-key-123",
      "created_at": 1734651234567,
      "enabled": true
    },
    // ... more agents
  ],
  "count": 3
}
```

## Step 4: Test Permission Enforcement

### Test 1: Valid Request (Should ALLOW)

Create a **20-minute** event with agent-test-1 (max 30min):

```bash
curl -X POST http://localhost:8787/v1/google-calendar/events \
  -H "X-Agent-ID: agent-test-1" \
  -H "X-Agent-Key: test-key-123" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Quick Sync",
    "start": {"dateTime": "2025-01-15T10:00:00Z"},
    "end": {"dateTime": "2025-01-15T10:20:00Z"},
    "attendees": [
      {"email": "teammate@example.com"}
    ]
  }'
```

**Expected Response (200 OK):**
```json
{
  "kind": "calendar#event",
  "id": "...",
  "status": "confirmed",
  "htmlLink": "https://calendar.google.com/event?eid=...",
  "summary": "Quick Sync",
  "start": {"dateTime": "2025-01-15T10:00:00Z"},
  "end": {"dateTime": "2025-01-15T10:20:00Z"},
  "attendees": [{"email": "teammate@example.com"}]
}
```

Headers will include:
- `X-Worker-Time-Ms`: Request processing time
- `X-Request-ID`: Unique request ID
- `X-Agent-ID`: agent-test-1

### Test 2: Duration Limit Violation (Should DENY)

Try to create a **60-minute** event (exceeds agent-test-1's 30min limit):

```bash
curl -X POST http://localhost:8787/v1/google-calendar/events \
  -H "X-Agent-ID: agent-test-1" \
  -H "X-Agent-Key: test-key-123" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Long Meeting",
    "start": {"dateTime": "2025-01-15T10:00:00Z"},
    "end": {"dateTime": "2025-01-15T11:00:00Z"}
  }'
```

**Expected Response (403 Forbidden):**
```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "Event duration (60min) exceeds limit (30min)",
    "details": {
      "actual": 60,
      "limit": 30
    },
    "requestId": "..."
  }
}
```

### Test 3: Attendee Limit Violation (Should DENY)

Try to create an event with **10 attendees** (exceeds agent-test-1's 5 limit):

```bash
curl -X POST http://localhost:8787/v1/google-calendar/events \
  -H "X-Agent-ID: agent-test-1" \
  -H "X-Agent-Key: test-key-123" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "All Hands",
    "start": {"dateTime": "2025-01-15T10:00:00Z"},
    "end": {"dateTime": "2025-01-15T10:15:00Z"},
    "attendees": [
      {"email": "person1@example.com"},
      {"email": "person2@example.com"},
      {"email": "person3@example.com"},
      {"email": "person4@example.com"},
      {"email": "person5@example.com"},
      {"email": "person6@example.com"},
      {"email": "person7@example.com"},
      {"email": "person8@example.com"},
      {"email": "person9@example.com"},
      {"email": "person10@example.com"}
    ]
  }'
```

**Expected Response (403 Forbidden):**
```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "Event has 10 attendees, exceeding limit of 5",
    "details": {
      "count": 10,
      "limit": 5
    },
    "requestId": "..."
  }
}
```

### Test 4: Business Hours Restriction (Should DENY)

Try to create an event on **Saturday** with agent-test-2 (business hours only):

```bash
curl -X POST http://localhost:8787/v1/google-calendar/events \
  -H "X-Agent-ID: agent-test-2" \
  -H "X-Agent-Key: test-key-456" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Weekend Work",
    "start": {"dateTime": "2025-01-18T10:00:00Z"},
    "end": {"dateTime": "2025-01-18T11:00:00Z"}
  }'
```

(Note: 2025-01-18 is a Saturday)

**Expected Response (403 Forbidden):**
```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "Events can only be created during business hours (Mon-Fri, 9am-5pm UTC)",
    "details": {
      "startTime": "2025-01-18T10:00:00.000Z",
      "dayOfWeek": 6,
      "hour": 10
    },
    "requestId": "..."
  }
}
```

### Test 5: No Permission Rule (Should DENY)

Try to delete an event with agent-test-1 (no delete rule defined):

```bash
curl -X DELETE http://localhost:8787/v1/google-calendar/events/fake-event-id \
  -H "X-Agent-ID: agent-test-1" \
  -H "X-Agent-Key: test-key-123"
```

**Expected Response (403 Forbidden):**
```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "No permission rules defined for delete_event on google_calendar",
    "requestId": "..."
  }
}
```

### Test 6: Invalid Agent Credentials (Should DENY)

Try with wrong API key:

```bash
curl -X POST http://localhost:8787/v1/google-calendar/events \
  -H "X-Agent-ID: agent-test-1" \
  -H "X-Agent-Key: wrong-key" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Test",
    "start": {"dateTime": "2025-01-15T10:00:00Z"},
    "end": {"dateTime": "2025-01-15T10:30:00Z"}
  }'
```

**Expected Response (401 Unauthorized):**
```json
{
  "error": {
    "code": "AGENT_AUTH_FAILED",
    "message": "Invalid API key",
    "requestId": "..."
  }
}
```

### Test 7: Disabled Agent (Should DENY)

Try with disabled agent:

```bash
curl -X POST http://localhost:8787/v1/google-calendar/events \
  -H "X-Agent-ID: agent-disabled" \
  -H "X-Agent-Key: test-key-disabled" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Test",
    "start": {"dateTime": "2025-01-15T10:00:00Z"},
    "end": {"dateTime": "2025-01-15T10:30:00Z"}
  }'
```

**Expected Response (401 Unauthorized):**
```json
{
  "error": {
    "code": "AGENT_AUTH_FAILED",
    "message": "Agent is disabled",
    "requestId": "..."
  }
}
```

## Step 5: View Audit Logs

All requests (allowed and denied) are logged:

```bash
curl http://localhost:8787/admin/logs
```

**Expected Response:**
```json
{
  "logs": [
    {
      "id": "...",
      "agent_id": "agent-test-1",
      "tool": "google_calendar",
      "action": "create_event",
      "allowed": false,
      "deny_reason": "Event duration (60min) exceeds limit (30min)",
      "request_details": "{\"body\":{...},\"eventId\":null}",
      "timestamp": 1734651234567
    },
    // ... more logs
  ],
  "count": 7
}
```

You can limit results:
```bash
curl http://localhost:8787/admin/logs?limit=5
```

## Step 6: View Stats

```bash
curl http://localhost:8787/admin/stats
```

**Expected Response:**
```json
{
  "agentCount": 3,
  "ruleCount": 5,
  "logCount": 7
}
```

## Other Actions

### Update Event

```bash
curl -X PATCH http://localhost:8787/v1/google-calendar/events/event-123 \
  -H "X-Agent-ID: agent-test-1" \
  -H "X-Agent-Key: test-key-123" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Updated Meeting"
  }'
```

(Will check update_event rules)

### Delete Event

```bash
curl -X DELETE http://localhost:8787/v1/google-calendar/events/event-123 \
  -H "X-Agent-ID: agent-test-2" \
  -H "X-Agent-Key: test-key-456"
```

(agent-test-2 has delete permission, agent-test-1 does not)

### List Events

```bash
curl http://localhost:8787/v1/google-calendar/events \
  -H "X-Agent-ID: agent-test-2" \
  -H "X-Agent-Key: test-key-456"
```

Returns mock calendar events.

## What's Happening Under the Hood

1. **Authentication**: Worker validates X-Agent-ID and X-Agent-Key against in-memory storage
2. **Permission Check**: Loads rules for agent+tool+action, evaluates conditions
3. **Request Forwarding**: If allowed, forwards to mock Google Calendar (returns fake data)
4. **Audit Logging**: Logs every request (allowed/denied) with full context
5. **Response**: Returns either success (200) or error (401/403)

## Key Features Demonstrated

✅ Agent authentication via API keys
✅ Permission rule enforcement (duration, attendees, business hours)
✅ Granular action control (create vs delete)
✅ Comprehensive audit logging
✅ Detailed error messages
✅ Performance tracking (X-Worker-Time-Ms header)
✅ No external dependencies needed

## Console Logs

Watch the terminal running `npm run dev` to see detailed logs:

```
[1734651234567] POST /v1/google-calendar/events -> google_calendar:create_event
[1734651234567] Authenticated agent: Calendar Assistant (agent-test-1)
[AUDIT] DENIED - Agent: agent-test-1, Action: create_event, Reason: Event duration (60min) exceeds limit (30min)
[1734651234567] Error after 5ms: PermissionDeniedError: Event duration (60min) exceeds limit (30min)
```

## Next Steps

Once you've validated the core logic works:

1. Set up Cloudflare account (free)
2. Create D1 database and KV namespace
3. Replace in-memory storage with real D1/KV
4. Add real Google Calendar OAuth
5. Deploy to Cloudflare Workers edge network

But for now, everything works locally with zero setup!
