import { formatElapsed, formatBytes } from './benchmark-format';

/**
 * Creates an enriched benchmark event entry capturing live telemetry parameters.
 */
export function createEventEntry(engine, type, message, extra = {}) {
  const now = new Date();
  const wallClock = now.toTimeString().split(' ')[0];
  const lastSample = engine.samples.length > 0 ? engine.samples[engine.samples.length - 1] : null;

  const params = {
    wallClock,
    downMbps: lastSample ? Number(lastSample.downMbps.toFixed(1)) : 0,
    upMbps: lastSample ? Number((lastSample.upMbps || 0).toFixed(1)) : 0,
    pingMs:
      lastSample && lastSample.pingMs > 0
        ? Number(lastSample.pingMs.toFixed(1))
        : engine.lastRtt
          ? Number(engine.lastRtt.toFixed(1))
          : null,
    jitterMs: lastSample && lastSample.jitterMs > 0 ? Number(lastSample.jitterMs.toFixed(1)) : null,
    lossPct: lastSample ? Number(lastSample.lossPct.toFixed(1)) : 0,
    dataUsed: formatBytes(engine.bytesDownTotal + engine.bytesUpTotal),
    mode: engine.mode,
    streams: `${engine.config.parallelStreams} DL / 2 UL`,
    connType: engine.testConditions?.connectionType || undefined,
    ...extra,
  };

  return {
    id: Math.random().toString(36).substring(2, 9),
    ts: now.toISOString(),
    timeFormatted: formatElapsed(engine.elapsedSeconds),
    wallClock,
    type, // 'info' | 'warn' | 'error' | 'drop'
    message,
    params,
  };
}
