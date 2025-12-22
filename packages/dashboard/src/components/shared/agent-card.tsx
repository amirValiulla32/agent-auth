'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "./status-badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Agent } from "@agent-auth/shared";

interface AgentCardProps {
  agent: Agent;
  onViewLogs?: (agent: Agent) => void;
  onEdit?: (agent: Agent) => void;
  onDelete?: (agent: Agent) => void;
}

export function AgentCard({ agent, onViewLogs, onEdit, onDelete }: AgentCardProps) {
  const initials = agent.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const createdAt = new Date(agent.created_at);
  const status = agent.enabled ? 'active' : 'inactive';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <CardTitle className="truncate">{agent.name}</CardTitle>
          <CardDescription>
            Created {formatDistanceToNow(createdAt, { addSuffix: true })}
          </CardDescription>
        </div>
        <StatusBadge status={status} />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Status</p>
            <p className="font-semibold">{agent.enabled ? 'Enabled' : 'Disabled'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">API Key</p>
            <p className="font-mono text-xs truncate">
              {agent.api_key.slice(0, 16)}...
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewLogs?.(agent)}
        >
          View Logs
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit?.(agent)}
        >
          Edit
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="ml-auto">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewLogs?.(agent)}>
              View Audit Log
            </DropdownMenuItem>
            <DropdownMenuItem>
              Regenerate API Key
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete?.(agent)}
            >
              Delete Agent
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
