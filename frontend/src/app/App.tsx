import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity, ArrowRight, ArrowLeft, User, ClipboardList, Stethoscope, Clock, ShieldCheck, Clipboard, Phone, Building2, Check, CheckCircle2, Users, AlertTriangle, Lock, Mail, Play, StopCircle, SkipForward, AlertCircle, Timer, BarChart2, CalendarDays, Trash2, X, Bell, UserMinus, RefreshCw, Search, Sparkles, PlusCircle, CheckCircle, Flame
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
/* ═══════════════════════════════════════════════════════════
   MOCK DATA & LOCAL STORAGE
   ═══════════════════════════════════════════════════════════ */
const DEPARTMENTS = ["General Medicine", "Cardiology", "Orthopedics", "Dermatology", "Pediatrics", "ENT"];

const DOCTORS = [
  { id: 1, name: "Dr. Arjun Mehta", specialty: "General Medicine", status: "on-time", delay: "", patientsAhead: 2 },
  { id: 2, name: "Dr. Priya Sharma", specialty: "Cardiology", status: "delayed", delay: "30m", patientsAhead: 5 },
  { id: 3, name: "Dr. Rohan Kapoor", specialty: "Orthopedics", status: "on-time", delay: "", patientsAhead: 1 },
  { id: 4, name: "Dr. Sneha Iyer", specialty: "Dermatology", status: "on-time", delay: "", patientsAhead: 3 },
  { id: 5, name: "Dr. Vikram Rao", specialty: "Pediatrics", status: "delayed", delay: "15m", patientsAhead: 4 },
  { id: 6, name: "Dr. Ananya Das", specialty: "ENT", status: "on-time", delay: "", patientsAhead: 0 },
];

const INIT_QUEUE = [
  { id: '101', name: 'Ravi Kumar', type: 'Online', scheduled: '2:00 PM', status: 'Waiting' },
  { id: '102', name: 'Sita Dev', type: 'Walk-in', scheduled: '2:15 PM', status: 'Waiting' },
  { id: '103', name: 'Ananya S.', type: 'Online', scheduled: '2:30 PM', status: 'Waiting' },
  { id: '104', name: 'Rahul M.', type: 'Online', scheduled: '2:45 PM', status: 'Waiting' },
  { id: '105', name: 'Vikram Singh', type: 'Walk-in', scheduled: '3:00 PM', status: 'Waiting' },
];


const INIT_HISTORY = [
  { id: 1, patient_name: 'Aarav Patel', patient_type: 'Online', doctor_name: 'Dr. Arjun Mehta', completed_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 2, patient_name: 'Neha Gupta', patient_type: 'Walk-in', doctor_name: 'Dr. Priya Sharma', completed_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 3, patient_name: 'Rajesh Khanna', patient_type: 'Online', doctor_name: 'Dr. Rohan Kapoor', completed_at: new Date().toISOString() },
];

function initializeData() {
  if (!localStorage.getItem('hospital_queue')) {
    localStorage.setItem('hospital_queue', JSON.stringify(INIT_QUEUE));
  }
  if (!localStorage.getItem('patient_history')) {
    localStorage.setItem('patient_history', JSON.stringify(INIT_HISTORY));
  }
  if (!localStorage.getItem('current_avg_consultation')) {
    localStorage.setItem('current_avg_consultation', '15');
  }
  if (!localStorage.getItem('global_doctor_delay')) {
    localStorage.setItem('global_doctor_delay', '0');
  }
}

async function setLocalData(key: string, value: string) {
  localStorage.setItem(key, value);
  window.dispatchEvent(new Event('storage'));
}

/* ═══════════════════════════════════════════════════════════
   NAVBAR (shared across all pages)
   ═══════════════════════════════════════════════════════════ */
