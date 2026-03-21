import React, { useState, useEffect } from "react";
import {
  Activity, ArrowRight, ArrowLeft, User, ClipboardList, Stethoscope, Clock, ShieldCheck, Clipboard, Phone, Building2, Check, CheckCircle2, Users, AlertTriangle, Lock, Mail, Play, StopCircle, SkipForward, AlertCircle, Timer, BarChart2, CalendarDays, Trash2, X, Bell, UserMinus
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { sendRealSMS } from './twilio';
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

import { supabase } from "./supabase";

function initializeData() {
  if (!localStorage.getItem('hospital_queue')) {
    localStorage.setItem('hospital_queue', JSON.stringify(INIT_QUEUE));
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

  // Sync upwards to Supabase seamlessly
  try {
    if (key === 'hospital_queue') {
      const q = JSON.parse(value);
      await supabase.from('hospital_queue').delete().neq('id', '0_impossible'); // delete all
      if (q.length > 0) await supabase.from('hospital_queue').insert(q);
    }
    if (key === 'current_avg_consultation' || key === 'global_doctor_delay') {
      const { data } = await supabase.from('app_state').select('singleton_id').single();
      if (data) {
        if (key === 'current_avg_consultation') {
          await supabase.from('app_state').update({ avg_time: parseInt(value) }).eq('singleton_id', data.singleton_id);
        } else {
          await supabase.from('app_state').update({ global_delay: parseInt(value) }).eq('singleton_id', data.singleton_id);
        }
      }
    }
  } catch (err) {
    console.warn("Supabase background sync silent error:", err);
  }
}

/* ═══════════════════════════════════════════════════════════
   NAVBAR (shared across all pages)
   ═══════════════════════════════════════════════════════════ */
function Navbar({ onLogoClick }: { onLogoClick: () => void }) {
  return (
    <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
      <button onClick={onLogoClick} className="flex items-center gap-2.5 cursor-pointer">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#004b87] to-[#00a651] flex items-center justify-center text-white font-bold text-lg shadow-lg">
          M
        </div>
        <span className="text-xl font-bold tracking-tight text-[#004b87]">MediQueue</span>
      </button>

    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE 1: LANDING PAGE
   ═══════════════════════════════════════════════════════════ */
function LandingPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <>
      <main className="max-w-7xl mx-auto px-8 w-full mt-12 md:mt-24 mb-32">
        {/* Hero */}
        <section className="flex flex-col items-center text-center max-w-4xl mx-auto mb-32 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#004b87]/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#00a651]/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-sm font-medium text-slate-600 mb-8">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00a651] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00a651]"></span>
            </span>
            Live Status: Operational
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004b87] to-[#0073cc]">Smart</span> Queue Management
          </h1>
          <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl leading-relaxed">
            Eliminate waiting room chaos. Our intelligent routing and prediction system brings seamless patient flow to modern healthcare facilities.
          </p>
        </section>

        {/* Cards */}
        <section className="grid md:grid-cols-3 gap-8 mb-40 relative z-10">
          {/* Patient Login */}
          <div
            onClick={() => onNavigate("patient-login")}
            className="group bg-white rounded-3xl p-8 border border-white transition-all duration-500 hover:-translate-y-3 cursor-pointer shadow-[0_10px_40px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_50px_-10px_rgba(0,75,135,0.15)] hover:border-[#004b87]/10 flex flex-col items-start relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-150 z-0"></div>
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-8 relative z-10 shadow-sm border border-blue-100">
              <User className="w-8 h-8 text-[#0073cc]" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3 relative z-10">Patient Login</h3>
            <p className="text-slate-500 mb-6 font-medium relative z-10">Book & Track</p>
            <p className="text-slate-600 mb-8 leading-relaxed relative z-10 hidden md:block">
              Empower patients with live queue updates, estimated wait times, and easy mobile check-ins.
            </p>
            <div className="mt-auto flex items-center text-[#0073cc] font-semibold relative z-10 group-hover:gap-2 transition-all">
              <span>Enter Portal</span>
              <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </div>
          </div>

          {/* Staff Login */}
          <div
            onClick={() => onNavigate("staff-login")}
            className="group bg-white rounded-3xl p-8 border border-slate-100 transition-all duration-500 hover:-translate-y-3 cursor-pointer shadow-[0_10px_40px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_50px_-10px_rgba(0,166,81,0.15)] flex flex-col items-start relative overflow-hidden md:-mt-8"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-150 z-0"></div>
            <div className="w-16 h-16 rounded-2xl bg-[#00a651]/10 flex items-center justify-center mb-8 relative z-10 shadow-sm border border-[#00a651]/20">
              <ClipboardList className="w-8 h-8 text-[#00a651]" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3 relative z-10">Receptionist Login</h3>
            <p className="text-slate-500 mb-6 font-medium relative z-10">Register Walk-ins</p>
            <p className="text-slate-600 mb-8 leading-relaxed relative z-10 hidden md:block">
              Rapid intake workflows for frontline staff to seamlessly add walk-in patients into the prediction algorithm.
            </p>
            <div className="mt-auto flex items-center text-[#00a651] font-semibold relative z-10 group-hover:gap-2 transition-all">
              <span>View Tools</span>
              <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </div>
          </div>

          {/* Doctor Dashboard */}
          <div
            onClick={() => onNavigate("doctor-login")}
            className="group bg-white rounded-3xl p-8 border border-white transition-all duration-500 hover:-translate-y-3 cursor-pointer shadow-[0_10px_40px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_50px_-10px_rgba(0,35,85,0.15)] hover:border-[#002355]/10 flex flex-col items-start relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-150 z-0"></div>
            <div className="w-16 h-16 rounded-2xl bg-[#002b5e]/5 flex items-center justify-center mb-8 relative z-10 shadow-sm border border-[#002b5e]/10">
              <Stethoscope className="w-8 h-8 text-[#002b5e]" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3 relative z-10">Doctor Dashboard</h3>
            <p className="text-slate-500 mb-6 font-medium relative z-10">Manage Queue</p>
            <p className="text-slate-600 mb-8 leading-relaxed relative z-10 hidden md:block">
              A bird's-eye view of your waiting room, enabling clinicians to prioritize urgent cases intuitively.
            </p>
            <div className="mt-auto flex items-center text-[#002b5e] font-semibold relative z-10 group-hover:gap-2 transition-all">
              <span>See Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-20 flex flex-col items-center">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How it Works</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Three simple steps to transform your clinic's patient experience.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center w-full max-w-5xl relative">
            <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent -z-10"></div>
            {[
              { icon: Clipboard, title: "Register", desc: "Patients book online or check-in at the front desk kiosks in seconds.", color: "#004b87", num: 1 },
              { icon: Activity, title: "Predict", desc: "Our AI algorithm calculates live exact wait times and notifies patients automatically.", color: "#00a651", num: 2 },
              { icon: ShieldCheck, title: "Consult", desc: "Doctors see patient info via the dashboard, ensuring a targeted and prompt consultation.", color: "#002b5e", num: 3 },
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center text-center max-w-xs relative bg-white p-6 rounded-3xl transition-transform hover:-translate-y-2 z-10">
                <div className="w-20 h-20 rounded-2xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex items-center justify-center mb-6 border border-slate-50 relative">
                  <div className="absolute -top-3 -right-3 w-8 h-8 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md" style={{ backgroundColor: s.color }}>{s.num}</div>
                  <s.icon className="w-10 h-10" style={{ color: s.color }} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">{s.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
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
      <div className="absolute left-0 top-0 bottom-0 flex items-center pr-2 border-r border-slate-200 bg-slate-50/50 rounded-l-xl z-10 w-[105px]">
        <select
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="w-full h-full pl-3 pr-6 py-3.5 bg-transparent text-sm text-slate-800 font-semibold focus:outline-none appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: "right 0.2rem center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "1.2em 1.2em",
          }}
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>
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
        className="w-full pl-[7.2rem] pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004b87]/30 focus:border-[#004b87] transition-all"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE 2: PATIENT LOGIN PAGE
   ═══════════════════════════════════════════════════════════ */
function PatientLoginPage({ onLogin, onBack }: { onLogin: (phone: string) => void; onBack: () => void }) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const isPhoneValid = phone.replace(/\D/g, "").length >= 10;
  const isOtpValid = otp.trim().length === 6;

  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (isPhoneValid) {
      setIsLoading(true);
      setErrorMsg("");
      const phoneNum = phone.replace(/\s+/g, '');
      const { error } = await supabase.auth.signInWithOtp({ phone: phoneNum });
      setIsLoading(false);

      if (error) {
        setErrorMsg("Failed to send code. Please try again.");
      } else {
        setStep("otp");
      }
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    setErrorMsg("");
    const phoneNum = phone.replace(/\s+/g, '');
    const { error } = await supabase.auth.verifyOtp({ phone: phoneNum, token: otp, type: 'sms' });
    setIsLoading(false);

    if (error) {
      setErrorMsg("Invalid OTP code. Please try again.");
    } else {
      onLogin(phoneNum);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-8 flex items-center justify-center" style={{ minHeight: "calc(100vh - 180px)" }}>
      <div className="relative w-full max-w-md">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#004b87]/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-[#00a651]/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="bg-white rounded-2xl p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100/80">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#004b87] to-[#0073cc] flex items-center justify-center shadow-md">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Patient Login</h2>
              <p className="text-sm text-slate-400">
                {step === "phone" ? "Access your queue & appointments" : "We've sent a code to your phone"}
              </p>
            </div>
          </div>

          <div className="w-full h-px bg-slate-100 my-6"></div>

          {step === "phone" ? (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Phone Number</label>
                <PhoneInput value={phone} onChange={(val) => { setPhone(val); setErrorMsg(""); }} />
                {errorMsg && <p className="text-red-500 text-xs font-semibold mt-2 text-center">{errorMsg}</p>}
              </div>

              <button
                onClick={handleSendOtp}
                disabled={!isPhoneValid || isLoading}
                className={`w-full mt-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${isPhoneValid
                  ? "bg-[#004b87] text-white shadow-[0_10px_30px_rgba(0,75,135,0.25)] hover:shadow-[0_15px_40px_rgba(0,75,135,0.35)] hover:-translate-y-0.5 cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
              >
                {isLoading ? "Sending..." : "Send OTP"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-semibold text-slate-600">6-Digit OTP</label>
                  <button onClick={() => setStep("phone")} className="text-xs text-[#004b87] font-semibold hover:underline cursor-pointer">Change Number</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setErrorMsg(""); }}
                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl border ${errorMsg ? 'border-red-400 ring-2 ring-red-400/20' : 'border-slate-200'} bg-slate-50/50 text-sm text-slate-800 tracking-widest placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004b87]/30 focus:border-[#004b87] transition-all text-center`}
                  />
                  {errorMsg && <p className="text-red-500 text-xs font-semibold mt-2 absolute -bottom-6 w-full text-center">{errorMsg}</p>}
                </div>
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={!isOtpValid || isLoading}
                className={`w-full mt-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${isOtpValid
                  ? "bg-[#00a651] text-white shadow-[0_10px_30px_rgba(0,166,81,0.25)] hover:shadow-[0_15px_40px_rgba(0,166,81,0.35)] hover:-translate-y-0.5 cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
              >
                {isLoading ? "Verifying..." : "Verify & Login"}
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div className="text-center mt-4">
                <button className="text-xs text-slate-500 font-medium hover:text-[#004b87] transition-colors cursor-pointer">
                  Resend OTP
                </button>
              </div>
            </div>
          )}

          {step === "phone" && (
            <p className="text-center text-sm text-slate-400 mt-6">
              New patient?{" "}
              <button onClick={() => onLogin(phone)} className="text-[#00a651] font-semibold hover:underline cursor-pointer">
                Register here
              </button>
            </p>
          )}
        </div>

        {/* Back to home */}
        <div className="flex justify-center mt-6">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 font-semibold hover:text-[#004b87] transition-colors cursor-pointer">
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
    supabase.from('hospital_queue').insert([newPatient]).then();

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

    // Direct Delivery: Execute Real Twilio SMS and local UI simulation simultaneously
    const smsMessage = `Your registration for patient ${newPatient.name} has been successfully registered. You are scheduled to see ${newPatient.doctor_name}, and your expected arrival time is ${computedETA}.`;

    sendRealSMS(newPatient.phone, smsMessage);

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
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (["reception", "admin"].includes(staffId.trim().toLowerCase()) && password === "1234") {
      sessionStorage.setItem("isAdmin", "true");
      onLogin();
    } else {
      setError("Invalid access. Please use ID: reception, Pass: 1234.");
    }
  };

  return (
    <main className="w-full flex-1 flex flex-col items-center justify-center py-16 px-4 relative">
      {/* Subtle Geometric Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#004b87 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

      <div className="w-full max-w-lg bg-white rounded-[2rem] p-12 shadow-2xl border border-slate-100 relative z-10 transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,75,135,0.15)]">

        <div className="flex flex-col items-center justify-center text-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 flex items-center justify-center mb-6 shadow-sm border border-emerald-100/50">
            <Building2 className="w-10 h-10 text-[#00a651]" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#004b87] tracking-tight mb-2">Receptionist Portal</h1>
          <p className="text-slate-500 font-medium">Hospital ER System Sign-in</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 shadow-sm animate-in fade-in zoom-in duration-300">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm font-bold text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 ml-1">Staff ID / Email</label>
            <div className="relative">
              <ClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. reception"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004b87]/30 focus:border-[#004b87] transition-all font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5 mb-8">
            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004b87]/30 focus:border-[#004b87] transition-all font-medium tracking-widest"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 mt-6 rounded-full bg-[#00a651] text-white font-extrabold text-lg hover:bg-emerald-600 transition-all shadow-[0_10px_30px_-5px_rgba(0,166,81,0.4)] hover:shadow-[0_15px_40px_-5px_rgba(0,166,81,0.5)] hover:-translate-y-1"
          >
            Enter Portal
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[250px] mx-auto">
            Access is restricted to authorized personnel. Session activity is strictly logged.
          </p>
        </div>
      </div>

      <div className="flex justify-center mt-8 relative z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 font-semibold hover:text-[#004b87] transition-colors cursor-pointer bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100">
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
  const [doctorId, setDoctorId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (doctorId && pin.length >= 4) {
      onLogin(); // Bypass actual auth for demo
    } else {
      setError("Please enter a valid Doctor ID and PIN.");
    }
  };

  return (
    <main className="max-w-md mx-auto px-8 pt-16 pb-20 w-full flex-1">
      <div className="bg-white rounded-3xl p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#004b87]/5 rounded-bl-full z-0 flex pointer-events-none"></div>
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-[#004b87]/10 flex items-center justify-center mb-8">
            <Stethoscope className="w-8 h-8 text-[#004b87]" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Doctor Portal</h1>
          <p className="text-slate-500 mb-8">Secure login for medical staff</p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 shadow-sm animate-in fade-in zoom-in duration-300">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm font-bold text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Doctor ID / Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. DR-10294"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004b87]/20 focus:border-[#004b87] transition-all font-medium"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Secure PIN</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004b87]/20 focus:border-[#004b87] transition-all font-medium tracking-widest"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-[#004b87] text-white font-bold text-lg hover:bg-[#003a6c] transition-colors shadow-[0_10px_30px_rgba(0,75,135,0.2)]"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 font-semibold hover:text-[#004b87] transition-colors cursor-pointer">
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
    const fetchHistory = async () => {
      const { data } = await supabase.from('patient_history').select('*');
      if (data) {
        const counts: Record<string, number> = {};
        // Initialize working hours
        ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].forEach(h => counts[h] = 0);

        data.forEach((row: any) => {
          const date = new Date(row.completed_at);
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
      }
    };

    fetchHistory();

    // Auto-refresh when someone completes
    const channel = supabase.channel('history-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'patient_history' }, () => {
        fetchHistory();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
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
    supabase.from('patient_history').select('*').order('completed_at', { ascending: false }).then(({ data }) => {
      if (data) setHistory(data);
    });
  }, []);

  const allPatients = [
    // Consulted Sequence
    ...history.map(h => ({
      id: `H-${h.id}`,
      name: h.patient_name,
      type: h.patient_type || 'Walk-in',
      doctor_name: h.doctor_name,
      displayStatus: 'Consulted'
    })),
    // Live Active Queue
    ...queue.map(q => ({
      id: q.id,
      name: q.name,
      type: q.type,
      doctor_name: q.doctor_name,
      displayStatus: q.status?.toLowerCase() === 'consulting' ? 'Consulting' : q.status === 'No-Show' ? 'No-Show' : q.scheduled,
      rawPatient: q
    }))
  ];

  const handleRequeue = async (p: any) => {
    const newQueue = queue.map(item => item.id === p.id ? { ...item, status: 'Waiting' } : item);
    setLocalData('hospital_queue', JSON.stringify(newQueue));
    try { await supabase.from('hospital_queue').update({ status: 'Waiting' }).eq('id', p.id); } catch (e) { }
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
                {allPatients.map(p => (
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

  // Intake Form
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [specialty, setSpecialty] = useState("General Medicine");
  const [assignedDoctor, setAssignedDoctor] = useState("Unassigned");
  const [priority, setPriority] = useState(false);

  const [flashSuccess, setFlashSuccess] = useState(false);

  // Mock database for auto-fill logic
  const PATIENT_DB: Record<string, { name: string, age: string }> = {
    "9876543210": { name: "Ravi Kumar", age: "45" },
    "9998887776": { name: "Ananya S.", age: "29" },
    "5551234567": { name: "John Doe", age: "33" },
  };

  useEffect(() => {
    const sync = () => {
      setQueue(JSON.parse(localStorage.getItem('hospital_queue') || '[]'));
    };
    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
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
      await sendRealSMS(p.phone, `MediQueue: Hi ${p.name}, please return to the waiting room. Your physician (${p.doctor_name || 'your doctor'}) is getting ready for you!`);
      alert(`Sent: Ping SMS text triggered to ${p.phone}`);
    }
  };

  const handleNoShow = async (p: any) => {
    const newQueue = queue.map(item => item.id === p.id ? { ...item, status: 'No-Show' } : item);
    setLocalData('hospital_queue', JSON.stringify(newQueue));
    try { await supabase.from('hospital_queue').update({ status: 'No-Show' }).eq('id', p.id); } catch (e) { }
  };

  const handleAddQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || phone.length < 10) return;

    // Auto increment Token ID
    const maxToken = queue.length > 0 ? Math.max(...queue.map(q => parseInt(q.id))) : 100;
    const newToken = maxToken + 1;

    const newPatient = {
      id: newToken.toString(),
      name,
      phone: phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3'), // formatted slightly
      type: 'Walk-in',
      scheduled: priority ? 'Immediate' : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Waiting',
      doctor_name: assignedDoctor
    };

    const newQueue = [...queue];
    if (priority) {
      if (newQueue.length > 0 && newQueue[0].status?.toLowerCase() === 'consulting') {
        newQueue.splice(1, 0, newPatient);
      } else {
        newQueue.unshift(newPatient);
      }
    } else {
      newQueue.push(newPatient);
    }

    setLocalData('hospital_queue', JSON.stringify(newQueue));
    try {
      await supabase.from('hospital_queue').insert({ ...newPatient, type: 'Walk-in' });
    } catch (e) { }

    setPhone("");
    setName("");
    setAge("");
    setPriority(false);
  };

  return (
    <div className="flex w-full min-h-screen bg-[#f4f7fb]">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-[#002b5e] text-white flex flex-col shadow-2xl z-20 sticky top-0 h-screen">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight leading-tight">Receptionist<br />Portal</h1>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button onClick={() => setTab('intake')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${tab === 'intake' ? 'bg-[#004b87] text-white shadow-inner border border-white/5' : 'text-slate-400 font-semibold hover:bg-white/5 hover:text-white cursor-pointer'}`}>
            <ClipboardList className={`w-5 h-5 ${tab === 'intake' ? 'text-emerald-400' : ''}`} /> Intake Management
          </button>
          <button onClick={() => setTab('all')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${tab === 'all' ? 'bg-[#004b87] text-white shadow-inner border border-white/5' : 'text-slate-400 font-semibold hover:bg-white/5 hover:text-white cursor-pointer'}`}>
            <Users className={`w-5 h-5 ${tab === 'all' ? 'text-emerald-400' : ''}`} /> All Patients
          </button>
          <button onClick={() => setTab('analytics')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${tab === 'analytics' ? 'bg-[#004b87] text-white shadow-inner border border-white/5' : 'text-slate-400 font-semibold hover:bg-white/5 hover:text-white cursor-pointer'}`}>
            <BarChart2 className={`w-5 h-5 ${tab === 'analytics' ? 'text-emerald-400' : ''}`} /> Analytics
          </button>
        </nav>

        <div className="p-4 mt-auto">
          <button onClick={onBack} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-bold transition-all border border-red-500/20">
            <Lock className="w-4 h-4" /> Secure Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white/70 backdrop-blur-2xl border-b border-slate-200/60 px-10 py-5 flex items-center justify-between z-10 sticky top-0 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Active Shift Overview</h2>
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

                  <div className="flex items-center gap-3 mb-8 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-[#004b87]/5 flex items-center justify-center text-[#004b87]">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-[#004b87]">Intake Registry</h3>
                      <p className="text-xs font-semibold text-slate-400">Quick Search & Add</p>
                    </div>
                  </div>

                  {flashSuccess && (
                    <div className="mb-6 p-3 bg-emerald-100 text-emerald-800 rounded-xl text-sm font-bold border border-emerald-200 flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
                      <CheckCircle2 className="w-5 h-5" /> Patient recognized and auto-filled!
                    </div>
                  )}

                  <form onSubmit={handleAddQueue} className="space-y-5 relative z-10">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Search</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#004b87]/40" />
                        <input
                          type="text"
                          placeholder="10-digit number"
                          maxLength={10}
                          value={phone}
                          onChange={handlePhoneChange}
                          className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004b87]/30 transition-all font-bold tracking-widest"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Patient Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004b87]/30 transition-all font-semibold"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Age</label>
                        <input
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004b87]/30 transition-all font-semibold"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Department</label>
                        <select
                          value={specialty}
                          onChange={(e) => setSpecialty(e.target.value)}
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004b87]/30 font-semibold appearance-none"
                        >
                          {DEPARTMENTS.map(dept => <option key={dept}>{dept}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Doctor Assigned</label>
                        <select
                          value={assignedDoctor}
                          onChange={(e) => setAssignedDoctor(e.target.value)}
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004b87]/30 font-semibold appearance-none"
                        >
                          <option>Dr. Priya Sharma</option>
                          <option>Dr. Rohan Kapoor</option>
                          <option>Dr. Anil Desai</option>
                          <option>Unassigned</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <label className="relative flex cursor-pointer items-center rounded-full p-2" htmlFor="priority-checkbox">
                        <input type="checkbox" id="priority-checkbox" checked={priority} onChange={(e) => setPriority(e.target.checked)} className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-red-500 before:opacity-0 before:transition-opacity checked:border-red-500 checked:bg-red-500 checked:before:bg-red-500 hover:before:opacity-10" />
                        <span className="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100"><Check className="h-3.5 w-3.5" strokeWidth={3} /></span>
                      </label>
                      <div>
                        <span className="text-sm font-bold text-slate-700">Priority: Critical</span>
                        <p className="text-[10px] text-slate-400 font-semibold leading-tight mt-0.5">Bypass standard queue logic and insert at front.</p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!name || phone.length < 10}
                      className="w-full py-4 mt-4 rounded-xl bg-[#00a651] disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none text-white font-extrabold text-lg transition-all shadow-[0_10px_30px_-5px_rgba(0,166,81,0.4)] hover:shadow-[0_15px_40px_-5px_rgba(0,166,81,0.5)] hover:-translate-y-1 active:translate-y-0 flex justify-center items-center gap-2"
                    >
                      <Clipboard className="w-5 h-5" /> Add to Queue
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Live Queue */}
              <div className="lg:col-span-8">
                <div className="bg-white rounded-3xl p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#00a651]/10 flex items-center justify-center text-[#00a651]">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-[#004b87]">Live Master Queue</h3>
                        <p className="text-xs font-semibold text-slate-400">Linked to localStorage</p>
                      </div>
                    </div>
                    <div className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold border border-slate-200 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-500 animate-pulse" /> {queue.length} Total Waiting
                    </div>
                  </div>

                  {queue.length > 0 ? (
                    <div className="overflow-x-auto flex-1">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <th className="pb-4 pl-2 font-semibold w-24">Token</th>
                            <th className="pb-4 font-semibold">Patient Name</th>
                            <th className="pb-4 font-semibold">Phone Mask</th>
                            <th className="pb-4 font-semibold">Source</th>
                            <th className="pb-4 font-semibold">Doctor</th>
                            <th className="pb-4 font-semibold text-right pr-2">Action</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm font-medium">
                          {queue.map((p, idx) => {
                            const isConsulting = p.status?.toLowerCase() === 'consulting';
                            return (
                              <tr key={p.id} className={`border-b border-slate-50 last:border-0 transition-colors ${isConsulting ? 'bg-emerald-50/20' : 'hover:bg-slate-50/50'}`}>
                                <td className="py-4 pl-2">
                                  <span className={`inline-flex items-center justify-center min-w-[3.5rem] px-2 py-1 rounded text-sm font-extrabold ${isConsulting ? 'bg-emerald-100 text-emerald-800' : 'bg-[#004b87]/10 text-[#004b87]'}`}>
                                    #{p.id}
                                  </span>
                                  {isConsulting && <span className="block mt-1 text-[10px] uppercase font-bold text-emerald-600 animate-pulse text-center">In Room</span>}
                                </td>
                                <td className="py-4 text-slate-800 font-bold">{p.name}</td>
                                <td className="py-4 text-slate-400 font-mono text-xs">{p.phone || 'xxx-xxx-xxxx'}</td>
                                <td className="py-4">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-extrabold tracking-wide ${p.type === 'Online' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                    {p.type}
                                  </span>
                                </td>
                                <td className="py-4">
                                  <span className="text-slate-600 font-semibold text-xs">{p.doctor_name || 'Unassigned'}</span>
                                </td>
                                <td className="py-4 text-right pr-2">
                                  {isConsulting ? (
                                    <span className="text-xs font-bold text-emerald-600 px-4 py-2 opacity-50">Consulting</span>
                                  ) : p.status === 'No-Show' ? (
                                    <span className="text-xs font-bold text-red-500 px-4 py-2 opacity-50">No-Show</span>
                                  ) : (
                                    <div className="flex justify-end items-center gap-1.5">
                                      <span className="text-xs font-bold text-[#004b87] bg-[#004b87]/5 border border-[#004b87]/10 px-3 py-1.5 rounded-full tracking-widest">{p.scheduled}</span>
                                      <button onClick={() => handlePing(p)} title="Ping via SMS" className="ml-2 w-8 h-8 rounded-full border border-slate-200 text-amber-500 hover:bg-amber-50 hover:border-amber-200 flex items-center justify-center transition-all bg-white shadow-sm cursor-pointer hover:shadow">
                                        <Bell className="w-4 h-4" />
                                      </button>
                                      <button onClick={() => handleNoShow(p)} title="Mark No-Show" className="w-8 h-8 rounded-full border border-slate-200 text-red-400 hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition-all bg-white shadow-sm cursor-pointer hover:shadow">
                                        <UserMinus className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                      <Users className="w-16 h-16 mb-4 opacity-20" />
                      <p className="font-semibold text-lg">No active queue.</p>
                      <p className="text-sm">Use the Intake Registry to add walk-ins.</p>
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
          await supabase.from('hospital_queue').update({ status: 'Consulting' }).eq('id', activeQueue[0].id);
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
        await supabase.from('patient_history').insert({
          patient_name: completedPatient.name,
          doctor_name: completedPatient.doctor_name || 'Dr. Priya Sharma',
          patient_type: completedPatient.type
        });
      } catch (e) {
        console.warn("Could not write history log:", e);
      }

      const newQueue = queue.filter(q => q.id !== completedPatient.id);
      setLocalData('hospital_queue', JSON.stringify(newQueue));

      try { await supabase.from('hospital_queue').delete().eq('id', completedPatient.id); } catch (e) { }
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
          <p className="text-slate-500 mt-2 font-medium flex items-center gap-2"><Lock className="w-4 h-4 text-emerald-500" /> Logged in securely as {phone}</p>
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
function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center text-slate-400 text-xs">
        <div className="flex items-center gap-2 mb-3 md:mb-0">
          <div className="w-5 h-5 rounded bg-slate-300 flex items-center justify-center text-white font-bold text-[10px]">M</div>
          <span className="font-semibold text-slate-500">MediQueue</span>
        </div>
        <p>© 2026 MediQueue Inc. All rights reserved.</p>
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

    // Set up Realtime Bi-directional Sync with App
    let ignoreNextEvent = false;

    const pullFromDb = async () => {
      ignoreNextEvent = true;
      try {
        const { data: q } = await supabase.from('hospital_queue').select('*');
        if (q) localStorage.setItem('hospital_queue', JSON.stringify(q));

        const { data: s } = await supabase.from('app_state').select('*').single();
        if (s) {
          localStorage.setItem('current_avg_consultation', s.avg_time.toString());
          localStorage.setItem('global_doctor_delay', s.global_delay.toString());
        }
        window.dispatchEvent(new Event('storage'));
      } catch (err) { }
      setTimeout(() => { ignoreNextEvent = false; }, 800);
    };

    pullFromDb();

    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hospital_queue' }, () => {
        if (!ignoreNextEvent) pullFromDb();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_state' }, () => {
        if (!ignoreNextEvent) pullFromDb();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

    try { await supabase.from('hospital_queue').delete().eq('id', id); } catch (e) { }
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

    try { await supabase.from('hospital_queue').update({ scheduled: newTime }).eq('id', id); } catch (e) { }
  };

  return (
    <div className={`min-h-screen ${page === 'management-dashboard' ? 'bg-[#f4f7fb]' : 'bg-[#f8f9fc]'} font-sans selection:bg-[#004b87] selection:text-white flex flex-col`}>
      {page !== "management-dashboard" && <Navbar onLogoClick={goHome} />}

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

      {page !== "management-dashboard" && <Footer />}

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
