'use client';

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Search,
  CornerDownLeft,
  LayoutDashboard,
  Bot,
  ScrollText,
  Plus,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import type { Agent, Log } from "@agent-auth/shared";
import { cn } from "@/lib/utils";

interface Item {
  key: string;
  label: string;
  sublabel?: string;
  href: string;
  icon: React.ReactNode;
}

const NAV: Item[] = [
  { key: "nav-dashboard", label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { key: "nav-agents", label: "Agents", href: "/dashboard/agents", icon: <Bot className="h-4 w-4" /> },
  { key: "nav-logs", label: "Audit logs", href: "/dashboard/logs", icon: <ScrollText className="h-4 w-4" /> },
  { key: "nav-create", label: "Create agent", href: "/dashboard/agents?new=1", icon: <Plus className="h-4 w-4" /> },
];

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <div className="px-4 py-1.5 text-[10px] font-medium uppercase tracking-wider text-white/30">{title}</div>
      {children}
    </div>
  );
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [logHits, setLogHits] = useState<Log[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global ⌘K / Ctrl+K to toggle, Esc to close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Reset and load agents whenever the palette opens.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    apiClient.getAgents().then(setAgents).catch(() => {});
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  // Server-side log search, debounced.
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (!q) { setLogHits([]); return; }
    const t = setTimeout(() => {
      apiClient.getLogs({ search: q, limit: 6 }).then((r) => setLogHits(r.logs)).catch(() => setLogHits([]));
    }, 200);
    return () => clearTimeout(t);
  }, [query, open]);

  const q = query.trim().toLowerCase();
  const navItems = NAV.filter((n) => !q || n.label.toLowerCase().includes(q));
  const agentItems: Item[] = agents
    .filter((a) => !q || a.name.toLowerCase().includes(q))
    .slice(0, 6)
    .map((a) => ({
      key: `agent-${a.id}`,
      label: a.name,
      sublabel: a.enabled ? "Agent" : "Disabled agent",
      href: "/dashboard/agents",
      icon: <Bot className="h-4 w-4" />,
    }));
  const logItems: Item[] = logHits.map((l) => ({
    key: `log-${l.id}`,
    label: `${l.tool}:${l.scope}`,
    sublabel: l.allowed ? "Allowed" : `Denied${l.deny_reason ? ` — ${l.deny_reason}` : ""}`,
    href: "/dashboard/logs",
    icon: <ScrollText className="h-4 w-4" />,
  }));

  const results = [...navItems, ...agentItems, ...logItems];
  const clampedActive = Math.min(active, Math.max(results.length - 1, 0));

  const select = useCallback((item?: Item) => {
    if (!item) return;
    setOpen(false);
    router.push(item.href);
  }, [router]);

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      select(results[clampedActive]);
    }
  };

  const renderItem = (item: Item, idx: number) => (
    <button
      key={item.key}
      type="button"
      onClick={() => select(item)}
      onMouseEnter={() => setActive(idx)}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
        idx === clampedActive ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
      )}
    >
      <span className="text-white/40 shrink-0">{item.icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] text-white/90">{item.label}</span>
        {item.sublabel && <span className="block truncate text-[11px] text-white/35">{item.sublabel}</span>}
      </span>
      {idx === clampedActive && <CornerDownLeft className="h-3.5 w-3.5 text-white/30 shrink-0" />}
    </button>
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Search (Ctrl+K)"
        className="h-10 w-10 rounded-lg text-white/50 hover:text-white/95 hover:bg-white/5 transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <Search className="h-5 w-5" />
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0f0d] shadow-2xl shadow-black/60">
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-4">
              <Search className="h-4 w-4 text-white/40 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActive(0); }}
                onKeyDown={onInputKey}
                placeholder="Search agents, logs, and pages…"
                className="w-full bg-transparent py-4 text-sm text-white/95 placeholder:text-white/30 focus:outline-none"
              />
              <kbd className="hidden sm:inline-block rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/40">Esc</kbd>
            </div>

            <div className="max-h-[50vh] overflow-y-auto py-2">
              {results.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-white/40">
                  No results for &ldquo;{query}&rdquo;
                </div>
              ) : (
                <>
                  {navItems.length > 0 && (
                    <Group title="Navigation">
                      {navItems.map((it, i) => renderItem(it, i))}
                    </Group>
                  )}
                  {agentItems.length > 0 && (
                    <Group title="Agents">
                      {agentItems.map((it, i) => renderItem(it, navItems.length + i))}
                    </Group>
                  )}
                  {logItems.length > 0 && (
                    <Group title="Logs">
                      {logItems.map((it, i) => renderItem(it, navItems.length + agentItems.length + i))}
                    </Group>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-4 border-t border-white/[0.06] px-4 py-2.5 text-[10px] text-white/30">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5">↑</kbd>
                <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5">↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5">↵</kbd>
                select
              </span>
              <span className="ml-auto flex items-center gap-1">
                <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5">⌘K</kbd>
                toggle
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
