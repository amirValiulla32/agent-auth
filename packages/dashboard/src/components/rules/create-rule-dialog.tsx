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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Circle, AlertTriangle, ShieldAlert, CircleSlash } from 'lucide-react';
import { useTools } from '@/lib/hooks/use-tools';
import type { CreateRuleInput } from '@/lib/hooks/use-rules';

const ruleSchema = z.object({
  tool: z.string().min(1, 'Tool is required'),
  scope: z.string().min(1, 'Scope is required'),
  require_reasoning: z.enum(['none', 'soft', 'hard']).optional(),
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
      require_reasoning: 'none',
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

  // Reset scope when tool changes, and auto-fill if only one scope
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'tool') {
        const tool = safeTools.find(t => t.name === value.tool);
        const scopes = tool?.scopes || [];

        if (scopes.length === 1) {
          // Auto-fill if only one scope available
          form.setValue('scope', scopes[0]);
        } else {
          // Reset if multiple scopes
          form.setValue('scope', '');
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, safeTools]);

  const handleSubmit = async (values: RuleFormValues) => {
    setIsSubmitting(true);

    const ruleData: CreateRuleInput = {
      agent_id: agentId,
      tool: values.tool,
      scope: values.scope,
      require_reasoning: values.require_reasoning || 'none',
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

            <FormField
              control={form.control}
              name="require_reasoning"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Reasoning Requirement</FormLabel>
                  <FormControl>
                    <div className="flex flex-col space-y-2">
                      <div
                        onClick={() => field.onChange('none')}
                        className="flex items-start space-x-3 space-y-0 rounded-md border p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center h-5 mt-0.5">
                          <div className={`aspect-square h-4 w-4 rounded-full border border-primary ${field.value === 'none' ? 'bg-primary' : ''} flex items-center justify-center`}>
                            {field.value === 'none' && <Circle className="h-2.5 w-2.5 fill-current text-primary-foreground" />}
                          </div>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <CircleSlash className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium leading-none">None - Optional</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Reasoning is optional. No warnings or blocks.
                          </p>
                        </div>
                      </div>
                      <div
                        onClick={() => field.onChange('soft')}
                        className="flex items-start space-x-3 space-y-0 rounded-md border p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center h-5 mt-0.5">
                          <div className={`aspect-square h-4 w-4 rounded-full border border-primary ${field.value === 'soft' ? 'bg-primary' : ''} flex items-center justify-center`}>
                            {field.value === 'soft' && <Circle className="h-2.5 w-2.5 fill-current text-primary-foreground" />}
                          </div>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-medium leading-none">Soft - Allow but flag</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Allow requests without reasoning, but flag them in audit logs for review.
                          </p>
                        </div>
                      </div>
                      <div
                        onClick={() => field.onChange('hard')}
                        className="flex items-start space-x-3 space-y-0 rounded-md border p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center h-5 mt-0.5">
                          <div className={`aspect-square h-4 w-4 rounded-full border border-primary ${field.value === 'hard' ? 'bg-primary' : ''} flex items-center justify-center`}>
                            {field.value === 'hard' && <Circle className="h-2.5 w-2.5 fill-current text-primary-foreground" />}
                          </div>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium leading-none">Hard - Block without reasoning</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Block requests that don't include reasoning. Forces agents to explain actions.
                          </p>
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Control whether agents must explain why they need this permission
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
