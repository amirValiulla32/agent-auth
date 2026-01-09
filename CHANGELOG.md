# Changelog

All notable changes to the Agent Auth Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Phase 6: Reasoning Governance - ✅ COMPLETED

#### Added - 2026-01-09

**🛡️ Configurable Reasoning Requirements - World's First Reasoning Enforcement**

**The Innovation:**
- First platform to let admins ENFORCE explanations from AI agents, not just log them
- Configurable per-rule reasoning requirements (none/soft/hard)
- Transforms reasoning from "nice-to-have audit data" to "enforceable governance policy"
- **Competitive differentiator:** Other platforms can't force agents to explain high-risk actions

**Implementation:**
- Added `require_reasoning` field to Rule type (`packages/shared/src/types.ts:46`)
  - Three enforcement levels: 'none' | 'soft' | 'hard'
  - Default: 'none' (backward compatible)
  - Per-rule configuration allows risk-based enforcement

- Enhanced `/v1/validate` endpoint with reasoning enforcement (`packages/worker/src/index.ts:765-794`)
  - **NONE**: Reasoning optional, no impact
  - **SOFT**: Allow but flag missing reasoning in audit logs
  - **HARD**: Block requests without reasoning (400 error)
  - Enforcement happens after permission check, before audit log creation

- Log type enhanced with compliance tracking (`packages/shared/src/types.ts:67-68`)
  - `reasoning_required`: Records what level was enforced
  - `reasoning_provided`: Boolean flag for compliance auditing
  - Enables queries like "show all soft-required operations without reasoning"

- Dashboard UI for reasoning requirement selection (`packages/dashboard/src/components/rules/create-rule-dialog.tsx:207-263`)
  - Radio button interface with three enforcement levels
  - Clear visual indicators using lucide-react icons:
    - Circle (gray): Optional
    - AlertTriangle (amber): Soft requirement
    - ShieldAlert (red): Hard requirement
  - Inline descriptions explain each enforcement level

- Rules list displays reasoning requirements (`packages/dashboard/src/components/rules/rule-list.tsx:26-52`)
  - Badge indicators show enforcement level per rule
  - Color-coded: gray (none), amber (soft), red (hard)
  - Icon-based visual language for quick scanning

- Audit logs show compliance status (`packages/dashboard/src/app/logs/page.tsx:411-476`)
  - New "Compliance" column replaces "Reason" column
  - AlertTriangle icon for flagged soft violations
  - MessageCircle icon for provided reasoning
  - Helps admins identify non-compliant agents

**Business Impact:**
- **Governance capability:** Force explanations for high-risk operations (delete, payment processing)
- **Compliance value:** Prove to auditors that critical actions always have explanations
- **Risk-based enforcement:** Low-risk operations optional, high-risk operations required
- **Migration path:** Start optional → soft enforce → hard enforce (no breaking changes)
- **Audit signals:** "Requests blocked due to missing reasoning" becomes its own security metric

**Enforcement Levels Explained:**

**NONE (Optional)**
- Reasoning field is optional
- No warnings or blocks
- Use for: Low-risk operations (read public data, health checks)

**SOFT (Allow but Flag)**
- Allow requests without reasoning
- Flag missing reasoning in audit logs with warning icon
- Use for: Medium-risk operations where you want visibility but not disruption
- Creates audit trail of suspicious behavior without breaking existing integrations

**HARD (Block Without Reasoning)**
- Block requests that don't include reasoning field
- Return 400 error with message: "This operation requires reasoning"
- Use for: High-risk operations (delete production data, financial transactions, PII access)
- Forces agents to always explain critical actions

**Example Usage:**

```typescript
// Create rule with hard reasoning requirement
POST /admin/rules
{
  "agent_id": "gpt4-assistant",
  "tool": "database",
  "scope": "delete",
  "require_reasoning": "hard"  // Force explanation for deletes
}

// Agent tries to delete without reasoning
POST /v1/validate
{
  "agent_id": "gpt4-assistant",
  "tool": "database",
  "scope": "delete"
  // No reasoning field
}

// Response: 400 Bad Request
{
  "allowed": false,
  "reason": "This operation requires reasoning. Please include 'reasoning' field explaining why you need to delete database."
}

// Agent tries again WITH reasoning
POST /v1/validate
{
  "agent_id": "gpt4-assistant",
  "tool": "database",
  "scope": "delete",
  "reasoning": "User requested cleanup of test data from QA environment"
}

// Response: 200 OK
{
  "allowed": true
}
```

