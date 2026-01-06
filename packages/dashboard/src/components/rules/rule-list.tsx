'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
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
                <div className="space-y-1">
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
            <CardContent className="pt-0">
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
