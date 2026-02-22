'use client';

import { useState } from "react";
import { HeaderV2 } from "@/components-v2/header";
import { ProgressBar } from "@/components-v2/shared/progress-bar";
import { SeverityBadge } from "@/components-v2/shared/severity-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBudgets } from "@/lib/hooks/use-data-provider";
import { useAuth } from "@/lib/auth";
import { Wallet, X } from "lucide-react";
import type { Budget, UpdateBudgetPayload, BudgetBehavior } from "@/types";

const BEHAVIOR_OPTIONS: { value: BudgetBehavior; label: string }[] = [
  { value: 'alert_only', label: 'Alert Only' },
  { value: 'rate_limit', label: 'Rate Limit' },
  { value: 'disable', label: 'Disable Agent' },
];

export default function BudgetsPage() {
  const { budgets, loading, updateBudget } = useBudgets();
  const { can } = useAuth();
  const canEdit = can('manage_budgets');
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  return (
    <div className="flex flex-col h-full bg-[#141414]">
      <HeaderV2 title="Budgets" description="Manage spending limits and cost controls" />

      <div className="flex-1 p-8">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg bg-white/5" />
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/30">
            <Wallet className="h-10 w-10 mb-3" />
            <p className="text-sm">No budgets configured</p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/8 bg-[#1f1f1f] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Scope</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Period</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Limit</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Spent</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3 min-w-[160px]">Usage</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Behavior</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Thresholds</th>
                  {canEdit && (
                    <th className="text-right text-xs font-medium text-white/50 uppercase tracking-wider px-6 py-3">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {budgets.map((budget) => {
                  const usage = budget.limitUsd > 0 ? (budget.spentUsd / budget.limitUsd) * 100 : 0;
                  return (
                    <tr
                      key={budget.id}
                      className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <SeverityBadge
                            variant={budget.scope === 'org' ? 'prod' : budget.scope === 'team' ? 'info' : 'dev'}
                            label={budget.scope.toUpperCase()}
                          />
                          <p className="text-xs text-white/40 mt-1">{budget.scopeId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-white/70 capitalize">{budget.period}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-white/90 font-medium">${budget.limitUsd.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-white/70">${budget.spentUsd.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <ProgressBar value={usage} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-white/60">{budget.behavior.replace(/_/g, ' ')}</span>
                      </td>
                      <td className="px-6 py-4">
                        {budget.thresholds?.length ? (
                          <span className="text-xs text-white/50">{budget.thresholds.join('%, ')}%</span>
                        ) : (
                          <span className="text-xs text-white/30">—</span>
                        )}
                      </td>
                      {canEdit && (
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setEditingBudget(budget)}
                            className="text-xs px-2.5 py-1 rounded-md border border-white/[0.06] text-white/60 hover:text-white/90 hover:bg-white/5 transition-all duration-200"
                          >
                            Edit
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingBudget && (
        <EditBudgetModal
          budget={editingBudget}
          onClose={() => setEditingBudget(null)}
          onSave={async (payload) => {
            await updateBudget(editingBudget.id, payload);
            setEditingBudget(null);
          }}
        />
      )}
    </div>
  );
}

function EditBudgetModal({
  budget,
  onClose,
  onSave,
}: {
  budget: Budget;
  onClose: () => void;
  onSave: (payload: UpdateBudgetPayload) => Promise<void>;
}) {
  const [limitUsd, setLimitUsd] = useState(String(budget.limitUsd));
  const [behavior, setBehavior] = useState<BudgetBehavior>(budget.behavior);
  const [thresholds, setThresholds] = useState(budget.thresholds?.join(', ') ?? '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(limitUsd);
    if (isNaN(limit) || limit <= 0) return;

    const parsedThresholds = thresholds
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n >= 0 && n <= 100);

    setSaving(true);
    await onSave({
      limitUsd: limit,
      behavior,
      thresholds: parsedThresholds.length > 0 ? parsedThresholds : undefined,
    });
    setSaving(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-[#1f1f1f] border border-white/8 rounded-xl p-6 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/95">Edit Budget</h3>
            <button type="button" onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors">
              <X className="h-4 w-4 text-white/50" />
            </button>
          </div>

          <div>
            <label className="text-xs text-white/50 block mb-1">Limit (USD)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={limitUsd}
              onChange={(e) => setLimitUsd(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white/5 border border-white/[0.06] rounded-lg text-white/90 focus:outline-none focus:border-[#166534] transition-colors"
            />
            <p className="text-[10px] text-white/30 mt-1">Must be greater than 0</p>
          </div>

          <div>
            <label className="text-xs text-white/50 block mb-1">Behavior</label>
            <select
              value={behavior}
              onChange={(e) => setBehavior(e.target.value as BudgetBehavior)}
              className="w-full px-3 py-2 text-sm bg-white/5 border border-white/[0.06] rounded-lg text-white/90 focus:outline-none focus:border-[#166534] transition-colors"
            >
              {BEHAVIOR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-white/50 block mb-1">Thresholds (%)</label>
            <input
              type="text"
              value={thresholds}
              onChange={(e) => setThresholds(e.target.value)}
              placeholder="e.g. 70, 85, 95"
              className="w-full px-3 py-2 text-sm bg-white/5 border border-white/[0.06] rounded-lg text-white/90 placeholder:text-white/20 focus:outline-none focus:border-[#166534] transition-colors"
            />
            <p className="text-[10px] text-white/30 mt-1">Comma-separated values between 0 and 100</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs px-4 py-2 rounded-lg border border-white/[0.06] text-white/60 hover:text-white/90 hover:bg-white/5 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="text-xs px-4 py-2 rounded-lg bg-[#166534] text-white hover:bg-[#166534]/80 transition-all duration-200 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
