/**
 * Pure numeric/time formatting helpers shared by the benchmark engine, view
 * layer, and exports.
 */

function quickselect(arr, k) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const pivot = arr[(left + right) >> 1];
    let i = left;
    let j = right;
    while (i <= j) {
      while (arr[i] < pivot) i++;
      while (arr[j] > pivot) j--;
      if (i <= j) {
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
        i++;
        j--;
      }
    }
    if (k <= j) right = j;
    else if (k >= i) left = i;
    else return arr[k];
  }
  return arr[k];
}

/**
 * Calculates percentile of an array of numbers using nearest-rank selection.
 * Uses quickselect for O(N) performance on larger sample buffers.
 */
export function calcPercentile(arr, p) {
  if (!arr || arr.length === 0) return 0;
  const len = arr.length;
  const idx = Math.min(Math.floor((p / 100) * len), len - 1);
  if (len <= 64) {
    const sorted = Array.from(arr).sort((a, b) => a - b);
    return sorted[idx];
  }
  const copy = Array.from(arr);
  return quickselect(copy, idx);
}

export function calcMedian(arr) {
  return calcPercentile(arr, 50);
}

export function formatElapsed(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

export function formatBytes(bytes) {
  if (bytes <= 0) return '0 B';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
