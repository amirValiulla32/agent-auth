'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Bot,
  MoreVertical,
  Eye,
  EyeOff,
  Copy,
  Power,
  Trash2,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MockAgent } from '@/lib/showcase/mock-data';

interface PremiumAgentCardProps {
  agent: MockAgent;
}

const statusConfig = {
  active: {
    color: 'emerald',
    bg: 'bg-emerald-400/10',
    text: 'text-emerald-400',
    border: 'border-emerald-400/20',
    label: 'Active',
  },
  idle: {
    color: 'blue',
    bg: 'bg-blue-400/10',
    text: 'text-blue-400',
    border: 'border-blue-400/20',
    label: 'Idle',
  },
  error: {
    color: 'red',
    bg: 'bg-red-400/10',
    text: 'text-red-400',
    border: 'border-red-400/20',
    label: 'Error',
  },
  paused: {
    color: 'orange',
    bg: 'bg-orange-400/10',
    text: 'text-orange-400',
    border: 'border-orange-400/20',
    label: 'Paused',
  },
};

export function PremiumAgentCard({ agent }: PremiumAgentCardProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const config = statusConfig[agent.status];
  const maskedKey = agent.apiKey.slice(0, 10) + '•'.repeat(20) + agent.apiKey.slice(-8);

  const copyApiKey = () => {
    navigator.clipboard.writeText(agent.apiKey);
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#1f1f1f] to-[#141414] transition-all duration-300 hover:border-white/[0.12] hover:shadow-xl hover:shadow-white/5">
      {/* Background gradient effect */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400/10 to-cyan-400/10 opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />

      {/* Content */}
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400">
              <Bot className="h-6 w-6 text-[#141414]" />
            </div>

            {/* Info */}
            <div>
              <h3 className="font-semibold text-white">{agent.name}</h3>
              <p className="mt-1 text-sm text-white/60">{agent.id}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-10 z-10 w-48 rounded-lg border border-white/[0.08] bg-[#1f1f1f] p-1 shadow-xl">
                <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white">
                  <Power className="h-4 w-4" />
                  Toggle Status
                </button>
                <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white">
                  <Copy className="h-4 w-4" />
                  Duplicate
                </button>
                <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-400/10">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-4 flex items-center gap-2">
          <div className={cn('flex items-center gap-2 rounded-lg border px-3 py-1.5', config.bg, config.border)}>
            <div className={cn('h-2 w-2 rounded-full', config.text.replace('text-', 'bg-'))} />
            <span className={cn('text-sm font-medium', config.text)}>{config.label}</span>
          </div>
          {agent.tags.map((tag) => (
            <div
              key={tag}
              className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-sm text-white/60"
            >
              {tag}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-white/60">Requests</p>
            <p className="mt-1 text-2xl font-bold text-white">{agent.requestCount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-white/60">Success Rate</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">{agent.successRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* API Key */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">API Key</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-white/60 transition-colors hover:text-white"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                onClick={copyApiKey}
                className="text-white/60 transition-colors hover:text-white"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-2 overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 font-mono text-sm text-white/80">
            {showApiKey ? agent.apiKey : maskedKey}
          </div>
        </div>

        {/* Permissions */}
        <div className="mt-6">
          <p className="text-sm text-white/60">Permissions</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {agent.permissions.map((permission) => (
              <div
                key={permission}
                className="flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-xs text-white/80"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                {permission}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-4">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Activity className="h-3.5 w-3.5" />
            Last active {formatDistanceToNow(agent.lastActive, { addSuffix: true })}
          </div>
          <button className="text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300">
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
}
