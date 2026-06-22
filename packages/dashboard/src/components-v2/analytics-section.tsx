'use client';

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ShieldCheck, ShieldAlert, MessageCircle, BarChart3 } from "lucide-react";
import type { Analytics } from "@agent-auth/shared";

const RANGES = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

const GREEN = "#34D399";
const RED = "#F87171";
const BRAND = "#22c55e";

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

/** SVG ring showing a single fraction (0..1). */
function Ring({ value, color, label, sublabel }: { value: number; color: string; label: string; sublabel: string }) {
  const C = 2 * Math.PI * 40;
  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="h-32 w-32 -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${value * C} ${C}`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-white/95">{label}</span>
        <span className="text-[11px] text-white/40">{sublabel}</span>
      </div>
    </div>
  );
}

function Card({ title, icon, children, className }: { title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-white/8 bg-[#1f1f1f] p-6", className)}>
      <div className="mb-5 flex items-center gap-2">
        {icon && <span className="text-white/40">{icon}</span>}
        <h3 className="text-sm font-semibold text-white/95">{title}</h3>
      </div>
      {children}
    </div>
  );
}

/** Horizontal labelled bars (top-denied, per-agent, reasons). */
function HBars({ rows }: { rows: { label: string; sub?: string; value: number; color?: string }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-white/40">Nothing to show yet.</p>;
  }
  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div key={i}>
          <div className="mb-1 flex items-center justify-between gap-3">
            <span className="truncate text-[13px] text-white/85">{r.label}</span>
            <span className="shrink-0 font-mono text-xs text-white/50">{r.value}{r.sub ? ` · ${r.sub}` : ""}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <div className="h-full rounded-full" style={{ width: `${(r.value / max) * 100}%`, backgroundColor: r.color || BRAND }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsSection() {
  const [range, setRange] = useState(30);
  const [data, setData] = useState<Analytics | null>(null);
  const [agentNames, setAgentNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (days: number) => {
    setLoading(true);
    try {
      const [analytics, agents] = await Promise.all([
        apiClient.getAnalytics(days),
        apiClient.getAgents(),
      ]);
      const map: Record<string, string> = {};
      agents.forEach((a) => { map[a.id] = a.name; });
      setAgentNames(map);
      setData(analytics);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(range); }, [range, load]);

  if (loading && !data) {
    return <Skeleton className="h-80 rounded-lg bg-white/5" />;
  }
  if (!data) return null;

  const { totals, activity, topDenied, denialReasons, perAgent, compliance } = data;
  const maxDay = Math.max(1, ...activity.map((d) => d.allowed + d.denied));

  return (
    <div className="space-y-6">
      {/* Section header + range selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-white/50" />
          <h2 className="text-lg font-semibold tracking-tight text-white/95">Insights</h2>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-white/8 bg-white/5 p-1">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setRange(r.days)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                range === r.days ? "bg-white/10 text-white/95" : "text-white/45 hover:text-white/80"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {totals.total === 0 ? (
        <div className="rounded-lg border border-white/8 bg-[#1f1f1f] py-12 text-center">
          <p className="text-sm text-white/70">No activity in this period</p>
          <p className="mt-1 text-xs text-white/40">Validation calls in the last {range} days will appear here.</p>
        </div>
      ) : (
        <>
          {/* Top row: allow rate · compliance · denial reasons */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card title="Allow rate" icon={<ShieldCheck className="h-4 w-4" />}>
              <div className="flex items-center gap-5">
                <Ring value={totals.allowRate} color={GREEN} label={pct(totals.allowRate)} sublabel="allowed" />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: GREEN }} />
                    <span className="text-white/70">{totals.allowed} allowed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: RED }} />
                    <span className="text-white/70">{totals.denied} denied</span>
                  </div>
                  <div className="pt-1 text-xs text-white/40">{totals.total} total calls</div>
                </div>
              </div>
            </Card>

            <Card title="Reasoning compliance" icon={<MessageCircle className="h-4 w-4" />}>
              <div className="flex items-center gap-5">
                <Ring value={compliance.coverage} color={BRAND} label={pct(compliance.coverage)} sublabel="covered" />
                <div className="space-y-1 text-sm">
                  <p className="text-white/70">{compliance.provided} of {compliance.gated}</p>
                  <p className="text-xs text-white/40">gated calls (soft/hard) that supplied reasoning</p>
                </div>
              </div>
            </Card>

            <Card title="Why requests were denied" icon={<ShieldAlert className="h-4 w-4" />}>
              <HBars rows={denialReasons.map((r) => ({ label: r.reason, value: r.count, color: RED }))} />
            </Card>
          </div>

          {/* Activity over time */}
          <Card title={`Activity · last ${range} days`}>
            <div className="flex h-40 items-end gap-1">
              {activity.map((d) => {
                const total = d.allowed + d.denied;
                const colH = (total / maxDay) * 100;
                const deniedH = total ? (d.denied / total) * 100 : 0;
                const allowedH = total ? (d.allowed / total) * 100 : 0;
                return (
                  <div
                    key={d.date}
                    className="flex flex-1 flex-col justify-end"
                    title={`${d.date}: ${d.allowed} allowed, ${d.denied} denied`}
                  >
                    <div className="flex w-full flex-col justify-end overflow-hidden rounded-t-sm" style={{ height: `${colH}%` }}>
                      <div style={{ height: `${deniedH}%`, backgroundColor: RED }} />
                      <div style={{ height: `${allowedH}%`, backgroundColor: GREEN }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {activity.length > 0 && (
              <div className="mt-2 flex justify-between text-[11px] text-white/30">
                <span>{activity[0].date}</span>
                <span>{activity[activity.length - 1].date}</span>
              </div>
            )}
          </Card>

          {/* Bottom row: top denied · most active agents */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Top denied requests" icon={<ShieldAlert className="h-4 w-4" />}>
              <HBars
                rows={topDenied.map((t) => ({ label: `${t.tool}:${t.scope}`, value: t.count, color: RED }))}
              />
            </Card>

            <Card title="Most active agents" icon={<BarChart3 className="h-4 w-4" />}>
              <HBars
                rows={perAgent.map((a) => ({
                  label: agentNames[a.agent_id] || `${a.agent_id.slice(0, 8)}…`,
                  sub: `${pct(a.allowRate)} allowed`,
                  value: a.total,
                  color: BRAND,
                }))}
              />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
