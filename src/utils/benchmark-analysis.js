import { calcMedian, formatElapsed } from './benchmark-format';

/**
 * Compares the opening burst with the rate that holds later in the session and
 * detects a remarkable step-down. Pure so restoring a stored session can run
 * the same calculation without emitting another event.
 */
export function analyzeBurst(samples, previousReport = null) {
  if (samples.length < 5) {
    return {
      burstSpeed: null,
      sustainedSpeed: null,
      stepDownReport: previousReport,
      stepDownEvent: null,
    };
  }

  // Initial burst: average Mbps over the first 10 seconds (or the whole run if shorter).
  const burstWindow = samples.slice(0, Math.min(10, samples.length));
  const burstAvg =
    burstWindow.reduce((acc, sample) => acc + sample.downMbps, 0) / burstWindow.length;
  const burstSpeed = Number(burstAvg.toFixed(1));

  // Sustained: median of later samples, starting at the midpoint of the run (capped at 60 s).
  let sustainedSpeed = null;
  if (samples.length >= 20) {
    const sustainedSamples = samples.slice(Math.min(60, Math.floor(samples.length / 2)));
    sustainedSpeed = Number(
      calcMedian(sustainedSamples.map((sample) => sample.downMbps)).toFixed(1),
    );
  }

  // Step-down detector: compares the opening burst with the last five samples.
  let stepDownReport = previousReport;
  let stepDownEvent = null;
  if (!previousReport && samples.length >= 25 && burstSpeed > 10) {
    const recentWindow = samples.slice(-5);
    const recentAvg =
      recentWindow.reduce((acc, sample) => acc + sample.downMbps, 0) / recentWindow.length;
    const dropPct = ((burstSpeed - recentAvg) / burstSpeed) * 100;

    if (dropPct >= 20) {
      stepDownReport = {
        time: formatElapsed(samples[samples.length - 5].t),
        fromMbps: burstSpeed,
        toMbps: Number(recentAvg.toFixed(1)),
        dropPct: Number(dropPct.toFixed(0)),
      };
      stepDownEvent = `Throughput step-down detected: dropped from ~${stepDownReport.fromMbps} to ~${stepDownReport.toMbps} Mbps at ${stepDownReport.time} (-${stepDownReport.dropPct}%).`;
    }
  }

  return { burstSpeed, sustainedSpeed, stepDownReport, stepDownEvent };
}
