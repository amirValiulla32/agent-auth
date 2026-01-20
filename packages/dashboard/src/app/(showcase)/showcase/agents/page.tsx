'use client';

import { useState } from 'react';
import { Plus, Search, Filter, Grid3x3, List } from 'lucide-react';
import { PremiumAgentCard } from '@/components-showcase/shared/premium-agent-card';
import { showcaseData } from '@/lib/showcase/mock-data';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | 'active' | 'idle' | 'error' | 'paused';

export default function AgentsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { agents } = showcaseData;

  const filteredAgents = agents.filter((agent) => {
    const matchesFilter = filter === 'all' || agent.status === filter;
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    all: agents.length,
    active: agents.filter((a) => a.status === 'active').length,
    idle: agents.filter((a) => a.status === 'idle').length,
    error: agents.filter((a) => a.status === 'error').length,
    paused: agents.filter((a) => a.status === 'paused').length,
  };

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Agents</h1>
          <p className="mt-2 text-white/60">
            Manage and monitor your AI agents
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 px-4 py-2.5 font-medium text-[#141414] transition-all duration-200 hover:shadow-lg hover:shadow-emerald-400/20">
          <Plus className="h-4 w-4" />
          New Agent
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.02] pl-10 pr-4 text-sm text-white placeholder:text-white/40 transition-all duration-200 hover:border-white/[0.12] focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] p-1">
          {(['all', 'active', 'idle', 'error', 'paused'] as FilterStatus[]).map((status) => (
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

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.02] p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'rounded-md p-2 transition-all duration-200',
              viewMode === 'grid'
                ? 'bg-white/[0.08] text-white'
                : 'text-white/60 hover:text-white'
            )}
          >
            <Grid3x3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'rounded-md p-2 transition-all duration-200',
              viewMode === 'list'
                ? 'bg-white/[0.08] text-white'
                : 'text-white/60 hover:text-white'
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center gap-2 text-sm text-white/60">
        <Filter className="h-4 w-4" />
        <span>
          Showing {filteredAgents.length} of {agents.length} agents
        </span>
      </div>

      {/* Agents Grid */}
      {viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredAgents.map((agent) => (
            <PremiumAgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAgents.map((agent) => (
            <PremiumAgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredAgents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04]">
            <Search className="h-8 w-8 text-white/40" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-white">No agents found</h3>
          <p className="mt-2 text-sm text-white/60">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
