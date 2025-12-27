# Changelog

All notable changes to the Agent Auth Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Phase 1: Foundation - In Progress

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

**Core Infrastructure (Phase 1) - Next Steps:**
- [x] Custom React hooks (`lib/hooks/`):
  - `use-debounce.ts` - Debounce search inputs (500ms default)
  - `use-pagination.ts` - Pagination state and logic
  - `use-agents.ts` - Agent data fetching/mutations
  - `use-rules.ts` - Rule data fetching/mutations
  - Note: `use-toast.ts` already exists from shadcn/ui

- [ ] Utility functions (`lib/utils/`):
  - `format.ts` - Number/currency/text formatting
  - `date.ts` - Timestamp formatting with date-fns
  - `constants.ts` - Routes, pagination defaults, cache TTL

- [ ] Reusable components (`components/shared/`):
  - `confirmation-dialog.tsx` - Destructive action confirmations
  - `empty-state.tsx` - No data states with action buttons
  - `api-key-display.tsx` - Secure key display with copy/reveal

- [ ] Backend CRUD endpoints (Worker):
  - POST /admin/agents - Create agent
  - GET /admin/agents/:id - Get agent
  - PATCH /admin/agents/:id - Update agent
  - DELETE /admin/agents/:id - Delete agent
  - POST /admin/agents/:id/regenerate-key - Regenerate API key

#### Next

**Phase 2: Agent Management**
- Agent CRUD operations
- Form components with validation
- Optimistic UI updates

**Phase 3: Permission Rules**
- Rule management UI
- Complex condition builder component

**Phase 4: Enhanced Logs**
- Advanced filtering and search
- Pagination
- Export functionality

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
**Status:** In Progress
**Target:** Complete core infrastructure for production-ready development

**Deliverables:**
- [x] UI component library (20+ components)
- [x] Form handling with validation
- [x] Enhanced API client with caching
- [ ] Validation schemas
- [ ] Custom hooks
- [ ] Utility functions
- [ ] Reusable components
- [ ] Backend CRUD endpoints

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
