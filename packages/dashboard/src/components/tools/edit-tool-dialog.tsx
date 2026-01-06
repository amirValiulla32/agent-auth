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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Tool } from '@agent-auth/shared';
import type { CreateToolInput } from '@/lib/hooks/use-tools';

const toolSchema = z.object({
  name: z.string().min(1, 'Tool name is required').regex(/^[a-z_]+$/, 'Use lowercase letters and underscores only'),
  scopes: z.string().min(1, 'At least one scope is required'),
  description: z.string().optional(),
});

type ToolFormValues = z.infer<typeof toolSchema>;

interface EditToolDialogProps {
  tool: Tool | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, data: Partial<CreateToolInput>) => Promise<any>;
}

export function EditToolDialog({
  tool,
  open,
  onOpenChange,
  onSubmit,
}: EditToolDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ToolFormValues>({
    resolver: zodResolver(toolSchema),
    defaultValues: {
      name: '',
      scopes: '',
      description: '',
    },
  });

  // Update form when tool changes or dialog opens
  useEffect(() => {
    if (tool && open) {
      form.reset({
        name: tool.name,
        scopes: tool.scopes.join(', '),
        description: tool.description || '',
      });
    }
  }, [tool, open, form]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset({
        name: '',
        scopes: '',
        description: '',
      });
      setIsSubmitting(false);
    }
  }, [open, form]);

  const handleSubmit = async (values: ToolFormValues) => {
    if (!tool) return;

    setIsSubmitting(true);

    // Parse scopes from comma-separated string
    const scopes = values.scopes
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const toolData: Partial<CreateToolInput> = {
      agent_id: tool.agent_id,
      name: values.name.trim(),
      scopes,
      description: values.description?.trim() || undefined,
    };

    const result = await onSubmit(tool.id, toolData);

    setIsSubmitting(false);

    if (result) {
      onOpenChange(false);
    }
  };

  if (!tool) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Tool</DialogTitle>
          <DialogDescription>
            Update the tool configuration
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                {isSubmitting ? 'Updating...' : 'Update Tool'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
