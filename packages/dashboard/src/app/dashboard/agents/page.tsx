'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeaderV2 } from "@/components-v2/header";
import { SeverityBadge } from "@/components-v2/shared/severity-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List, Users } from "lucide-react";
import { useDashboardAgents } from "@/lib/hooks/use-data-provider";
import { useAuth } from "@/lib/auth";

function AgentsLoading() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-lg bg-white/5" />
      ))}
    </div>
  );
}

export default function AgentsPage() {
  const router = useRouter();
  const { can } = useAuth();
  const canManage = can('manage_agents');
  const { data: agents, loading } = useDashboardAgents();

  return (
    <div className="flex flex-col h-full bg-[#090c0a]">
      <HeaderV2
        title="Agents"
        description="Manage your AI agents and their permissions"
        action={
          canManage ? (
            <Button
              className="rounded-lg bg-[#166534] text-white hover:bg-[#15803d] font-medium transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
          ) : undefined
        }
      />

      <div className="flex-1 p-8">
        {loading ? (
          <AgentsLoading />
        ) : !agents || agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/30">
            <Users className="h-10 w-10 mb-3" />
            <p className="text-sm">No agents yet</p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/8 bg-[#1f1f1f] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Environment</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Last Seen</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr
                    key={agent.id}
                    onClick={() => router.push(`/dashboard/agents/${agent.id}`)}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-[#166534]/20 border border-[#166534]/30 flex items-center justify-center">
                          <span className="text-xs font-semibold text-[#22c55e]">
                            {agent.name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white/90">{agent.name}</p>
                          <p className="text-xs text-white/40">{agent.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <SeverityBadge variant={agent.environment} />
                    </td>
                    <td className="px-6 py-4">
                      <SeverityBadge variant={agent.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-white/50">{new Date(agent.lastSeenAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-white/50">{new Date(agent.createdAt).toLocaleDateString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
