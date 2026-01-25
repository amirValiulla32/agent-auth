'use client';

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Copy, Settings, Trash2, Eye, Key, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Agent } from "@agent-auth/shared";
import { useState } from "react";

interface AgentCardV2Props {
  agent: Agent;
  onViewLogs?: (agent: Agent) => void;
  onEdit?: (agent: Agent) => void;
  onDelete?: (agent: Agent) => void;
  onRegenerate?: (agent: Agent) => void;
  onManageRules?: (agent: Agent) => void;
}

export function AgentCardV2({ agent, onViewLogs, onEdit, onDelete, onRegenerate, onManageRules }: AgentCardV2Props) {
  const initials = agent.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const createdAt = new Date(agent.created_at);

  const [copied, setCopied] = useState(false);

  const copyApiKey = () => {
    navigator.clipboard.writeText(agent.api_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-oak-border bg-oak-surface/80 backdrop-blur-sm transition-all duration-300 ease-out hover:border-primary/20 hover:bg-oak-elevated/90 hover:scale-[1.02] hover:shadow-glow-sm will-change-transform">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6 relative">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <Avatar className="h-12 w-12 border border-oak-border ring-2 ring-transparent transition-all duration-300 group-hover:ring-primary/20 group-hover:border-primary/20">
            <AvatarFallback className="bg-oak-elevated border border-oak-border text-sm font-bold text-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold tracking-tight text-foreground truncate">{agent.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Created {formatDistanceToNow(createdAt, { addSuffix: true })}
            </p>
          </div>
          <div className={`rounded-full border px-2.5 py-1 transition-all duration-200 ${
            agent.enabled
              ? 'border-primary/30 bg-primary/10 shadow-glow-success'
              : 'border-oak-border bg-oak-surface'
          }`}>
            <span className={`text-xs font-medium ${agent.enabled ? 'text-primary' : 'text-muted-foreground'}`}>
              {agent.enabled ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* API Key */}
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">API Key</p>
          <div className="flex items-center gap-2 rounded-lg border border-oak-border bg-oak-surface/50 px-3 py-2 group/key hover:bg-oak-elevated hover:border-oak-border-hover transition-all duration-200">
            <code className="flex-1 text-xs font-mono text-muted-foreground truncate">
              {agent.api_key.slice(0, 20)}...
            </code>
            <button
              onClick={copyApiKey}
              className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200 hover:scale-110 active:scale-95"
              title={copied ? "Copied!" : "Copy API key"}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onManageRules?.(agent)}
            className="flex-1 h-9"
          >
            <Settings className="h-3.5 w-3.5 mr-1.5" />
            Rules
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit?.(agent)}
            className="h-9"
          >
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-9 w-9 p-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-oak-surface border-oak-border">
              <DropdownMenuItem
                onClick={() => onViewLogs?.(agent)}
                className="text-muted-foreground hover:text-foreground hover:bg-primary/5"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Logs
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onRegenerate?.(agent)}
                className="text-muted-foreground hover:text-foreground hover:bg-primary/5"
              >
                <Key className="h-4 w-4 mr-2" />
                Regenerate Key
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-oak-border" />
              <DropdownMenuItem
                onClick={() => onDelete?.(agent)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Agent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
