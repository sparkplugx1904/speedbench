import React, { useEffect, useMemo, useState } from 'react';
import { formatElapsed } from '../../../utils/benchmark-format';
import { TIME_WINDOWS } from '../../../utils/benchmark-config';
import { CHART_METRICS, formatValue, getWindowStats } from '../../../utils/benchmark-view';
import { TimelineChart } from './TimelineChart';

function InspectorItem({ colorVar, label, value, unit }) {
  return (
    <span className="bench-inspector-item">
      <span className="bench-swatch" style={{ background: `var(${colorVar})` }} />
      {label} <strong>{formatValue(value)}</strong> {unit}
    </span>
  );
}

export function BenchmarkCharts({ snapshot }) {
  const [metricId, setMetricId] = useState('throughput');
  const [timeWindow, setTimeWindow] = useState('5m');
  const [hoverIndex, setHoverIndex] = useState(null);

  const metric = CHART_METRICS.find((item) => item.id === metricId) || CHART_METRICS[0];
  const windowSec = TIME_WINDOWS.find((item) => item.id === timeWindow)?.seconds || 300;
  const allSamples = snapshot.samples;

  // The engine appends to the same samples array. Return a fresh array so the
  // canvas and the memoized window statistics update on every 1 Hz sample.
  const visibleSamples =
    windowSec === Infinity || allSamples.length <= windowSec
      ? allSamples.slice()
      : allSamples.slice(-windowSec);

  useEffect(() => {
    setHoverIndex(null);
  }, [metricId, timeWindow]);

  const windowStats = useMemo(
    () => getWindowStats(visibleSamples, metric.key),
    [metric.key, visibleSamples],
  );

  const activeSample =
    hoverIndex !== null && visibleSamples[hoverIndex]
      ? visibleSamples[hoverIndex]
      : visibleSamples[visibleSamples.length - 1] || null;

  return (
    <section className="bench-card bench-timeline" aria-labelledby="bench-timeline-title">
      <div className="bench-card-head">
        <div>
          <span className="bench-eyebrow">Timeline</span>
          <h3 id="bench-timeline-title">Connection over time</h3>
          <p className="bench-card-desc">
            One sample per second. Switch metric or time span, then hover or tap the chart to
            inspect a second.
          </p>
        </div>

        <div className="bench-metric-tabs" role="group" aria-label="Choose chart metric">
          {CHART_METRICS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="bench-tab"
              aria-pressed={metricId === item.id}
              onClick={() => setMetricId(item.id)}
            >
              <span
                className="bench-swatch"
                style={{ background: `var(${item.cssVar})` }}
                aria-hidden="true"
              />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bench-chart-controls">
        <div className="bench-segment" role="group" aria-label="Chart time span">
          {TIME_WINDOWS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={timeWindow === item.id}
              onClick={() => setTimeWindow(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <dl className="bench-window-stats">
          <div>
            <dt>Avg</dt>
            <dd>{visibleSamples.length ? formatValue(windowStats.avg, metric.decimals) : '—'}</dd>
          </div>
          <div>
            <dt>Low</dt>
            <dd>{visibleSamples.length ? formatValue(windowStats.min, metric.decimals) : '—'}</dd>
          </div>
          <div>
            <dt>Peak</dt>
            <dd>{visibleSamples.length ? formatValue(windowStats.max, metric.decimals) : '—'}</dd>
          </div>
          <span className="bench-window-unit">{metric.unit}</span>
        </dl>
      </div>

      <TimelineChart
        samples={visibleSamples}
        metric={metric}
        burstSpeed={snapshot.burstSpeed}
        sustainedSpeed={snapshot.sustainedSpeed}
        hoverIndex={hoverIndex}
        onHoverChange={setHoverIndex}
      />

      <div className="bench-inspector">
        {activeSample ? (
          <>
            <span className="bench-inspector-time">T+{formatElapsed(activeSample.t)}</span>
            <InspectorItem
              colorVar="--bench-download"
              label="down"
              value={activeSample.downMbps}
              unit="Mbps"
            />
            <InspectorItem
              colorVar="--bench-ping"
              label="ping"
              value={activeSample.pingMs}
              unit="ms"
            />
            <InspectorItem
              colorVar="--bench-jitter"
              label="jitter"
              value={activeSample.jitterMs}
              unit="ms"
            />
            <InspectorItem
              colorVar="--bench-loss"
              label="loss"
              value={activeSample.lossPct}
              unit="%"
            />
          </>
        ) : (
          <span className="bench-inspector-hint">
            Start the test to inspect synchronized samples.
          </span>
        )}
      </div>
    </section>
  );
}
