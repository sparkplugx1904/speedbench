import { DEFAULT_CONFIG } from './benchmark-config';
import { analyzeBurst } from './benchmark-analysis';
import { buildBenchmarkCsv, buildBenchmarkJson } from './benchmark-export';
import { formatElapsed } from './benchmark-format';
import { buildSnapshot } from './benchmark-snapshot';
import {
  clearSession,
  hasStoredSession as hasSession,
  loadSession,
  saveSession,
} from './benchmark-storage';

/**
 * Benchmarking Engine
 */
export class BenchmarkEngine {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.status = 'idle'; // 'idle' | 'running' | 'paused' | 'offline'
    this.samples = []; // Ring buffer of 1s samples
    this.events = []; // Outages, drop points, warnings
    this.callbacks = new Set();

    this.bytesDownTotal = 0;
    this.bytesUpTotal = 0;
    this.bytesDownTick = 0;
    this.bytesUpTick = 0;

    this.probeHistory = []; // Last N probes: { rtt: number, ok: boolean, ts: number }
    this.lastRtt = null;
    this.elapsedSeconds = 0;

    this.streamControllers = [];
    this.streamingActive = false;
    this.streamGeneration = 0;
    this.probeTimer = null;
    this.ticker = null;
    this.wakeLock = null;

    // Interval mode state
    this.intervalPhase = null; // 'active' | 'rest' | null
    this.intervalPhaseElapsed = 0;

    // Burst analysis
    this.burstSpeed = null;
    this.sustainedSpeed = null;
    this.stepDownReport = null;

    this.mode = this.config.defaultMode;
    this.dataCapMB = this.config.defaultDataCapMB;
    this.testConditions = {
      connectionType: this.detectConnectionType(),
      isp: '',
    };

