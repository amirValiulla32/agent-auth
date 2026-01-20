'use client';

import { cn } from '@/lib/utils';

interface MiniChartProps {
  data: number[];
  height?: number;
  color?: string;
  filled?: boolean;
}

export function MiniChart({
  data,
  height = 60,
  color = 'emerald',
  filled = false,
}: MiniChartProps) {
  if (data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const width = 200;
  const step = width / (data.length - 1);

  const points = data.map((value, index) => {
    const x = index * step;
    const y = height - ((value - min) / range) * height;
    return { x, y };
  });

  const linePath = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  const areaPath = filled
    ? `${linePath} L ${width},${height} L 0,${height} Z`
    : '';

  const colorClasses = {
    emerald: 'stroke-emerald-400 fill-emerald-400/20',
    blue: 'stroke-blue-400 fill-blue-400/20',
    purple: 'stroke-purple-400 fill-purple-400/20',
    orange: 'stroke-orange-400 fill-orange-400/20',
  }[color] || 'stroke-emerald-400 fill-emerald-400/20';

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="overflow-visible"
    >
      {filled && (
        <path
          d={areaPath}
          className={cn('transition-all duration-300', colorClasses)}
        />
      )}
      <path
        d={linePath}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn('transition-all duration-300', colorClasses.split(' ')[0])}
      />
    </svg>
  );
}

interface BarChartProps {
  data: number[];
  height?: number;
  color?: string;
}

export function MiniBarChart({ data, height = 60, color = 'emerald' }: BarChartProps) {
  if (data.length === 0) return null;

  const max = Math.max(...data);

  const colorClasses = {
    emerald: 'fill-emerald-400',
    blue: 'fill-blue-400',
    purple: 'fill-purple-400',
    orange: 'fill-orange-400',
  }[color] || 'fill-emerald-400';

  const barWidth = 100 / data.length;

  return (
    <svg width="100%" height={height} className="overflow-visible">
      {data.map((value, index) => {
        const barHeight = (value / max) * height;
        const x = index * barWidth;
        const y = height - barHeight;

        return (
          <rect
            key={index}
            x={`${x}%`}
            y={y}
            width={`${barWidth * 0.8}%`}
            height={barHeight}
            className={cn('transition-all duration-300', colorClasses)}
            rx="2"
          />
        );
      })}
    </svg>
  );
}
