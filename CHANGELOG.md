# Changelog

All notable changes to the Agent Auth Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

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
  - Optimistic updates for all mutations
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

### Milestone 3: Permission Rules (Phase 3)
**Status:** Not Started
**Target:** Complete permission rule management

**Deliverables:**
- Rule creation with condition builder
- Rule listing and filtering
- Rule deletion
- Visual rule preview
- Backend rule endpoints

### Milestone 4: Enhanced Logs (Phase 4)
**Status:** Not Started
**Target:** Advanced audit log viewing

**Deliverables:**
- Filter by agent, tool, action, status
- Date range filtering
- Full-text search
- Pagination
- Export to CSV/JSON
- Expandable log details
