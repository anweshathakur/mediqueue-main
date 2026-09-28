import React, { useState, useEffect } from 'react';
import { Clock, Activity, Users, CheckCircle2, ArrowLeft, Stethoscope, Building2, Bell, AlertTriangle, ShieldAlert } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(false);

  const fetchLiveStatus = async () => {
    try {
      const identifier = userEmail || appointment?.id || appointment?.patient_id;
      const res = await appointmentClient.getMyQueueStatus(identifier);
      if (res && res.hasActiveQueue) {
        setLiveData(res);
      }
    } catch (err) {
      console.warn("Live queue tracker fetch notice:", err);
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
    room_number: 'Room 102',
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
    <main className="max-w-4xl mx-auto px-8 py-16 bg-black text-white min-h-[calc(100vh-180px)] relative z-10">
      {/* Background Grid */}
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

      {/* Hero Card */}
      <div className="bg-[#0b0d12] rounded-3xl p-8 md:p-10 border border-slate-800/80 shadow-2xl relative mb-8 z-10">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2.5 h-2.5 rounded-full ${status === 'consulting' ? 'bg-[#00e599] animate-ping' : status === 'called' ? 'bg-amber-400 animate-bounce' : 'bg-[#00e599]'}`}></span>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#00e599]">
                Live Clinical Queue Status
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {doctor.name}
            </h1>
            <p className="text-slate-400 text-xs font-semibold mt-1 flex items-center gap-2">
              <Stethoscope className="w-3.5 h-3.5 text-[#00e599]" /> {doctor.specialty} • {doctor.room_number || 'Room 102'} • <Building2 className="w-3.5 h-3.5 text-slate-400 ml-1" /> {clinic.name}
            </p>
          </div>

          <div>
            {status === 'consulting' ? (
              <span className="px-4 py-2 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[#00e599] text-xs font-black flex items-center gap-2 animate-pulse shadow-[0_0_15px_rgba(0,229,153,0.3)]">
                <CheckCircle2 className="w-4 h-4" /> In Consultation Room
              </span>
            ) : status === 'called' ? (
              <span className="px-4 py-2 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-400 text-xs font-black flex items-center gap-2 animate-bounce shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <Bell className="w-4 h-4" /> Please Proceed to Room
              </span>
            ) : (
              <span className="px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#00e599]" /> In Waiting Queue
              </span>
            )}
          </div>
        </div>

        {/* Big Estimated Wait */}
        <div className="p-8 rounded-2xl bg-[#131720] border border-slate-800/80 text-center mb-8">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Estimated Room Entry</p>
          <div className="flex items-center justify-center gap-3">
            <Clock className="w-10 h-10 text-[#00e599] animate-pulse" />
            <span className="text-5xl md:text-6xl font-black text-white tracking-tight">{estimatedWait}</span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-3">
            Dynamic estimation updated in real-time as doctor completes patient consultations.
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="space-y-2 mb-2">
          <div className="flex justify-between text-xs font-bold text-slate-400">
            <span>Your Position in Queue</span>
            <span className="text-[#00e599] font-black">#{position}</span>
          </div>
          <div className="w-full h-3.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-[#00e599] to-teal-300 transition-all duration-700 shadow-[0_0_10px_rgba(0,229,153,0.5)]"
              style={{ width: `${Math.max(15, Math.min(100, (1 - peopleAhead / Math.max(1, position + 3)) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Breakdown Cards Grid */}
      <div className="grid grid-cols-3 gap-4 md:gap-6 mb-8 relative z-10">
        <div className="bg-[#0b0d12] rounded-2xl p-6 border border-slate-800/80 shadow-2xl text-center">
          <Activity className="w-6 h-6 mx-auto mb-2 text-[#00e599]" />
          <p className="text-3xl font-black text-white">#{position}</p>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Your Position</p>
        </div>

        <div className="bg-[#0b0d12] rounded-2xl p-6 border border-slate-800/80 shadow-2xl text-center">
          <Users className="w-6 h-6 mx-auto mb-2 text-blue-400" />
          <p className="text-3xl font-black text-white">{peopleAhead}</p>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">People Ahead</p>
        </div>

        <div className="bg-[#0b0d12] rounded-2xl p-6 border border-slate-800/80 shadow-2xl text-center">
          <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
          <p className="text-lg md:text-xl font-bold text-white truncate px-1">{currentlySeeing}</p>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Currently Seeing</p>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center pt-4 relative z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-800 bg-[#131720] text-slate-300 font-bold hover:text-white transition-colors cursor-pointer text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Patient Dashboard
        </button>

        <div className="flex items-center gap-3">
          {onReschedule && (
            <button
              onClick={onReschedule}
              className="px-5 py-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 font-bold text-xs hover:bg-amber-500/20 transition-colors cursor-pointer"
            >
              Reschedule
            </button>
          )}
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-5 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 font-bold text-xs hover:bg-red-500/20 transition-colors cursor-pointer"
            >
              Cancel Booking
            </button>
          )}
        </div>
      </div>
    </main>
  );
};
