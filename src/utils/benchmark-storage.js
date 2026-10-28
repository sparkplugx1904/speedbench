/**
 * Local session storage. The last benchmark session stays on-device only; no
 * endpoint ever receives this data.
 */

const STORAGE_KEY = 'speedbench_session';

function safeRead() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    if (typeof localStorage === 'undefined' || !session?.samples?.length) return false;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        elapsedSeconds: session.elapsedSeconds,
        bytesDownTotal: session.bytesDownTotal,
        samples: session.samples.slice(-300), // last 5 min of samples
        events: session.events.slice(0, 20),
        testConditions: session.testConditions,
        mode: session.mode,
        dataCapMB: session.dataCapMB,
      }),
    );
    return true;
  } catch {
    return false;
  }
}

export function hasStoredSession() {
  try {
    if (typeof localStorage === 'undefined') return false;
    return !!localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}

export function loadSession() {
  return safeRead();
}

export function clearSession() {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