**Audit Query Examples:**
- "Show all HARD-required operations where reasoning was missing" → Should return 0 (proof of enforcement)
- "Show all SOFT-required operations flagged for no reasoning" → Identifies agents that should add reasoning
- "Which agents consistently provide reasoning vs which don't?" → Agent behavior analysis

**Migration Strategy:**
1. **Week 1**: All rules default to 'none', add reasoning to API docs
2. **Week 2-4**: Developers update agent code to send reasoning
3. **Week 5**: Enable 'soft' on high-risk operations, monitor logs
4. **Week 6-8**: Contact developers of flagged agents
5. **Week 9+**: Enable 'hard' on critical operations for compliant agents

### Phase 5: AI-Native Features - ✅ COMPLETED

#### Added - 2026-01-08

**🧠 Agent Reasoning Context - World's First AI-Native Authorization**

**The Innovation:**
- First authorization platform designed for reasoning entities, not just API clients
- AI agents can now explain WHY they need permissions, not just request them
- Transforms audit logs from "what happened" to "what happened and why"
- **Competitive differentiator:** No other auth platform (permit.io, Oso, Cedar, Auth0 FGA) captures agent intent

**Implementation:**
- Added optional `reasoning` field to Log type (`packages/shared/src/types.ts`)
  - Optional string field preserves backward compatibility
  - Can contain natural language explanation from AI agent
  - Example: "User asked me to audit API keys for security review"

- Enhanced `/v1/validate` endpoint to accept reasoning
  - New optional field in validation request body
  - Stored alongside all authorization decisions (allowed and denied)
  - Reasoning persists through entire audit trail
  - 100% backward compatible - works with or without reasoning

- Dashboard UI enhancements (`packages/dashboard/src/app/logs/page.tsx`)
  - New "Agent Reasoning" column in audit logs table
  - 💭 icon indicates when reasoning is present
  - Reasoning displayed in italic, muted style for visual distinction
  - Empty state shows "-" when no reasoning provided

- Export functionality updated
  - CSV export includes "Agent Reasoning" column
  - JSON export includes reasoning field
  - Full reasoning preserved in exported data for compliance/analysis

- Test script created (`scripts/test-reasoning.sh`)
  - Demonstrates complete reasoning flow
  - Tests with and without reasoning (backward compatibility)
  - Verifies storage and display
  - Shows competitive advantage in action

**Business Impact:**
- **Unique market position:** Only AI-native authorization platform
- **Better incident response:** Understand suspicious patterns immediately
- **Enhanced compliance:** Audit trail includes agent intent, not just actions
- **Developer experience:** AI agents self-document their permission needs
- **Competitive moat:** permit.io treats agents like dumb clients - we treat them like intelligent entities

**Technical Excellence:**
- Zero breaking changes - fully backward compatible
- Optional field design follows best practices
- Reasoning doesn't affect authorization decisions (audit-only)
- Same security model as existing audit logs
- Performance: No overhead when reasoning not provided

**Example Usage:**
```json
POST /v1/validate
{
  "agent_id": "gpt4-assistant",
  "tool": "read_file",
  "scope": "/secrets.txt",
  "reasoning": "User asked me to audit API keys for security review and verify they match our documented secrets"
}
```

**Audit Log Output:**
```
✓ Agent "gpt4" accessed /secrets.txt at 2:30 PM
💭 "User asked me to audit API keys for security review"
```

### Phase 4.5: JWT Session Management - ✅ COMPLETED

#### Added - 2026-01-08

**Session-Based Authentication System:**
- JWT token generation using battle-tested `@tsndr/cloudflare-worker-jwt` library
  - Access tokens: 1 hour expiry for API requests
  - Refresh tokens: 7 days expiry for obtaining new access tokens
  - Token revocation blacklist for compromised tokens
  - Unique JWT ID (jti) for each token

