'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTools } from '@/lib/hooks/use-tools';
import type { CreateRuleInput } from '@/lib/hooks/use-rules';

const ruleSchema = z.object({
  tool: z.string().min(1, 'Tool is required'),
  scope: z.string().min(1, 'Scope is required'),
});

type RuleFormValues = z.infer<typeof ruleSchema>;

interface CreateRuleDialogProps {
  agentId: string;
  agentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateRuleInput) => Promise<any>;
}

export function CreateRuleDialog({
  agentId,
  agentName,
  open,
  onOpenChange,
  onSubmit,
}: CreateRuleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { tools, fetchToolsForAgent } = useTools(agentId);

  const form = useForm<RuleFormValues>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      tool: '',
      scope: '',
    },
  });

  // Get scopes for selected tool with safety checks
  const safeTools = Array.isArray(tools) ? tools : [];
  const selectedTool = safeTools.find(t => t.name === form.watch('tool'));
  const availableScopes = selectedTool?.scopes || [];

  // Fetch tools when dialog opens
  useEffect(() => {
    if (open && agentId) {
      fetchToolsForAgent(agentId);
    }
  }, [open, agentId, fetchToolsForAgent]);

  // Reset scope when tool changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'tool') {
        form.setValue('scope', '');
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = async (values: RuleFormValues) => {
    setIsSubmitting(true);

    const ruleData: CreateRuleInput = {
      agent_id: agentId,
      tool: values.tool,
      scope: values.scope,
    };

    const result = await onSubmit(ruleData);

    setIsSubmitting(false);

    if (result) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Permission Rule</DialogTitle>
          <DialogDescription>
            Create a new permission rule for {agentName}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tool"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tool</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tool" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {safeTools.length === 0 ? (
                        <SelectItem value="__no_tools__" disabled>
                          No tools registered
                        </SelectItem>
                      ) : (
                        safeTools.map((tool) => (
                          <SelectItem key={tool.id} value={tool.name}>
                            {tool.name}
                            {tool.description && (
                              <span className="text-xs text-muted-foreground ml-2">
                                ({tool.description})
                              </span>
                            )}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the tool this rule applies to
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scope</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedTool}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          selectedTool
                            ? "Select a scope"
                            : "Select a tool first"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableScopes.length === 0 ? (
                        <SelectItem value="__no_scopes__" disabled>
                          {selectedTool ? 'No scopes available' : 'Select a tool first'}
                        </SelectItem>
                      ) : (
                        availableScopes.map((scope) => (
                          <SelectItem key={scope} value={scope}>
                            {scope}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the scope to grant permission for
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Rule'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
