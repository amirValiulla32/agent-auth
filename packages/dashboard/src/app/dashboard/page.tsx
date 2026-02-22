'use client';

import { useState } from "react";
import { HeaderV2 } from "@/components-v2/header";
import { StatsCardV2 } from "@/components-v2/shared/stats-card";
import { SeverityBadge } from "@/components-v2/shared/severity-badge";
import { LineChart } from "@/components-v2/charts/line-chart";
import { AreaChart } from "@/components-v2/charts/area-chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useOverviewMetrics,
  useRequestsTimeSeries,
  useCostTimeSeries,
  useAlerts,
} from "@/lib/hooks/use-data-provider";
import {
  Users, Activity, ShieldAlert, Zap, DollarSign,
  Cpu, CheckCircle, XCircle, ShieldCheck, AlertTriangle,
} from "lucide-react";
import type { TimeRange } from "@/types";

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
];

function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-xl bg-white/5" />
      ))}
    </div>
  );
}

export default function DashboardOverview() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const { data: metrics, loading: metricsLoading } = useOverviewMetrics(timeRange);
  const { data: requestsData } = useRequestsTimeSeries(timeRange);
  const { data: costData } = useCostTimeSeries(timeRange);
  const { alerts } = useAlerts();

  const criticalAlerts = alerts.filter((a) => a.severity === 'critical' && a.status === 'open');
  const recentAlerts = alerts.filter((a) => a.status !== 'resolved').slice(0, 5);

  return (
    <div className="flex flex-col h-full bg-[#141414]">
      <HeaderV2
        title="Dashboard"
        description="Overview of your AI agent permissions and activity"
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

      <div className="flex-1 p-8 space-y-8">
        {/* Metrics Cards — Row 1 */}
        {metricsLoading || !metrics ? (
          <StatsLoading />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              <StatsCardV2
                title="Agents"
                value={metrics.agentCount}
                icon={Users}
                delay={0}
              />
              <StatsCardV2
                title="Running"
                value={metrics.instancesRunning}
                icon={Cpu}
                delay={50}
              />
              <StatsCardV2
                title="Finished"
                value={metrics.instancesFinished}
                icon={CheckCircle}
                delay={100}
              />
              <StatsCardV2
                title="Failed"
                value={metrics.instancesFailed}
                icon={XCircle}
                delay={150}
              />
              <StatsCardV2
                title="API Calls"
                value={metrics.apiCallsTotal}
                icon={Zap}
                delay={200}
              />
            </div>

            {/* Metrics Cards — Row 2 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCardV2
                title="Tokens Used"
                value={metrics.tokensTotal}
                icon={Activity}
                delay={250}
              />
              <StatsCardV2
                title="Total Cost (USD)"
                value={metrics.costTotalUsd}
                icon={DollarSign}
                delay={300}
              />
              <StatsCardV2
                title="Denial Rate"
                value={Math.round(metrics.denialRate * 100)}
                icon={ShieldAlert}
                delay={350}
              />
              <StatsCardV2
                title="Compliance Rate"
                value={Math.round(metrics.complianceRate * 100)}
                icon={ShieldCheck}
                delay={400}
              />
            </div>
          </>
        )}

        {/* Charts + Alerts */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Requests Chart */}
            <div className="rounded-xl border border-white/8 bg-[#1f1f1f] p-6">
              <h3 className="text-sm font-medium text-white/70 mb-6">Requests Over Time</h3>
              {requestsData ? (
                <LineChart
                  data={requestsData}
                  height={180}
                  color="#22c55e"
                  areaFill
                  formatValue={(v) => `${Math.round(v)} req`}
                />
              ) : (
                <Skeleton className="h-[180px] bg-white/5 rounded-lg" />
              )}
            </div>

            {/* Cost Chart */}
            <div className="rounded-xl border border-white/8 bg-[#1f1f1f] p-6">
              <h3 className="text-sm font-medium text-white/70 mb-6">Cost Over Time</h3>
              {costData ? (
                <AreaChart
                  data={costData}
                  height={180}
                  color="#3b82f6"
                  formatValue={(v) => `$${v.toFixed(2)}`}
                />
              ) : (
                <Skeleton className="h-[180px] bg-white/5 rounded-lg" />
              )}
            </div>
          </div>

          {/* Alerts Panel */}
          <div className="rounded-xl border border-white/8 bg-[#1f1f1f] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-white/70">Alerts</h3>
              {criticalAlerts.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-red-400">
                  <AlertTriangle className="h-3 w-3" />
                  {criticalAlerts.length} critical
                </span>
              )}
            </div>

            {recentAlerts.length === 0 ? (
              <p className="text-sm text-white/30 text-center py-8">No active alerts</p>
            ) : (
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <SeverityBadge variant={alert.severity} />
                      <SeverityBadge variant={alert.status} />
                    </div>
                    <p className="text-xs text-white/70 mt-2 line-clamp-2">{alert.message}</p>
                    <p className="text-[10px] text-white/30 mt-1">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
