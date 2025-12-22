"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { Log } from "@agent-auth/shared";

interface ActivityFeedProps {
  logs: Log[];
  limit?: number;
}

export function ActivityFeed({ logs, limit = 5 }: ActivityFeedProps) {
  const displayLogs = logs.slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Activity</span>
          <Badge variant="outline" className="font-normal">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activity
          </p>
        ) : (
          displayLogs.map((log) => {
            const initials = log.agent_id.slice(0, 2).toUpperCase();
            const timestamp = new Date(log.timestamp);

            return (
              <div key={log.id} className="flex gap-3 items-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">{log.tool}</span>
                    {' '}
                    <span className="text-muted-foreground">{log.action}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(timestamp, { addSuffix: true })}
                  </p>
                </div>
                <Badge
                  variant={log.allowed ? "default" : "destructive"}
                  className="shrink-0"
                >
                  {log.allowed ? '✓' : '✗'}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
