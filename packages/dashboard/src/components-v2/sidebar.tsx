'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, ScrollText, Shield } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Agents', href: '/agents', icon: Users },
  { name: 'Audit Logs', href: '/logs', icon: ScrollText },
];

export function SidebarV2() {
  const pathname = usePathname();
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0, opacity: 0 });
  const navContainerRef = useRef<HTMLDivElement>(null);
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const updateIndicator = () => {
      const activeIndex = navigation.findIndex(item => item.href === pathname);
      if (activeIndex !== -1 && navRefs.current[activeIndex] && navContainerRef.current) {
        const element = navRefs.current[activeIndex];
        const container = navContainerRef.current;
        if (element && container) {
          try {
            const containerRect = container.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            setIndicatorStyle({
              top: elementRect.top - containerRect.top,
              height: elementRect.height,
              opacity: 1,
            });
          } catch (error) {
            // Silently handle any DOM errors
            console.warn('Sidebar indicator update failed:', error);
          }
        }
      } else {
        // Hide indicator if no active route
        setIndicatorStyle({ top: 0, height: 0, opacity: 0 });
      }
    };

    // Use requestAnimationFrame for smoother updates
    const rafId = requestAnimationFrame(() => {
      updateIndicator();
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [pathname]);

  return (
    <div className="flex h-full w-64 flex-col bg-[#141414] border-r border-white/8">
      {/* Logo */}
      <div className="flex h-20 items-center px-6 border-b border-white/8">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="p-2 rounded-lg border border-white/8 transition-all duration-200 group-hover:border-white/15 group-hover:bg-white/5">
            <Shield className="h-5 w-5 text-white transition-transform duration-200 group-hover:scale-110" />
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight text-white">OakAuth</span>
            <p className="text-[10px] uppercase tracking-wider text-white/50">Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 relative">
        <div className="space-y-1 relative" ref={navContainerRef}>
          {/* Active indicator - slides smoothly */}
          {indicatorStyle.opacity > 0 && (
            <div
              className="absolute left-0 rounded-lg bg-[#FAFAFA] transition-all duration-300 ease-out pointer-events-none"
              style={{
                top: `${indicatorStyle.top}px`,
                height: `${indicatorStyle.height}px`,
                width: '100%',
                zIndex: 0,
              }}
            />
          )}

          {navigation.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                ref={el => { navRefs.current[index] = el; }}
                style={{ zIndex: 10 }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 relative",
                  isActive
                    ? "text-[#141414] font-semibold"
                    : "text-white/70 hover:bg-white/5 hover:text-white/95 hover:translate-x-1"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 transition-all duration-200",
                  isActive ? "scale-110" : ""
                )} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/8 p-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200 cursor-pointer group">
          <div className="h-8 w-8 rounded-full bg-[#2C2C2E] border border-white/8 flex items-center justify-center transition-all duration-200 group-hover:border-white/15 group-hover:scale-105">
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
