'use client';

import { useState, useMemo } from 'react';
import type { TimeSeriesPoint } from '@/types';

interface AreaChartProps {
  data: TimeSeriesPoint[];
  height?: number;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  formatValue?: (v: number) => string;
  formatLabel?: (ts: string) => string;
}

export function AreaChart({
  data,
  height = 200,
  color = '#22c55e',
  gradientFrom,
  gradientTo,
  formatValue = (v) => `$${v.toFixed(2)}`,
  formatLabel = (ts) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
}: AreaChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const gradientId = useMemo(() => `area-grad-${Math.random().toString(36).slice(2, 8)}`, []);

  const { points, pathD, areaD, xLabels } = useMemo(() => {
    if (!data.length) return { points: [], pathD: '', areaD: '', xLabels: [] };

    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const padding = range * 0.1;
    const effectiveMin = min - padding;
    const effectiveRange = range + padding * 2;

    const pts = data.map((d, i) => ({
      x: (i / (data.length - 1)) * 100,
      y: 100 - ((d.value - effectiveMin) / effectiveRange) * 100,
      value: d.value,
      timestamp: d.timestamp,
    }));

    const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const areaD = `${pathD} L100,100 L0,100 Z`;

    const labelStep = Math.max(1, Math.floor(data.length / 5));
    const xLabels = data
      .filter((_, i) => i % labelStep === 0 || i === data.length - 1)
      .map((d) => ({
        label: formatLabel(d.timestamp),
        x: (data.indexOf(d) / (data.length - 1)) * 100,
      }));

    return { points: pts, pathD, areaD, xLabels };
  }, [data, formatLabel]);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center text-white/30" style={{ height }}>
        No data
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientFrom || color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={gradientTo || color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((frac, i) => (
          <line
            key={i}
            x1="0"
            y1={frac * 100}
            x2="100"
            y2={frac * 100}
            stroke="white"
            strokeOpacity="0.06"
            strokeWidth="0.3"
          />
        ))}

        {/* Area fill with gradient */}
        <path d={areaD} fill={`url(#${gradientId})`} />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Hover zones */}
        {points.map((p, i) => (
          <rect
            key={i}
            x={i === 0 ? 0 : (points[i - 1].x + p.x) / 2}
            y="0"
            width={
              i === 0
                ? (points[1]?.x ?? 100) / 2
                : i === points.length - 1
                ? 100 - (points[i - 1].x + p.x) / 2
                : (points[i + 1]?.x - points[i - 1]?.x) / 2
            }
            height="100"
            fill="transparent"
            onMouseEnter={() => setHoveredIndex(i)}
          />
        ))}

        {/* Hover dot */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <circle
            cx={points[hoveredIndex].x}
            cy={points[hoveredIndex].y}
            r="1.5"
            fill={color}
            stroke="#090c0a"
            strokeWidth="0.5"
          />
        )}
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && points[hoveredIndex] && (
        <div
          className="absolute pointer-events-none bg-[#1f1f1f] border border-white/10 rounded px-2 py-1 text-xs text-white/90 whitespace-nowrap z-10"
          style={{
            left: `${points[hoveredIndex].x}%`,
            top: `${points[hoveredIndex].y * (height / 100) - 32}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="font-medium">{formatValue(points[hoveredIndex].value)}</div>
          <div className="text-white/50">{formatLabel(points[hoveredIndex].timestamp)}</div>
        </div>
      )}

      {/* X Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-white/40 px-1 translate-y-4">
        {xLabels.map((l, i) => (
          <span key={i}>{l.label}</span>
        ))}
      </div>
    </div>
  );
}
