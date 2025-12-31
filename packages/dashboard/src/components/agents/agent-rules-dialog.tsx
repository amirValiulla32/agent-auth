'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useRules } from '@/lib/hooks/use-rules';
import { useTools } from '@/lib/hooks/use-tools';
import { CreateRuleDialog, RuleList } from '@/components/rules';
import { CreateToolDialog, ToolList } from '@/components/tools';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import type { Agent, Rule, Tool } from '@agent-auth/shared';

interface AgentRulesDialogProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentRulesDialog({ agent, open, onOpenChange }: AgentRulesDialogProps) {
  const { rules, loading: rulesLoading, createRule, deleteRule } = useRules(agent?.id);
  const { tools, loading: toolsLoading, createTool, deleteTool } = useTools(agent?.id);

  const [showCreateRuleDialog, setShowCreateRuleDialog] = useState(false);
  const [showCreateToolDialog, setShowCreateToolDialog] = useState(false);

  const [ruleToDelete, setRuleToDelete] = useState<Rule | null>(null);
  const [toolToDelete, setToolToDelete] = useState<Tool | null>(null);

  const [showDeleteRuleDialog, setShowDeleteRuleDialog] = useState(false);
  const [showDeleteToolDialog, setShowDeleteToolDialog] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteRule = (rule: Rule) => {
    setRuleToDelete(rule);
    setShowDeleteRuleDialog(true);
  };

  const handleDeleteTool = (tool: Tool) => {
    setToolToDelete(tool);
    setShowDeleteToolDialog(true);
  };

  const confirmDeleteRule = async () => {
    if (!ruleToDelete) return;

    setIsDeleting(true);
    const success = await deleteRule(ruleToDelete.id);
    setIsDeleting(false);

    if (success) {
      setShowDeleteRuleDialog(false);
      setRuleToDelete(null);
    }
  };

  const confirmDeleteTool = async () => {
    if (!toolToDelete) return;

    setIsDeleting(true);
    const success = await deleteTool(toolToDelete.id);
    setIsDeleting(false);

    if (success) {
      setShowDeleteToolDialog(false);
      setToolToDelete(null);
    }
  };

  if (!agent) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Manage Tools & Rules - {agent.name}</DialogTitle>
            <DialogDescription>
              Register tools and create permission rules for this agent
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="tools" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="rules">Permission Rules</TabsTrigger>
            </TabsList>

            <TabsContent value="tools" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {tools?.length || 0} {tools?.length === 1 ? 'tool' : 'tools'} registered
                </p>
                <Button
                  onClick={() => setShowCreateToolDialog(true)}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tool
                </Button>
              </div>

              {toolsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto">
                  <ToolList tools={tools || []} onDelete={handleDeleteTool} />
                </div>
              )}
            </TabsContent>

            <TabsContent value="rules" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {rules.length} {rules.length === 1 ? 'rule' : 'rules'}
                </p>
                <Button
                  onClick={() => setShowCreateRuleDialog(true)}
                  size="sm"
                  disabled={tools.length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>

              {tools.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Register at least one tool before creating rules
                </div>
              ) : rulesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto">
                  <RuleList rules={rules} onDelete={handleDeleteRule} />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <CreateToolDialog
        agentId={agent.id}
        agentName={agent.name}
        open={showCreateToolDialog}
        onOpenChange={setShowCreateToolDialog}
        onSubmit={createTool}
      />

      <CreateRuleDialog
        agentId={agent.id}
        agentName={agent.name}
        open={showCreateRuleDialog}
        onOpenChange={setShowCreateRuleDialog}
        onSubmit={createRule}
      />

      <ConfirmationDialog
        open={showDeleteToolDialog}
        onOpenChange={setShowDeleteToolDialog}
        onConfirm={confirmDeleteTool}
        title="Delete Tool"
        description="Are you sure you want to delete this tool? All associated permission rules will also be deleted. This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        loading={isDeleting}
      />

      <ConfirmationDialog
        open={showDeleteRuleDialog}
        onOpenChange={setShowDeleteRuleDialog}
        onConfirm={confirmDeleteRule}
        title="Delete Rule"
        description="Are you sure you want to delete this permission rule? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        loading={isDeleting}
      />
    </>
  );
}
