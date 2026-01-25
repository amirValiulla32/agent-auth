"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import type { Log } from "@agent-auth/shared";
import { CheckCircle2, XCircle } from "lucide-react";
import { useEntranceAnimation, getStaggerDelay } from "@/lib/animation-utils";

interface ActivityFeedV2Props {
  logs: Log[];
  limit?: number;
}

function ActivityItem({ log, index }: { log: Log; index: number }) {
  const isVisible = useEntranceAnimation(getStaggerDelay(index, 50));
  const initials = log.agent_id.slice(0, 2).toUpperCase();
  const timestamp = new Date(log.timestamp);

  return (
    <div
      className="flex gap-4 items-start p-3 rounded-lg transition-all duration-200 hover:bg-primary/5 hover:scale-[1.01] will-change-transform"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(-10px)',
        transition: `opacity 300ms ease-out ${getStaggerDelay(index, 50)}ms, transform 300ms ease-out ${getStaggerDelay(index, 50)}ms`,
      }}
    >
      <Avatar className="h-10 w-10 border border-oak-border ring-2 ring-transparent transition-all duration-200 hover:ring-primary/15">
        <AvatarFallback className="bg-oak-elevated border border-oak-border text-xs font-semibold text-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0 space-y-1.5">
        <p className="text-sm leading-relaxed">
          <span className="font-semibold text-foreground">{log.tool}</span>
          {' '}
          <span className="text-muted-foreground">{log.scope}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </p>
      </div>
      <div className="shrink-0">
        {log.allowed ? (
          <div className="flex items-center gap-1.5 rounded-full border border-oak-border bg-oak-surface px-2.5 py-1 transition-all duration-200 hover:bg-success/10 hover:border-success/30 hover:shadow-glow-success">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            <span className="text-xs font-medium text-success">Allowed</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 rounded-full border border-oak-border bg-oak-surface px-2.5 py-1 transition-all duration-200 hover:bg-destructive/10 hover:border-destructive/30 hover:shadow-glow-destructive">
            <XCircle className="h-3.5 w-3.5 text-destructive" />
            <span className="text-xs font-medium text-destructive">Denied</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ActivityFeedV2({ logs, limit = 5 }: ActivityFeedV2Props) {
  const displayLogs = logs.slice(0, limit);

  return (
    <div className="rounded-xl border border-oak-border bg-oak-surface/80 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Recent Activity</h2>
        <div className="flex items-center gap-2 rounded-full border border-oak-border bg-oak-surface px-3 py-1">
          <div className="relative h-2 w-2">
            <div className="absolute inset-0 rounded-full bg-primary animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Live</span>
        </div>
      </div>

      <div className="space-y-2">
        {displayLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No recent activity
          </p>
        ) : (
          displayLogs.map((log, index) => (
            <ActivityItem key={log.id} log={log} index={index} />
          ))
        )}
      </div>
    </div>
  );
}
