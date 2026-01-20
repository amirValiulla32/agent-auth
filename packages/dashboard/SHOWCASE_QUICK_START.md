# Showcase Quick Start Guide

Get the premium showcase running in 60 seconds.

## Installation

```bash
# Navigate to dashboard
cd packages/dashboard

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

## Access the Showcase

Open your browser and navigate to:

```
http://localhost:3000/showcase
```

## What You'll See

### 1. Dashboard Home (`/showcase`)
- **4 Premium Stat Cards** with animated sparklines
- **Request Volume Chart** with gradient fills
- **Agent Status Overview** with distribution
- **Activity Timeline** with real-time events

### 2. Agent Gallery (`/showcase/agents`)
- **Grid/List Toggle** for different views
- **Search & Filter** by status
- **50+ Agent Cards** with full details
- **API Key Management** with show/hide
- **Action Menus** on each card

### 3. Audit Logs (`/showcase/logs`)
- **1,000+ Mock Logs** sorted by time
- **Expandable Details** with reasoning
- **Status Filtering** (approved/denied/pending)
- **Search Functionality** across all fields
- **Export Button** for data download

### 4. Analytics Dashboard (`/showcase/analytics`)
- **Time Range Selector** (7d/30d/90d/1y)
- **Area Charts** for volume and success rate
- **Bar Charts** for hourly distribution
- **Performance Metrics** (P95, P99)
- **Top Agents Leaderboard**

## Navigation

Use the sidebar to switch between pages:
- Click **Dashboard** icon for home
- Click **Bot** icon for agents
- Click **ScrollText** icon for logs
- Click **BarChart** icon for analytics

## Interactive Features

### Dashboard
- Hover over stat cards to see subtle animations
- Watch the activity timeline for recent events
- Observe the request volume chart gradient

### Agents
- Toggle between grid and list views
- Search for agents by name or ID
- Filter by status (all/active/idle/error/paused)
- Click eye icon to show/hide API keys
- Click copy icon to copy API keys
- Click menu icon for agent actions

### Logs
- Click chevron to expand log details
- Filter by status using top buttons
- Search across all log fields
- View reasoning and metadata

### Analytics
- Switch time ranges to see data adapt
- Hover over charts for interactivity
- View top performing agents
- Check performance percentiles

## Mock Data

All data is generated client-side. To modify:

1. Open `src/lib/showcase/mock-data.ts`
2. Adjust generation parameters:

```typescript
// Change agent count
const showcaseAgents = generateMockAgents(50); // Change 50 to any number

// Change log count
const showcaseAuditLogs = generateMockAuditLogs(showcaseAgents, 1000); // Change 1000

// Change activity count
const showcaseActivityEvents = generateActivityEvents(showcaseAgents, 100); // Change 100
```

3. Refresh browser to see changes

## Customization

### Change Colors

Edit components to use different color schemes:

```typescript
// In any component
iconColor="emerald"  // Change to: blue, purple, orange

// Color options
emerald: from-emerald-400 to-cyan-400
blue: from-blue-400 to-cyan-400
purple: from-purple-400 to-pink-400
orange: from-orange-400 to-red-400
```

### Modify Stats

Edit dashboard page stats:

```typescript
// In app/(showcase)/showcase/page.tsx
<PremiumStatCard
  title="Your Title"
  value="123"
  change={12.4}  // Percentage change
  trend="up"     // or "down"
  icon={YourIcon}
/>
```

### Add New Pages

1. Create file: `app/(showcase)/showcase/[name]/page.tsx`
2. Add to sidebar: `components-showcase/layout/showcase-sidebar.tsx`

```typescript
const navigation = [
  // ... existing
  { name: 'Your Page', href: '/showcase/your-page', icon: YourIcon },
];
```

## Design Patterns

### Premium Card
```tsx
<div className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#1f1f1f] to-[#141414] p-6 transition-all duration-300 hover:border-white/[0.12] hover:shadow-xl hover:shadow-white/5">
  {/* Your content */}
</div>
```

### Status Badge
```tsx
<div className="flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5">
  <div className="h-2 w-2 rounded-full bg-emerald-400" />
  <span className="text-sm font-medium text-emerald-400">Active</span>
</div>
```

### Gradient Icon
```tsx
<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400">
  <Icon className="h-6 w-6 text-[#141414]" />
</div>
```

## Troubleshooting

### Page Not Loading
- Ensure dev server is running (`npm run dev`)
- Check console for errors
- Verify route: `http://localhost:3000/showcase`

### Missing Data
- Mock data generates automatically
- Refresh page if data seems incomplete
- Check `lib/showcase/mock-data.ts` for generation

### Styling Issues
- Clear browser cache
- Check Tailwind CSS is working
- Verify `globals.css` is imported

### TypeScript Errors
- Run `npm run typecheck`
- Ensure all dependencies installed
- Check import paths

## Performance

The showcase is optimized for:
- **Fast Load Times** - No API calls, all client-side
- **Smooth Animations** - Hardware-accelerated CSS
- **Responsive Design** - Works on all screen sizes
- **Efficient Rendering** - Proper React keys and memoization

## Tips

1. **Explore Interactions** - Hover over everything
2. **Try Filtering** - Use search and status filters
3. **Toggle Views** - Switch between grid/list in agents
4. **Expand Logs** - Click chevron to see details
5. **Change Time Ranges** - See how charts adapt

## Next Steps

- Customize colors and branding
- Add more mock data scenarios
- Create additional pages
- Integrate with real backend (if needed)
- Deploy to production

## Resources

- **Main README**: `SHOWCASE_README.md` - Complete documentation
- **Mock Data**: `lib/showcase/mock-data.ts` - Data generation
- **Components**: `components-showcase/` - Reusable components
- **Pages**: `app/(showcase)/showcase/` - Page implementations

## Support

For issues or questions:
1. Check the main README
2. Review component source code
3. Inspect browser console for errors
4. Verify all dependencies are installed

---

**Enjoy the premium showcase!** 🎨✨
