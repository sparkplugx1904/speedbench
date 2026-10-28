import React from 'react';

/**
 * Key/value readout styled like a bench instrument readout: dashed rules,
 * mono uppercase labels, tabular values. `emphasize` marks the headline row.
 */
export function DataList({ rows }) {
  return (
    <dl className="toolkit-datalist">
      {rows.map((row) => {
        const valueClass = [row.mono ? 'is-mono' : '', row.emphasize ? 'is-hero' : '']
          .filter(Boolean)
          .join(' ');
        return (
          <div key={row.label} className="toolkit-row">
            <dt>{row.label}</dt>
            <dd className={valueClass || undefined} translate="no">
              {row.value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
