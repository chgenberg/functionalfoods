"use client";
import React from 'react';

export interface RadarChartProps {
  labels: string[]; // length N
  values: number[]; // length N, range 0..10
  max?: number; // default 10
  size?: number; // px
  color?: string; // stroke color
}

export default function RadarChart({ labels, values, max = 10, size = 260, color = '#10b981' }: RadarChartProps) {
  const N = Math.min(labels.length, values.length);
  const radius = size / 2 - 24;
  const center = size / 2;
  const angleStep = (Math.PI * 2) / N;

  const points = Array.from({ length: N }).map((_, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const r = (Math.max(0, Math.min(values[i], max)) / max) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  });

  const polygon = points.map(p => `${p.x},${p.y}`).join(' ');

  const gridLevels = 4;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Radar chart">
      {/* axes */}
      {Array.from({ length: N }).map((_, i) => {
        const angle = -Math.PI / 2 + i * angleStep;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return <line key={`axis-${i}`} x1={center} y1={center} x2={x} y2={y} stroke="#e5e7eb" strokeWidth={1} />;
      })}
      {/* grid */}
      {Array.from({ length: gridLevels }).map((_, level) => {
        const r = radius * ((level + 1) / gridLevels);
        const ringPoints = Array.from({ length: N }).map((_, i) => {
          const angle = -Math.PI / 2 + i * angleStep;
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);
          return `${x},${y}`;
        }).join(' ');
        return <polygon key={`grid-${level}`} points={ringPoints} fill="none" stroke="#f3f4f6" strokeWidth={1} />;
      })}
      {/* data */}
      <polygon points={polygon} fill={color + '22'} stroke={color} strokeWidth={2} />
      {/* dots */}
      {points.map((p, i) => (
        <circle key={`dot-${i}`} cx={p.x} cy={p.y} r={3} fill={color} />
      ))}
      {/* labels */}
      {Array.from({ length: N }).map((_, i) => {
        const angle = -Math.PI / 2 + i * angleStep;
        const x = center + (radius + 12) * Math.cos(angle);
        const y = center + (radius + 12) * Math.sin(angle);
        return (
          <text key={`label-${i}`} x={x} y={y} textAnchor={Math.cos(angle) > 0.2 ? 'start' : Math.cos(angle) < -0.2 ? 'end' : 'middle'} dominantBaseline={Math.sin(angle) > 0.2 ? 'hanging' : Math.sin(angle) < -0.2 ? 'text-bottom' as any : 'middle'} fill="#6b7280" fontSize={10}>
            {labels[i]}
          </text>
        );
      })}
    </svg>
  );
} 