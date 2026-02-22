'use client';

import { HeaderV2 } from "@/components-v2/header";
import { SeverityBadge } from "@/components-v2/shared/severity-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeam } from "@/lib/hooks/use-data-provider";
import { useAuth } from "@/lib/auth";
import { UsersRound } from "lucide-react";
import type { UserRole } from "@/types";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'agent_owner', label: 'Agent Owner' },
  { value: 'viewer', label: 'Viewer' },
];

const ROLE_BADGE_VARIANT: Record<UserRole, 'active' | 'info' | 'disabled'> = {
  admin: 'active',
  agent_owner: 'info',
  viewer: 'disabled',
};

export default function TeamPage() {
  const { users, loading, updateRole } = useTeam();
  const { can, currentUser } = useAuth();
  const canManageRoles = can('manage_roles');

  return (
    <div className="flex flex-col h-full bg-[#141414]">
      <HeaderV2 title="Team" description="Manage team members and roles" />

      <div className="flex-1 p-8">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg bg-white/5" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/30">
            <UsersRound className="h-10 w-10 mb-3" />
            <p className="text-sm">No team members</p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/8 bg-[#1f1f1f] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Email</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = user.id === currentUser.id;
                  return (
                    <tr
                      key={user.id}
                      className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-[#171b19] border border-white/[0.06] flex items-center justify-center">
                            <span className="text-xs font-semibold text-white/90">
                              {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white/90">{user.name}</p>
                            {isSelf && <span className="text-[10px] text-white/30">You</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-white/60">{user.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        {canManageRoles && !isSelf ? (
                          <select
                            value={user.role}
                            onChange={(e) => updateRole(user.id, e.target.value as UserRole)}
                            className="text-xs px-2 py-1 bg-white/5 border border-white/[0.06] rounded-md text-white/80 focus:outline-none focus:border-[#166534] transition-colors cursor-pointer"
                          >
                            {ROLE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : (
                          <SeverityBadge
                            variant={ROLE_BADGE_VARIANT[user.role]}
                            label={ROLE_OPTIONS.find((r) => r.value === user.role)?.label ?? user.role}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
