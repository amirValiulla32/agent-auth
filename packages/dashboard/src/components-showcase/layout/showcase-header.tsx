'use client';

import { Search, Bell, Command } from 'lucide-react';

export function ShowcaseHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/[0.08] bg-[#141414]/80 px-8 backdrop-blur-xl">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="group relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 transition-colors group-hover:text-white/60" />
          <input
            type="text"
            placeholder="Search agents, logs, analytics..."
            className="h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.02] pl-10 pr-12 text-sm text-white placeholder:text-white/40 transition-all duration-200 hover:border-white/[0.12] focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-xs text-white/40">
            <Command className="inline h-3 w-3" />K
          </kbd>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] text-white/60 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-white">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-semibold text-[#141414]">
            3
          </span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04]">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-400 text-xs font-semibold text-[#141414]">
            AD
          </div>
          <div className="text-sm text-white">Admin</div>
        </div>
      </div>
    </header>
  );
}
