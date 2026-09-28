import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft, User, AlertCircle, Sparkles } from 'lucide-react';
import { authService } from '../authService';

interface PatientLoginProps {
  onSuccess: (email: string) => void;
  onBack: () => void;
}

export const PatientLogin: React.FC<PatientLoginProps> = ({ onSuccess, onBack }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fillDemo = () => {
    setEmail('demo123@gmail.com');
    setPassword('demo@123');
    setError('');
  };

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
        await authService.loginPatient(email, password);
      } else {
        await authService.signupPatient(email, password, name);
      }
      onSuccess(email);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#0c1017] rounded-lg p-8 border border-slate-800 shadow-2xl font-sans">
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center mb-6">
        <div className="w-10 h-10 rounded-md bg-[#00e599]/10 border border-[#00e599]/30 flex items-center justify-center mb-3 text-[#00e599]">
          <User className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          {mode === 'login' ? 'Patient Portal Sign In' : 'Create Patient Account'}
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          {mode === 'login'
            ? 'Access appointments, live queue status, and doctor telemetry'
            : 'Register to manage bookings & track consultation queues'}
        </p>
      </div>

      {/* Mode Switch Tabs */}
      <div className="flex bg-[#07090e] p-1 rounded-md mb-5 border border-slate-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setError('');
          }}
          className={`flex-1 py-1.5 rounded transition-colors cursor-pointer ${
            mode === 'login' ? 'bg-[#00e599] text-black font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signup');
            setError('');
          }}
          className={`flex-1 py-1.5 rounded transition-colors cursor-pointer ${
            mode === 'signup' ? 'bg-[#00e599] text-black font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Quick Demo Fill Button */}
      <div className="mb-5">
        <button
          type="button"
          onClick={fillDemo}
          className="w-full py-2 px-3 rounded-md bg-[#0f1523] border border-[#00e599]/30 text-[#00e599] font-bold text-xs hover:bg-[#00e599]/10 transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5" /> Auto-Fill Demo Patient Account
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-950/40 border border-red-800/60 flex items-center gap-2 text-red-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-md border border-slate-700 bg-[#07090e] text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00e599] text-xs font-medium"
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="email"
              placeholder="e.g. demo123@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-md border border-slate-700 bg-[#07090e] text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00e599] text-xs font-medium"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-md border border-slate-700 bg-[#07090e] text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00e599] text-xs font-medium"
              required
            />
          </div>
        </div>

        {mode === 'signup' && (
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-md border border-slate-700 bg-[#07090e] text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00e599] text-xs font-medium"
                required
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 mt-2 rounded-md bg-[#00e599] hover:bg-[#00c985] disabled:bg-slate-800 disabled:text-slate-500 text-black font-bold text-xs transition-colors cursor-pointer flex justify-center items-center"
        >
          {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Portal' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Platform
        </button>
      </div>
    </div>
  );
};
