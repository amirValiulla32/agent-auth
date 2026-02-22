'use client';

import { useState, useMemo } from 'react';

interface BarChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  height?: number;
  color?: string;
  formatValue?: (v: number) => string;
}

export function BarChart({
  data,
  height = 200,
  color = '#22c55e',
  formatValue = (v) => String(Math.round(v)),
}: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center text-white/30" style={{ height }}>
        No data
      </div>
    );
  }

  const barWidth = Math.min(80 / data.length, 12);
  const gap = (100 - barWidth * data.length) / (data.length + 1);

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((frac, i) => (
          <line
            key={i}
            x1="0"
            y1={100 - frac * 95}
            x2="100"
            y2={100 - frac * 95}
            stroke="white"
            strokeOpacity="0.06"
            strokeWidth="0.3"
          />
        ))}

        {/* Bars */}
        {data.map((d, i) => {
          const x = gap + i * (barWidth + gap);
          const barH = (d.value / maxValue) * 90;
          const y = 100 - barH;
          const barColor = d.color || color;
          const isHovered = hoveredIndex === i;

          return (
            <g key={i} onMouseEnter={() => setHoveredIndex(i)}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx="1"
                fill={barColor}
                fillOpacity={isHovered ? 0.9 : 0.7}
                className="transition-all duration-200"
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div
          className="absolute pointer-events-none bg-[#1f1f1f] border border-white/10 rounded px-2 py-1 text-xs text-white/90 whitespace-nowrap z-10"
          style={{
            left: `${gap + hoveredIndex * (barWidth + gap) + barWidth / 2}%`,
            top: `${(1 - data[hoveredIndex].value / maxValue) * 90 * (height / 100) - 32}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="font-medium">{formatValue(data[hoveredIndex].value)}</div>
          <div className="text-white/50">{data[hoveredIndex].label}</div>
        </div>
      )}

      {/* X Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-white/40 px-1 translate-y-4">
        {data.map((d, i) => (
          <span key={i} className="truncate text-center" style={{ width: `${100 / data.length}%` }}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
