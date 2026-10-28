import React from 'react';
import { DownloadSimple } from '@phosphor-icons/react';
import { BenchButton } from './BenchButton';

export function SessionExport({ sampleCount, elapsed, dataUsed, onExportCSV, onExportJSON }) {
  return (
    <section className="bench-export" aria-label="Export benchmark session">
      <div className="bench-export-copy">
        <span className="bench-eyebrow">Session data</span>
        <p>
          {sampleCount} {sampleCount === 1 ? 'sample' : 'samples'} · {elapsed} elapsed · {dataUsed}{' '}
          downloaded
        </p>
      </div>
      <div className="bench-export-actions">
        <BenchButton variant="secondary" onClick={onExportCSV}>
          <DownloadSimple size={15} aria-hidden="true" />
          Export CSV
        </BenchButton>
        <BenchButton variant="secondary" onClick={onExportJSON}>
          <DownloadSimple size={15} aria-hidden="true" />
          Export JSON
        </BenchButton>
      </div>
    </section>
  );
}
