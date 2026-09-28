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
        console.warn('Error loading clinics/doctors:', err);
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
    <main className="max-w-4xl mx-auto px-6 py-10 bg-[#07090e] text-white min-h-[calc(100vh-140px)] font-sans">
      <div className="bg-[#0c1017] rounded-lg p-8 border border-slate-800">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Book Doctor Consultation</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Select clinic, physician, and date to schedule consultation
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-bold text-[#00e599]">
            Step {step} of 2
          </span>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-md bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep(2);
            }}
            className="space-y-4"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Patient Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-700 bg-[#07090e] text-white text-xs font-medium focus:outline-none focus:border-[#00e599]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phone Number (10 Digits)</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-700 bg-[#07090e] text-white text-xs font-mono font-bold focus:outline-none focus:border-[#00e599]"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Age</label>
                <input
                  type="number"
                  placeholder="e.g. 32"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-700 bg-[#07090e] text-white text-xs font-medium focus:outline-none focus:border-[#00e599]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-700 bg-[#07090e] text-white text-xs font-medium focus:outline-none focus:border-[#00e599] cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Primary Symptoms / Reason for Visit</label>
              <textarea
                placeholder="e.g. Fever, continuous cough since 3 days..."
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-700 bg-[#07090e] text-white text-xs font-medium focus:outline-none focus:border-[#00e599]"
              />
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={onBackToHome}
                className="px-4 py-2 rounded-md bg-[#0c1017] border border-slate-700 text-slate-300 font-semibold text-xs hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!name || phone.length < 10}
                className="px-5 py-2 rounded-md bg-[#00e599] hover:bg-[#00c985] disabled:bg-slate-800 disabled:text-slate-500 text-black font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                Continue to Doctor & Slot <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Select Hospital / Clinic Location</label>
              <select
                value={selectedClinicId}
                onChange={(e) => handleClinicChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-700 bg-[#07090e] text-white text-xs font-medium focus:outline-none focus:border-[#00e599] cursor-pointer"
              >
                {clinics.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900">
                    {c.name} ({c.address})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Select Physician / Department</label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-700 bg-[#07090e] text-white text-xs font-medium focus:outline-none focus:border-[#00e599] cursor-pointer"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id} className="bg-slate-900">
                    {d.name} — {d.specialty} ({d.room_number || 'Room 101'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Appointment Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-700 bg-[#07090e] text-white text-xs font-medium focus:outline-none focus:border-[#00e599] cursor-pointer"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Preferred Time Slot</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-700 bg-[#07090e] text-white text-xs font-medium focus:outline-none focus:border-[#00e599] cursor-pointer"
                >
                  {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map((slot) => (
                    <option key={slot} value={slot} className="bg-slate-900">
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-md bg-[#07090e] border border-slate-800 space-y-1 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-semibold text-white">{name} ({phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Physician:</span>
                <span className="font-semibold text-white">
                  {doctors.find((d) => d.id === selectedDoctorId)?.name || 'Dr. Arjun Mehta'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Slot:</span>
                <span className="font-bold text-[#00e599]">{selectedDate} at {timeSlot}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#0c1017] border border-slate-700 text-slate-300 font-semibold text-xs hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-md bg-[#00e599] hover:bg-[#00c985] disabled:bg-slate-800 disabled:text-slate-500 text-black font-bold text-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Appointment
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