    this.handleVisibility = this.handleVisibility.bind(this);
    this.handleOnline = this.handleOnline.bind(this);
    this.handleOffline = this.handleOffline.bind(this);
  }

  detectConnectionType() {
    if (typeof navigator !== 'undefined' && navigator.connection) {
      const conn = navigator.connection;
      return conn.type || conn.effectiveType || 'Unknown';
    }
    return 'Unknown';
  }

  subscribe(cb) {
    this.callbacks.add(cb);
    return () => this.callbacks.delete(cb);
  }

  emit() {
    const snapshot = this.getSnapshot();
    this.callbacks.forEach((cb) => cb(snapshot));
  }

  logEvent(type, message) {
    const entry = {
      id: Math.random().toString(36).substring(2, 9),
      ts: new Date().toISOString(),
      timeFormatted: formatElapsed(this.elapsedSeconds),
      type, // 'info' | 'warn' | 'error' | 'drop'
      message,
    };
    this.events.unshift(entry);
    if (this.events.length > 100) this.events.pop();
    this.emit();
  }

  async acquireWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await navigator.wakeLock.request('screen');
      }
    } catch {}
  }

  releaseWakeLock() {
    if (this.wakeLock) {
      try {
        this.wakeLock.release();
      } catch {}
      this.wakeLock = null;
    }
  }

  handleVisibility() {
    if (document.visibilityState === 'visible' && this.status === 'running') {
      this.acquireWakeLock();
    }
  }

  handleOnline() {
    if (this.status !== 'offline') return;
    this.status = 'running';
    this.acquireWakeLock();
    this.logEvent('info', 'Network connection restored. Benchmark resumed.');
    if (this.mode === 'interval') {
      this.beginIntervalPhase('active');
    } else {
      this.beginMeasurements();
    }
    this.ticker = setInterval(() => this.tick(), 1000);
    this.emit();
  }

  handleOffline() {
    if (this.status !== 'running') return;
    this.status = 'offline';
    this.endMeasurements();
    this.releaseWakeLock();
    clearInterval(this.ticker);
    this.ticker = null;
    this.logEvent('error', 'Network outage detected: device is offline. Measurement paused.');
    this.emit();
  }

  start() {
    if (this.status === 'running') return;
    const wasPaused = this.status === 'paused';
    this.status = 'running';
    this.acquireWakeLock();

    if (typeof window !== 'undefined') {
      window.addEventListener('visibilitychange', this.handleVisibility);
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }

    this.logEvent(
      'info',
      wasPaused
        ? 'Benchmark resumed by user.'
        : this.samples.length > 0
          ? 'Benchmark resumed with the existing session samples.'
          : `Benchmark started in ${this.mode} mode (${this.config.parallelStreams} streams).`,
    );

    if (this.mode === 'interval') {
      this.beginIntervalPhase('active');
    } else {
      this.intervalPhase = null;
      this.beginMeasurements();
    }

    // Master 1 Hz ticker
    this.ticker = setInterval(() => this.tick(), 1000);
    this.emit();
  }

  beginMeasurements() {
    this.startProbing();
    this.startStreaming();
  }

  endMeasurements() {
    this.stopStreaming();
    clearInterval(this.probeTimer);
    this.probeTimer = null;
    this.bytesDownTick = 0;
    this.bytesUpTick = 0;
  }

  beginIntervalPhase(phase) {
    this.intervalPhase = phase;
    this.intervalPhaseElapsed = 0;
    if (phase === 'active') {
      this.beginMeasurements();
    } else {
      this.endMeasurements();
    }
  }

  pause() {
    if (this.status !== 'running') return;
    this.status = 'paused';
    this.endMeasurements();
    this.intervalPhase = null;
    this.intervalPhaseElapsed = 0;
    this.releaseWakeLock();
    clearInterval(this.ticker);
    this.ticker = null;
    this.logEvent('info', 'Benchmark paused by user.');
    this.emit();
  }

  stop() {
    const wasActive = this.status !== 'idle';
    this.status = 'idle';
    this.endMeasurements();
    this.intervalPhase = null;
    this.intervalPhaseElapsed = 0;
    this.releaseWakeLock();
    clearInterval(this.ticker);
    this.ticker = null;

    if (typeof window !== 'undefined') {
      window.removeEventListener('visibilitychange', this.handleVisibility);
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }

    if (wasActive) {
      this.logEvent('info', 'Benchmark stopped.');
    }
    this.saveToStorage();
    this.emit();
  }

  reset() {
    this.stop();
    this.samples = [];
    this.events = [];
    this.bytesDownTotal = 0;
    this.bytesUpTotal = 0;
    this.bytesDownTick = 0;
    this.bytesUpTick = 0;
    this.elapsedSeconds = 0;
    this.burstSpeed = null;
    this.sustainedSpeed = null;
    this.stepDownReport = null;
    this.probeHistory = [];
    this.clearStorage();
    this.emit();
  }

  startStreaming() {
    this.streamingActive = true;
    const generation = ++this.streamGeneration;
    for (let i = 0; i < this.config.parallelStreams; i++) {
      this.spawnDownloadWorker(i, generation);
    }
  }

  stopStreaming() {
    this.streamingActive = false;
    this.streamGeneration++;
    this.streamControllers.forEach((ac) => {
      try {
        ac.abort();
      } catch {}
    });
    this.streamControllers = [];
  }

  async spawnDownloadWorker(streamIndex, generation) {
    if (
      this.status !== 'running' ||
      !this.streamingActive ||
      generation !== this.streamGeneration
    ) {
      return;
    }
    const ac = new AbortController();
    this.streamControllers[streamIndex] = ac;

    try {
      const url = `${this.config.downloadEndpoint}&cacheBust=${Date.now()}_${streamIndex}`;
      const res = await fetch(url, {
        signal: ac.signal,
        cache: 'no-store',
      });

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      while (
        this.status === 'running' &&
        this.streamingActive &&
        generation === this.streamGeneration
      ) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          const len = value.byteLength;
          this.bytesDownTick += len;
          this.bytesDownTotal += len;
        }
      }
    } catch {
      // Stream interrupted or error
    } finally {
      // Loop stream immediately to keep the link saturated
      if (
        this.status === 'running' &&
        this.streamingActive &&
        generation === this.streamGeneration
      ) {
        setTimeout(() => this.spawnDownloadWorker(streamIndex, generation), 50);
      }
    }
  }

  startProbing() {
    clearInterval(this.probeTimer);
    this.probeTimer = setInterval(() => this.sendProbe(), this.config.probeIntervalMs);
  }

  async sendProbe() {
    if (this.status !== 'running') return;
    const ac = new AbortController();
    const timeoutId = setTimeout(() => ac.abort(), this.config.probeTimeoutMs);
    const start = performance.now();

    try {
      const probeUrl = `${this.config.probeEndpoint}&probeBust=${Date.now()}_${Math.random()}`;
      const res = await fetch(probeUrl, {
        signal: ac.signal,
        cache: 'no-store',
        mode: 'cors',
      });
      clearTimeout(timeoutId);

      const rtt = Math.max(1, performance.now() - start);
      if (res.ok) {
        this.recordProbe(rtt, true);
      } else {
        this.recordProbe(rtt, false);
      }
    } catch {
      clearTimeout(timeoutId);
      this.recordProbe(this.config.probeTimeoutMs, false);
    }
  }

  recordProbe(rtt, ok) {
    this.probeHistory.push({ rtt, ok, ts: Date.now() });
    if (this.probeHistory.length > this.config.rollingWindowLossProbes) {
      this.probeHistory.shift();
    }
    if (ok) {
      this.lastRtt = rtt;
    }
  }

  tick() {
    if (this.status !== 'running') return;
    this.elapsedSeconds++;

    const isResting = this.mode === 'interval' && this.intervalPhase === 'rest';

    if (!isResting) {
      // Throughput in Mbps = (bytes * 8) / 1,000,000
      const downMbps = (this.bytesDownTick * 8) / 1000000;
      const upMbps = (this.bytesUpTick * 8) / 1000000;
      this.bytesDownTick = 0;
      this.bytesUpTick = 0;

      // Ping & Jitter
      const successfulProbes = this.probeHistory.filter((p) => p.ok);
      const pingMs =
        successfulProbes.length > 0
          ? successfulProbes[successfulProbes.length - 1].rtt
          : this.lastRtt || 0;

      // Jitter: mean absolute difference between consecutive RTTs
      let jitterMs = 0;
      if (successfulProbes.length >= 2) {
        let diffSum = 0;
        for (let i = 1; i < successfulProbes.length; i++) {
          diffSum += Math.abs(successfulProbes[i].rtt - successfulProbes[i - 1].rtt);
        }
        jitterMs = diffSum / (successfulProbes.length - 1);
      }

      // Packet loss % (probe loss) in rolling window
      const lostCount = this.probeHistory.filter((p) => !p.ok).length;
      const totalCount = this.probeHistory.length;
      const lossPct = totalCount > 0 ? (lostCount / totalCount) * 100 : 0;

      const sample = {
        t: this.elapsedSeconds,
        downMbps: Number(downMbps.toFixed(2)),
        upMbps: Number(upMbps.toFixed(2)),
        pingMs: Number(pingMs.toFixed(1)),
        jitterMs: Number(jitterMs.toFixed(1)),
        lossPct: Number(lossPct.toFixed(1)),
        bytesDown: this.bytesDownTotal,
      };

      this.samples.push(sample);
      if (this.samples.length > this.config.maxSamples) {
        this.samples.shift();
      }

      // Update Burst vs Sustained Analysis
      this.analyzeBurstVsSustained();
    }

    // Interval mode alternates a 10 s measurement burst with a 20 s rest.
    if (this.mode === 'interval' && this.intervalPhase) {
      this.intervalPhaseElapsed++;
      const duration =
        this.intervalPhase === 'active'
          ? this.config.intervalBurstDurationSec
          : this.config.intervalPauseDurationSec;

      if (this.intervalPhaseElapsed >= duration) {
        this.beginIntervalPhase(this.intervalPhase === 'active' ? 'rest' : 'active');
      }
    }

    // Check Data Cap
    if (this.dataCapMB > 0) {
      const usedMB = this.bytesDownTotal / (1024 * 1024);
      if (usedMB >= this.dataCapMB) {
        this.logEvent(
          'warn',
          `Data cap of ${this.dataCapMB} MB reached. Test stopped automatically.`,
        );
        this.stop();
        return;
      }
    }

    this.emit();
  }

  analyzeBurstVsSustained(logDrop = true) {
    const next = analyzeBurst(this.samples, this.stepDownReport);
    this.burstSpeed = next.burstSpeed;
    this.sustainedSpeed = next.sustainedSpeed;
    this.stepDownReport = next.stepDownReport;
    if (logDrop && next.stepDownEvent) {
      this.logEvent('drop', next.stepDownEvent);
    }
  }

  getSnapshot() {
    return buildSnapshot(this);
  }

  exportCSV() {
    return buildBenchmarkCsv(this.samples);
  }

  exportJSON() {
    return buildBenchmarkJson(this);
  }

  saveToStorage() {
    saveSession(this);
  }

  hasStoredSession() {
    return hasSession();
  }

  loadFromStorage() {
    const data = loadSession();
    if (!data) return false;
    this.samples = data.samples || [];
    this.events = data.events || [];
    this.elapsedSeconds = data.elapsedSeconds || 0;
    this.bytesDownTotal = data.bytesDownTotal || 0;
    this.testConditions = data.testConditions || this.testConditions;
    this.mode = data.mode || this.mode;
    this.dataCapMB = data.dataCapMB || 0;
    this.bytesDownTick = 0;
    this.bytesUpTick = 0;
    this.probeHistory = [];
    this.burstSpeed = null;
    this.sustainedSpeed = null;
    this.stepDownReport = null;
    // Rebuild the comparison from stored samples without appending a duplicate event.
    this.analyzeBurstVsSustained(false);
    this.emit();
    return true;
  }

  clearStorage() {
    clearSession();
  }
}
