'use client';

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, XCircle, ArrowRight } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { formatDistanceToNow } from "date-fns";
import type { Log } from "@agent-auth/shared";

// Persisted marker of the last time the user opened the panel, so the badge
// only counts denials they haven't seen yet.
const SEEN_KEY = "oakauth_notifs_seen";

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [denials, setDenials] = useState<Log[]>([]);
  const [agentNames, setAgentNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [lastSeen, setLastSeen] = useState(0);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(SEEN_KEY) : null;
    setLastSeen(raw ? Number(raw) : 0);
  }, []);

  const loadDenials = useCallback(async () => {
    setLoading(true);
    try {
      const [logsRes, agents] = await Promise.all([
        apiClient.getLogs({ allowed: false, limit: 20 }),
        apiClient.getAgents(),
      ]);
      const map: Record<string, string> = {};
      agents.forEach((a) => { map[a.id] = a.name; });
      setAgentNames(map);
      setDenials(logsRes.logs);
    } catch {
      // Header notifications are best-effort — fail quietly.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDenials(); }, [loadDenials]);

  const unread = denials.filter((d) => d.timestamp > lastSeen).length;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      loadDenials();
      const now = Date.now();
      localStorage.setItem(SEEN_KEY, String(now));
      setLastSeen(now);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
          className="h-10 w-10 rounded-lg text-white/50 hover:text-white/95 hover:bg-white/5 relative transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#F87171] px-1 text-[10px] font-semibold text-[#090c0a]">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 p-0 rounded-xl border-white/[0.08] bg-[#0c0f0d] text-white shadow-xl shadow-black/40"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <span className="text-sm font-semibold text-white/95">Notifications</span>
          <span className="text-xs text-white/40">Denied requests</span>
        </div>

        <div className="max-h-[360px] overflow-y-auto">
          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-white/40">Loading…</div>
          ) : denials.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-white/70">You&apos;re all clear</p>
              <p className="text-xs text-white/40 mt-1">No denied requests yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.05]">
              {denials.map((d) => (
                <li key={d.id} className="px-4 py-3 hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-start gap-2.5">
                    <XCircle className="h-4 w-4 text-[#F87171] mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-white/90">
                        <span className="font-medium">{agentNames[d.agent_id] || "Unknown agent"}</span>
                        {" was denied "}
                        <span className="font-mono text-white/70">{d.tool}:{d.scope}</span>
                      </p>
                      {d.deny_reason && (
                        <p className="text-xs text-white/45 mt-0.5 line-clamp-2">{d.deny_reason}</p>
                      )}
                      <p className="text-[11px] text-white/30 mt-1">
                        {formatDistanceToNow(new Date(d.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link
          href="/dashboard/logs"
          onClick={() => setOpen(false)}
          className="flex items-center justify-center gap-1.5 px-4 py-3 border-t border-white/[0.06] text-xs font-medium text-[#22c55e] hover:bg-white/[0.03] transition-colors"
        >
          View all in audit logs
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </PopoverContent>
    </Popover>
  );
}
