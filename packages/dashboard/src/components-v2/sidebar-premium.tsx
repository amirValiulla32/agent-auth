'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, ScrollText, Shield, Sparkles, ChevronRight } from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: 'Dashboard', href: '/v2', icon: LayoutDashboard, badge: null },
  { name: 'Agents', href: '/v2/agents', icon: Users, badge: null },
  { name: 'Audit Logs', href: '/v2/logs', icon: ScrollText, badge: 'Live' },
];

export function SidebarPremium() {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="flex h-full w-64 flex-col bg-graphite-deep/95 backdrop-blur-xl border-r border-white/[0.08] relative overflow-hidden">
      {/* Ambient glow effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Logo Section */}
      <div className="relative flex h-20 items-center px-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative p-2.5 rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.08] to-transparent shadow-inner-glow group-hover:shadow-glow transition-all duration-300">
            <Shield className="h-5 w-5 text-graphite-accent group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/0 via-white/[0.05] to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-graphite-accent">Agent Auth</span>
              <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse-glow" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.15em] font-medium text-white/40">Authorization Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href;
          const isHovered = hoveredItem === item.name;

          return (
            <Link
              key={item.name}
              href={item.href}
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-300",
                "before:absolute before:inset-0 before:rounded-xl before:transition-opacity before:duration-300",
                isActive
                  ? "bg-graphite-accent text-graphite-deep shadow-glow before:opacity-100"
                  : "text-white/60 hover:text-white/90 before:bg-gradient-to-r before:from-white/[0.05] before:to-transparent before:opacity-0 hover:before:opacity-100",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative z-10 flex items-center gap-3 w-full">
                <div className={cn(
                  "relative p-1.5 rounded-lg transition-all duration-300",
                  isActive
                    ? "bg-graphite-deep/10"
                    : "bg-transparent group-hover:bg-white/5"
                )}>
                  <item.icon className={cn(
                    "h-4 w-4 transition-all duration-300",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} />
                  {isActive && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-graphite-deep/20 to-transparent animate-pulse-glow" />
                  )}
                </div>
                <span className="flex-1">{item.name}</span>

                {item.badge && (
                  <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">{item.badge}</span>
                  </div>
                )}

                {isHovered && !isActive && (
                  <ChevronRight className="h-4 w-4 text-white/40 animate-slide-in-right" />
                )}
              </div>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-graphite-deep via-graphite-deep to-transparent rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Stats Section */}
      <div className="mx-4 mb-4 rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-transparent p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium uppercase tracking-wider text-white/40">System Status</span>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-glow" />
            <span className="text-xs font-semibold text-emerald-400">Healthy</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-white/[0.03] p-2.5 border border-white/[0.05]">
            <div className="text-xl font-bold text-graphite-accent">99.9%</div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">Uptime</div>
          </div>
          <div className="rounded-lg bg-white/[0.03] p-2.5 border border-white/[0.05]">
            <div className="text-xl font-bold text-graphite-accent">12ms</div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">Latency</div>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="relative border-t border-white/[0.08] p-4">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.03] transition-all duration-300 cursor-pointer group">
          <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400/20 to-blue-400/20 border border-white/[0.08] flex items-center justify-center overflow-hidden">
            <span className="text-sm font-bold text-graphite-accent relative z-10">AD</span>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-graphite-accent truncate">Admin User</p>
            <p className="text-xs text-white/40 truncate">admin@example.com</p>
          </div>
          <ChevronRight className="h-4 w-4 text-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
    </div>
  );
}
