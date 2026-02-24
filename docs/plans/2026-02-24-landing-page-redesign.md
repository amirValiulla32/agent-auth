# Landing Page Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the OakAuth landing page from a generic template feel to a multi-million-dollar startup landing page that sells outcomes, shows the product, and earns technical credibility.

**Architecture:** Single-file rewrite of `packages/dashboard/src/app/page.tsx`. Remove ParticleField dependency. Replace 8 current sections with 5 focused sections: Hero (with CSS dashboard mockup), Three Pillars, Code Example, How It Works, Bottom CTA. All existing Tailwind classes and dark theme preserved.

**Tech Stack:** Next.js 14 (static export), Tailwind CSS, lucide-react icons, existing OakAuthIcon component.

---

### Task 1: Rewrite Navigation

**Files:**
- Modify: `packages/dashboard/src/app/page.tsx:67-104`

**Step 1: Replace the nav section**

Replace current nav (Logo | Features/How it Works/Docs | [Dashboard]) with:

```tsx
{/* Navigation */}
<nav className="fixed top-0 left-0 right-0 z-50 bg-[#090c0a]/80 backdrop-blur-xl border-b border-white/[0.06]">
  <div className="mx-auto max-w-[1100px] px-6 h-16 flex items-center justify-between">
    <Link href="/" className="flex items-center gap-2.5">
      <div className="p-2 rounded-lg border border-[#166534]/30 bg-[#166534]/10">
        <OakAuthIcon className="w-4 h-4 text-[#22c55e]" />
      </div>
      <span className="text-[15px] font-semibold tracking-tight">OakAuth</span>
    </Link>

    <div className="hidden md:flex items-center gap-1">
      <Link href="/docs" className="px-4 py-2 text-[13px] text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/[0.05]">
        Docs
      </Link>
      <Link href="/pricing" className="px-4 py-2 text-[13px] text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/[0.05]">
        Pricing
      </Link>
      <Link href="/changelog" className="px-4 py-2 text-[13px] text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/[0.05]">
        Changelog
      </Link>
    </div>

    <div className="flex items-center gap-3">
      <Link href="/login" className="text-[13px] text-white/60 hover:text-white transition-colors">
        Sign in
      </Link>
      <Link
        href="/login"
        className="h-9 px-4 text-[13px] font-medium rounded-lg bg-[#166534] text-white hover:bg-[#15803d] transition-colors flex items-center"
      >
        Get started
      </Link>
    </div>
  </div>
</nav>
```

**Step 2: Verify build**

Run: `cd packages/dashboard && npx tsc --noEmit`
Expected: Clean compilation

**Step 3: Commit**

```bash
git add packages/dashboard/src/app/page.tsx
git commit -m "landing: update nav with sign in + get started CTAs"
```

---

### Task 2: Rewrite Hero Section

**Files:**
- Modify: `packages/dashboard/src/app/page.tsx:106-143`

**Step 1: Remove ParticleField import and usage**

Remove from imports:
```tsx
// REMOVE: import { ParticleField } from '@/components/ui/particle-field'
```

Remove from JSX:
```tsx
// REMOVE the entire ParticleField div:
// <div className="fixed inset-0 z-0"><ParticleField /></div>
```

**Step 2: Replace Hero section**

Replace current hero (title "OakAuth", subtitle "Permission control for AI agents", "Get early access" CTA) with:

