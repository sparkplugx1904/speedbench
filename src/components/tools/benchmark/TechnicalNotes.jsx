import React from 'react';
import { CaretDown, Info } from '@phosphor-icons/react';

export function TechnicalNotes() {
  return (
    <details className="bench-card bench-details bench-notes">
      <summary className="bench-details-summary">
        <span className="bench-details-icon" aria-hidden="true">
          <Info size={18} weight="bold" />
        </span>
        <span className="bench-details-title">
          <strong>How measurements work</strong>
          <small>Loaded latency, probe loss, data use, privacy</small>
        </span>
        <CaretDown size={16} weight="bold" className="bench-details-chevron" aria-hidden="true" />
      </summary>

      <div className="bench-details-body">
        <div className="bench-notes-grid">
          <div className="bench-note">
            <h4>Loaded latency</h4>
            <p>
              Ping is sampled while four download streams are active, so it reflects the latency you
              feel under load and can expose bufferbloat.
            </p>
          </div>
          <div className="bench-note">
            <h4>Probe loss</h4>
            <p>
              Browsers cannot send ICMP. Loss is the share of small HTTP probes that fail or time
              out (&gt;2 s) across the last 20 probes — labeled probe loss for that reason.
            </p>
          </div>
          <div className="bench-note">
            <h4>Download only</h4>
            <p>
              This build measures download throughput. Upload is not part of the live readout, and
              the data cap counts downloaded bytes only.
            </p>
          </div>
          <div className="bench-note">
            <h4>Endpoints & privacy</h4>
            <p>
              Traffic goes to Cloudflare's public speed endpoints. SpeedBench sends no telemetry;
              the last session is stored only in this browser.
            </p>
          </div>
        </div>
        <p className="bench-notes-foot">
          Keep this tab visible during a run. Background throttling, Wi-Fi interference, and other
          devices on the link can all move the result.
        </p>
      </div>
    </details>
  );
}
