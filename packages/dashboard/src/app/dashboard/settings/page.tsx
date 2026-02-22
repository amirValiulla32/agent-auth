'use client';

import { HeaderV2 } from "@/components-v2/header";
import { useAuth } from "@/lib/auth";
import type { UserRole } from "@/types";

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'admin', label: 'Admin', description: 'Full access to all features and settings' },
  { value: 'agent_owner', label: 'Agent Owner', description: 'Can manage own agents, read-only on budgets and roles' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access everywhere, no mutations or exports' },
];

const isMock = process.env.NEXT_PUBLIC_DATA_PROVIDER !== 'worker';

export default function SettingsPage() {
  const { currentUser, setRole } = useAuth();

  return (
    <div className="flex flex-col h-full bg-[#141414]">
      <HeaderV2 title="Settings" description="Dashboard configuration and role testing" />

      <div className="flex-1 p-8 space-y-8 max-w-2xl">
        {/* Role Switcher — mock/dev only */}
        {isMock && (
          <div className="rounded-xl border border-yellow-500/20 bg-[#1f1f1f] p-6">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-white/95">Role Simulation</h3>
              <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">Dev Only</span>
            </div>
            <p className="text-xs text-white/50 mb-5">Switch roles to test RBAC across the dashboard. This section is only visible when using the mock data provider.</p>

            <div className="space-y-2">
              {ROLES.map((role) => (
                <button
                  key={role.value}
                  onClick={() => setRole(role.value)}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all duration-200 text-left ${
                    currentUser.role === role.value
                      ? 'border-[#166534] bg-[#166534]/10'
                      : 'border-white/[0.06] hover:border-white/15 hover:bg-white/[0.03]'
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-white/95">{role.label}</p>
                    <p className="text-xs text-white/50 mt-0.5">{role.description}</p>
                  </div>
                  {currentUser.role === role.value && (
                    <div className="h-2 w-2 rounded-full bg-[#22c55e]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Environment Info */}
        <div className="rounded-xl border border-white/8 bg-[#1f1f1f] p-6">
          <h3 className="text-sm font-semibold text-white/95 mb-4">Environment</h3>
          <div className="space-y-3">
            <EnvRow label="Data Provider" value={process.env.NEXT_PUBLIC_DATA_PROVIDER || 'mock'} />
            <EnvRow label="API Base URL" value={process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8787'} />
            <EnvRow label="Current User" value={`${currentUser.name} (${currentUser.email})`} />
            <EnvRow label="Current Role" value={currentUser.role} />
          </div>
        </div>
      </div>
    </div>
  );
}

function EnvRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
      <span className="text-xs text-white/50">{label}</span>
      <span className="text-xs text-white/70 font-mono">{value}</span>
    </div>
  );
}