```tsx
{/* Hero */}
<section className="relative pt-32 pb-16 px-6 z-10">
  <div className="text-center max-w-[700px] mx-auto mb-16">
    <h1 className="fade-up text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.03em] leading-[1.1] mb-6">
      Deploy AI agents your security team will approve.
    </h1>

    <p className="fade-up text-[16px] md:text-[18px] text-white/50 max-w-[520px] mx-auto mb-10 leading-[1.6]" style={{ animationDelay: '50ms' }}>
      One API call to control what your agents can do, see everything they try, and prove compliance.
    </p>

    <div className="fade-up flex flex-wrap gap-3 justify-center" style={{ animationDelay: '100ms' }}>
      <Link
        href="/login"
        className="group h-11 px-6 text-[14px] font-medium rounded-lg bg-[#166534] text-white hover:bg-[#15803d] transition-all flex items-center gap-2 shadow-lg shadow-[#166534]/20"
      >
        Get started free
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
      <Link
        href="/docs"
        className="h-11 px-6 text-[14px] font-medium rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] transition-all flex items-center"
      >
        See the docs
      </Link>
    </div>
  </div>

  {/* Dashboard Preview */}
  <div className="fade-up mx-auto max-w-[900px]" style={{ animationDelay: '150ms' }}>
    <div className="rounded-xl border border-white/[0.08] bg-[#0c0f0d] shadow-2xl shadow-black/50 overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-[#090c0a]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-3 py-1 rounded bg-white/[0.04] text-[11px] text-white/30 font-mono">
            oakauth.com/dashboard
          </div>
        </div>
      </div>

      {/* Mock dashboard content */}
      <div className="p-6">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[15px] font-medium text-white/90">Agents</div>
            <div className="text-[12px] text-white/40 mt-0.5">3 agents registered</div>
          </div>
          <div className="h-8 px-3 rounded-lg bg-[#166534] text-[12px] text-white font-medium flex items-center">+ New Agent</div>
        </div>

        {/* Agent rows */}
        <div className="space-y-2">
          {[
            { name: 'support-agent', status: 'active', tools: 4, requests: '1.2k' },
            { name: 'dev-assistant', status: 'active', tools: 7, requests: '842' },
            { name: 'data-pipeline', status: 'paused', tools: 2, requests: '3.1k' },
          ].map((agent, i) => (
            <div key={i} className="flex items-center justify-between p-3.5 rounded-lg bg-[#090c0a] border border-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-[#22c55e]' : 'bg-white/20'}`} />
                <span className="text-[13px] text-white/80 font-mono">{agent.name}</span>
              </div>
              <div className="flex items-center gap-6 text-[12px] text-white/40">
                <span>{agent.tools} tools</span>
                <span>{agent.requests} requests</span>
                <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full bg-[#166534]" style={{ width: `${30 + i * 25}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</section>
```

**Step 3: Verify build**

Run: `cd packages/dashboard && npx tsc --noEmit`
Expected: Clean compilation

**Step 4: Commit**

```bash
git add packages/dashboard/src/app/page.tsx
git commit -m "landing: rewrite hero with outcome headline and dashboard preview"
```

---

### Task 3: Replace Feature Cards with Three Pillars

**Files:**
- Modify: `packages/dashboard/src/app/page.tsx` — replace the Features section

**Step 1: Replace the features section**

Replace the current 4-card grid features section with:

```tsx
{/* Three Pillars */}
<section className="relative py-20 px-6 z-10">
  <div className="mx-auto max-w-[1100px]">
    <div className="grid md:grid-cols-3 gap-4">
      {[
        {
          title: 'Control',
          description: 'Define exactly what each agent can access. Rules enforced in milliseconds.',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#22c55e]">
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          ),
        },
        {
          title: 'Visibility',
          description: 'Every action logged with full context. Know what happened and why.',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#22c55e]">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
        },
        {
          title: 'Compliance',
          description: 'Complete audit trail. Ready for security review from day one.',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#22c55e]">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M14 2v6h6M16 13H8M16 17H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          ),
        },
      ].map((pillar, idx) => (
        <div
          key={idx}
          className="fade-up p-6 rounded-xl bg-[#0c0f0d]/80 backdrop-blur-sm border border-white/[0.06] hover:border-[#166534]/30 transition-all duration-300"
          style={{ animationDelay: `${idx * 50}ms` }}
        >
          <div className="w-10 h-10 rounded-lg bg-[#166534]/10 border border-[#166534]/20 flex items-center justify-center mb-4">
            {pillar.icon}
          </div>
          <h3 className="text-[16px] font-semibold mb-2">{pillar.title}</h3>
          <p className="text-[14px] text-white/45 leading-[1.6]">{pillar.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

**Step 2: Commit**

```bash
git add packages/dashboard/src/app/page.tsx
git commit -m "landing: replace feature cards with 3-pillar value props"
```

---

### Task 4: Update Code Example Copy

**Files:**
- Modify: `packages/dashboard/src/app/page.tsx` — update the code example section left-side copy

**Step 1: Update copy**

Change the left column of the code example section:

- Section label: "Integration" (keep)
- **Headline**: "One API call. That's the integration." (was: "Simple to integrate. Powerful control.")
- **Subheadline**: "Add a single check before each agent action. OakAuth handles the rest." (was: "Add one API call before each agent action. Define permissions in the dashboard. That's the entire integration.")
- **Checklist items**:
  - "Works with any AI framework" (keep)
  - "Sub-10ms validation latency" (was: "Sub-10ms validation latency" — keep)
  - "3 lines of code to integrate" (was: "Minimal code changes — one API call per action")
  - Remove: "Dashboard for managing rules"

**Step 2: Commit**

```bash
git add packages/dashboard/src/app/page.tsx
git commit -m "landing: tighten code example copy"
```

---

### Task 5: Remove Agent Reasoning Section + Rewrite Bottom CTA + Update Footer

**Files:**
- Modify: `packages/dashboard/src/app/page.tsx` — remove Agent Reasoning section, rewrite CTA, update footer

**Step 1: Remove the Agent Reasoning section entirely**

Delete the entire "Agent Reasoning" section (the before/after logs comparison with "Know what happened. And why." headline).

**Step 2: Replace bottom CTA**

Replace current CTA ("Ready to secure your agents?") with:

```tsx
{/* CTA */}
<section className="relative py-24 px-6 border-t border-white/[0.06] z-10">
  <div className="mx-auto max-w-[500px] text-center">
    <h2 className="fade-up text-[28px] md:text-[36px] font-semibold tracking-[-0.02em] mb-4">
      Start securing your
      <span className="text-white/40"> agents today.</span>
    </h2>
    <p className="fade-up text-[15px] text-white/50 mb-8" style={{ animationDelay: '50ms' }}>
      Free during beta. Set up in under 5 minutes.
    </p>
    <div className="fade-up flex flex-wrap gap-3 justify-center" style={{ animationDelay: '100ms' }}>
      <Link
        href="/login"
        className="group h-11 px-6 text-[14px] font-medium rounded-lg bg-[#166534] text-white hover:bg-[#15803d] transition-all flex items-center gap-2 shadow-lg shadow-[#166534]/20"
      >
        Create free account
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
      <a
        href="mailto:hello@oakauth.com"
        className="h-11 px-6 text-[14px] font-medium rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] transition-all flex items-center gap-2"
      >
        Contact us
      </a>
    </div>
  </div>
</section>
```

**Step 3: Update footer links**

Replace current footer links with:
```tsx
<div className="flex items-center gap-5">
  <Link href="/docs" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Docs</Link>
  <Link href="/pricing" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Pricing</Link>
  <Link href="/changelog" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Changelog</Link>
  <a href="mailto:hello@oakauth.com" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Contact</a>
</div>
```

**Step 4: Verify full build**

Run: `cd packages/dashboard && NEXT_PUBLIC_API_URL=https://api.oakauth.com npm run build`
Expected: Clean build with all pages generated

**Step 5: Commit**

```bash
git add packages/dashboard/src/app/page.tsx
git commit -m "landing: remove reasoning section, update CTA and footer"
```

---

### Task 6: Deploy

**Step 1: Build production**

```bash
cd packages/dashboard
NEXT_PUBLIC_API_URL=https://api.oakauth.com npm run build
```

**Step 2: Deploy to Cloudflare Pages**

```bash
npx wrangler pages deploy out --project-name oakauth --branch main
```

**Step 3: Verify live**

```bash
curl -s -o /dev/null -w "%{http_code}" https://oakauth.com
```

Expected: 200

**Step 4: Commit design doc**

```bash
git add docs/plans/2026-02-24-landing-page-redesign.md
git commit -m "docs: add landing page redesign plan"
git push origin main
```
