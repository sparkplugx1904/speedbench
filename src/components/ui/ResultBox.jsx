import React from 'react';

/**
 * Shared result panel for the toolkit pages: square surface, mono header,
 * accent icon and an optional mono badge showing the headline value.
 */
export function ResultBox({ icon, title = 'Result', badge, badgeTone, note, children }) {
  return (
    <section className="toolkit-result">
      <header className="toolkit-result-head">
        <span className="toolkit-result-icon" aria-hidden="true">
          {icon}
        </span>
        <span className="toolkit-result-title">{title}</span>
        {badge && (
          <span
            className={badgeTone ? `toolkit-badge toolkit-badge--${badgeTone}` : 'toolkit-badge'}
            translate="no"
          >
            {badge}
          </span>
        )}
      </header>
      {note && <p className="toolkit-result-note">{note}</p>}
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
