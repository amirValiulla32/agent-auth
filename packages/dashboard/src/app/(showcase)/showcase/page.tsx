'use client';

import { Bot, Zap, Activity, Clock } from 'lucide-react';
import { PremiumStatCard } from '@/components-showcase/shared/premium-stat-card';
import { ActivityTimeline } from '@/components-showcase/shared/activity-timeline';
import { MiniChart } from '@/components-showcase/charts/mini-chart';
import { showcaseData } from '@/lib/showcase/mock-data';

export default function ShowcaseDashboard() {
  const { stats, activityEvents, requestVolumeData, agents } = showcaseData;

  // Generate sparkline data for each stat
  const agentSparkline = requestVolumeData.slice(-15).map(d => d.value / 10);
  const requestSparkline = requestVolumeData.slice(-15).map(d => d.value);

  // Active agents
  const activeAgents = agents.filter(a => a.status === 'active').length;

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-white/60">
          Welcome back. Here's what's happening with your agents today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <PremiumStatCard
          title="Total Agents"
          value={stats.totalAgents}
          change={stats.agentGrowth}
          trend="up"
          icon={Bot}
          iconColor="emerald"
          sparklineData={agentSparkline}
        />
        <PremiumStatCard
          title="Total Requests"
          value={`${(stats.totalRequests / 1000).toFixed(1)}K`}
          change={stats.requestGrowth}
          trend="up"
          icon={Zap}
          iconColor="blue"
          sparklineData={requestSparkline}
        />
        <PremiumStatCard
          title="Active Agents"
          value={activeAgents}
          suffix={`/ ${stats.totalAgents}`}
          icon={Activity}
          iconColor="purple"
        />
        <PremiumStatCard
          title="Avg Response"
          value={stats.avgResponseTime}
          suffix="ms"
          icon={Clock}
          iconColor="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Request Volume Chart */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#1f1f1f] to-[#141414] p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Request Volume</h2>
                <p className="mt-1 text-sm text-white/60">Last 30 days</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-sm text-white/60">
                  Daily
                </div>
              </div>
            </div>

            <div className="mt-8 h-64">
              <RequestVolumeChart data={requestVolumeData} />
            </div>

            {/* Mini stats below chart */}
            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/[0.08] pt-6">
              <div>
                <p className="text-sm text-white/60">Peak</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {Math.max(...requestVolumeData.map(d => d.value))}
                </p>
              </div>
              <div>
                <p className="text-sm text-white/60">Average</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {Math.round(requestVolumeData.reduce((sum, d) => sum + d.value, 0) / requestVolumeData.length)}
                </p>
              </div>
              <div>
                <p className="text-sm text-white/60">Today</p>
                <p className="mt-1 text-2xl font-bold text-emerald-400">
                  {requestVolumeData[requestVolumeData.length - 1].value}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Status Overview */}
        <div className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#1f1f1f] to-[#141414] p-6">
          <h2 className="text-lg font-semibold text-white">Agent Status</h2>
          <p className="mt-1 text-sm text-white/60">Current distribution</p>

          <div className="mt-6 space-y-4">
            {[
              { status: 'Active', count: agents.filter(a => a.status === 'active').length, color: 'emerald', percentage: (agents.filter(a => a.status === 'active').length / agents.length) * 100 },
              { status: 'Idle', count: agents.filter(a => a.status === 'idle').length, color: 'blue', percentage: (agents.filter(a => a.status === 'idle').length / agents.length) * 100 },
              { status: 'Error', count: agents.filter(a => a.status === 'error').length, color: 'red', percentage: (agents.filter(a => a.status === 'error').length / agents.length) * 100 },
              { status: 'Paused', count: agents.filter(a => a.status === 'paused').length, color: 'orange', percentage: (agents.filter(a => a.status === 'paused').length / agents.length) * 100 },
            ].map((item) => (
              <div key={item.status}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">{item.status}</span>
                  <span className="font-medium text-white">{item.count}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className={`h-full rounded-full bg-${item.color}-400 transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* System Health */}
          <div className="mt-6 rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-sm font-medium text-white">All Systems Operational</span>
            </div>
            <p className="mt-2 text-xs text-white/60">
              {stats.uptime}% uptime in the last 30 days
            </p>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#1f1f1f] to-[#141414] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            <p className="mt-1 text-sm text-white/60">Live updates from your agents</p>
          </div>
          <button className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white">
            View All
          </button>
        </div>

        <div className="mt-6">
          <ActivityTimeline events={activityEvents} maxItems={8} />
        </div>
      </div>
    </div>
  );
}

// Request Volume Chart Component
function RequestVolumeChart({ data }: { data: { timestamp: Date; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min;

  const width = 100;
  const height = 100;
  const padding = 5;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
    const y = height - padding - ((d.value - min) / range) * (height - 2 * padding);
    return { x, y };
  });

  const linePath = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
  const areaPath = `${linePath} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;

  return (
    <div className="relative h-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full"
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={y}
            x1={padding}
            y1={y}
            x2={width - padding}
            y2={y}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="0.5"
          />
        ))}

        {/* Area gradient */}
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(52, 211, 153)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(52, 211, 153)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area */}
        <path d={areaPath} fill="url(#areaGradient)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="rgb(52, 211, 153)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="2"
            fill="rgb(52, 211, 153)"
            className="transition-all hover:r-3"
          />
        ))}
      </svg>
    </div>
  );
}
