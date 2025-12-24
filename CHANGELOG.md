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

**API Layer:**
- Created enhanced API client system (`packages/dashboard/src/lib/api/`):
  - `client.ts` - Type-safe HTTP client with methods:
    - GET with automatic caching (5min TTL)
    - POST, PATCH, DELETE with cache invalidation
    - Query parameter handling
    - Network error detection
  - `errors.ts` - Custom error handling:
    - `ApiError` class with status code helpers
    - `getErrorMessage()` utility for user-friendly messages
    - Type-safe error responses
  - `index.ts` - Clean module exports

**Documentation:**
- Updated README.md with current implementation status
- Created CHANGELOG.md for detailed progress tracking

#### In Progress

**Core Infrastructure (Phase 1):**
- Validation schemas for agents and rules
- Custom React hooks (debounce, pagination, data fetching)
- Utility functions (formatting, dates, constants)
- Reusable UI components (dialogs, empty states, API key display)
- Backend CRUD endpoints for Worker

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
