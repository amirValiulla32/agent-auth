'use client';

import { useState } from "react";
import { HeaderV2 } from "@/components-v2/header";
import { AgentCardV2 } from "@/components-v2/shared/agent-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import {
  CreateAgentDialog,
  EditAgentDialog,
  RegenerateKeyDialog,
  AgentRulesDialog,
} from "@/components/agents";
import { useAgents } from "@/lib/hooks/use-agents";
import type { Agent } from "@agent-auth/shared";

function AgentsLoading() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-xl bg-white/5" />
      ))}
    </div>
  );
}

export default function AgentsPageV2() {
  const {
    agents,
    loading,
    error,
    createAgent,
    updateAgent,
    deleteAgent,
    regenerateKey,
  } = useAgents();

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [showRulesDialog, setShowRulesDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handlers
  const handleEdit = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowEditDialog(true);
  };

  const handleDelete = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowDeleteDialog(true);
  };

  const handleRegenerate = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowRegenerateDialog(true);
  };

  const handleManageRules = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowRulesDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedAgent) return;

    setIsDeleting(true);
    const success = await deleteAgent(selectedAgent.id);
    setIsDeleting(false);

    if (success) {
      setShowDeleteDialog(false);
      setSelectedAgent(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#090c0a]">
      <HeaderV2
        title="Agents"
        description="Manage your AI agents and their permissions"
        action={
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="rounded-lg bg-[#166534] text-white hover:bg-[#15803d] font-medium transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Agent
          </Button>
        }
      />

      <div className="flex-1 p-8">
        {loading ? (
          <AgentsLoading />
        ) : error ? (
          <div className="flex items-center justify-center h-96">
            <EmptyState
              icon={AlertCircle}
              title="Failed to load agents"
              description={error.message}
              actionLabel="Retry"
              onAction={() => window.location.reload()}
            />
          </div>
        ) : agents.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <EmptyState
              icon={Plus}
              title="No agents yet"
              description="Create your first AI agent to get started with API permissions."
              actionLabel="Create Agent"
              onAction={() => setShowCreateDialog(true)}
            />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <AgentCardV2
                key={agent.id}
                agent={agent}
                onEdit={() => handleEdit(agent)}
                onDelete={() => handleDelete(agent)}
                onRegenerate={() => handleRegenerate(agent)}
                onManageRules={() => handleManageRules(agent)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs - reusing existing ones */}
      <CreateAgentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={createAgent}
      />

      <EditAgentDialog
        agent={selectedAgent}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSubmit={updateAgent}
      />

      <RegenerateKeyDialog
        agent={selectedAgent}
        open={showRegenerateDialog}
        onOpenChange={setShowRegenerateDialog}
        onRegenerate={regenerateKey}
      />

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Agent"
        description={`Are you sure you want to delete "${selectedAgent?.name}"? This will also delete all associated permission rules and cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        loading={isDeleting}
      />

      <AgentRulesDialog
        agent={selectedAgent}
        open={showRulesDialog}
        onOpenChange={setShowRulesDialog}
      />
    </div>
  );
}
