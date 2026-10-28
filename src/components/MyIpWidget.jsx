import React from 'react';
import { MapPin } from '@phosphor-icons/react';

function formatLocation(data) {
  return [data.city, data.region, data.country].filter(Boolean).join(', ');
}

export function MyIpWidget({ myIp, onShowMap }) {
  if (myIp.status === 'loading') {
    return (
      <div
        className="border-t border-(--border) px-4 py-3 lg:px-5"
        aria-busy="true"
        aria-label="Detecting your IP"
      >
        <p className="text-[0.65rem] font-medium uppercase tracking-wider text-(--muted)">
          Your IP
        </p>
        <div className="mt-2 h-4 w-28 animate-pulse rounded-[2px] bg-(--surface)" />
        <div className="mt-1.5 h-3 w-36 animate-pulse rounded-[2px] bg-(--surface)" />
      </div>
    );
  }

  if (myIp.status === 'error') {
    return (
      <div className="border-t border-(--border) px-4 py-3 lg:px-5">
        <p className="text-[0.65rem] font-medium uppercase tracking-wider text-(--muted)">
          Your IP
        </p>
        <p className="mt-1 text-xs text-(--danger)">{myIp.message}</p>
        <button
          type="button"
          onClick={() => void myIp.refresh()}
          className="mt-2 text-xs font-medium text-(--accent) underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)"
        >
          Retry
        </button>
      </div>
    );
  }

  const { data } = myIp;
  const location = formatLocation(data);

  return (
    <div className="border-t border-(--border) px-4 py-3 lg:px-5">
      <p className="text-[0.65rem] font-medium uppercase tracking-wider text-(--muted)">Your IP</p>
      <p className="toolkit-ipchip mt-2 w-full max-w-full" translate="no" title={data.ip}>
        {data.ip}
      </p>
      {location && (
        <p className="mt-0.5 truncate text-xs text-(--muted)" title={location}>
          {location}
        </p>
      )}
      {data.org && (
        <p className="mt-0.5 truncate text-xs text-(--muted)" title={data.org}>
          {data.org}
        </p>
      )}
      <button
        type="button"
        onClick={() => onShowMap(data.ip)}
        className="mt-2 inline-flex items-center gap-1.5 rounded-[2px] text-xs font-medium text-(--accent) underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) active:scale-[0.98]"
      >
        <MapPin size={12} weight="bold" aria-hidden="true" />
        Show on map
      </button>
    </div>
  );
}
