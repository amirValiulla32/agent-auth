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
    <div className="min-h-screen bg-[#141414] text-[#FAFAFA] antialiased">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#141414]/90 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="mx-auto max-w-[1100px] px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg border border-white/[0.08] bg-[#1f1f1f]">
              <Shield className="w-4 h-4 text-[#FAFAFA]" />
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
            className="h-9 px-4 text-[13px] font-medium rounded-lg bg-[#FAFAFA] text-[#141414] hover:bg-white/90 transition-colors flex items-center gap-2"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6">
        <div className="mx-auto max-w-[1100px]">
          <div className="max-w-[640px]">
            <div className="fade-up inline-flex items-center gap-2 h-7 px-3 rounded-full bg-[#1f1f1f] border border-white/[0.08] mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[12px] text-white/60">Now in public beta</span>
            </div>

            <h1 className="fade-up text-[44px] md:text-[56px] font-semibold tracking-[-0.02em] leading-[1.1] mb-6">
              Permission control
              <br />
              <span className="text-white/40">for AI agents</span>
            </h1>

            <p className="fade-up text-[17px] text-white/50 leading-[1.7] max-w-[480px] mb-10" style={{ animationDelay: '50ms' }}>
              Middleware that sits between your agents and external APIs.
              Control what they can do, monitor every action, and understand why.
            </p>

            <div className="fade-up flex flex-wrap gap-3" style={{ animationDelay: '100ms' }}>
              <Link
                href="/agents"
                className="group h-11 px-5 text-[14px] font-medium rounded-lg bg-[#FAFAFA] text-[#141414] hover:bg-white/90 transition-all flex items-center gap-2"
              >
                Open dashboard
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/docs"
                className="h-11 px-5 text-[14px] font-medium rounded-lg bg-[#1f1f1f] border border-white/[0.08] hover:bg-[#2C2C2E] transition-all flex items-center gap-2"
              >
                Read the docs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Flow diagram */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-[1100px]">
          <div className="fade-up rounded-xl bg-[#1f1f1f] border border-white/[0.08] p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center">
              <div className="flex-1">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#2C2C2E] border border-white/[0.08] mb-3">
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

              <div className="hidden md:block w-16 h-px bg-gradient-to-r from-white/20 to-white/5" />

              <div className="flex-1">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#FAFAFA] mb-3">
                  <Shield className="w-5 h-5 text-[#141414]" />
                </div>
                <p className="text-[14px] font-medium mb-0.5">OakAuth</p>
                <p className="text-[12px] text-white/40">Validates + logs</p>
              </div>

              <div className="hidden md:block w-16 h-px bg-gradient-to-r from-white/20 to-white/5" />

              <div className="flex-1">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#2C2C2E] border border-white/[0.08] mb-3">
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
            <p className="text-[12px] uppercase tracking-[0.1em] text-white/40 mb-3">Capabilities</p>
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/50">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                ),
              },
              {
                title: 'Real-time monitoring',
                description: 'Watch every request as it happens. Full visibility into what your agents are doing.',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/50">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
              },
              {
                title: 'Edge enforcement',
                description: 'Requests validated at Cloudflare\'s edge. Unauthorized actions blocked instantly.',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/50">
                    <rect x="3" y="11" width="18" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                ),
              },
              {
                title: 'Complete audit trail',
                description: 'Every action logged with context. Filter by agent, status, or time. Export for compliance.',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/50">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M14 2v6h6M16 13H8M16 17H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ),
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="fade-up p-5 rounded-xl bg-[#1f1f1f] border border-white/[0.08] hover:bg-[#242424] transition-colors"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <div className="w-9 h-9 rounded-lg bg-[#2C2C2E] flex items-center justify-center mb-4">
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
      <section id="reasoning" className="py-20 px-6 border-t border-white/[0.08]">
        <div className="mx-auto max-w-[1100px]">
          <div className="fade-up mb-12 max-w-[520px]">
            <div className="inline-flex items-center gap-2 h-6 px-2.5 rounded-md bg-[#2C2C2E] border border-white/[0.08] mb-4">
              <span className="text-[11px] text-white/60 font-medium">The moat</span>
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
            <div className="fade-up rounded-xl bg-[#1f1f1f] border border-white/[0.08] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-white/[0.08] bg-[#1a1a1a]">
                <span className="text-[13px] text-white/40">Traditional logs</span>
              </div>
              <div className="p-5 space-y-3 font-mono text-[12px]">
                <div className="p-3.5 rounded-lg bg-[#141414] border border-white/[0.05]">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
                    <span className="text-white/70">gpt4-assistant</span>
                  </div>
                  <p className="text-white/40 pl-4">read /home/user/.env</p>
                  <p className="text-white/25 text-[11px] pl-4 mt-1.5">2:30:14 PM</p>
                </div>
                <div className="p-3.5 rounded-lg bg-[#141414] border border-white/[0.05]">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/70" />
                    <span className="text-white/70">claude-dev</span>
                  </div>
                  <p className="text-white/40 pl-4">write /etc/hosts <span className="text-red-400/60">DENIED</span></p>
                  <p className="text-white/25 text-[11px] pl-4 mt-1.5">2:31:02 PM</p>
                </div>
                <div className="pt-3 border-t border-white/[0.05]">
                  <p className="text-[12px] text-white/30 italic">
                    "Why did the agent read .env?"
                    <span className="block text-white/20 mt-1">→ Time to investigate...</span>
                  </p>
                </div>
              </div>
            </div>

            {/* After */}
            <div className="fade-up rounded-xl bg-[#1f1f1f] border border-white/[0.08] overflow-hidden" style={{ animationDelay: '50ms' }}>
              <div className="px-5 py-3.5 border-b border-white/[0.08] bg-[#1a1a1a] flex items-center justify-between">
                <span className="text-[13px] text-white/70">With Agent Reasoning</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#FAFAFA] text-[#141414] font-medium">Full context</span>
              </div>
              <div className="p-5 space-y-3 font-mono text-[12px]">
                <div className="p-3.5 rounded-lg bg-[#141414] border border-white/[0.05]">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
                    <span className="text-white/70">gpt4-assistant</span>
                  </div>
                  <p className="text-white/40 pl-4">read /home/user/.env</p>
                  <div className="mt-2.5 pt-2.5 border-t border-white/[0.05] pl-4 space-y-1">
                    <p className="text-white/60">
                      <span className="text-white/30">why:</span> Checking database connection string
                    </p>
                    <p className="text-white/40">
                      <span className="text-white/30">ctx:</span> User debugging failed API calls
                    </p>
                  </div>
                </div>
                <div className="p-3.5 rounded-lg bg-[#141414] border border-white/[0.05]">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/70" />
                    <span className="text-white/70">claude-dev</span>
                  </div>
                  <p className="text-white/40 pl-4">write /etc/hosts <span className="text-red-400/60">DENIED</span></p>
                  <div className="mt-2.5 pt-2.5 border-t border-white/[0.05] pl-4 space-y-1">
                    <p className="text-white/60">
                      <span className="text-white/30">why:</span> Adding local DNS for dev server
                    </p>
                    <p className="text-white/40">
                      <span className="text-white/30">ctx:</span> Setting up microservices
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="fade-up mt-6 p-4 rounded-lg bg-[#1f1f1f] border border-white/[0.08]" style={{ animationDelay: '100ms' }}>
            <p className="text-[13px] text-white/50 leading-[1.6]">
              <span className="text-white/70">Reasoning is audit-only</span> — it doesn't bypass permissions.
              Your rules still enforce security. But at 3am during an incident, you'll instantly know which file reads are legitimate.
            </p>
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="py-20 px-6 border-t border-white/[0.08]">
        <div className="mx-auto max-w-[1100px]">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="fade-up">
              <p className="text-[12px] uppercase tracking-[0.1em] text-white/40 mb-3">Integration</p>
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
                    <div className="w-4 h-4 rounded bg-[#2C2C2E] flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-white/50">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="fade-up" style={{ animationDelay: '50ms' }}>
              <div className="rounded-xl bg-[#1f1f1f] border border-white/[0.08] overflow-hidden">
                <div className="px-4 py-3 border-b border-white/[0.08] flex items-center gap-2.5 bg-[#1a1a1a]">
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
{'\n'}  <span className="text-white/40">X-Agent-ID:</span> <span className="text-emerald-400/70">calendar-bot</span>
{'\n'}  <span className="text-white/40">X-Agent-Key:</span> <span className="text-emerald-400/70">sk_live_...</span>
{'\n'}
{'\n'}<span className="text-white/30">{'{'}</span>
{'\n'}  <span className="text-white/40">"summary"</span>: <span className="text-emerald-400/70">"Team standup"</span>,
{'\n'}  <span className="text-white/40">"duration"</span>: <span className="text-white/50">15</span>,
{'\n'}  <span className="text-white/40">"reasoning"</span>: <span className="text-emerald-400/70">"User asked for daily standups"</span>
{'\n'}<span className="text-white/30">{'}'}</span>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/[0.08]">
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
              className="group h-11 px-6 text-[14px] font-medium rounded-lg bg-[#FAFAFA] text-[#141414] hover:bg-white/90 transition-all flex items-center gap-2"
            >
              Get started free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#features"
              className="h-11 px-6 text-[14px] font-medium rounded-lg bg-[#1f1f1f] border border-white/[0.08] hover:bg-[#2C2C2E] transition-all flex items-center gap-2"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-white/[0.08]">
        <div className="mx-auto max-w-[1100px] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-[#1f1f1f] border border-white/[0.08]">
              <Shield className="w-3.5 h-3.5 text-white/60" />
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
