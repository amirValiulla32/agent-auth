# Showcase Visual Guide

A visual walkthrough of the premium showcase design system and components.

## Design System Overview

### Color System: Graphite Luxury

```
Background Hierarchy:
┌─────────────────────────────────────┐
│ Deep (#141414)                      │ ← Primary background
│ ┌─────────────────────────────────┐ │
│ │ Cards (#1f1f1f)                 │ │ ← Card surfaces
│ │ ┌─────────────────────────────┐ │ │
│ │ │ Elevated (#2C2C2E)          │ │ │ ← Raised elements
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

Text Hierarchy:
- White (#FAFAFA) ────────────────────── Primary text
- White/80 (rgba(250,250,250,0.8)) ──── Secondary text
- White/60 (rgba(250,250,250,0.6)) ──── Tertiary text
- White/40 (rgba(250,250,250,0.4)) ──── Disabled/subtle

Accent Colors:
🟢 Emerald (#34D399) ─── Success, Active, Positive
🔵 Blue (#60A5FA) ────── Info, Secondary actions
🟣 Purple (#C084FC) ──── Special, Accent
🟠 Orange (#FB923C) ──── Warning, Pending
🔴 Red (#F87171) ─────── Error, Denied, Danger
```

### Typography Scale

```
Display:  48px / 3rem  / font-bold  ─── Hero headings
H1:       36px / 2.25rem / font-bold ─── Page titles
H2:       24px / 1.5rem / font-semibold ─ Section headers
H3:       20px / 1.25rem / font-semibold ─ Subsections
Body:     16px / 1rem / font-normal ───── Body text
Small:    14px / 0.875rem / font-medium ── UI elements
Tiny:     12px / 0.75rem / font-medium ─── Labels, badges
Code:     14px / font-mono ──────────────── Monospace data
```

### Spacing System

```
Base unit: 4px (0.25rem)

Component Spacing:
├─ Cards: 24px (6 units) padding
├─ Grid gaps: 24px (6 units)
├─ Section spacing: 32px (8 units)
├─ Element spacing: 16px (4 units)
└─ Tight spacing: 8px (2 units)

Consistent Rhythm:
[8px] [16px] [24px] [32px] [48px] [64px]
  2u     4u      6u      8u     12u    16u
```

## Component Anatomy

### Premium Stat Card

```
┌─────────────────────────────────────────┐
│ ┌─────────────────────┐  ┌──────────┐  │
│ │ Title (white/60)    │  │ [Icon]   │  │
│ │                     │  │  12x12   │  │
│ │ 123                 │  │ gradient │  │
│ │ Value (white/bold)  │  └──────────┘  │
│ │                     │                 │
│ │ ↑ +12.4%            │                 │
│ │   Change (emerald)  │                 │
│ └─────────────────────┘                 │
│                                         │
│ ──────────────────────────────────────  │
│   Sparkline (subtle, 32px height)       │
└─────────────────────────────────────────┘

Hover State:
- Border: white/[0.08] → white/[0.12]
- Shadow: none → xl shadow-white/5
- Icon: scale(1) → scale(1.1)
- Duration: 300ms ease-out
```

### Premium Agent Card

```
┌─────────────────────────────────────────────┐
│ ┌────┐  AgentName            [⋮ Menu]      │
│ │Icon│  agent_0001                          │
│ └────┘                                      │
│                                             │
│ ┌──────────┐ ┌────────┐ ┌────────┐         │
│ │ Active   │ │ Tag 1  │ │ Tag 2  │         │
│ └──────────┘ └────────┘ └────────┘         │
│                                             │
│ Requests        Success Rate                │
│ 1,234          98.5%                        │
│                                             │
│ API Key         [👁] [📋]                   │
│ sk_live_••••••••••••                        │
│                                             │
│ Permissions                                 │
│ ┌────────┐ ┌────────┐ ┌────────┐          │
│ │✓ read  │ │✓ write │ │✓ delete│          │
│ └────────┘ └────────┘ └────────┘          │
│                                             │
│ ────────────────────────────────────────────│
│ ⚡ Last active 2 minutes ago  View Details →│
└─────────────────────────────────────────────┘

Interactive Elements:
- Show/Hide API key (eye icon)
- Copy API key (copy icon)
- Action menu (three dots)
- View details link
```

### Activity Timeline

```
Timeline Entry:
┌─────────────────────────────────────────┐
│ [Icon]  AgentName → action              │
│  10x10                                  │
│         Description text      2m ago    │
│    │                                    │
│    │← Vertical line to next entry      │
└─────────────────────────────────────────┘

Icon States:
🟢 CheckCircle (emerald) ─── Approved
🔴 XCircle (red) ────────── Denied
🟡 Clock (orange) ───────── Pending
🤖 Bot (emerald) ────────── Agent created
🛡️ Shield (blue) ────────── Permission granted
```

### Chart Components

```
Area Chart:
                    ╱╲  ╱╲
Grid ─────────────╱──╲╱──╲──────
Lines             ╱    ╲    ╲
(white/5)     ╱╲ ╱      ╲    ╲
          ───╱──╲────────╲────╲─
            ╱            ╲    ╲
        ╱╲ ╱              ╲    ╲
    ───╱──╲────────────────╲────╲
      ╱
  ───╱───────────────────────────
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    Gradient fill (color/30 → 0)

Elements:
- Line: 2px stroke, rounded caps
- Fill: Linear gradient (top → bottom)
- Grid: Horizontal lines, white/5
- Points: Optional, 3px radius
```

## Layout Patterns

### Sidebar Navigation

