'use client';

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { AgentCard } from "@/components/shared/agent-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { Plus } from "lucide-react";
import type { Agent } from "@agent-auth/shared";

function AgentsLoading() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-64" />
      ))}
    </div>
  );
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAgents() {
      try {
        const data = await apiClient.getAgents();
        setAgents(data);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAgents();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Agents"
        description="Manage your AI agents and their permissions"
        action={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Agent
          </Button>
        }
      />

      <div className="flex-1 p-6">
        {loading ? (
          <AgentsLoading />
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg text-muted-foreground mb-4">
              No agents found
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Agent
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
