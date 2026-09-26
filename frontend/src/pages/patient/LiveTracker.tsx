import React from 'react';
import { Clock, Activity, Users, CheckCircle2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { QueueItem, DOCTORS } from '../../types';
import { queueService } from '../../services/queueService';

interface LiveTrackerProps {
  appointment: QueueItem;
  onBack: () => void;
  onCancel: () => void;
  onReschedule: () => void;
}

export const LiveTracker: React.FC<LiveTrackerProps> = ({ appointment, onBack, onCancel, onReschedule }) => {
  const queue = queueService.getLocalQueue();
  const avgTime = queueService.getAvgConsultation();
  const globalDelay = queueService.getGlobalDelay();

  const active = queue.filter(q => q.status !== 'No-Show');
  const posIndex = active.findIndex(q => q.id === appointment?.id);
  const position = posIndex !== -1 ? posIndex + 1 : 1;
  const total = active.length || 1;

  const doctor = DOCTORS.find(d => d.name === appointment?.doctor_name);

  return (
    <main className="max-w-4xl mx-auto px-8 py-16 bg-black text-white min-h-[calc(100vh-180px)] relative z-10">
      <div className="bg-[#0b0d12] rounded-3xl p-10 border border-slate-800/80 shadow-2xl relative mb-8 text-center">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Live Consultation Tracker</p>
        <h2 className="text-2xl font-extrabold text-white mb-6">
          Patient <span className="text-[#00e599]">{appointment?.name}</span> • #{appointment?.id}
        </h2>

        <div className="mb-8">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Estimated Room Entry</p>
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-8 h-8 text-[#00e599]" />
            <span className="text-5xl font-black text-white">{appointment?.scheduled}</span>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
            <span>Queue Position</span>
            <span className="text-[#00e599]">{position} of {total}</span>
          </div>
          <div className="w-full h-3 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#00e599] transition-all duration-700"
              style={{ width: `${Math.max(10, Math.min(100, (1 - (position - 1) / total) * 100))}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2 font-semibold">Approximately {position * avgTime} mins remaining</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0b0d12] rounded-2xl p-5 border border-slate-800 text-center">
          <Activity className="w-5 h-5 mx-auto mb-2 text-[#00e599]" />
          <p className="text-2xl font-extrabold text-white">{position}</p>
          <p className="text-xs text-slate-400 font-semibold">Your Position</p>
        </div>
        <div className="bg-[#0b0d12] rounded-2xl p-5 border border-slate-800 text-center">
          <Users className="w-5 h-5 mx-auto mb-2 text-blue-400" />
          <p className="text-2xl font-extrabold text-white">{total}</p>
          <p className="text-xs text-slate-400 font-semibold">Active Queue</p>
        </div>
        <div className="bg-[#0b0d12] rounded-2xl p-5 border border-slate-800 text-center">
          <CheckCircle2 className="w-5 h-5 mx-auto mb-2 text-emerald-400" />
          <p className="text-2xl font-extrabold text-white">{avgTime}m</p>
          <p className="text-xs text-slate-400 font-semibold">Avg Time/Patient</p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <button onClick={onBack} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-800 bg-[#131720] text-slate-300 font-bold hover:text-white transition-colors cursor-pointer text-xs">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          <button onClick={onReschedule} className="px-5 py-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 font-bold text-xs hover:bg-amber-500/20 transition-colors cursor-pointer">
            Reschedule
          </button>
          <button onClick={onCancel} className="px-5 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 font-bold text-xs hover:bg-red-500/20 transition-colors cursor-pointer">
            Cancel Booking
          </button>
        </div>
      </div>
    </main>
  );
};
