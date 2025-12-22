# Agent Auth Dashboard

Modern admin dashboard for the Agent Auth platform - AI Agent Permission & Observability Platform.

## Features

- **Dashboard Overview**: Real-time stats and activity feed
- **Agent Management**: View, create, and manage AI agents
- **Audit Logs**: Complete audit trail with filtering and search
- **Modern UI**: Built with shadcn/ui components
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Type-Safe**: Full TypeScript support
- **Real-time Updates**: React Server Components with Suspense

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Date Formatting**: date-fns

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard overview
│   ├── agents/page.tsx    # Agents list
│   ├── logs/page.tsx      # Audit logs
│   ├── layout.tsx         # Root layout with sidebar
│   ├── error.tsx          # Error boundary
│   └── loading.tsx        # Loading states
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── shared/            # Custom shared components
│   │   ├── agent-card.tsx
│   │   ├── status-badge.tsx
│   │   ├── stats-card.tsx
│   │   └── activity-feed.tsx
│   ├── sidebar.tsx        # Navigation sidebar
│   └── header.tsx         # Page header
└── lib/
    ├── utils.ts           # Utility functions
    └── api-client.ts      # Backend API client
```

## Setup Instructions

### Prerequisites

- Node.js 18+ or npm
- Backend API running at `http://localhost:8787`

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables (optional):

Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8787
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Backend API Integration

The dashboard connects to the backend API with these endpoints:

- `GET /admin/agents` - List all agents
- `GET /admin/logs?limit=N` - Get audit logs
- `GET /admin/stats` - Get dashboard statistics
- `POST /admin/seed` - Seed test data

The API client is located at `src/lib/api-client.ts` and handles all backend communication.

## Pages

### Dashboard (`/`)

- **Stats Cards**: Total agents, API calls, denials, total logs
- **Recent Activity**: Last 5 log entries
- **Quick Actions**: Common tasks

### Agents (`/agents`)

- **Agent Cards**: Display all agents with status indicators
- **Actions**: View logs, edit, delete agents
- **Empty State**: Prompt to create first agent

### Audit Logs (`/logs`)

- **Data Table**: Sortable, filterable audit log entries
- **Columns**: Timestamp, Agent, Tool, Action, Result, Reason
- **Export**: Download logs as CSV/JSON

## Components

### Shared Components

- **StatusBadge**: Active/inactive/error status indicator with pulse animation
- **AgentCard**: Card display for agent information
- **StatsCard**: Metric card with icon and optional trend
- **ActivityFeed**: Recent activity list with avatars

### UI Components (shadcn/ui)

All UI components are from shadcn/ui and customizable via `src/components/ui/`:

- Button, Card, Badge, Table
- Avatar, Skeleton, Dropdown Menu
- And more...

## Styling

The dashboard uses a professional blue color scheme optimized for both light and dark modes:

- **Primary**: `#3B82F6` (Professional blue)
- **Secondary**: Neutral grays
- **Destructive**: Red for errors/denials
- **Success**: Green for allowed actions

Theme variables are defined in `src/app/globals.css`.

## Type Safety

The dashboard uses TypeScript types from `@agent-auth/shared`:

```typescript
import type { Agent, Log } from "@agent-auth/shared";
```

All API responses and component props are fully typed.

## Error Handling

- **Error Boundary**: Catches runtime errors and displays user-friendly messages
- **Loading States**: Skeleton screens for async data loading
- **API Error Handling**: Graceful degradation when backend is unavailable

## Future Enhancements

- [ ] Real-time updates with WebSocket
- [ ] Advanced filtering and search
- [ ] Create/Edit agent dialogs
- [ ] Permission rule builder
- [ ] Export functionality
- [ ] Dark mode toggle
- [ ] Pagination for large datasets
- [ ] Agent activity graphs

## Development

### Adding New Pages

1. Create a new directory in `src/app/`
2. Add a `page.tsx` file
3. Update sidebar navigation in `src/components/sidebar.tsx`

### Adding New Components

1. For UI components: `npx shadcn@latest add <component>`
2. For shared components: Create in `src/components/shared/`

### Styling Guidelines

- Use Tailwind utility classes
- Follow shadcn/ui patterns
- Use theme variables from globals.css
- Maintain responsive design (mobile-first)

## License

Private - Agent Auth Platform
