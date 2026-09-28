import React, { useState, useEffect } from 'react';
import { CalendarDays, Stethoscope, Clock, Trash2, ArrowRight, Lock, Building2, AlertCircle } from 'lucide-react';
import { appointmentClient, Appointment } from '../../services/appointmentService';

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
  const [isLoading, setIsLoading] = useState(false);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const list = await appointmentClient.getMyAppointments(userEmail);
      if (Array.isArray(list)) {
        setAppointments(list);
      }
    } catch (err) {
      console.warn("Error fetching patient appointments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 5000);
    return () => clearInterval(interval);
  }, [userEmail]);

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await appointmentClient.cancelAppointment(id);
      await fetchAppointments();
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

      <div className="flex flex-col md:flex-row justify-between md:items-end mb-10 gap-6 relative z-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">My Active Appointments</h1>
          <p className="text-slate-400 mt-1.5 text-xs font-semibold flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#00e599]" /> Authenticated as {userEmail || 'patient@mediqueue.com'}
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

      <div className="space-y-4 relative z-10">
        {appointments.length === 0 ? (
          <div className="text-center py-20 bg-[#0b0d12] rounded-3xl border border-slate-800/80 shadow-2xl">
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#00e599]">
              <CalendarDays className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">No Active Appointments</h3>
            <p className="text-slate-400 text-xs mb-6 max-w-sm mx-auto font-medium">You do not have any upcoming scheduled appointments.</p>
            <button onClick={onNew} className="text-[#00e599] font-bold text-xs hover:underline flex items-center gap-1 mx-auto cursor-pointer">
              Book an appointment now <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {appointments.map((apt) => (
              <div key={apt.id} className="bg-[#0b0d12] p-8 rounded-3xl border border-slate-800/80 shadow-2xl hover:border-[#00e599]/40 transition-all flex flex-col justify-between group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-[#00e599]">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-white">
                        {apt.doctor?.name || 'Physician'} 
                        <span className="text-xs font-bold text-slate-400 ml-2 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded capitalize">
                          {apt.status}
                        </span>
                      </h2>
                      <p className="text-slate-400 text-xs font-semibold mt-0.5">
                        {apt.doctor?.specialty || 'General Medicine'} • <span className="text-slate-300 font-bold">{apt.clinic?.name || 'MUJ Health Centre'}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Scheduled Slot</span>
                    <p className="text-sm font-extrabold text-[#00e599]">{formatScheduled(apt.scheduled_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onReschedule(apt.id)}
                      className="p-2.5 rounded-xl border border-slate-800 bg-[#131720] text-slate-400 hover:text-amber-400 hover:border-amber-500/30 transition-colors cursor-pointer"
                      title="Reschedule"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCancel(apt.id)}
                      className="p-2.5 rounded-xl border border-slate-800 bg-[#131720] text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
                      title="Cancel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onTrack({
                        id: apt.id,
                        name: apt.patient?.name || userEmail.split('@')[0],
                        phone: apt.patient?.phone || '',
                        scheduled: formatScheduled(apt.scheduled_at),
                        status: 'Waiting',
                        doctor_name: apt.doctor?.name,
                        department: apt.doctor?.specialty,
                        type: 'Online'
                      })}
                      className="text-xs font-extrabold text-black bg-[#00e599] hover:bg-[#00c985] px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer ml-1"
                    >
                      Track Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
