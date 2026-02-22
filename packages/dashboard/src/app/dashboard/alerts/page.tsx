'use client';

import { HeaderV2 } from "@/components-v2/header";
import { SeverityBadge } from "@/components-v2/shared/severity-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlerts } from "@/lib/hooks/use-data-provider";
import { useAuth } from "@/lib/auth";
import { Bell } from "lucide-react";

export default function AlertsPage() {
  const { alerts, loading, updateStatus } = useAlerts();
  const { can } = useAuth();
  const canManage = can('manage_alerts');

  return (
    <div className="flex flex-col h-full bg-[#141414]">
      <HeaderV2 title="Alerts" description="Monitor and manage system alerts" />

      <div className="flex-1 p-8">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg bg-white/5" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/30">
            <Bell className="h-10 w-10 mb-3" />
            <p className="text-sm">No alerts</p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/8 bg-[#1f1f1f] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Type</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Severity</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Message</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Created</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Status</th>
                  {canManage && (
                    <th className="text-right text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm text-white/70">{alert.type.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <SeverityBadge variant={alert.severity} />
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-white/80 truncate">{alert.message}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-white/50">{new Date(alert.createdAt).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <SeverityBadge variant={alert.status} />
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {alert.status === 'open' && (
                            <button
                              onClick={() => updateStatus(alert.id, 'acknowledged')}
                              className="text-xs px-2.5 py-1 rounded-md border border-white/[0.06] text-white/60 hover:text-white/90 hover:bg-white/5 transition-all duration-200"
                            >
                              Acknowledge
                            </button>
                          )}
                          {(alert.status === 'open' || alert.status === 'acknowledged') && (
                            <button
                              onClick={() => updateStatus(alert.id, 'resolved')}
                              className="text-xs px-2.5 py-1 rounded-md border border-[#166534]/30 text-[#22c55e]/80 hover:text-[#22c55e] hover:bg-[#166534]/10 transition-all duration-200"
                            >
                              Resolve
                            </button>
                          )}
                          {alert.status === 'acknowledged' && (
                            <button
                              onClick={() => updateStatus(alert.id, 'open')}
                              className="text-xs px-2.5 py-1 rounded-md border border-white/[0.06] text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-200"
                            >
                              Reopen
                            </button>
                          )}
                          {alert.status === 'resolved' && (
                            <button
                              onClick={() => updateStatus(alert.id, 'open')}
                              className="text-xs px-2.5 py-1 rounded-md border border-white/[0.06] text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-200"
                            >
                              Reopen
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
