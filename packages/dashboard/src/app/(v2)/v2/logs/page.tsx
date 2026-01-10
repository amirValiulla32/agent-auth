'use client';

import { useEffect, useState } from "react";
import { HeaderV2 } from "@/components-v2/header";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api/client";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileJson, FileSpreadsheet, Filter, X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertTriangle, MessageCircle, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Log } from "@agent-auth/shared";
import type { DateRange } from "react-day-picker";

function LogsLoading() {
  return (
    <div className="space-y-3">
      {[...Array(10)].map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-xl bg-white/5" />
      ))}
    </div>
  );
}

export default function LogsPageV2() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [filterTool, setFilterTool] = useState<string>('all');
  const [filterScope, setFilterScope] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Unique values for filter dropdowns
  const [uniqueAgents, setUniqueAgents] = useState<string[]>([]);
  const [uniqueTools, setUniqueTools] = useState<string[]>([]);
  const [uniqueScopes, setUniqueScopes] = useState<string[]>([]);

  // Fetch logs with server-side filtering
  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      try {
        const offset = (currentPage - 1) * itemsPerPage;

        // Convert date range to timestamps
        let from_date: number | undefined;
        let to_date: number | undefined;

        if (dateRange?.from) {
          const fromDate = new Date(dateRange.from);
          fromDate.setHours(0, 0, 0, 0);
          from_date = fromDate.getTime();
        }

        if (dateRange?.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          to_date = toDate.getTime();
        }

        const response = await apiClient.getLogs({
          limit: itemsPerPage,
          offset,
          agent_id: filterAgent !== 'all' ? filterAgent : undefined,
          tool: filterTool !== 'all' ? filterTool : undefined,
          scope: filterScope !== 'all' ? filterScope : undefined,
          allowed: filterStatus === 'allowed' ? true : filterStatus === 'denied' ? false : undefined,
          search: searchQuery || undefined,
          from_date,
          to_date,
        });

        setLogs(response.logs);
        setTotalLogs(response.total);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [currentPage, itemsPerPage, searchQuery, filterAgent, filterTool, filterScope, filterStatus, dateRange]);

  // Fetch all logs once to populate filter options
  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        const response = await apiClient.getLogs({ limit: 1000 });
        const allLogs = response.logs;
        setUniqueAgents(Array.from(new Set(allLogs.map(log => log.agent_id))));
        setUniqueTools(Array.from(new Set(allLogs.map(log => log.tool))));
        setUniqueScopes(Array.from(new Set(allLogs.map(log => log.scope))));
      } catch (error) {
        console.error('Failed to fetch filter options:', error);
      }
    }
    fetchFilterOptions();
  }, []);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterAgent('all');
    setFilterTool('all');
    setFilterScope('all');
    setFilterStatus('all');
    setDateRange(undefined);
  };

  const hasActiveFilters = searchQuery || filterAgent !== 'all' || filterTool !== 'all' || filterScope !== 'all' || filterStatus !== 'all' || dateRange?.from || dateRange?.to;

  // Pagination calculations (server-side)
  const totalPages = Math.ceil(totalLogs / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalLogs);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterAgent, filterTool, filterScope, filterStatus, dateRange]);

  const exportToCSV = async () => {
    try {
      const response = await apiClient.getLogs({
        limit: 10000,
        agent_id: filterAgent !== 'all' ? filterAgent : undefined,
        tool: filterTool !== 'all' ? filterTool : undefined,
        scope: filterScope !== 'all' ? filterScope : undefined,
        allowed: filterStatus === 'allowed' ? true : filterStatus === 'denied' ? false : undefined,
        search: searchQuery || undefined,
        from_date: dateRange?.from ? new Date(dateRange.from).setHours(0, 0, 0, 0) : undefined,
        to_date: dateRange?.to ? new Date(dateRange.to).setHours(23, 59, 59, 999) : undefined,
      });

      const headers = ['Timestamp', 'Agent ID', 'Tool', 'Scope', 'Result', 'Reason', 'Agent Reasoning'];
      const rows = response.logs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.agent_id,
        log.tool,
        log.scope,
        log.allowed ? 'Allowed' : 'Denied',
        log.deny_reason || '-',
        log.reasoning || '-'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `audit-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export CSV:', error);
    }
  };

  const exportToJSON = async () => {
    try {
      const response = await apiClient.getLogs({
        limit: 10000,
        agent_id: filterAgent !== 'all' ? filterAgent : undefined,
        tool: filterTool !== 'all' ? filterTool : undefined,
        scope: filterScope !== 'all' ? filterScope : undefined,
        allowed: filterStatus === 'allowed' ? true : filterStatus === 'denied' ? false : undefined,
        search: searchQuery || undefined,
        from_date: dateRange?.from ? new Date(dateRange.from).setHours(0, 0, 0, 0) : undefined,
        to_date: dateRange?.to ? new Date(dateRange.to).setHours(23, 59, 59, 999) : undefined,
      });

      const formattedLogs = response.logs.map(log => ({
        ...log,
        timestamp: new Date(log.timestamp).toISOString(),
        result: log.allowed ? 'Allowed' : 'Denied'
      }));

      const blob = new Blob([JSON.stringify(formattedLogs, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `audit-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export JSON:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#141414]">
      <HeaderV2
        title="Audit Logs"
        description="Track all agent activity and permission decisions"
        action={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-lg border-white/8 bg-white/5 text-white/95 hover:bg-white/10 hover:border-white/15 transition-all duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1f1f1f] border-white/8">
              <DropdownMenuItem onClick={exportToCSV} className="text-white/70 hover:text-white/95 hover:bg-white/5">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToJSON} className="text-white/70 hover:text-white/95 hover:bg-white/5">
                <FileJson className="h-4 w-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <div className="flex-1 p-8">
        {/* Filter Controls */}
        {!loading && (
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search logs (agent, tool, scope, reason)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md rounded-lg border-white/8 bg-white/5 text-white/95 placeholder:text-white/50 focus:border-white/15 focus:ring-2 focus:ring-white/20 transition-all duration-200"
                />
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="rounded-lg text-white/50 hover:text-white/95 hover:bg-white/5 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear filters
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap rounded-lg border border-white/8 bg-[#1f1f1f] p-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-white/50" />
                <span className="text-sm text-white/50">Filters:</span>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal rounded-lg border-white/8 bg-white/5 text-white/95 hover:bg-white/10 hover:border-white/15 transition-all duration-200",
                      !dateRange && "text-white/50"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM d, yyyy")} -{" "}
                          {format(dateRange.to, "MMM d, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM d, yyyy")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#1f1f1f] border-white/8" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    className="text-white"
                  />
                </PopoverContent>
              </Popover>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px] rounded-lg border-white/8 bg-white/5 text-white/95 hover:bg-white/10 transition-all duration-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1f1f1f] border-white/8">
                  <SelectItem value="all" className="text-white/95">All Status</SelectItem>
                  <SelectItem value="allowed" className="text-white/95">Allowed</SelectItem>
                  <SelectItem value="denied" className="text-white/95">Denied</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterAgent} onValueChange={setFilterAgent}>
                <SelectTrigger className="w-[180px] rounded-lg border-white/8 bg-white/5 text-white/95 hover:bg-white/10 transition-all duration-200">
                  <SelectValue placeholder="Agent" />
                </SelectTrigger>
                <SelectContent className="bg-[#1f1f1f] border-white/8">
                  <SelectItem value="all" className="text-white/95">All Agents</SelectItem>
                  {uniqueAgents.map(agent => (
                    <SelectItem key={agent} value={agent} className="text-white/95">
                      {agent.slice(0, 12)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterTool} onValueChange={setFilterTool}>
                <SelectTrigger className="w-[160px] rounded-lg border-white/8 bg-white/5 text-white/95 hover:bg-white/10 transition-all duration-200">
                  <SelectValue placeholder="Tool" />
                </SelectTrigger>
                <SelectContent className="bg-[#1f1f1f] border-white/8">
                  <SelectItem value="all" className="text-white/95">All Tools</SelectItem>
                  {uniqueTools.map(tool => (
                    <SelectItem key={tool} value={tool} className="text-white/95">
                      {tool}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterScope} onValueChange={setFilterScope}>
                <SelectTrigger className="w-[180px] rounded-lg border-white/8 bg-white/5 text-white/95 hover:bg-white/10 transition-all duration-200">
                  <SelectValue placeholder="Scope" />
                </SelectTrigger>
                <SelectContent className="bg-[#1f1f1f] border-white/8">
                  <SelectItem value="all" className="text-white/95">All Scopes</SelectItem>
                  {uniqueScopes.map(scope => (
                    <SelectItem key={scope} value={scope} className="text-white/95">
                      {scope}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-sm text-white/50">
                Showing {totalLogs} {totalLogs === 1 ? 'log' : 'logs'}
              </span>
            </div>
          </div>
        )}

        {loading ? (
          <LogsLoading />
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg text-white/50">
              No audit logs found
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-white/8 bg-[#1f1f1f] overflow-hidden">
            {/* Table Header - Sticky */}
            <div className="sticky top-20 z-10 grid grid-cols-7 gap-4 px-6 py-4 border-b border-white/8 bg-[#1f1f1f]/95 backdrop-blur-xl shadow-sm">
              <div className="text-xs font-medium uppercase tracking-wider text-white/50">Timestamp</div>
              <div className="text-xs font-medium uppercase tracking-wider text-white/50">Agent</div>
              <div className="text-xs font-medium uppercase tracking-wider text-white/50">Tool</div>
              <div className="text-xs font-medium uppercase tracking-wider text-white/50">Scope</div>
              <div className="text-xs font-medium uppercase tracking-wider text-white/50">Result</div>
              <div className="text-xs font-medium uppercase tracking-wider text-white/50">Compliance</div>
              <div className="text-xs font-medium uppercase tracking-wider text-white/50">Reasoning</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-white/5">
              {logs.map((log) => {
                const timestamp = new Date(log.timestamp);
                const isCompliant = log.reasoning_required === 'none' ||
                                   (log.reasoning_required === 'soft' && log.reasoning_provided) ||
                                   (log.reasoning_required === 'hard' && log.reasoning_provided);
                const showWarning = log.reasoning_required === 'soft' && !log.reasoning_provided;

                return (
                  <div
                    key={log.id}
                    className="grid grid-cols-7 gap-4 px-6 py-4 hover:bg-white/5 transition-all duration-150 hover:scale-[1.001] will-change-transform"
                  >
                    <div className="flex flex-col font-mono text-xs text-white/70">
                      <span className="text-white/95">{formatDistanceToNow(timestamp, { addSuffix: true })}</span>
                      <span className="text-white/50 mt-0.5">
                        {format(timestamp, 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <div className="flex items-center font-mono text-sm text-white/95">
                      {log.agent_id.slice(0, 8)}...
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center rounded-lg border border-white/8 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70 transition-all duration-150 hover:bg-white/10 hover:border-white/15">
                        {log.tool}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center rounded-lg border border-white/8 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70 transition-all duration-150 hover:bg-white/10 hover:border-white/15">
                        {log.scope}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {log.allowed ? (
                        <div className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/5 px-2.5 py-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399]" />
                          <span className="text-xs font-medium text-[#34D399]">Allowed</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/5 px-2.5 py-1">
                          <XCircle className="h-3.5 w-3.5 text-[#F87171]" />
                          <span className="text-xs font-medium text-[#F87171]">Denied</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center">
                      {showWarning ? (
                        <div className="flex items-center gap-1.5 text-[#FBBF24]" title="Soft requirement: Missing reasoning flagged">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">Flagged</span>
                        </div>
                      ) : log.reasoning_provided ? (
                        <div className="flex items-center gap-1.5 text-[#34D399]" title="Reasoning provided">
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">Provided</span>
                        </div>
                      ) : (
                        <span className="text-xs text-white/50">-</span>
                      )}
                    </div>
                    <div className="flex items-center text-sm">
                      {log.reasoning ? (
                        <span className="text-white/70 italic line-clamp-2">{log.reasoning}</span>
                      ) : log.deny_reason ? (
                        <span className="text-white/70 line-clamp-2">{log.deny_reason}</span>
                      ) : (
                        <span className="text-white/50">-</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalLogs > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/8 bg-white/5">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-white/50">Rows per page:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[70px] rounded-lg border-white/8 bg-white/5 text-white/95">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1f1f1f] border-white/8">
                      <SelectItem value="5" className="text-white/95">5</SelectItem>
                      <SelectItem value="10" className="text-white/95">10</SelectItem>
                      <SelectItem value="20" className="text-white/95">20</SelectItem>
                      <SelectItem value="50" className="text-white/95">50</SelectItem>
                      <SelectItem value="100" className="text-white/95">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-white/50 ml-4">
                    Showing {startIndex + 1} to {endIndex} of {totalLogs} results
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-lg border-white/8 bg-white/5 text-white/95 hover:bg-white/10 hover:border-white/15 disabled:opacity-30 transition-all duration-200"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-white/50 px-3">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="rounded-lg border-white/8 bg-white/5 text-white/95 hover:bg-white/10 hover:border-white/15 disabled:opacity-30 transition-all duration-200"
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
    </div>
  );
}
