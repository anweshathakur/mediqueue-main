import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-900 bg-[#05070a] py-8 mt-auto relative z-20">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center text-xs">
        <div className="flex items-center gap-2 mb-3 md:mb-0">
          <img src="/logo.png" alt="MediQueue Logo" className="w-5 h-5 object-contain rounded bg-black" />
          <span className="font-bold text-slate-400">MediQueue Healthcare Engine</span>
        </div>
        <p className="text-slate-500">© 2026 MediQueue Inc. All rights reserved.</p>
      </div>
    </footer>
  );
};
