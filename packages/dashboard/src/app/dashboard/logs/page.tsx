'use client';

import { useState, useCallback } from "react";
import { HeaderV2 } from "@/components-v2/header";
import { SeverityBadge } from "@/components-v2/shared/severity-badge";
import { LogDetailDrawer } from "@/components-v2/shared/log-detail-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboardLogs } from "@/lib/hooks/use-data-provider";
import { useAuth } from "@/lib/auth";
import { useDataProvider } from "@/lib/hooks/use-data-provider";
import { toast } from "@/hooks/use-toast";
import {
  Download, Filter, X, ChevronLeft, ChevronRight, ScrollText,
} from "lucide-react";
import type { AuditLogEvent, LogFilters, Severity } from "@/types";

export default function LogsPage() {
  const { can } = useAuth();
  const provider = useDataProvider();

  // Filters
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<string>('all');
  const [actorType, setActorType] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Drawer
  const [selectedEvent, setSelectedEvent] = useState<AuditLogEvent | null>(null);

  const filters: LogFilters = {
    search: search || undefined,
    severity: severity !== 'all' ? severity as Severity : undefined,
    actorType: actorType !== 'all' ? actorType as 'user' | 'agent' : undefined,
    page,
    pageSize,
  };

  const { logs, total, loading } = useDashboardLogs(filters);

  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);

  const hasActiveFilters = search || severity !== 'all' || actorType !== 'all';

  const clearFilters = () => {
    setSearch('');
    setSeverity('all');
    setActorType('all');
    setPage(1);
  };

  const handleExport = useCallback(async () => {
    try {
      const events = await provider.exportLogs(filters);
      const csvHeaders = ['ID', 'Timestamp', 'Action', 'Severity', 'Actor Type', 'Actor ID', 'Agent ID', 'IP'];
      const csvRows = events.map((e) => [
        e.id,
        new Date(e.timestamp).toISOString(),
        e.action,
        e.severity,
        e.actorType,
        e.actorId,
        e.agentId ?? '',
        e.ip,
      ]);
      const csv = [csvHeaders.join(','), ...csvRows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Logs exported' });
    } catch {
      toast({ title: 'Export failed', variant: 'destructive' });
    }
  }, [provider, filters]);

  return (
    <div className="flex flex-col h-full bg-[#141414]">
      <HeaderV2
        title="Audit Logs"
        description="Track all agent activity and permission decisions"
        action={
          can('export_logs') ? (
            <Button
              variant="outline"
              onClick={handleExport}
              className="rounded-lg border-white/8 bg-white/5 text-white/95 hover:bg-white/10 hover:border-white/15 transition-all duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          ) : undefined
        }
      />

      <div className="flex-1 p-8">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by action or actor..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="max-w-md rounded-lg border-white/8 bg-white/5 text-white/95 placeholder:text-white/30 focus:border-white/15 transition-all duration-200"
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-white/50 hover:text-white/95 hover:bg-white/5"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap rounded-lg border border-white/8 bg-[#1f1f1f] p-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-white/50" />
              <span className="text-sm text-white/50">Filters:</span>
            </div>

            <Select value={severity} onValueChange={(v) => { setSeverity(v); setPage(1); }}>
              <SelectTrigger className="w-[130px] rounded-lg border-white/8 bg-white/5 text-white/95 hover:bg-white/10 transition-all duration-200">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent className="bg-[#1f1f1f] border-white/8">
                <SelectItem value="all" className="text-white/95">All Severity</SelectItem>
                <SelectItem value="info" className="text-white/95">Info</SelectItem>
                <SelectItem value="warn" className="text-white/95">Warning</SelectItem>
                <SelectItem value="critical" className="text-white/95">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={actorType} onValueChange={(v) => { setActorType(v); setPage(1); }}>
              <SelectTrigger className="w-[140px] rounded-lg border-white/8 bg-white/5 text-white/95 hover:bg-white/10 transition-all duration-200">
                <SelectValue placeholder="Actor Type" />
              </SelectTrigger>
              <SelectContent className="bg-[#1f1f1f] border-white/8">
                <SelectItem value="all" className="text-white/95">All Actors</SelectItem>
                <SelectItem value="user" className="text-white/95">User</SelectItem>
                <SelectItem value="agent" className="text-white/95">Agent</SelectItem>
              </SelectContent>
            </Select>

            <span className="text-sm text-white/50 ml-auto">
              {total} {total === 1 ? 'event' : 'events'}
            </span>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg bg-white/5" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/30">
            <ScrollText className="h-10 w-10 mb-3" />
            <p className="text-sm">No logs found</p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/8 bg-[#1f1f1f] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Timestamp</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Action</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Severity</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Actor</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Agent</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((event) => (
                  <tr
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-white/80">{new Date(event.timestamp).toLocaleDateString()}</span>
                        <span className="text-[10px] text-white/40">{new Date(event.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white/90 font-mono">{event.action}</span>
                    </td>
                    <td className="px-6 py-4">
                      <SeverityBadge variant={event.severity} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <SeverityBadge
                          variant={event.actorType === 'agent' ? 'info' : 'dev'}
                          label={event.actorType}
                        />
                        <span className="text-xs text-white/50 font-mono">{event.actorId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-white/50 font-mono">{event.agentId ?? '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-white/40 font-mono">{event.ip}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {total > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-white/50">Rows per page:</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}
                  >
                    <SelectTrigger className="w-[70px] rounded-lg border-white/8 bg-white/5 text-white/95">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1f1f1f] border-white/8">
                      <SelectItem value="10" className="text-white/95">10</SelectItem>
                      <SelectItem value="20" className="text-white/95">20</SelectItem>
                      <SelectItem value="50" className="text-white/95">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-white/50">
                    {startIndex + 1}–{endIndex} of {total}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="rounded-lg border-white/8 bg-white/5 text-white/95 hover:bg-white/10 disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Prev
                  </Button>
                  <span className="text-xs text-white/50 px-2">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    className="rounded-lg border-white/8 bg-white/5 text-white/95 hover:bg-white/10 disabled:opacity-30"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <LogDetailDrawer
        event={selectedEvent}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
