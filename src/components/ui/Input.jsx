import React from 'react';

export function Input({ id, label, hint, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-(--ink)">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className={[
          'w-full rounded-[2px] border bg-(--bg) px-3 py-2 font-mono text-sm text-(--ink)',
          'placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-(--muted)',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)',
          error ? 'border-(--danger)' : 'border-(--border)',
          className,
        ].join(' ')}
        autoComplete="off"
        spellCheck={false}
      />
      {hint && !error && <p className="text-xs text-(--muted)">{hint}</p>}
      {error && <p className="text-xs text-(--danger)">{error}</p>}
    </div>
  );
}
