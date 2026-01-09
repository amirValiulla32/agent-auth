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
import { apiClient } from "@/lib/api/client";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileJson, FileSpreadsheet, Filter, X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertTriangle, MessageCircle } from "lucide-react";
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
        <Skeleton key={i} className="h-16" />
      ))}
    </div>
  );
}

export default function LogsPage() {
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
    // Fetch all filtered logs for export (no pagination)
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

      // CSV header
      const headers = ['Timestamp', 'Agent ID', 'Tool', 'Scope', 'Result', 'Reason', 'Agent Reasoning'];

      // CSV rows (use all filtered logs)
      const rows = response.logs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.agent_id,
        log.tool,
        log.scope,
        log.allowed ? 'Allowed' : 'Denied',
        log.deny_reason || '-',
        log.reasoning || '-'
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download file
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
    // Fetch all filtered logs for export (no pagination)
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

      // Format logs with readable timestamps
      const formattedLogs = response.logs.map(log => ({
        ...log,
        timestamp: new Date(log.timestamp).toISOString(),
        result: log.allowed ? 'Allowed' : 'Denied'
      }));

      // Download file
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
    <div className="flex flex-col h-full">
      <Header
        title="Audit Logs"
        description="Track all agent activity and permission decisions"
        action={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToCSV}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToJSON}>
                <FileJson className="h-4 w-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <div className="flex-1 p-6">
        {/* Filter Controls */}
        {!loading && (
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search logs (agent, tool, scope, reason)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear filters
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filters:</span>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
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
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="allowed">Allowed</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterAgent} onValueChange={setFilterAgent}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  {uniqueAgents.map(agent => (
                    <SelectItem key={agent} value={agent}>
                      {agent.slice(0, 12)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterTool} onValueChange={setFilterTool}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Tool" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tools</SelectItem>
                  {uniqueTools.map(tool => (
                    <SelectItem key={tool} value={tool}>
                      {tool}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterScope} onValueChange={setFilterScope}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scopes</SelectItem>
                  {uniqueScopes.map(scope => (
                    <SelectItem key={scope} value={scope}>
                      {scope}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-sm text-muted-foreground">
                Showing {totalLogs} {totalLogs === 1 ? 'log' : 'logs'}
              </span>
            </div>
          </div>
        )}

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
                  <TableHead>Scope</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Agent Reasoning</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const timestamp = new Date(log.timestamp);

                  // Determine compliance status
                  const isCompliant = log.reasoning_required === 'none' ||
                                     (log.reasoning_required === 'soft' && log.reasoning_provided) ||
                                     (log.reasoning_required === 'hard' && log.reasoning_provided);

                  const showWarning = log.reasoning_required === 'soft' && !log.reasoning_provided;

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
                        <Badge variant="secondary">{log.scope}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.allowed ? "default" : "destructive"}>
                          {log.allowed ? '✓ Allowed' : '✗ Denied'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {showWarning ? (
                          <div className="flex items-center gap-1 text-amber-600" title="Soft requirement: Missing reasoning flagged">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-xs">Flagged</span>
                          </div>
                        ) : log.reasoning_provided ? (
                          <div className="flex items-center gap-1 text-green-600" title="Reasoning provided">
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-xs">Provided</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-md text-sm">
                        {log.reasoning ? (
                          <span className="text-muted-foreground italic">{log.reasoning}</span>
                        ) : log.deny_reason ? (
                          <span className="text-muted-foreground">{log.deny_reason}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            {totalLogs > 0 && (
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows per page:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground ml-4">
                    Showing {startIndex + 1} to {endIndex} of {totalLogs} results
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
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
