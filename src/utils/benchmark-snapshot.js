import { calcPercentile, formatBytes, formatElapsed } from './benchmark-format';

/**
 * Builds the immutable-ish read-only object used by React. This keeps
 * measurement internals out of the component layer.
 */
export function buildSnapshot(engine) {
  const downArr = engine.samples.map((sample) => sample.downMbps);
  const pingArr = engine.samples.map((sample) => sample.pingMs).filter((ping) => ping > 0);
  const jitterArr = engine.samples.map((sample) => sample.jitterMs);
  const lossArr = engine.samples.map((sample) => sample.lossPct);

  const intervalPhaseRemaining = engine.intervalPhase
    ? Math.max(
        0,
        (engine.intervalPhase === 'active'
          ? engine.config.intervalBurstDurationSec
          : engine.config.intervalPauseDurationSec) - engine.intervalPhaseElapsed,
      )
    : 0;

  const getMetricStats = (values) => {
    if (values.length === 0) return { cur: 0, avg: 0, min: 0, max: 0, p95: 0 };
    const avg = values.reduce((acc, value) => acc + value, 0) / values.length;
    return {
      cur: Number(values[values.length - 1].toFixed(1)),
      avg: Number(avg.toFixed(1)),
      min: Number(Math.min(...values).toFixed(1)),
      max: Number(Math.max(...values).toFixed(1)),
      p95: Number(calcPercentile(values, 95).toFixed(1)),
    };
  };

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
      throughput: getMetricStats(downArr),
      ping: getMetricStats(pingArr),
      jitter: getMetricStats(jitterArr),
      loss: getMetricStats(lossArr),
    },
  };
}
