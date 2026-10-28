import React, { useEffect, useRef, useState } from 'react';
import { Warning } from '@phosphor-icons/react';
import { BenchmarkEngine } from '../../utils/benchmark-engine';
import { SessionBar } from './benchmark/SessionBar';
import { SessionRecovery } from './benchmark/SessionRecovery';
import { ReadoutsGrid } from './benchmark/ReadoutsGrid';
import { BenchmarkCharts } from './benchmark/BenchmarkCharts';
import { BurstSummaryCard } from './benchmark/BurstSummaryCard';
import { EventLog } from './benchmark/EventLog';
import { SessionExport } from './benchmark/SessionExport';
import { TestSetup } from './benchmark/TestSetup';
import { TechnicalNotes } from './benchmark/TechnicalNotes';
import '../../styles/benchmark.css';

function saveTextFile(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function detectedConnection(engine) {
  const value = engine.testConditions.connectionType;
  return value && value !== 'Unknown' ? value : '';
}

export function BenchmarkTool() {
  const engineRef = useRef(null);
  if (!engineRef.current) {
    engineRef.current = new BenchmarkEngine();
  }
  const engine = engineRef.current;
  const setupRef = useRef(null);

  const [snapshot, setSnapshot] = useState(() => engine.getSnapshot());
  const [hasStored, setHasStored] = useState(() => engine.hasStoredSession());
  const [mode, setMode] = useState(() => engine.mode);
  const [dataCap, setDataCap] = useState(() => engine.dataCapMB);
  const [connType, setConnType] = useState(() => detectedConnection(engine));
  const [ispNote, setIspNote] = useState(() => engine.testConditions.isp || '');

  useEffect(() => {
    const unsubscribe = engine.subscribe((next) => setSnapshot(next));
    return () => {
      unsubscribe();
      engine.stop();
    };
  }, [engine]);

  const handleStart = () => {
    engine.testConditions = { connectionType: connType, isp: ispNote };
    engine.dataCapMB = Number(dataCap) || 0;
    engine.mode = mode;
    engine.start();
    setHasStored(false);
  };

  const handleStop = () => {
    engine.stop();
  };

  const handleReset = () => {
    engine.reset();
    setHasStored(false);
  };

  const handleRestore = () => {
    if (!engine.loadFromStorage()) return;
    setHasStored(false);
    setMode(engine.mode);
    setDataCap(engine.dataCapMB);
    setConnType(detectedConnection(engine));
    setIspNote(engine.testConditions.isp || '');
    setSnapshot(engine.getSnapshot());
  };

  const handleDiscard = () => {
    engine.clearStorage();
    setHasStored(false);
  };

  const handleModeChange = (nextMode) => {
    if (engine.status === 'running') return;
    engine.mode = nextMode;
    setMode(nextMode);
    setSnapshot(engine.getSnapshot());
  };

  const handleDataCapChange = (nextCap) => {
    if (engine.status === 'running') return;
    engine.dataCapMB = nextCap;
    setDataCap(nextCap);
    setSnapshot(engine.getSnapshot());
  };

  const handleConnTypeChange = (value) => {
    setConnType(value);
    engine.testConditions = { ...engine.testConditions, connectionType: value };
  };

  const handleIspNoteChange = (value) => {
    setIspNote(value);
    engine.testConditions = { ...engine.testConditions, isp: value };
  };

  const openSetup = () => {
    const panel = setupRef.current;
    if (!panel) return;
    panel.open = true;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.requestAnimationFrame(() => {
      panel.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'center',
      });
    });
  };

  const handleExportCSV = () => {
    saveTextFile(
      `speedbench-${Date.now()}.csv`,
      `\uFEFF${engine.exportCSV()}`,
      'text/csv;charset=utf-8',
    );
  };

  const handleExportJSON = () => {
    saveTextFile(
      `speedbench-${Date.now()}.json`,
      engine.exportJSON(),
      'application/json;charset=utf-8',
    );
  };

  const showDataNotice =
    snapshot.mode === 'continuous' &&
    dataCap === 0 &&
    snapshot.samples.length === 0 &&
    snapshot.status === 'idle';

  return (
    <div className="bench">
      {hasStored && snapshot.status === 'idle' && snapshot.samples.length === 0 && (
        <SessionRecovery onRestore={handleRestore} onDiscard={handleDiscard} />
      )}

      <SessionBar
        snapshot={snapshot}
        onStart={handleStart}
        onPause={() => engine.pause()}
        onStop={handleStop}
        onReset={handleReset}
        onOpenSetup={openSetup}
      />

      {showDataNotice && (
        <div className="bench-notice">
          <Warning size={16} weight="bold" aria-hidden="true" />
          <p>
            <strong>Metered connection?</strong> Continuous mode can use about 22 GB per hour at 50
            Mbps.{' '}
            <button type="button" className="bench-link" onClick={openSetup}>
              Set a data cap
            </button>{' '}
            or switch to interval mode.
          </p>
        </div>
      )}

      <ReadoutsGrid snapshot={snapshot} />
      <BenchmarkCharts snapshot={snapshot} />

      <div className="bench-lower">
        <BurstSummaryCard snapshot={snapshot} />
        <EventLog events={snapshot.events} />
      </div>

      {snapshot.samples.length > 0 && (
        <SessionExport
          sampleCount={snapshot.samples.length}
          elapsed={snapshot.elapsedFormatted}
          dataUsed={snapshot.dataUsedFormatted}
          onExportCSV={handleExportCSV}
          onExportJSON={handleExportJSON}
        />
      )}

      <TestSetup
        detailsRef={setupRef}
        mode={mode}
        onModeChange={handleModeChange}
        dataCap={dataCap}
        onDataCapChange={handleDataCapChange}
        connType={connType}
        onConnTypeChange={handleConnTypeChange}
        ispNote={ispNote}
        onIspNoteChange={handleIspNoteChange}
        locked={snapshot.status === 'running'}
      />

      <TechnicalNotes />
    </div>
  );
}
