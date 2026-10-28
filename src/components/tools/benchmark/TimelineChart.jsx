import React, { useCallback, useEffect, useRef } from 'react';
import { ChartLine } from '@phosphor-icons/react';
import { PLOT, drawBenchChart, nearestSampleIndex } from '../../../utils/benchmark-chart-render';

export function TimelineChart({
  samples,
  metric,
  burstSpeed,
  sustainedSpeed,
  hoverIndex,
  onHoverChange,
}) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const drawRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    drawBenchChart({
      canvas,
      width: wrap.clientWidth,
      height: wrap.clientHeight,
      metric,
      samples,
      hoverIndex,
      burstSpeed,
      sustainedSpeed,
    });
  }, [burstSpeed, hoverIndex, metric, samples, sustainedSpeed]);

  drawRef.current = draw;

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;
    const resizeObserver = new ResizeObserver(() => drawRef.current?.());
    resizeObserver.observe(wrap);
    const themeObserver = new MutationObserver(() => drawRef.current?.());
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });
    return () => {
      resizeObserver.disconnect();
      themeObserver.disconnect();
    };
  }, []);

  const updateHover = useCallback(
    (clientX) => {
      const wrap = wrapRef.current;
      if (!wrap || !samples.length) {
        onHoverChange(null);
        return;
      }

      const rect = wrap.getBoundingClientRect();
      const plotLeft = rect.left + PLOT.left;
      const plotRight = rect.right - PLOT.right;
      if (clientX < plotLeft - 10 || clientX > plotRight + 10) {
        onHoverChange(null);
        return;
      }

      const tStart = samples[0].t;
      const tEnd = samples[samples.length - 1].t;
      const ratio = Math.max(
        0,
        Math.min(1, (clientX - plotLeft) / Math.max(1, plotRight - plotLeft)),
      );
      const target = tStart + ratio * (tEnd - tStart);
      onHoverChange(nearestSampleIndex(samples, target));
    },
    [onHoverChange, samples],
  );

  return (
    <div
      className="bench-chart-wrap"
      ref={wrapRef}
      onPointerMove={(event) => updateHover(event.clientX)}
      onPointerDown={(event) => updateHover(event.clientX)}
      onPointerLeave={() => onHoverChange(null)}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`${metric.label} timeline with ${samples.length} samples`}
      />
      {!samples.length && (
        <div className="bench-chart-empty">
          <ChartLine size={22} aria-hidden="true" />
          <strong>No samples yet</strong>
          <span>Start the test to draw the first second.</span>
        </div>
      )}
    </div>
  );
}