function Navbar({ onLogoClick, isDark, onNavigate }: { onLogoClick: () => void, isDark?: boolean, onNavigate?: (p: string) => void }) {
  return (
    <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto w-full relative z-50">
      <button onClick={onLogoClick} className="flex items-center gap-2.5 cursor-pointer">
        <img src="/logo.png" alt="MediQueue Logo" className="w-9 h-9 object-contain rounded-lg bg-black" />
        <span className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#004b87]'}`}>MediQueue</span>
      </button>

      {isDark && (
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
            href="#pipeline" 
            onClick={(e) => { e.preventDefault(); document.getElementById('pipeline')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="hover:text-[#00e599] transition-colors cursor-pointer"
          >
            About Us
          </a>
        </div>
      )}

      {isDark ? (
        <button onClick={() => onNavigate && onNavigate("patient-login")} className="bg-[#00e599] hover:bg-[#00c985] text-black font-semibold text-sm px-6 py-2.5 rounded-full transition-all cursor-pointer">
          Get Started
        </button>
      ) : (
        <div />
      )}
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE 1: LANDING PAGE
   ═══════════════════════════════════════════════════════════ */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 20, mass: 1 } 
  },
};

function LandingPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="bg-black min-h-screen text-white pb-32 overflow-hidden relative">
      {/* Background Light Grey Checkered Grid */}
      <div 
        className="absolute inset-0 pointer-events-none z-0" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      <main className="max-w-7xl mx-auto px-8 w-full pt-20 relative z-10">
        
        {/* Hero */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center max-w-5xl mx-auto mb-40 relative mt-16"
        >
          <motion.div variants={itemVariants} className="relative inline-flex flex-col items-center mb-10">
            {/* Predictive with Animated Underline */}
            <div className="relative inline-block">
              <h1 className="text-6xl md:text-[6rem] font-extrabold tracking-tight text-white mb-3 text-center leading-none">
                Predictive
              </h1>

              {/* Animated Underline for Predictive */}
              <div className="relative w-full h-[3px] overflow-hidden rounded-full flex items-center">
                {/* Subtle base track */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00e599]/30 to-transparent"></div>

                {/* Animated moving beam across the underline */}
                <motion.div
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute w-1/2 h-full bg-gradient-to-r from-transparent via-[#00e599] to-transparent shadow-[0_0_8px_#00e599]"
                />
              </div>
            </div>

            {/* Queue Management */}
            <h2 className="text-5xl md:text-[5.5rem] font-bold relative z-10 text-center leading-none mt-4 text-transparent bg-clip-text bg-gradient-to-r from-[#00e599] via-[#a3f0d2] to-[#ffffff]" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', paddingBottom: '10px' }}>
              Queue Management
            </h2>
          </motion.div>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed relative z-10">
            Eliminate waiting room chaos. Our predictive routing engine delivers seamless, enterprise-grade patient flow to modern healthcare facilities.
          </motion.p>
        </motion.section>

        {/* Login Panels */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-3 gap-6 mb-40 relative z-10"
        >
          {/* Patient Login */}
          <motion.div
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            onClick={() => onNavigate("patient-login")}
            className="bg-[#0b0d12] border border-slate-800/80 rounded-2xl p-8 flex flex-col items-start cursor-pointer transition-all duration-300 hover:border-[#00e599]/40 hover:shadow-[0_0_25px_rgba(0,229,153,0.12)] group"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 group-hover:border-[#00e599]/50 transition-colors">
              <User className="w-5 h-5 text-slate-400 group-hover:text-[#00e599] transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1.5">Patient Login</h3>
            <p className="text-xs font-bold text-[#00e599] tracking-wider uppercase mb-5">BOOK & TRACK</p>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">
              Empower patients with live queue updates, estimated wait times, and easy mobile check-ins.
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 group-hover:text-[#00e599] transition-colors">
              <span>Enter Portal</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.div>

          {/* Receptionist Login */}
          <motion.div
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            onClick={() => onNavigate("staff-login")}
            className="bg-[#0b0d12] border border-slate-800/80 rounded-2xl p-8 flex flex-col items-start cursor-pointer transition-all duration-300 hover:border-[#00e599]/40 hover:shadow-[0_0_25px_rgba(0,229,153,0.12)] group"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 group-hover:border-[#00e599]/50 transition-colors">
              <ClipboardList className="w-5 h-5 text-slate-400 group-hover:text-[#00e599] transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1.5">Receptionist Login</h3>
            <p className="text-xs font-bold text-[#00e599] tracking-wider uppercase mb-5">REGISTER WALK-INS</p>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">
              Rapid intake workflows for frontline staff to seamlessly add walk-in patients into the prediction algorithm.
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 group-hover:text-[#00e599] transition-colors">
              <span>View Tools</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.div>

          {/* Doctor Dashboard */}
          <motion.div
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            onClick={() => onNavigate("doctor-login")}
            className="bg-[#0b0d12] border border-slate-800/80 rounded-2xl p-8 flex flex-col items-start cursor-pointer transition-all duration-300 hover:border-[#00e599]/40 hover:shadow-[0_0_25px_rgba(0,229,153,0.12)] group"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 group-hover:border-[#00e599]/50 transition-colors">
              <Stethoscope className="w-5 h-5 text-slate-400 group-hover:text-[#00e599] transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1.5">Doctor Dashboard</h3>
            <p className="text-xs font-bold text-[#00e599] tracking-wider uppercase mb-5">MANAGE QUEUE</p>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">
              A bird's-eye view of your waiting room, enabling clinicians to prioritize urgent cases intuitively.
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 group-hover:text-[#00e599] transition-colors">
              <span>See Dashboard</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.div>
        </motion.section>

        {/* The Challenge (Problem Statement) */}
        <motion.section 
          id="problem"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
          className="flex flex-col lg:flex-row gap-16 mb-40 relative z-10 items-center scroll-mt-28"
        >
          <div className="flex-1 lg:pr-10">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 text-[#00e599] font-bold text-xs tracking-widest uppercase mb-6"
            >
              <Clock className="w-4 h-4" /> The Challenge
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-[2.75rem] font-bold text-white mb-6 leading-[1.2]"
            >
              Inefficient Scheduling &<br />
              <span className="text-slate-400" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 'normal' }}>Unpredictable Delays</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-slate-400 text-lg mb-10 leading-relaxed max-w-xl"
            >
              Patients routinely face long, agonizing wait times due to archaic scheduling systems and unforeseen clinical hold-ups.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, scaleY: 0 }}
              whileInView={{ opacity: 1, scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, originY: 0 }}
              className="pl-6 border-l-2 border-[#00e599]"
            >
              <p className="text-slate-300 text-lg leading-relaxed max-w-xl">
                Our objective is to develop a smart system that dynamically manages appointments, predicts wait times, and optimizes doctor schedules.
              </p>
            </motion.div>
          </div>
          
          <div className="flex-1 flex flex-col gap-5 w-full">
            {[
              { icon: User, title: "Smart Booking Interface", desc: "Seamless web and mobile platforms designed for intuitive patient appointment scheduling." },
              { icon: Activity, title: "Real-Time Queue Prediction", desc: "AI-driven models calculating accurate wait times dynamically based on live clinic data." },
              { icon: Bell, title: "Dynamic Rescheduling", desc: "Automated delay notifications and intelligent slot reallocation to prevent bottlenecks." },
              { icon: Users, title: "Staff Management Dashboard", desc: "Comprehensive mission-control tools for hospital staff to oversee and adjust scheduling slots." },
            ].map((feature, i) => (
              <motion.div 
                key={feature.title} 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + (i * 0.15), type: "spring" }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="bg-[#0f1115] border border-slate-800/60 rounded-2xl p-6 flex items-start gap-5 transition-all duration-300 hover:border-[#00e599]/40 hover:shadow-[0_0_20px_rgba(0,229,153,0.15)] group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800 group-hover:border-[#00e599]/50 transition-colors">
                  <feature.icon className="w-5 h-5 text-slate-400 group-hover:text-[#00e599] transition-colors" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg mb-2">{feature.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* How it Works (Pipeline) */}
        <motion.section 
          id="pipeline"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center pt-24 border-t border-slate-800/50 relative z-10 scroll-mt-28"
        >
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How it <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e599] via-[#a3f0d2] to-[#ffffff]" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', paddingBottom: '5px' }}>Works</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              A specialized three-step flow engineered to eliminate medical administrative friction.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 w-full relative max-w-5xl mx-auto">
            {/* horizontal line */}
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 1 }}
              className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-px bg-[#00e599]/40 -z-10 origin-left"
            ></motion.div>
            
            {[
              { icon: Clipboard, title: "Register", desc: "Patients book online or check-in at the front desk kiosks in seconds.", num: 1 },
              { icon: Activity, title: "Predict", desc: "Our AI algorithm calculates live exact wait times and notifies patients automatically.", num: 2 },
              { icon: ShieldCheck, title: "Consult", desc: "Doctors see patient info via the dashboard, ensuring a targeted and prompt consultation.", num: 3 },
            ].map((step, i) => (
              <motion.div 
                key={step.title} 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + (i * 0.2), type: "spring", bounce: 0.4 }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="bg-[#0f1115] border border-slate-800/60 rounded-[2rem] p-10 flex flex-col items-center text-center relative z-10 transition-all duration-300 hover:border-[#00e599]/40 hover:shadow-[0_0_30px_rgba(0,229,153,0.15)] group"
              >
                <div className="relative mb-10">
                  <motion.div 
                    whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
                    className="w-20 h-20 bg-slate-900 rounded-[1.5rem] flex items-center justify-center border border-slate-800 group-hover:border-[#00e599]/50 transition-colors"
                  >
                    <step.icon className="w-8 h-8 text-slate-400 group-hover:text-[#00e599] transition-colors" />
                  </motion.div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + (i * 0.2), type: "spring", bounce: 0.6 }}
                    className="absolute -top-3 -right-3 w-8 h-8 bg-[#00e599] text-black font-bold text-sm rounded-full flex items-center justify-center shadow-lg shadow-[#00e599]/40"
                  >
                    {step.num}
                  </motion.div>
                </div>
                <h4 className="text-white font-bold text-2xl mb-4">{step.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Reusable Country Phone Input
   ═══════════════════════════════════════════════════════════ */
const COUNTRY_CODES = [
  { code: "+1", country: "US/CA" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "IN" },
  { code: "+61", country: "AU" },
  { code: "+971", country: "AE" },
  { code: "+81", country: "JP" },
];

function PhoneInput({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [countryCode, setCountryCode] = useState("+91");
  const [number, setNumber] = useState(value.replace(/^\+\d+\s*/, ""));

  useEffect(() => {
    if (number.trim()) {
      onChange(`${countryCode} ${number}`);
    } else {
      onChange("");
    }
  }, [countryCode, number, onChange]);

  return (
    <div className="relative flex">
      <div className="absolute left-0 top-0 bottom-0 flex items-center pr-2 border-r border-slate-800 bg-slate-900/80 rounded-l-xl z-10 w-[105px]">
        <select
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="w-full h-full pl-3 pr-6 py-3.5 bg-slate-900 text-sm text-slate-200 font-semibold focus:outline-none appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: "right 0.2rem center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "1.2em 1.2em",
          }}
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code} className="bg-slate-900 text-white">
              {c.country} ({c.code})
            </option>
          ))}
        </select>
      </div>
      <input
        type="tel"
        placeholder="98765 43210"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        className="w-full pl-[7.2rem] pr-4 py-3.5 rounded-xl border border-slate-800 bg-[#131720] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00e599]/30 focus:border-[#00e599] transition-all"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE 2: PATIENT LOGIN PAGE
   ═══════════════════════════════════════════════════════════ */
function PatientLoginPage({ onLogin, onBack }: { onLogin: (email: string) => void; onBack: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(email);
    }, 400);
  };

  return (
    <main className="max-w-7xl mx-auto px-8 flex flex-col items-center justify-center flex-1 py-16 relative z-10" style={{ minHeight: "calc(100vh - 180px)" }}>
      {/* Background Light Grey Checkered Grid */}
      <div 
        className="absolute inset-0 pointer-events-none -z-10" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="bg-[#0b0d12] rounded-3xl p-8 md:p-10 shadow-2xl border border-slate-800/80 relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-md">
              <User className="w-6 h-6 text-[#00e599]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {mode === 'login' ? 'Patient Sign In' : 'Create Patient Account'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {mode === 'login' ? 'Access your appointments & queue' : 'Register to book & track visits'}
              </p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex bg-slate-900/90 p-1 rounded-xl my-5 border border-slate-800">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${mode === 'login' ? 'bg-[#00e599] text-black shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${mode === 'signup' ? 'bg-[#00e599] text-black shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-xs font-bold text-red-300">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-800 bg-[#131720] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00e599]/30 focus:border-[#00e599] transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="e.g. patient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-800 bg-[#131720] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00e599]/30 focus:border-[#00e599] transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-800 bg-[#131720] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00e599]/30 focus:border-[#00e599] transition-all"
                  required
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300 ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-800 bg-[#131720] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00e599]/30 focus:border-[#00e599] transition-all"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 bg-[#00e599] text-black shadow-[0_0_25px_rgba(0,229,153,0.25)] hover:bg-[#00c985] hover:-translate-y-0.5 cursor-pointer text-sm"
            >
              {isLoading ? "Processing..." : mode === 'login' ? "Sign In as Patient" : "Create Patient Account"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            {mode === 'login' ? "Don't have an account? " : "Already registered? "}
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErrorMsg(''); }}
              className="text-[#00e599] font-bold hover:underline cursor-pointer ml-1"
            >
              {mode === 'login' ? 'Create one now' : 'Sign in here'}
            </button>
          </p>
        </div>

        {/* Back to home */}
        <div className="flex justify-center mt-6">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-400 font-semibold hover:text-[#00e599] transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEPPER (for the 3-step patient flow)
   ═══════════════════════════════════════════════════════════ */
function Stepper({ step }: { step: number }) {
  const steps = ["Registration", "Doctor Selection"];
  return (
    <div className="flex items-center justify-center gap-0 mb-14">
      {steps.map((label, i) => {
        const num = i + 1;
        const isActive = step === num;
        const isDone = step > num;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-2 min-w-[120px]">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${isDone
                  ? "bg-[#00a651] text-white shadow-[0_6px_20px_rgba(0,166,81,0.35)]"
                  : isActive
                    ? "bg-[#004b87] text-white shadow-[0_6px_20px_rgba(0,75,135,0.35)]"
                    : "bg-slate-100 text-slate-400"
                  }`}
              >
                {isDone ? <Check className="w-5 h-5" /> : num}
              </div>
              <span className={`text-xs font-semibold tracking-wide transition-colors ${isActive ? "text-[#004b87]" : isDone ? "text-[#00a651]" : "text-slate-400"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-16 h-[2px] rounded-full mx-1 -mt-6 transition-colors duration-500 ${step > num ? "bg-[#00a651]" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   3-STEP FLOW — Step 1: Registration
   ═══════════════════════════════════════════════════════════ */
function Registration({
  form,
  setForm,
  onNext,
}: {
  form: { name: string; phone: string; age: string; sex: string; department: string; description: string; date: string; timeSlot: string };
  setForm: (f: { name: string; phone: string; age: string; sex: string; department: string; description: string; date: string; timeSlot: string }) => void;
  onNext: () => void;
}) {
  const isValid = form.name.trim() && form.phone.trim() && form.age.trim() && form.sex && form.department && form.date && form.timeSlot;
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-lg bg-white rounded-2xl p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100/80">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#004b87]/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[#004b87]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Patient Registration</h2>
            <p className="text-sm text-slate-400">Fill in your details to begin</p>
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Enter your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004b87]/30 focus:border-[#004b87] transition-all" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-semibold text-slate-600">Phone Number</label>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Verified</span>
            </div>
            <div className="relative opacity-80 cursor-not-allowed">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="tel" value={form.phone} disabled
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-100 text-sm text-slate-500 font-semibold cursor-not-allowed focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Age</label>
              <input type="number" placeholder="Years" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} min={0}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004b87]/30 focus:border-[#004b87] transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Sex</label>
              <select value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004b87]/30 focus:border-[#004b87] transition-all appearance-none cursor-pointer">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Consultation Department</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004b87]/30 focus:border-[#004b87] transition-all appearance-none cursor-pointer">
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => (<option key={d} value={d}>{d}</option>))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Preferred Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004b87]/30 focus:border-[#004b87] transition-all cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Time Slot</label>
              <select value={form.timeSlot} onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004b87]/30 focus:border-[#004b87] transition-all appearance-none cursor-pointer">
                <option value="">Select time</option>
                <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Brief Description (Optional)</label>
            <textarea placeholder="Describe your symptoms or reason for visit..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004b87]/30 focus:border-[#004b87] transition-all resize-none" />
          </div>
        </div>
        <button onClick={onNext} disabled={!isValid}
          className={`w-full mt-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${isValid ? "bg-[#004b87] text-white shadow-[0_10px_30px_rgba(0,75,135,0.25)] hover:shadow-[0_15px_40px_rgba(0,75,135,0.35)] hover:-translate-y-0.5 cursor-pointer" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}>
          Next Step <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   3-STEP FLOW — Step 2: Doctor Selection
   ═══════════════════════════════════════════════════════════ */
function DoctorSelection({ selectedDoctor, setSelectedDoctor, onNext, onBack }: {
  selectedDoctor: number | null; setSelectedDoctor: (id: number) => void; onNext: () => void; onBack: () => void;
}) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#00a651]/10 flex items-center justify-center">
          <Stethoscope className="w-5 h-5 text-[#00a651]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Choose Your Doctor</h2>
          <p className="text-sm text-slate-400">Select a doctor based on availability</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {DOCTORS.map((doc) => {
          const isSelected = selectedDoctor === doc.id;
          const isDelayed = doc.status === "delayed";
          return (
            <div key={doc.id} onClick={() => setSelectedDoctor(doc.id)}
              className={`relative bg-white rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 ${isSelected ? "ring-2 ring-[#00a651] shadow-[0_20px_50px_-10px_rgba(0,166,81,0.2)]" : "shadow-[0_15px_40px_-10px_rgba(0,0,0,0.07)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12)] border border-slate-100/80"}`}>
              {isSelected && (
                <div className="absolute top-4 right-4 w-7 h-7 bg-[#00a651] rounded-full flex items-center justify-center shadow-md">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#004b87]/10 to-[#00a651]/10 flex items-center justify-center mb-4">
                <Stethoscope className="w-7 h-7 text-[#004b87]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">{doc.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{doc.specialty}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isDelayed ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isDelayed ? "bg-red-500" : "bg-emerald-500"}`} />
                  {isDelayed ? `${doc.delay} Delay` : "On Time"}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Users className="w-3.5 h-3.5" /> Ahead: {doc.patientsAhead}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-10">
        <button onClick={onBack} className="flex items-center gap-2 px-6 py-3 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={onNext} disabled={selectedDoctor === null}
          className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 ${selectedDoctor !== null ? "bg-[#00a651] text-white shadow-[0_10px_30px_rgba(0,166,81,0.25)] hover:shadow-[0_15px_40px_rgba(0,166,81,0.35)] hover:-translate-y-0.5 cursor-pointer" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}>
          Confirm & Track <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   3-STEP FLOW — Step 3: Live Tracker
   ═══════════════════════════════════════════════════════════ */
function LiveTracker({ appointment, onBack, onCancel, onReschedule }: { appointment: any; onBack: () => void; onCancel: () => void; onReschedule: () => void }) {
  const doctor = DOCTORS.find(d => d.name === appointment.doctor_name) || { name: appointment.doctor_name, specialty: 'General', delay: "0", status: 'ontime' };

  const [queue, setQueue] = useState<any[]>([]);
  const [avgTime, setAvgTime] = useState(15);
  const [globalDelay, setGlobalDelay] = useState(0);
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const sync = () => {
      setQueue(JSON.parse(localStorage.getItem('hospital_queue') || '[]'));
      setAvgTime(parseInt(localStorage.getItem('current_avg_consultation') || '15', 10));
      setGlobalDelay(parseInt(localStorage.getItem('global_doctor_delay') || '0', 10));
    };
    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const doctorDelayed = doctor.status === "delayed";
  const isDelayed = globalDelay > 0 || doctorDelayed;

  const total = Math.max(5, queue.length);
  // Real index tracking:
  const actualIndex = queue.findIndex(q => q.id === appointment.id);
  const position = actualIndex >= 0 ? actualIndex + 1 : 1;
  const progressPercent = ((total - position + 1) / total) * 100;

  useEffect(() => {
    if (position <= 2 && Notification.permission === "granted" && !notified && actualIndex >= 0) {
      new Notification("Mediqueue Alert", {
        body: `It's almost your turn! You are position ${position} for ${doctor?.name}. Please head towards the room.`
      });
      setNotified(true);
    }
  }, [position, doctor, notified, actualIndex]);

  // Calculate ETA (Base 2:00 PM = 840 mins)
  const baseTimeMins = 840;
  const totalMins = baseTimeMins + (position * avgTime) + globalDelay + (doctorDelayed ? parseInt(doctor.delay || "0") : 0);

  const hours = Math.floor(totalMins / 60);
  const displayHours = hours > 12 ? hours - 12 : hours;
  const mins = totalMins % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';

  const timeString = `${displayHours}:${mins.toString().padStart(2, '0')}`;

  const handleDelete = () => {
    onCancel();
  };

  const handleReschedule = () => {
    onReschedule();
  };

  if (actualIndex === -1) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pt-10 text-center">
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-100">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Appointment Completed</h2>
          <p className="text-slate-500">This appointment is no longer in the active queue.</p>
          <button onClick={onBack} className="mt-8 font-bold text-white bg-[#004b87] px-6 py-3 rounded-xl hover:shadow-lg transition-all">Return to Dashboard</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-6">
      <div className="bg-white rounded-2xl p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100/80 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Queue Active
        </div>
        <p className="text-sm text-slate-400 mb-1">Welcome, {appointment.name}</p>
        <h2 className="text-lg font-bold text-slate-700 mb-6">
          Seeing <span className="text-[#004b87]">{doctor?.name}</span> • {doctor?.specialty}
        </h2>
        <div className="mb-8">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Estimated Consultation</p>
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-8 h-8 text-[#004b87]" />
            <span className="text-5xl font-extrabold text-[#004b87] tracking-tight">{timeString}</span>
            <span className="text-2xl font-bold text-[#004b87]/60 mt-2">{ampm}</span>
          </div>
        </div>
        <div className="mb-2">
          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Your Position</span>
            <span className="text-[#004b87]">{position} of {total}</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#004b87] to-[#00a651] transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">Approximately {position * avgTime} minutes remaining</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Activity, value: position, label: "In Queue", color: "#00a651" },
          { icon: Users, value: total, label: "Total Patients", color: "#004b87" },
          { icon: CheckCircle2, value: total - position, label: "Completed", color: "#10b981" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06)] border border-slate-100/80 text-center">
            <c.icon className="w-6 h-6 mx-auto mb-2" style={{ color: c.color }} />
            <p className="text-2xl font-extrabold text-slate-800">{c.value}</p>
            <p className="text-xs text-slate-400 font-medium">{c.label}</p>
          </div>
        ))}
      </div>

      {isDelayed && (
        <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-5 flex items-start gap-4 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.1)]">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-800 mb-1">Schedule Adjustment</h4>
            <p className="text-sm text-amber-700 leading-relaxed">
              We've adjusted the schedule to ensure quality care. Your estimated time reflects an additional delay of {globalDelay > 0 ? `${globalDelay}m` : doctor?.delay}.
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-2">
        <button onClick={onBack} className="flex items-center gap-2 px-6 py-3 rounded-xl text-slate-500 font-semibold hover:bg-slate-100 transition-colors cursor-pointer text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          <button onClick={handleReschedule} className="flex items-center gap-2 px-6 py-3 rounded-xl text-amber-600 font-semibold hover:bg-amber-50 transition-colors cursor-pointer border border-amber-200/60 text-sm shadow-sm bg-white">
            <Clock className="w-4 h-4" /> Reschedule
          </button>
          <button onClick={handleDelete} className="flex items-center gap-2 px-6 py-3 rounded-xl text-red-500 font-semibold hover:bg-red-50 transition-colors cursor-pointer border border-red-100 text-sm shadow-sm bg-white">
            <Trash2 className="w-4 h-4" /> Cancel Booking
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE 3: PATIENT FLOW (2-step booking, skipping live tracker)
   ═══════════════════════════════════════════════════════════ */
function PatientFlow({ initialPhone, onBackToHome, onComplete }: { initialPhone: string; onBackToHome: () => void; onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", phone: initialPhone || "", age: "", sex: "", department: "", description: "", date: "", timeSlot: "" });
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);

  const handleConfirmAndTrack = () => {
    const currentQueue = JSON.parse(localStorage.getItem('hospital_queue') || '[]');
    const maxToken = currentQueue.length > 0 ? Math.max(...currentQueue.map((q: any) => parseInt(q.id))) : 100;
    const docName = DOCTORS.find(d => d.id === selectedDoctor)?.name || 'Unassigned';

    const newPatient = {
      id: (maxToken + 1).toString(),
      name: form.name,
      phone: form.phone, // Save exact raw phone string to match Dashboard exactly
      type: 'Online',
      scheduled: form.timeSlot ? form.timeSlot.split(' - ')[0] : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Waiting',
      doctor_name: docName
    };

    const nq = [...currentQueue, newPatient];
    localStorage.setItem('hospital_queue', JSON.stringify(nq));
    window.dispatchEvent(new Event('storage'));
    // Non-blocking remote insert avoids global DB-wipe triggers locking out real-time syncs
    

    // Dynamically compute the exact Live Tracker ETA for the SMS message payload
    const avgTime = parseInt(localStorage.getItem('current_avg_consultation') || '15', 10);
    const globalDelay = parseInt(localStorage.getItem('global_doctor_delay') || '0', 10);
    const doctor = DOCTORS.find(d => d.name === docName) || { delay: "0", status: 'ontime' };
    const doctorDelayed = doctor.status === "delayed";

    // Position is effectively the length of the queue since they are the newest entry
    const position = nq.length;
    const baseTimeMins = 840;
    const totalMins = baseTimeMins + (position * avgTime) + globalDelay + (doctorDelayed ? parseInt(doctor.delay || "0") : 0);

    const hours = Math.floor(totalMins / 60);
    const displayHours = hours > 12 ? hours - 12 : hours;
    const mins = totalMins % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const computedETA = `${displayHours}:${mins.toString().padStart(2, '0')} ${ampm}`;

    // Registration notification
    const smsMessage = `Your registration for patient ${newPatient.name} has been successfully registered. You are scheduled to see ${newPatient.doctor_name}, and your expected arrival time is ${computedETA}.`;

    

    if ("Notification" in window) {
      Notification.requestPermission().then(perm => {
        if (perm === "granted") {
          new Notification(`SMS to ${newPatient.phone}`, { body: smsMessage, icon: 'https://cdn-icons-png.flaticon.com/512/3358/3358053.png' });
        } else {
          alert(`[SMS to ${newPatient.phone}]\n\n${smsMessage}`);
        }
      });
    } else {
      alert(`[SMS to ${newPatient.phone}]\n\n${smsMessage}`);
    }

    onComplete();
  };

  return (
    <main className="max-w-6xl mx-auto px-8 pt-8 pb-20">
      <Stepper step={step} />
      {step === 1 && <Registration form={form} setForm={setForm} onNext={() => setStep(2)} />}
      {step === 2 && <DoctorSelection selectedDoctor={selectedDoctor} setSelectedDoctor={setSelectedDoctor} onNext={handleConfirmAndTrack} onBack={() => setStep(1)} />}

      {step === 1 && (
        <div className="flex justify-center mt-6">
          <button onClick={onBackToHome} className="flex items-center gap-2 text-sm text-slate-500 font-semibold hover:text-[#004b87] transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Cancel & Back
          </button>
        </div>
      )}
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE 3.2: RECEPTIONIST LOGIN PAGE
   ═══════════════════════════════════════════════════════════ */
function StaffLoginPage({ onLogin, onBack }: { onLogin: () => void; onBack: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      sessionStorage.setItem("isAdmin", "true");
      onLogin();
    }, 400);
  };

  return (
    <main className="w-full flex-1 flex flex-col items-center justify-center py-16 px-4 relative z-10" style={{ minHeight: "calc(100vh - 180px)" }}>
      {/* Background Light Grey Checkered Grid */}
      <div 
        className="absolute inset-0 pointer-events-none -z-10" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="w-full max-w-md bg-[#0b0d12] rounded-3xl p-8 md:p-10 shadow-2xl border border-slate-800/80 relative z-10 transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,229,153,0.12)]">

        <div className="flex flex-col items-center justify-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 shadow-sm">
            <Building2 className="w-7 h-7 text-[#00e599]" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">
            {mode === 'login' ? 'Receptionist Portal' : 'Register Staff Account'}
          </h1>
          <p className="text-slate-400 text-xs font-medium">
            {mode === 'login' ? 'Hospital ER & Walk-In Intake Sign-In' : 'Authorize new front desk staff member'}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex bg-slate-900/90 p-1 rounded-xl mb-5 border border-slate-800">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${mode === 'login' ? 'bg-[#00e599] text-black shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${mode === 'signup' ? 'bg-[#00e599] text-black shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 flex items-center gap-2.5 shadow-sm">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-xs font-bold text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 ml-1">Staff Member Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. Front Desk Operator"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-800 bg-[#131720] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00e599]/30 focus:border-[#00e599] transition-all font-medium text-xs"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 ml-1">Email / Staff Username</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. reception@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-800 bg-[#131720] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00e599]/30 focus:border-[#00e599] transition-all font-medium text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-800 bg-[#131720] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00e599]/30 focus:border-[#00e599] transition-all font-medium text-xs"
                required
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-800 bg-[#131720] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00e599]/30 focus:border-[#00e599] transition-all font-medium text-xs"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-xl bg-[#00e599] hover:bg-[#00c985] text-black font-extrabold text-sm transition-all shadow-[0_0_25px_rgba(0,229,153,0.25)] hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? "Processing..." : mode === 'login' ? "Enter Staff Portal" : "Create Staff Account"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            {mode === 'login' ? "New front-desk staff? " : "Already registered? "}
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              className="text-[#00e599] font-bold hover:underline cursor-pointer ml-1"
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>

      <div className="flex justify-center mt-6 relative z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-400 font-semibold hover:text-[#00e599] transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Return to Directory
        </button>
      </div>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE 3.5: DOCTOR LOGIN PAGE
   ═══════════════════════════════════════════════════════════ */
function DoctorLoginPage({ onLogin, onBack }: { onLogin: () => void; onBack: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('General Medicine');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 400);
  };

  return (
    <main className="w-full flex-1 flex flex-col items-center justify-center py-16 px-4 relative z-10" style={{ minHeight: "calc(100vh - 180px)" }}>
      {/* Background Light Grey Checkered Grid */}
      <div 
        className="absolute inset-0 pointer-events-none -z-10" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="w-full max-w-md bg-[#0b0d12] rounded-3xl p-8 md:p-10 shadow-2xl border border-slate-800/80 relative z-10 transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,229,153,0.12)]">
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
            <Stethoscope className="w-7 h-7 text-[#00e599]" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1 tracking-tight">
            {mode === 'login' ? 'Doctor Portal' : 'Register Doctor Profile'}
          </h1>
          <p className="text-slate-400 text-xs">
            {mode === 'login' ? 'Secure command & consultation console' : 'Join hospital clinical staff roster'}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex bg-slate-900/90 p-1 rounded-xl mb-5 border border-slate-800">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${mode === 'login' ? 'bg-[#00e599] text-black shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${mode === 'signup' ? 'bg-[#00e599] text-black shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 flex items-center gap-2.5 shadow-sm">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-xs font-bold text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 ml-1">Doctor Name</label>
                <div className="relative">
                  <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. Dr. Priya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-800 bg-[#131720] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00e599]/30 focus:border-[#00e599] transition-all font-medium text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 ml-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-[#131720] text-white focus:outline-none focus:ring-2 focus:ring-[#00e599]/30 focus:border-[#00e599] font-medium text-xs"
                >
                  {DEPARTMENTS.map(dept => <option key={dept} value={dept} className="bg-slate-900">{dept}</option>)}
                </select>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 ml-1">Doctor Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="e.g. doctor@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-800 bg-[#131720] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00e599]/30 focus:border-[#00e599] transition-all font-medium text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-800 bg-[#131720] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00e599]/30 focus:border-[#00e599] transition-all font-medium text-xs"
                required
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-800 bg-[#131720] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00e599]/30 focus:border-[#00e599] transition-all font-medium text-xs"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-xl bg-[#00e599] hover:bg-[#00c985] text-black font-extrabold text-sm transition-all shadow-[0_0_25px_rgba(0,229,153,0.25)] hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? "Processing..." : mode === 'login' ? "Access Doctor Console" : "Register Doctor Profile"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            {mode === 'login' ? "New doctor? " : "Already registered? "}
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              className="text-[#00e599] font-bold hover:underline cursor-pointer ml-1"
            >
              {mode === 'login' ? 'Create Profile' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-400 font-semibold hover:text-[#00e599] transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE 3.8: MANAGEMENT DASHBOARD (The "Fog" Clearer)
   ═══════════════════════════════════════════════════════════ */

function ManagementAnalyticsView() {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = () => {
      const data = JSON.parse(localStorage.getItem('patient_history') || '[]');
      const counts: Record<string, number> = {};
      ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].forEach(h => counts[h] = 0);

      data.forEach((row: any) => {
        const date = new Date(row.completed_at || Date.now());
        const hourStr = date.getHours().toString().padStart(2, '0') + ':00';
        if (counts[hourStr] !== undefined) {
          counts[hourStr]++;
        } else {
          counts[hourStr] = 1;
        }
      });

      const formatted = Object.keys(counts).sort().map(hour => ({
        name: hour,
        patients: counts[hour]
      }));

      setChartData(formatted);
    };

    fetchHistory();
    window.addEventListener('storage', fetchHistory);
    return () => window.removeEventListener('storage', fetchHistory);
  }, []);

  return (
    <div className="lg:col-span-12 space-y-6">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-[#004b87]" /> Patient Volume Today
        </h3>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="patients" fill="#004b87" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function ManagementAllPatientsView({ queue }: { queue: any[] }) {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const sync = () => {
      const data = JSON.parse(localStorage.getItem('patient_history') || '[]');
      setHistory(data);
    };
    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const allPatients = [
    ...history.map((h: any) => ({
      id: `H-${h.id}`,
      name: h.patient_name,
      type: h.patient_type || 'Walk-in',
      doctor_name: h.doctor_name,
      displayStatus: 'Consulted'
    })),
    ...queue.map(q => ({
      id: q.id,
      name: q.name,
      type: q.type,
      doctor_name: q.doctor_name,
      displayStatus: q.status?.toLowerCase() === 'consulting' ? 'Consulting' : q.status === 'No-Show' ? 'No-Show' : q.scheduled,
      rawPatient: q
    }))
  ];

  const handleRequeue = (p: any) => {
    const newQueue = queue.map(item => item.id === p.id ? { ...item, status: 'Waiting' } : item);
    setLocalData('hospital_queue', JSON.stringify(newQueue));
  };

  return (
    <div className="lg:col-span-12 space-y-6">
      <div className="bg-white rounded-3xl p-8 shadow-[0_10px_40px_-5px_rgba(0,0,0,0.05)] border border-slate-100/80">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Users className="w-6 h-6 text-[#004b87]" /> Patient Master List
        </h3>

        {allPatients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <th className="pb-4 pl-2 font-bold w-48">Patient</th>
                  <th className="pb-4">Type</th>
                  <th className="pb-4">Doctor</th>
                  <th className="pb-4 text-right pr-2">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium">
                {allPatients.map((p: any) => (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pl-2 font-bold text-slate-800">{p.name}</td>
                    <td className="py-4">
                      <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold tracking-wider ${p.type === 'Online' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="py-4 text-slate-500 font-semibold">{p.doctor_name || 'Unassigned'}</td>
                    <td className="py-4 text-right pr-2">
                      {p.displayStatus === 'Consulted' ? (
                        <span className="text-xs font-bold text-slate-400 border border-slate-200 px-3 py-1 rounded-full bg-slate-50 opacity-70">Consulted</span>
                      ) : p.displayStatus === 'Consulting' ? (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 shadow-sm px-4 py-1.5 rounded-full animate-pulse">Consulting</span>
                      ) : p.displayStatus === 'No-Show' ? (
                        <div className="flex justify-end items-center gap-2">
                          <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full border border-red-100 shadow-sm">No-Show</span>
                          <button onClick={() => handleRequeue(p.rawPatient)} className="text-xs font-extrabold text-[#004b87] hover:bg-[#004b87]/5 px-3 py-1 hover:shadow-sm rounded-lg border border-transparent hover:border-[#004b87]/20 transition-all cursor-pointer">Requeue</button>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-[#004b87] bg-[#004b87]/5 border border-[#004b87]/10 px-4 py-1.5 rounded-full tracking-widest">{p.displayStatus}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-slate-400 py-10 font-medium flex flex-col items-center justify-center">
            <Users className="w-16 h-16 mb-4 opacity-20" />
            No patient histories or active queues found.
          </div>
        )}
      </div>
    </div>
  );
}

function ManagementDashboard({ onBack }: { onBack: () => void }) {
  const [queue, setQueue] = useState<any[]>([]);
  const [tab, setTab] = useState<'intake' | 'all' | 'analytics'>('intake');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  // Intake Form State
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [specialty, setSpecialty] = useState("General Medicine");
  const [assignedDoctor, setAssignedDoctor] = useState("Unassigned");
  const [priority, setPriority] = useState(false);

  const [flashSuccess, setFlashSuccess] = useState(false);
  const [lastRegisteredToken, setLastRegisteredToken] = useState<any | null>(null);

  const API_BASE = 'http://localhost:5000/api';

  // Mock database for auto-fill logic
  const PATIENT_DB: Record<string, { name: string, age: string }> = {
    "9876543210": { name: "Ravi Kumar", age: "45" },
    "9998887776": { name: "Ananya S.", age: "29" },
    "5551234567": { name: "John Doe", age: "33" },
  };

  // Helper to fetch live queue from backend or fallback to localStorage
  const syncQueue = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/queue`, { method: 'GET' });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          // Normalize queue data
          const normalized = json.data.map((item: any) => ({
            id: String(item.token_number || item.id),
            rawId: item.id,
            name: item.patient_name || item.name,
            phone: item.phone || '',
            age: item.age || 30,
            type: item.patient_type || item.type || 'Walk-in',
            scheduled: item.scheduled_time || item.scheduled || (item.priority ? 'Immediate' : 'In Queue'),
            status: item.status || 'Waiting',
            doctor_name: item.doctor_name || 'Unassigned',
            department: item.department || 'General Medicine',
            priority: Boolean(item.priority)
          }));
          setQueue(normalized);
          setLocalData('hospital_queue', JSON.stringify(normalized));
          setIsBackendConnected(true);
          setIsLoading(false);
          return;
        }
      }
      throw new Error("Backend response not ok");
    } catch (err) {
      console.warn("Backend API not reachable, using localStorage fallback:", err);
      setIsBackendConnected(false);
      const local = JSON.parse(localStorage.getItem('hospital_queue') || '[]');
      setQueue(local);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    syncQueue();
    const handleStorage = () => {
      const local = JSON.parse(localStorage.getItem('hospital_queue') || '[]');
      setQueue(local);
    };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(syncQueue, 8000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(val);

    // Check DB mapping if length reaches 10
    if (val.length === 10 && PATIENT_DB[val]) {
      setName(PATIENT_DB[val].name);
      setAge(PATIENT_DB[val].age);
      setFlashSuccess(true);
      setTimeout(() => setFlashSuccess(false), 3000);
    }
  };

  const handlePing = async (p: any) => {
    if (p.phone) {
      alert(`Notification sent to patient ${p.name} (${p.phone}): Your doctor is ready for you!`);
    } else {
      alert(`Patient #${p.id} (${p.name}) notified.`);
    }
  };

  const handleUpdateStatus = async (p: any, newStatus: string) => {
    // 1. Optimistic UI update
    const updated = queue.map(item => (item.id === p.id || item.rawId === p.rawId) ? { ...item, status: newStatus } : item);
    setQueue(updated);
    setLocalData('hospital_queue', JSON.stringify(updated));

    // 2. Sync to Backend API
    try {
      const targetId = p.rawId || p.id;
      await fetch(`${API_BASE}/queue/${targetId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.warn("Backend status update error:", e);
    }
  };

  const handleDelete = async (p: any) => {
    if (!window.confirm(`Are you sure you want to remove Token #${p.id} (${p.name}) from the live queue?`)) {
      return;
    }
    // Optimistic removal
    const updated = queue.filter(item => item.id !== p.id && item.rawId !== p.rawId);
    setQueue(updated);
    setLocalData('hospital_queue', JSON.stringify(updated));

    // Backend deletion
    try {
      const targetId = p.rawId || p.id;
      await fetch(`${API_BASE}/walkins/${targetId}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn("Backend delete error:", e);
    }
  };

  const handleAddQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || phone.length < 10) return;

    setIsSubmitting(true);
    let registeredToken: any = null;

    try {
      // Send to Backend API
      const res = await fetch(`${API_BASE}/walkins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          age: Number(age) || 30,
          doctor_name: assignedDoctor,
          department: specialty,
          priority
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          registeredToken = {
            id: String(json.data.token_number || json.data.id),
            rawId: json.data.id,
            name: json.data.patient_name || json.data.name,
            phone: json.data.phone,
            age: json.data.age,
            type: 'Walk-in',
            scheduled: json.data.scheduled_time || (priority ? 'Immediate' : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
            status: 'Waiting',
            doctor_name: json.data.doctor_name || assignedDoctor,
            department: json.data.department || specialty,
            priority: Boolean(json.data.priority)
          };
        }
      }
    } catch (err) {
      console.warn("Backend post failed, creating local walk-in fallback:", err);
    }

    // Fallback if backend wasn't reachable
    if (!registeredToken) {
      const maxToken = queue.length > 0 ? Math.max(...queue.map(q => parseInt(q.id) || 100)) : 100;
      const newToken = maxToken + 1;
      registeredToken = {
        id: newToken.toString(),
        rawId: newToken.toString(),
        name,
        phone: phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3'),
        age: Number(age) || 30,
        type: 'Walk-in',
        scheduled: priority ? 'Immediate' : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Waiting',
        doctor_name: assignedDoctor,
        department: specialty,
        priority
      };
    }

    // Place into queue according to priority
    const newQueue = [...queue];
    if (priority) {
      if (newQueue.length > 0 && newQueue[0].status?.toLowerCase() === 'consulting') {
        newQueue.splice(1, 0, registeredToken);
      } else {
        newQueue.unshift(registeredToken);
      }
    } else {
      newQueue.push(registeredToken);
    }

    setQueue(newQueue);
    setLocalData('hospital_queue', JSON.stringify(newQueue));
    setLastRegisteredToken(registeredToken);

    // Reset form
    setPhone("");
    setName("");
    setAge("");
    setPriority(false);
    setIsSubmitting(false);
  };

  // Filtered queue for table
  const filteredQueue = queue.filter(p => {
    const matchesSearch = !searchTerm ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id?.toString().includes(searchTerm) ||
      p.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone?.includes(searchTerm);

    if (!matchesSearch) return false;
    if (filterStatus === 'All') return true;
    if (filterStatus === 'In Room') return p.status?.toLowerCase() === 'consulting';
    return p.status === filterStatus;
  });

  return (
    <div className="flex w-full min-h-screen bg-[#f4f7fb]">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-[#002b5e] text-white flex flex-col shadow-2xl z-20 sticky top-0 h-screen">
        <div className="p-8 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight leading-tight">Receptionist<br /><span className="text-emerald-400">Command Desk</span></h1>
          </div>
        </div>

        {/* Live status badge */}
        <div className="px-6 py-4">
          <div className="bg-[#001f44] rounded-xl p-3 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-ping' : isBackendConnected === false ? 'bg-amber-400' : 'bg-slate-400'}`}></span>
              <span className="text-xs font-semibold text-slate-300">
                {isBackendConnected ? 'API Connected (5000)' : isBackendConnected === false ? 'Local Storage Sync' : 'Checking API...'}
              </span>
            </div>
            <button onClick={syncQueue} title="Refresh Live Queue" className="p-1 text-slate-400 hover:text-white rounded transition-colors cursor-pointer">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-2">
          <button onClick={() => setTab('intake')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all cursor-pointer ${tab === 'intake' ? 'bg-[#004b87] text-white shadow-inner border border-white/10' : 'text-slate-400 font-semibold hover:bg-white/5 hover:text-white'}`}>
            <ClipboardList className={`w-5 h-5 ${tab === 'intake' ? 'text-emerald-400' : ''}`} /> Walk-In Intake
          </button>
          <button onClick={() => setTab('all')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all cursor-pointer ${tab === 'all' ? 'bg-[#004b87] text-white shadow-inner border border-white/10' : 'text-slate-400 font-semibold hover:bg-white/5 hover:text-white'}`}>
            <Users className={`w-5 h-5 ${tab === 'all' ? 'text-emerald-400' : ''}`} /> All Patients
          </button>
          <button onClick={() => setTab('analytics')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all cursor-pointer ${tab === 'analytics' ? 'bg-[#004b87] text-white shadow-inner border border-white/10' : 'text-slate-400 font-semibold hover:bg-white/5 hover:text-white'}`}>
            <BarChart2 className={`w-5 h-5 ${tab === 'analytics' ? 'text-emerald-400' : ''}`} /> Analytics
          </button>
        </nav>

        <div className="p-4 mt-auto border-t border-white/10">
          <button onClick={onBack} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-bold transition-all border border-red-500/20 cursor-pointer">
            <Lock className="w-4 h-4" /> Secure Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-2xl border-b border-slate-200/80 px-10 py-5 flex items-center justify-between z-10 sticky top-0 shadow-sm">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Receptionist & Walk-In Intake</h2>
            <p className="text-xs font-semibold text-slate-500">Live multi-channel queue orchestration with automatic token dispatch</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-extrabold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {queue.filter(q => q.status !== 'No-Show').length} Active in Queue
            </div>
          </div>
        </header>

        {/* Scrollable grid area */}
        <div className="p-10 grid lg:grid-cols-12 gap-8 overflow-y-auto flex-1">
          {tab === 'analytics' ? <ManagementAnalyticsView /> : tab === 'all' ? <ManagementAllPatientsView queue={queue} /> : (
            <>
              {/* Left Column: Intake */}
              <div className="lg:col-span-4 space-y-6">
                <div className={`bg-white rounded-3xl p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border transition-colors duration-500 relative overflow-hidden ${flashSuccess ? 'border-emerald-400 bg-emerald-50/10' : 'border-slate-100'}`}>

                  {flashSuccess && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 rounded-bl-full blur-2xl z-0 pointer-events-none"></div>
                  )}

                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#004b87]/10 flex items-center justify-center text-[#004b87]">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-[#004b87]">New Walk-In Registration</h3>
                        <p className="text-xs font-semibold text-slate-400">Express Intake & Priority Routing</p>
                      </div>
                    </div>
                  </div>

                  {flashSuccess && (
                    <div className="mb-6 p-3 bg-emerald-100 text-emerald-800 rounded-xl text-sm font-bold border border-emerald-200 flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Patient recognized and auto-filled!
                    </div>
                  )}

                  <form onSubmit={handleAddQueue} className="space-y-4 relative z-10">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number (10 Digits)</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#004b87]/50" />
                        <input
                          type="text"
                          placeholder="e.g. 9876543210"
                          maxLength={10}
                          value={phone}
                          onChange={handlePhoneChange}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004b87]/30 transition-all font-bold tracking-widest text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Patient Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004b87]/30 transition-all font-semibold text-sm"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Age</label>
                        <input
                          type="number"
                          placeholder="e.g. 32"
                          min="1"
                          max="120"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004b87]/30 transition-all font-semibold text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Department</label>
                        <select
                          value={specialty}
                          onChange={(e) => setSpecialty(e.target.value)}
                          className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004b87]/30 font-semibold text-sm"
                        >
                          {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Assigned Physician</label>
                      <select
                        value={assignedDoctor}
                        onChange={(e) => setAssignedDoctor(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004b87]/30 font-semibold text-sm"
                      >
                        <option value="Unassigned">Auto-assign / Unassigned</option>
                        {DOCTORS.map(d => <option key={d.id} value={d.name}>{d.name} ({d.specialty})</option>)}
                      </select>
                    </div>

                    {/* Priority Toggle */}
                    <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Flame className={`w-5 h-5 ${priority ? 'text-red-500 fill-red-500' : 'text-amber-500'}`} />
                        <div>
                          <span className="text-xs font-extrabold text-slate-800">Critical / Emergency Priority</span>
                          <p className="text-[10px] text-slate-500 font-medium">Bypass queue & place at front for immediate consultation</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={priority}
                        onChange={(e) => setPriority(e.target.checked)}
                        className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!name || phone.length < 10 || isSubmitting}
                      className="w-full py-3.5 mt-2 rounded-xl bg-[#00a651] hover:bg-[#008f45] disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none text-white font-extrabold text-base transition-all shadow-[0_10px_30px_-5px_rgba(0,166,81,0.4)] hover:shadow-[0_15px_40px_-5px_rgba(0,166,81,0.5)] hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <PlusCircle className="w-5 h-5" /> Issue Walk-In Token
                        </>
                      )}
                    </button>
                  </form>

                  {/* Last Registered Token Feedback Card */}
                  {lastRegisteredToken && (
                    <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 animate-in fade-in zoom-in duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-widest">Token Issued</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-black text-sm">
                          #{lastRegisteredToken.id}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">{lastRegisteredToken.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{lastRegisteredToken.doctor_name} • {lastRegisteredToken.department}</p>
                      <div className="mt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> Added to live queue successfully
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Live Master Queue */}
              <div className="lg:col-span-8">
                <div className="bg-white rounded-3xl p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col h-full">
                  
                  {/* Queue Header & Filters */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#00a651]/10 flex items-center justify-center text-[#00a651]">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-[#004b87]">Live Patient Queue</h3>
                        <p className="text-xs font-semibold text-slate-400">Receptionist Master Control Center</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search patient, token, doctor..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004b87]/20 w-48 transition-all"
                        />
                      </div>

                      {/* Status Filter Tabs */}
                      <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                        {['All', 'Waiting', 'In Room', 'No-Show'].map(s => (
                          <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${filterStatus === s ? 'bg-white text-[#004b87] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>

                      {/* Sync Button */}
                      <button
                        onClick={syncQueue}
                        title="Sync live queue"
                        className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                      >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#004b87]' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {filteredQueue.length > 0 ? (
                    <div className="overflow-x-auto flex-1">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <th className="pb-4 pl-2 font-semibold w-24">Token</th>
                            <th className="pb-4 font-semibold">Patient</th>
                            <th className="pb-4 font-semibold">Type / Source</th>
                            <th className="pb-4 font-semibold">Assigned Doctor</th>
                            <th className="pb-4 font-semibold">Status</th>
                            <th className="pb-4 font-semibold text-right pr-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm font-medium">
                          {filteredQueue.map((p) => {
                            const isConsulting = p.status?.toLowerCase() === 'consulting';
                            const isNoShow = p.status === 'No-Show';
                            const isWaiting = !isConsulting && !isNoShow;

                            return (
                              <tr key={p.id} className={`border-b border-slate-50 last:border-0 transition-colors ${isConsulting ? 'bg-emerald-50/40' : 'hover:bg-slate-50/50'}`}>
                                <td className="py-4 pl-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`inline-flex items-center justify-center min-w-[3.2rem] px-2 py-1 rounded-lg text-sm font-black ${isConsulting ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : p.priority ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-[#004b87]/10 text-[#004b87]'}`}>
                                      #{p.id}
                                    </span>
                                  </div>
                                  {p.priority && (
                                    <span className="inline-block mt-1 text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-red-500 text-white tracking-wider">
                                      Critical
                                    </span>
                                  )}
                                </td>

                                <td className="py-4">
                                  <div className="font-bold text-slate-800">{p.name}</div>
                                  <div className="text-slate-400 font-mono text-xs flex items-center gap-1 mt-0.5">
                                    <span>{p.phone || 'No Phone'}</span>
                                    {p.age && <span>• {p.age} yrs</span>}
                                  </div>
                                </td>

                                <td className="py-4">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-extrabold tracking-wide ${p.type === 'Online' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                    {p.type}
                                  </span>
                                  {p.department && (
                                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">{p.department}</div>
                                  )}
                                </td>

                                <td className="py-4">
                                  <span className="text-slate-700 font-semibold text-xs">{p.doctor_name || 'Unassigned'}</span>
                                </td>

                                <td className="py-4">
                                  {isConsulting ? (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 animate-pulse">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> In Room
                                    </span>
                                  ) : isNoShow ? (
                                    <span className="inline-flex items-center text-xs font-extrabold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                                      No-Show
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center text-xs font-bold text-[#004b87] bg-[#004b87]/10 px-3 py-1 rounded-full">
                                      Waiting ({p.scheduled || 'Queued'})
                                    </span>
                                  )}
                                </td>

                                <td className="py-4 text-right pr-2">
                                  <div className="flex justify-end items-center gap-1.5">
                                    {/* SMS Notification Ping */}
                                    <button
                                      onClick={() => handlePing(p)}
                                      title="Send SMS Ping Alert"
                                      className="w-8 h-8 rounded-lg border border-slate-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300 flex items-center justify-center transition-all bg-white shadow-sm cursor-pointer"
                                    >
                                      <Bell className="w-4 h-4" />
                                    </button>

                                    {/* Toggle In-Room / Consulting */}
                                    {isWaiting && (
                                      <button
                                        onClick={() => handleUpdateStatus(p, 'Consulting')}
                                        title="Mark In Room (Consulting)"
                                        className="w-8 h-8 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-all bg-white shadow-sm cursor-pointer"
                                      >
                                        <Play className="w-4 h-4 fill-emerald-600" />
                                      </button>
                                    )}

                                    {/* Mark No-Show */}
                                    {isWaiting && (
                                      <button
                                        onClick={() => handleUpdateStatus(p, 'No-Show')}
                                        title="Mark as No-Show"
                                        className="w-8 h-8 rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition-all bg-white shadow-sm cursor-pointer"
                                      >
                                        <UserMinus className="w-4 h-4" />
                                      </button>
                                    )}

                                    {/* Requeue if No-Show */}
                                    {isNoShow && (
                                      <button
                                        onClick={() => handleUpdateStatus(p, 'Waiting')}
                                        title="Requeue Patient"
                                        className="w-8 h-8 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all bg-white shadow-sm cursor-pointer"
                                      >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                      </button>
                                    )}

                                    {/* Delete / Remove Walk-in */}
                                    <button
                                      onClick={() => handleDelete(p)}
                                      title="Remove from Queue"
                                      className="w-8 h-8 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-300 flex items-center justify-center transition-all bg-white shadow-sm cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
                      <Users className="w-16 h-16 mb-4 opacity-20" />
                      <p className="font-bold text-lg text-slate-600">No active patients found</p>
                      <p className="text-xs text-slate-400 mt-1">{searchTerm ? 'Try adjusting your search query' : 'Use the intake panel on the left to register a new walk-in'}</p>
                    </div>
                  )}
                </div>
              </div>

            </>
          )}
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE 4: DOCTOR COMMAND CENTER
   ═══════════════════════════════════════════════════════════ */
function DoctorDashboard({ onBack }: { onBack: () => void }) {
  const [queue, setQueue] = useState<any[]>([]);
  const [avgTime, setAvgTime] = useState(15);
  const [globalDelay, setGlobalDelay] = useState(0);

  const [consultationStart, setConsultationStart] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const sync = () => {
      setQueue(JSON.parse(localStorage.getItem('hospital_queue') || '[]'));
      setAvgTime(parseInt(localStorage.getItem('current_avg_consultation') || '15', 10));
      setGlobalDelay(parseInt(localStorage.getItem('global_doctor_delay') || '0', 10));
    };
    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  useEffect(() => {
    let interval: any;
    if (consultationStart) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - consultationStart) / 60000));
      }, 1000); // 1s checks for demo feel
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [consultationStart]);

  const activeQueue = queue.filter(p => p.status !== 'No-Show');
  const currentPatient = activeQueue[0];
  const upcomingQueue = activeQueue.slice(0, 6);

  const handleStart = async () => {
    setConsultationStart(Date.now());
    if (activeQueue.length > 0) {
      const newQueue = [...queue];
      const targetIndex = newQueue.findIndex(q => q.id === activeQueue[0].id);
      if (targetIndex !== -1) {
        newQueue[targetIndex].status = 'Consulting';
        setLocalData('hospital_queue', JSON.stringify(newQueue));
        try {
        } catch (e) { }
      }
    }
  };

  const handleNextPatient = async (simulatedDuration?: number) => {
    const finalDuration = simulatedDuration || Math.max(1, elapsed);
    setLocalData('current_avg_consultation', finalDuration.toString());

    if (activeQueue.length > 0) {
      const completedPatient = activeQueue[0];

      try {
        const existingHistory = JSON.parse(localStorage.getItem('patient_history') || '[]');
      const newEntry = {
        id: Date.now(),
        patient_name: completedPatient.name,
        patient_type: completedPatient.type,
        doctor_name: DOCTORS.find(d => d.id === selectedDoctor)?.name || 'Dr. Arjun Mehta',
        completed_at: new Date().toISOString()
      };
      localStorage.setItem('patient_history', JSON.stringify([newEntry, ...existingHistory]));
      } catch (e) {
        console.warn("Could not write history log:", e);
      }

      const newQueue = queue.filter(q => q.id !== completedPatient.id);
      setLocalData('hospital_queue', JSON.stringify(newQueue));

      
    }
    setConsultationStart(null);
  };

  const addGlobalDelay = (mins: number) => {
    setLocalData('global_doctor_delay', (globalDelay + mins).toString());
  };

  return (
    <main className="max-w-7xl mx-auto px-8 py-8 w-full flex-1">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Live Command Center</h1>
          <p className="text-slate-500 mt-1 font-medium">Cardiology • Dr. Priya Sharma</p>
        </div>
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition-colors cursor-pointer text-sm">
          <ArrowLeft className="w-4 h-4" /> Exit Dashboard
        </button>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100/80">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-bold text-slate-500">Total Waiting</h3>
            <div className="w-8 h-8 rounded-lg bg-[#004b87]/10 flex items-center justify-center"><Users className="w-4 h-4 text-[#004b87]" /></div>
          </div>
          <p className="text-3xl font-extrabold text-[#004b87]">{queue.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100/80">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-bold text-slate-500">Avg. Consultation</h3>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${avgTime > 15 ? 'bg-amber-100' : 'bg-[#00a651]/10'}`}>
              <Activity className={`w-4 h-4 ${avgTime > 15 ? 'text-amber-600' : 'text-[#00a651]'}`} />
            </div>
          </div>
          <p className={`text-3xl font-extrabold ${avgTime > 15 ? 'text-amber-600' : 'text-slate-900'}`}>{avgTime}m</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
          <div className="relative z-10 flex justify-between items-start mb-4">
            <h3 className="text-sm font-bold text-slate-500">Shift Status</h3>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
              Live
            </div>
          </div>
          <p className="text-xl font-bold text-slate-800 relative z-10">Queue active</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Current Patient Card */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-slate-100/80 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#004b87] to-[#00a651]"></div>
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold tracking-widest uppercase rounded-md mb-3">Current Patient</span>
                {currentPatient ? (
                  <>
                    <h2 className="text-4xl font-extrabold text-slate-900 mb-2">{currentPatient.name}</h2>
                    <p className="text-lg text-slate-500 font-medium">Token: #{currentPatient.id} • {currentPatient.type}</p>
                  </>
                ) : (
                  <h2 className="text-2xl font-bold text-slate-400">Queue Empty</h2>
                )}
              </div>
              {currentPatient && (
                <div className="text-right">
                  <span className="block text-sm font-bold text-slate-400 mb-1">Elapsed Time</span>
                  <div className={`flex items-baseline gap-1 ${elapsed > 15 ? 'text-amber-600' : 'text-[#004b87]'}`}>
                    <Timer className="w-5 h-5 mr-1" />
                    <span className="text-4xl font-extrabold">{elapsed}</span><span className="text-xl font-bold">m</span>
                  </div>
                </div>
              )}
            </div>

            {currentPatient && (
              <div className="flex gap-4">
                {!consultationStart ? (
                  <button onClick={handleStart} className="flex-1 flex items-center justify-center gap-2 py-5 rounded-2xl bg-[#004b87] text-white font-bold text-lg shadow-[0_10px_30px_rgba(0,75,135,0.25)] hover:shadow-[0_15px_40px_rgba(0,75,135,0.35)] hover:-translate-y-0.5 transition-all cursor-pointer">
                    <Play className="w-5 h-5" /> Start Consultation
                  </button>
                ) : (
                  <button onClick={() => handleNextPatient(0)} className="flex-1 flex items-center justify-center gap-2 py-5 rounded-2xl bg-[#00a651] text-white font-bold text-lg shadow-[0_10px_30px_rgba(0,166,81,0.25)] hover:shadow-[0_15px_40px_rgba(0,166,81,0.35)] hover:-translate-y-0.5 transition-all cursor-pointer">
                    <CheckCircle2 className="w-5 h-5" /> Complete & Call Next
                  </button>
                )}
                {/* Demo winning button: Instantly simulate a 25 min long consultation to bump the average and show the ETA increase on the other tab */}
                <button onClick={() => handleNextPatient(25)} title="Test: Complete this patient taking 25 minutes!" className="px-6 py-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-2 transition-colors cursor-pointer border border-slate-200">
                  <SkipForward className="w-5 h-5" /> Simulate Long (25m)
                </button>
              </div>
            )}
          </div>

          {/* Live Queue Table */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_10px_40px_-5px_rgba(0,0,0,0.05)] border border-slate-100/80">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#004b87]" /> Live Queue
            </h3>
            {upcomingQueue.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Token</th>
                      <th className="pb-3 font-semibold">Name</th>
                      <th className="pb-3 font-semibold">Type</th>
                      <th className="pb-3 font-semibold">Sched.</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium">
                    {upcomingQueue.map((p, idx) => {
                      const isCurrent = p.id === currentPatient?.id;
                      return (
                        <tr key={p.id} className={`border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors ${isCurrent ? 'bg-emerald-50/30' : ''}`}>
                          <td className="py-4 text-[#004b87] font-bold">
                            #{p.id}
                            {isCurrent && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-widest animate-pulse">In Room</span>}
                          </td>
                          <td className="py-4 text-slate-700">{p.name}</td>
                          <td className="py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${p.type === 'Online' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                              {p.type}
                            </span>
                          </td>
                          <td className="py-4 text-slate-500">{p.scheduled}</td>
                          <td className="py-4 text-right">
                            {isCurrent ? (
                              <span className="text-xs font-bold text-emerald-600 px-3 py-1.5">—</span>
                            ) : (
                              <button onClick={() => addGlobalDelay(5)} className="text-xs font-bold text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-amber-200/50">
                                +5m Delay
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 font-medium">No upcoming patients in the queue.</p>
            )}
          </div>
        </div>

        {/* Chaos Control Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-white">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl z-0 pointer-events-none"></div>
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2 relative z-10 text-amber-400">
              <AlertCircle className="w-5 h-5" /> Chaos Control
            </h3>
            <p className="text-slate-400 text-sm mb-8 relative z-10">Global override settings. Changes instantly notify waiting patients.</p>

            <div className="space-y-4 relative z-10">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-300">Global Delay</span>
                  <span className="text-sm font-bold text-amber-400">+{globalDelay}m</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${Math.min(100, (globalDelay / 120) * 100)}%` }}></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => addGlobalDelay(15)} className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-bold transition-colors cursor-pointer">+15m</button>
                  <button onClick={() => setLocalData('global_doctor_delay', '0')} className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-bold transition-colors cursor-pointer">Reset</button>
                </div>
              </div>

              <button onClick={() => addGlobalDelay(30)} className="w-full py-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold flex items-center justify-center gap-2 border border-amber-500/30 transition-all cursor-pointer">
                Late Arrival (30m delay)
              </button>

              <button onClick={() => addGlobalDelay(60)} className="w-full py-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold flex items-center justify-center gap-2 border border-red-500/30 transition-all cursor-pointer">
                Emergency Break (60m delay)
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════
   RESCHEDULE MODAL
   ═══════════════════════════════════════════════════════════ */
function RescheduleModal({ appointment, onClose, onConfirm }: { appointment: any; onClose: () => void; onConfirm: (newTime: string) => void }) {
  const [time, setTime] = useState("");

  if (!appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-slate-800">Reschedule</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-slate-500 mb-6">Select a new time for your appointment with <span className="font-semibold text-slate-700">{appointment.doctor_name || "your doctor"}</span>.</p>

        <div className="mb-8">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Time Slot</label>
          <div className="relative flex items-center">
            <Clock className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full text-xl font-bold text-[#004b87] border-2 border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:border-[#004b87] focus:ring-4 focus:ring-[#004b87]/10 outline-none transition-all"
            />
          </div>
        </div>

        <button
          onClick={() => {
            if (time) {
              let [h, m] = time.split(':');
              let hours = parseInt(h);
              let ampm = hours >= 12 ? 'PM' : 'AM';
              hours = hours % 12;
              hours = hours ? hours : 12;
              const formattedTime = `${hours.toString().padStart(2, '0')}:${m} ${ampm}`;
              onConfirm(formattedTime);
            }
          }}
          disabled={!time}
          className="w-full py-3.5 rounded-xl font-bold text-white bg-[#004b87] hover:bg-[#003a6c] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          Confirm Reschedule
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE 3.1: PATIENT DASHBOARD
   ═══════════════════════════════════════════════════════════ */
function PatientDashboard({ phone, onNew, onTrack, onCancel, onReschedule, onLogout }: { phone: string; onNew: () => void; onTrack: (apt: any) => void; onCancel: (id: string) => void; onReschedule: (id: string) => void; onLogout: () => void }) {
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    const sync = () => {
      const q = JSON.parse(localStorage.getItem('hospital_queue') || '[]');
      const filtered = q.filter((p: any) => p.phone && p.phone.replace(/\D/g, '') === phone.replace(/\D/g, ''));
      setQueue(filtered);
    };
    sync();
    window.addEventListener('storage', sync);
    const interval = setInterval(sync, 2000);
    return () => { window.removeEventListener('storage', sync); clearInterval(interval); };
  }, [phone]);

  return (
    <main className="max-w-5xl mx-auto px-8 py-16" style={{ minHeight: "calc(100vh - 180px)" }}>
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">My Appointments</h1>
          <p className="text-slate-500 mt-2 font-medium flex items-center gap-2"><Lock className="w-4 h-4 text-emerald-500" /> Logged in securely as {phone || 'patient@mediqueue.com'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={onLogout} className="px-5 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm cursor-pointer">
            Sign Out
          </button>
          <button onClick={onNew} className="bg-[#004b87] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#003a6c] transition-all shadow-[0_10px_30px_rgba(0,75,135,0.2)] hover:shadow-[0_15px_40px_rgba(0,75,135,0.3)] hover:-translate-y-0.5 cursor-pointer">
            <CalendarDays className="w-5 h-5" /> Book Appointment
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {queue.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarDays className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No active appointments</h3>
            <p className="text-slate-400 mb-8 max-w-sm mx-auto">You don't have any upcoming visits booked. Your history and past visits are safely archived.</p>
            <button onClick={onNew} className="text-[#004b87] font-bold hover:underline flex items-center gap-1 justify-center mx-auto">Book your first appointment <ArrowRight className="w-4 h-4" /></button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {queue.map(apt => (
              <div key={apt.id} className="bg-white p-8 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 hover:border-[#004b87]/30 hover:shadow-[0_20px_60px_-15px_rgba(0,75,135,0.1)] transition-all flex flex-col justify-between group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#004b87] to-[#0073cc] rounded-2xl flex items-center justify-center text-white shadow-md shadow-[#004b87]/20">
                      <Stethoscope className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900">{apt.name} <span className="text-xs font-bold text-slate-400 ml-2 bg-slate-100 px-2 py-1 rounded">#{apt.id}</span></h2>
                      <p className="text-slate-500 font-medium mt-1">With <span className="text-slate-700 font-bold">{apt.doctor_name}</span></p>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Scheduled for</span>
                    <p className="text-base font-extrabold text-[#004b87]">{apt.scheduled}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onReschedule(apt.id)} className="p-2.5 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors cursor-pointer" title="Reschedule">
                      <Clock className="w-4 h-4" />
                    </button>
                    <button onClick={() => onCancel(apt.id)} className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer" title="Cancel Booking">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onTrack(apt)} className="text-sm font-bold text-white bg-[#00a651] hover:bg-[#009045] px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer group-hover:-translate-y-0.5 ml-1">
                      Track Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════ */
function Footer({ isDark }: { isDark?: boolean }) {
  return (
    <footer className={`border-t py-8 mt-auto ${isDark ? 'border-slate-900 bg-black' : 'border-slate-100 bg-white'}`}>
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center text-xs">
        <div className="flex items-center gap-2 mb-3 md:mb-0">
          <img src="/logo.png" alt="MediQueue Logo" className="w-5 h-5 object-contain rounded bg-black" />
          <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>MediQueue</span>
        </div>
        <p className={isDark ? 'text-slate-500' : 'text-slate-400'}>© 2026 MediQueue Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN APP — Page Router
   ═══════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState<"landing" | "patient-login" | "patient-dashboard" | "patient-flow" | "patient-tracker" | "staff-login" | "management-dashboard" | "doctor-login" | "doctor-dashboard">("landing");
  const [currentUserPhone, setCurrentUserPhone] = useState("");
  const [trackingAppointment, setTrackingAppointment] = useState<any>(null);

  useEffect(() => {
    initializeData();
  }, []);

  const goHome = () => setPage("landing");

  const [reschedulingAppointment, setReschedulingAppointment] = useState<any>(null);

  const handleCancelAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to completely cancel this appointment?")) return;
    const q = JSON.parse(localStorage.getItem('hospital_queue') || '[]');
    const nq = q.filter((x: any) => x.id !== id);

    localStorage.setItem('hospital_queue', JSON.stringify(nq));
    window.dispatchEvent(new Event('storage'));
    setPage('patient-dashboard');

    
  };

  const handleRescheduleAppointment = (id: string) => {
    const q = JSON.parse(localStorage.getItem('hospital_queue') || '[]');
    const apt = q.find((x: any) => x.id === id);
    if (apt) setReschedulingAppointment(apt);
  };

  const confirmReschedule = async (newTime: string) => {
    if (!reschedulingAppointment) return;
    const id = reschedulingAppointment.id;
    const q = JSON.parse(localStorage.getItem('hospital_queue') || '[]');
    const nq = q.map((x: any) => x.id === id ? { ...x, scheduled: newTime } : x);

    localStorage.setItem('hospital_queue', JSON.stringify(nq));
    window.dispatchEvent(new Event('storage'));

    if (trackingAppointment && trackingAppointment.id === id) {
      setTrackingAppointment({ ...trackingAppointment, scheduled: newTime });
    }
    setReschedulingAppointment(null);

    
  };

  const isDarkPage = ['landing', 'patient-login', 'staff-login', 'doctor-login'].includes(page);

  return (
    <div className={`min-h-screen ${isDarkPage ? 'bg-black text-white' : page === 'management-dashboard' ? 'bg-[#f4f7fb]' : 'bg-[#f8f9fc]'} font-sans ${isDarkPage ? 'selection:bg-[#00e599] selection:text-black' : 'selection:bg-[#004b87] selection:text-white'} flex flex-col`}>
      {page !== "management-dashboard" && <Navbar onLogoClick={goHome} isDark={isDarkPage} onNavigate={(p) => setPage(p as any)} />}

      {page === "landing" && <LandingPage onNavigate={(p) => setPage(p as any)} />}
      {page === "patient-login" && <PatientLoginPage onLogin={(phone) => { setCurrentUserPhone(phone); setPage("patient-dashboard"); }} onBack={goHome} />}
      {page === "patient-dashboard" && <PatientDashboard phone={currentUserPhone} onNew={() => setPage("patient-flow")} onTrack={(apt) => { setTrackingAppointment(apt); setPage("patient-tracker"); }} onCancel={handleCancelAppointment} onReschedule={handleRescheduleAppointment} onLogout={() => { setCurrentUserPhone(""); goHome(); }} />}
      {page === "patient-flow" && <PatientFlow initialPhone={currentUserPhone} onBackToHome={() => setPage("patient-dashboard")} onComplete={() => setPage("patient-dashboard")} />}
      {page === "patient-tracker" && <LiveTracker appointment={trackingAppointment} onBack={() => setPage("patient-dashboard")} onCancel={() => handleCancelAppointment(trackingAppointment.id)} onReschedule={() => handleRescheduleAppointment(trackingAppointment.id)} />}

      {/* If page is management-dashboard, do not render Navbar and Footer (they are handled internally or omitted) */}
      {page === "staff-login" && <StaffLoginPage onLogin={() => setPage("management-dashboard")} onBack={goHome} />}
      {page === "management-dashboard" && <ManagementDashboard onBack={goHome} />}

      {page === "doctor-login" && <DoctorLoginPage onLogin={() => setPage("doctor-dashboard")} onBack={goHome} />}
      {page === "doctor-dashboard" && <DoctorDashboard onBack={goHome} />}

      {page !== "management-dashboard" && <Footer isDark={isDarkPage} />}

      {/* Global Modals */}
      {reschedulingAppointment && (
        <RescheduleModal
          appointment={reschedulingAppointment}
          onClose={() => setReschedulingAppointment(null)}
          onConfirm={confirmReschedule}
        />
      )}
    </div>
  );
}
