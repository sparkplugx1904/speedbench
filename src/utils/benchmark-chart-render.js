/**
 * Canvas renderer for the benchmark timeline. Keeping the drawing routine out
 * of the React component makes the chart easier to test and keeps the JSX
 * module focused on interaction and layout.
 */

export const PLOT = { left: 52, right: 14, top: 16, bottom: 26 };

function niceMax(value) {
  if (!Number.isFinite(value) || value <= 0) return 10;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

function axisTime(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${minutes}:${String(secs).padStart(2, '0')}`;
}

function readColor(styles, name, fallback) {
  return styles.getPropertyValue(name).trim() || fallback;
}

export function drawBenchChart({
  canvas,
  width,
  height,
  metric,
  samples,
  hoverIndex,
  burstSpeed,
  sustainedSpeed,
}) {
  if (!canvas || width <= 0 || height <= 0) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const styles = getComputedStyle(canvas);
  const color = readColor(styles, metric.cssVar, '#38bdf8');
  const grid = readColor(styles, '--bench-grid', 'rgba(127, 127, 127, 0.15)');
  const axis = readColor(styles, '--bench-axis', '#71717a');
  const surface = readColor(styles, '--bench-surface', '#ffffff');

  const plotLeft = PLOT.left;
  const plotRight = width - PLOT.right;
  const plotTop = PLOT.top;
  const plotBottom = height - PLOT.bottom;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;
  if (plotWidth <= 0 || plotHeight <= 0) return;

  const tStart = samples.length ? samples[0].t : 0;
  const tEnd = samples.length ? samples[samples.length - 1].t : 0;
  let maxVal = 10;
  for (let i = 0; i < samples.length; i++) {
    const val = Number(samples[i][metric.key]) || 0;
    if (val > maxVal) maxVal = val;
  }
  const maxValue = metric.fixedMax || niceMax(maxVal * 1.08);
  const xOf = (t) =>
    samples.length <= 1 || tEnd === tStart
      ? plotLeft + plotWidth / 2
      : plotLeft + ((t - tStart) / (tEnd - tStart)) * plotWidth;
  const yOf = (value) =>
    plotBottom - (Math.max(0, Math.min(maxValue, value)) / maxValue) * plotHeight;

  // Horizontal grid + y labels.
  ctx.lineWidth = 1;
  ctx.strokeStyle = grid;
  ctx.fillStyle = axis;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const y = plotTop + (plotHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(plotLeft, y);
    ctx.lineTo(plotRight, y);
    ctx.stroke();

    if (samples.length) {
      const value = maxValue - (maxValue / 4) * i;
      const label = value >= 100 ? Math.round(value) : value.toFixed(metric.decimals);
      ctx.fillText(label, plotLeft - 8, y + 3.5);
    }
  }

  // Vertical grid.
  for (let i = 1; i <= 6; i++) {
    const x = plotLeft + (plotWidth / 6) * i;
    ctx.beginPath();
    ctx.moveTo(x, plotTop);
    ctx.lineTo(x, plotBottom);
    ctx.stroke();
  }

  if (!samples.length) return;

  // Time labels.
  ctx.fillStyle = axis;
  ctx.font = '10px "JetBrains Mono", monospace';
  const midT = tStart + (tEnd - tStart) / 2;
  ctx.textAlign = 'left';
  ctx.fillText(axisTime(tStart), plotLeft, height - 8);
  ctx.textAlign = 'center';
  if (tEnd > tStart) ctx.fillText(axisTime(midT), plotLeft + plotWidth / 2, height - 8);
  ctx.textAlign = 'right';
  ctx.fillText(axisTime(tEnd), plotRight, height - 8);

  // Resolution-aware sampling: avoid sub-pixel path overdraw when sample count
  // exceeds available plot pixels, cutting canvas draw overhead significantly.
  const maxAllowedPoints = Math.max(200, Math.round(plotWidth * 2));
  const step = samples.length > maxAllowedPoints ? Math.ceil(samples.length / maxAllowedPoints) : 1;

  const segments = [];
  let segment = [];
  for (let i = 0; i < samples.length; i += step) {
    const sample = samples[i];
    const point = {
      t: sample.t,
      x: xOf(sample.t),
      y: yOf(Number(sample[metric.key]) || 0),
    };
    if (segment.length && point.t - segment[segment.length - 1].t > 2.5 * step) {
      segments.push(segment);
      segment = [];
    }
    segment.push(point);
  }
  if (step > 1 && samples.length > 0) {
    const last = samples[samples.length - 1];
    if (segment.length && segment[segment.length - 1].t !== last.t) {
      segment.push({
        t: last.t,
        x: xOf(last.t),
        y: yOf(Number(last[metric.key]) || 0),
      });
    }
  }
  if (segment.length) segments.push(segment);
  for (const part of segments) {
    if (part.length === 1) {
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(part[0].x, part[0].y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }

    // Soft area fill.
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(part[0].x, plotBottom);
    ctx.lineTo(part[0].x, part[0].y);
    for (let i = 1; i < part.length; i++) ctx.lineTo(part[i].x, part[i].y);
    ctx.lineTo(part[part.length - 1].x, plotBottom);
    ctx.closePath();
    ctx.globalAlpha = 0.13;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();

    // Waveform.
    ctx.beginPath();
    ctx.moveTo(part[0].x, part[0].y);
    for (let i = 1; i < part.length; i++) ctx.lineTo(part[i].x, part[i].y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.9;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // Burst and sustained reference lines are meaningful for throughput only.
  if (metric.id === 'throughput') {
    const references = [
      {
        value: burstSpeed,
        label: 'burst',
        color: readColor(styles, '--bench-download', color),
      },
      {
        value: sustainedSpeed,
        label: 'sustained',
        color: readColor(styles, '--bench-ping', '#34d399'),
      },
    ];

    for (const reference of references) {
      if (reference.value === null || reference.value === undefined) continue;
      if (reference.value <= 0 || reference.value > maxValue) continue;
      const y = yOf(reference.value);
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.globalAlpha = 0.65;
      ctx.strokeStyle = reference.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(plotLeft, y);
      ctx.lineTo(plotRight, y);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = reference.color;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(reference.label, plotRight - 2, y - 4);
    }
  }

  // Synchronized cursor.
  if (hoverIndex !== null && samples[hoverIndex]) {
    const sample = samples[hoverIndex];
    const x = xOf(sample.t);
    const y = yOf(Number(sample[metric.key]) || 0);

    ctx.save();
    ctx.setLineDash([2, 3]);
    ctx.strokeStyle = readColor(styles, '--bench-cursor', 'rgba(127, 127, 127, 0.5)');
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, plotTop);
    ctx.lineTo(x, plotBottom);
    ctx.stroke();
    ctx.restore();

    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = surface;
    ctx.stroke();
  }
}

export function nearestSampleIndex(samples, targetT) {
  let closest = 0;
  let distance = Infinity;
  samples.forEach((sample, index) => {
    const delta = Math.abs(sample.t - targetT);
    if (delta < distance) {
      distance = delta;
      closest = index;
    }
  });
  return closest;
}
