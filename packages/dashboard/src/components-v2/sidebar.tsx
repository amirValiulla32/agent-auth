'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, ScrollText, TreePine } from "lucide-react";
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
            console.warn('Sidebar indicator update failed:', error);
          }
        }
      } else {
        setIndicatorStyle({ top: 0, height: 0, opacity: 0 });
      }
    };

    const rafId = requestAnimationFrame(() => {
      updateIndicator();
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [pathname]);

  return (
    <div className="flex h-full w-64 flex-col bg-oak-deep/80 backdrop-blur-sm border-r border-oak-border">
      {/* Logo */}
      <div className="flex h-20 items-center px-6 border-b border-oak-border">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="p-2 rounded-lg border border-oak-border bg-primary/5 transition-all duration-300 group-hover:border-primary/25 group-hover:bg-primary/10 group-hover:shadow-glow-sm">
            <TreePine className="h-5 w-5 text-primary transition-all duration-300 group-hover:scale-110 group-hover:rotate-[3deg]" />
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight text-foreground">OakAuth</span>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 relative">
        <div className="space-y-1 relative" ref={navContainerRef}>
          {/* Active indicator - forest green gradient with glow */}
          {indicatorStyle.opacity > 0 && (
            <div
              className="absolute left-0 rounded-lg transition-all duration-300 ease-out pointer-events-none"
              style={{
                top: `${indicatorStyle.top}px`,
                height: `${indicatorStyle.height}px`,
                width: '100%',
                background: 'linear-gradient(135deg, hsl(149 76% 23%), hsl(152 69% 28%))',
                boxShadow: '0 0 15px hsl(149 76% 23% / 0.20)',
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
                    ? "text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-foreground hover:translate-x-1"
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
      <div className="border-t border-oak-border p-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/5 transition-all duration-200 cursor-pointer group">
          <div className="h-8 w-8 rounded-full bg-oak-elevated border border-oak-border flex items-center justify-center transition-all duration-300 group-hover:border-primary/25 group-hover:scale-105 group-hover:shadow-glow-sm">
            <span className="text-xs font-semibold text-foreground">AD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
