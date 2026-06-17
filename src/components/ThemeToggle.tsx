'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full bg-voxreal-200 dark:bg-voxreal-800 transition-colors duration-300 flex items-center px-1 focus:outline-none focus:ring-2 focus:ring-voxreal-400 focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-surface-dark"
      aria-label={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
    >
      <span
        className={`w-5 h-5 rounded-full bg-voxreal-600 dark:bg-voxreal-300 shadow-md transform transition-transform duration-300 flex items-center justify-center text-[10px] ${
          theme === 'dark' ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
