# V2 Dashboard Visual Guide

## 🎨 Design Comparison

### Sidebar

**Original:**
- Standard card background
- Simple navigation items
- Basic styling

**V2:**
- Deep navy background (#0a0a0a)
- Logo section with branded icon
- Active state with blue highlight and glow
- User profile at bottom with gradient avatar
- "Platform" label for branding

### Header

**Original:**
- Card background
- Basic title and description
- Simple bell icon

**V2:**
- Sticky with backdrop blur
- Larger, bolder title (text-3xl)
- Search icon button
- Bell with live indicator dot
- More generous padding (px-8 py-6)

### Stats Cards

**Original:**
- Basic card with icon
- Simple value display
- Minimal styling

**V2:**
- Dark card with subtle border
- Hover effect with glow
- Gradient background on hover
- Icon in colored container
- Larger value display (text-4xl)
- Optional trend indicators

### Activity Feed

**Original:**
- Standard card
- Simple badge for "Live"
- Basic avatar fallback

**V2:**
- Dark card with border
- Animated live indicator (pulsing dot)
- Gradient avatars
- Larger activity items with better spacing
- Color-coded status (Allowed/Denied)
- Hover effect on items

### Agent Cards

**Original:**
- Standard card
- Basic avatar
- Simple status badge
- Two action buttons + dropdown

**V2:**
- Dark card with hover glow
- Gradient avatar (blue to green)
- Rounded status badge
- API key with copy button
- Premium action buttons
- Better visual hierarchy
- Hover effects throughout

### Audit Logs Table

**Original:**
- Standard shadcn Table component
- Default border styling
- Simple badge variants

**V2:**
- Custom premium table design
- Dark header with uppercase labels
- Grid layout (not table element)
- Generous cell padding
- Hover effect on rows
- Color-coded status badges with icons
- Monospace fonts for technical data
- Better visual separation

## 🎯 Color Usage Guide

### Background Layers
```
Level 1 (Page):     #05071a (deepest)
Level 2 (Card):     #1a1a1a (elevated)
Level 3 (Hover):    white/5 (interactive)
```

### Accent Colors
```
Primary:    #3a6ef2 (blue) - Actions, active states
Success:    #47cc88 (green) - Allowed, positive
Error:      #ef4444 (red) - Denied, destructive
Warning:    #f59e0b (amber) - Flagged items
```

### Text Hierarchy
```
Primary:    #ffffff (white) - Main content
Secondary:  #ffffff80 (50%) - Supporting text
Tertiary:   #ffffff40 (25%) - Subtle text
```

### Borders
```
Default:    #ffffff1a (10%) - Card borders
Hover:      #3a6ef2/50 (50%) - Interactive borders
```

## 📐 Spacing System

### Padding Scale
```
Compact:    p-3, p-4  - Small elements
Standard:   p-6       - Cards, sections
Generous:   p-8       - Page containers
Extra:      p-10      - Special cases
```

### Gap Scale
```
Tight:      gap-3, gap-4  - Form fields
Standard:   gap-6         - Card grids
Generous:   gap-8         - Page sections
```

## 🔤 Typography Scale

### Headers
```
Page Title:     text-3xl font-bold tracking-tight
Card Title:     text-lg font-semibold tracking-tight
Section Title:  text-sm font-medium uppercase tracking-wider
```

### Body
```
Standard:       text-sm
Supporting:     text-xs
Technical:      text-xs font-mono
```

## 🎭 Interactive States

### Buttons
```
Default:    bg-[#3a6ef2] text-white
Hover:      bg-[#3a6ef2]/90
Outline:    border-white/10 bg-white/5
            hover:bg-white/10
```

### Cards
```
Default:    border-white/10 bg-[#1a1a1a]
Hover:      border-[#3a6ef2]/50
            shadow-lg shadow-[#3a6ef2]/10
```

### Links
```
Default:    text-white/60
Hover:      text-white
Active:     bg-[#3a6ef2] text-white
```

## 🌈 Visual Elements

### Avatars
```
Gradient:   from-[#3a6ef2] to-[#47cc88]
Size:       h-10 w-10 (standard)
            h-12 w-12 (large)
Border:     border-white/10
```

### Badges
```
Allowed:    bg-[#47cc88]/10 text-[#47cc88]
Denied:     bg-red-500/10 text-red-400
Warning:    bg-amber-500/10 text-amber-500
Info:       bg-[#3a6ef2]/10 text-[#3a6ef2]
```

### Icons
```
Size:       h-4 w-4 (standard)
            h-5 w-5 (larger)
Color:      text-white/60 (default)
            text-[#3a6ef2] (accent)
```

## ⚡ Animation & Transitions

### Standard Transition
```
transition-all duration-200
```

### Hover Effects
```
Cards:      Glow shadow, border color change
Buttons:    Background opacity change
Links:      Text color fade
```

### Live Indicators
```
Dot:        animate-pulse
Glow:       shadow with color
```

## 📱 Responsive Breakpoints

### Grid Layouts
```
Mobile:     1 column
Tablet:     2 columns (md:grid-cols-2)
Desktop:    3 columns (lg:grid-cols-3)
Stats:      4 columns (lg:grid-cols-4)
```

### Sidebar
```
Mobile:     Hidden (implement drawer)
Desktop:    Fixed 256px width
```

## 🎪 Special Effects

### Gradient Backgrounds
```
Avatar:     from-[#3a6ef2] to-[#47cc88]
Hover:      from-[#3a6ef2]/5 to-transparent
```

### Glow Effects
```
Active:     shadow-lg shadow-[#3a6ef2]/20
Hover:      shadow-lg shadow-[#3a6ef2]/10
```

### Backdrop Blur
```
Header:     backdrop-blur-sm
Modals:     backdrop-blur-md
```

## 🔍 Component Patterns

### Empty State
```
- Icon in circle with subtle background
- Large title (text-xl)
- Description (text-sm)
- Action button (optional)
- Centered layout
```

### Loading State
```
- Skeleton with bg-white/5
- Rounded to match component
- Pulse animation
```

### Status Indicators
```
Success:    CheckCircle2 icon + green badge
Error:      XCircle icon + red badge
Warning:    AlertTriangle icon + amber badge
Info:       MessageCircle icon + blue badge
```

## 🎯 Design Principles

1. **Dark First** - All components designed for dark theme
2. **Generous Spacing** - Breathing room for clarity
3. **Subtle Depth** - Color layers, not shadows
4. **High Contrast** - Accessibility-first text
5. **Purposeful Color** - Meaning behind every hue
6. **Smooth Motion** - Transitions on all interactions
7. **Visual Hierarchy** - Clear importance levels
8. **Modern Aesthetics** - SaaS-grade polish

## 💡 Usage Examples

### Creating a New Card
```tsx
<div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-6 transition-all duration-200 hover:border-[#3a6ef2]/50 hover:shadow-lg hover:shadow-[#3a6ef2]/10">
  {/* Card content */}
</div>
```

### Creating a Status Badge
```tsx
<div className="flex items-center gap-1.5 rounded-lg bg-[#47cc88]/10 px-2.5 py-1">
  <CheckCircle2 className="h-3.5 w-3.5 text-[#47cc88]" />
  <span className="text-xs font-medium text-[#47cc88]">Allowed</span>
</div>
```

### Creating a Button
```tsx
<Button className="rounded-xl bg-[#3a6ef2] text-white hover:bg-[#3a6ef2]/90 shadow-lg shadow-[#3a6ef2]/20">
  {/* Button text */}
</Button>
```

## 🎨 Quick Reference

### Most Used Classes
```
Backgrounds:    bg-[#05071a], bg-[#1a1a1a], bg-white/5
Borders:        border-white/10, border-[#3a6ef2]/50
Text:           text-white, text-white/50, text-white/40
Rounded:        rounded-xl, rounded-lg, rounded-full
Padding:        p-6, p-8, px-6 py-4
Gaps:           gap-6, gap-8, gap-4
Hover:          hover:bg-white/10, hover:border-[#3a6ef2]/50
```

### Color Variables (for reference)
```
Deep Navy:      #05071a, #0a0a0a
Dark Gray:      #1a1a1a
Blue:           #3a6ef2
Green:          #47cc88
Red:            #ef4444, #f87171
Amber:          #f59e0b
```

---

**Note**: All designs prioritize accessibility with proper contrast ratios and clear visual hierarchies.
