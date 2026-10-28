import React from 'react';
import { ChartLine, Drop, Pulse, WaveSine } from '@phosphor-icons/react';
import { VITAL_METRICS, formatValue, getGrade } from '../../../utils/benchmark-view';
import { Sparkline } from './Sparkline';

const ICONS = {
  pulse: Pulse,
  wave: WaveSine,
  drop: Drop,
};

function heroState(snapshot) {
  if (snapshot.status === 'running') {
    if (snapshot.mode === 'interval' && snapshot.intervalPhase === 'rest') {
      return { label: 'Resting', tone: 'warn' };
    }
    return { label: 'Live sample', tone: 'live' };
  }
  if (snapshot.status === 'paused') return { label: 'Paused', tone: 'warn' };
  if (snapshot.status === 'offline') return { label: 'Offline', tone: 'bad' };
  return snapshot.samples.length > 0
    ? { label: 'Last sample', tone: 'neutral' }
    : { label: 'Waiting', tone: 'neutral' };
}

function heroNote(snapshot) {
  if (snapshot.status === 'running') {
    if (snapshot.mode === 'interval' && snapshot.intervalPhase === 'rest') {
      return 'Rest phase in progress. Samples resume with the next burst.';
    }
    return 'Sampling once per second. Keep this tab visible for accurate results.';
  }
  if (snapshot.status === 'paused') return 'Paused. Resume when you are ready.';
  if (snapshot.status === 'offline')
    return 'Connection lost. The test continues when the device is back online.';
  if (snapshot.samples.length > 0) return 'Session stopped. Export the captured samples below.';
  return 'Start the test to capture your first sample.';
}

export function ReadoutsGrid({ snapshot }) {
  const hasSamples = snapshot.samples.length > 0;
  const throughput = snapshot.stats.throughput;
  const state = heroState(snapshot);
  const sparkValues = snapshot.samples.slice(-60).map((sample) => sample.downMbps);

  return (
    <div className="bench-overview">
      <article className="bench-card bench-hero" aria-labelledby="bench-hero-title">
        <div className="bench-hero-head">
          <div>
            <span className="bench-eyebrow" id="bench-hero-title">
              <span className="bench-swatch" aria-hidden="true" />
              Download throughput
            </span>
            <p className="bench-hero-kicker">Latest 1-second sample</p>
          </div>
          <span className={`bench-live bench-live--${state.tone}`}>{state.label}</span>
        </div>

        <div className="bench-hero-value">
          <strong>{hasSamples ? formatValue(throughput.cur) : '—'}</strong>
          <span>Mbps</span>
        </div>

        <dl className="bench-hero-stats">
          <div>
            <dt>Average</dt>
            <dd>{hasSamples ? formatValue(throughput.avg) : '—'}</dd>
          </div>
          <div>
            <dt>Low</dt>
            <dd>{hasSamples ? formatValue(throughput.min) : '—'}</dd>
          </div>
          <div>
            <dt>Peak</dt>
            <dd>{hasSamples ? formatValue(throughput.max) : '—'}</dd>
          </div>
          <div>
            <dt>P95</dt>
            <dd>{hasSamples ? formatValue(throughput.p95) : '—'}</dd>
          </div>
        </dl>

        <Sparkline values={sparkValues} height={64} floor={10} />
        <p className="bench-hero-foot">{heroNote(snapshot)}</p>
      </article>

      <div className="bench-vitals" aria-label="Connection quality vitals">
        {VITAL_METRICS.map((vital) => {
          const StatIcon = ICONS[vital.icon] || ChartLine;
          const stat = snapshot.stats[vital.key] || { cur: 0, avg: 0, max: 0 };
          const grade = getGrade(vital.grade, stat.cur, hasSamples);
          const values = snapshot.samples.slice(-60).map((sample) => sample[vital.sampleKey]);

          return (
            <article className="bench-card bench-vital" key={vital.key}>
              <span
                className="bench-vital-icon"
                style={{ '--metric': `var(${vital.cssVar})` }}
                aria-hidden="true"
              >
                <StatIcon size={18} weight="bold" />
              </span>
              <div className="bench-vital-copy">
                <span className="bench-vital-label">{vital.label}</span>
                <span className="bench-vital-value">
                  {hasSamples ? formatValue(stat.cur) : '—'}
                  <small>{vital.unit}</small>
                </span>
                <span className="bench-vital-meta">
                  avg {hasSamples ? formatValue(stat.avg) : '—'} · peak{' '}
                  {hasSamples ? formatValue(stat.max) : '—'}
                </span>
              </div>
              <span className={`bench-grade bench-grade--${grade.tone}`}>{grade.label}</span>
              <Sparkline
                className="bench-vital-spark"
                values={values}
                colorVar={vital.cssVar}
                height={26}
                floor={vital.floor}
              />
            </article>
          );
        })}
      </div>
    </div>
  );
}
