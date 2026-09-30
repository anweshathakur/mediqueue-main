import React, { useState, useEffect } from 'react';
import { User, Stethoscope, ArrowRight, ArrowLeft, Building2, Calendar, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import { appointmentClient, Clinic, Doctor } from '../../services/appointmentService';
import { useTheme } from '../../context/ThemeContext';

interface PatientFlowProps {
  initialPhone?: string;
  onBackToHome: () => void;
  onComplete: () => void;
}

export const PatientFlow: React.FC<PatientFlowProps> = ({ initialPhone, onBackToHome, onComplete }) => {
  const { isDark } = useTheme();
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
      const scheduledDateTime = `${selectedDate}T${timeSlot.includes('PM') && !timeSlot.startsWith('12') ? Number(timeSlot.split(':')[0]) + 12 : timeSlot.split(':')[0].padStart(2, '0')}:${timeSlot.split(':')[1].slice(0, 2)}:00+05:30`;

      await appointmentClient.createAppointment({
        patient_name: name,
        patient_phone: phone,
        patient_age: Number(age) || 30,
        patient_gender: gender,
        clinic_id: selectedClinicId,
        doctor_id: selectedDoctorId,
        scheduled_at: scheduledDateTime,
        reason: symptoms || 'General Medical Consultation',
      });

      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const TIME_SLOTS = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM'
  ];

  return (
    <div className={`max-w-3xl mx-auto px-6 py-8 ${isDark ? 'bg-[#07090e] text-white' : 'bg-[#f8fafc] text-slate-900'} min-h-[calc(100vh-140px)] font-sans transition-colors duration-200`}>
      <button
        onClick={onBackToHome}
        className={`flex items-center gap-1.5 text-xs font-semibold mb-6 transition-colors cursor-pointer ${
          isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </button>

      <div className={`rounded-xl p-8 border ${
        isDark ? 'bg-[#0c1017] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Top Header */}
        <div className={`flex justify-between items-center mb-6 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div>
            <h1 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Book Medical Consultation</h1>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Complete 2-step reservation with real-time arrival sync</p>
          </div>
          <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
            isDark ? 'bg-slate-900 border-slate-800 text-[#00e599]' : 'bg-emerald-50 border-emerald-200 text-[#009b62]'
          }`}>
            Step {step} of 2
          </span>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs font-medium">
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
                <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Patient Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-xs font-medium focus:outline-none focus:border-[#00c985] ${
                    isDark ? 'bg-[#07090e] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Phone Number (10 Digits)</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-xs font-mono font-bold focus:outline-none focus:border-[#00c985] ${
                    isDark ? 'bg-[#07090e] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Age</label>
                <input
                  type="number"
                  placeholder="e.g. 32"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-xs font-medium focus:outline-none focus:border-[#00c985] ${
                    isDark ? 'bg-[#07090e] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-xs font-medium focus:outline-none focus:border-[#00c985] cursor-pointer ${
                    isDark ? 'bg-[#07090e] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Primary Symptoms / Reason for Visit</label>
              <textarea
                placeholder="e.g. Fever, continuous cough since 3 days..."
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-xs font-medium focus:outline-none focus:border-[#00c985] ${
                  isDark ? 'bg-[#07090e] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div className={`flex justify-between items-center pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <button
                type="button"
                onClick={onBackToHome}
                className={`px-4 py-2 rounded-lg border font-semibold text-xs transition-colors cursor-pointer ${
                  isDark ? 'bg-[#07090e] border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#009b62] hover:bg-[#008754] text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
              >
                Continue to Physician & Slot <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Healthcare Clinic</label>
                <select
                  value={selectedClinicId}
                  onChange={(e) => handleClinicChange(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-xs font-medium focus:outline-none focus:border-[#00c985] cursor-pointer ${
                    isDark ? 'bg-[#07090e] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  {clinics.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.address})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Attending Specialist</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-xs font-medium focus:outline-none focus:border-[#00c985] cursor-pointer ${
                    isDark ? 'bg-[#07090e] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.specialty} ({d.room_number || 'Room 204'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Appointment Date</label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-xs font-medium focus:outline-none focus:border-[#00c985] ${
                  isDark ? 'bg-[#07090e] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div className="space-y-2">
              <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Select Consultation Time Slot</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`py-2 px-2 text-center rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      timeSlot === slot
                        ? 'bg-[#009b62] text-white border-[#009b62] shadow-xs'
                        : isDark
                        ? 'bg-[#07090e] border-slate-800 text-slate-300 hover:border-slate-700'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className={`flex justify-between items-center pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border font-semibold text-xs transition-colors cursor-pointer ${
                  isDark ? 'bg-[#07090e] border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Details
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-[#009b62] hover:bg-[#008754] text-white font-bold text-xs transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Confirming...' : 'Book & Issue Token'} <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
