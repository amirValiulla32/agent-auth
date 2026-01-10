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
    <div className="group relative overflow-hidden rounded-lg border border-white/8 bg-[#1f1f1f] transition-all duration-300 ease-out hover:border-white/15 hover:bg-[#2C2C2E] hover:scale-[1.02] hover:shadow-lg hover:shadow-white/5 will-change-transform">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6 relative">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <Avatar className="h-12 w-12 border border-white/8 ring-2 ring-transparent transition-all duration-200 group-hover:ring-white/10">
            <AvatarFallback className="bg-[#2C2C2E] border border-white/8 text-sm font-bold text-white/95">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold tracking-tight text-white/95 truncate">{agent.name}</h3>
            <p className="text-xs text-white/50 mt-1">
              Created {formatDistanceToNow(createdAt, { addSuffix: true })}
            </p>
          </div>
          <div className={`rounded-full border px-2.5 py-1 ${agent.enabled ? 'border-white/8 bg-white/5' : 'border-white/5 bg-white/5'}`}>
            <span className={`text-xs font-medium ${agent.enabled ? 'text-[#34D399]' : 'text-white/50'}`}>
              {agent.enabled ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* API Key */}
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-white/50 mb-2">API Key</p>
          <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/5 px-3 py-2 group/key hover:bg-white/10 hover:border-white/15 transition-all duration-200">
            <code className="flex-1 text-xs font-mono text-white/70 truncate">
              {agent.api_key.slice(0, 20)}...
            </code>
            <button
              onClick={copyApiKey}
              className="shrink-0 p-1.5 rounded-md text-white/50 hover:text-white/95 hover:bg-white/10 transition-all duration-200 hover:scale-110 active:scale-95"
              title={copied ? "Copied!" : "Copy API key"}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-[#34D399]" />
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
            className="flex-1 rounded-lg bg-[#FAFAFA] text-[#141414] hover:bg-[#FFFFFF] h-9 font-medium transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md"
          >
            <Settings className="h-3.5 w-3.5 mr-1.5" />
            Rules
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit?.(agent)}
            className="rounded-lg border-white/8 bg-white/5 text-white/95 hover:bg-white/10 hover:border-white/15 h-9 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-lg text-white/50 hover:text-white/95 hover:bg-white/10 h-9 w-9 p-0 transition-all duration-200"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1f1f1f] border-white/8">
              <DropdownMenuItem
                onClick={() => onViewLogs?.(agent)}
                className="text-white/70 hover:text-white/95 hover:bg-white/5"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Logs
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onRegenerate?.(agent)}
                className="text-white/70 hover:text-white/95 hover:bg-white/5"
              >
                <Key className="h-4 w-4 mr-2" />
                Regenerate Key
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/8" />
              <DropdownMenuItem
                onClick={() => onDelete?.(agent)}
                className="text-[#F87171] hover:text-[#F87171] hover:bg-[#F87171]/10"
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
