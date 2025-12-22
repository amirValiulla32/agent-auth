# Agent Auth Dashboard - Design Brief

## Executive Summary

This design brief provides comprehensive UI/UX recommendations for the Agent Auth admin dashboard - a platform for managing AI agent permissions and observability. The recommendations are based on analysis of leading platforms (Auth0, Clerk, Stripe, Vercel, Linear) and modern shadcn/ui implementation patterns.

---

## 1. Dashboard Inspiration & Reference Examples

### 1.1 **Auth0 Dashboard** - Permission Management Excellence
**Why It's Relevant**: Industry-leading RBAC and permission management

**Key Features**:
- Role-based access control (RBAC) with granular permission assignment
- Built-in dashboard roles (Viewer-Users, Editor-Users) for team access
- Bulk user management with streamlined UI
- Delegated administration dashboard for limited access
- Centralized tenant management from Teams dashboard

**Design Patterns to Adopt**:
- Permission selection through checkboxes with API grouping
- Role creation workflow with clear description fields
- Hierarchical permission display (API → Permissions structure)
- Bulk action support with clear feedback

**Color Scheme**: Professional blues with neutral grays, high-contrast CTAs

---

### 1.2 **Clerk Dashboard** - User Management & Modern UI
**Why It's Relevant**: Clean, developer-friendly interface with excellent UX

**Key Features**:
- 507 UI screens covering detailed user flows
- Workspace/application/instance dropdown hierarchy
- Six prebuilt appearance themes (Default, Dark, Shadcn, Shades of Purple, Neobrutalism, Simple)
- RTL language support and full accessibility (WAI-ARIA)
- Global search command palette
- Embeddable UI components

**Design Patterns to Adopt**:
- Clean card-based layouts for agent display
- Hierarchical navigation (workspace → app → instance pattern)
- UserButton pattern for account management
- Context-sensitive side panels for detailed views

**Color Scheme**: Minimalist with bold accent colors, excellent dark mode

---

### 1.3 **Stripe Dashboard** - API & Logs Interface
**Why It's Relevant**: Best-in-class API key management and request logging

**Key Features**:
- Four API keys per account (secret/publishable, test/live)
- Request logs with filtering by source (Dashboard/API)
- Workbench for detailed request inspection
- One-click log copying to clipboard
- Live tail functionality for real-time monitoring
- Restricted API keys with customizable access levels

**Design Patterns to Adopt**:
- Overflow menu on each key for actions (View logs, Regenerate, etc.)
- Log detail panels showing request/response/related resources
- Filter-first approach to log exploration
- Clear visual separation between test/production environments

**Color Scheme**: Clean white with blue accents, subtle borders, minimal shadows

---

### 1.4 **Datadog/Sentry** - Observability Dashboard
**Why It's Relevant**: Real-time monitoring and log visualization excellence

**Key Features**:
- Live tail feature for real-time log monitoring
- Advanced filtering and search capabilities
- Custom dashboard creation with drag-and-drop
- Error correlation with performance metrics
- Multiple visualization options for logs
- Alert and threshold configuration

**Design Patterns to Adopt**:
- Dashboard creation flow for custom views
- Query-based filtering (sources:sentry pattern)
- Error trend visualization over time
- Event overlay on performance graphs
- Time-range selector for log exploration

**Color Scheme**: Dark mode optimized, color-coded severity levels

---

### 1.5 **Vercel Dashboard** - Clean Next.js Implementation
**Why It's Relevant**: Modern Next.js architecture with excellent performance

**Key Features**:
- Production vs Preview deployment filtering
- Member-based filtering for team collaboration
- Live log tailing with function-specific filtering
- Mobile-responsive design
- Fast First Meaningful Paint (<1.2s)
- API access for programmatic monitoring

**Design Patterns to Adopt**:
- Deployment overview with prominent production highlight
- Function-specific log filtering
- One-click log copying
- Real-time updates without page refresh
- Minimalist card design with clear hierarchy

**Color Scheme**: Black/white foundation, subtle gradients, blue accents

---

## 2. shadcn/ui Component Recommendations

### 2.1 **Core Layout Components**

#### **Sidebar Navigation**
```tsx
// Components: AppSidebar, SidebarInset, SidebarProvider
Layout: Fixed sidebar (64 spacing units) with sticky header
Mobile: Collapsible via menu toggle
Pattern: Hierarchical navigation with collapsible sections
```

**Implementation**:
- Use `@shadcn/ui` sidebar component (modified for RTL support)
- Sticky positioning with 12-unit height header
- Quick action button in header ("Create Agent", "New Rule", etc.)

