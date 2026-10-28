import React from 'react';

/**
 * Benchmark-specific button. It deliberately does not depend on the compiled
 * utility stylesheet so the instrument UI stays self-contained.
 */
export function BenchButton({
  variant = 'secondary',
  className = '',
  type = 'button',
  children,
  ...props
}) {
  return (
    <button type={type} className={`bench-btn bench-btn--${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}
