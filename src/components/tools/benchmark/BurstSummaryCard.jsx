import React from 'react';
import { ChartLine, Lightning } from '@phosphor-icons/react';
import { formatValue } from '../../../utils/benchmark-view';

function getVerdict(burstSpeed, sustainedSpeed) {
  if (burstSpeed === null || burstSpeed === undefined) {
    return { label: 'Awaiting data', tone: 'neutral' };
  }
  if (sustainedSpeed === null || sustainedSpeed === undefined) {
    return { label: 'Building baseline', tone: 'neutral' };
  }
  if (!burstSpeed) return { label: 'No data', tone: 'neutral' };

  const drop = Math.max(0, Math.round(((burstSpeed - sustainedSpeed) / burstSpeed) * 100));
  if (drop >= 25) return { label: `Dropping ${drop}%`, tone: 'bad' };
  if (drop >= 10) return { label: `Settling ${drop}%`, tone: 'warn' };
  return { label: 'Holding steady', tone: 'good' };
}

function CompareRow({ label, hint, value, max, colorVar, pending }) {
  const width =
    value !== null && value !== undefined && max > 0
      ? Math.max(2, Math.min(100, (value / max) * 100))
      : 0;

  return (
    <div className="bench-compare-row">
      <div className="bench-compare-label">
        <span>{label}</span>
        <small>{hint}</small>
      </div>
      <div className="bench-compare-track" aria-hidden="true">
        <span
          className="bench-compare-fill"
          style={{ width: `${width}%`, background: `var(${colorVar})` }}
        />
      </div>
      <div className="bench-compare-value">
        {pending ? (
          <span className="bench-compare-pending">Analyzing…</span>
        ) : (
          <>
            {value !== null && value !== undefined ? formatValue(value) : '—'}
            <small> Mbps</small>
          </>
        )}
      </div>
    </div>
  );
}

export function BurstSummaryCard({ snapshot }) {
  const { burstSpeed, sustainedSpeed, stepDownReport, elapsedSeconds } = snapshot;
  const dropPct =
    burstSpeed !== null && sustainedSpeed !== null && burstSpeed > 0
      ? Math.max(0, Math.round(((burstSpeed - sustainedSpeed) / burstSpeed) * 100))
      : null;
  const verdict = getVerdict(burstSpeed, sustainedSpeed);
  const max = Math.max(burstSpeed || 0, sustainedSpeed || 0, 1);
  const pending = burstSpeed !== null && sustainedSpeed === null && elapsedSeconds < 60;

  return (
    <section className="bench-card bench-stability" aria-labelledby="bench-stability-title">
      <div className="bench-card-head">
        <div>
          <span className="bench-eyebrow">Stability</span>
          <h3 id="bench-stability-title">Burst vs sustained</h3>
          <p className="bench-card-desc">
            ISPs often deliver a fast opening burst, then settle lower. This compares the start of
            the run with the rate that actually holds.
          </p>
        </div>
        <span className={`bench-grade bench-grade--${verdict.tone}`}>{verdict.label}</span>
      </div>

      {burstSpeed === null ? (
        <div className="bench-empty">
          <ChartLine size={20} weight="bold" aria-hidden="true" />
          <div>
            <strong>Baseline builds after about 20 seconds.</strong>
            <span>
              Run the test a little longer to compare the initial burst with the sustained median.
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className="bench-compare">
            <CompareRow
              label="Initial burst"
              hint="Average of first 10 s"
              value={burstSpeed}
              max={max}
              colorVar="--bench-download"
            />
            <CompareRow
              label="Sustained median"
              hint="Median of later samples"
              value={sustainedSpeed}
              max={max}
              colorVar="--bench-ping"
              pending={pending}
            />
          </div>

          <div className="bench-diff">
            <span>Difference</span>
            <strong className={dropPct !== null && dropPct >= 10 ? 'is-warn' : ''}>
              {dropPct !== null ? `${dropPct}%` : '—'}
            </strong>
            <span>
              {dropPct === null
                ? 'Still collecting a stable second half.'
                : dropPct >= 25
                  ? 'The sustained rate is clearly lower than the burst.'
                  : dropPct >= 10
                    ? 'A modest drop after the opening seconds.'
                    : 'The connection is holding its opening rate.'}
            </span>
          </div>
        </>
      )}

      {stepDownReport && (
        <div className="bench-alert">
          <Lightning size={16} weight="bold" aria-hidden="true" />
          <div>
            <strong>Step-down detected at T+{stepDownReport.time}</strong>
            <span>
              Throughput shifted from ~{stepDownReport.fromMbps} Mbps to ~{stepDownReport.toMbps}{' '}
              Mbps ({stepDownReport.dropPct}% lower).
            </span>
          </div>
        </div>
      )}

      <p className="bench-footnote">
        Sustained rate is the median of later samples, not a promise of your plan speed. Use a wired
        connection where possible to remove Wi-Fi variance.
      </p>
    </section>
  );
}
