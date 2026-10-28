import { calcPercentile, formatBytes, formatElapsed } from './benchmark-format';

/**
 * Builds the immutable-ish read-only object used by React. This keeps
 * measurement internals out of the component layer.
 */
export function buildSnapshot(engine) {
  const samples = engine.samples;
  const n = samples.length;

  let downSum = 0, downMin = Infinity, downMax = -Infinity;
  let pingSum = 0, pingMin = Infinity, pingMax = -Infinity, pingCount = 0;
  let jitterSum = 0, jitterMin = Infinity, jitterMax = -Infinity;
  let lossSum = 0, lossMin = Infinity, lossMax = -Infinity;

  const downVals = new Float32Array(n);
  const jitterVals = new Float32Array(n);
  const lossVals = new Float32Array(n);
  const pingVals = [];

  for (let i = 0; i < n; i++) {
    const s = samples[i];
    const d = s.downMbps;
    const p = s.pingMs;
    const j = s.jitterMs;
    const l = s.lossPct;

    downSum += d;
    if (d < downMin) downMin = d;
    if (d > downMax) downMax = d;
    downVals[i] = d;

    if (p > 0) {
      pingSum += p;
      if (p < pingMin) pingMin = p;
      if (p > pingMax) pingMax = p;
      pingCount++;
      pingVals.push(p);
    }

    jitterSum += j;
    if (j < jitterMin) jitterMin = j;
    if (j > jitterMax) jitterMax = j;
    jitterVals[i] = j;

    lossSum += l;
    if (l < lossMin) lossMin = l;
    if (l > lossMax) lossMax = l;
    lossVals[i] = l;
  }

  const last = n > 0 ? samples[n - 1] : null;

  const intervalPhaseRemaining = engine.intervalPhase
    ? Math.max(
        0,
        (engine.intervalPhase === 'active'
          ? engine.config.intervalBurstDurationSec
          : engine.config.intervalPauseDurationSec) - engine.intervalPhaseElapsed,
      )
    : 0;
  return {
    status: engine.status,
    elapsedFormatted: formatElapsed(engine.elapsedSeconds),
    elapsedSeconds: engine.elapsedSeconds,
    dataUsedFormatted: formatBytes(engine.bytesDownTotal + engine.bytesUpTotal),
    bytesDownTotal: engine.bytesDownTotal,
    mode: engine.mode,
    dataCapMB: engine.dataCapMB,
    intervalPhase: engine.intervalPhase,
    intervalPhaseRemaining,
    testConditions: engine.testConditions,
    samples: engine.samples,
    events: engine.events,
    burstSpeed: engine.burstSpeed,
    sustainedSpeed: engine.sustainedSpeed,
    stepDownReport: engine.stepDownReport,
    stats: {
      throughput: n === 0 ? { cur: 0, avg: 0, min: 0, max: 0, p95: 0 } : {
        cur: Number(last.downMbps.toFixed(1)),
        avg: Number((downSum / n).toFixed(1)),
        min: Number(downMin.toFixed(1)),
        max: Number(downMax.toFixed(1)),
        p95: Number(calcPercentile(downVals, 95).toFixed(1)),
      },
      ping: pingCount === 0 ? { cur: 0, avg: 0, min: 0, max: 0, p95: 0 } : {
        cur: Number(last.pingMs.toFixed(1)),
        avg: Number((pingSum / pingCount).toFixed(1)),
        min: Number(pingMin.toFixed(1)),
        max: Number(pingMax.toFixed(1)),
        p95: Number(calcPercentile(pingVals, 95).toFixed(1)),
      },
      jitter: n === 0 ? { cur: 0, avg: 0, min: 0, max: 0, p95: 0 } : {
        cur: Number(last.jitterMs.toFixed(1)),
        avg: Number((jitterSum / n).toFixed(1)),
        min: Number(jitterMin.toFixed(1)),
        max: Number(jitterMax.toFixed(1)),
        p95: Number(calcPercentile(jitterVals, 95).toFixed(1)),
      },
      loss: n === 0 ? { cur: 0, avg: 0, min: 0, max: 0, p95: 0 } : {
        cur: Number(last.lossPct.toFixed(1)),
        avg: Number((lossSum / n).toFixed(1)),
        min: Number(lossMin.toFixed(1)),
        max: Number(lossMax.toFixed(1)),
        p95: Number(calcPercentile(lossVals, 95).toFixed(1)),
      },
    },
  };
}
