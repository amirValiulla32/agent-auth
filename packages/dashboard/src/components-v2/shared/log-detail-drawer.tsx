'use client';

import { X } from 'lucide-react';
import { SeverityBadge } from './severity-badge';
import type { AuditLogEvent } from '@/types';

interface LogDetailDrawerProps {
  event: AuditLogEvent | null;
  open: boolean;
  onClose: () => void;
}

export function LogDetailDrawer({ event, open, onClose }: LogDetailDrawerProps) {
  if (!open || !event) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#141414] border-l border-white/[0.06] z-50 overflow-y-auto transition-transform">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white/95">Log Details</h3>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5 text-white/50" />
            </button>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <Field label="Event ID" value={event.id} />
            <Field label="Timestamp" value={new Date(event.timestamp).toLocaleString()} />
            <Field label="Action" value={event.action} />
            <Field label="Severity">
              <SeverityBadge variant={event.severity} />
            </Field>
            <Field label="Actor Type" value={event.actorType} />
            <Field label="Actor ID" value={event.actorId} />
            {event.agentId && <Field label="Agent ID" value={event.agentId} />}
            <Field label="IP Address" value={event.ip} />

            {/* Metadata */}
            <div>
              <span className="text-xs text-white/50 uppercase tracking-wider">Metadata</span>
              <pre className="mt-1 p-3 bg-white/5 rounded-lg text-xs text-white/70 font-mono overflow-x-auto">
                {JSON.stringify(event.metadata, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <span className="text-xs text-white/50 uppercase tracking-wider">{label}</span>
      <div className="mt-0.5 text-sm text-white/90">
        {children || value}
      </div>
    </div>
  );
}
