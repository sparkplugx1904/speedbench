import React from 'react';
import { ArrowCounterClockwise, GearSix, Pause, Play, Stop } from '@phosphor-icons/react';
import { getStatusView } from '../../../utils/benchmark-view';
import { BenchButton } from './BenchButton';

function modeLabel(snapshot) {
  if (snapshot.mode === 'interval') {
    return snapshot.status === 'idle' ? 'Interval · 10/20' : 'Interval';
  }
  return 'Continuous';
}

export function SessionBar({ snapshot, onStart, onPause, onStop, onReset, onOpenSetup }) {
  const status = getStatusView(snapshot);
  const isRunning = snapshot.status === 'running';
  const isPaused = snapshot.status === 'paused';
  const isOffline = snapshot.status === 'offline';
  const hasSamples = snapshot.samples.length > 0;

  return (
    <section className="bench-toolbar" aria-label="Benchmark session controls">
      <div className="bench-status">
        <span className={`bench-dot bench-dot--${status.tone}`} aria-hidden="true" />
        <div className="bench-status-copy">
          <span className="bench-status-label" aria-live="polite">
            {status.label}
          </span>
          <span className="bench-status-detail">{status.detail}</span>
        </div>
      </div>

      <dl className="bench-session-stats">
        <div>
          <dt>Elapsed</dt>
          <dd>{snapshot.elapsedFormatted}</dd>
        </div>
        <div>
          <dt>Downloaded</dt>
          <dd>{snapshot.dataUsedFormatted}</dd>
        </div>
        <div>
          <dt>Mode</dt>
          <dd>{modeLabel(snapshot)}</dd>
        </div>
      </dl>

      <div className="bench-toolbar-actions">
        {isRunning ? (
          <>
            <BenchButton variant="primary" onClick={onPause}>
              <Pause size={15} weight="fill" aria-hidden="true" />
              Pause
            </BenchButton>
            <BenchButton variant="danger" onClick={onStop}>
              <Stop size={15} weight="fill" aria-hidden="true" />
              Stop
            </BenchButton>
          </>
        ) : isPaused ? (
          <>
            <BenchButton variant="primary" onClick={onStart}>
              <Play size={15} weight="fill" aria-hidden="true" />
              Resume
            </BenchButton>
            <BenchButton variant="danger" onClick={onStop}>
              <Stop size={15} weight="fill" aria-hidden="true" />
              Stop
            </BenchButton>
          </>
        ) : isOffline ? (
          <>
            <BenchButton variant="primary" disabled>
              Waiting for network…
            </BenchButton>
            <BenchButton variant="danger" onClick={onStop}>
              <Stop size={15} weight="fill" aria-hidden="true" />
              Stop
            </BenchButton>
          </>
        ) : (
          <>
            <BenchButton variant="primary" onClick={onStart}>
              <Play size={15} weight="fill" aria-hidden="true" />
              {hasSamples ? 'Resume test' : 'Start test'}
            </BenchButton>
            {hasSamples && (
              <BenchButton variant="ghost" onClick={onReset}>
                <ArrowCounterClockwise size={15} aria-hidden="true" />
                Reset
              </BenchButton>
            )}
          </>
        )}

        <BenchButton
          variant="icon"
          onClick={onOpenSetup}
          aria-label="Open test setup"
          title="Test setup"
        >
          <GearSix size={18} aria-hidden="true" />
        </BenchButton>
      </div>
    </section>
  );
}
