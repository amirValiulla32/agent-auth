'use client';

import { cn } from '@/lib/utils';

interface AreaChartProps {
  data: { timestamp: Date; value: number }[];
  height?: number;
  color?: string;
  showGrid?: boolean;
  showPoints?: boolean;
}

export function AreaChart({
  data,
  height = 300,
  color = 'emerald',
  showGrid = true,
  showPoints = false,
}: AreaChartProps) {
  if (data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;

  const width = 100;
  const padding = 5;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
    const y = height - padding - ((d.value - min) / range) * (height - 2 * padding);
    return { x, y, value: d.value };
  });

  const linePath = `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`;
  const areaPath = `${linePath} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;

  const colors = {
    emerald: {
      stroke: 'rgb(52, 211, 153)',
      fill: 'emerald',
      gradient: ['rgb(52, 211, 153)', 'rgb(6, 182, 212)'],
    },
    blue: {
      stroke: 'rgb(96, 165, 250)',
      fill: 'blue',
      gradient: ['rgb(96, 165, 250)', 'rgb(59, 130, 246)'],
    },
    purple: {
      stroke: 'rgb(192, 132, 252)',
      fill: 'purple',
      gradient: ['rgb(192, 132, 252)', 'rgb(168, 85, 247)'],
    },
    orange: {
      stroke: 'rgb(251, 146, 60)',
      fill: 'orange',
      gradient: ['rgb(251, 146, 60)', 'rgb(239, 68, 68)'],
    },
  };

  const colorConfig = colors[color as keyof typeof colors] || colors.emerald;

  return (
    <div className="relative h-full w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full"
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        {showGrid && (
          <>
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={`h-${y}`}
                x1={padding}
                y1={(y / 100) * (height - 2 * padding) + padding}
                x2={width - padding}
                y2={(y / 100) * (height - 2 * padding) + padding}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="0.5"
              />
            ))}
            {data.length > 10 &&
              Array.from({ length: 5 }).map((_, i) => {
                const x = (i / 4) * (width - 2 * padding) + padding;
                return (
                  <line
                    key={`v-${i}`}
                    x1={x}
                    y1={padding}
                    x2={x}
                    y2={height - padding}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="0.5"
                  />
                );
              })}
          </>
        )}

        {/* Gradient definition */}
        <defs>
          <linearGradient id={`areaGradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colorConfig.gradient[0]} stopOpacity="0.3" />
            <stop offset="100%" stopColor={colorConfig.gradient[1]} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area */}
        <path d={areaPath} fill={`url(#areaGradient-${color})`} />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={colorConfig.stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {showPoints &&
          points.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="3"
              fill={colorConfig.stroke}
              className="transition-all hover:r-4"
            >
              <title>{point.value}</title>
            </circle>
          ))}
      </svg>
    </div>
  );
}
