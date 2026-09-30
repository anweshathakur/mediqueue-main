import React from 'react';
import { motion } from 'framer-motion';
import { User, Stethoscope, Building2, Activity, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 20 } 
  },
};

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { isDark } = useTheme();

  return (
    <div className={`${isDark ? 'bg-[#07090e] text-white' : 'bg-[#f8fafc] text-slate-900'} min-h-screen pb-32 overflow-hidden relative transition-colors duration-200 font-sans`}>
      {/* Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-40" 
        style={{
          backgroundImage: isDark
            ? `linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)`
            : `linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <main className="max-w-7xl mx-auto px-6 md:px-8 w-full pt-16 relative z-10">
        {/* Hero Section */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center max-w-4xl mx-auto mb-28 relative"
        >
          {/* Top Pill Accent */}
          <motion.div variants={itemVariants} className="inline-flex items-center px-3 py-1 rounded-full border mb-8 transition-colors cursor-default shadow-xs" style={{
            borderColor: isDark ? 'rgba(51, 65, 85, 0.8)' : 'rgba(226, 232, 240, 1)',
            backgroundColor: isDark ? '#0c1017' : '#ffffff'
          }}>
            <span className="w-2 h-2 rounded-full bg-[#00c985] mr-2"></span>
            <span className={`text-[11px] font-semibold tracking-wide ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Live Clinical Intelligence
            </span>
          </motion.div>

          <motion.div variants={itemVariants} className="relative inline-flex flex-col items-center mb-6">
            <h1 className={`text-6xl md:text-[5.5rem] font-extrabold tracking-tight mb-2 text-center leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Predictive
            </h1>

            <h2 
              className={`text-5xl md:text-[5.2rem] font-bold relative z-10 text-center leading-none mt-2 text-transparent bg-clip-text ${
                isDark 
                  ? 'bg-gradient-to-r from-[#00e599] via-[#a3f0d2] to-[#ffffff]' 
                  : 'bg-gradient-to-r from-[#00b074] via-[#00c985] to-[#4ade80]'
              }`} 
              style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', paddingBottom: '12px' }}
            >
              Queue Management
            </h2>
          </motion.div>

          <motion.p variants={itemVariants} className={`text-base md:text-lg max-w-2xl leading-relaxed relative z-10 mb-10 font-normal ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Eliminate waiting room chaos. Our predictive routing engine synchronizes appointments, walk-in tokens, and clinical delays into a unified live healthcare flow.
          </motion.p>

          {/* Hero CTA Buttons matching user reference */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-3.5 relative z-10">
            <button
              onClick={() => {
                const el = document.getElementById('portals');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else onNavigate('patient-login');
              }}
              className="px-6 py-2.5 rounded-lg bg-[#009b62] hover:bg-[#008754] text-white font-semibold text-sm transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-98"
            >
              Get Started
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('problem');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-6 py-2.5 rounded-lg border font-semibold text-sm transition-all cursor-pointer shadow-xs active:scale-98 ${
                isDark
                  ? 'bg-[#0c1017] border-slate-700 text-slate-200 hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
              }`}
            >
              Clinical Architecture
            </button>
          </motion.div>
        </motion.section>

        {/* Portals Section */}
        <section id="portals" className="mb-32 relative z-10">
          <div className="text-center mb-12">
            <h3 className={`text-2xl font-extrabold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Hospital Access Portals</h3>
            <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Choose your authorized console to proceed</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Patient Portal */}
            <motion.div
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              onClick={() => onNavigate("patient-login")}
              className={`border rounded-xl p-8 flex flex-col items-start cursor-pointer transition-all duration-300 ${
                isDark 
                  ? 'bg-[#0c1017] border-slate-800 hover:border-[#00e599]/40 hover:shadow-[0_0_30px_rgba(0,229,153,0.1)]' 
                  : 'bg-white border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-md'
              } group`}
            >
              <div className={`w-12 h-12 rounded-lg border flex items-center justify-center mb-6 transition-colors ${
                isDark ? 'bg-slate-900 border-slate-800 group-hover:border-[#00e599]/50' : 'bg-emerald-50 border-emerald-200 group-hover:border-emerald-300'
              }`}>
                <User className="w-6 h-6 text-[#00c985]" />
              </div>
              <h3 className={`text-lg font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Patient Portal</h3>
              <p className={`text-xs leading-relaxed mb-6 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Book doctor appointments, view live queue progression, and track estimated consultation timing.
              </p>
              <span className="mt-auto text-xs font-bold text-[#00c985] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                Sign In / Register <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </motion.div>

            {/* Receptionist Portal */}
            <motion.div
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              onClick={() => onNavigate("staff-login")}
              className={`border rounded-xl p-8 flex flex-col items-start cursor-pointer transition-all duration-300 ${
                isDark 
                  ? 'bg-[#0c1017] border-slate-800 hover:border-[#00e599]/40 hover:shadow-[0_0_30px_rgba(0,229,153,0.1)]' 
                  : 'bg-white border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-md'
              } group`}
            >
              <div className={`w-12 h-12 rounded-lg border flex items-center justify-center mb-6 transition-colors ${
                isDark ? 'bg-slate-900 border-slate-800 group-hover:border-[#00e599]/50' : 'bg-emerald-50 border-emerald-200 group-hover:border-emerald-300'
              }`}>
                <Building2 className="w-6 h-6 text-[#00c985]" />
              </div>
              <h3 className={`text-lg font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Receptionist Desk</h3>
              <p className={`text-xs leading-relaxed mb-6 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Manage live walk-in registry, issue emergency tokens, update queue status, and orchestrate patient throughput.
              </p>
              <span className="mt-auto text-xs font-bold text-[#00c985] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                Open Command Desk <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </motion.div>

            {/* Doctor Console */}
            <motion.div
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              onClick={() => onNavigate("doctor-login")}
              className={`border rounded-xl p-8 flex flex-col items-start cursor-pointer transition-all duration-300 ${
                isDark 
                  ? 'bg-[#0c1017] border-slate-800 hover:border-[#00e599]/40 hover:shadow-[0_0_30px_rgba(0,229,153,0.1)]' 
                  : 'bg-white border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-md'
              } group`}
            >
              <div className={`w-12 h-12 rounded-lg border flex items-center justify-center mb-6 transition-colors ${
                isDark ? 'bg-slate-900 border-slate-800 group-hover:border-[#00e599]/50' : 'bg-emerald-50 border-emerald-200 group-hover:border-emerald-300'
              }`}>
                <Stethoscope className="w-6 h-6 text-[#00c985]" />
              </div>
              <h3 className={`text-lg font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Doctor Console</h3>
              <p className={`text-xs leading-relaxed mb-6 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Call patients to consultation room, monitor elapsed time, and dynamically manage clinical delay adjustments.
              </p>
              <span className="mt-auto text-xs font-bold text-[#00c985] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                Doctor Sign In <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </motion.div>
          </div>
        </section>

        {/* Problem Statement Section */}
        <section id="problem" className={`mb-28 relative z-10 border-t pt-20 ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <div className="max-w-3xl mb-12">
            <span className="text-[#00c985] text-xs font-extrabold tracking-widest uppercase">The Clinical Challenge</span>
            <h3 className={`text-3xl md:text-4xl font-extrabold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Traditional waiting rooms fail patients and physicians.</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-xl border ${isDark ? 'bg-[#0c1017] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
              <Clock className="w-6 h-6 text-red-500 mb-4" />
              <h4 className={`text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Uncertain Wait Times</h4>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Patients sit in crowded lobbies without knowing when they will actually be called in.</p>
            </div>
            <div className={`p-6 rounded-xl border ${isDark ? 'bg-[#0c1017] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
              <Activity className={`w-6 h-6 mb-4 ${isDark ? 'text-slate-400' : 'text-slate-700'}`} />
              <h4 className={`text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Delay Cascades</h4>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>A single delayed consultation throws the entire day's schedule off without warning downstream patients.</p>
            </div>
            <div className={`p-6 rounded-xl border ${isDark ? 'bg-[#0c1017] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
              <ShieldCheck className="w-6 h-6 text-[#00c985] mb-4" />
              <h4 className={`text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Smart Auto-Balancing</h4>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>MediQueue automatically updates countdowns, recalculates arrival ETAs, and routes emergencies seamlessly.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
