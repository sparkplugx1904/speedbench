import React from 'react';

const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-[2px] font-medium transition-[background-color,color,opacity,transform] duration-150 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg) active:scale-[0.98]';

const variants = {
  primary: 'bg-(--btn-primary-bg) text-(--btn-primary-text) hover:bg-(--btn-primary-hover)',
  secondary: 'bg-(--surface-raised) text-(--ink) hover:bg-(--hover) border border-(--border)',
  ghost: 'bg-transparent text-(--muted) hover:bg-(--hover) hover:text-(--ink)',
};

export function Button({ variant = 'secondary', className = '', children, ...props }) {
  return (
    <button
      {...props}
      className={`${baseStyles} px-3.5 py-2 text-sm ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
