import React, { useId } from 'react';
import { sparklineGeometry } from '../../../utils/benchmark-view';

/**
 * Small, axis-free trend line used inside readout cards. The main timeline
 * carries the precise values; this is only a glanceable shape.
 */
export function Sparkline({
  values,
  colorVar = '--bench-download',
  height = 64,
  floor = 1,
  className = '',
}) {
  const rawId = useId();
  const gradientId = `bench-spark-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const geometry = sparklineGeometry(values, 320, height, floor);

  if (!geometry) {
    return <div className={`bench-spark bench-spark--empty ${className}`} aria-hidden="true" />;
  }

  return (
    <div
      className={`bench-spark ${className}`}
      style={{ color: `var(${colorVar})` }}
      aria-hidden="true"
    >
      <svg viewBox={`0 0 ${geometry.width} ${geometry.height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <polygon points={geometry.area} fill={`url(#${gradientId})`} />
        <polyline
          points={geometry.line}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
