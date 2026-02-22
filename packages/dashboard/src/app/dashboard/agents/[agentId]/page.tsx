'use client';

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { HeaderV2 } from "@/components-v2/header";
import { SeverityBadge } from "@/components-v2/shared/severity-badge";
import { LogDetailDrawer } from "@/components-v2/shared/log-detail-drawer";
import { StatsCardV2 } from "@/components-v2/shared/stats-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAgentDetail, useDashboardLogs, useAlerts } from "@/lib/hooks/use-data-provider";
import {
  ArrowLeft, Zap, Coins, Clock, Activity,
} from "lucide-react";
import type { AuditLogEvent } from "@/types";

type Tab = 'summary' | 'runs' | 'logs' | 'alerts';

const TABS: { value: Tab; label: string }[] = [
  { value: 'summary', label: 'Summary' },
  { value: 'runs', label: 'Runs' },
  { value: 'logs', label: 'Logs' },
  { value: 'alerts', label: 'Alerts' },
];

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.agentId as string;

  const { agent, instances, loading } = useAgentDetail(agentId);
  const { logs } = useDashboardLogs({ agentId, pageSize: 20 });
  const { alerts } = useAlerts();

  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const [selectedLog, setSelectedLog] = useState<AuditLogEvent | null>(null);

  const agentAlerts = alerts.filter((a) => a.targetAgentId === agentId);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-[#141414]">
        <HeaderV2 title="Agent Detail" />
        <div className="p-8 space-y-4">
          <Skeleton className="h-10 w-64 bg-white/5 rounded-lg" />
          <Skeleton className="h-32 bg-white/5 rounded-xl" />
          <Skeleton className="h-64 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex flex-col h-full bg-[#141414]">
        <HeaderV2 title="Agent Not Found" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white/50 mb-4">Agent not found</p>
            <Button variant="outline" onClick={() => router.push('/dashboard/agents')} className="border-white/8 text-white/70">
              Back to Agents
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalCalls = instances?.reduce((s, i) => s + i.apiCalls, 0) ?? 0;
  const totalTokens = instances?.reduce((s, i) => s + i.tokensUsed, 0) ?? 0;
  const totalCost = instances?.reduce((s, i) => s + i.costUsd, 0) ?? 0;

  return (
    <div className="flex flex-col h-full bg-[#141414]">
      <HeaderV2
        title={agent.name}
        description={agent.description}
        action={
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/agents')}
            className="rounded-lg border-white/8 bg-white/5 text-white/95 hover:bg-white/10 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      <div className="flex-1 p-8 space-y-6 overflow-y-auto">
        {/* Agent info bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <SeverityBadge variant={agent.status} />
          <SeverityBadge variant={agent.environment} />
          <span className="text-xs text-white/40">Created {new Date(agent.createdAt).toLocaleDateString()}</span>
          <span className="text-xs text-white/40">Last seen {new Date(agent.lastSeenAt).toLocaleDateString()}</span>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCardV2 title="API Calls" value={totalCalls} icon={Zap} delay={0} />
          <StatsCardV2 title="Tokens Used" value={totalTokens} icon={Activity} delay={50} />
          <StatsCardV2 title="Cost (USD)" value={parseFloat(totalCost.toFixed(2))} icon={Coins} delay={100} />
          <StatsCardV2 title="Total Runs" value={instances?.length ?? 0} icon={Clock} delay={150} />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-white/[0.06]">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
                activeTab === tab.value
                  ? 'border-[#22c55e] text-white/95'
                  : 'border-transparent text-white/50 hover:text-white/70'
              }`}
            >
              {tab.label}
              {tab.value === 'alerts' && agentAlerts.length > 0 && (
                <span className="ml-1.5 text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">
                  {agentAlerts.filter((a) => a.status === 'open').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'summary' && (
          <div className="rounded-xl border border-white/8 bg-[#1f1f1f] p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white/90">Agent Details</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow label="ID" value={agent.id} mono />
              <DetailRow label="Owner" value={agent.ownerUserId} mono />
              <DetailRow label="Team" value={agent.teamId} mono />
              <DetailRow label="Environment" value={agent.environment} />
              <DetailRow label="Status" value={agent.status} />
              <DetailRow label="Created" value={new Date(agent.createdAt).toLocaleString()} />
            </div>
          </div>
        )}

        {activeTab === 'runs' && (
          <div className="rounded-xl border border-white/8 bg-[#1f1f1f] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">ID</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Started</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">API Calls</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Tokens</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Cost</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Failure</th>
                </tr>
              </thead>
              <tbody>
                {(instances ?? []).map((inst) => (
                  <tr
                    key={inst.id}
                    className={`border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors ${
                      inst.status === 'failed' ? 'bg-red-500/[0.03]' : ''
                    }`}
                  >
                    <td className="px-6 py-3">
                      <span className="text-xs text-white/60 font-mono">{inst.id}</span>
                    </td>
                    <td className="px-6 py-3">
                      <SeverityBadge variant={inst.status} />
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs text-white/50">{new Date(inst.startedAt).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs text-white/70 tabular-nums">{inst.apiCalls}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs text-white/70 tabular-nums">{inst.tokensUsed.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs text-white/70 tabular-nums">${inst.costUsd.toFixed(4)}</span>
                    </td>
                    <td className="px-6 py-3">
                      {inst.failureReason ? (
                        <span className="text-xs text-red-400">{inst.failureReason}</span>
                      ) : (
                        <span className="text-xs text-white/30">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="rounded-xl border border-white/8 bg-[#1f1f1f] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Timestamp</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Action</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Severity</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Actor</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((event) => (
                  <tr
                    key={event.id}
                    onClick={() => setSelectedLog(event)}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-3">
                      <span className="text-xs text-white/60">{new Date(event.timestamp).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs text-white/80 font-mono">{event.action}</span>
                    </td>
                    <td className="px-6 py-3">
                      <SeverityBadge variant={event.severity} />
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs text-white/50">{event.actorId}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs text-white/40 font-mono">{event.ip}</span>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-white/30">
                      No logs for this agent
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="rounded-xl border border-white/8 bg-[#1f1f1f] overflow-hidden">
            {agentAlerts.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-white/30">No alerts for this agent</p>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {agentAlerts.map((alert) => (
                  <div key={alert.id} className="px-6 py-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <SeverityBadge variant={alert.severity} />
                      <SeverityBadge variant={alert.status} />
                      <span className="text-xs text-white/40 ml-auto">{new Date(alert.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-white/70">{alert.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <LogDetailDrawer
        event={selectedLog}
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
      <span className="text-xs text-white/50">{label}</span>
      <span className={`text-xs text-white/80 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
