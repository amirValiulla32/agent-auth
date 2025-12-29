/**
 * API Key Display Component
 * Secure display of API keys with copy and reveal functionality
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Eye, EyeOff, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { maskText } from '@/lib/utils/format';

interface ApiKeyDisplayProps {
  apiKey: string;
  label?: string;
  className?: string;
}

/**
 * Displays API key with secure masking, reveal, and copy functionality
 *
 * @example
 * ```tsx
 * <ApiKeyDisplay
 *   apiKey="ak_1234567890abcdef1234567890abcdef"
 *   label="API Key"
 * />
 * ```
 */
export function ApiKeyDisplay({
  apiKey,
  label = 'API Key',
  className = '',
}: ApiKeyDisplayProps) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayValue = revealed ? apiKey : maskText(apiKey, 6);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      toast({
        title: 'Copied to clipboard',
        description: 'API key has been copied to your clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy API key to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const toggleReveal = () => {
    setRevealed(!revealed);
  };

  return (
    <div className={className}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={revealed ? 'text' : 'password'}
            value={displayValue}
            readOnly
            className="font-mono pr-10"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={toggleReveal}
          title={revealed ? 'Hide API key' : 'Reveal API key'}
        >
          {revealed ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleCopy}
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
