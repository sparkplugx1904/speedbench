/**
 * Export serialization for captured benchmark sessions.
 */

export function buildBenchmarkCsv(samples = []) {
  const header =
    'Timestamp (s),Download (Mbps),Upload (Mbps),Ping (ms),Jitter (ms),Probe Loss (%)\n';
  const rows = samples
    .map((sample) =>
      [
        sample.t,
        sample.downMbps,
        sample.upMbps,
        sample.pingMs,
        sample.jitterMs,
        sample.lossPct,
      ].join(','),
    )
    .join('\n');
  return header + rows;
}

export function buildBenchmarkJson(session = {}) {
  return JSON.stringify(
    {
      site: 'SpeedBench',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      testConditions: session.testConditions,
      summary: {
        elapsedSeconds: session.elapsedSeconds,
        dataUsedBytes: session.bytesDownTotal,
        burstSpeedMbps: session.burstSpeed,
        sustainedSpeedMbps: session.sustainedSpeed,
        stepDown: session.stepDownReport,
      },
      events: session.events,
      samples: session.samples,
    },
    null,
    2,
  );
}
