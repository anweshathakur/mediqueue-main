import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const Footer: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <footer
      className={`border-t py-6 mt-auto text-xs transition-colors ${
        isDark
          ? 'border-slate-800/80 bg-[#06080d] text-slate-400'
          : 'border-slate-200 bg-white text-slate-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Left Side Info */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
            <div
              className={`w-5 h-5 rounded border flex items-center justify-center p-0.5 ${
                isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <img src="/logo.png" alt="MediQueue" className="w-full h-full object-contain" />
            </div>
            <span className={isDark ? 'text-white' : 'text-slate-900'}>MediQueue</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-400'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            HIPAA Compliant
          </span>
          <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            © 2026 MediQueue Clinical Systems Inc. Certified Health Informatics Infrastructure. All rights reserved.
          </span>
        </div>

        {/* Right Side Links */}
        <div
          className={`flex items-center gap-4 text-[11px] font-medium flex-wrap ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          <a href="#governance" className={isDark ? 'hover:text-slate-200' : 'hover:text-slate-900'}>
            Clinical Governance
          </a>
          <span>•</span>
          <a href="#hipaa" className={isDark ? 'hover:text-slate-200' : 'hover:text-slate-900'}>
            HIPAA Compliance
          </a>
          <span>•</span>
          <a href="#sla" className={isDark ? 'hover:text-slate-200' : 'hover:text-slate-900'}>
            System SLA Status
          </a>
          <span>•</span>
          <a href="#emergency" className={isDark ? 'hover:text-slate-200' : 'hover:text-slate-900'}>
            Emergency Protocols
          </a>
          <span>•</span>
          <a href="#api" className="text-[#00a86b] dark:text-[#00e599] hover:underline">
            Provider API
          </a>
          <span>•</span>
          <a href="#support" className={isDark ? 'hover:text-slate-200' : 'hover:text-slate-900'}>
            Support Desk
          </a>
        </div>
      </div>
    </footer>
  );
};
