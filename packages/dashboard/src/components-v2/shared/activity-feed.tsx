"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import type { Log } from "@agent-auth/shared";
import { CheckCircle2, XCircle } from "lucide-react";

interface ActivityFeedV2Props {
  logs: Log[];
  limit?: number;
}

export function ActivityFeedV2({ logs, limit = 5 }: ActivityFeedV2Props) {
  const displayLogs = logs.slice(0, limit);

  return (
    <div className="rounded-lg border border-white/8 bg-[#1f1f1f] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold tracking-tight text-white/95">Recent Activity</h2>
        <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-1">
          <div className="h-2 w-2 rounded-full bg-[#34D399] animate-pulse" />
          <span className="text-xs font-medium uppercase tracking-wider text-white/70">Live</span>
        </div>
      </div>

      <div className="space-y-2">
        {displayLogs.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-8">
            No recent activity
          </p>
        ) : (
          displayLogs.map((log) => {
            const initials = log.agent_id.slice(0, 2).toUpperCase();
            const timestamp = new Date(log.timestamp);

            return (
              <div key={log.id} className="flex gap-4 items-start p-3 rounded-lg transition-all duration-200 hover:bg-white/5">
                <Avatar className="h-10 w-10 border border-white/8">
                  <AvatarFallback className="bg-[#2C2C2E] border border-white/8 text-xs font-semibold text-white/95">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="text-sm leading-relaxed">
                    <span className="font-semibold text-white/95">{log.tool}</span>
                    {' '}
                    <span className="text-white/50">{log.scope}</span>
                  </p>
                  <p className="text-xs text-white/50">
                    {formatDistanceToNow(timestamp, { addSuffix: true })}
                  </p>
                </div>
                <div className="shrink-0">
                  {log.allowed ? (
                    <div className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/5 px-2.5 py-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399]" />
                      <span className="text-xs font-medium text-[#34D399]">Allowed</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/5 px-2.5 py-1">
                      <XCircle className="h-3.5 w-3.5 text-[#F87171]" />
                      <span className="text-xs font-medium text-[#F87171]">Denied</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
