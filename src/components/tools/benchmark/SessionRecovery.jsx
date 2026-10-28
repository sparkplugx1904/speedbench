import React from 'react';
import { ClockCounterClockwise } from '@phosphor-icons/react';
import { BenchButton } from './BenchButton';

export function SessionRecovery({ onRestore, onDiscard }) {
  return (
    <section className="bench-recovery" role="status" aria-label="Previous benchmark session">
      <span className="bench-recovery-icon" aria-hidden="true">
        <ClockCounterClockwise size={18} weight="bold" />
      </span>
      <div className="bench-recovery-copy">
        <strong>A previous session is stored on this device.</strong>
        <p>Restore its samples to review or export them. Starting a new test will replace it.</p>
      </div>
      <div className="bench-recovery-actions">
        <BenchButton variant="primary" onClick={onRestore}>
          Restore session
        </BenchButton>
        <BenchButton variant="ghost" onClick={onDiscard}>
          Discard
        </BenchButton>
      </div>
    </section>
  );
}
