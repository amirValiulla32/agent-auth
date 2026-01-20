'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  Eye,
} from 'lucide-react';
import { showcaseData, RequestStatus } from '@/lib/showcase/mock-data';
import { cn } from '@/lib/utils';

type FilterType = 'all' | RequestStatus;

export default function LogsPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<string | null>(null);

  const { auditLogs } = showcaseData;

  const filteredLogs = auditLogs.filter((log) => {
    const matchesFilter = filter === 'all' || log.status === filter;
    const matchesSearch =
      log.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    all: auditLogs.length,
    approved: auditLogs.filter((l) => l.status === 'approved').length,
    denied: auditLogs.filter((l) => l.status === 'denied').length,
    pending: auditLogs.filter((l) => l.status === 'pending').length,
  };

  const statusConfig = {
    approved: {
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/20',
    },
    denied: {
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      border: 'border-red-400/20',
    },
    pending: {
      icon: Clock,
      color: 'text-orange-400',
      bg: 'bg-orange-400/10',
      border: 'border-orange-400/20',
    },
  };

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
          <p className="mt-2 text-white/60">
            Complete history of agent requests and decisions
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 font-medium text-white transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04]">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.02] pl-10 pr-4 text-sm text-white placeholder:text-white/40 transition-all duration-200 hover:border-white/[0.12] focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] p-1">
          {(['all', 'approved', 'denied', 'pending'] as FilterType[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-all duration-200',
                filter === status
                  ? 'bg-white/[0.08] text-white shadow-lg'
                  : 'text-white/60 hover:text-white'
              )}
            >
              {status}
              <span className="ml-1.5 text-xs text-white/40">
                {statusCounts[status]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center gap-2 text-sm text-white/60">
        <Filter className="h-4 w-4" />
        <span>
          Showing {filteredLogs.length} of {auditLogs.length} logs
        </span>
      </div>

      {/* Logs Timeline */}
      <div className="space-y-3">
        {filteredLogs.slice(0, 50).map((log) => {
          const config = statusConfig[log.status];
          const StatusIcon = config.icon;
          const isExpanded = selectedLog === log.id;

          return (
            <div
              key={log.id}
              className={cn(
                'overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#1f1f1f] to-[#141414] transition-all duration-300',
                isExpanded && 'border-white/[0.12] shadow-xl shadow-white/5'
              )}
            >
              {/* Main Row */}
              <div className="flex items-center gap-4 p-4">
                {/* Status Icon */}
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', config.bg)}>
                  <StatusIcon className={cn('h-5 w-5', config.color)} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{log.agentName}</span>
                    <span className="text-white/40">→</span>
                    <code className="text-sm text-emerald-400">{log.action}</code>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-sm text-white/60">
                    <span>{format(log.timestamp, 'MMM d, yyyy HH:mm:ss')}</span>
                    <span>•</span>
                    <span>{log.duration}ms</span>
                    <span>•</span>
                    <span className="font-mono text-xs">{log.id}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className={cn('rounded-lg border px-3 py-1.5', config.bg, config.border)}>
                  <span className={cn('text-sm font-medium capitalize', config.color)}>
                    {log.status}
                  </span>
                </div>

                {/* Expand Button */}
                <button
                  onClick={() => setSelectedLog(isExpanded ? null : log.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition-all duration-200 hover:bg-white/[0.08] hover:text-white"
                >
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform duration-200',
                      isExpanded && 'rotate-180'
                    )}
                  />
                </button>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-white/[0.08] bg-white/[0.02] p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Reasoning */}
                    <div>
                      <h4 className="text-sm font-medium text-white">Reasoning</h4>
                      <p className="mt-2 text-sm text-white/80 leading-relaxed">
                        {log.reasoning}
                      </p>
                    </div>

                    {/* Metadata */}
                    <div>
                      <h4 className="text-sm font-medium text-white">Metadata</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">IP Address</span>
                          <code className="text-white/80">{log.metadata?.ip}</code>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">User Agent</span>
                          <code className="text-white/80">{log.metadata?.userAgent}</code>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Resource</span>
                          <code className="text-emerald-400">{log.resource}</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredLogs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04]">
            <Search className="h-8 w-8 text-white/40" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-white">No logs found</h3>
          <p className="mt-2 text-sm text-white/60">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Load More */}
      {filteredLogs.length > 50 && (
        <div className="flex justify-center pt-4">
          <button className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-6 py-3 font-medium text-white transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04]">
            Load More Logs
          </button>
        </div>
      )}
    </div>
  );
}
