/**
 * Edit Agent Dialog
 * Modal form for editing existing AI agents
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Agent } from '@agent-auth/shared';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { updateAgentSchema, UpdateAgentInput } from '@/lib/validators/agent';
import { Loader2 } from 'lucide-react';

interface EditAgentDialogProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, data: UpdateAgentInput) => Promise<Agent | null>;
}

/**
 * Dialog for editing an existing agent
 * Pre-populates form with current agent data
 */
export function EditAgentDialog({
  agent,
  open,
  onOpenChange,
  onSubmit,
}: EditAgentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateAgentInput>({
    resolver: zodResolver(updateAgentSchema),
    defaultValues: {
      name: '',
      enabled: true,
    },
  });

  // Update form when agent changes
  useEffect(() => {
    if (agent) {
      form.reset({
        name: agent.name,
        enabled: agent.enabled,
      });
    }
  }, [agent, form]);

  const handleSubmit = async (data: UpdateAgentInput) => {
    if (!agent) return;

    setIsSubmitting(true);
    try {
      const updated = await onSubmit(agent.id, data);
      if (updated) {
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!agent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Agent</DialogTitle>
          <DialogDescription>
            Update the agent's name or status. The API key cannot be changed.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Production Assistant"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    A descriptive name to identify this agent
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Enabled</FormLabel>
                    <FormDescription>
                      {field.value
                        ? 'Agent can make API requests'
                        : 'Agent is disabled and cannot make requests'}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                <strong>Agent ID:</strong> {agent.id}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Created:</strong> {new Date(agent.created_at).toLocaleDateString()}
              </p>
              {agent.updated_at && (
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Last Updated:</strong> {new Date(agent.updated_at).toLocaleDateString()}
                </p>
              )}
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
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}