'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { CreateToolInput } from '@/lib/hooks/use-tools';

const toolSchema = z.object({
  name: z.string().min(1, 'Tool name is required').regex(/^[a-z_]+$/, 'Use lowercase letters and underscores only'),
  scopes: z.string().min(1, 'At least one scope is required'),
  description: z.string().optional(),
});

type ToolFormValues = z.infer<typeof toolSchema>;

interface CreateToolDialogProps {
  agentId: string;
  agentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateToolInput) => Promise<any>;
}

export function CreateToolDialog({
  agentId,
  agentName,
  open,
  onOpenChange,
  onSubmit,
}: CreateToolDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ToolFormValues>({
    resolver: zodResolver(toolSchema),
    defaultValues: {
      name: '',
      scopes: '',
      description: '',
    },
  });

  const handleSubmit = async (values: ToolFormValues) => {
    setIsSubmitting(true);

    // Parse scopes from comma-separated string
    const scopes = values.scopes
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const toolData: CreateToolInput = {
      agent_id: agentId,
      name: values.name.trim(),
      scopes,
      description: values.description?.trim() || undefined,
    };

    const result = await onSubmit(toolData);

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
          <DialogTitle>Register New Tool</DialogTitle>
          <DialogDescription>
            Define a custom tool for {agentName} with its available actions
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tool Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., crm, patient_records, deployment_pipeline"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Use lowercase letters and underscores (e.g., "crm", "patient_records")
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scopes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scopes</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., read:contacts, write:deals, delete:accounts"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Comma-separated list of scopes this tool supports
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Customer relationship management system"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Brief description of what this tool does
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
                {isSubmitting ? 'Creating...' : 'Create Tool'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
