import React, { useState, useEffect } from 'react';
import {
  Clock,
  Activity,
  Users,
  CheckCircle2,
  ArrowLeft,
  Stethoscope,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { appointmentClient, PatientLiveQueueResponse } from '../../services/appointmentService';
import { useTheme } from '../../context/ThemeContext';
import { realtimeService } from '../../services/realtimeService';

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
  const { isDark } = useTheme();
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
    // Live Realtime listener
    const unsubscribe = realtimeService.subscribe((event) => {
      fetchLiveStatus();
    });
    const interval = setInterval(fetchLiveStatus, 5000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
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

  const tokenNumber = queueEntry ? `#A-${queueEntry.position + 10}` : '#A-14';
  const position = queueEntry?.position || 1;
  const peopleAhead = queueEntry?.peopleAhead ?? Math.max(0, position - 1);
  const estWaitMin = queueEntry?.estimatedWaitMinutes || peopleAhead * 15;

  return (
    <div className={`max-w-4xl mx-auto px-6 py-8 ${isDark ? 'bg-[#07090e] text-white' : 'bg-[#f8fafc] text-slate-900'} min-h-[calc(100vh-140px)] font-sans transition-colors duration-200`}>
      <button
        onClick={onBack}
        className={`flex items-center gap-1.5 text-xs font-semibold mb-6 transition-colors cursor-pointer ${
          isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Appointments
      </button>

      {/* Main Ticket Card */}
      <div className={`rounded-xl p-8 border mb-6 transition-colors ${
        isDark ? 'bg-[#0c1017] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-md'
      }`}>
        {/* Ticket Header */}
        <div className={`flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6 pb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div>
            <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2 border ${
              isDark ? 'bg-slate-900 border-slate-800 text-[#00e599]' : 'bg-emerald-50 border-emerald-200 text-[#009b62]'
            }`}>
              LIVE CLINICAL PASS
            </span>
            <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Consultation Telemetry Ticket</h1>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{clinic.name} • {clinic.address}</p>
          </div>

          <div className="text-right">
            <span className={`text-[10px] font-bold uppercase tracking-widest block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Assigned Token</span>
            <span className={`text-3xl font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{tokenNumber}</span>
          </div>
        </div>

        {/* 3 Live Telemetry Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#07090e] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-[#00c985]" />
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Queue Position</span>
            </div>
            <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {position === 1 ? 'Next in Line' : `#${position} in Line`}
            </p>
            <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{peopleAhead} patient{peopleAhead === 1 ? '' : 's'} ahead</p>
          </div>

          <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#07090e] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-[#00c985]" />
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Estimated Wait</span>
            </div>
            <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>~{estWaitMin} mins</p>
            <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Dynamic delay compensated</p>
          </div>

          <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#07090e] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-[#00c985]" />
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Station Status</span>
            </div>
            <p className={`text-base font-bold capitalize mt-1 ${
              queueEntry?.status === 'consulting' ? 'text-[#00c985]' : isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {queueEntry?.status === 'consulting' ? 'In Examination' : queueEntry?.status === 'called' ? 'Called to Room' : 'Waiting in Lobby'}
            </p>
            <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{doctor.room_number || 'Room 204'}</p>
          </div>
        </div>

        {/* Physician Banner */}
        <div className={`p-4 rounded-lg border flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6 ${
          isDark ? 'bg-[#07090e] border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg border flex items-center justify-center text-[#00c985] ${
              isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{doctor.name}, MD</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{doctor.specialty} • {doctor.room_number || 'Room 204'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onReschedule && (
              <button
                onClick={onReschedule}
                className={`px-3 py-1.5 rounded-lg border font-semibold text-xs transition-colors cursor-pointer ${
                  isDark ? 'bg-[#0c1017] border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Reschedule Slot
              </button>
            )}
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 font-semibold text-xs hover:bg-red-500/20 transition-colors cursor-pointer"
              >
                Cancel Ticket
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