#### **Responsive Grid System**
```
Grid Columns: 1 (mobile) → 2 (@xl) → 4 (@5xl)
Use container queries for component-level responsiveness
CSS custom properties for theming flexibility
```

---

### 2.2 **Data Display Components**

#### **Data Tables** (Primary for Audit Logs & Agent Lists)
```tsx
// Component: DataTable (TanStack Table integration)
// Source: https://ui.shadcn.com/docs/components/data-table

Features:
- Server-side sorting, filtering, pagination
- Row selection with checkboxes
- Column visibility controls
- Inline actions (menu on each row)
- Export functionality
- Sticky headers for long lists
```

**Recommended Variants**:
- **Agent List**: Card view on mobile, table on desktop
- **Audit Logs**: Full table with advanced filtering
- **API Keys**: Simple table with copy/reveal actions

#### **Metric Cards** (Dashboard Overview)
```tsx
// Sources: REUI, BundUI, ShadcnStore

Card Structure:
├── Icon (category indicator)
├── Metric value (large, prominent)
├── Title (descriptive label)
└── Trend indicator (+12.5%, badge or arrow)
```

**Key Metrics to Display**:
- Total Active Agents (with trend)
- Permission Denials Today (with severity indicator)
- API Calls This Month (with quota percentage)
- Critical Alerts (with red highlight if >0)

**Implementation**:
```bash
pnpm dlx shadcn@latest add @reui/statistic-card-1
```

---

### 2.3 **Form & Input Components**

#### **Permission Rule Builder**
Use these shadcn components:
- **Select**: For choosing resources, actions, conditions
- **Combobox**: Multi-select for tag-based permissions
- **Toggle**: Enable/disable permissions
- **Radio Group**: Permission level selection (allow/deny/custom)
- **Input**: Custom values for conditions

**Pattern**: Dynamic form rows with Add/Remove functionality
```tsx
Rule Structure:
[Resource Dropdown] [Action Dropdown] [Condition Input] [Remove Button]
[+ Add Rule Button]
[AND/OR Toggle]
```

---

### 2.4 **Status & Feedback Components**

#### **Badge Component** - Status Indicators
```tsx
// Component: Badge
// Source: https://ui.shadcn.com/docs/components/badge

Variants:
- default: Neutral gray for inactive
- secondary: Blue for active
- destructive: Red for denied/error
- outline: For secondary metadata

Examples:
<Badge variant="secondary">Active</Badge>
<Badge variant="destructive">Denied</Badge>
<Badge>Pending</Badge>
```

#### **Status Dots** - Agent Activity Indicators
Create custom component combining badge + ping animation:
```tsx
// Filled circle with optional pulse animation
Status Types:
- Online (green + pulse)
- Offline (gray)
- Active (blue + pulse)
- Error (red + pulse)
```

**Best Practice**: Position status indicator next to agent name/title

#### **Toast Notifications** - Action Feedback
```tsx
// Component: Sonner (24 variants available)
// Use for: Permission changes, API key creation, errors

Examples:
- Success: "API key created successfully"
- Error: "Failed to update permissions"
- Warning: "Agent approaching rate limit"
```

---

### 2.5 **Dialog & Modal Components**

#### **Dialogs** - Workflows & Confirmations
```tsx
// Components: Dialog, AlertDialog, Drawer

Use Cases:
- Dialog: Create Agent, Edit Permissions, View Details
- AlertDialog: Delete confirmations, Revoke access
- Drawer (mobile): Full-screen forms on mobile
```

**Pattern**: 17 drawer variants, 39 alert-dialog options available

#### **Context Menus** - Quick Actions
```tsx
// Component: ContextMenu (27 variants)

Agent Row Actions:
- Edit Agent
- View Audit Log
- Regenerate API Key
- Revoke Access (with confirmation)
- Export Agent Data
```

---

## 3. Layout Structure Recommendation

### 3.1 **Three-Column Layout**

```
┌─────────────┬──────────────────────────────┬─────────────┐
│             │                              │             │
│   Sidebar   │      Main Content Area       │  Side Panel │
│   (Fixed)   │      (Scrollable)            │  (Context)  │
│             │                              │             │
│   Nav       │  ┌──────────────────────┐   │  Agent      │
│   Links     │  │   Metric Cards       │   │  Details    │
│             │  │   (4-col grid)       │   │             │
│   Agent     │  └──────────────────────┘   │  Quick      │
│   - List    │                              │  Actions    │
│   - Logs    │  ┌──────────────────────┐   │             │
│   - Rules   │  │   Data Table         │   │  Activity   │
│   - API     │  │   (Agents/Logs)      │   │  Feed       │
│             │  │                      │   │             │
│   Settings  │  └──────────────────────┘   │             │
│             │                              │             │
└─────────────┴──────────────────────────────┴─────────────┘
```

