'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Shield } from 'lucide-react'

function useScrollAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    const elements = document.querySelectorAll('.fade-up')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])
}

export default function LandingPage() {
  useScrollAnimation()

  return (
    <div className="min-h-screen bg-[#090c0a] text-[#FAFAFA] antialiased">
      {/* Aurora Background Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Primary spotlight - radial gradient from top center */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% -20%,
              hsl(149 60% 25% / 0.3),
              hsl(149 60% 20% / 0.15) 40%,
              transparent 70%)`
          }}
        />

        {/* Secondary glow layer */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 60% 40% at 50% -10%,
              hsl(149 70% 30% / 0.2),
              transparent 60%)`
          }}
        />

        {/* Light rays using conic gradient */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `conic-gradient(from 180deg at 50% 0%,
              transparent 30%,
              hsl(149 50% 30% / 0.1) 35%,
              transparent 40%,
              transparent 45%,
              hsl(149 50% 25% / 0.08) 48%,
              transparent 52%,
              transparent 58%,
              hsl(149 50% 30% / 0.1) 62%,
              transparent 68%,
              transparent 70%)`,
            filter: 'blur(40px)'
          }}
        />

        {/* Subtle noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#090c0a]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="mx-auto max-w-[1100px] px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg border border-[#166534]/30 bg-[#166534]/10">
              <Shield className="w-4 h-4 text-[#22c55e]" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">OakAuth</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {[
              { label: 'Features', href: '#features' },
              { label: 'Agent Reasoning', href: '#reasoning' },
              { label: 'Docs', href: '/docs' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-4 py-2 text-[13px] text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/[0.05]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/pricing"
              className="px-4 py-2 text-[13px] text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/[0.05]"
            >
              Pricing
            </Link>
          </div>

          <Link
            href="/agents"
            className="h-9 px-4 text-[13px] font-medium rounded-lg bg-[#166534] text-white hover:bg-[#15803d] transition-colors flex items-center gap-2"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero - Centered Layout */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-[900px]">
          <div className="fade-up inline-flex items-center gap-2 h-7 px-3 rounded-full bg-[#166534]/10 border border-[#166534]/30 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            <span className="text-[12px] text-white/60">Now in public beta</span>
          </div>

          <h1 className="fade-up text-7xl md:text-8xl lg:text-9xl font-light tracking-[-0.03em] leading-[0.9] mb-6">
            OakAuth
          </h1>

          <p className="fade-up text-xl md:text-2xl text-white/50 font-light tracking-wide mb-12" style={{ animationDelay: '50ms' }}>
            Permission control for AI agents
          </p>

          <div className="fade-up flex flex-wrap gap-4 justify-center" style={{ animationDelay: '100ms' }}>
            <Link
              href="/agents"
              className="group h-12 px-6 text-[14px] font-medium rounded-lg bg-[#166534] text-white hover:bg-[#15803d] transition-all flex items-center gap-2 shadow-lg shadow-[#166534]/20"
            >
              Open dashboard
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/docs"
              className="h-12 px-6 text-[14px] font-medium rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] transition-all flex items-center gap-2"
            >
              Read the docs
            </Link>
          </div>
        </div>
      </section>

      {/* Flow diagram */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-[1100px]">
          <div className="fade-up rounded-xl bg-[#0c0f0d] border border-white/[0.06] p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center">
              <div className="flex-1">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#171b19] border border-white/[0.06] mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white/60">
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="9" cy="10" r="1.5" fill="currentColor"/>
                    <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
                    <path d="M9 15h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-[14px] font-medium mb-0.5">AI Agent</p>
                <p className="text-[12px] text-white/40">Sends request</p>
              </div>

              <div className="hidden md:block w-16 h-px bg-gradient-to-r from-[#166534]/40 to-[#166534]/10" />

              <div className="flex-1">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#166534] mb-3">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <p className="text-[14px] font-medium mb-0.5">OakAuth</p>
                <p className="text-[12px] text-white/40">Validates + logs</p>
              </div>

              <div className="hidden md:block w-16 h-px bg-gradient-to-r from-[#166534]/40 to-[#166534]/10" />

              <div className="flex-1">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#171b19] border border-white/[0.06] mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white/60">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </div>
                <p className="text-[14px] font-medium mb-0.5">External API</p>
                <p className="text-[12px] text-white/40">Google, Slack, etc.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="mx-auto max-w-[1100px]">
          <div className="fade-up mb-12">
            <p className="text-[12px] uppercase tracking-[0.1em] text-[#22c55e]/70 mb-3">Capabilities</p>
            <h2 className="text-[28px] md:text-[32px] font-semibold tracking-[-0.02em]">
              Everything you need to
              <span className="text-white/40"> secure your agents</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: 'Granular permissions',
                description: 'Define rules per agent: duration limits, attendee caps, time restrictions. Validated in milliseconds.',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#22c55e]">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                ),
              },
              {
                title: 'Real-time monitoring',
                description: 'Watch every request as it happens. Full visibility into what your agents are doing.',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#22c55e]">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
              },
              {
                title: 'Edge enforcement',
                description: 'Requests validated at Cloudflare\'s edge. Unauthorized actions blocked instantly.',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#22c55e]">
                    <rect x="3" y="11" width="18" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                ),
              },
              {
                title: 'Complete audit trail',
                description: 'Every action logged with context. Filter by agent, status, or time. Export for compliance.',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#22c55e]">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M14 2v6h6M16 13H8M16 17H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ),
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="fade-up p-5 rounded-xl bg-[#0c0f0d] border border-white/[0.06] hover:border-[#166534]/30 transition-colors"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <div className="w-9 h-9 rounded-lg bg-[#166534]/10 border border-[#166534]/20 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-[15px] font-medium mb-1.5">{feature.title}</h3>
                <p className="text-[13px] text-white/40 leading-[1.6]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Reasoning Context */}
      <section id="reasoning" className="py-20 px-6 border-t border-white/[0.06]">
        <div className="mx-auto max-w-[1100px]">
          <div className="fade-up mb-12 max-w-[520px]">
            <div className="inline-flex items-center gap-2 h-6 px-2.5 rounded-md bg-[#166534]/10 border border-[#166534]/30 mb-4">
              <span className="text-[11px] text-[#22c55e] font-medium">The moat</span>
            </div>
            <h2 className="text-[28px] md:text-[32px] font-semibold tracking-[-0.02em] mb-4">
              Know what happened.
              <span className="text-white/40"> And why.</span>
            </h2>
            <p className="text-[15px] text-white/50 leading-[1.7]">
              Agent Reasoning Context lets agents explain their intent. Audit logs go from cryptic action lists to instantly understandable records.
            </p>
          </div>

          {/* Comparison */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Before */}
            <div className="fade-up rounded-xl bg-[#0c0f0d] border border-white/[0.06] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-white/[0.06] bg-[#090c0a]">
                <span className="text-[13px] text-white/40">Traditional logs</span>
              </div>
              <div className="p-5 space-y-3 font-mono text-[12px]">
                <div className="p-3.5 rounded-lg bg-[#090c0a] border border-white/[0.04]">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]/70" />
                    <span className="text-white/70">gpt4-assistant</span>
                  </div>
                  <p className="text-white/40 pl-4">read /home/user/.env</p>
                  <p className="text-white/25 text-[11px] pl-4 mt-1.5">2:30:14 PM</p>
                </div>
                <div className="p-3.5 rounded-lg bg-[#090c0a] border border-white/[0.04]">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/70" />
                    <span className="text-white/70">claude-dev</span>
                  </div>
                  <p className="text-white/40 pl-4">write /etc/hosts <span className="text-red-400/60">DENIED</span></p>
                  <p className="text-white/25 text-[11px] pl-4 mt-1.5">2:31:02 PM</p>
                </div>
                <div className="pt-3 border-t border-white/[0.04]">
                  <p className="text-[12px] text-white/30 italic">
                    "Why did the agent read .env?"
                    <span className="block text-white/20 mt-1">→ Time to investigate...</span>
                  </p>
                </div>
              </div>
            </div>

            {/* After */}
            <div className="fade-up rounded-xl bg-[#0c0f0d] border border-white/[0.06] overflow-hidden" style={{ animationDelay: '50ms' }}>
              <div className="px-5 py-3.5 border-b border-white/[0.06] bg-[#090c0a] flex items-center justify-between">
                <span className="text-[13px] text-white/70">With Agent Reasoning</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#166534] text-white font-medium">Full context</span>
              </div>
              <div className="p-5 space-y-3 font-mono text-[12px]">
                <div className="p-3.5 rounded-lg bg-[#090c0a] border border-white/[0.04]">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]/70" />
                    <span className="text-white/70">gpt4-assistant</span>
                  </div>
                  <p className="text-white/40 pl-4">read /home/user/.env</p>
                  <div className="mt-2.5 pt-2.5 border-t border-white/[0.04] pl-4 space-y-1">
                    <p className="text-white/60">
                      <span className="text-[#22c55e]/60">why:</span> Checking database connection string
                    </p>
                    <p className="text-white/40">
                      <span className="text-[#22c55e]/60">ctx:</span> User debugging failed API calls
                    </p>
                  </div>
                </div>
                <div className="p-3.5 rounded-lg bg-[#090c0a] border border-white/[0.04]">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/70" />
                    <span className="text-white/70">claude-dev</span>
                  </div>
                  <p className="text-white/40 pl-4">write /etc/hosts <span className="text-red-400/60">DENIED</span></p>
                  <div className="mt-2.5 pt-2.5 border-t border-white/[0.04] pl-4 space-y-1">
                    <p className="text-white/60">
                      <span className="text-[#22c55e]/60">why:</span> Adding local DNS for dev server
                    </p>
                    <p className="text-white/40">
                      <span className="text-[#22c55e]/60">ctx:</span> Setting up microservices
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="fade-up mt-6 p-4 rounded-lg bg-[#0c0f0d] border border-white/[0.06]" style={{ animationDelay: '100ms' }}>
            <p className="text-[13px] text-white/50 leading-[1.6]">
              <span className="text-white/70">Reasoning is audit-only</span> — it doesn't bypass permissions.
              Your rules still enforce security. But at 3am during an incident, you'll instantly know which file reads are legitimate.
            </p>
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="mx-auto max-w-[1100px]">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="fade-up">
              <p className="text-[12px] uppercase tracking-[0.1em] text-[#22c55e]/70 mb-3">Integration</p>
              <h2 className="text-[28px] md:text-[32px] font-semibold tracking-[-0.02em] mb-4">
                Simple rules,
                <span className="text-white/40"> powerful control</span>
              </h2>
              <p className="text-[15px] text-white/50 leading-[1.7] mb-8">
                Define permissions in JSON. Add two headers to your agent's requests.
                That's the entire integration.
              </p>

              <div className="space-y-3">
                {[
                  'Max event duration: 30 minutes',
                  'Max attendees: 5 per meeting',
                  'Business hours only (9–5 UTC)',
                  'Validated in <10ms at edge',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded bg-[#166534]/20 border border-[#166534]/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-white/50">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="fade-up" style={{ animationDelay: '50ms' }}>
              <div className="rounded-xl bg-[#0c0f0d] border border-white/[0.06] overflow-hidden">
                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2.5 bg-[#090c0a]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  </div>
                  <span className="text-[11px] text-white/30 font-mono">request.ts</span>
                </div>
                <pre className="p-5 text-[12px] font-mono leading-[1.8] overflow-x-auto">
<span className="text-white/30">// Request with reasoning</span>
{'\n'}<span className="text-white/50">POST</span> <span className="text-white/40">/v1/calendar/events</span>
{'\n'}
{'\n'}<span className="text-white/30">Headers:</span>
{'\n'}  <span className="text-white/40">X-Agent-ID:</span> <span className="text-[#22c55e]/70">calendar-bot</span>
{'\n'}  <span className="text-white/40">X-Agent-Key:</span> <span className="text-[#22c55e]/70">sk_live_...</span>
{'\n'}
{'\n'}<span className="text-white/30">{'{'}</span>
{'\n'}  <span className="text-white/40">"summary"</span>: <span className="text-[#22c55e]/70">"Team standup"</span>,
{'\n'}  <span className="text-white/40">"duration"</span>: <span className="text-white/50">15</span>,
{'\n'}  <span className="text-white/40">"reasoning"</span>: <span className="text-[#22c55e]/70">"User asked for daily standups"</span>
{'\n'}<span className="text-white/30">{'}'}</span>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/[0.06]">
        <div className="mx-auto max-w-[500px] text-center">
          <h2 className="fade-up text-[28px] md:text-[36px] font-semibold tracking-[-0.02em] mb-4">
            Start monitoring
            <span className="text-white/40"> your agents</span>
          </h2>
          <p className="fade-up text-[15px] text-white/50 mb-8" style={{ animationDelay: '50ms' }}>
            Enterprise-ready security for your AI agents.
            <br />Set up in minutes.
          </p>
          <div className="fade-up flex flex-wrap gap-3 justify-center" style={{ animationDelay: '100ms' }}>
            <Link
              href="/agents"
              className="group h-11 px-6 text-[14px] font-medium rounded-lg bg-[#166534] text-white hover:bg-[#15803d] transition-all flex items-center gap-2 shadow-lg shadow-[#166534]/20"
            >
              Get started free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#features"
              className="h-11 px-6 text-[14px] font-medium rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] transition-all flex items-center gap-2"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-white/[0.06]">
        <div className="mx-auto max-w-[1100px] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-[#166534]/10 border border-[#166534]/30">
              <Shield className="w-3.5 h-3.5 text-[#22c55e]" />
            </div>
            <span className="text-[12px] text-white/40">OakAuth</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/docs" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Docs</Link>
            <Link href="#features" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Features</Link>
            <Link href="/pricing" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .fade-up {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .fade-up.in-view {
          opacity: 1;
          transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
          .fade-up {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>
    </div>
  )
}
