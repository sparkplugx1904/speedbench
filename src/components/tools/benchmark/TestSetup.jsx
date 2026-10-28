import React, { useRef } from 'react';
import { CaretDown, GearSix, Warning } from '@phosphor-icons/react';

function capLabel(cap) {
  if (!cap) return 'Unlimited data';
  if (cap >= 1024) {
    const gb = cap / 1024;
    return `${Number.isInteger(gb) ? gb : gb.toFixed(1)} GB cap`;
  }
  return `${cap} MB cap`;
}

export function TestSetup({
  detailsRef,
  mode,
  onModeChange,
  dataCap,
  onDataCapChange,
  connType,
  onConnTypeChange,
  ispNote,
  onIspNoteChange,
  locked,
}) {
  const modeGridRef = useRef(null);
  const summary = [
    mode === 'interval' ? 'Interval · 10s on / 20s rest' : 'Continuous',
    capLabel(dataCap),
    connType || 'Interface not set',
  ].join(' · ');

  const handleModeKeyDown = (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const nextMode =
      event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? 'continuous' : 'interval';
    if (nextMode === mode) return;
    onModeChange(nextMode);
    window.requestAnimationFrame(() => {
      modeGridRef.current?.querySelector(`[data-mode="${nextMode}"]`)?.focus();
    });
  };

  return (
    <details className="bench-card bench-details" ref={detailsRef}>
      <summary className="bench-details-summary">
        <span className="bench-details-icon" aria-hidden="true">
          <GearSix size={18} weight="bold" />
        </span>
        <span className="bench-details-title">
          <strong>Test setup</strong>
          <small>{summary}</small>
        </span>
        <CaretDown size={16} weight="bold" className="bench-details-chevron" aria-hidden="true" />
      </summary>

      <div className="bench-details-body">
        <p className="bench-details-note">
          Mode and data cap are locked while a test is measuring. Connection notes can be updated at
          any time and are saved with the session.
        </p>

        <div className="bench-fieldset">
          <span className="bench-field-legend">Measurement mode</span>
          <div
            className="bench-mode-grid"
            role="radiogroup"
            aria-label="Measurement mode"
            ref={modeGridRef}
            onKeyDown={handleModeKeyDown}
          >
            <button
              type="button"
              role="radio"
              aria-checked={mode === 'continuous'}
              className="bench-mode"
              data-mode="continuous"
              tabIndex={mode === 'continuous' ? 0 : -1}
              onClick={() => onModeChange('continuous')}
              disabled={locked}
            >
              <strong>Continuous</strong>
              <span>Nonstop load. Best for catching bufferbloat and long-term slowdowns.</span>
              <em>≈22 GB/hour at 50 Mbps</em>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={mode === 'interval'}
              className="bench-mode"
              data-mode="interval"
              tabIndex={mode === 'interval' ? 0 : -1}
              onClick={() => onModeChange('interval')}
              disabled={locked}
            >
              <strong>Interval</strong>
              <span>
                Ten seconds of load, then twenty seconds of rest. Easier on metered plans.
              </span>
              <em>10s on · 20s rest</em>
            </button>
          </div>
        </div>

        <div className="bench-callout bench-callout--warn">
          <Warning size={16} weight="bold" aria-hidden="true" />
          <div>
            <strong>
              {mode === 'interval'
                ? 'Interval mode uses roughly one-third of the data.'
                : 'Continuous mode can consume a lot of data.'}
            </strong>
            <span>
              {dataCap > 0
                ? `The test stops automatically after ${capLabel(dataCap).replace(' cap', '')} downloaded.`
                : 'At 50 Mbps, one hour uses about 22 GB. Set a cap if your plan is metered.'}
            </span>
          </div>
        </div>

        <div className="bench-fields">
          <div className="bench-field">
            <label htmlFor="bench-data-cap">Data cap</label>
            <select
              id="bench-data-cap"
              className="bench-select"
              value={dataCap}
              onChange={(event) => onDataCapChange(Number(event.target.value))}
              disabled={locked}
            >
              <option value={0}>Unlimited</option>
              <option value={500}>500 MB</option>
              <option value={1024}>1 GB</option>
              <option value={5120}>5 GB</option>
              <option value={10240}>10 GB</option>
            </select>
            <small>The cap counts downloaded bytes only.</small>
          </div>

          <div className="bench-field">
            <label htmlFor="bench-conn-type">Connection interface</label>
            <input
              id="bench-conn-type"
              className="bench-input"
              type="text"
              value={connType}
              onChange={(event) => onConnTypeChange(event.target.value)}
              placeholder="e.g. Wi-Fi 6, 1 Gbps Ethernet, 5G"
            />
            <small>Prefilled from the browser estimate; edit to match your link.</small>
          </div>

          <div className="bench-field bench-field--full">
            <label htmlFor="bench-isp-note">ISP / plan note (optional)</label>
            <input
              id="bench-isp-note"
              className="bench-input"
              type="text"
              value={ispNote}
              onChange={(event) => onIspNoteChange(event.target.value)}
              placeholder="e.g. Fiber 50 Mbps plan"
            />
            <small>Useful when comparing sessions later.</small>
          </div>
        </div>

        <div className="bench-specs" aria-label="Measurement specification">
          <span>4 parallel streams</span>
          <span>1 sample / second</span>
          <span>4 latency probes / second</span>
          <span>Download only</span>
        </div>
      </div>
    </details>
  );
}
