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
            const p = event.params;
            return (
              <div className="bench-event" key={event.id}>
                <span
                  className={`bench-event-dot bench-event-dot--${meta.tone}`}
                  aria-hidden="true"
                />
                <div className="bench-event-time-col">
                  <span className="bench-event-time">{event.timeFormatted}</span>
                  {p?.wallClock && (
                    <span className="bench-event-wallclock">{p.wallClock}</span>
                  )}
                </div>
                <div className="bench-event-body">
                  <div className="bench-event-head">
                    <span className={`bench-event-type bench-event-type--${meta.tone}`}>
                      {meta.label}
                    </span>
                    <span className="bench-event-message">{event.message}</span>
                  </div>

                  {p && (
                    <div className="bench-event-params">
                      {p.downMbps > 0 && (
                        <span className="bench-param-chip" title="Instantaneous Download Throughput">
                          <span className="bench-param-key">DL:</span>
                          <span className="bench-param-val">{p.downMbps} Mbps</span>
                        </span>
                      )}
                      {p.upMbps > 0 && (
                        <span className="bench-param-chip" title="Instantaneous Upload Throughput">
                          <span className="bench-param-key">UL:</span>
                          <span className="bench-param-val">{p.upMbps} Mbps</span>
                        </span>
                      )}
                      {p.pingMs > 0 && (
                        <span className="bench-param-chip" title="Loaded Ping (Round-Trip Time)">
                          <span className="bench-param-key">Ping:</span>
                          <span className="bench-param-val">{p.pingMs} ms</span>
                        </span>
                      )}
                      {p.jitterMs > 0 && (
                        <span className="bench-param-chip" title="Jitter Variance">
                          <span className="bench-param-key">Jitter:</span>
                          <span className="bench-param-val">{p.jitterMs} ms</span>
                        </span>
                      )}
                      {p.lossPct !== null && p.lossPct !== undefined && p.lossPct > 0 && (
                        <span className="bench-param-chip bench-param-chip--warn" title="Rolling Probe Loss">
                          <span className="bench-param-key">Loss:</span>
                          <span className="bench-param-val">{p.lossPct}%</span>
                        </span>
                      )}
                      {p.dataUsed && (
                        <span className="bench-param-chip" title="Total Transferred Data">
                          <span className="bench-param-key">Data:</span>
                          <span className="bench-param-val">{p.dataUsed}</span>
                        </span>
                      )}
                      {p.mode && (
                        <span className="bench-param-chip" title="Operating Mode">
                          <span className="bench-param-key">Mode:</span>
                          <span className="bench-param-val">{p.mode}</span>
                        </span>
                      )}
                      {p.streams && (
                        <span className="bench-param-chip" title="Active Parallel Streams">
                          <span className="bench-param-key">Streams:</span>
                          <span className="bench-param-val">{p.streams}</span>
                        </span>
                      )}
                      {p.dataCap && (
                        <span className="bench-param-chip" title="Active Data Cap Limit">
                          <span className="bench-param-key">Cap:</span>
                          <span className="bench-param-val">{p.dataCap}</span>
                        </span>
                      )}
                      {p.burst && (
                        <span className="bench-param-chip" title="Initial Burst Speed">
                          <span className="bench-param-key">Burst:</span>
                          <span className="bench-param-val">{p.burst} Mbps</span>
                        </span>
                      )}
                      {p.sustained && (
                        <span className="bench-param-chip" title="Sustained Throttle Speed">
                          <span className="bench-param-key">Sustained:</span>
                          <span className="bench-param-val">{p.sustained} Mbps</span>
                        </span>
                      )}
                      {p.duration && (
                        <span className="bench-param-chip" title="Total Test Duration">
                          <span className="bench-param-key">Duration:</span>
                          <span className="bench-param-val">{p.duration}</span>
                        </span>
                      )}
                      {p.connType && p.connType !== 'Unknown' && (
                        <span className="bench-param-chip" title="Estimated Network Interface">
                          <span className="bench-param-key">Net:</span>
                          <span className="bench-param-val">{p.connType}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
