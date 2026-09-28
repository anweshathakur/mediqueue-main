import React, { useState, useEffect } from 'react';
import {
  Clock,
  Activity,
  Users,
  CheckCircle2,
  ArrowLeft,
  Stethoscope,
  Building2,
  Bell,
  ShieldCheck
} from 'lucide-react';
import { appointmentClient, PatientLiveQueueResponse } from '../../services/appointmentService';

interface LiveTrackerProps {
  appointment?: any;
  userEmail?: string;
  onBack: () => void;
  onCancel?: () => void;
  onReschedule?: () => void;
}

export const LiveTracker: React.FC<LiveTrackerProps> = ({
  appointment,
  userEmail,
  onBack,
  onCancel,
  onReschedule,
}) => {
  const [liveData, setLiveData] = useState<PatientLiveQueueResponse | null>(null);

  const fetchLiveStatus = async () => {
    try {
      const identifier = userEmail || appointment?.id || appointment?.patient_id;
      const res = await appointmentClient.getMyQueueStatus(identifier);
      if (res && res.hasActiveQueue) {
        setLiveData(res);
      }
    } catch (err) {
      console.warn('Live queue tracker fetch notice:', err);
    }
  };

  useEffect(() => {
    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 3000);
    return () => clearInterval(interval);
  }, [userEmail, appointment]);

  const queueEntry = liveData?.queueEntry;
  const doctor = liveData?.doctor || {
    name: appointment?.doctor_name || 'Dr. Arjun Mehta',
    specialty: appointment?.department || 'General Medicine',
    room_number: 'Room 204',
  };
  const clinic = liveData?.clinic || {
    name: 'MUJ Health Centre',
    address: '100 Medical Blvd, Jaipur, Rajasthan',
  };

  const position = queueEntry?.position || 1;
  const peopleAhead = queueEntry?.peopleAhead ?? Math.max(0, position - 1);
  const currentlySeeing = queueEntry?.currentlySeeing || (position === 1 ? 'You are next' : 'In Consultation');
  const estimatedWait = queueEntry?.estimatedWait || (peopleAhead === 0 ? 'Ready now' : `~${peopleAhead * 15} min`);
  const status = queueEntry?.status || 'waiting';

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 bg-[#07090e] text-white min-h-[calc(100vh-140px)] font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Live Consultation Telemetry</h1>
          <p className="text-slate-400 text-xs mt-1">
            Tracking Token <span className="text-[#00e599] font-mono font-bold">#A-{position + 10}</span> • Real-Time Synchronization Active
          </p>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#0c1017] border border-slate-700 text-slate-300 font-semibold text-xs hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </button>
      </div>

      {/* Hero Tracking Box */}
      <div className="bg-[#0c1017] rounded-lg p-6 md:p-8 border border-slate-800 mb-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6 pb-4 border-b border-slate-800/80">
          <div>
            <span className="inline-block px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-[#00e599] uppercase tracking-wider mb-1.5">
              Live Clinical Station
            </span>
            <h2 className="text-xl font-bold text-white">{doctor.name}, MD</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {doctor.specialty} • {doctor.room_number || 'Room 204'} • {clinic.name}
            </p>
          </div>

          <div>
            {status === 'consulting' ? (
              <span className="px-3 py-1 rounded bg-[#00e599]/10 border border-[#00e599]/40 text-[#00e599] text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> In Consultation
              </span>
            ) : status === 'called' ? (
              <span className="px-3 py-1 rounded bg-amber-500/10 border border-amber-500/40 text-amber-400 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <Bell className="w-3.5 h-3.5" /> Please Enter Room
              </span>
            ) : (
              <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#00e599]" /> In Waiting Bay
              </span>
            )}
          </div>
        </div>

        {/* Estimated Wait Box */}
        <div className="p-6 rounded-md bg-[#07090e] border border-slate-800 text-center mb-6">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
            Estimated Room Entry
          </span>
          <div className="flex items-center justify-center gap-3">
            <Clock className="w-8 h-8 text-[#00e599]" />
            <span className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight">{estimatedWait}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            Calculated from physician's live average pace and active consultation duration.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-400">Queue Progression</span>
            <span className="text-[#00e599]">Position #{position}</span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 border border-slate-800 rounded-sm overflow-hidden">
            <div
              className="h-full bg-[#00e599] transition-all duration-500"
              style={{ width: `${Math.max(15, Math.min(100, (1 - peopleAhead / Math.max(1, position + 3)) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0c1017] rounded-lg p-5 border border-slate-800 text-center">
          <Activity className="w-5 h-5 mx-auto mb-1.5 text-[#00e599]" />
          <p className="text-2xl font-black text-white font-mono">#{position}</p>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Your Position</p>
        </div>

        <div className="bg-[#0c1017] rounded-lg p-5 border border-slate-800 text-center">
          <Users className="w-5 h-5 mx-auto mb-1.5 text-blue-400" />
          <p className="text-2xl font-black text-white font-mono">{peopleAhead}</p>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">People Ahead</p>
        </div>

        <div className="bg-[#0c1017] rounded-lg p-5 border border-slate-800 text-center">
          <CheckCircle2 className="w-5 h-5 mx-auto mb-1.5 text-emerald-400" />
          <p className="text-sm md:text-base font-bold text-white truncate px-1 mt-1">{currentlySeeing}</p>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Currently Seeing</p>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#0c1017] border border-slate-700 text-slate-300 font-semibold text-xs hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Portal
        </button>

        <div className="flex items-center gap-2">
          {onReschedule && (
            <button
              onClick={onReschedule}
              className="px-3.5 py-2 rounded-md bg-[#0d121c] hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Reschedule
            </button>
          )}
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-3.5 py-2 rounded-md bg-[#0d121c] hover:bg-red-500/10 border border-red-500/30 text-red-400 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel Visit
            </button>
          )}
        </div>
      </div>
    </main>
  );
};
