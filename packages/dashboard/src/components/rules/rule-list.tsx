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

function formatActionName(action: string): string {
  return action
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatConditions(conditionsJson: string): string[] {
  try {
    const conditions = JSON.parse(conditionsJson);
    const formatted: string[] = [];

    if (conditions.max_duration) {
      formatted.push(`Max ${conditions.max_duration} min`);
    }
    if (conditions.max_attendees) {
      formatted.push(`Max ${conditions.max_attendees} attendees`);
    }
    if (conditions.business_hours_only) {
      formatted.push('Business hours only');
    }

    return formatted;
  } catch {
    return [];
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
        const conditions = formatConditions(rule.conditions);
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
                    {formatActionName(rule.action)}
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
            {conditions.length > 0 && (
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {conditions.map((condition, index) => (
                    <Badge key={index} variant="secondary">
                      {condition}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Created {formatDistanceToNow(createdAt, { addSuffix: true })}
                </p>
              </CardContent>
            )}
            {conditions.length === 0 && (
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">No conditions set</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Created {formatDistanceToNow(createdAt, { addSuffix: true })}
                </p>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