```
┌──────────────────┐
│ [Logo] AgentAuth │ ← Brand header (64px)
│ Premium Platform │
├──────────────────┤
│                  │
│ ▶ Dashboard      │ ← Active (white bg/8)
│   Agents         │ ← Inactive (white/60)
│   Audit Logs     │
│   Analytics      │
│                  │
│ ┌──────────────┐ │
│ │ ⚡ Status    │ │ ← System badge
│ │ 99.8%        │ │
│ └──────────────┘ │
│                  │
├──────────────────┤
│   Settings       │ ← Secondary nav
├──────────────────┤
│ [AV] Admin       │ ← User profile
│ admin@email.com  │
└──────────────────┘

Width: 256px (64 units)
Background: #141414
Border: white/[0.08] right
```

### Header Bar

```
┌────────────────────────────────────────────────────────┐
│ [🔍 Search...]           [🔔3] [AV Admin]            │
│                                                        │
└────────────────────────────────────────────────────────┘

Height: 64px
Background: #141414/80 + backdrop-blur
Border: white/[0.08] bottom
Position: Sticky top
```

### Page Layout

```
┌────────────────────────────────────────────────────────┐
│ Header                                      [Action]   │ 32px spacing
│ Subtitle text                                          │
├────────────────────────────────────────────────────────┤ 24px spacing
│ [Filters] [Search] [Toggle]                            │
├────────────────────────────────────────────────────────┤ 24px spacing
│ ┌────────────┐ ┌────────────┐ ┌────────────┐          │
│ │   Card 1   │ │   Card 2   │ │   Card 3   │          │ Grid: gap-6
│ └────────────┘ └────────────┘ └────────────┘          │
│                                                        │
│ ┌──────────────────────────────────────────┐          │
│ │              Large Chart                 │          │ 24px spacing
│ └──────────────────────────────────────────┘          │
└────────────────────────────────────────────────────────┘

Padding: 32px (8 units) all sides
Max-width: Full (responsive)
```

## Animation Patterns

### Hover Transitions

```css
/* Card Hover */
transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
border: white/[0.08] → white/[0.12]
shadow: none → shadow-xl shadow-white/5
background: static → subtle gradient shift

/* Button Hover */
transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
background: base → lighter
border: base → prominent
transform: none → scale(1.02)

/* Icon Hover */
transition: transform 200ms ease-out;
transform: scale(1) → scale(1.1)
```

### Click Feedback

```css
/* Active State */
transition: transform 100ms ease-out;
transform: scale(0.95);

/* Ripple Effect (conceptual) */
opacity: 0 → 1 → 0 (over 600ms)
transform: scale(0) → scale(2)
```

### Loading States

```css
/* Pulse Animation */
@keyframes pulse {
  0%, 100%: opacity: 1;
  50%: opacity: 0.5;
}

/* Skeleton Loader */
background: linear-gradient(
  90deg,
  white/[0.04] 0%,
  white/[0.08] 50%,
  white/[0.04] 100%
);
animation: shimmer 2s infinite;
```

## Responsive Breakpoints

```
Tailwind Breakpoints:
sm:  640px  ─── Mobile landscape
md:  768px  ─── Tablet
lg:  1024px ─── Desktop
xl:  1280px ─── Large desktop
2xl: 1536px ─── Extra large

Usage Pattern:
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  Mobile:   1 column
  Tablet:   2 columns
  Desktop:  3 columns
  Large:    4 columns
</div>
```

## State Indicators

### Status Badges

```
Active:    🟢 emerald-400/10 bg, emerald-400/20 border
Idle:      🔵 blue-400/10 bg, blue-400/20 border
Error:     🔴 red-400/10 bg, red-400/20 border
Paused:    🟡 orange-400/10 bg, orange-400/20 border
Pending:   🟠 orange-400/10 bg, orange-400/20 border

Pattern:
[●] Label
 │    └── Text color matches dot
 └── Pulsing dot (2x2px, rounded-full)
```

### Loading Indicators

```
Spinner:
  ◌  ← Rotating circle
  Animation: rotate 360deg, 1s linear infinite

Skeleton:
  ▓▓▓▓▓▓▓▓░░░░░░  ← Moving gradient
  Animation: shimmer 2s ease-in-out infinite

Progress Bar:
  ████████▒▒▒▒▒▒  ← Filled percentage
  Gradient: emerald-400 → cyan-400
```

## Interaction Patterns

### Click Targets

```
Minimum Size:
- Buttons: 40px × 40px (10 units)
- Icons: 32px × 32px (8 units)
- Links: 24px height (6 units)

Spacing:
- Between buttons: 16px (4 units)
- Between icons: 12px (3 units)
- Between links: 8px (2 units)
```

### Focus States

```css
/* Keyboard Focus */
outline: 2px solid emerald-400;
outline-offset: 2px;
border-radius: inherit;

/* Focus Ring */
ring: 2px emerald-400/20;
ring-offset: 2px;
```

## Accessibility

### Color Contrast

```
WCAG AA Compliance:
✓ White on #141414:     16.1:1 (AAA)
✓ White/60 on #141414:  9.7:1 (AAA)
✓ Emerald-400 on #141414: 7.2:1 (AA)
✓ Blue-400 on #141414:   6.8:1 (AA)

Status Colors:
✓ All status colors meet AA standard
✓ Icons + text for redundancy
```

### Screen Reader

```html
<!-- Semantic HTML -->
<header>...</header>
<nav aria-label="Main navigation">...</nav>
<main>...</main>

<!-- ARIA Labels -->
<button aria-label="Toggle menu">
<input aria-describedby="error-message">

<!-- Focus Management -->
<dialog role="dialog" aria-modal="true">
```

## Print-Ready Components

All components are designed to be:
- Screenshot-friendly (high contrast)
- Portfolio-ready (stunning visuals)
- Production-quality (pixel-perfect)
- Demo-worthy (smooth interactions)

---

**Use this guide as reference for maintaining design consistency across the showcase.**
