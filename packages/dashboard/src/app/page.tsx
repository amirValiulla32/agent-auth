'use client';

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { StatsCard } from "@/components/shared/stats-card";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient, StatsResponse } from "@/lib/api-client";
import { Users, Activity, ShieldAlert, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Log } from "@agent-auth/shared";

function StatsLoading() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
  );
}

export default function Home() {
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
    <div className="flex flex-col h-full">
      <Header
        title="Dashboard"
        description="Overview of your AI agent permissions and activity"
        action={
          <Button variant="outline" onClick={handleSeedData}>
            Seed Test Data
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {loading || !stats ? (
          <StatsLoading />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Agents"
              value={stats.totalAgents}
              icon={Users}
            />
            <StatsCard
              title="API Calls Today"
              value={stats.apiCallsToday}
              icon={Zap}
            />
            <StatsCard
              title="Denials Today"
              value={stats.denialsToday}
              icon={ShieldAlert}
            />
            <StatsCard
              title="Total Logs"
              value={stats.totalLogs}
              icon={Activity}
            />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {loading ? (
            <Skeleton className="h-96" />
          ) : (
            <ActivityFeed logs={logs} limit={5} />
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <div className="grid gap-3">
              <Button variant="outline" className="justify-start">
                Create New Agent
              </Button>
              <Button variant="outline" className="justify-start">
                View All Logs
              </Button>
              <Button variant="outline" className="justify-start">
                Manage Permissions
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
