import React from 'react';
import { Info } from '@phosphor-icons/react';

const TYPE_META = {
  info: { label: 'Info', tone: 'info' },
  warn: { label: 'Warning', tone: 'warn' },
  error: { label: 'Outage', tone: 'error' },
  drop: { label: 'Step-down', tone: 'drop' },
};

export function EventLog({ events = [] }) {
  return (
    <section className="bench-card bench-events" aria-labelledby="bench-events-title">
      <div className="bench-card-head">
        <div>
          <span className="bench-eyebrow">Log</span>
          <h3 id="bench-events-title">Session events</h3>
          <p className="bench-card-desc">Outages, data-cap stops, and measured throughput drops.</p>
        </div>
        <span className="bench-count">
          {events.length} {events.length === 1 ? 'event' : 'events'}
        </span>
      </div>

      {events.length === 0 ? (
        <div className="bench-empty bench-empty--compact">
          <Info size={19} weight="bold" aria-hidden="true" />
          <div>
            <strong>Nothing to report.</strong>
            <span>Start the test and notable network events will appear here.</span>
          </div>
        </div>
      ) : (
        <div className="bench-event-list" tabIndex={0} aria-label="Benchmark event history">
          {events.map((event) => {
            const meta = TYPE_META[event.type] || TYPE_META.info;
            return (
              <div className="bench-event" key={event.id}>
                <span
                  className={`bench-event-dot bench-event-dot--${meta.tone}`}
                  aria-hidden="true"
                />
                <span className="bench-event-time">{event.timeFormatted}</span>
                <div className="bench-event-body">
                  <span className={`bench-event-type bench-event-type--${meta.tone}`}>
                    {meta.label}
                  </span>
                  <span className="bench-event-message">{event.message}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
