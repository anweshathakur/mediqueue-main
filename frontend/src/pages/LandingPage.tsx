import React from 'react';
import { motion } from 'framer-motion';
import { User, Stethoscope, Building2, Activity, ArrowRight, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
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
  hidden: { opacity: 0, y: 25, scale: 0.98 },
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
    <div className={`${isDark ? 'bg-[#07090e] text-white' : 'bg-[#f8fafc] text-slate-900'} min-h-screen pb-32 overflow-hidden relative transition-colors duration-200`}>
      {/* Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-40" 
        style={{
          backgroundImage: isDark
            ? `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`
            : `linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <main className="max-w-7xl mx-auto px-8 w-full pt-16 relative z-10">
        {/* Hero Section */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center max-w-5xl mx-auto mb-32 relative"
        >
          <motion.div variants={itemVariants} className="relative inline-flex flex-col items-center mb-8">
            <div className="relative inline-block">
              <h1 className="text-6xl md:text-[5.5rem] font-extrabold tracking-tight text-white mb-2 text-center leading-none">
                Predictive
              </h1>

              {/* Animated Underline Beam */}
              <div className="relative w-full h-[3px] overflow-hidden rounded-full flex items-center">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00e599]/30 to-transparent"></div>
                <motion.div
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-1/2 h-full bg-gradient-to-r from-transparent via-[#00e599] to-transparent shadow-[0_0_10px_#00e599]"
                />
              </div>
            </div>

            <h2 className="text-5xl md:text-[5rem] font-bold relative z-10 text-center leading-none mt-4 text-transparent bg-clip-text bg-gradient-to-r from-[#00e599] via-[#a3f0d2] to-[#ffffff]" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', paddingBottom: '10px' }}>
              Queue Management
            </h2>
          </motion.div>

          <motion.p variants={itemVariants} className="text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed relative z-10 mb-8 font-medium">
            Eliminate waiting room chaos. Our predictive routing engine synchronizes appointments, walk-in tokens, and clinical delays into a unified live healthcare flow.
          </motion.p>
        </motion.section>

        {/* Portals Section */}
        <section id="portals" className="mb-36 relative z-10">
          <div className="text-center mb-12">
            <h3 className={`text-2xl font-extrabold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Hospital Access Portals</h3>
            <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Choose your authorized console to proceed</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Patient Portal */}
            <motion.div
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              onClick={() => onNavigate("patient-login")}
              className={`border rounded-xl p-8 flex flex-col items-start cursor-pointer transition-all duration-300 ${
                isDark 
                  ? 'bg-[#0c1017] border-slate-800/90 hover:border-[#00e599]/40 hover:shadow-[0_0_30px_rgba(0,229,153,0.12)]' 
                  : 'bg-white border-slate-200 hover:border-emerald-400 shadow-sm hover:shadow-md'
              } group`}
            >
              <div className={`w-14 h-14 rounded-lg border flex items-center justify-center mb-6 transition-colors ${
                isDark ? 'bg-slate-900 border-slate-800 group-hover:border-[#00e599]/50' : 'bg-emerald-50 border-emerald-200 group-hover:border-emerald-400'
              }`}>
                <User className="w-7 h-7 text-[#00c985]" />
              </div>
              <h3 className={`text-xl font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Patient Portal</h3>
              <p className={`text-xs leading-relaxed mb-6 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Book doctor appointments, view live queue progression, and track estimated consultation timing.
              </p>
              <span className="mt-auto text-xs font-bold text-[#00c985] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                Sign In / Register <ArrowRight className="w-4 h-4" />
              </span>
            </motion.div>

            {/* Receptionist Portal */}
            <motion.div
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              onClick={() => onNavigate("staff-login")}
              className={`border rounded-xl p-8 flex flex-col items-start cursor-pointer transition-all duration-300 ${
                isDark 
                  ? 'bg-[#0c1017] border-slate-800/90 hover:border-[#00e599]/40 hover:shadow-[0_0_30px_rgba(0,229,153,0.12)]' 
                  : 'bg-white border-slate-200 hover:border-emerald-400 shadow-sm hover:shadow-md'
              } group`}
            >
              <div className={`w-14 h-14 rounded-lg border flex items-center justify-center mb-6 transition-colors ${
                isDark ? 'bg-slate-900 border-slate-800 group-hover:border-[#00e599]/50' : 'bg-emerald-50 border-emerald-200 group-hover:border-emerald-400'
              }`}>
                <Building2 className="w-7 h-7 text-[#00c985]" />
              </div>
              <h3 className={`text-xl font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Receptionist Desk</h3>
              <p className={`text-xs leading-relaxed mb-6 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Manage live walk-in registry, issue emergency tokens, update queue status, and orchestrate patient throughput.
              </p>
              <span className="mt-auto text-xs font-bold text-[#00c985] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                Open Command Desk <ArrowRight className="w-4 h-4" />
              </span>
            </motion.div>

            {/* Doctor Console */}
            <motion.div
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              onClick={() => onNavigate("doctor-login")}
              className={`border rounded-xl p-8 flex flex-col items-start cursor-pointer transition-all duration-300 ${
                isDark 
                  ? 'bg-[#0c1017] border-slate-800/90 hover:border-[#00e599]/40 hover:shadow-[0_0_30px_rgba(0,229,153,0.12)]' 
                  : 'bg-white border-slate-200 hover:border-emerald-400 shadow-sm hover:shadow-md'
              } group`}
            >
              <div className={`w-14 h-14 rounded-lg border flex items-center justify-center mb-6 transition-colors ${
                isDark ? 'bg-slate-900 border-slate-800 group-hover:border-[#00e599]/50' : 'bg-emerald-50 border-emerald-200 group-hover:border-emerald-400'
              }`}>
                <Stethoscope className="w-7 h-7 text-[#00c985]" />
              </div>
              <h3 className={`text-xl font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Doctor Console</h3>
              <p className={`text-xs leading-relaxed mb-6 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Call patients to consultation room, monitor elapsed time, and dynamically manage clinical delay adjustments.
              </p>
              <span className="mt-auto text-xs font-bold text-[#00c985] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                Doctor Sign In <ArrowRight className="w-4 h-4" />
              </span>
            </motion.div>
          </div>
        </section>

        {/* Problem Statement Section */}
        <section id="problem" className={`mb-36 relative z-10 border-t pt-20 ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <div className="max-w-3xl mb-12">
            <span className="text-[#00c985] text-xs font-extrabold tracking-widest uppercase">The Clinical Challenge</span>
            <h3 className={`text-3xl md:text-4xl font-extrabold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Traditional waiting rooms fail patients and physicians.</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-xl border ${isDark ? 'bg-[#0c1017] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
              <Clock className="w-6 h-6 text-red-400 mb-4" />
              <h4 className={`text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Uncertain Wait Times</h4>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Patients sit in crowded lobbies without knowing when they will actually be called in.</p>
            </div>
            <div className={`p-6 rounded-xl border ${isDark ? 'bg-[#0c1017] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
              <Activity className="w-6 h-6 text-amber-400 mb-4" />
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
