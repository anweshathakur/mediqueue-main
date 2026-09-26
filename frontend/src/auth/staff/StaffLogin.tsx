import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft, ArrowRight, Building2, AlertCircle } from 'lucide-react';
import { authService } from '../authService';

interface StaffLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

export const StaffLogin: React.FC<StaffLoginProps> = ({ onSuccess, onBack }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
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
    try {
      if (mode === 'login') {
        await authService.loginStaff(email, password);
      } else {
        await authService.signupStaff(email, password, name);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#0b0d12] rounded-3xl p-8 md:p-10 shadow-2xl border border-slate-800/80 relative z-10 transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,229,153,0.12)]">
      
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 shadow-sm">
          <Building2 className="w-7 h-7 text-[#00e599]" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">
          {mode === 'login' ? 'Receptionist Portal' : 'Register Staff Account'}
        </h1>
        <p className="text-slate-400 text-xs font-medium">
          {mode === 'login' ? 'Hospital ER & Walk-In Intake Command Sign-In' : 'Authorize new front-desk intake staff'}
        </p>
      </div>

      {/* Mode Switch Tabs */}
      <div className="flex bg-slate-900/90 p-1 rounded-xl mb-6 border border-slate-800">
        <button
          type="button"
          onClick={() => { setMode('login'); setError(''); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'login' ? 'bg-[#00e599] text-black shadow' : 'text-slate-400 hover:text-white'}`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setMode('signup'); setError(''); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'signup' ? 'bg-[#00e599] text-black shadow' : 'text-slate-400 hover:text-white'}`}
        >
          Sign Up
        </button>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 flex items-center gap-2.5 shadow-sm animate-in fade-in duration-200">
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
          <label className="text-xs font-semibold text-slate-300 ml-1">Staff Email / Username</label>
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
          {loading ? 'Processing...' : mode === 'login' ? 'Enter Staff Portal' : 'Create Staff Account'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-slate-400">
          {mode === 'login' ? "Need staff account? " : "Already registered? "}
          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            className="text-[#00e599] font-bold hover:underline cursor-pointer ml-1"
          >
            {mode === 'login' ? 'Register Account' : 'Sign In'}
          </button>
        </p>
      </div>

      <div className="flex justify-center mt-6 pt-4 border-t border-slate-800/80">
        <button onClick={onBack} className="flex items-center gap-2 text-xs text-slate-400 font-semibold hover:text-[#00e599] transition-colors cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </button>
      </div>
    </div>
  );
};
