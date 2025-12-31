/**
 * Create Agent Dialog
 * Modal form for creating new AI agents
 */

'use client';

import { useState } from 'react';
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
import { ApiKeyDisplay } from '@/components/shared/api-key-display';
import { createAgentSchema, CreateAgentInput } from '@/lib/validators/agent';
import { Loader2 } from 'lucide-react';

interface CreateAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAgentInput) => Promise<Agent | null>;
}

/**
 * Dialog for creating a new agent
 * Shows form initially, then displays API key after successful creation
 */
export function CreateAgentDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateAgentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAgent, setCreatedAgent] = useState<Agent | null>(null);

  const form = useForm<CreateAgentInput>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      name: '',
      enabled: true,
    },
  });

  const handleSubmit = async (data: CreateAgentInput) => {
    setIsSubmitting(true);
    try {
      const agent = await onSubmit(data);
      if (agent) {
        setCreatedAgent(agent);
        form.reset();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      // Reset state when closing
      setCreatedAgent(null);
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        {!createdAgent ? (
          // Show form
          <>
            <DialogHeader>
              <DialogTitle>Create New Agent</DialogTitle>
              <DialogDescription>
                Create a new AI agent that can access your APIs with specific permissions.
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
                          Agent can make API requests when enabled
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

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleClose(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Agent
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : (
          // Show API key after creation
          <>
            <DialogHeader>
              <DialogTitle>Agent Created Successfully</DialogTitle>
              <DialogDescription>
                Save this API key now. You won't be able to see it again!
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Agent Name</p>
                <p className="text-sm text-muted-foreground">{createdAgent.name}</p>
              </div>

              <ApiKeyDisplay apiKey={createdAgent.api_key} label="API Key" />

              <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-3">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  ⚠️ Make sure to copy this API key now. You won't be able to see it again!
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => handleClose(false)}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}