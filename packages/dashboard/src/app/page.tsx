'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { OakAuthIcon } from '@/components/ui/icons'

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
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% -15%,
              hsl(149 60% 25% / 0.25),
              hsl(149 60% 20% / 0.12) 40%,
              transparent 75%)`
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 60% 48% at 50% -5%,
              hsl(149 70% 30% / 0.18),
              transparent 65%)`
          }}
        />
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
            <Link href="/login" className="hidden sm:block text-[13px] text-white/60 hover:text-white transition-colors">
              Log in
            </Link>
            <Link
              href="/login"
              className="h-9 px-4 text-[13px] font-medium rounded-lg bg-[#166534] text-white hover:bg-[#15803d] transition-colors flex items-center"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

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
                    <div className="hidden sm:flex items-center gap-6 text-[12px] text-white/40">
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

      {/* Code Example */}
      <section className="relative py-20 px-6 border-t border-white/[0.06] z-10">
        <div className="mx-auto max-w-[1100px]">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="fade-up">
              <p className="text-[12px] uppercase tracking-[0.15em] text-[#22c55e]/70 mb-3">Integration</p>
              <h2 className="text-[28px] md:text-[32px] font-semibold tracking-[-0.02em] mb-4">
                One API call.
                <span className="text-white/40"> That&apos;s the integration.</span>
              </h2>
              <p className="text-[15px] text-white/50 leading-[1.7] mb-8">
                Add a single check before each agent action. OakAuth handles the rest.
              </p>

              <div className="space-y-3">
                {[
                  'Works with any AI framework',
                  'Sub-10ms validation latency',
                  '3 lines of code to integrate',
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
              <div className="rounded-xl bg-[#0c0f0d]/80 backdrop-blur-sm border border-white/[0.06] overflow-hidden">
                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2.5 bg-[#090c0a]/50">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  </div>
                  <span className="text-[11px] text-white/30 font-mono">agent-request.ts</span>
                </div>
                <pre className="p-5 text-[12px] font-mono leading-[1.8] overflow-x-auto">
<span className="text-white/30">// Before each agent action, validate permission</span>
{'\n'}<span className="text-[#22c55e]/70">const</span> <span className="text-white/70">check</span> <span className="text-white/40">=</span> <span className="text-[#22c55e]/70">await</span> <span className="text-white/70">fetch</span><span className="text-white/40">(</span>
{'\n'}  <span className="text-[#22c55e]/60">&apos;https://api.oakauth.com/v1/validate&apos;</span><span className="text-white/40">,</span>
{'\n'}  <span className="text-white/40">{'{'}</span>
{'\n'}    <span className="text-white/50">method</span><span className="text-white/40">:</span> <span className="text-[#22c55e]/60">&apos;POST&apos;</span><span className="text-white/40">,</span>
{'\n'}    <span className="text-white/50">headers</span><span className="text-white/40">:</span> <span className="text-white/40">{'{'}</span>
{'\n'}      <span className="text-white/50">&apos;Content-Type&apos;</span><span className="text-white/40">:</span> <span className="text-[#22c55e]/60">&apos;application/json&apos;</span><span className="text-white/40">,</span>
{'\n'}      <span className="text-white/50">&apos;Authorization&apos;</span><span className="text-white/40">:</span> <span className="text-[#22c55e]/60">{`\`Bearer \${'{'}`}</span><span className="text-white/70">OAKAUTH_API_KEY</span><span className="text-[#22c55e]/60">{`${'}'}\``}</span>
{'\n'}    <span className="text-white/40">{'}'}</span><span className="text-white/40">,</span>
{'\n'}    <span className="text-white/50">body</span><span className="text-white/40">:</span> <span className="text-white/70">JSON</span><span className="text-white/40">.</span><span className="text-white/70">stringify</span><span className="text-white/40">(</span><span className="text-white/40">{'{'}</span>
{'\n'}      <span className="text-white/50">tool</span><span className="text-white/40">:</span> <span className="text-[#22c55e]/60">&apos;stripe&apos;</span><span className="text-white/40">,</span>
{'\n'}      <span className="text-white/50">scope</span><span className="text-white/40">:</span> <span className="text-[#22c55e]/60">&apos;create_charge&apos;</span><span className="text-white/40">,</span>
{'\n'}      <span className="text-white/50">reasoning</span><span className="text-white/40">:</span> <span className="text-[#22c55e]/60">&apos;User upgraded to pro plan&apos;</span>
{'\n'}    <span className="text-white/40">{'}'}</span><span className="text-white/40">)</span>
{'\n'}  <span className="text-white/40">{'}'}</span>
{'\n'}<span className="text-white/40">)</span>
{'\n'}
{'\n'}<span className="text-[#22c55e]/70">const</span> <span className="text-white/40">{'{'}</span> <span className="text-white/70">allowed</span> <span className="text-white/40">{'}'}</span> <span className="text-white/40">=</span> <span className="text-[#22c55e]/70">await</span> <span className="text-white/70">check</span><span className="text-white/40">.</span><span className="text-white/70">json</span><span className="text-white/40">()</span>
{'\n'}<span className="text-[#22c55e]/70">if</span> <span className="text-white/40">(</span><span className="text-white/70">allowed</span><span className="text-white/40">)</span> <span className="text-white/40">{'{'}</span>
{'\n'}  <span className="text-white/30">// proceed with the action</span>
{'\n'}<span className="text-white/40">{'}'}</span>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-16 px-6 border-t border-white/[0.06] z-10">
        <div className="mx-auto max-w-[1100px]">
          <div className="fade-up mb-10 text-center">
            <p className="text-[12px] uppercase tracking-[0.15em] text-[#22c55e]/70 mb-3">How it works</p>
            <h2 className="text-[28px] md:text-[32px] font-semibold tracking-[-0.02em]">
              Security in the
              <span className="text-white/40"> request path</span>
            </h2>
          </div>
          <div className="fade-up rounded-xl bg-[#0c0f0d]/80 backdrop-blur-sm border border-white/[0.06] p-8 md:p-10">
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
                <p className="text-[14px] font-medium mb-0.5">Your AI Agent</p>
                <p className="text-[12px] text-white/40">Makes a request</p>
              </div>

              <div className="hidden md:flex items-center">
                <div className="w-12 h-px bg-gradient-to-r from-[#166534]/40 to-[#166534]" />
                <div className="w-2 h-2 rotate-45 border-t border-r border-[#166534]" />
              </div>

              <div className="flex-1">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#166534] mb-3 shadow-lg shadow-[#166534]/30">
                  <OakAuthIcon className="w-5 h-5 text-white" />
                </div>
                <p className="text-[14px] font-medium mb-0.5">OakAuth</p>
                <p className="text-[12px] text-white/40">Validates & logs</p>
              </div>

              <div className="hidden md:flex items-center">
                <div className="w-12 h-px bg-gradient-to-r from-[#166534] to-[#166534]/40" />
                <div className="w-2 h-2 rotate-45 border-t border-r border-[#166534]/40" />
              </div>

              <div className="flex-1">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#171b19] border border-white/[0.06] mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white/60">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </div>
                <p className="text-[14px] font-medium mb-0.5">External API</p>
                <p className="text-[12px] text-white/40">Stripe, Slack, etc.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* Footer */}
      <footer className="relative py-6 px-6 border-t border-white/[0.06] z-10">
        <div className="mx-auto max-w-[1100px] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-[#166534]/10 border border-[#166534]/30">
              <OakAuthIcon className="w-3.5 h-3.5 text-[#22c55e]" />
            </div>
            <span className="text-[12px] text-white/40">OakAuth</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/docs" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Docs</Link>
            <Link href="/pricing" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Pricing</Link>
            <Link href="/changelog" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Changelog</Link>
            <a href="mailto:hello@oakauth.com" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Contact</a>
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
