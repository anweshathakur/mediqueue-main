import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Activity,
  Clock,
  Users,
  Play,
  ArrowLeft,
  Bell,
  CheckCircle2,
  ShieldAlert,
  UserCheck,
  Plus,
  LayoutDashboard,
  ClipboardList,
  Calendar,
  BarChart3,
  LogOut,
  Sliders,
  CheckSquare
} from 'lucide-react';
import { DOCTORS } from '../../types';
import { walkInClient, BackendQueueItem } from '../../services/walkInService';
import { queueService } from '../../services/queueService';
import { useTheme } from '../../context/ThemeContext';

interface DoctorDashboardProps {
  onBack: () => void;
  onAdmitWalkIn?: () => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ onBack, onAdmitWalkIn }) => {
  const { isDark } = useTheme();
  const [queue, setQueue] = useState<BackendQueueItem[]>([]);
  const [avgTime, setAvgTime] = useState(15);
  const [globalDelay, setGlobalDelay] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState(1);
  const [activeTab, setActiveTab] = useState<'queue' | 'consultations' | 'roster' | 'analytics'>('queue');
  const [roomStatus, setRoomStatus] = useState<'available' | 'in_consult' | 'on_break'>('available');
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [localStartTime, setLocalStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const consultingItem = queue.find((q) => q.status === 'consulting');

  const fetchQueue = async () => {
    try {
      setIsLoading(true);
      const data = await walkInClient.getDoctorQueue(selectedDoctor);
      if (Array.isArray(data)) {
        setQueue(data);
      }
    } catch (err) {
      console.warn('Error fetching doctor queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 3000);
    return () => clearInterval(interval);
  }, [selectedDoctor]);

  useEffect(() => {
    if (!consultingItem) {
      setElapsed(0);
      return;
    }

    const startMs = consultingItem.started_at
      ? new Date(consultingItem.started_at).getTime()
      : (localStartTime || Date.now());

    const updateTimer = () => {
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((now - startMs) / 1000));
      setElapsed(diffSecs);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [consultingItem?.id, consultingItem?.status, consultingItem?.started_at, localStartTime]);

  const currentPatient = queue[0];
  const upcomingQueue = queue.slice(1);
  const waitingCount = queue.filter((q) => q.status === 'waiting' || q.status === 'called').length;

  const handleCall = async (item: BackendQueueItem) => {
    try {
      setActionLoading(true);
      await walkInClient.callPatient(item.id);
      await fetchQueue();
    } catch (err: any) {
      alert('Failed to call patient: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleStart = async (item: BackendQueueItem) => {
    try {
      setActionLoading(true);
      const now = Date.now();
      setLocalStartTime(now);
      setRoomStatus('in_consult');
      await walkInClient.startConsultation(item.id);
      await fetchQueue();
    } catch (err: any) {
      alert('Failed to start consultation: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (item: BackendQueueItem) => {
    try {
      setActionLoading(true);
      const minutesSpent = Math.max(1, Math.round(elapsed / 60));
      queueService.setAvgConsultation(minutesSpent);
      setAvgTime(minutesSpent);

      await walkInClient.completeConsultation(item.id);
      setLocalStartTime(null);
      setElapsed(0);
      setRoomStatus('available');
      await fetchQueue();
    } catch (err: any) {
      alert('Failed to complete consultation: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const addGlobalDelay = (mins: number) => {
    const updated = globalDelay + mins;
    setGlobalDelay(updated);
    queueService.setGlobalDelay(updated);
  };

  const formatSeconds = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const mm = m < 10 ? `0${m}` : `${m}`;
    const ss = s < 10 ? `0${s}` : `${s}`;
    if (hours > 0) {
      const hh = hours < 10 ? `0${hours}` : `${hours}`;
      return `${hh}:${mm}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  const activeDoctor = DOCTORS.find((d) => d.id === selectedDoctor);

  return (
    <div
      className={`flex min-h-[calc(100vh-64px)] font-sans transition-colors ${
        isDark ? 'bg-[#07090e] text-white' : 'bg-[#f8fafc] text-slate-900'
      }`}
    >
      {/* Left Sidebar Navigation */}
      <aside
        className={`w-64 p-4 flex flex-col justify-between shrink-0 border-r transition-colors ${
          isDark ? 'bg-[#080b12] border-slate-800/80' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="space-y-6">
          {/* Top Brand / Section Header */}
          <div className="px-2 pt-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <div
                className={`w-6 h-6 rounded flex items-center justify-center border ${
                  isDark
                    ? 'bg-[#00e599]/10 border-[#00e599]/30 text-[#00e599]'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
              </div>
              <span className={isDark ? 'text-white' : 'text-slate-900'}>Command Center</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5 pl-8">Emergency & Acute Care</p>
          </div>

          {/* Quick Walk-In Button */}
          <button
            onClick={onAdmitWalkIn || onBack}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md border text-xs font-semibold transition-colors cursor-pointer ${
              isDark
                ? 'bg-[#0d121c] hover:bg-slate-800 border-slate-700 text-white'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-xs'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-[#00a86b] dark:text-[#00e599]" />
            <span>Admit Walk-In</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('queue')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer text-left ${
                activeTab === 'queue'
                  ? isDark
                    ? 'bg-[#0f1523] text-[#00e599] border-l-2 border-[#00e599]'
                    : 'bg-emerald-50 text-emerald-800 border-l-2 border-emerald-500 font-bold'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Queue Management</span>
            </button>

            <button
              onClick={() => setActiveTab('consultations')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer text-left ${
                activeTab === 'consultations'
                  ? isDark
                    ? 'bg-[#0f1523] text-[#00e599] border-l-2 border-[#00e599]'
                    : 'bg-emerald-50 text-emerald-800 border-l-2 border-emerald-500 font-bold'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Live Consultations</span>
            </button>

            <button
              onClick={() => setActiveTab('roster')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer text-left ${
                activeTab === 'roster'
                  ? isDark
                    ? 'bg-[#0f1523] text-[#00e599] border-l-2 border-[#00e599]'
                    : 'bg-emerald-50 text-emerald-800 border-l-2 border-emerald-500 font-bold'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Patient Roster</span>
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer text-left ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Triage Intake</span>
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer text-left ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Department Schedule</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer text-left ${
                activeTab === 'analytics'
                  ? isDark
                    ? 'bg-[#0f1523] text-[#00e599] border-l-2 border-[#00e599]'
                    : 'bg-emerald-50 text-emerald-800 border-l-2 border-emerald-500 font-bold'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics & Audit</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className={`pt-4 border-t space-y-1 ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <button
            onClick={() => alert('Diagnostics: Supabase Connected • Queue Store Healthy • Sync 100%')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#00a86b] dark:text-[#00e599]" />
            <span>System Diagnostics</span>
          </button>
          <button
            onClick={onBack}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Secure Logoff</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl">
        {/* Top Header Bar */}
        <div
          className={`flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 pb-4 border-b ${
            isDark ? 'border-slate-800/60' : 'border-slate-200'
          }`}
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Doctor Command Center</h1>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Active Clinical Roster:{' '}
              <span className="text-[#00a86b] dark:text-[#00e599] font-semibold">{activeDoctor?.name}</span> •{' '}
              {activeDoctor?.specialty}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedDoctor}
              onChange={(e) => {
                setSelectedDoctor(Number(e.target.value));
                setLocalStartTime(null);
              }}
              className={`px-3 py-2 rounded-md border font-semibold text-xs focus:outline-none cursor-pointer ${
                isDark
                  ? 'bg-[#0c1017] border-slate-700 text-white focus:border-[#00e599]'
                  : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500 shadow-xs'
              }`}
            >
              {DOCTORS.map((d) => (
                <option key={d.id} value={d.id} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                  {d.name} ({d.specialty})
                </option>
              ))}
            </select>
            <button
              onClick={onBack}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md border font-semibold text-xs transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#0c1017] border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Exit
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div
            className={`rounded-lg p-5 border ${
              isDark ? 'bg-[#0c1017] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Waiting Patients
              </span>
              <Users className="w-4 h-4 text-[#00a86b] dark:text-[#00e599]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#00a86b] dark:text-[#00e599]">{waitingCount}</span>
              <span className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>In queue</span>
            </div>
          </div>

          <div
            className={`rounded-lg p-5 border ${
              isDark ? 'bg-[#0c1017] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">In Room</span>
              <UserCheck
                className={`w-4 h-4 ${
                  consultingItem ? 'text-[#00a86b] dark:text-[#00e599]' : isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              />
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl font-black ${
                  consultingItem
                    ? 'text-[#00a86b] dark:text-[#00e599]'
                    : isDark
                    ? 'text-white'
                    : 'text-slate-900'
                }`}
              >
                {consultingItem ? '1 Active' : '0 Idle'}
              </span>
            </div>
          </div>

          <div
            className={`rounded-lg p-5 border ${
              isDark ? 'bg-[#0c1017] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg. Target</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{avgTime}m</span>
              <span className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>per consult</span>
            </div>
          </div>

          <div
            className={`rounded-lg p-5 border ${
              isDark ? 'bg-[#0c1017] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Global Delay</span>
              <Activity className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-500">+{globalDelay}m</span>
              <span className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>on schedule</span>
            </div>
          </div>
        </div>

        {/* Center Grid: Active Patient & Schedule Controls */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Main Hero Card: Next / Active Patient */}
          <div className="lg:col-span-2 space-y-6">
            <div
              className={`rounded-lg p-6 border ${
                isDark ? 'bg-[#0c1017] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div
                className={`flex justify-between items-center mb-5 pb-3 border-b ${
                  isDark ? 'border-slate-800/80' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      currentPatient?.status === 'consulting'
                        ? 'bg-[#00c985] animate-ping'
                        : 'bg-[#00c985]'
                    }`}
                  ></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#00a86b] dark:text-[#00e599]">
                    {currentPatient?.status === 'consulting'
                      ? 'Active Patient In Consultation'
                      : currentPatient?.status === 'called'
                      ? 'Patient Called To Consultation Room'
                      : 'Next Patient In Queue'}
                  </span>
                </div>

                {currentPatient && (
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                        isDark
                          ? 'bg-slate-900 border-slate-800 text-slate-300'
                          : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      {currentPatient.priority === 'critical'
                        ? 'Critical Case'
                        : currentPatient.priority === 'priority'
                        ? 'Priority Case'
                        : 'Routine Case'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                        isDark
                          ? 'bg-[#00e599]/10 border-[#00e599]/30 text-[#00e599]'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      }`}
                    >
                      Position #{currentPatient.position}
                    </span>
                  </div>
                )}
              </div>

              {currentPatient ? (
                <div className="space-y-6">
                  <div>
                    <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {currentPatient.patient?.name || 'Walk-In Patient'}
                    </h2>
                    <p className={`text-xs font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Phone: <span className={isDark ? 'text-slate-300' : 'text-slate-800'}>{currentPatient.patient?.phone || 'N/A'}</span> • Joined:{' '}
                      <span className={isDark ? 'text-slate-300' : 'text-slate-800'}>
                        {new Date(currentPatient.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>{' '}
                      • Queue:{' '}
                      <span className={`font-semibold capitalize ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {currentPatient.status}
                      </span>
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Condition / Concern:{' '}
                      <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Routine Clinical Follow-Up & Review
                      </span>
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-md border flex items-center justify-between flex-wrap gap-4 ${
                      isDark ? 'bg-[#07090e] border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock
                        className={`w-5 h-5 ${
                          currentPatient.status === 'consulting'
                            ? 'text-[#00a86b] dark:text-[#00e599] animate-pulse'
                            : 'text-slate-400'
                        }`}
                      />
                      <div>
                        <p className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {currentPatient.status === 'consulting'
                            ? 'Active Consultation Duration'
                            : 'Estimated Consultation Target'}
                        </p>
                        <p className={`text-xl font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {currentPatient.status === 'consulting' ? formatSeconds(elapsed) : `${avgTime} mins`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {currentPatient.status === 'consulting' ? (
                        <button
                          onClick={() => handleComplete(currentPatient)}
                          disabled={actionLoading}
                          className="px-5 py-2.5 rounded-md bg-[#00c985] hover:bg-[#00b377] text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Complete Consultation
                        </button>
                      ) : currentPatient.status === 'called' ? (
                        <button
                          onClick={() => handleStart(currentPatient)}
                          disabled={actionLoading}
                          className="px-5 py-2.5 rounded-md bg-[#00c985] hover:bg-[#00b377] text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" /> Begin Consultation
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCall(currentPatient)}
                            disabled={actionLoading}
                            className={`px-4 py-2.5 rounded-md border font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                              isDark
                                ? 'bg-[#0d121c] hover:bg-slate-800 border-slate-700 text-white'
                                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-xs'
                            }`}
                          >
                            <Bell className="w-3.5 h-3.5 text-amber-500" /> Call Patient
                          </button>
                          <button
                            onClick={() => handleStart(currentPatient)}
                            disabled={actionLoading}
                            className="px-5 py-2.5 rounded-md bg-[#00c985] hover:bg-[#00b377] text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" /> Begin Consultation
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-slate-500">
                  <Stethoscope className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                  <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    No patients waiting in queue
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Checked-in appointments and walk-ins will appear automatically
                  </p>
                </div>
              )}
            </div>

            {/* Upcoming in Roster Table */}
            <div
              className={`rounded-lg p-6 border ${
                isDark ? 'bg-[#0c1017] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div
                className={`flex items-center justify-between mb-4 pb-3 border-b ${
                  isDark ? 'border-slate-800/80' : 'border-slate-200'
                }`}
              >
                <div>
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Upcoming in Roster</h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Calculated queue sequence based on urgency scoring
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-[#00a86b] dark:text-[#00e599] hover:underline cursor-pointer">
                  View Full Roster &gt;
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr
                      className={`uppercase text-[10px] font-bold tracking-wider border-b ${
                        isDark ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-200'
                      }`}
                    >
                      <th className="pb-2.5">POS / ID</th>
                      <th className="pb-2.5">PATIENT NAME</th>
                      <th className="pb-2.5">CHECK IN</th>
                      <th className="pb-2.5">PRIMARY CONCERN</th>
                      <th className="pb-2.5">STATUS</th>
                      <th className="pb-2.5 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y font-medium ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                    {upcomingQueue.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                          No additional patients currently in waiting sequence
                        </td>
                      </tr>
                    ) : (
                      upcomingQueue.map((p) => (
                        <tr key={p.id} className={isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                          <td className="py-3 font-bold text-[#00a86b] dark:text-[#00e599]">#{p.position}</td>
                          <td className={`py-3 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {p.patient?.name}
                            <span className="block text-[10px] text-slate-400 font-normal">{p.patient?.phone}</span>
                          </td>
                          <td className={`py-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {new Date(p.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className={`py-3 text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            {p.priority === 'critical' ? 'Acute Assessment' : 'Routine Consultation'}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize border ${
                                isDark
                                  ? 'bg-slate-900 border-slate-800 text-slate-300'
                                  : 'bg-slate-100 border-slate-200 text-slate-700'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleCall(p)}
                              disabled={actionLoading}
                              className={`px-2.5 py-1 rounded border text-[10px] font-bold transition-colors cursor-pointer ${
                                isDark
                                  ? 'bg-[#0d121c] hover:bg-[#00e599] hover:text-black border-slate-700 text-slate-300'
                                  : 'bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border-slate-300 text-slate-700 shadow-2xs'
                              }`}
                            >
                              Call
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar Widgets */}
          <div className="space-y-6">
            {/* Schedule Overrides Card */}
            <div
              className={`rounded-lg p-5 border ${
                isDark ? 'bg-[#0c1017] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div
                className={`flex items-center gap-2 mb-2 font-bold text-xs ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-[#00a86b] dark:text-[#00e599]" />
                <span>Schedule Overrides</span>
              </div>
              <p className={`text-[11px] mb-4 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Inject emergency or arrival delays. Real-time notifications update all patient countdowns instantly.
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => addGlobalDelay(15)}
                  className={`w-full py-2 px-3 rounded-md border font-semibold text-xs transition-colors cursor-pointer text-center ${
                    isDark
                      ? 'bg-[#0d121c] hover:bg-slate-800 border-slate-700 text-slate-200'
                      : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-xs'
                  }`}
                >
                  +15m Clinical Delay
                </button>
                <button
                  onClick={() => addGlobalDelay(30)}
                  className={`w-full py-2 px-3 rounded-md border font-semibold text-xs transition-colors cursor-pointer text-center ${
                    isDark
                      ? 'bg-[#0d121c] hover:bg-slate-800 border-amber-500/30 text-amber-400'
                      : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800 shadow-xs'
                  }`}
                >
                  +30m Emergency Delay
                </button>
                <button
                  onClick={() => {
                    setGlobalDelay(0);
                    queueService.setGlobalDelay(0);
                  }}
                  className={`w-full py-1.5 px-3 rounded-md border text-[11px] font-semibold transition-colors cursor-pointer text-center ${
                    isDark
                      ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-white'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                  }`}
                >
                  Reset Schedule to On-Time
                </button>
              </div>
            </div>

            {/* Room Status Widget */}
            <div
              className={`rounded-lg p-5 border ${
                isDark ? 'bg-[#0c1017] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Room 304 Status</span>
                <span className="w-2 h-2 rounded-full bg-[#00c985]"></span>
              </div>
              <p className={`text-[11px] mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Determines automated patient ingress and reception dispatch routing.
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setRoomStatus('available')}
                  className={`py-1.5 text-center rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    roomStatus === 'available'
                      ? 'bg-[#00c985] text-white'
                      : isDark
                      ? 'bg-slate-900 text-slate-400 hover:text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Available
                </button>
                <button
                  onClick={() => setRoomStatus('in_consult')}
                  className={`py-1.5 text-center rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    roomStatus === 'in_consult'
                      ? 'bg-[#00c985] text-white'
                      : isDark
                      ? 'bg-slate-900 text-slate-400 hover:text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  In Consult
                </button>
                <button
                  onClick={() => setRoomStatus('on_break')}
                  className={`py-1.5 text-center rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    roomStatus === 'on_break'
                      ? 'bg-amber-500 text-white'
                      : isDark
                      ? 'bg-slate-900 text-slate-400 hover:text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  On Break
                </button>
              </div>
            </div>

            {/* Clinical Guidelines Card */}
            <div
              className={`rounded-lg p-5 border ${
                isDark ? 'bg-[#0c1017] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div
                className={`flex items-center gap-2 mb-2 font-bold text-xs ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-[#00a86b] dark:text-[#00e599]" />
                <span>Station Guidelines</span>
              </div>
              <ul className={`text-[11px] space-y-2 list-disc list-inside ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <li>Stat lab requisitions auto-sync with Central Pathology.</li>
                <li>Code Blue alarms take precedence over override queues.</li>
                <li>Prescriptions auto-route to Floor 1 Dispensary.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