- Authentication endpoints (`packages/worker/src/index.ts`)
  - `POST /auth/login` - Exchange API key for JWT token pair
  - `POST /auth/refresh` - Get new access token from refresh token
  - `POST /auth/revoke` - Revoke compromised token immediately

- Hybrid authentication support (`packages/worker/src/auth-enhanced.ts`)
  - Priority: JWT (Bearer token) → API key (X-Agent-Key header)
  - Maintains backward compatibility with existing API key flows
  - Enhanced security with token expiration vs permanent API keys

- Token management (`packages/worker/src/jwt.ts`)
  - Token generation with configurable expiry
  - Token verification and decoding
  - Header extraction (Bearer format)
  - Refresh token validation

- Storage enhancements (`packages/worker/src/storage.ts`)
  - Token revocation blacklist (in-memory Set)
  - `revokeToken(jti)` - Add token to blacklist
  - `isTokenRevoked(jti)` - Check revocation status

- Test script (`scripts/test-jwt.sh`)
  - Complete JWT flow demonstration
  - Login → Use token → Refresh → Revoke
  - Validates enterprise-ready session management

**Security Benefits:**
- Multiple sessions per agent (like Gmail on different devices)
- Revoke individual sessions without regenerating API key
- Limited blast radius from compromised credentials
- Token expiry enforces re-authentication
- Better audit trail with session tracking

### Phase 4: Audit Logs - ✅ COMPLETED

#### Added - 2026-01-06

**Audit Logging System:**
- Comprehensive audit logging integrated into authorization flow (`/v1/validate` endpoint)
  - Logs created for all authorization attempts (allowed and denied)
  - Captures: agent_id, tool, scope, allowed status, deny_reason, request_details, timestamp
  - Logging at every decision point:
    - Agent not found
    - Agent disabled
    - Tool not registered
    - Invalid scope for tool
    - Permission allowed (rule exists)
    - Permission denied (no rule exists)
  - Uses `storage.createLog()` to persist entries

**API Client Enhancements (`packages/dashboard/src/lib/api/client.ts`):**
- `getLogs(limit)` - Fetch audit logs with configurable limit (default: 100)
  - Returns array of log entries sorted by timestamp
  - Uses `cache: false` to ensure real-time data
- `getAgentLogs(agentId, limit)` - Fetch logs for specific agent
  - Agent-scoped log retrieval
  - Same caching strategy as general logs

**Frontend Logs Page (`packages/dashboard/src/app/logs/page.tsx`):**
- Fixed import path from `@/lib/api-client` to `@/lib/api/client`
- Updated table header from "Action" to "Scope" to match type definitions
- Fixed property references from `log.action` to `log.scope`
- Displays comprehensive audit trail:
  - Timestamp (relative + absolute format)
  - Truncated agent ID (first 8 chars)
  - Tool name in outlined badge
  - Scope in secondary badge
  - Result with color-coded badges (green "✓ Allowed" / red "✗ Denied")
  - Deny reason or "-" for allowed requests

**Testing & Validation:**
- Verified end-to-end logging flow
- Tested both allowed and denied authorization scenarios
- Confirmed logs appear in real-time on dashboard
- All log fields populate correctly with proper formatting

### Phase 3: Tool & Permission Management - ✅ COMPLETED

#### Changed - 2026-01-06

**🚀 ARCHITECTURAL PIVOT: Generic Tool Platform**
- **From:** Google Calendar-specific authorization system
- **To:** Generic tool-based permission platform
- **Impact:** Platform now supports ANY tool/service with custom scopes

**Key Changes:**
- Removed hardcoded Google Calendar actions and API proxying
- Introduced dynamic tool registration system
  - Agents register tools with custom names (e.g., `crm`, `patient_records`, `deployment`)
  - Each tool defines its own scopes (e.g., `read:contacts`, `write:deals`, `deploy:production`)
- Permission rules now reference tool + scope combinations (not calendar-specific)
- Authorization endpoint (`/v1/validate`) became domain-agnostic
  - Validates: Does this agent have permission for this tool's scope?
  - No longer assumes calendar operations
