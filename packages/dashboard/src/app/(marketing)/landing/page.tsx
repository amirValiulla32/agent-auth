'use client';

import Link from "next/link";
import { TreePine } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#030706] overflow-hidden">
      {/* Dramatic Aurora/Spotlight Effect */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary spotlight - dramatic rays from center top */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[100%]"
          style={{
            background: `
              radial-gradient(ellipse 35% 50% at 50% -5%, hsl(149 60% 25% / 0.25), transparent 60%),
              radial-gradient(ellipse 50% 40% at 50% 0%, hsl(149 50% 20% / 0.15), transparent 50%)
            `,
          }}
        />

        {/* Light rays effect */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[70%]"
          style={{
            background: `
              conic-gradient(
                from 180deg at 50% 0%,
                transparent 35%,
                hsl(149 50% 30% / 0.08) 40%,
                hsl(149 60% 25% / 0.12) 45%,
                hsl(149 50% 30% / 0.08) 47%,
                transparent 50%,
                transparent 52%,
                hsl(149 50% 30% / 0.06) 53%,
                hsl(149 60% 25% / 0.10) 55%,
                hsl(149 50% 30% / 0.06) 57%,
                transparent 60%,
                transparent 65%
              )
            `,
            filter: 'blur(30px)',
          }}
        />

        {/* Secondary glow - left */}
        <div
          className="absolute -top-[10%] left-[10%] w-[40%] h-[50%] blur-3xl opacity-40"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(160 45% 20% / 0.3), transparent 60%)',
          }}
        />

        {/* Secondary glow - right */}
        <div
          className="absolute -top-[5%] right-[15%] w-[35%] h-[45%] blur-3xl opacity-30"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(145 50% 18% / 0.25), transparent 60%)',
          }}
        />

        {/* Subtle noise texture */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay',
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg border border-white/10 bg-white/5">
            <TreePine className="h-5 w-5 text-white/90" />
          </div>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#about" className="text-sm text-white/60 hover:text-white/90 transition-colors duration-200">
            About Us
          </a>
          <a href="#faq" className="text-sm text-white/60 hover:text-white/90 transition-colors duration-200">
            FAQ
          </a>
          <a href="#blog" className="text-sm text-white/60 hover:text-white/90 transition-colors duration-200">
            Blog
          </a>
          <a href="#contact" className="text-sm text-white/60 hover:text-white/90 transition-colors duration-200">
            Contact
          </a>
        </div>

        {/* Sign In Button */}
        <Link
          href="/"
          className="px-5 py-2 rounded-full text-sm font-medium text-white bg-forest hover:bg-forest-light transition-all duration-200 hover:shadow-glow-sm"
        >
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-32 pb-20">
        {/* Main Title */}
        <h1
          className="text-7xl md:text-8xl lg:text-9xl font-light tracking-tight text-white/95 mb-8"
          style={{
            fontWeight: 300,
            letterSpacing: '-0.02em',
          }}
        >
          OakAuth
        </h1>

        {/* Tagline */}
        <p className="text-lg md:text-xl text-white/50 max-w-xl mx-auto mb-12 leading-relaxed">
          Harnessing the power of artificial intelligence to
          <br />
          revolutionize industries and enhance human experiences.
        </p>

        {/* CTA Button */}
        <Link
          href="/"
          className="group relative px-8 py-3.5 rounded-xl text-sm font-medium text-white/90 transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, hsl(149 50% 20% / 0.3), hsl(149 40% 15% / 0.2))',
            border: '1px solid hsl(149 50% 30% / 0.3)',
            boxShadow: '0 0 30px hsl(149 50% 25% / 0.15), inset 0 1px 0 hsl(149 50% 40% / 0.1)',
          }}
        >
          <span className="relative z-10">Try out</span>
          {/* Hover glow effect */}
          <div
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(135deg, hsl(149 50% 25% / 0.4), hsl(149 40% 18% / 0.3))',
              boxShadow: '0 0 40px hsl(149 50% 30% / 0.25)',
            }}
          />
        </Link>
      </main>

      {/* Bottom fade gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, #030706, transparent)',
        }}
      />
    </div>
  );
}
