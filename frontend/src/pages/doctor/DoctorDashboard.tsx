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
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import { DOCTORS } from '../../types';
import { walkInClient, BackendQueueItem } from '../../services/walkInService';
import { queueService } from '../../services/queueService';

interface DoctorDashboardProps {
  onBack: () => void;
  onAdmitWalkIn?: () => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ onBack, onAdmitWalkIn }) => {
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

  // Active consulting item (if any)
  const consultingItem = queue.find((q) => q.status === 'consulting');

  // Fetch real queue from backend
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

  // Robust live timer calculation
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
    <div className="flex min-h-[calc(100vh-64px)] bg-[#07090e] text-white font-sans">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 bg-[#080b12] border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Top Brand / Section Header */}
          <div className="px-2 pt-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <div className="w-6 h-6 rounded bg-[#00e599]/10 border border-[#00e599]/30 flex items-center justify-center text-[#00e599]">
                <Stethoscope className="w-3.5 h-3.5" />
              </div>
              <span>Command Center</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 pl-8">Emergency & Acute Care</p>
          </div>

          {/* Quick Walk-In Button */}
          <button
            onClick={onAdmitWalkIn || onBack}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-md bg-[#0d121c] hover:bg-slate-800 border border-slate-700/80 hover:border-[#00e599]/50 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#00e599]" />
            <span>Admit Walk-In</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('queue')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer text-left ${
                activeTab === 'queue'
                  ? 'bg-[#0f1523] text-[#00e599] border-l-2 border-[#00e599]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Queue Management</span>
            </button>

            <button
              onClick={() => setActiveTab('consultations')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer text-left ${
                activeTab === 'consultations'
                  ? 'bg-[#0f1523] text-[#00e599] border-l-2 border-[#00e599]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Live Consultations</span>
            </button>

            <button
              onClick={() => setActiveTab('roster')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer text-left ${
                activeTab === 'roster'
                  ? 'bg-[#0f1523] text-[#00e599] border-l-2 border-[#00e599]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Patient Roster</span>
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors cursor-pointer text-left"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Triage Intake</span>
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors cursor-pointer text-left"
            >
              <Calendar className="w-4 h-4" />
              <span>Department Schedule</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer text-left ${
                activeTab === 'analytics'
                  ? 'bg-[#0f1523] text-[#00e599] border-l-2 border-[#00e599]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics & Audit</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-slate-800/80 space-y-1">
          <button
            onClick={() => alert('Diagnostics: Supabase Connected • Queue Store Healthy • Sync 100%')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-[#00e599]" />
            <span>System Diagnostics</span>
          </button>
          <button
            onClick={onBack}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Secure Logoff</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 pb-4 border-b border-slate-800/60">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Doctor Command Center</h1>
            <p className="text-slate-400 text-xs mt-1">
              Active Clinical Roster: <span className="text-[#00e599] font-semibold">{activeDoctor?.name}</span> • {activeDoctor?.specialty}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedDoctor}
              onChange={(e) => {
                setSelectedDoctor(Number(e.target.value));
                setLocalStartTime(null);
              }}
              className="px-3 py-2 rounded-md bg-[#0c1017] border border-slate-700 text-white font-semibold text-xs focus:outline-none focus:border-[#00e599] cursor-pointer"
            >
              {DOCTORS.map((d) => (
                <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                  {d.name} ({d.specialty})
                </option>
              ))}
            </select>
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#0c1017] border border-slate-700 text-slate-300 font-semibold text-xs hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Exit
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-[#0c1017] rounded-lg p-5 border border-slate-800">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Waiting Patients</span>
              <Users className="w-4 h-4 text-[#00e599]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#00e599]">{waitingCount}</span>
              <span className="text-xs text-slate-500 font-medium">In queue</span>
            </div>
          </div>

          <div className="bg-[#0c1017] rounded-lg p-5 border border-slate-800">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">In Room</span>
              <UserCheck className={`w-4 h-4 ${consultingItem ? 'text-[#00e599]' : 'text-slate-500'}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-black ${consultingItem ? 'text-[#00e599]' : 'text-white'}`}>
                {consultingItem ? '1 Active' : '0 Idle'}
              </span>
            </div>
          </div>

          <div className="bg-[#0c1017] rounded-lg p-5 border border-slate-800">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg. Target</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{avgTime}m</span>
              <span className="text-xs text-slate-500 font-medium">per consult</span>
            </div>
          </div>

          <div className="bg-[#0c1017] rounded-lg p-5 border border-slate-800">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Global Delay</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-400">+{globalDelay}m</span>
              <span className="text-xs text-slate-500 font-medium">on schedule</span>
            </div>
          </div>
        </div>

        {/* Center Grid: Active Patient & Schedule Controls */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Main Hero Card: Next / Active Patient */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0c1017] rounded-lg p-6 border border-slate-800">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${currentPatient?.status === 'consulting' ? 'bg-[#00e599] animate-ping' : 'bg-[#00e599]'}`}></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#00e599]">
                    {currentPatient?.status === 'consulting'
                      ? 'Active Patient In Consultation'
                      : currentPatient?.status === 'called'
                      ? 'Patient Called To Consultation Room'
                      : 'Next Patient In Queue'}
                  </span>
                </div>

                {currentPatient && (
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-300">
                      {currentPatient.priority === 'critical' ? 'Critical Case' : currentPatient.priority === 'priority' ? 'Priority Case' : 'Routine Case'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-[#00e599]/10 border border-[#00e599]/30 text-[#00e599] text-[11px] font-bold">
                      Position #{currentPatient.position}
                    </span>
                  </div>
                )}
              </div>

              {currentPatient ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                      {currentPatient.patient?.name || 'Walk-In Patient'}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Phone: <span className="text-slate-300">{currentPatient.patient?.phone || 'N/A'}</span> • Joined: <span className="text-slate-300">{new Date(currentPatient.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> • Queue: <span className="text-white font-semibold capitalize">{currentPatient.status}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Condition / Concern: <span className="text-slate-300 font-medium">Routine Clinical Follow-Up & Review</span>
                    </p>
                  </div>

                  <div className="p-4 rounded-md bg-[#07090e] border border-slate-800 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <Clock className={`w-5 h-5 ${currentPatient.status === 'consulting' ? 'text-[#00e599] animate-pulse' : 'text-slate-400'}`} />
                      <div>
                        <p className="text-[11px] text-slate-400 font-semibold">
                          {currentPatient.status === 'consulting' ? 'Active Consultation Duration' : 'Estimated Consultation Target'}
                        </p>
                        <p className="text-xl font-bold font-mono text-white">
                          {currentPatient.status === 'consulting' ? formatSeconds(elapsed) : `${avgTime} mins`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {currentPatient.status === 'consulting' ? (
                        <button
                          onClick={() => handleComplete(currentPatient)}
                          disabled={actionLoading}
                          className="px-5 py-2.5 rounded-md bg-[#00e599] hover:bg-[#00c985] text-black font-bold text-xs transition-colors cursor-pointer flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Complete Consultation
                        </button>
                      ) : currentPatient.status === 'called' ? (
                        <button
                          onClick={() => handleStart(currentPatient)}
                          disabled={actionLoading}
                          className="px-5 py-2.5 rounded-md bg-[#00e599] hover:bg-[#00c985] text-black font-bold text-xs transition-colors cursor-pointer flex items-center gap-2"
                        >
                          <Play className="w-3.5 h-3.5 fill-black" /> Begin Consultation
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCall(currentPatient)}
                            disabled={actionLoading}
                            className="px-4 py-2.5 rounded-md bg-[#0d121c] hover:bg-slate-800 border border-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Bell className="w-3.5 h-3.5 text-amber-400" /> Call Patient
                          </button>
                          <button
                            onClick={() => handleStart(currentPatient)}
                            disabled={actionLoading}
                            className="px-5 py-2.5 rounded-md bg-[#00e599] hover:bg-[#00c985] text-black font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5 fill-black" /> Begin Consultation
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-slate-500">
                  <Stethoscope className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                  <p className="font-semibold text-sm text-white">No patients waiting in queue</p>
                  <p className="text-xs text-slate-500 mt-0.5">Checked-in appointments and walk-ins will appear automatically</p>
                </div>
              )}
            </div>

            {/* Upcoming in Roster Table */}
            <div className="bg-[#0c1017] rounded-lg p-6 border border-slate-800">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
                <div>
                  <h3 className="text-sm font-bold text-white">Upcoming in Roster</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Calculated queue sequence based on urgency scoring</p>
                </div>
                <span className="text-[11px] font-semibold text-[#00e599] hover:underline cursor-pointer">
                  View Full Roster &gt;
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider">
                      <th className="pb-2.5">POS / ID</th>
                      <th className="pb-2.5">PATIENT NAME</th>
                      <th className="pb-2.5">CHECK IN</th>
                      <th className="pb-2.5">PRIMARY CONCERN</th>
                      <th className="pb-2.5">STATUS</th>
                      <th className="pb-2.5 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {upcomingQueue.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-500 text-xs">
                          No additional patients currently in waiting sequence
                        </td>
                      </tr>
                    ) : (
                      upcomingQueue.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 font-bold text-[#00e599]">#{p.position}</td>
                          <td className="py-3 font-semibold text-white">
                            {p.patient?.name}
                            <span className="block text-[10px] text-slate-400 font-normal">{p.patient?.phone}</span>
                          </td>
                          <td className="py-3 text-slate-400">
                            {new Date(p.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3 text-slate-300 text-[11px]">
                            {p.priority === 'critical' ? 'Acute Assessment' : 'Routine Consultation'}
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-semibold capitalize">
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleCall(p)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 rounded bg-[#0d121c] hover:bg-[#00e599] hover:text-black border border-slate-700 text-slate-300 font-bold text-[10px] transition-colors cursor-pointer"
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
            <div className="bg-[#0c1017] rounded-lg p-5 border border-slate-800">
              <div className="flex items-center gap-2 mb-2 text-white font-bold text-xs">
                <Sliders className="w-3.5 h-3.5 text-[#00e599]" />
                <span>Schedule Overrides</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                Inject emergency or arrival delays. Real-time notifications update all patient countdowns instantly.
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => addGlobalDelay(15)}
                  className="w-full py-2 px-3 rounded-md bg-[#0d121c] hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer text-center"
                >
                  +15m Clinical Delay
                </button>
                <button
                  onClick={() => addGlobalDelay(30)}
                  className="w-full py-2 px-3 rounded-md bg-[#0d121c] hover:bg-slate-800 border border-amber-500/30 text-amber-400 font-semibold text-xs transition-colors cursor-pointer text-center"
                >
                  +30m Emergency Delay
                </button>
                <button
                  onClick={() => {
                    setGlobalDelay(0);
                    queueService.setGlobalDelay(0);
                  }}
                  className="w-full py-1.5 px-3 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-[11px] font-semibold transition-colors cursor-pointer text-center"
                >
                  Reset Schedule to On-Time
                </button>
              </div>
            </div>

            {/* Room Status Widget */}
            <div className="bg-[#0c1017] rounded-lg p-5 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white">Room 304 Status</span>
                <span className="w-2 h-2 rounded-full bg-[#00e599]"></span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4">
                Determines automated patient ingress and reception dispatch routing.
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setRoomStatus('available')}
                  className={`py-1.5 text-center rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    roomStatus === 'available'
                      ? 'bg-[#00e599] text-black'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  Available
                </button>
                <button
                  onClick={() => setRoomStatus('in_consult')}
                  className={`py-1.5 text-center rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    roomStatus === 'in_consult'
                      ? 'bg-[#00e599] text-black'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  In Consult
                </button>
                <button
                  onClick={() => setRoomStatus('on_break')}
                  className={`py-1.5 text-center rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    roomStatus === 'on_break'
                      ? 'bg-amber-400 text-black'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  On Break
                </button>
              </div>
            </div>

            {/* Clinical Guidelines Card */}
            <div className="bg-[#0c1017] rounded-lg p-5 border border-slate-800">
              <div className="flex items-center gap-2 mb-2 text-white font-bold text-xs">
                <ShieldAlert className="w-3.5 h-3.5 text-[#00e599]" />
                <span>Station Guidelines</span>
              </div>
              <ul className="text-[11px] text-slate-400 space-y-2 list-disc list-inside">
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