- UI updated to support arbitrary tool/scope management
- Database schema generalized (no calendar-specific fields)

**Benefits:**
- ✅ Support unlimited tools per agent (CRM, EHR, CI/CD, databases, APIs, etc.)
- ✅ Custom permission models per tool
- ✅ Multi-domain agent authorization from single platform
- ✅ Future-proof architecture for any integration
- ✅ Developer-friendly: Define tools and scopes as needed

**Migration Path:**
- Old calendar-specific code removed
- New tool registration API replaces hardcoded actions
- Existing agents can register multiple tools
- Scopes replace calendar action enums

#### Added - 2026-01-06

**Scope-Based Architecture (Refactored from Actions):**
- Renamed "actions" terminology to "scopes" throughout codebase
  - Updated type definitions in `@agent-auth/shared`
  - Updated worker authorization logic
  - Updated dashboard UI and components
- Scopes represent granular permissions (e.g., `read:contacts`, `write:deals`)
- Tools define available scopes they support

**Tool Management System:**
- `POST /admin/tools` - Create new tool for an agent
  - Validation: agent_id, name (lowercase + underscores), scopes array
  - Description field (optional)
- `PUT /admin/tools/:id` - Update existing tool
  - Update name, scopes, and description
- `DELETE /admin/tools/:id` - Delete tool
- `GET /admin/agents/:id/tools` - List all tools for an agent

**Tool Management UI Components:**
- `create-tool-dialog.tsx` - Create new tools
  - Form validation with Zod schema
  - Name pattern: lowercase letters and underscores only (`/^[a-z_]+$/`)
  - Scopes as comma-separated input
  - Real-time validation feedback
- `edit-tool-dialog.tsx` - Edit existing tools
  - Pre-populated form with tool data
  - Same validation as creation
  - Optimistic UI updates
- Integration with agent detail pages

**useTools Hook (`packages/dashboard/src/lib/hooks/use-tools.ts`):**
- `fetchToolsForAgent(agentId)` - Fetch tools for specific agent
- `createTool(data)` - Create new tool with validation
- `updateTool(id, data)` - Update tool with optimistic updates
- `deleteTool(id)` - Delete tool with confirmation
- Automatic state management and error handling
- Toast notifications for all operations
- Cache invalidation after mutations

**Agent Rules Management:**
- `agent-rules-dialog.tsx` - Dialog for managing agent permission rules
  - Display all tools and their scopes for an agent
  - Create permission rules for specific tool + scope combinations
  - Visual feedback for which scopes have rules
  - Integration with permission rule creation flow

**Storage Layer (`packages/worker/src/storage.ts`):**
- Tool CRUD operations:
  - `createTool(tool)` - Add new tool to storage
  - `getTool(id)` - Retrieve single tool
  - `updateTool(id, updates)` - Update tool fields
  - `deleteTool(id)` - Remove tool from storage
  - `listToolsForAgent(agentId)` - Get all tools for agent
- Validation logic for tool-scope relationships
- Cascading deletes (deleting tool removes associated rules)

#### Changed - 2026-01-06

**Terminology Standardization:**
- Global find/replace of "action" → "scope" in:
  - Type definitions (`Log`, `Rule` interfaces)
  - Database field names
  - API request/response payloads
  - UI labels and component props
  - Validation schemas
- Updated documentation and comments to reflect scope terminology

### Phase 1: Foundation - ✅ COMPLETED

#### Added - 2025-12-27

**Shared Components (`packages/dashboard/src/components/shared/`):**
- `confirmation-dialog.tsx` - Reusable confirmation dialog for destructive actions
  - Supports default and destructive variants
  - Loading state support
  - Customizable text and callbacks
- `empty-state.tsx` - Empty state component with action buttons
  - Icon support via lucide-react
  - Primary and secondary actions
  - Customizable title and description
- `api-key-display.tsx` - Secure API key display component
  - Masked display with reveal toggle
  - Copy to clipboard functionality
  - Toast notifications for user feedback