**Responsive Behavior**:
- **Desktop (>1280px)**: Three columns
- **Tablet (768-1280px)**: Sidebar + Main (side panel as modal)
- **Mobile (<768px)**: Main only (hamburger menu for sidebar)

---

### 3.2 **Page-Specific Layouts**

#### **Dashboard Overview Page**
```
┌─────────────────────────────────────────────┐
│  Header: "Dashboard" + Date Range Selector  │
├─────────────────────────────────────────────┤
│  Metric Cards (4-column grid)               │
│  [Total Agents] [Active Now] [Denied] [...]│
├─────────────────────────────────────────────┤
│  Charts Section (2-column)                  │
│  [API Calls Chart] [Permission Denials]    │
├─────────────────────────────────────────────┤
│  Recent Activity Table (mini-version)       │
│  [5 most recent log entries]                │
└─────────────────────────────────────────────┘
```

#### **Agent List Page**
```
┌─────────────────────────────────────────────┐
│  Header: "Agents" + [Create Agent Button]   │
├─────────────────────────────────────────────┤
│  Search + Filters                           │
│  [Search box] [Status filter] [Sort]        │
├─────────────────────────────────────────────┤
│  Agent Cards (Grid) or Table View Toggle    │
│                                             │
│  Card View:                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐               │
│  │Agent │ │Agent │ │Agent │               │
│  │Card  │ │Card  │ │Card  │               │
│  └──────┘ └──────┘ └──────┘               │
│                                             │
│  Table View:                                │
│  │Name │ Status │ Last Active │ Actions│   │
│  │───────────────────────────────────────│  │
│  │Agent1│ ⚫ Active│ 2m ago │ ⋮ │        │
└─────────────────────────────────────────────┘
```

#### **Audit Log Page**
```
┌─────────────────────────────────────────────┐
│  Header: "Audit Logs" + [Export Button]     │
├─────────────────────────────────────────────┤
│  Advanced Filters (Collapsible Panel)       │
│  [Event Type] [User] [Date Range] [Status]  │
├─────────────────────────────────────────────┤
│  Data Table with Pagination                 │
│  │Time │ Agent │ Action │ Resource │Result│ │
│  │──────────────────────────────────────────││
│  │2m ago│Agent1│READ    │/api/data │✓    ││ │
│  │5m ago│Agent2│WRITE   │/api/post │✗    ││ │
├─────────────────────────────────────────────┤
│  [Prev] Page 1 of 42 [Next]                │
└─────────────────────────────────────────────┘
```

