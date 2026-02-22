'use client';

import { useState, useMemo } from 'react';
import type { TimeSeriesPoint } from '@/types';

interface LineChartProps {
  data: TimeSeriesPoint[];
  height?: number;
  color?: string;
  areaFill?: boolean;
  formatValue?: (v: number) => string;
  formatLabel?: (ts: string) => string;
}

export function LineChart({
  data,
  height = 200,
  color = '#22c55e',
  areaFill = false,
  formatValue = (v) => String(Math.round(v)),
  formatLabel = (ts) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
}: LineChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { points, pathD, areaD, yTicks, xLabels, minY, maxY } = useMemo(() => {
    if (!data.length) return { points: [], pathD: '', areaD: '', yTicks: [], xLabels: [], minY: 0, maxY: 0 };

    const values = data.map((d) => d.value);
    const minY = Math.min(...values);
    const maxY = Math.max(...values);
    const range = maxY - minY || 1;
    const padding = range * 0.1;
    const effectiveMin = minY - padding;
    const effectiveMax = maxY + padding;
    const effectiveRange = effectiveMax - effectiveMin;

    const w = 100;
    const h = 100;
    const marginLeft = 0;
    const marginRight = 0;
    const usableW = w - marginLeft - marginRight;

    const pts = data.map((d, i) => ({
      x: marginLeft + (i / (data.length - 1)) * usableW,
      y: h - ((d.value - effectiveMin) / effectiveRange) * h,
      value: d.value,
      timestamp: d.timestamp,
    }));

    const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const areaD = `${pathD} L${pts[pts.length - 1].x},${h} L${pts[0].x},${h} Z`;

    const tickCount = 4;
    const yTicks = Array.from({ length: tickCount }, (_, i) => {
      const val = effectiveMin + (effectiveRange / (tickCount - 1)) * i;
      return { value: val, y: h - ((val - effectiveMin) / effectiveRange) * h };
    });

    const labelStep = Math.max(1, Math.floor(data.length / 5));
    const xLabels = data
      .filter((_, i) => i % labelStep === 0 || i === data.length - 1)
      .map((d, _i, arr) => ({
        label: formatLabel(d.timestamp),
        x: marginLeft + (data.indexOf(d) / (data.length - 1)) * usableW,
      }));

    return { points: pts, pathD, areaD, yTicks, xLabels, minY: effectiveMin, maxY: effectiveMax };
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
        {/* Grid lines */}
        {yTicks.map((tick, i) => (
          <line
            key={i}
            x1="0"
            y1={tick.y}
            x2="100"
            y2={tick.y}
            stroke="white"
            strokeOpacity="0.06"
            strokeWidth="0.3"
          />
        ))}

        {/* Area fill */}
        {areaFill && (
          <path d={areaD} fill={color} fillOpacity="0.1" />
        )}

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
                ? (points[1]?.x ?? 100 - p.x) / 2 + p.x
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
