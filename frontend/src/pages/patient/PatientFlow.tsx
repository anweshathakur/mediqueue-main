import React, { useState } from 'react';
import { User, Stethoscope, ArrowRight, ArrowLeft } from 'lucide-react';
import { DOCTORS, DEPARTMENTS, QueueItem } from '../../types';
import { queueService } from '../../services/queueService';

interface PatientFlowProps {
  initialPhone?: string;
  onBackToHome: () => void;
  onComplete: () => void;
}

export const PatientFlow: React.FC<PatientFlowProps> = ({ initialPhone, onBackToHome, onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(initialPhone || '');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [symptoms, setSymptoms] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(1);
  const [timeSlot, setTimeSlot] = useState('02:30 PM');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || phone.length < 10) return;

    const currentQueue = queueService.getLocalQueue();
    const maxToken = currentQueue.length > 0 ? Math.max(...currentQueue.map(q => parseInt(q.id) || 100)) : 100;
    const newToken = maxToken + 1;

    const doc = DOCTORS.find(d => d.id === selectedDoctor);

    const newPatient: QueueItem = {
      id: newToken.toString(),
      name,
      phone,
      age: Number(age) || 30,
      type: 'Online',
      scheduled: timeSlot,
      status: 'Waiting',
      doctor_name: doc?.name || 'Dr. Arjun Mehta',
      department: doc?.specialty || 'General Medicine'
    };

    queueService.setLocalQueue([...currentQueue, newPatient]);
    onComplete();
  };

  return (
    <main className="max-w-4xl mx-auto px-8 py-16 bg-black text-white min-h-[calc(100vh-180px)] relative z-10">
      <div className="bg-[#0b0d12] rounded-3xl p-10 border border-slate-800/80 shadow-2xl">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-extrabold text-white">Book Doctor Consultation</h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">Direct appointment registration with automated queue dispatch</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#131720] border border-slate-800 text-xs font-bold text-[#00e599]">
            Step {step} of 2
          </span>
        </div>

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
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-[#131720] text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00e599]/30"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Age</label>
                <input
                  type="number"
                  placeholder="e.g. 29"
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
                className="px-6 py-3 rounded-xl bg-[#00e599] hover:bg-[#00c985] text-black font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(0,229,153,0.25)] cursor-pointer flex items-center gap-1.5"
              >
                Next: Select Doctor <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Available Specialist</label>
              <div className="grid md:grid-cols-2 gap-3">
                {DOCTORS.map(d => (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDoctor(d.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedDoctor === d.id
                        ? 'bg-[#131720] border-[#00e599] shadow-[0_0_20px_rgba(0,229,153,0.15)]'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-extrabold text-white text-sm">{d.name}</p>
                      <p className="text-xs text-slate-400 font-semibold">{d.specialty}</p>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${d.status === 'delayed' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/10 text-[#00e599] border border-emerald-500/30'}`}>
                      {d.status === 'delayed' ? `+${d.delay}` : 'On-Time'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Time Slot</label>
              <div className="grid grid-cols-3 gap-2">
                {['02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'].map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      timeSlot === slot ? 'bg-[#00e599] text-black border-[#00e599]' : 'bg-[#131720] text-slate-300 border-slate-800 hover:text-white'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer">
                <ArrowLeft className="w-4 h-4" /> Back to Details
              </button>
              <button
                type="submit"
                className="px-8 py-3.5 rounded-xl bg-[#00e599] hover:bg-[#00c985] text-black font-extrabold text-xs transition-all shadow-[0_0_25px_rgba(0,229,153,0.3)] cursor-pointer"
              >
                Confirm Appointment & Dispatch
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
};
