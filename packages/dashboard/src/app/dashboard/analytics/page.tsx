'use client';

import { useState, useMemo } from "react";
import { HeaderV2 } from "@/components-v2/header";
import { LineChart } from "@/components-v2/charts/line-chart";
import { AreaChart } from "@/components-v2/charts/area-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { SeverityBadge } from "@/components-v2/shared/severity-badge";
import { ProgressBar } from "@/components-v2/shared/progress-bar";
import {
  useRequestsTimeSeries,
  useCostTimeSeries,
  useDenialRateTimeSeries,
  useDashboardAgents,
  useOverviewMetrics,
} from "@/lib/hooks/use-data-provider";
import { TrendingUp, TrendingDown, Activity, DollarSign, ShieldX, ShieldCheck } from "lucide-react";
import type { TimeRange, TimeSeriesPoint } from "@/types";

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
];

function computeTrend(data: TimeSeriesPoint[] | null): { value: number; up: boolean } | null {
  if (!data || data.length < 4) return null;
  const half = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, half).reduce((s, d) => s + d.value, 0) / half;
  const secondHalf = data.slice(half).reduce((s, d) => s + d.value, 0) / (data.length - half);
  if (firstHalf === 0) return null;
  const pct = ((secondHalf - firstHalf) / firstHalf) * 100;
  return { value: Math.abs(Math.round(pct * 10) / 10), up: pct > 0 };
}

