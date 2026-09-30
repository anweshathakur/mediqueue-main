import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft, Building2, AlertCircle, Sparkles } from 'lucide-react';
import { authService } from '../authService';
import { useTheme } from '../../context/ThemeContext';

interface StaffLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

export const StaffLogin: React.FC<StaffLoginProps> = ({ onSuccess, onBack }) => {
  const { isDark } = useTheme();
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
    <div className={`w-full max-w-md rounded-xl p-8 border font-sans shadow-lg transition-colors duration-200 ${
      isDark ? 'bg-[#0c1017] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center mb-6">
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center mb-3 ${
          isDark ? 'bg-[#00e599]/10 border-[#00e599]/30 text-[#00e599]' : 'bg-emerald-50 border-emerald-200 text-[#00c985]'
        }`}>
          <Building2 className="w-5 h-5" />
        </div>
        <h1 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {mode === 'login' ? 'Receptionist Desk Access' : 'Register Staff Account'}
        </h1>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {mode === 'login'
            ? 'Front desk walk-in intake & master queue orchestration'
            : 'Authorize new hospital reception staff'}
        </p>
      </div>

      {/* Mode Switch Tabs */}
      <div className={`flex p-1 rounded-lg mb-5 border text-xs font-semibold ${
        isDark ? 'bg-[#07090e] border-slate-800' : 'bg-slate-100 border-slate-200'
      }`}>
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setError('');
          }}
          className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
            mode === 'login' 
              ? 'bg-[#00c985] text-white font-bold shadow-xs' 
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
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
          className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
            mode === 'signup' 
              ? 'bg-[#00c985] text-white font-bold shadow-xs' 
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
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
          className={`w-full py-2 px-3 rounded-lg border font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 ${
            isDark 
              ? 'bg-[#0f1523] border-[#00e599]/30 text-[#00e599] hover:bg-[#00e599]/10' 
              : 'bg-emerald-50 border-emerald-200 text-[#009b62] hover:bg-emerald-100/70'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Auto-Fill Demo Staff Account
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-600 dark:text-red-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div className="space-y-1">
            <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Staff Name</label>
            <input
              type="text"
              placeholder="e.g. Pooja Verma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-xs font-medium focus:outline-none focus:border-[#00c985] ${
                isDark ? 'bg-[#07090e] border-slate-700 text-white placeholder:text-slate-600' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>
        )}

        <div className="space-y-1">
          <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Receptionist Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="email"
              placeholder="e.g. demo123@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full pl-9 pr-3.5 py-2.5 rounded-lg border text-xs font-medium focus:outline-none focus:border-[#00c985] ${
                isDark ? 'bg-[#07090e] border-slate-700 text-white placeholder:text-slate-600' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-9 pr-3.5 py-2.5 rounded-lg border text-xs font-medium focus:outline-none focus:border-[#00c985] ${
                isDark ? 'bg-[#07090e] border-slate-700 text-white placeholder:text-slate-600' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>
        </div>

        {mode === 'signup' && (
          <div className="space-y-1">
            <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-lg border text-xs font-medium focus:outline-none focus:border-[#00c985] ${
                  isDark ? 'bg-[#07090e] border-slate-700 text-white placeholder:text-slate-600' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-[#009b62] hover:bg-[#008754] text-white font-bold text-xs transition-colors cursor-pointer shadow-sm mt-2 disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : mode === 'login' ? 'Open Receptionist Desk' : 'Register Reception Account'}
        </button>
      </form>

      <div className={`mt-6 pt-4 border-t flex justify-center ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <button
          onClick={onBack}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
            isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Hospital Home
        </button>
      </div>
    </div>
  );
};
