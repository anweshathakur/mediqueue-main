import React from 'react';

interface NavbarProps {
  onLogoClick: () => void;
  isDark?: boolean;
  onNavigate?: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLogoClick, onNavigate }) => {
  return (
    <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto w-full relative z-50">
      <button onClick={onLogoClick} className="flex items-center gap-2.5 cursor-pointer group">
        <div className="w-9 h-9 rounded-lg bg-black border border-slate-800 flex items-center justify-center p-1 group-hover:border-[#00e599]/40 transition-colors">
          <img src="/logo.png" alt="MediQueue Logo" className="w-full h-full object-contain" />
        </div>
        <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-[#00e599] transition-colors">MediQueue</span>
      </button>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
        <a 
          href="#problem" 
          onClick={(e) => { e.preventDefault(); document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' }); }}
          className="hover:text-[#00e599] transition-colors cursor-pointer"
        >
          Problem
        </a>
        <a 
          href="#pipeline" 
          onClick={(e) => { e.preventDefault(); document.getElementById('pipeline')?.scrollIntoView({ behavior: 'smooth' }); }}
          className="hover:text-[#00e599] transition-colors cursor-pointer"
        >
          Pipeline
        </a>
        <a 
          href="#portals" 
          onClick={(e) => { e.preventDefault(); document.getElementById('portals')?.scrollIntoView({ behavior: 'smooth' }); }}
          className="hover:text-[#00e599] transition-colors cursor-pointer"
        >
          Portals
        </a>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => onNavigate && onNavigate("patient-login")} 
          className="bg-[#00e599] hover:bg-[#00c985] text-black font-extrabold text-sm px-6 py-2.5 rounded-full transition-all shadow-[0_0_20px_rgba(0,229,153,0.25)] hover:shadow-[0_0_30px_rgba(0,229,153,0.4)] hover:-translate-y-0.5 cursor-pointer"
        >
          Get Started
        </button>
      </div>
    </nav>
  );
};
