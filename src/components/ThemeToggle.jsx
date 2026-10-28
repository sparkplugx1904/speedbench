import React from 'react';
import { Sun, MoonStars } from '@phosphor-icons/react';
import { useTheme } from './ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="inline-flex size-9 items-center justify-center rounded-[2px] border border-(--border) bg-(--surface-raised) text-(--ink) transition-[background-color,transform] duration-150 hover:bg-(--hover) active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)"
    >
      {theme === 'dark' ? (
        <Sun size={18} weight="bold" aria-hidden="true" />
      ) : (
        <MoonStars size={18} weight="bold" aria-hidden="true" />
      )}
    </button>
  );
}
