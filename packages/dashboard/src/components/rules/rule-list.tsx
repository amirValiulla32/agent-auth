'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Circle, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { Rule } from '@agent-auth/shared';
import { formatDistanceToNow } from 'date-fns';

interface RuleListProps {
  rules: Rule[];
  onDelete?: (rule: Rule) => void;
}

function formatToolName(tool: string): string {
  return tool
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatScopeName(scope: string): string {
  return scope;
}

function getReasoningBadge(requireReasoning?: 'none' | 'soft' | 'hard') {
  const requirement = requireReasoning || 'none';

  switch (requirement) {
    case 'none':
      return (
        <Badge variant="outline" className="flex items-center gap-1 text-gray-600">
          <Circle className="h-3 w-3" />
          Optional
        </Badge>
      );
    case 'soft':
      return (
        <Badge variant="outline" className="flex items-center gap-1 text-amber-600 border-amber-300">
          <AlertTriangle className="h-3 w-3" />
          Soft Require
        </Badge>
      );
    case 'hard':
      return (
        <Badge variant="outline" className="flex items-center gap-1 text-red-600 border-red-300">
          <ShieldAlert className="h-3 w-3" />
          Hard Require
        </Badge>
      );
  }
}

export function RuleList({ rules, onDelete }: RuleListProps) {
  if (rules.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No permission rules yet. Create one to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {rules.map((rule) => {
        const createdAt = new Date(rule.created_at);

        return (
          <Card key={rule.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-base">
                    {formatToolName(rule.tool)}
                  </CardTitle>
                  <CardDescription>
                    {formatScopeName(rule.scope)}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete?.(rule)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Reasoning:</span>
                {getReasoningBadge(rule.require_reasoning)}
              </div>
              <p className="text-xs text-muted-foreground">
                Created {formatDistanceToNow(createdAt, { addSuffix: true })}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
