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
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useTools } from '@/lib/hooks/use-tools';
import type { CreateRuleInput } from '@/lib/hooks/use-rules';

const ruleSchema = z.object({
  tool: z.string().min(1, 'Tool is required'),
  action: z.string().min(1, 'Action is required'),
  max_duration: z.coerce.number().optional(),
  max_attendees: z.coerce.number().optional(),
  business_hours_only: z.boolean().default(false),
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
      action: '',
      business_hours_only: false,
    },
  });

  // Get actions for selected tool with safety checks
  const safeTools = Array.isArray(tools) ? tools : [];
  const selectedTool = safeTools.find(t => t.name === form.watch('tool'));
  const availableActions = selectedTool?.actions || [];

  // Fetch tools when dialog opens
  useEffect(() => {
    if (open && agentId) {
      fetchToolsForAgent(agentId);
    }
  }, [open, agentId, fetchToolsForAgent]);

  // Reset action when tool changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'tool') {
        form.setValue('action', '');
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = async (values: RuleFormValues) => {
    setIsSubmitting(true);

    const ruleData: CreateRuleInput = {
      agent_id: agentId,
      tool: values.tool,
      action: values.action,
      conditions: {
        max_duration: values.max_duration,
        max_attendees: values.max_attendees,
        business_hours_only: values.business_hours_only,
      },
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
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedTool}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          selectedTool
                            ? "Select an action"
                            : "Select a tool first"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableActions.length === 0 ? (
                        <SelectItem value="__no_actions__" disabled>
                          {selectedTool ? 'No actions available' : 'Select a tool first'}
                        </SelectItem>
                      ) : (
                        availableActions.map((action) => (
                          <SelectItem key={action} value={action}>
                            {action}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the action to control
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-medium">Conditions (Optional)</h4>

              <FormField
                control={form.control}
                name="max_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 60"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum event duration in minutes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_attendees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Attendees</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 10"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum number of attendees
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="business_hours_only"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Business Hours Only</FormLabel>
                      <FormDescription>
                        Restrict events to business hours (9 AM - 5 PM)
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

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
