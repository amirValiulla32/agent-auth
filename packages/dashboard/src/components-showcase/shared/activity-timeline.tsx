'use client';

import { formatDistanceToNow } from 'date-fns';
import { Bot, CheckCircle, XCircle, PauseCircle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActivityEvent } from '@/lib/showcase/mock-data';

interface ActivityTimelineProps {
  events: ActivityEvent[];
  maxItems?: number;
}

const eventConfig = {
  agent_created: {
    icon: Bot,
    color: 'emerald',
    bgColor: 'bg-emerald-400/10',
    iconColor: 'text-emerald-400',
  },
  request_approved: {
    icon: CheckCircle,
    color: 'emerald',
    bgColor: 'bg-emerald-400/10',
    iconColor: 'text-emerald-400',
  },
  request_denied: {
    icon: XCircle,
    color: 'red',
    bgColor: 'bg-red-400/10',
    iconColor: 'text-red-400',
  },
  agent_paused: {
    icon: PauseCircle,
    color: 'orange',
    bgColor: 'bg-orange-400/10',
    iconColor: 'text-orange-400',
  },
  permission_granted: {
    icon: ShieldCheck,
    color: 'blue',
    bgColor: 'bg-blue-400/10',
    iconColor: 'text-blue-400',
  },
};

export function ActivityTimeline({ events, maxItems = 10 }: ActivityTimelineProps) {
  const displayEvents = events.slice(0, maxItems);

  return (
    <div className="space-y-4">
      {displayEvents.map((event, index) => {
        const config = eventConfig[event.type];
        const Icon = config.icon;

        return (
          <div
            key={event.id}
            className="group relative flex gap-4 rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04]"
          >
            {/* Timeline line */}
            {index < displayEvents.length - 1 && (
              <div className="absolute left-9 top-16 h-[calc(100%+1rem)] w-px bg-white/[0.08]" />
            )}

            {/* Icon */}
            <div className={cn(
              'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110',
              config.bgColor
            )}>
              <Icon className={cn('h-5 w-5', config.iconColor)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {event.agentName}
                  </p>
                  <p className="mt-1 text-sm text-white/60">
                    {event.description}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-white/40">
                  {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                </time>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