**Backend CRUD Endpoints (Worker):**
- `POST /admin/agents` - Create new agent with validation
- `GET /admin/agents/:id` - Retrieve single agent by ID
- `PATCH /admin/agents/:id` - Update agent name and enabled status
- `DELETE /admin/agents/:id` - Delete agent and associated rules
- `POST /admin/agents/:id/regenerate-key` - Generate new API key for agent

**Storage Layer Enhancements:**
- `updateAgent()` - Update agent fields with automatic timestamp
- `regenerateApiKey()` - Update API key with new generated value

**UI Components:**
- Installed `alert-dialog` shadcn component for confirmation dialogs

#### Added - 2025-12-24

**Dashboard Infrastructure:**
- Installed 20 shadcn/ui components for production-ready UI
  - Form components: `dialog`, `form`, `input`, `label`, `select`, `textarea`
  - Feedback components: `toast`, `toaster`, `alert`
  - Data components: `checkbox`, `switch`, `tabs`
  - Previously existing: `avatar`, `badge`, `button`, `card`, `dropdown-menu`, `table`, `separator`, `skeleton`

- Installed form handling libraries:
  - `react-hook-form` (v7.69.0) - Performant form state management
  - `@hookform/resolvers` (v5.2.2) - Schema validation integration
  - `zod` (v3.22.3) - TypeScript-first schema validation

**API Layer (`packages/dashboard/src/lib/api/`):**
- `client.ts` - Type-safe HTTP client:
  - GET with automatic caching (5min TTL)
  - POST, PATCH, DELETE with cache invalidation
  - Query parameter handling
  - Network error detection
- `errors.ts` - Custom error handling:
  - `ApiError` class with status code helpers
  - `getErrorMessage()` utility for user-friendly messages
- `index.ts` - Clean module exports

**Validation Layer (`packages/dashboard/src/lib/validators/`):**
- `agent.ts` - Agent validation schemas:
  - `createAgentSchema` - Name validation (1-100 chars, alphanumeric), enabled flag
  - `updateAgentSchema` - Partial updates
  - `apiKeySchema` - API key format validation
  - Auto-sanitization (trim whitespace)
- `rule.ts` - Rule validation schemas:
  - `ruleConditionsSchema` - Validates conditions with at least one required:
    - `max_duration` (1-1440 minutes)
    - `max_attendees` (1-1000)
    - `business_hours_only` (boolean)
  - `createRuleSchema` - Full rule validation with agent_id, tool, action, conditions
  - Helper functions: `getToolDisplayName()`, `getActionDisplayName()`
  - Constants: TOOLS, ACTIONS
- `index.ts` - Clean exports
- All schemas export TypeScript types for type-safe forms

**Custom Hooks (`packages/dashboard/src/lib/hooks/`):**
- `use-debounce.ts` - Debounce hook for search inputs:
  - Generic type support
  - Configurable delay (default: 500ms)
  - Auto-cleanup to prevent memory leaks
  - Perfect for preventing excessive API calls during typing
- `use-pagination.ts` - Complete pagination management:
  - Full state: currentPage, totalPages, offset, hasNextPage, hasPrevPage
  - Navigation: nextPage(), prevPage(), goToPage(), firstPage(), lastPage()
  - Dynamic items per page with auto-reset to first page
  - Type-safe with exported interfaces
- `index.ts` - Clean exports including re-export of useToast from shadcn/ui
- Note: `use-agents` and `use-rules` will be added in Phase 2 with API clients

**Documentation:**
- Updated README.md (streamlined from 462 to 171 lines)
- Enhanced CHANGELOG.md as primary tracking document

#### In Progress

**Phase 2: Agent Management** (7 steps)

**Implementation Plan:**
- [x] Step 1: Extend API client (`lib/api/client.ts`)
  - Added createAgent(), getAgent(), updateAgent(), deleteAgent(), regenerateApiKey()
  - Type-safe wrappers around Worker endpoints
  - Automatic cache invalidation on mutations

- [ ] Step 2: Create useAgents hook (`lib/hooks/use-agents.ts`)
  - Fetch agents list with loading/error states
  - Optimistic updates for alutations
  - Cache invalidation after operations
  - Export mutation functions: createAgent, updateAgent, deleteAgent, regenerateKey

