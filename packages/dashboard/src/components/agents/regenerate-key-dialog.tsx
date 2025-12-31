/**
 * Regenerate Key Dialog
 * Modal for regenerating an agent's API key with confirmation
 */

'use client';

import { useState } from 'react';
import { Agent } from '@agent-auth/shared';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ApiKeyDisplay } from '@/components/shared/api-key-display';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface RegenerateKeyDialogProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegenerate: (id: string) => Promise<Agent | null>;
}

/**
 * Dialog for regenerating an agent's API key
 * Two stages: Confirmation → New Key Display
 */
export function RegenerateKeyDialog({
  agent,
  open,
  onOpenChange,
  onRegenerate,
}: RegenerateKeyDialogProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [newAgent, setNewAgent] = useState<Agent | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const handleRegenerate = async () => {
    if (!agent) return;

    setIsRegenerating(true);
    try {
      const updated = await onRegenerate(agent.id);
      if (updated) {
        setNewAgent(updated);
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleClose = (open: boolean) => {
    // Only allow closing if not in the middle of regenerating
    // or if they've copied the new key
    if (!open && newAgent && !hasCopied) {
      // Don't close if they haven't copied the new key
      return;
    }

    if (!open) {
      // Reset state when closing
      setNewAgent(null);
      setHasCopied(false);
    }
    onOpenChange(open);
  };

  if (!agent) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {!newAgent ? (
          // Stage 1: Confirmation
          <>
            <DialogHeader>
              <DialogTitle>Regenerate API Key</DialogTitle>
              <DialogDescription>
                Are you sure you want to regenerate the API key for{' '}
                <strong>{agent.name}</strong>?
              </DialogDescription>
            </DialogHeader>

            <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <strong>Warning:</strong> This action will immediately invalidate the current API
                key. Any applications using the current key will stop working until updated with
                the new key.
              </AlertDescription>
            </Alert>

            <div className="rounded-lg bg-muted p-3 space-y-2">
              <p className="text-sm">
                <strong>Agent:</strong> {agent.name}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Current key will be invalidated</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Make sure you can update all applications using this key
              </p>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={isRegenerating}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRegenerate}
                disabled={isRegenerating}
              >
                {isRegenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Regenerate Key
              </Button>
            </DialogFooter>
          </>
        ) : (
          // Stage 2: Display new key
          <>
            <DialogHeader>
              <DialogTitle>New API Key Generated</DialogTitle>
              <DialogDescription>
                Save this API key now. You won't be able to see it again!
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Agent</p>
                <p className="text-sm text-muted-foreground">{newAgent.name}</p>
              </div>

              <div onMouseUp={() => setHasCopied(true)}>
                <ApiKeyDisplay apiKey={newAgent.api_key} label="New API Key" />
              </div>

              <Alert className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  <strong>Important:</strong> Copy this key now! Once you close this dialog, you
                  won't be able to see it again. The old key has been invalidated.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              {!hasCopied && (
                <p className="text-sm text-muted-foreground mr-auto">
                  Please copy the key first
                </p>
              )}
              <Button onClick={() => handleClose(false)} disabled={!hasCopied}>
                {hasCopied ? 'Done' : 'Copy Key First'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}