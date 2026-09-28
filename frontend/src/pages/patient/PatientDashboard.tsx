import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Stethoscope,
  Clock,
  Trash2,
  Lock,
  Building2,
  CheckCircle2,
  UserCheck,
  Activity,
  Users,
  AlertCircle,
  QrCode,
  ShieldCheck,
  ArrowRight,
  LogOut,
  Plus
} from 'lucide-react';
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
      console.warn('Error fetching patient appointments:', err);
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
      console.warn('Error fetching live queue status:', err);
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
      alert('Check-in failed: ' + (err.message || 'Unknown error'));
    } finally {
      setCheckingInId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentClient.cancelAppointment(id);
      await refreshAll();
    } catch (err: any) {
      alert('Failed to cancel appointment: ' + (err.message || 'Unknown error'));
    }
  };

  const formatScheduled = (iso: string) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return (
        d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' • ' +
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    } catch {
      return iso;
    }
  };

  const queueEntry = liveQueue?.queueEntry;
  const doctor = liveQueue?.doctor || {
    name: 'Dr. Arjun Mehta',
    specialty: 'General Medicine',
    room_number: 'Room 204',
  };
  const tokenString = queueEntry ? `#A-${queueEntry.position + 10}` : '#A-14';
  const position = queueEntry?.position || 1;
  const peopleAhead = queueEntry?.peopleAhead ?? Math.max(0, position - 1);

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 bg-[#07090e] text-white min-h-[calc(100vh-140px)] font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Active Appointments</h1>
          <p className="text-slate-400 text-xs mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00e599]"></span>
            Authenticated as <span className="text-slate-200 font-semibold">{userEmail || 'demo123@gmail.com'}</span> • Live Telemetry Active
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#0c1017] border border-slate-700 text-slate-300 font-semibold text-xs hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
          <button
            onClick={onNew}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#00e599] hover:bg-[#00c985] text-black font-bold text-xs transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Book Appointment
          </button>
        </div>
      </div>

      {/* Live Queue & Consultation Section */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Left 2 Cols: Active Live Queue & Journey */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0c1017] rounded-lg p-6 border border-slate-800">
            {/* Top Bar inside Card */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6 pb-4 border-b border-slate-800/80">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-md bg-[#00e599]/10 border border-[#00e599]/30 flex items-center justify-center text-[#00e599] shrink-0 mt-0.5">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <span className="inline-block px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-[#00e599] uppercase tracking-wider mb-1">
                    {queueEntry ? 'ACTIVE LIVE QUEUE' : 'CLINICAL STATION'}
                  </span>
                  <h2 className="text-xl font-bold text-white tracking-tight">{doctor.name}, MD</h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Attending Specialist • {doctor.specialty} • {doctor.room_number || 'OPD Wing B (Level 2)'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Your Assignment Token</span>
                <span className="text-2xl font-black text-white font-mono">{tokenString}</span>
              </div>
            </div>

            {/* 4-Step Journey Progression */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 my-6">
              <div className="p-3 rounded-md bg-[#07090e] border border-slate-800">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1">
                  <span>Step 01</span>
                  <span>10:15 AM</span>
                </div>
                <p className="text-xs font-semibold text-white">Check-in confirmed</p>
                <p className="text-[10px] text-slate-500">Reception Kiosk A3</p>
              </div>

              <div className="p-3 rounded-md bg-[#07090e] border border-slate-800">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1">
                  <span>Step 02</span>
                  <span>10:30 AM</span>
                </div>
                <p className="text-xs font-semibold text-white">Pre-consultation</p>
                <p className="text-[10px] text-slate-500">Vitals logged by Nurse</p>
              </div>

              <div className={`p-3 rounded-md border ${
                queueEntry?.status === 'consulting'
                  ? 'bg-[#07090e] border-slate-800'
                  : 'bg-[#00e599]/10 border-[#00e599]/40'
              }`}>
                <div className="flex justify-between items-center text-[10px] font-bold text-[#00e599] mb-1">
                  <span>Step 03</span>
                  <span className="uppercase">{queueEntry?.status === 'called' ? 'CALLED' : 'NEXT UP'}</span>
                </div>
                <p className="text-xs font-semibold text-white">Ready in Waiting Bay</p>
                <p className="text-[10px] text-slate-400">Bay 2-B, Zone Green</p>
              </div>

              <div className={`p-3 rounded-md border ${
                queueEntry?.status === 'consulting'
                  ? 'bg-[#00e599]/10 border-[#00e599]/40'
                  : 'bg-[#07090e] border-slate-800'
              }`}>
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1">
                  <span>Step 04</span>
                  <span>{queueEntry?.status === 'consulting' ? 'ACTIVE' : 'Upcoming'}</span>
                </div>
                <p className="text-xs font-semibold text-white">In-Consultation</p>
                <p className="text-[10px] text-slate-500">{doctor.room_number || 'Room 204'} Entry</p>
              </div>
            </div>

            {/* Live Physician Status Strip */}
            <div className="p-3.5 rounded-md bg-[#07090e] border border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-5">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-[#00e599] animate-pulse"></span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Physician Status:</span>
                <span className="text-white font-semibold">
                  Now Serving Token {queueEntry ? `#A-${Math.max(1, position + 8)}` : '#A-12'} (Patient in Examination)
                </span>
              </div>
              <span className="text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">
                {peopleAhead} {peopleAhead === 1 ? 'patient' : 'patients'} ahead of you
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pt-3 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-500 font-medium">
                SMS alerts enabled for {userEmail || '+1 (555) 334-1001'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert('Reception desk notified of your status.')}
                  className="px-3.5 py-2 rounded-md bg-[#0d121c] hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Notify Reception Delay
                </button>
                {queueEntry && (
                  <button
                    onClick={() => onTrack({
                      id: queueEntry.id,
                      name: userEmail.split('@')[0],
                      doctor_name: doctor.name,
                      department: doctor.specialty,
                    })}
                    className="px-4 py-2 rounded-md bg-[#00e599] hover:bg-[#00c985] text-black font-bold text-xs transition-colors cursor-pointer"
                  >
                    Open Live Tracker
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Scheduled & Recent Appointments Table */}
          <div className="bg-[#0c1017] rounded-lg p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
              <h3 className="text-sm font-bold text-white">Scheduled & Recent Appointments</h3>
              <span className="text-[11px] text-slate-500 font-medium">Showing {appointments.length} Records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider">
                    <th className="pb-2.5">APPOINTMENT ID</th>
                    <th className="pb-2.5">PRACTITIONER / DEPT</th>
                    <th className="pb-2.5">DATE & TIME</th>
                    <th className="pb-2.5">TOKEN</th>
                    <th className="pb-2.5">STATUS</th>
                    <th className="pb-2.5 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500 text-xs">
                        No upcoming scheduled appointments found.
                      </td>
                    </tr>
                  ) : (
                    appointments.map((apt, index) => {
                      const isCheckedIn = apt.status === 'checked_in' || queueEntry?.appointment_id === apt.id;

                      return (
                        <tr key={apt.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 font-mono text-slate-400 text-[11px]">
                            apt_{apt.id.slice(0, 6)}
                          </td>
                          <td className="py-3">
                            <span className="font-bold text-white block">{apt.doctor?.name || 'Dr. Arjun Mehta'}</span>
                            <span className="text-[10px] text-slate-400">{apt.doctor?.specialty || 'General Medicine'} • {apt.clinic?.name || 'MUJ Health Centre'}</span>
                          </td>
                          <td className="py-3 text-slate-300">
                            {formatScheduled(apt.scheduled_at)}
                          </td>
                          <td className="py-3 font-mono font-bold text-[#00e599]">
                            #A-{index + 14}
                          </td>
                          <td className="py-3">
                            {isCheckedIn ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-[#00e599] text-[10px] font-bold">
                                In Queue
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-semibold capitalize">
                                {apt.status}
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isCheckedIn ? (
                                <button
                                  onClick={() => onTrack({
                                    id: apt.id,
                                    name: apt.patient?.name || userEmail.split('@')[0],
                                    doctor_name: apt.doctor?.name,
                                    department: apt.doctor?.specialty,
                                  })}
                                  className="text-[11px] font-bold text-[#00e599] hover:underline cursor-pointer"
                                >
                                  View Ticket
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleCheckIn(apt.id)}
                                  disabled={checkingInId === apt.id}
                                  className="px-2.5 py-1 rounded bg-[#00e599] hover:bg-[#00c985] text-black font-bold text-[10px] transition-colors cursor-pointer"
                                >
                                  Check In
                                </button>
                              )}
                              <button
                                onClick={() => onReschedule(apt.id)}
                                className="text-[11px] text-slate-400 hover:text-white cursor-pointer ml-1"
                              >
                                Reschedule
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar Widgets */}
        <div className="space-y-6">
          {/* Arrival Protocols Card */}
          <div className="bg-[#0c1017] rounded-lg p-5 border border-slate-800">
            <div className="flex items-center gap-2 mb-3 text-white font-bold text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00e599]" />
              <span>Room 204 Arrival Protocols</span>
            </div>
            <ul className="text-[11px] text-slate-400 space-y-3">
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded bg-slate-900 text-slate-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                <span>Present your digital QR or token #A-14 at Gate 3B.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded bg-slate-900 text-slate-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                <span>Sanitize hands and proceed to Vital Bay 2 for mandatory thermal and BP log.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded bg-slate-900 text-slate-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                <span>Bring your current prescription records or health tracker logs.</span>
              </li>
            </ul>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] flex justify-between items-center text-slate-400">
              <span>Department Extension:</span>
              <span className="text-white font-bold">Ext. 4402 (Nurse Desk)</span>
            </div>
          </div>

          {/* Physician Profile Card */}
          <div className="bg-[#0c1017] rounded-lg p-5 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              PHYSICIAN PROFILE & CREDENTIALS
            </span>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-md bg-slate-900 border border-slate-700 flex items-center justify-center text-[#00e599]">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{doctor.name}</h4>
                <p className="text-[10px] text-slate-400">MBBS, MD ({doctor.specialty})</p>
                <span className="inline-flex items-center gap-1 text-[10px] text-[#00e599] font-semibold mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Verified Specialist
                </span>
              </div>
            </div>

            <div className="p-3 rounded-md bg-[#07090e] border border-slate-800 text-[11px] flex justify-between items-center text-slate-400">
              <span>Consultation Duration:</span>
              <span className="text-white font-bold">Standard 20 Mins</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
