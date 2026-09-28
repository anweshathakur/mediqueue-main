import React, { useState, useEffect } from 'react';
import { User, Stethoscope, ArrowRight, ArrowLeft, Building2, Calendar, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import { appointmentClient, Clinic, Doctor } from '../../services/appointmentService';

interface PatientFlowProps {
  initialPhone?: string;
  onBackToHome: () => void;
  onComplete: () => void;
}

export const PatientFlow: React.FC<PatientFlowProps> = ({ initialPhone, onBackToHome, onComplete }) => {
  const [step, setStep] = useState(1);
  
  // Step 1: Patient details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(initialPhone || '');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [symptoms, setSymptoms] = useState('');

  // Step 2: Clinic, Doctor, Date/Slot
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('11:00 AM');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load clinics & doctors
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const clinicList = await appointmentClient.getClinics();
        setClinics(clinicList);
        if (clinicList.length > 0) {
          const defaultClinic = clinicList[0].id;
          setSelectedClinicId(defaultClinic);
          const docList = await appointmentClient.getDoctors(defaultClinic);
          setDoctors(docList);
          if (docList.length > 0) {
            setSelectedDoctorId(docList[0].id);
          }
        }
      } catch (err: any) {
        console.warn("Error loading clinics/doctors:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleClinicChange = async (clinicId: string) => {
    setSelectedClinicId(clinicId);
    try {
      const docList = await appointmentClient.getDoctors(clinicId);
      setDoctors(docList);
      if (docList.length > 0) {
        setSelectedDoctorId(docList[0].id);
      }
    } catch (err) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || phone.length < 10 || !selectedClinicId || !selectedDoctorId) {
      setError('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // ISO timestamp combining selectedDate + timeSlot
      const scheduledIso = new Date(`${selectedDate} ${timeSlot}`).toISOString();

      await appointmentClient.bookAppointment({
        clinic_id: selectedClinicId,
        doctor_id: selectedDoctorId,
        patient_id: phone,
        patient_name: name,
        patient_phone: phone,
        scheduled_at: isNaN(new Date(scheduledIso).getTime()) ? new Date().toISOString() : scheduledIso,
        reason: symptoms || 'General Consultation',
      });

      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-8 py-16 bg-black text-white min-h-[calc(100vh-180px)] relative z-10">
      <div className="bg-[#0b0d12] rounded-3xl p-10 border border-slate-800/80 shadow-2xl">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-extrabold text-white">Book Doctor Consultation</h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">Select clinic, doctor, and date to schedule consultation</p>
          </div>
          <span className="px-3.5 py-1 rounded-full bg-[#131720] border border-slate-800 text-xs font-extrabold text-[#00e599]">
            Step {step} of 2
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-bold">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Patient Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-[#131720] text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00e599]/30"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone Number (10 Digits)</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-[#131720] text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00e599]/30 tracking-wider"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Age</label>
                <input
                  type="number"
                  placeholder="e.g. 29"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-[#131720] text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00e599]/30"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-[#131720] text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00e599]/30"
                >
                  <option className="bg-slate-900">Male</option>
                  <option className="bg-slate-900">Female</option>
                  <option className="bg-slate-900">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Symptoms / Chief Complaint</label>
              <textarea
                placeholder="e.g. Mild fever, persistent cough, and headache for 2 days"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-[#131720] text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00e599]/30"
              />
            </div>

            <div className="flex justify-between items-center pt-4">
              <button type="button" onClick={onBackToHome} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer">
                <ArrowLeft className="w-4 h-4" /> Cancel & Back
              </button>
              <button
                type="submit"
                disabled={!name || phone.length < 10}
                className="px-6 py-3 rounded-xl bg-[#00e599] hover:bg-[#00c985] disabled:bg-slate-800 disabled:text-slate-500 text-black font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(0,229,153,0.25)] cursor-pointer flex items-center gap-1.5"
              >
                Next: Select Clinic & Doctor <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Select Clinic */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#00e599]" /> Select Healthcare Centre / Clinic
              </label>
              <select
                value={selectedClinicId}
                onChange={(e) => handleClinicChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-[#131720] text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00e599]/30"
              >
                {clinics.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900">
                    {c.name} — {c.address}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Select Doctor */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-[#00e599]" /> Select Available Specialist
              </label>
              <div className="grid md:grid-cols-2 gap-3">
                {doctors.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDoctorId(d.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedDoctorId === d.id
                        ? 'bg-[#131720] border-[#00e599] shadow-[0_0_20px_rgba(0,229,153,0.15)]'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-extrabold text-white text-sm">{d.name}</p>
                      <p className="text-xs text-slate-400 font-semibold">{d.specialty} • {d.room_number || 'OPD'}</p>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded ${
                      d.status === 'delayed'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/10 text-[#00e599] border border-emerald-500/30'
                    }`}>
                      {d.status === 'delayed' ? `+${d.current_delay || 15}m` : 'Available'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Select Date & Slot */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#00e599]" /> Consultation Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-[#131720] text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00e599]/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#00e599]" /> Time Slot
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['09:30 AM', '11:00 AM', '02:00 PM', '03:30 PM', '04:30 PM', '05:30 PM'].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        timeSlot === slot
                          ? 'bg-[#00e599] text-black border-[#00e599]'
                          : 'bg-[#131720] text-slate-300 border-slate-800 hover:text-white'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer">
                <ArrowLeft className="w-4 h-4" /> Back to Details
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedDoctorId}
                className="px-8 py-3.5 rounded-xl bg-[#00e599] hover:bg-[#00c985] text-black font-extrabold text-xs transition-all shadow-[0_0_25px_rgba(0,229,153,0.3)] cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Confirm & Book Appointment
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
};
