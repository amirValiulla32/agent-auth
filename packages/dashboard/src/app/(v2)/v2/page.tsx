'use client';

import { useEffect, useState } from "react";
import { HeaderV2 } from "@/components-v2/header";
import { StatsCardV2 } from "@/components-v2/shared/stats-card";
import { ActivityFeedV2 } from "@/components-v2/shared/activity-feed";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient, StatsResponse } from "@/lib/api-client";
import { Users, Activity, ShieldAlert, Zap, Plus, ScrollText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Log } from "@agent-auth/shared";
import Link from "next/link";

function StatsLoading() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-xl bg-white/5" />
      ))}
    </div>
  );
}

export default function HomeV2() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, logsData] = await Promise.all([
          apiClient.getStats(),
          apiClient.getLogs(5),
        ]);
        setStats(statsData);
        setLogs(logsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSeedData = async () => {
    try {
      await apiClient.seedTestData();
      window.location.reload();
    } catch (error) {
      console.error('Failed to seed data:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#141414]">
      <HeaderV2
        title="Dashboard"
        description="Overview of your AI agent permissions and activity"
        action={
          <Button
            variant="outline"
            onClick={handleSeedData}
            className="rounded-lg border-white/8 bg-white/5 text-white/95 hover:bg-white/10 hover:border-white/15 transition-all duration-200"
          >
            Seed Test Data
          </Button>
        }
      />

      <div className="flex-1 p-8 space-y-8">
        {/* Stats Cards */}
        {loading || !stats ? (
          <StatsLoading />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatsCardV2
              title="Total Agents"
              value={stats.totalAgents}
              icon={Users}
              delay={0}
            />
            <StatsCardV2
              title="API Calls Today"
              value={stats.apiCallsToday}
              icon={Zap}
              delay={100}
            />
            <StatsCardV2
              title="Denials Today"
              value={stats.denialsToday}
              icon={ShieldAlert}
              delay={200}
            />
            <StatsCardV2
              title="Total Logs"
              value={stats.totalLogs}
              icon={Activity}
              delay={300}
            />
          </div>
        )}

        {/* Activity Feed and Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Activity Feed */}
          {loading ? (
            <Skeleton className="h-96 rounded-lg bg-white/5" />
          ) : (
            <ActivityFeedV2 logs={logs} limit={5} />
          )}

          {/* Quick Actions */}
          <div className="rounded-lg border border-white/8 bg-[#1f1f1f] p-6">
            <h2 className="text-lg font-semibold tracking-tight text-white/95 mb-6">Quick Actions</h2>
            <div className="grid gap-3">
              <Link href="/v2/agents">
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-lg border-white/8 bg-white/5 text-white/95 hover:bg-white/10 hover:border-white/15 transition-all duration-200 h-12 hover:scale-[1.02] active:scale-[0.98] hover:translate-x-1"
                >
                  <Plus className="h-4 w-4 mr-3" />
                  Create New Agent
                </Button>
              </Link>
              <Link href="/v2/logs">
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-lg border-white/8 bg-white/5 text-white/95 hover:bg-white/10 hover:border-white/15 transition-all duration-200 h-12 hover:scale-[1.02] active:scale-[0.98] hover:translate-x-1"
                >
                  <ScrollText className="h-4 w-4 mr-3" />
                  View All Logs
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full justify-start rounded-lg border-white/8 bg-white/5 text-white/95 hover:bg-white/10 hover:border-white/15 transition-all duration-200 h-12 hover:scale-[1.02] active:scale-[0.98] hover:translate-x-1"
              >
                <Shield className="h-4 w-4 mr-3" />
                Manage Permissions
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
