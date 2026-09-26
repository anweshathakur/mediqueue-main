import React from 'react';
import { motion } from 'framer-motion';
import { User, Stethoscope, Building2, Activity, ArrowRight, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

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
  return (
    <div className="bg-black min-h-screen text-white pb-32 overflow-hidden relative">
      {/* Checkered Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none z-0" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
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
            <h3 className="text-2xl font-extrabold text-white mb-2">Hospital Access Portals</h3>
            <p className="text-xs font-semibold text-slate-400">Choose your authorized console to proceed</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Patient Portal */}
            <motion.div
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              onClick={() => onNavigate("patient-login")}
              className="bg-[#0b0d12] border border-slate-800/80 rounded-3xl p-8 flex flex-col items-start cursor-pointer transition-all duration-300 hover:border-[#00e599]/40 hover:shadow-[0_0_30px_rgba(0,229,153,0.12)] group"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 group-hover:border-[#00e599]/50 transition-colors">
                <User className="w-7 h-7 text-[#00e599]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1.5">Patient Portal</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-6 font-medium">
                Book doctor appointments, view live queue progression, and track estimated consultation timing.
              </p>
              <span className="mt-auto text-xs font-bold text-[#00e599] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                Sign In / Register <ArrowRight className="w-4 h-4" />
              </span>
            </motion.div>

            {/* Receptionist Portal */}
            <motion.div
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              onClick={() => onNavigate("staff-login")}
              className="bg-[#0b0d12] border border-slate-800/80 rounded-3xl p-8 flex flex-col items-start cursor-pointer transition-all duration-300 hover:border-[#00e599]/40 hover:shadow-[0_0_30px_rgba(0,229,153,0.12)] group"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 group-hover:border-[#00e599]/50 transition-colors">
                <Building2 className="w-7 h-7 text-[#00e599]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1.5">Receptionist Desk</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-6 font-medium">
                Manage live walk-in registry, issue emergency tokens, update queue status, and orchestrate patient throughput.
              </p>
              <span className="mt-auto text-xs font-bold text-[#00e599] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                Open Command Desk <ArrowRight className="w-4 h-4" />
              </span>
            </motion.div>

            {/* Doctor Console */}
            <motion.div
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              onClick={() => onNavigate("doctor-login")}
              className="bg-[#0b0d12] border border-slate-800/80 rounded-3xl p-8 flex flex-col items-start cursor-pointer transition-all duration-300 hover:border-[#00e599]/40 hover:shadow-[0_0_30px_rgba(0,229,153,0.12)] group"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 group-hover:border-[#00e599]/50 transition-colors">
                <Stethoscope className="w-7 h-7 text-[#00e599]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1.5">Doctor Console</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-6 font-medium">
                Call patients to consultation room, monitor elapsed time, and dynamically manage clinical delay adjustments.
              </p>
              <span className="mt-auto text-xs font-bold text-[#00e599] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                Doctor Sign In <ArrowRight className="w-4 h-4" />
              </span>
            </motion.div>
          </div>
        </section>

        {/* Problem Statement Section */}
        <section id="problem" className="mb-36 relative z-10 border-t border-slate-800/80 pt-20">
          <div className="max-w-3xl mb-12">
            <span className="text-[#00e599] text-xs font-extrabold tracking-widest uppercase">The Clinical Challenge</span>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white mt-2">Traditional waiting rooms fail patients and physicians.</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#0b0d12] p-6 rounded-2xl border border-slate-800">
              <Clock className="w-6 h-6 text-red-400 mb-4" />
              <h4 className="text-base font-bold text-white mb-2">Uncertain Wait Times</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Patients sit in crowded lobbies without knowing when they will actually be called in.</p>
            </div>
            <div className="bg-[#0b0d12] p-6 rounded-2xl border border-slate-800">
              <Activity className="w-6 h-6 text-amber-400 mb-4" />
              <h4 className="text-base font-bold text-white mb-2">Delay Cascades</h4>
              <p className="text-xs text-slate-400 leading-relaxed">A single delayed consultation throws the entire day's schedule off without warning downstream patients.</p>
            </div>
            <div className="bg-[#0b0d12] p-6 rounded-2xl border border-slate-800">
              <ShieldCheck className="w-6 h-6 text-[#00e599] mb-4" />
              <h4 className="text-base font-bold text-white mb-2">Smart Auto-Balancing</h4>
              <p className="text-xs text-slate-400 leading-relaxed">MediQueue automatically updates countdowns, recalculates arrival ETAs, and routes emergencies seamlessly.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