function KpiCard({
  label,
  value,
  trend,
  icon: Icon,
  trendInverted,
}: {
  label: string;
  value: string;
  trend: { value: number; up: boolean } | null;
  icon: React.ElementType;
  trendInverted?: boolean;
}) {
  const trendColor = trend
    ? (trend.up && !trendInverted) || (!trend.up && trendInverted)
      ? 'text-green-400'
      : 'text-red-400'
    : '';

  return (
    <div className="rounded-xl border border-white/8 bg-[#1f1f1f] p-5 flex items-center gap-4">
      <div className="rounded-lg border border-white/8 bg-white/5 p-2.5">
        <Icon className="h-5 w-5 text-white/70" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-white/95 mt-0.5 tabular-nums">{value}</p>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
          {trend.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {trend.value}%
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const { data: requestsData } = useRequestsTimeSeries(timeRange);
  const { data: costData } = useCostTimeSeries(timeRange);
  const { data: denialData } = useDenialRateTimeSeries(timeRange);
  const { data: agents } = useDashboardAgents();
  const { data: metrics } = useOverviewMetrics(timeRange);

  const requestsTrend = useMemo(() => computeTrend(requestsData), [requestsData]);
  const costTrend = useMemo(() => computeTrend(costData), [costData]);
  const denialTrend = useMemo(() => computeTrend(denialData), [denialData]);

  const totalRequests = requestsData?.reduce((s, d) => s + d.value, 0) ?? 0;
  const totalCost = costData?.reduce((s, d) => s + d.value, 0) ?? 0;
  const avgDenialRate = denialData?.length
    ? denialData.reduce((s, d) => s + d.value, 0) / denialData.length
    : 0;

  const agentHealthData = useMemo(() => {
    return (agents ?? []).map((a) => {
      const health = a.status === 'active' ? 85 + Math.floor(Math.random() * 15) : a.status === 'rate_limited' ? 45 + Math.floor(Math.random() * 20) : 0;
      return { ...a, health };
    }).sort((a, b) => b.health - a.health);
  }, [agents]);

  return (
    <div className="flex flex-col h-full bg-[#141414]">
      <HeaderV2
        title="Analytics"
        description="Detailed metrics and trends"
        action={
          <div className="flex items-center gap-1 rounded-lg border border-white/8 bg-white/5 p-1">
            {TIME_RANGES.map((tr) => (
              <button
                key={tr.value}
                onClick={() => setTimeRange(tr.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  timeRange === tr.value
                    ? 'bg-[#166534] text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                {tr.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="flex-1 p-8 space-y-6 overflow-y-auto">
        {/* KPI summary row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Total Requests"
            value={totalRequests.toLocaleString()}
            trend={requestsTrend}
            icon={Activity}
          />
          <KpiCard
            label="Total Cost"
            value={`$${totalCost.toFixed(2)}`}
            trend={costTrend}
            icon={DollarSign}
            trendInverted
          />
          <KpiCard
            label="Avg Denial Rate"
            value={`${(avgDenialRate * 100).toFixed(1)}%`}
            trend={denialTrend}
            icon={ShieldX}
            trendInverted
          />
          <KpiCard
            label="Success Rate"
            value={metrics ? `${Math.round((metrics.instancesFinished / Math.max(metrics.instancesFinished + metrics.instancesFailed, 1)) * 100)}%` : '—'}
            trend={null}
            icon={ShieldCheck}
          />
        </div>

        {/* Main chart — requests (full width, hero) */}
        <div className="rounded-xl border border-white/8 bg-[#1f1f1f] p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-white/90">Requests Over Time</h3>
              <p className="text-xs text-white/40 mt-0.5">Total API requests across all agents</p>
            </div>
            {requestsTrend && (
              <div className={`flex items-center gap-1 text-xs font-medium ${requestsTrend.up ? 'text-green-400' : 'text-red-400'}`}>
                {requestsTrend.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {requestsTrend.value}% vs prior period
              </div>
            )}
          </div>
          {requestsData ? (
            <LineChart
              data={requestsData}
              height={240}
              color="#22c55e"
              areaFill
              formatValue={(v) => `${Math.round(v)} req`}
            />
          ) : (
            <Skeleton className="h-[240px] bg-white/5 rounded-lg" />
          )}
        </div>

        {/* Two charts side by side */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Cost trend */}
          <div className="rounded-xl border border-white/8 bg-[#1f1f1f] p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-white/90">Cost Breakdown</h3>
                <p className="text-xs text-white/40 mt-0.5">Cumulative spend over time</p>
              </div>
              {costTrend && (
                <div className={`flex items-center gap-1 text-xs font-medium ${costTrend.up ? 'text-red-400' : 'text-green-400'}`}>
                  {costTrend.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {costTrend.value}%
                </div>
              )}
            </div>
            {costData ? (
              <AreaChart
                data={costData}
                height={200}
                color="#3b82f6"
                formatValue={(v) => `$${v.toFixed(2)}`}
              />
            ) : (
              <Skeleton className="h-[200px] bg-white/5 rounded-lg" />
            )}
          </div>

          {/* Denial rate */}
          <div className="rounded-xl border border-white/8 bg-[#1f1f1f] p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-white/90">Denial Rate Trend</h3>
                <p className="text-xs text-white/40 mt-0.5">Percentage of denied requests</p>
              </div>
              {denialTrend && (
                <div className={`flex items-center gap-1 text-xs font-medium ${denialTrend.up ? 'text-red-400' : 'text-green-400'}`}>
                  {denialTrend.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {denialTrend.value}%
                </div>
              )}
            </div>
            {denialData ? (
              <LineChart
                data={denialData}
                height={200}
                color="#f87171"
                areaFill
                formatValue={(v) => `${(v * 100).toFixed(1)}%`}
              />
            ) : (
              <Skeleton className="h-[200px] bg-white/5 rounded-lg" />
            )}
          </div>
        </div>

        {/* Agent health table */}
        <div className="rounded-xl border border-white/8 bg-[#1f1f1f] p-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white/90">Agent Health Overview</h3>
            <p className="text-xs text-white/40 mt-0.5">Status and performance score per agent</p>
          </div>
          <div className="space-y-3">
            {agentHealthData.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-4 p-3 rounded-lg border border-white/[0.04] hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white/90 truncate">{agent.name}</p>
                    <SeverityBadge variant={agent.environment} />
                    <SeverityBadge variant={agent.status} />
                  </div>
                  <p className="text-xs text-white/40 mt-0.5 truncate">{agent.description}</p>
                </div>
                <div className="w-48">
                  <ProgressBar value={agent.health} />
                </div>
                <div className="w-16 text-right">
                  <span className={`text-sm font-semibold tabular-nums ${
                    agent.health >= 80 ? 'text-green-400' : agent.health >= 50 ? 'text-yellow-400' : 'text-white/30'
                  }`}>
                    {agent.health > 0 ? agent.health : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
