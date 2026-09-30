import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-semibold transition-all cursor-pointer ${
        isDark
          ? 'bg-[#0f141f] border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
          : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-sm'
      } ${className}`}
    >
      {isDark ? (
        <>
          <Sun className="w-3.5 h-3.5 text-slate-200" />
          <span className="hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden sm:inline">Dark</span>
        </>
      )}
    </button>
  );
};