#### **Permission Rules Page**
```
┌─────────────────────────────────────────────┐
│  Header: "Permission Rules" + [New Rule]    │
├─────────────────────────────────────────────┤
│  Rule List (Accordions)                     │
│                                             │
│  ▼ Production API Access                    │
│    Resources: /api/*                        │
│    Actions: READ, WRITE                     │
│    Conditions: rate_limit < 1000/min        │
│    [Edit] [Duplicate] [Delete]              │
│                                             │
│  ▶ Restricted Admin Access                  │
│                                             │
│  ▶ Public Read-Only                         │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 4. Color Scheme & Design System

### 4.1 **Recommended Color Palette**

Based on shadcn/ui theming system with CSS variables:

#### **Light Mode**
```css
:root {
  --background: 0 0% 100%;           /* Pure white */
  --foreground: 222.2 84% 4.9%;      /* Near black */

  --primary: 221.2 83.2% 53.3%;      /* Professional blue */
  --primary-foreground: 210 40% 98%; /* Light text on blue */

  --secondary: 210 40% 96.1%;        /* Light gray blue */
  --secondary-foreground: 222.2 47.4% 11.2%; /* Dark text */

  --muted: 210 40% 96.1%;            /* Subtle backgrounds */
  --muted-foreground: 215.4 16.3% 46.9%; /* Muted text */

  --accent: 210 40% 96.1%;           /* Highlight color */
  --accent-foreground: 222.2 47.4% 11.2%; /* Text on accent */

  --destructive: 0 84.2% 60.2%;      /* Error red */
  --destructive-foreground: 210 40% 98%; /* Light text on red */

  --success: 142 71% 45%;            /* Success green */
  --warning: 38 92% 50%;             /* Warning orange */

  --border: 214.3 31.8% 91.4%;       /* Subtle borders */
  --input: 214.3 31.8% 91.4%;        /* Input borders */
  --ring: 221.2 83.2% 53.3%;         /* Focus ring */

  --radius: 0.5rem;                  /* Border radius */
}
```

#### **Dark Mode**
```css
.dark {
  --background: 222.2 84% 4.9%;      /* Near black */
  --foreground: 210 40% 98%;         /* Near white */

  --primary: 217.2 91.2% 59.8%;      /* Brighter blue */
  --primary-foreground: 222.2 47.4% 11.2%; /* Dark text */

  --secondary: 217.2 32.6% 17.5%;    /* Dark gray blue */
  --secondary-foreground: 210 40% 98%; /* Light text */

  --muted: 217.2 32.6% 17.5%;        /* Dark backgrounds */
  --muted-foreground: 215 20.2% 65.1%; /* Muted light text */

  --accent: 217.2 32.6% 17.5%;       /* Dark highlight */
  --accent-foreground: 210 40% 98%;  /* Light text */

  --destructive: 0 62.8% 30.6%;      /* Dark red */
  --destructive-foreground: 210 40% 98%; /* Light text */

  --success: 142 71% 35%;            /* Dark green */
  --warning: 38 92% 40%;             /* Dark orange */

  --border: 217.2 32.6% 17.5%;       /* Dark borders */
  --input: 217.2 32.6% 17.5%;        /* Input borders */
  --ring: 224.3 76.3% 48%;           /* Focus ring */
}
```

---

### 4.2 **Semantic Color Usage**

#### **Status Colors**
```tsx
Active/Online:    green-500  (#22c55e)
Inactive/Offline: gray-400   (#9ca3af)
Pending:          yellow-500 (#eab308)
Error/Denied:     red-500    (#ef4444)
Warning:          orange-500 (#f97316)
Success:          green-500  (#22c55e)
```

#### **Permission States**
```tsx
Allowed:   badge-secondary (blue)
Denied:    badge-destructive (red)
Inherited: badge-outline (gray)
Custom:    badge-default (neutral)
```

#### **Agent Activity Indicators**
```tsx
Active within 5min:  green dot + pulse animation
Active within 1hr:   blue dot
Offline:             gray dot (no animation)
Error state:         red dot + pulse animation
```

---

### 4.3 **Typography Scale**

```css
/* shadcn/ui default scale */
.text-xs   { font-size: 0.75rem; line-height: 1rem; }    /* 12px */
.text-sm   { font-size: 0.875rem; line-height: 1.25rem; } /* 14px */
.text-base { font-size: 1rem; line-height: 1.5rem; }     /* 16px */
.text-lg   { font-size: 1.125rem; line-height: 1.75rem; } /* 18px */
.text-xl   { font-size: 1.25rem; line-height: 1.75rem; }  /* 20px */
.text-2xl  { font-size: 1.5rem; line-height: 2rem; }     /* 24px */
.text-3xl  { font-size: 1.875rem; line-height: 2.25rem; } /* 30px */
.text-4xl  { font-size: 2.25rem; line-height: 2.5rem; }  /* 36px */
```

**Usage Guidelines**:
- **Page Headers**: text-3xl font-bold
- **Card Titles**: text-xl font-semibold
- **Metric Values**: text-2xl font-bold
- **Body Text**: text-sm
- **Labels**: text-xs uppercase tracking-wide
- **Table Headers**: text-sm font-medium

---

### 4.4 **Spacing System**

```css
/* Tailwind spacing (consistent with shadcn/ui) */
Gap between sections:     space-y-8  (2rem / 32px)
Gap between cards:        gap-6      (1.5rem / 24px)
Card padding:             p-6        (1.5rem / 24px)
Form field spacing:       space-y-4  (1rem / 16px)
Button padding:           px-4 py-2  (1rem x 0.5rem)
```

---

## 5. Specific UI Patterns for Key Features

### 5.1 **Agent List/Cards Display**

#### **Card View** (Preferred for <10 agents)
```tsx
<Card className="hover:shadow-lg transition-shadow">
  <CardHeader className="flex flex-row items-center gap-4">
    <Avatar>
      <AvatarFallback>A1</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <CardTitle>GPT-4 Research Agent</CardTitle>
      <CardDescription>Created 3 days ago</CardDescription>
    </div>
    <Badge variant="secondary">
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        Active
      </span>
    </Badge>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-3 gap-4 text-sm">
      <div>
        <p className="text-muted-foreground">API Calls</p>
        <p className="font-semibold">2,347</p>
      </div>
      <div>
        <p className="text-muted-foreground">Last Active</p>
        <p className="font-semibold">2m ago</p>
      </div>
      <div>
        <p className="text-muted-foreground">Permissions</p>
        <p className="font-semibold">3 rules</p>
      </div>
    </div>
  </CardContent>
  <CardFooter className="flex gap-2">
    <Button variant="outline" size="sm">View Logs</Button>
    <Button variant="outline" size="sm">Edit</Button>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">⋮</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Regenerate API Key</DropdownMenuItem>
        <DropdownMenuItem>View Audit Log</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          Revoke Access
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </CardFooter>
</Card>
```

#### **Table View** (Preferred for >10 agents)
```tsx
Columns:
- Status indicator (dot)
- Agent Name
- Created Date
- Last Active (relative time)
- API Calls (this month)
- Permission Rules (count with tooltip)
- Actions (dropdown menu)

Features:
- Column sorting
- Multi-select for bulk actions
- Search filter
- Status filter (Active/Inactive/All)
```

---

### 5.2 **Permission Rule Builder**

#### **Visual Pattern** (iTunes-style)
```tsx
<Card>
  <CardHeader>
    <CardTitle>Create Permission Rule</CardTitle>
    <CardDescription>
      Define what actions this agent can perform
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Rule Name */}
    <div>
      <Label>Rule Name</Label>
      <Input placeholder="e.g., Production API Access" />
    </div>

    {/* Dynamic Rules */}
    <div className="space-y-2">
      <Label>Conditions</Label>
      {rules.map((rule, index) => (
        <div key={index} className="flex gap-2">
          <Select> {/* Resource */}
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Resource" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="/api/*">All APIs</SelectItem>
              <SelectItem value="/api/read">Read API</SelectItem>
              <SelectItem value="/api/write">Write API</SelectItem>
            </SelectContent>
          </Select>

          <Select> {/* Action */}
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="allow">Allow</SelectItem>
              <SelectItem value="deny">Deny</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeRule(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={addRule}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Condition
      </Button>
    </div>

    {/* AND/OR Logic */}
    <div>
      <Label>Match Logic</Label>
      <RadioGroup defaultValue="all">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="all" id="all" />
          <Label htmlFor="all">All conditions must match (AND)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="any" id="any" />
          <Label htmlFor="any">Any condition can match (OR)</Label>
        </div>
      </RadioGroup>
    </div>
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">Cancel</Button>
    <Button>Create Rule</Button>
  </CardFooter>
</Card>
```

---

### 5.3 **Audit Log Display**

#### **Recommended: Table View with Detail Panel**

**Primary View**:
```tsx
<DataTable columns={auditLogColumns} data={logs}>
  Columns:
  - Timestamp (relative + absolute on hover)
  - Agent Name (with avatar/icon)
  - Action (badge: READ/WRITE/DELETE/etc.)
  - Resource (truncated with tooltip)
  - Result (✓ allowed / ✗ denied)
  - Reason (for denied requests)
  - Details (expandable row)

  Features:
  - Server-side pagination
  - Advanced filters (collapsible panel):
    - Date range picker
    - Agent multi-select
    - Action type checkboxes
    - Result toggle (allowed/denied/both)
  - Export to CSV/JSON
  - Real-time updates (WebSocket badge when new logs arrive)
</DataTable>
```

**Detail Panel** (Expandable row or side panel):
```tsx
<div className="bg-muted p-4 rounded-md space-y-3">
  <div className="grid grid-cols-2 gap-4 text-sm">
    <div>
      <p className="text-muted-foreground">Request ID</p>
      <code className="text-xs">req_abc123...</code>
    </div>
    <div>
      <p className="text-muted-foreground">IP Address</p>
      <code className="text-xs">192.168.1.1</code>
    </div>
    <div>
      <p className="text-muted-foreground">Duration</p>
      <p>142ms</p>
    </div>
    <div>
      <p className="text-muted-foreground">Matched Rule</p>
      <Badge variant="outline">Production Access</Badge>
    </div>
  </div>

  <Separator />

  <div>
    <p className="text-sm font-medium mb-2">Request Details</p>
    <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
{JSON.stringify({
  method: "POST",
  path: "/api/data",
  headers: { ... },
  body: { ... }
}, null, 2)}
    </pre>
  </div>

  <div className="flex gap-2">
    <Button variant="outline" size="sm">
      View Full Request
    </Button>
    <Button variant="outline" size="sm">
      Copy Request ID
    </Button>
  </div>
</div>
```

**Alternative: Timeline View** (for agent-specific audit log)
```tsx
<div className="space-y-1">
  {logs.map((log) => (
    <div className="flex gap-3 items-start py-2 border-l-2 border-muted pl-4">
      <div className="text-xs text-muted-foreground whitespace-nowrap">
        {formatTime(log.timestamp)}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Badge variant={log.result === 'allowed' ? 'secondary' : 'destructive'}>
            {log.action}
          </Badge>
          <span className="text-sm">{log.resource}</span>
        </div>
        {log.denied && (
          <p className="text-xs text-muted-foreground mt-1">
            Denied: {log.reason}
          </p>
        )}
      </div>
    </div>
  ))}
</div>
```

---

### 5.4 **Real-Time Activity Feed**

#### **Sidebar Widget** (Dashboard overview)
```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center justify-between">
      Recent Activity
      <Badge variant="outline" className="animate-pulse">
        Live
      </Badge>
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    {activities.slice(0, 5).map((activity) => (
      <div key={activity.id} className="flex gap-3 items-start">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{activity.agent.initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm">
            <span className="font-medium">{activity.agent.name}</span>
            {' '}
            <span className="text-muted-foreground">{activity.action}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {formatRelativeTime(activity.timestamp)}
          </p>
        </div>
        <Badge
          variant={activity.result === 'success' ? 'secondary' : 'destructive'}
          className="shrink-0"
        >
          {activity.result === 'success' ? '✓' : '✗'}
        </Badge>
      </div>
    ))}

    <Button variant="ghost" size="sm" className="w-full">
      View All Activity →
    </Button>
  </CardContent>
</Card>
```

**Features**:
- WebSocket connection for real-time updates
- Smooth animations when new items appear
- Auto-scroll option (with pause on hover)
- Filter by severity (all/errors only)
- Click to expand for details

---

### 5.5 **API Key Management**

#### **Display Pattern** (Stripe-inspired)
```tsx
<Card>
  <CardHeader>
    <CardTitle>API Keys</CardTitle>
    <CardDescription>
      Manage your agent's authentication credentials
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <Tabs defaultValue="production">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="production">Production</TabsTrigger>
        <TabsTrigger value="test">Test</TabsTrigger>
      </TabsList>

      <TabsContent value="production" className="space-y-3">
        {/* Publishable Key */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex-1">
            <p className="text-sm font-medium">Publishable Key</p>
            <code className="text-xs text-muted-foreground">
              pk_live_51J...
            </code>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(key)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">⋮</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>View Request Logs</DropdownMenuItem>
                <DropdownMenuItem>Roll Key</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  Revoke Key
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Secret Key */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex-1">
            <p className="text-sm font-medium">Secret Key</p>
            <code className="text-xs text-muted-foreground">
              {revealed ? 'sk_live_51J...' : '••••••••••••••••'}
            </code>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRevealed(!revealed)}
            >
              {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(secretKey)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">⋮</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>View Request Logs</DropdownMenuItem>
                <DropdownMenuItem>Roll Key</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  Revoke Key
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </TabsContent>
    </Tabs>

    <Button variant="outline" className="w-full">
      <Plus className="h-4 w-4 mr-2" />
      Create Restricted Key
    </Button>
  </CardContent>
</Card>
```

#### **Key Creation Flow**
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Create New API Key</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create API Key</DialogTitle>
      <DialogDescription>
        Generate a new API key for your agent
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4">
      <div>
        <Label>Key Name</Label>
        <Input placeholder="e.g., Production Server" />
      </div>

      <div>
        <Label>Environment</Label>
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="production">Production</SelectItem>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Permissions</Label>
        <div className="space-y-2 mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="read" defaultChecked />
            <Label htmlFor="read">Read access</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="write" />
            <Label htmlFor="write">Write access</Label>
          </div>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button onClick={handleCreate}>Create Key</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Success Dialog (after creation) */}
<Dialog open={keyCreated}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>API Key Created</DialogTitle>
      <DialogDescription>
        Copy your key now - you won't be able to see it again!
      </DialogDescription>
    </DialogHeader>

    <Alert variant="warning">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Save this key securely</AlertTitle>
      <AlertDescription>
        For security reasons, we can only show this key once.
        Store it in a secure location like a password manager.
      </AlertDescription>
    </Alert>

    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
      <code className="flex-1 text-sm select-all">
        sk_live_51J3K4L5M6N7O8P9Q0R...
      </code>
      <Button
        variant="outline"
        size="sm"
        onClick={copyAndConfirm}
      >
        <Copy className="h-4 w-4 mr-2" />
        Copy
      </Button>
    </div>

    <DialogFooter>
      <Button onClick={() => setKeyCreated(false)}>
        I've Saved the Key
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### 5.6 **Permission Denied Indicators**

#### **Inline Error States**
```tsx
{/* In API response or log entry */}
<Alert variant="destructive">
  <ShieldX className="h-4 w-4" />
  <AlertTitle>Permission Denied</AlertTitle>
  <AlertDescription>
    Agent "GPT-4 Research" attempted to access{' '}
    <code>/api/admin/delete</code> but lacks the required permissions.
    <br />
    <strong>Matched rule:</strong> "Read-Only Access"
  </AlertDescription>
</Alert>
```

#### **Dashboard Alert Banner** (for critical denials)
```tsx
<Alert variant="destructive" className="mb-6">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>12 Permission Denials in Last Hour</AlertTitle>
  <AlertDescription className="flex items-center justify-between">
    <span>
      Multiple agents are attempting unauthorized actions.
      Review your permission rules.
    </span>
    <Button variant="outline" size="sm">
      View Denials →
    </Button>
  </AlertDescription>
</Alert>
```

#### **Log Table Row Indicator**
```tsx
{/* Highlighted row for denied requests */}
<TableRow className="bg-destructive/10 hover:bg-destructive/20">
  <TableCell>
    <Badge variant="destructive">Denied</Badge>
  </TableCell>
  <TableCell>{agent.name}</TableCell>
  <TableCell>{action}</TableCell>
  <TableCell className="flex items-center gap-2">
    {resource}
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent>
          <p>Denied by rule: "Production Write Lock"</p>
          <p className="text-xs text-muted-foreground">
            Consider granting write access if this agent needs it.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </TableCell>
</TableRow>
```

---

## 6. Implementation Recommendations

### 6.1 **Starter Template Selection**

**Recommended**: [satnaing/shadcn-admin](https://github.com/satnaing/shadcn-admin)

**Why**:
- Production-ready with 10+ pre-built pages
- Built-in dark mode toggle
- Global search command palette (essential for admin dashboards)
- RTL support for internationalization
- Fully accessible (WAI-ARIA compliant)
- Modified components optimized for admin interfaces
- Active maintenance and community support

**Installation**:
```bash
git clone https://github.com/satnaing/shadcn-admin.git agent-auth-dashboard
cd agent-auth-dashboard
pnpm install
pnpm dev
```

---

### 6.2 **Component Installation Priority**

#### **Phase 1: Core Layout** (Week 1)
```bash
# Layout components
pnpm dlx shadcn@latest add sidebar
pnpm dlx shadcn@latest add breadcrumb
pnpm dlx shadcn@latest add separator

# Navigation
pnpm dlx shadcn@latest add dropdown-menu
pnpm dlx shadcn@latest add navigation-menu
```

#### **Phase 2: Data Display** (Week 2)
```bash
# Tables and cards
pnpm dlx shadcn@latest add table
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add badge

# Metrics
pnpm dlx shadcn@latest add @reui/statistic-card-1

# Dialogs
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add alert-dialog
```

#### **Phase 3: Forms & Inputs** (Week 3)
```bash
# Form components
pnpm dlx shadcn@latest add form
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add select
pnpm dlx shadcn@latest add checkbox
pnpm dlx shadcn@latest add radio-group
pnpm dlx shadcn@latest add toggle

# Advanced inputs
pnpm dlx shadcn@latest add combobox
pnpm dlx shadcn@latest add date-picker
```

#### **Phase 4: Feedback & Notifications** (Week 4)
```bash
# User feedback
pnpm dlx shadcn@latest add toast
pnpm dlx shadcn@latest add alert
pnpm dlx shadcn@latest add sonner

# Loading states
pnpm dlx shadcn@latest add skeleton
pnpm dlx shadcn@latest add progress
```

---

### 6.3 **Custom Components to Build**

#### **AgentStatusIndicator.tsx**
```tsx
interface AgentStatusIndicatorProps {
  status: 'active' | 'inactive' | 'error';
  lastActive?: Date;
  showLabel?: boolean;
}

export function AgentStatusIndicator({
  status,
  lastActive,
  showLabel = true
}: AgentStatusIndicatorProps) {
  const config = {
    active: {
      color: 'bg-green-500',
      label: 'Active',
      pulse: true
    },
    inactive: {
      color: 'bg-gray-400',
      label: 'Offline',
      pulse: false
    },
    error: {
      color: 'bg-red-500',
      label: 'Error',
      pulse: true
    }
  };

  const { color, label, pulse } = config[status];

  return (
    <div className="flex items-center gap-2">
      <span className={cn(
        "w-2 h-2 rounded-full",
        color,
        pulse && "animate-pulse"
      )} />
      {showLabel && (
        <span className="text-sm text-muted-foreground">
          {label}
          {lastActive && status === 'active' && (
            <> · {formatDistanceToNow(lastActive)} ago</>
          )}
        </span>
      )}
    </div>
  );
}
```

#### **PermissionRuleBuilder.tsx**
```tsx
// Dynamic form component for building permission rules
// Features:
// - Add/remove condition rows
// - Resource/action dropdowns
// - AND/OR logic toggle
// - Validation with Zod
// - Preview of generated rule

export function PermissionRuleBuilder() {
  const [conditions, setConditions] = useState([
    { resource: '', action: 'allow' }
  ]);

  // Implementation details...
}
```

#### **AuditLogTable.tsx**
```tsx
// TanStack Table integration with:
// - Server-side pagination
// - Advanced filtering
// - Expandable row details
// - Export functionality
// - Real-time updates

export function AuditLogTable() {
  // Implementation with DataTable component
}
```

---

### 6.4 **Theme Configuration**

Create `/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;

    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;

    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## 7. Next Steps & Development Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Set up shadcn-admin starter template
- [ ] Configure theming and color scheme
- [ ] Implement sidebar navigation structure
- [ ] Create basic page layouts (Dashboard, Agents, Logs, Rules)
- [ ] Set up dark mode toggle

### Phase 2: Core Features (Week 3-4)
- [ ] Build agent list/card components
- [ ] Implement audit log table with filtering
- [ ] Create permission rule builder
- [ ] Develop API key management interface
- [ ] Add metrics/stats cards to dashboard

### Phase 3: Advanced Features (Week 5-6)
- [ ] Real-time activity feed with WebSocket
- [ ] Advanced filtering and search
- [ ] Export functionality (CSV/JSON)
- [ ] Bulk actions for agents
- [ ] Permission rule preview and testing

### Phase 4: Polish & Testing (Week 7-8)
- [ ] Responsive design refinement
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance optimization
- [ ] User testing and feedback
- [ ] Documentation and style guide

---

## 8. Additional Resources

### Design Tools
- **Figma Kit**: [shadcraft.com/components](https://shadcraft.com/components)
- **Theme Generator**: [shadcnstudio.com/theme-generator](https://shadcnstudio.com/theme-generator)
- **Component Previews**: [ui.shadcn.com/blocks](https://ui.shadcn.com/blocks)

### Code Examples
- **Official Examples**: [ui.shadcn.com/examples](https://ui.shadcn.com/examples)
- **Community Templates**: [shadcn.io/template/category/dashboard](https://www.shadcn.io/template/category/dashboard)
- **Table Examples**: [github.com/sadmann7/tablecn](https://github.com/sadmann7/tablecn)

### Documentation
- **shadcn/ui Docs**: [ui.shadcn.com/docs](https://ui.shadcn.com/docs)
- **TanStack Table**: [tanstack.com/table/latest](https://tanstack.com/table/latest)
- **Tailwind CSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Next.js App Router**: [nextjs.org/docs](https://nextjs.org/docs)

---

## Summary

This design brief provides a comprehensive foundation for building the Agent Auth dashboard with:

1. **5 Specific Dashboard Examples** analyzed (Auth0, Clerk, Stripe, Datadog/Sentry, Vercel)
2. **Complete Component Library** recommendations from shadcn/ui
3. **Detailed Layout Structures** for all major pages
4. **Production-Ready Color Scheme** with dark mode support
5. **Specific UI Patterns** for agents, rules, logs, API keys, and permission denials
6. **Implementation Roadmap** with phased approach

The recommended stack:
- **Framework**: Next.js 15+ with App Router
- **UI Library**: shadcn/ui (Tailwind + Radix)
- **Starter**: satnaing/shadcn-admin
- **Data Tables**: TanStack Table
- **Theming**: CSS variables with dark mode
- **Icons**: Lucide React

This approach delivers a modern, clean, developer-friendly admin interface optimized for technical users managing AI agent permissions and observability.
