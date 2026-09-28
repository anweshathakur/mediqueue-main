import React from 'react';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#06080d] py-6 mt-auto text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Left Side Info */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <div className="w-5 h-5 rounded bg-slate-900 border border-slate-700 flex items-center justify-center p-0.5">
              <img src="/logo.png" alt="MediQueue" className="w-full h-full object-contain" />
            </div>
            <span>MediQueue</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            HIPAA Compliant
          </span>
          <span className="text-slate-500 text-[11px]">
            © 2026 MediQueue Clinical Systems Inc. Certified Health Informatics Infrastructure. All rights reserved.
          </span>
        </div>

        {/* Right Side Links */}
        <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium flex-wrap">
          <a href="#governance" className="hover:text-slate-200 transition-colors">Clinical Governance</a>
          <span>•</span>
          <a href="#hipaa" className="hover:text-slate-200 transition-colors">HIPAA Compliance</a>
          <span>•</span>
          <a href="#sla" className="hover:text-slate-200 transition-colors">System SLA Status</a>
          <span>•</span>
          <a href="#emergency" className="hover:text-slate-200 transition-colors">Emergency Protocols</a>
          <span>•</span>
          <a href="#api" className="hover:text-[#00e599] transition-colors">Provider API</a>
          <span>•</span>
          <a href="#support" className="hover:text-slate-200 transition-colors">Support Desk</a>
        </div>
      </div>
    </footer>
  );
};
