import React, { useState, useEffect } from 'react';
import { CalendarDays, Stethoscope, Clock, Trash2, ArrowRight, Lock, Building2, CheckCircle2, UserCheck, Activity, Users, AlertCircle } from 'lucide-react';
import { appointmentClient, Appointment, PatientLiveQueueResponse } from '../../services/appointmentService';

interface PatientDashboardProps {
  userEmail: string;
  onNew: () => void;
  onTrack: (apt: any) => void;
  onCancel: (id: string) => void;
  onReschedule: (id: string) => void;
  onLogout: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  userEmail,
  onNew,
  onTrack,
  onCancel,
  onReschedule,
  onLogout,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [liveQueue, setLiveQueue] = useState<PatientLiveQueueResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      const list = await appointmentClient.getMyAppointments(userEmail);
      if (Array.isArray(list)) {
        setAppointments(list);
      }
    } catch (err) {
      console.warn("Error fetching patient appointments:", err);
    }
  };

  const fetchLiveQueue = async () => {
    try {
      const status = await appointmentClient.getMyQueueStatus(userEmail);
      if (status && status.hasActiveQueue) {
        setLiveQueue(status);
      } else {
        setLiveQueue(null);
      }
    } catch (err) {
      console.warn("Error fetching live queue status:", err);
    }
  };

  const refreshAll = async () => {
    setIsLoading(true);
    await Promise.all([fetchAppointments(), fetchLiveQueue()]);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshAll();
    const interval = setInterval(() => {
      fetchAppointments();
      fetchLiveQueue();
    }, 4000);
    return () => clearInterval(interval);
  }, [userEmail]);

  const handleCheckIn = async (appointmentId: string) => {
    try {
      setCheckingInId(appointmentId);
      const res = await appointmentClient.checkIn(appointmentId, userEmail);
      await refreshAll();
      if (res.queueEntry) {
        onTrack({
          id: res.queueEntry.id,
          name: userEmail.split('@')[0],
          doctor_name: res.appointment?.doctor?.name,
          department: res.appointment?.doctor?.specialty,
        });
      }
    } catch (err: any) {
      alert("Check-in failed: " + (err.message || "Unknown error"));
    } finally {
      setCheckingInId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await appointmentClient.cancelAppointment(id);
      await refreshAll();
    } catch (err: any) {
      alert("Failed to cancel appointment: " + (err.message || "Unknown error"));
    }
  };

  const formatScheduled = (iso: string) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' • ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-8 py-16 min-h-[calc(100vh-180px)] bg-black text-white relative z-10">
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

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-6 relative z-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Patient Portal</h1>
          <p className="text-slate-400 mt-1.5 text-xs font-semibold flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#00e599]" /> Authenticated as {userEmail || 'demo123@gmail.com'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onLogout} className="px-5 py-3 rounded-xl border border-slate-800 bg-[#131720] text-slate-300 font-bold hover:text-white transition-colors cursor-pointer text-xs">
            Sign Out
          </button>
          <button onClick={onNew} className="bg-[#00e599] hover:bg-[#00c985] text-black px-6 py-3 rounded-xl font-extrabold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(0,229,153,0.25)] hover:-translate-y-0.5 cursor-pointer text-xs">
            <CalendarDays className="w-4 h-4" /> Book Appointment
          </button>
        </div>
      </div>

      {/* Active Live Queue Banner (When checked in / in queue) */}
      {liveQueue && liveQueue.queueEntry && (
        <div className="bg-gradient-to-r from-emerald-950/40 via-[#0b0d12] to-[#131720] rounded-3xl p-6 md:p-8 border border-[#00e599]/40 shadow-[0_0_30px_rgba(0,229,153,0.15)] mb-10 relative overflow-hidden z-10">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00e599] animate-ping"></span>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#00e599]">
                  {liveQueue.queueEntry.status === 'consulting'
                    ? 'Consultation in Progress'
                    : liveQueue.queueEntry.status === 'called'
                    ? 'Called to Consultation Room'
                    : 'Active Queue Live Status'}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">
                {liveQueue.doctor?.name || 'Assigned Physician'} 
                <span className="text-slate-400 text-sm font-semibold ml-2">({liveQueue.doctor?.specialty || 'General Medicine'})</span>
              </h2>
              <p className="text-xs text-slate-400 font-semibold">
                {liveQueue.clinic?.name || 'MUJ Health Centre'} • Room: <span className="text-white font-bold">{liveQueue.doctor?.room_number || 'Room 102'}</span>
              </p>
            </div>

            {/* Quick Metrics & CTA */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="bg-black/60 px-5 py-3 rounded-2xl border border-slate-800 text-center">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Your Position</p>
                <p className="text-2xl font-black text-[#00e599]">#{liveQueue.queueEntry.position}</p>
              </div>

              <div className="bg-black/60 px-5 py-3 rounded-2xl border border-slate-800 text-center">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">People Ahead</p>
                <p className="text-2xl font-black text-white">{liveQueue.queueEntry.peopleAhead}</p>
              </div>

              <div className="bg-black/60 px-5 py-3 rounded-2xl border border-slate-800 text-center">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Est. Wait</p>
                <p className="text-2xl font-black text-amber-400">{liveQueue.queueEntry.estimatedWait}</p>
              </div>

              <button
                onClick={() => onTrack({
                  id: liveQueue.queueEntry?.id,
                  name: userEmail.split('@')[0],
                  doctor_name: liveQueue.doctor?.name,
                  department: liveQueue.doctor?.specialty,
                })}
                className="bg-[#00e599] hover:bg-[#00c985] text-black font-extrabold text-xs px-6 py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(0,229,153,0.3)] hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
              >
                Open Live Tracker <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointments List */}
      <div className="space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Scheduled Appointments</h2>
          <span className="text-xs font-semibold text-slate-400">{appointments.length} Total</span>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-20 bg-[#0b0d12] rounded-3xl border border-slate-800/80 shadow-2xl">
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#00e599]">
              <CalendarDays className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">No Scheduled Appointments</h3>
            <p className="text-slate-400 text-xs mb-6 max-w-sm mx-auto font-medium">You do not have any upcoming bookings. Book with our doctors in seconds.</p>
            <button onClick={onNew} className="text-[#00e599] font-bold text-xs hover:underline flex items-center gap-1 mx-auto cursor-pointer">
              Book an appointment now <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {appointments.map((apt) => {
              const isCheckedIn = apt.status === 'checked_in' || (liveQueue?.queueEntry?.appointment_id === apt.id);

              return (
                <div key={apt.id} className="bg-[#0b0d12] p-8 rounded-3xl border border-slate-800/80 shadow-2xl hover:border-slate-700 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-[#00e599]">
                          <Stethoscope className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-extrabold text-white">
                            {apt.doctor?.name || 'Physician'}
                          </h3>
                          <p className="text-slate-400 text-xs font-semibold mt-0.5">
                            {apt.doctor?.specialty || 'General Medicine'} • <span className="text-slate-300 font-bold">{apt.clinic?.name || 'MUJ Health Centre'}</span>
                          </p>
                        </div>
                      </div>

                      {isCheckedIn ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[#00e599] text-xs font-extrabold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> In Queue
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold capitalize">
                          {apt.status}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 p-4 rounded-2xl bg-[#131720] border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Slot</span>
                        <p className="text-sm font-extrabold text-[#00e599]">{formatScheduled(apt.scheduled_at)}</p>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Reason</span>
                        <p className="text-xs font-semibold text-slate-300">{apt.reason || 'General Consultation'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-800/80 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onReschedule(apt.id)}
                        disabled={isCheckedIn}
                        className="p-2.5 rounded-xl border border-slate-800 bg-[#131720] text-slate-400 hover:text-amber-400 hover:border-amber-500/30 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Reschedule"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCancel(apt.id)}
                        disabled={isCheckedIn}
                        className="p-2.5 rounded-xl border border-slate-800 bg-[#131720] text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Cancel"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {isCheckedIn ? (
                      <button
                        onClick={() => onTrack({
                          id: apt.id,
                          name: apt.patient?.name || userEmail.split('@')[0],
                          doctor_name: apt.doctor?.name,
                          department: apt.doctor?.specialty,
                        })}
                        className="text-xs font-extrabold text-black bg-[#00e599] hover:bg-[#00c985] px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(0,229,153,0.25)] transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Activity className="w-3.5 h-3.5" /> Live Tracker
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCheckIn(apt.id)}
                        disabled={checkingInId === apt.id}
                        className="text-xs font-extrabold text-black bg-[#00e599] hover:bg-[#00c985] px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(0,229,153,0.25)] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Check In for Queue
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};
