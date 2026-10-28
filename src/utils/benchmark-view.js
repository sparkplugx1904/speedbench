/**
 * Presentation helpers for the benchmark tool. Kept separate from the
 * measurement engine so UI formatting never influences sampling behaviour.
 */

export const CHART_METRICS = [
  {
    id: 'throughput',
    key: 'downMbps',
    label: 'Download',
    unit: 'Mbps',
    cssVar: '--bench-download',
    decimals: 1,
  },
  {
    id: 'ping',
    key: 'pingMs',
    label: 'Loaded ping',
    unit: 'ms',
    cssVar: '--bench-ping',
    decimals: 1,
  },
  {
    id: 'jitter',
    key: 'jitterMs',
    label: 'Jitter',
    unit: 'ms',
    cssVar: '--bench-jitter',
    decimals: 1,
  },
  {
    id: 'loss',
    key: 'lossPct',
    label: 'Probe loss',
    unit: '%',
    cssVar: '--bench-loss',
    decimals: 1,
    fixedMax: 100,
  },
];

export const VITAL_METRICS = [
  {
    key: 'ping',
    sampleKey: 'pingMs',
    label: 'Loaded ping',
    unit: 'ms',
    cssVar: '--bench-ping',
    icon: 'pulse',
    grade: 'latency',
    floor: 20,
  },
  {
    key: 'jitter',
    sampleKey: 'jitterMs',
    label: 'Jitter',
    unit: 'ms',
    cssVar: '--bench-jitter',
    icon: 'wave',
    grade: 'jitter',
    floor: 5,
  },
  {
    key: 'loss',
    sampleKey: 'lossPct',
    label: 'Probe loss',
    unit: '%',
    cssVar: '--bench-loss',
    icon: 'drop',
    grade: 'loss',
    floor: 1,
  },
];

export function formatValue(value, decimals = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return Number(value).toFixed(decimals);
}

export function formatRate(value) {
  if (value === null || value === undefined) return '—';
  const n = Number(value);
  if (n >= 1000) return `${(n / 1000).toFixed(2)} Gbps`;
  return `${n.toFixed(1)} Mbps`;
}

export function getGrade(kind, value, hasData) {
  if (!hasData || value === null || value === undefined) {
    return { label: 'No data', tone: 'neutral' };
  }

  if (kind === 'latency') {
    if (value <= 0) return { label: 'No data', tone: 'neutral' };
    if (value < 50) return { label: 'Excellent', tone: 'good' };
    if (value < 100) return { label: 'Good', tone: 'good' };
    if (value < 200) return { label: 'Fair', tone: 'warn' };
    return { label: 'High', tone: 'bad' };
  }

  if (kind === 'jitter') {
    if (value < 10) return { label: 'Excellent', tone: 'good' };
    if (value < 30) return { label: 'Good', tone: 'good' };
    if (value < 60) return { label: 'Fair', tone: 'warn' };
    return { label: 'High', tone: 'bad' };
  }

  if (kind === 'loss') {
    if (value < 0.25) return { label: 'Clean', tone: 'good' };
    if (value < 1) return { label: 'Good', tone: 'good' };
    if (value < 3) return { label: 'Fair', tone: 'warn' };
    return { label: 'Lossy', tone: 'bad' };
  }

  return { label: 'No data', tone: 'neutral' };
}

export function getStatusView(snapshot) {
  if (snapshot.status === 'running') {
    if (snapshot.mode === 'interval') {
      if (snapshot.intervalPhase === 'rest') {
        return {
          label: 'Resting',
          detail: `Saving data · next burst in ${snapshot.intervalPhaseRemaining}s`,
          tone: 'warn',
        };
      }
      return {
        label: 'Burst in progress',
        detail: `Measuring · ${snapshot.intervalPhaseRemaining}s left in this burst`,
        tone: 'live',
      };
    }
    return {
      label: 'Testing live',
      detail: 'Download, loaded latency and probe loss',
      tone: 'live',
    };
  }

  if (snapshot.status === 'paused') {
    return {
      label: 'Paused',
      detail: 'Measurement is paused. Resume when you are ready.',
      tone: 'warn',
    };
  }

  if (snapshot.status === 'offline') {
    return {
      label: 'Connection lost',
      detail: 'Waiting for this device to come back online.',
      tone: 'bad',
    };
  }

  if (snapshot.samples.length > 0) {
    return {
      label: 'Session stopped',
      detail: 'Review the timeline or export the captured samples.',
      tone: 'neutral',
    };
  }

  return {
    label: 'Ready to test',
    detail:
      snapshot.mode === 'interval'
        ? 'Interval run: 10 seconds on, 20 seconds rest.'
        : 'Continuous run with 4 parallel download streams.',
    tone: 'neutral',
  };
}

export function getWindowStats(samples, key) {
  if (!samples.length) return { avg: 0, min: 0, max: 0 };
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;
  for (const sample of samples) {
    const value = Number(sample[key]) || 0;
    sum += value;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  return { avg: sum / samples.length, min, max };
}

/**
 * Converts a series of values into SVG polyline geometry. Returns null when
 * there is nothing to draw.
 */
export function sparklineGeometry(values, width = 320, height = 64, floor = 1) {
  if (!values || values.length === 0) return null;

  const pad = 3;
  const innerWidth = width - pad * 2;
  const innerHeight = height - pad * 2;
  const maxValue = Math.max(floor, ...values.map((v) => Number(v) || 0));

  const points = values.map((value, index) => {
    const x = values.length === 1 ? pad : pad + (index / (values.length - 1)) * innerWidth;
    const y = pad + innerHeight - (Math.max(0, Number(value) || 0) / maxValue) * innerHeight;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  if (values.length === 1) {
    points.push(`${(width - pad).toFixed(2)},${points[0].split(',')[1]}`);
  }

  const line = points.join(' ');
  const area = `${pad},${height - pad} ${line} ${width - pad},${height - pad}`;
  return { line, area, width, height };
}
