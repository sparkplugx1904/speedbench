/**
 * Configuration and default endpoints for SpeedBench long-duration tester
 */

export const DEFAULT_CONFIG = {
  // Public Cloudflare Speed Test endpoints (CORS enabled worldwide)
  downloadEndpoint: 'https://speed.cloudflare.com/__down?bytes=25000000',
  uploadEndpoint: 'https://speed.cloudflare.com/__up',
  probeEndpoint: 'https://speed.cloudflare.com/__down?bytes=0',

  // Self-hosted fallback endpoints served by Pages Functions
  localDownloadEndpoint: '/speed/__down?bytes=25000000',
  localUploadEndpoint: '/speed/__up',
  localProbeEndpoint: '/speed/__down?bytes=0',

  // Streaming & measurement tuning
  parallelStreams: 4,
  probeIntervalMs: 500, // 2 probes per second (reduces stream congestion and rate-limiting)
  probeTimeoutMs: 2000, // 2s without response = lost probe
  sampleIntervalMs: 1000, // 1 sample per second
  rollingWindowLossProbes: 10, // last 10 probes (5s) for loss rate

  // Memory bounds (Ring buffer)
  maxSamples: 3600, // 1 hour at 1 Hz resolution

  // Modes
  defaultMode: 'continuous', // 'continuous' | 'interval'
  intervalBurstDurationSec: 10,
  intervalPauseDurationSec: 20,

  // Default data cap in Megabytes (0 = unlimited)
  defaultDataCapMB: 0,
};

export const TIME_WINDOWS = [
  { id: '1m', label: '1 Min', seconds: 60 },
  { id: '5m', label: '5 Min', seconds: 300 },
  { id: '10m', label: '10 Min', seconds: 600 },
  { id: '30m', label: '30 Min', seconds: 1800 },
  { id: '1h', label: '1 Hour', seconds: 3600 },
  { id: 'all', label: 'All', seconds: Infinity },
];