- [ ] Step 3: Create agent form dialog (`components/agents/create-agent-dialog.tsx`)
  - Form with react-hook-form + zodResolver(createAgentSchema)
  - Name input + enabled switch
  - Display new API key after creation using ApiKeyDisplay component
  - Toast notifications for success/error

- [ ] Step 4: Edit agent form dialog (`components/agents/edit-agent-dialog.tsx`)
  - Pre-populate form with agent data
  - Update name and enabled status
  - Optimistic UI update

- [ ] Step 5: Delete agent confirmation (update `app/agents/page.tsx`)
  - Wire up ConfirmationDialog component
  - Show agent name in confirmation
  - Handle loading state

- [ ] Step 6: Regenerate API key flow (`components/agents/regenerate-key-dialog.tsx`)
  - Confirmation dialog with warning about invalidation
  - Display new key with ApiKeyDisplay
  - Force copy before closing

- [ ] Step 7: Wire up agents page (update `app/agents/page.tsx`)
  - Replace manual fetch with useAgents hook
  - Connect all dialogs to buttons
  - Pass handlers to AgentCard
  - Proper loading and error states

**Estimated completion:** ~2.5 hours

#### Next

**Phase 3: Permission Rules**
- Rule management UI
- Complex condition builder component

**Phase 4: Enhanced Logs**
- Advanced filtering and search
- Pagination
- Export functionality

**Phase 5: Security Enhancements** (Future)
- **Session Management (JWT)**
  - Login endpoint: POST /auth/login (API key → JWT token)
  - Token-based authentication with expiration
  - Session tracking and active session management
  - Token refresh mechanism
  - Per-session rate limiting
  - Session revocation without API key regeneration
  - Benefits: Revocable access, temporary credentials, multi-session support

- **Request Signing (HMAC)**
  - HMAC-SHA256 signature verification
  - Timestamp-based replay attack prevention
  - Request integrity validation
  - Non-repudiation audit trail
  - Benefits: Tamper-proof requests, compliance-ready

- **Enhanced Security Features**
  - Rate limiting per agent/session
  - IP allowlisting per agent
  - API key scoping (per tool/action)
  - Scheduled key rotation
  - Security event logging

**Implementation Priority:**
- **Phase 2-4:** Focus on core product features
- **Phase 5:** Add based on use case requirements:
  - Internal tools → Keep API keys (simple)
  - Partner/customer SaaS → Add JWT sessions (revocable access)
  - Sensitive data → Add request signing (compliance)

---

## [0.1.0] - 2025-12-20

### Initial Setup

#### Added
- Monorepo structure with npm workspaces
- TypeScript configuration for all packages
- Cloudflare Worker package setup
- Next.js 14 dashboard with App Router
- Shared types package
- Database migrations (D1 schema)
- Basic README and documentation
- Testing guide (TESTING.md)

**Packages:**
- `@agent-auth/worker` - Cloudflare Worker proxy service
- `@agent-auth/dashboard` - Next.js admin dashboard
- `@agent-auth/shared` - Shared TypeScript types

**Worker Features:**
- Agent authentication system
- Permission evaluation engine
- Audit logging
- Mock Google Calendar proxy for testing
- In-memory storage for local development

**Dashboard Features:**
- Basic UI with sidebar navigation
- Three pages: Dashboard, Agents, Audit Logs
- Read-only data display
- shadcn/ui component library foundation
- Tailwind CSS styling

**Database Schema:**
- `agents` table - AI agent credentials
- `rules` table - Permission rules with JSON conditions
- `logs` table - Audit trail

---

## Project Milestones

### ✅ Milestone 1: Foundation (Phase 1)
**Status:** COMPLETED ✅
**Completed:** 2025-12-27

**Deliverables:**
- [x] UI component library (21 shadcn components)
- [x] Form handling with validation (React Hook Form + Zod)
- [x] Enhanced API client with caching (5min TTL)
- [x] Validation schemas (agents and rules)
- [x] Custom hooks (useDebounce, usePagination)
- [x] Utility functions (format, date, constants)
- [x] Reusable components (confirmation-dialog, empty-state, api-key-display)
- [x] Backend CRUD endpoints (5 agent endpoints)

