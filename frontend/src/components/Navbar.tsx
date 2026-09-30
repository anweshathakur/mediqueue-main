import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell';

interface NavbarProps {
  onLogoClick: () => void;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLogoClick, currentPage = 'landing', onNavigate }) => {
  const { isDark } = useTheme();

  return (
    <header
      className={`border-b sticky top-0 z-50 transition-colors ${
        isDark ? 'border-slate-800/80 bg-[#080b11]' : 'border-slate-200 bg-white shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <button onClick={onLogoClick} className="flex items-center gap-2.5 cursor-pointer group">
            <div
              className={`w-8 h-8 rounded-md border flex items-center justify-center p-1 transition-colors ${
                isDark
                  ? 'bg-[#0c1017] border-slate-700 group-hover:border-[#00e599]'
                  : 'bg-slate-50 border-slate-200 group-hover:border-[#00c985]'
              }`}
            >
              <img src="/logo.png" alt="MediQueue" className="w-full h-full object-contain" />
            </div>
            <span
              className={`text-base font-bold tracking-tight transition-colors ${
                isDark
                  ? 'text-white group-hover:text-[#00e599]'
                  : 'text-slate-900 group-hover:text-[#00c985]'
              }`}
            >
              MediQueue
            </span>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => onNavigate && onNavigate('landing')}
              className={`px-3.5 py-2 rounded-md transition-colors cursor-pointer ${
                currentPage === 'landing'
                  ? isDark
                    ? 'text-white bg-slate-800/60'
                    : 'text-slate-900 bg-slate-100'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Platform
            </button>
            <button
              onClick={() => onNavigate && onNavigate('doctor-login')}
              className={`px-3.5 py-2 rounded-md transition-colors cursor-pointer ${
                currentPage === 'doctor-dashboard' || currentPage === 'doctor-login'
                  ? isDark
                    ? 'text-[#00e599] bg-[#00e599]/10 border border-[#00e599]/30'
                    : 'text-[#00a86b] bg-emerald-50 border border-emerald-200'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Clinical Console
            </button>
            <button
              onClick={() => onNavigate && onNavigate('patient-login')}
              className={`px-3.5 py-2 rounded-md transition-colors cursor-pointer ${
                currentPage === 'patient-dashboard' ||
                currentPage === 'patient-login' ||
                currentPage === 'patient-tracker' ||
                currentPage === 'patient-flow'
                  ? isDark
                    ? 'text-[#00e599] bg-[#00e599]/10 border border-[#00e599]/30'
                    : 'text-[#00a86b] bg-emerald-50 border border-emerald-200'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Patient Portal
            </button>
            <button
              onClick={() => onNavigate && onNavigate('staff-login')}
              className={`px-3.5 py-2 rounded-md transition-colors cursor-pointer ${
                currentPage === 'management-dashboard' || currentPage === 'staff-login'
                  ? isDark
                    ? 'text-[#00e599] bg-[#00e599]/10 border border-[#00e599]/30'
                    : 'text-[#00a86b] bg-emerald-50 border border-emerald-200'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Reception Desk
            </button>
          </nav>
        </div>

        {/* Action Controls + Theme Toggle */}
        <div className="flex items-center gap-2.5">
          <NotificationBell />
          <ThemeToggle />

          <button
            onClick={() => onNavigate && onNavigate('staff-login')}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border font-semibold text-xs transition-colors cursor-pointer ${
              isDark
                ? 'border-slate-800 bg-[#0f141f] text-slate-300 hover:border-slate-700 hover:text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            Emergency Sign-In
          </button>
          <button
            onClick={() => onNavigate && onNavigate('patient-login')}
            className="px-4 py-2 rounded-md bg-[#00e599] hover:bg-[#00c985] text-black font-bold text-xs transition-colors cursor-pointer shadow-sm"
          >
            Access Portal
          </button>
        </div>
      </div>
    </header>
  );
};
