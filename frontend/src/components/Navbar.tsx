import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onLogoClick: () => void;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLogoClick, currentPage = 'landing', onNavigate }) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#080b11] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <button onClick={onLogoClick} className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-8 h-8 rounded-md bg-[#0c1017] border border-slate-700 flex items-center justify-center p-1 group-hover:border-[#00e599] transition-colors">
              <img src="/logo.png" alt="MediQueue" className="w-full h-full object-contain" />
            </div>
            <span className="text-base font-bold tracking-tight text-white group-hover:text-[#00e599] transition-colors">
              MediQueue
            </span>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => onNavigate && onNavigate('landing')}
              className={`px-3.5 py-2 rounded-md transition-colors cursor-pointer ${
                currentPage === 'landing' ? 'text-white bg-slate-800/60' : 'text-slate-400 hover:text-white'
              }`}
            >
              Platform
            </button>
            <button
              onClick={() => onNavigate && onNavigate('doctor-login')}
              className={`px-3.5 py-2 rounded-md transition-colors cursor-pointer ${
                currentPage === 'doctor-dashboard' || currentPage === 'doctor-login'
                  ? 'text-[#00e599] bg-[#00e599]/10 border border-[#00e599]/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Clinical Console
            </button>
            <button
              onClick={() => onNavigate && onNavigate('patient-login')}
              className={`px-3.5 py-2 rounded-md transition-colors cursor-pointer ${
                currentPage === 'patient-dashboard' || currentPage === 'patient-login' || currentPage === 'patient-tracker' || currentPage === 'patient-flow'
                  ? 'text-[#00e599] bg-[#00e599]/10 border border-[#00e599]/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Patient Portal
            </button>
            <button
              onClick={() => onNavigate && onNavigate('staff-login')}
              className={`px-3.5 py-2 rounded-md transition-colors cursor-pointer ${
                currentPage === 'management-dashboard' || currentPage === 'staff-login'
                  ? 'text-[#00e599] bg-[#00e599]/10 border border-[#00e599]/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Reception Desk
            </button>
          </nav>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate && onNavigate('staff-login')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-slate-800 bg-[#0f141f] text-slate-300 font-semibold text-xs hover:border-slate-700 hover:text-white transition-colors cursor-pointer"
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