### Milestone 2: Agent Management (Phase 2)
**Status:** Not Started
**Target:** Full CRUD operations for agents

**Deliverables:**
- Agent creation with form validation
- Agent editing
- Agent deletion with confirmation
- API key regeneration
- Optimistic UI updates

### Milestone 3: Tool & Permission Management (Phase 3)
**Status:** COMPLETED ✅
**Completed:** 2026-01-06

**Deliverables:**
- [x] 🚀 **Architectural pivot to generic tool platform**
  - [x] Removed Google Calendar-specific code
  - [x] Dynamic tool registration system
  - [x] Domain-agnostic authorization engine
  - [x] Support for unlimited tools per agent
- [x] Scope-based architecture (refactored from actions)
- [x] Tool management system (CRUD operations)
- [x] Tool creation and editing UI components
- [x] useTools hook with state management
- [x] Agent rules dialog for permission management
- [x] Storage layer enhancements for tools
- [x] Terminology standardization across codebase

### Milestone 4: Audit Logs (Phase 4)
**Status:** COMPLETED ✅
**Completed:** 2026-01-06

**Deliverables:**
- [x] Comprehensive audit logging in authorization flow
- [x] API client methods for fetching logs
- [x] Frontend logs page with proper formatting
- [x] Real-time log display with color-coded results
- [x] Support for both allowed and denied requests
- [x] Agent-scoped and global log retrieval
- [x] End-to-end testing and validation
- [x] **Server-side filtering and pagination** (2026-01-06)
- [x] **Advanced search and date range filtering** (2026-01-06)
- [x] **Export to CSV/JSON** (2026-01-06)

**Recent Updates - 2026-01-06:**

**Server-Side Filtering & Pagination:**
- Complete server-side implementation in worker `/admin/logs` endpoint
  - Query parameters: limit, offset, agent_id, tool, scope, allowed, search, from_date, to_date
  - Returns: { logs, total, count } for accurate pagination
- Frontend logs page refactored for server-side data fetching
  - All filters trigger server requests (no client-side filtering)
  - Pagination with total page calculation
  - Reset to page 1 when filters change
- Filter options populated from server data
  - Unique agents, tools, scopes extracted from all logs
  - Dropdowns show only values present in data

**Advanced Filtering UI:**
- Multi-select filters:
  - Agent ID dropdown (first 8 chars displayed)
  - Tool name dropdown
  - Scope dropdown
  - Status filter (All / Allowed / Denied)
- Date range picker with calendar component
  - From/To date selection
  - Timestamp conversion (start of day → end of day)
  - Clear date range button
- Full-text search across agent_id, tool, scope, deny_reason
- "Clear all filters" button when any filter active
- Filter persistence during pagination

**Export Functionality:**
- CSV export with all filtered logs (up to 10,000)
  - Headers: Timestamp, Agent ID, Tool, Scope, Result, Reason
  - Filename: `audit-logs-YYYY-MM-DD-HHmmss.csv`
- JSON export with formatted data
  - ISO timestamp format
  - Result field added for clarity
  - Filename: `audit-logs-YYYY-MM-DD-HHmmss.json`
- Export respects current filters (only exports filtered subset)

**Test Data Generation:**
- `scripts/seed-data.ts` - Comprehensive seed script
  - Creates 8 agents with 5-10 tools each
  - Generates 200 authorization logs (70% allowed, 30% denied)
  - Uses `/v1/validate` endpoint for realistic log creation
  - Creates tools with random scopes
  - Creates permission rules (60% of scopes)
  - Smart distribution of allowed/denied for testing filters

**Bug Fixes:**
- Fixed API port configuration inconsistencies
  - Updated `.env.local` to port 65534
  - Updated both API clients (`lib/api-client.ts` and `lib/api/client.ts`)
- Fixed filter controls disappearing when no logs match filters
  - Removed `logs.length > 0` condition from filter controls render
  - Filters now always visible when data loaded
  - Better UX for empty state with active filters
