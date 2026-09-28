import React, { useState, useEffect } from 'react';
import { Stethoscope, Activity, Clock, Users, Play, AlertCircle, ArrowLeft, Bell, CheckCircle2, ShieldAlert, UserCheck } from 'lucide-react';
import { DOCTORS } from '../../types';
import { walkInClient, BackendQueueItem } from '../../services/walkInService';
import { queueService } from '../../services/queueService';

interface DoctorDashboardProps {
  onBack: () => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ onBack }) => {
  const [queue, setQueue] = useState<BackendQueueItem[]>([]);
  const [avgTime, setAvgTime] = useState(15);
  const [globalDelay, setGlobalDelay] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [localStartTime, setLocalStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  // Active consulting item (if any)
  const consultingItem = queue.find(q => q.status === 'consulting');

  // Fetch real queue from backend
  const fetchQueue = async () => {
    try {
      setIsLoading(true);
      const data = await walkInClient.getDoctorQueue(selectedDoctor);
      if (Array.isArray(data)) {
        setQueue(data);
      }
    } catch (err) {
      console.warn("Error fetching doctor queue:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 3000);
    return () => clearInterval(interval);
  }, [selectedDoctor]);

  // Robust live timer calculation based on backend started_at or local start
  useEffect(() => {
    if (!consultingItem) {
      setElapsed(0);
      return;
    }

    // Determine the true start timestamp
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

  // Current patient is the first active (consulting/called/waiting)
  const currentPatient = queue[0];
  const upcomingQueue = queue.slice(1);
  const waitingCount = queue.filter(q => q.status === 'waiting' || q.status === 'called').length;

  // Action: Call Next Patient (waiting -> called)
  const handleCall = async (item: BackendQueueItem) => {
    try {
      setActionLoading(true);
      await walkInClient.callPatient(item.id);
      await fetchQueue();
    } catch (err: any) {
      alert("Failed to call patient: " + (err.message || "Unknown error"));
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Start Consultation (called/waiting -> consulting)
  const handleStart = async (item: BackendQueueItem) => {
    try {
      setActionLoading(true);
      const now = Date.now();
      setLocalStartTime(now);
      await walkInClient.startConsultation(item.id);
      await fetchQueue();
    } catch (err: any) {
      alert("Failed to start consultation: " + (err.message || "Unknown error"));
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Complete Consultation (consulting -> completed)
  const handleComplete = async (item: BackendQueueItem) => {
    try {
      setActionLoading(true);
      const minutesSpent = Math.max(1, Math.round(elapsed / 60));
      queueService.setAvgConsultation(minutesSpent);
      setAvgTime(minutesSpent);

      await walkInClient.completeConsultation(item.id);
      setLocalStartTime(null);
      setElapsed(0);
      await fetchQueue();
    } catch (err: any) {
      alert("Failed to complete consultation: " + (err.message || "Unknown error"));
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

  return (
    <main className="max-w-7xl mx-auto px-8 py-12 relative z-10 bg-black text-white min-h-screen">
      {/* Background Grid Pattern */}
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

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Doctor Command Center</h1>
          <p className="text-slate-400 mt-1 text-sm font-medium">
            Active Clinical Roster: <span className="text-[#00e599] font-bold">{DOCTORS.find(d => d.id === selectedDoctor)?.name}</span> • {DOCTORS.find(d => d.id === selectedDoctor)?.specialty}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedDoctor}
            onChange={(e) => {
              setSelectedDoctor(Number(e.target.value));
              setLocalStartTime(null);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#131720] border border-slate-800 text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#00e599]/30 cursor-pointer"
          >
            {DOCTORS.map(d => <option key={d.id} value={d.id} className="bg-slate-900">{d.name} ({d.specialty})</option>)}
          </select>
          <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#131720] border border-slate-800 text-slate-300 font-semibold hover:bg-slate-800 transition-colors cursor-pointer text-xs">
            <ArrowLeft className="w-4 h-4" /> Exit
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 relative z-10">
        <div className="bg-[#0b0d12] rounded-2xl p-6 border border-slate-800/80 shadow-2xl">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Waiting Patients</h3>
            <div className="w-8 h-8 rounded-lg bg-[#00e599]/10 flex items-center justify-center text-[#00e599]"><Users className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-extrabold text-[#00e599]">{waitingCount}</p>
        </div>

        <div className="bg-[#0b0d12] rounded-2xl p-6 border border-slate-800/80 shadow-2xl">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">In Room</h3>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${consultingItem ? 'bg-emerald-500/20 text-[#00e599]' : 'bg-slate-800 text-slate-400'}`}>
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-3xl font-extrabold ${consultingItem ? 'text-[#00e599]' : 'text-slate-500'}`}>
            {consultingItem ? '1 Active' : '0 Idle'}
          </p>
        </div>

        <div className="bg-[#0b0d12] rounded-2xl p-6 border border-slate-800/80 shadow-2xl">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg. Target</h3>
            <div className="w-8 h-8 rounded-lg bg-[#131720] flex items-center justify-center text-slate-300"><Clock className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-extrabold text-white">{avgTime}m</p>
        </div>

        <div className="bg-[#0b0d12] rounded-2xl p-6 border border-slate-800/80 shadow-2xl">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Delay</h3>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400"><Activity className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-extrabold text-amber-400">+{globalDelay}m</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8 relative z-10">
        <div className="lg:col-span-2 space-y-6">
          {/* Active / Current Patient Hero Card */}
          <div className="bg-[#0b0d12] rounded-3xl p-8 border border-slate-800/80 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#00e599] flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${currentPatient?.status === 'consulting' ? 'bg-[#00e599] animate-ping' : 'bg-[#00e599]'}`}></span>
                {currentPatient?.status === 'consulting'
                  ? 'Active Patient In Consultation'
                  : currentPatient?.status === 'called'
                  ? 'Patient Called to Consultation Room'
                  : 'Next Patient in Queue'}
              </span>

              {currentPatient && (
                <div className="flex items-center gap-2">
                  {currentPatient.priority === 'critical' ? (
                    <span className="px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-400 text-xs font-extrabold flex items-center gap-1.5 animate-pulse">
                      <ShieldAlert className="w-3.5 h-3.5" /> Critical
                    </span>
                  ) : currentPatient.priority === 'priority' ? (
                    <span className="px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-400 text-xs font-extrabold">
                      Priority
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold">
                      Normal
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[#00e599] text-xs font-extrabold">
                    Position #{currentPatient.position}
                  </span>
                </div>
              )}
            </div>

            {currentPatient ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-extrabold text-white">{currentPatient.patient?.name || 'Walk-In Patient'}</h2>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    Phone: {currentPatient.patient?.phone || 'N/A'} • Joined: {new Date(currentPatient.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Status: <span className="text-white font-bold capitalize">{currentPatient.status}</span>
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#131720] border border-slate-800 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <Clock className={`w-7 h-7 ${currentPatient.status === 'consulting' ? 'text-[#00e599] animate-pulse' : 'text-slate-400'}`} />
                    <div>
                      <p className="text-xs text-slate-400 font-bold">
                        {currentPatient.status === 'consulting' ? 'Live Consultation Timer' : 'Estimated Consultation Target'}
                      </p>
                      <p className={`text-3xl font-black font-mono tracking-tight ${currentPatient.status === 'consulting' ? 'text-[#00e599]' : 'text-white'}`}>
                        {currentPatient.status === 'consulting' ? formatSeconds(elapsed) : `${avgTime} mins`}
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Action Buttons */}
                  <div className="flex items-center gap-2">
                    {currentPatient.status === 'consulting' ? (
                      <button
                        onClick={() => handleComplete(currentPatient)}
                        disabled={actionLoading}
                        className="px-6 py-3 rounded-xl bg-[#00e599] hover:bg-[#00c985] text-black font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(0,229,153,0.25)] cursor-pointer flex items-center gap-2 active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Complete Consultation
                      </button>
                    ) : currentPatient.status === 'called' ? (
                      <button
                        onClick={() => handleStart(currentPatient)}
                        disabled={actionLoading}
                        className="px-6 py-3 rounded-xl bg-[#00e599] hover:bg-[#00c985] text-black font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(0,229,153,0.25)] cursor-pointer flex items-center gap-2 active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" /> Begin Consultation
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCall(currentPatient)}
                          disabled={actionLoading}
                          className="px-5 py-3 rounded-xl bg-[#131720] hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                        >
                          <Bell className="w-3.5 h-3.5 text-amber-400" /> Call Patient
                        </button>
                        <button
                          onClick={() => handleStart(currentPatient)}
                          disabled={actionLoading}
                          className="px-6 py-3 rounded-xl bg-[#00e599] hover:bg-[#00c985] text-black font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(0,229,153,0.25)] cursor-pointer flex items-center gap-1.5 active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 fill-black" /> Begin Consultation
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-bold text-white">No patients waiting in queue</p>
                <p className="text-xs text-slate-400 mt-1">Walk-in or scheduled appointments will appear automatically</p>
              </div>
            )}
          </div>

          {/* Upcoming Queue Table */}
          <div className="bg-[#0b0d12] rounded-3xl p-8 border border-slate-800/80 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Upcoming Waiting Queue</h3>
              <span className="text-xs font-semibold text-slate-400">Dynamic Priority-Weighted Sort</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 pl-2">Position</th>
                    <th className="pb-3">Patient Name</th>
                    <th className="pb-3">Priority</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Joined At</th>
                    <th className="pb-3 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-800/50 font-medium">
                  {upcomingQueue.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500 font-semibold">
                        No additional patients in queue
                      </td>
                    </tr>
                  ) : (
                    upcomingQueue.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3.5 pl-2 text-[#00e599] font-black">#{p.position}</td>
                        <td className="py-3.5 font-bold text-white">
                          {p.patient?.name}
                          <span className="block text-[10px] text-slate-400 font-normal">{p.patient?.phone}</span>
                        </td>
                        <td className="py-3.5">
                          {p.priority === 'critical' ? (
                            <span className="px-2 py-0.5 rounded bg-red-950/60 border border-red-500/40 text-red-400 text-[10px] font-bold">
                              Critical
                            </span>
                          ) : p.priority === 'priority' ? (
                            <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-400 text-[10px] font-bold">
                              Priority
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-semibold">
                              Normal
                            </span>
                          )}
                        </td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-bold capitalize">
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-400">
                          {new Date(p.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3.5 text-right pr-2">
                          <button
                            onClick={() => handleCall(p)}
                            disabled={actionLoading}
                            className="px-3 py-1 rounded-lg bg-[#131720] hover:bg-[#00e599] hover:text-black border border-slate-800 text-slate-300 font-bold text-[10px] transition-all cursor-pointer"
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

        {/* Schedule & Delays Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#0b0d12] rounded-3xl p-8 border border-slate-800/80 shadow-2xl">
            <div className="flex items-center gap-2 mb-3 text-amber-400">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-lg font-bold">Schedule Overrides</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6 font-medium leading-relaxed">
              Inject emergency or arrival delays. Real-time notifications update all patient countdowns instantly.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => addGlobalDelay(15)}
                className="w-full py-3.5 rounded-xl bg-[#131720] hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                +15m Clinical Delay
              </button>
              <button
                onClick={() => addGlobalDelay(30)}
                className="w-full py-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                +30m Emergency Delay
              </button>
              <button
                onClick={() => { setGlobalDelay(0); queueService.setGlobalDelay(0); }}
                className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold text-xs transition-all cursor-pointer"
              >
                Reset Schedule to On-Time
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
