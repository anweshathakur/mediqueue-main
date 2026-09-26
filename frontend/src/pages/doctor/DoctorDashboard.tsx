import React, { useState, useEffect } from 'react';
import { Stethoscope, Activity, Clock, Users, Play, AlertCircle, ArrowLeft } from 'lucide-react';
import { QueueItem, DOCTORS } from '../../types';
import { queueService } from '../../services/queueService';

interface DoctorDashboardProps {
  onBack: () => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ onBack }) => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [avgTime, setAvgTime] = useState(15);
  const [globalDelay, setGlobalDelay] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState(1);

  const [consultationStart, setConsultationStart] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const sync = () => {
      setQueue(queueService.getLocalQueue());
      setAvgTime(queueService.getAvgConsultation());
      setGlobalDelay(queueService.getGlobalDelay());
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
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [consultationStart]);

  const activeQueue = queue.filter(p => p.status !== 'No-Show');
  const currentPatient = activeQueue[0];
  const upcomingQueue = activeQueue.slice(0, 6);

  const handleStart = () => {
    setConsultationStart(Date.now());
    if (activeQueue.length > 0) {
      const newQueue = [...queue];
      const targetIndex = newQueue.findIndex(q => q.id === activeQueue[0].id);
      if (targetIndex !== -1) {
        newQueue[targetIndex].status = 'Consulting';
        queueService.setLocalQueue(newQueue);
      }
    }
  };

  const handleNextPatient = (simulatedDuration?: number) => {
    const finalDuration = simulatedDuration || Math.max(1, elapsed);
    queueService.setAvgConsultation(finalDuration);

    if (activeQueue.length > 0) {
      const completedPatient = activeQueue[0];
      queueService.addHistory({
        id: Date.now(),
        patient_name: completedPatient.name,
        patient_type: completedPatient.type,
        doctor_name: DOCTORS.find(d => d.id === selectedDoctor)?.name || 'Dr. Arjun Mehta',
        completed_at: new Date().toISOString()
      });

      const newQueue = queue.filter(q => q.id !== completedPatient.id);
      queueService.setLocalQueue(newQueue);
    }

    setConsultationStart(null);
  };

  const addGlobalDelay = (mins: number) => {
    const updated = globalDelay + mins;
    setGlobalDelay(updated);
    queueService.setGlobalDelay(updated);
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
            onChange={(e) => setSelectedDoctor(Number(e.target.value))}
            className="px-4 py-2.5 rounded-xl bg-[#131720] border border-slate-800 text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#00e599]/30"
          >
            {DOCTORS.map(d => <option key={d.id} value={d.id} className="bg-slate-900">{d.name} ({d.specialty})</option>)}
          </select>
          <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#131720] border border-slate-800 text-slate-300 font-semibold hover:bg-slate-800 transition-colors cursor-pointer text-xs">
            <ArrowLeft className="w-4 h-4" /> Exit
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-6 mb-8 relative z-10">
        <div className="bg-[#0b0d12] rounded-2xl p-6 border border-slate-800/80 shadow-2xl">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Waiting Patients</h3>
            <div className="w-8 h-8 rounded-lg bg-[#00e599]/10 flex items-center justify-center text-[#00e599]"><Users className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-extrabold text-[#00e599]">{activeQueue.length}</p>
        </div>

        <div className="bg-[#0b0d12] rounded-2xl p-6 border border-slate-800/80 shadow-2xl">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg. Consultation</h3>
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
          {/* Active Consultation Hero Card */}
          <div className="bg-[#0b0d12] rounded-3xl p-8 border border-slate-800/80 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#00e599]">Active Patient In Consultation</span>
              {currentPatient?.status === 'Consulting' && (
                <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[#00e599] text-xs font-extrabold animate-pulse">
                  In Room
                </span>
              )}
            </div>

            {currentPatient ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-extrabold text-white">{currentPatient.name}</h2>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Token #{currentPatient.id} • {currentPatient.type} • Scheduled {currentPatient.scheduled}</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#131720] border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-[#00e599]" />
                    <div>
                      <p className="text-xs text-slate-400 font-bold">Consultation Timer</p>
                      <p className="text-2xl font-black text-white">{elapsed} mins elapsed</p>
                    </div>
                  </div>
                  {consultationStart ? (
                    <button
                      onClick={() => handleNextPatient()}
                      className="px-6 py-3 rounded-xl bg-[#00e599] hover:bg-[#00c985] text-black font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(0,229,153,0.25)] cursor-pointer"
                    >
                      Complete & Call Next
                    </button>
                  ) : (
                    <button
                      onClick={handleStart}
                      className="px-6 py-3 rounded-xl bg-[#00e599] hover:bg-[#00c985] text-black font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(0,229,153,0.25)] cursor-pointer flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" /> Begin Consultation
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-bold text-white">No patients waiting in queue</p>
              </div>
            )}
          </div>

          {/* Upcoming Queue */}
          <div className="bg-[#0b0d12] rounded-3xl p-8 border border-slate-800/80 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Upcoming Queue</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 pl-2">Token</th>
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Scheduled</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-800/50 font-medium">
                  {upcomingQueue.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 pl-2 text-[#00e599] font-bold">#{p.id}</td>
                      <td className="py-3 font-bold text-white">{p.name}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-bold">
                          {p.type}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">{p.scheduled}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Chaos / Delay Control Sidebar */}
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
