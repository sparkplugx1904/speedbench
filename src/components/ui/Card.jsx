import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-[2px] border border-(--border) bg-(--surface-raised) p-4 sm:p-5 ${className}`}>
      {children}
    </div>
  );
}
