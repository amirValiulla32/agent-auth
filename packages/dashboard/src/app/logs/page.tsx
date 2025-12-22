'use client';

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClient } from "@/lib/api-client";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { Log } from "@agent-auth/shared";

function LogsLoading() {
  return (
    <div className="space-y-3">
      {[...Array(10)].map((_, i) => (
        <Skeleton key={i} className="h-16" />
      ))}
    </div>
  );
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const data = await apiClient.getLogs(50);
        setLogs(data);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Audit Logs"
        description="Track all agent activity and permission decisions"
        action={
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        }
      />

      <div className="flex-1 p-6">
        {loading ? (
          <LogsLoading />
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg text-muted-foreground">
              No audit logs found
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Tool</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const timestamp = new Date(log.timestamp);
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        <div className="flex flex-col">
                          <span>{formatDistanceToNow(timestamp, { addSuffix: true })}</span>
                          <span className="text-muted-foreground">
                            {format(timestamp, 'MMM d, h:mm a')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.agent_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.tool}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{log.action}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.allowed ? "default" : "destructive"}>
                          {log.allowed ? '✓ Allowed' : '✗ Denied'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {log.deny_reason || '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
