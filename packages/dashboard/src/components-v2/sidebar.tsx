'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, ScrollText, Shield } from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/v2', icon: LayoutDashboard },
  { name: 'Agents', href: '/v2/agents', icon: Users },
  { name: 'Audit Logs', href: '/v2/logs', icon: ScrollText },
];

export function SidebarV2() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-[#141414] border-r border-white/8">
      {/* Logo */}
      <div className="flex h-20 items-center px-6 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg border border-white/8">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight text-white">Agent Auth</span>
            <p className="text-[10px] uppercase tracking-wider text-white/50">Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[#FAFAFA] text-[#141414]"
                  : "text-white/70 hover:bg-white/5 hover:text-white/95"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/8 p-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200">
          <div className="h-8 w-8 rounded-full bg-[#2C2C2E] border border-white/8 flex items-center justify-center">
            <span className="text-xs font-semibold text-white/95">AD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white/95 truncate">Admin User</p>
            <p className="text-xs text-white/50">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
