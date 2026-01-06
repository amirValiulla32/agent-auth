'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil } from 'lucide-react';
import type { Tool } from '@agent-auth/shared';
import { EmptyState } from '@/components/shared/empty-state';

interface ToolListProps {
  tools: Tool[];
  onDelete: (tool: Tool) => void;
  onEdit: (tool: Tool) => void;
}

export function ToolList({ tools, onDelete, onEdit }: ToolListProps) {
  if (!tools || tools.length === 0) {
    return (
      <EmptyState
        title="No tools registered"
        description="Create your first tool to get started with permission control"
      />
    );
  }

  return (
    <div className="space-y-3">
      {tools.map((tool) => (
        <div
          key={tool.id}
          className="flex items-start justify-between p-4 rounded-lg border bg-card"
        >
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{tool.name}</h4>
            </div>

            {tool.description && (
              <p className="text-sm text-muted-foreground">
                {tool.description}
              </p>
            )}

            <div className="flex flex-wrap gap-1.5">
              {tool.scopes?.map((scope) => (
                <Badge key={scope} variant="secondary" className="text-xs">
                  {scope}
                </Badge>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Created {new Date(tool.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(tool)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(tool)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
