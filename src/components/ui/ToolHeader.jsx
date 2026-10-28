import React from 'react';

/**
 * Shared page header for every tool: identity icon chip, mono eyebrow,
 * title, short description and optional context chips.
 */
export function ToolHeader({ icon, eyebrow, title, description, chips = [] }) {
  return (
    <div className="toolkit-head">
      <span className="toolkit-head-icon" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="toolkit-eyebrow">{eyebrow}</p>
        <h2 className="text-balance text-2xl font-semibold tracking-[-0.02em] text-(--ink)">
          {title}
        </h2>
        <p className="mt-1 max-w-[50ch] text-sm leading-relaxed text-(--muted)">{description}</p>
        {chips.length > 0 && (
          <p className="toolkit-chips mt-2.5">
            {chips.map((chip) => (
              <span key={chip}>{chip}</span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}
