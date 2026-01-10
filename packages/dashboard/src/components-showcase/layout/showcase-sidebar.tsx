'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bot,
  ScrollText,
  BarChart3,
  Settings,
  Zap,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/showcase', icon: LayoutDashboard },
  { name: 'Agents', href: '/showcase/agents', icon: Bot },
  { name: 'Audit Logs', href: '/showcase/logs', icon: ScrollText },
  { name: 'Analytics', href: '/showcase/analytics', icon: BarChart3 },
];

const secondary = [
  { name: 'Settings', href: '/showcase/settings', icon: Settings },
];

export function ShowcaseSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-white/[0.08] bg-[#141414]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/[0.08] px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400">
          <Shield className="h-5 w-5 text-[#141414]" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">AgentAuth</div>
          <div className="text-xs text-white/40">Premium Platform</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-white/[0.08] text-white shadow-lg shadow-white/5'
                  : 'text-white/60 hover:bg-white/[0.04] hover:text-white/80'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  isActive && 'scale-110'
                )}
              />
              <span>{item.name}</span>
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Stats Badge */}
      <div className="mx-3 mb-4 rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-xs text-white/60">
          <Zap className="h-3.5 w-3.5 text-emerald-400" />
          <span>System Status</span>
        </div>
        <div className="mt-2 text-2xl font-bold text-white">99.8%</div>
        <div className="mt-1 text-xs text-white/40">Uptime</div>
      </div>

      {/* Secondary Navigation */}
      <div className="border-t border-white/[0.08] px-3 py-4">
        {secondary.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 transition-all duration-200 hover:bg-white/[0.04] hover:text-white/80"
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.08] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-400 text-sm font-semibold text-[#141414]">
            AD
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-white">Admin User</div>
            <div className="text-xs text-white/40">admin@example.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}
