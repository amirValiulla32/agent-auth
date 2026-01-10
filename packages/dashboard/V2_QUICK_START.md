# V2 Dashboard Quick Start

## 🚀 Getting Started (2 minutes)

### 1. Start the Development Server
```bash
cd packages/dashboard
npm run dev
```

### 2. Access the V2 Dashboard
Open your browser to one of these URLs:

- **Dashboard Home**: http://localhost:3000/v2
- **Agents Page**: http://localhost:3000/v2/agents
- **Audit Logs**: http://localhost:3000/v2/logs

### 3. Compare with Original
The original dashboard is still accessible:

- **Original Dashboard**: http://localhost:3000
- **Original Agents**: http://localhost:3000/agents
- **Original Logs**: http://localhost:3000/logs

## ✨ What to Test

### Dashboard Home (`/v2`)
1. Check stats cards display correctly
2. View recent activity feed
3. Click quick action buttons
4. Try "Seed Test Data" button
5. Verify hover effects work

### Agents Page (`/v2/agents`)
1. Click "Create Agent" button
2. Fill out form and create an agent
3. Hover over agent card (see glow effect)
4. Click copy icon to copy API key
5. Click "Rules" button to manage rules
6. Click "Edit" to modify agent
7. Open dropdown (•••) for more actions
8. Try deleting an agent

### Audit Logs (`/v2/logs`)
1. View logs in the table
2. Use search box to filter logs
3. Try date range picker
4. Filter by status (Allowed/Denied)
5. Filter by agent, tool, scope
6. Clear all filters
7. Change rows per page
8. Navigate between pages
9. Export to CSV
10. Export to JSON

## 🎨 Visual Features to Notice

### Premium Dark Theme
- Deep navy background (#05071a)
- Dark cards (#1a1a1a)
- Subtle white borders (10% opacity)

### Interactive Elements
- **Hover Effects**: Cards glow on hover
- **Transitions**: Smooth 200ms animations
- **Color Coding**: Blue for actions, green for success, red for errors
- **Live Indicators**: Pulsing dot on activity feed

### Typography
- Large, bold headings (text-3xl)
- Clean, readable body text
- Monospace fonts for technical data
- Generous line heights

### Spacing
- Generous padding (p-6, p-8)
- Consistent gaps (gap-6, gap-8)
- Breathing room between sections

## 🔄 Side-by-Side Comparison

Open two browser windows:
1. Original: http://localhost:3000
2. V2: http://localhost:3000/v2

Compare the visual differences while ensuring all features work the same.

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Then restart
npm run dev
```

### Build Errors
```bash
# Clean build and reinstall
rm -rf .next
npm run build
```

### Missing Data
```bash
# Seed test data using the button in the UI
# Or use the seed script
npm run seed
```

## 📝 Feature Checklist

Use this to verify everything works:

### Dashboard
- [ ] Stats cards display correct numbers
- [ ] Activity feed shows recent logs
- [ ] Quick actions navigate correctly
- [ ] Hover effects work on all cards
- [ ] Seed test data works

### Agents
- [ ] Agent grid displays properly
- [ ] Create agent works
- [ ] Edit agent works
- [ ] Delete agent works (with confirmation)
- [ ] Regenerate API key works
- [ ] Manage rules opens dialog
- [ ] Copy API key works
- [ ] Status badges show correctly
- [ ] Empty state displays when no agents
- [ ] Loading state shows during fetch

### Logs
- [ ] Logs table displays data
- [ ] Search filters logs
- [ ] Date range picker works
- [ ] Status filter works
- [ ] Agent filter works
- [ ] Tool filter works
- [ ] Scope filter works
- [ ] Clear filters resets all
- [ ] Pagination works
- [ ] Rows per page changes table
- [ ] CSV export downloads file
- [ ] JSON export downloads file
- [ ] Empty state displays when no logs
- [ ] Loading state shows during fetch

## 🎯 Key Differences to Notice

### Visual Changes
1. **Darker Background**: Much deeper navy color
2. **Premium Cards**: Hover glow effects
3. **Better Spacing**: More generous padding
4. **Larger Text**: Better hierarchy
5. **Color Coding**: More vibrant accents

### Same Functionality
1. **All CRUD Operations**: Same as original
2. **All Filters**: Same filtering logic
3. **All Dialogs**: Same forms and confirmations
4. **All Data**: Same API endpoints

## 📊 Performance

The v2 dashboard is just as fast as the original:
- Same API calls
- Same data fetching
- Same loading states
- Slightly optimized bundle size

## 🔐 Security

No changes to security:
- Same authentication flow
- Same API client
- Same data validation
- Same error handling

## 🎉 Ready to Deploy?

When you're satisfied with testing:

### Option 1: Keep Both Versions
- Original at `/`
- V2 at `/v2`
- Users can access either

### Option 2: Redirect to V2
```tsx
// In src/app/page.tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/v2')
}
```

### Option 3: Replace Original
See `V2_DASHBOARD_README.md` for migration steps.

## 📚 More Documentation

- **V2_DASHBOARD_README.md** - Complete feature documentation
- **V2_IMPLEMENTATION_SUMMARY.md** - Technical implementation details
- **V2_VISUAL_GUIDE.md** - Design system and styling guide

## 💬 Feedback

Test all features and note:
- What you love ❤️
- What could be improved 🔧
- Any bugs found 🐛
- Performance issues ⚡

---

**Happy Testing!** 🎉

The v2 dashboard is fully functional and ready for your review.
