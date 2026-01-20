'use client';

import { useState } from 'react';
import { Calendar, TrendingUp, Users, Zap, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { AreaChart } from '@/components-showcase/charts/area-chart';
import { MiniChart, MiniBarChart } from '@/components-showcase/charts/mini-chart';
import { showcaseData } from '@/lib/showcase/mock-data';
import { cn } from '@/lib/utils';

type TimeRange = '7d' | '30d' | '90d' | '1y';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const { requestVolumeData, successRateData, agents, auditLogs } = showcaseData;

  // Calculate metrics
  const totalRequests = auditLogs.length;
  const approvedRequests = auditLogs.filter((l) => l.status === 'approved').length;
  const deniedRequests = auditLogs.filter((l) => l.status === 'denied').length;
  const approvalRate = (approvedRequests / totalRequests) * 100;

  const avgResponseTime = Math.round(
    auditLogs.reduce((sum, log) => sum + log.duration, 0) / auditLogs.length
  );

  // Top performing agents
  const topAgents = [...agents]
    .sort((a, b) => b.requestCount - a.requestCount)
    .slice(0, 5);

  // Request distribution by hour
  const hourlyDistribution = Array.from({ length: 24 }, (_, i) => {
    const count = auditLogs.filter(
      (log) => new Date(log.timestamp).getHours() === i
    ).length;
    return count;
  });

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="mt-2 text-white/60">
            Deep insights into agent performance and request patterns
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] p-1">
          {(['7d', '30d', '90d', '1y'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200',
                timeRange === range
                  ? 'bg-white/[0.08] text-white shadow-lg'
                  : 'text-white/60 hover:text-white'
              )}
            >
              {range === '7d' && 'Last 7 days'}
              {range === '30d' && 'Last 30 days'}
              {range === '90d' && 'Last 90 days'}
              {range === '1y' && 'Last year'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Requests"
          value={totalRequests.toLocaleString()}
          change={24.6}
          icon={Zap}
          color="emerald"
        />
        <MetricCard
          title="Approval Rate"
          value={`${approvalRate.toFixed(1)}%`}
          change={3.2}
          icon={CheckCircle2}
          color="blue"
        />
        <MetricCard
          title="Avg Response Time"
          value={`${avgResponseTime}ms`}
          change={-8.4}
          trend="down"
          icon={Clock}
          color="purple"
        />
        <MetricCard
          title="Active Agents"
          value={agents.filter((a) => a.status === 'active').length.toString()}
          change={12.1}
          icon={Users}
          color="orange"
        />
      </div>

      {/* Main Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Request Volume Over Time */}
        <div className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#1f1f1f] to-[#141414] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Request Volume</h2>
              <p className="mt-1 text-sm text-white/60">Total requests over time</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="font-medium text-emerald-400">+24.6%</span>
            </div>
          </div>

          <div className="mt-6 h-64">
            <AreaChart data={requestVolumeData} color="emerald" showGrid />
          </div>
        </div>

        {/* Success Rate Over Time */}
        <div className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#1f1f1f] to-[#141414] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Success Rate</h2>
              <p className="mt-1 text-sm text-white/60">Approval rate trend</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <span className="font-medium text-blue-400">+3.2%</span>
            </div>
          </div>

          <div className="mt-6 h-64">
            <AreaChart data={successRateData} color="blue" showGrid />
          </div>
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Request Distribution by Hour */}
        <div className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#1f1f1f] to-[#141414] p-6">
          <h2 className="text-lg font-semibold text-white">Request Distribution</h2>
          <p className="mt-1 text-sm text-white/60">By hour of day</p>

          <div className="mt-6 h-32">
            <MiniBarChart data={hourlyDistribution} color="purple" />
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-white/60">Peak Hour</span>
            <span className="font-medium text-white">
              {hourlyDistribution.indexOf(Math.max(...hourlyDistribution))}:00
            </span>
          </div>
        </div>

        {/* Request Status Breakdown */}
        <div className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#1f1f1f] to-[#141414] p-6">
          <h2 className="text-lg font-semibold text-white">Request Status</h2>
          <p className="mt-1 text-sm text-white/60">Status distribution</p>

          <div className="mt-6 space-y-4">
            <StatusBar
              label="Approved"
              count={approvedRequests}
              total={totalRequests}
              color="emerald"
            />
            <StatusBar
              label="Denied"
              count={deniedRequests}
              total={totalRequests}
              color="red"
            />
            <StatusBar
              label="Pending"
              count={totalRequests - approvedRequests - deniedRequests}
              total={totalRequests}
              color="orange"
            />
          </div>
        </div>

        {/* Average Response Time */}
        <div className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#1f1f1f] to-[#141414] p-6">
          <h2 className="text-lg font-semibold text-white">Response Time</h2>
          <p className="mt-1 text-sm text-white/60">Performance metrics</p>

          <div className="mt-6 space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Average</span>
                <span className="font-medium text-white">{avgResponseTime}ms</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                  style={{ width: `${(avgResponseTime / 500) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">P95</span>
                <span className="font-medium text-white">
                  {Math.round(avgResponseTime * 1.5)}ms
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
                  style={{ width: `${((avgResponseTime * 1.5) / 500) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">P99</span>
                <span className="font-medium text-white">
                  {Math.round(avgResponseTime * 2)}ms
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
                  style={{ width: `${((avgResponseTime * 2) / 500) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Agents */}
      <div className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#1f1f1f] to-[#141414] p-6">
        <h2 className="text-lg font-semibold text-white">Top Performing Agents</h2>
        <p className="mt-1 text-sm text-white/60">By request volume</p>

        <div className="mt-6 space-y-4">
          {topAgents.map((agent, index) => (
            <div
              key={agent.id}
              className="flex items-center gap-4 rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 text-lg font-bold text-[#141414]">
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{agent.name}</p>
                <p className="text-sm text-white/60">{agent.id}</p>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-white">
                  {agent.requestCount.toLocaleString()}
                </p>
                <p className="text-sm text-emerald-400">{agent.successRate.toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper Components
function MetricCard({
  title,
  value,
  change,
  trend = 'up',
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  change: number;
  trend?: 'up' | 'down';
  icon: any;
  color: string;
}) {
  const colorClasses = {
    emerald: 'from-emerald-400 to-cyan-400',
    blue: 'from-blue-400 to-cyan-400',
    purple: 'from-purple-400 to-pink-400',
    orange: 'from-orange-400 to-red-400',
  }[color];

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#1f1f1f] to-[#141414] p-6 transition-all duration-300 hover:border-white/[0.12] hover:shadow-xl hover:shadow-white/5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/60">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>
          <div className="mt-2 flex items-center gap-1 text-sm">
            <TrendingUp
              className={cn('h-4 w-4', trend === 'up' ? 'text-emerald-400' : 'text-red-400')}
            />
            <span className={trend === 'up' ? 'text-emerald-400' : 'text-red-400'}>
              {change > 0 ? '+' : ''}
              {change}%
            </span>
          </div>
        </div>

        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br',
            colorClasses
          )}
        >
          <Icon className="h-6 w-6 text-[#141414]" />
        </div>
      </div>
    </div>
  );
}

function StatusBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = (count / total) * 100;

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/60">{label}</span>
        <span className="font-medium text-white">
          {count} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className={`h-full rounded-full bg-${color}-400 transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
