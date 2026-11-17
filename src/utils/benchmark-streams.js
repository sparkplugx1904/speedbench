/**
 * Network streaming workers for download, upload, and latency probing.
 */

export async function spawnDownloadStream(engine, streamIndex, generation) {
  if (
    engine.status !== 'running' ||
    !engine.streamingActive ||
    generation !== engine.streamGeneration
  ) {
    return;
  }
  const ac = new AbortController();
  engine.streamControllers[streamIndex] = ac;

  let reader = null;
  try {
    const url = `${engine.config.downloadEndpoint}&cacheBust=${Date.now()}_${streamIndex}`;
    const res = await fetch(url, {
      signal: ac.signal,
      cache: 'no-store',
    });

    if (!res.ok || !res.body) {
      throw new Error(`HTTP ${res.status}`);
    }

    reader = res.body.getReader();
    while (
      engine.status === 'running' &&
      engine.streamingActive &&
      generation === engine.streamGeneration
    ) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        const len = value.byteLength;
        engine.bytesDownTick += len;
        engine.bytesDownTotal += len;
      }
    }
  } catch {
    // Stream interrupted or aborted
  } finally {
    if (reader) {
      try {
        await reader.cancel();
      } catch {}
    }
    if (
      engine.status === 'running' &&
      engine.streamingActive &&
      generation === engine.streamGeneration
    ) {
      setTimeout(() => spawnDownloadStream(engine, streamIndex, generation), 0);
    }
  }
}

export async function spawnUploadStream(engine, streamIndex, generation) {
  if (
    engine.status !== 'running' ||
    !engine.streamingActive ||
    generation !== engine.streamGeneration
  ) {
    return;
  }
  const ac = new AbortController();
  const ctrlIndex = engine.config.parallelStreams + streamIndex;
  engine.streamControllers[ctrlIndex] = ac;

  try {
    const chunkSize = 262144; // 256 KB chunk
    const buffer = new Uint8Array(chunkSize);
    const url = `${engine.config.uploadEndpoint}?cacheBust=${Date.now()}_${streamIndex}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/octet-stream' },
      body: buffer,
      signal: ac.signal,
      cache: 'no-store',
    });

    if (res.ok) {
      engine.bytesUpTick += chunkSize;
      engine.bytesUpTotal += chunkSize;
    }
  } catch {
    // Stream interrupted or aborted
  } finally {
    if (
      engine.status === 'running' &&
      engine.streamingActive &&
      generation === engine.streamGeneration
    ) {
      setTimeout(() => spawnUploadStream(engine, streamIndex, generation), 0);
    }
  }
}

export async function sendLatencyProbe(engine) {
  if (engine.status !== 'running' || engine.probeInFlight) return;
  engine.probeInFlight = true;
  const ac = new AbortController();
  const timeoutId = setTimeout(() => ac.abort(), engine.config.probeTimeoutMs);
  const start = performance.now();

  try {
    const probeUrl = `${engine.config.probeEndpoint}&probeBust=${Date.now()}_${Math.random()}`;
    const res = await fetch(probeUrl, {
      signal: ac.signal,
      cache: 'no-store',
      mode: 'cors',
    });
    clearTimeout(timeoutId);

    if (res.body) {
      try {
        await res.body.cancel();
      } catch {}
    }

    const rtt = Math.max(1, performance.now() - start);
    engine.recordProbe(rtt, res.ok);
  } catch {
    clearTimeout(timeoutId);
    engine.recordProbe(engine.config.probeTimeoutMs, false);
  } finally {
    engine.probeInFlight = false;
  }
}
