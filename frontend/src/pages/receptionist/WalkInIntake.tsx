import React, { useState } from 'react';
import { User, Phone, Flame, PlusCircle, RefreshCw } from 'lucide-react';
import { DEPARTMENTS, DOCTORS, QueueItem } from '../../types';
import { walkInClient } from '../../services/walkInService';
import { queueService } from '../../services/queueService';

interface WalkInIntakeProps {
  onWalkInAdded: (item: QueueItem) => void;
}

export const WalkInIntake: React.FC<WalkInIntakeProps> = ({ onWalkInAdded }) => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [specialty, setSpecialty] = useState("General Medicine");
  const [assignedDoctor, setAssignedDoctor] = useState("Unassigned");
  const [priority, setPriority] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const PATIENT_DB: Record<string, { name: string, age: string }> = {
    "9876543210": { name: "Ravi Kumar", age: "45" },
    "9998887776": { name: "Ananya S.", age: "29" },
    "5551234567": { name: "John Doe", age: "33" },
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(val);

    if (val.length === 10 && PATIENT_DB[val]) {
      setName(PATIENT_DB[val].name);
      setAge(PATIENT_DB[val].age);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || phone.length < 10) return;

    setIsSubmitting(true);
    let registeredToken: QueueItem | null = null;

    try {
      const docMatch = DOCTORS.find(d => d.name === assignedDoctor);
      const doctorId = docMatch ? String(docMatch.id) : "1";

      const res = await walkInClient.createWalkIn({
        name,
        phone,
        age: Number(age) || 30,
        doctor_id: doctorId,
        doctor_name: assignedDoctor,
        department: specialty,
        priority: priority ? "critical" : "normal"
      });

      if (res && res.data) {
        registeredToken = {
          id: String(res.data.token_number || res.data.id),
          rawId: res.data.id,
          name: res.data.patient_name || res.data.name,
          phone: res.data.phone,
          age: res.data.age,
          type: 'Walk-in',
          scheduled: res.data.scheduled_time || (priority ? 'Immediate' : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
          status: 'Waiting',
          doctor_name: res.data.doctor_name || assignedDoctor,
          department: res.data.department || specialty,
          priority: Boolean(res.data.priority)
        };
      }
    } catch (err) {
      console.warn("Backend walkin API fallback:", err);
    }

    if (!registeredToken) {
      const currentQueue = queueService.getLocalQueue();
      const maxToken = currentQueue.length > 0 ? Math.max(...currentQueue.map(q => parseInt(q.id) || 100)) : 100;
      const newToken = maxToken + 1;
      registeredToken = {
        id: newToken.toString(),
        rawId: newToken.toString(),
        name,
        phone: phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3'),
        age: Number(age) || 30,
        type: 'Walk-in',
        scheduled: priority ? 'Immediate' : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Waiting',
        doctor_name: assignedDoctor,
        department: specialty,
        priority
      };
    }

    onWalkInAdded(registeredToken);

    setPhone("");
    setName("");
    setAge("");
    setPriority(false);
    setIsSubmitting(false);
  };

  return (
    <div className="bg-[#0b0d12] rounded-3xl p-8 border border-slate-800/80 relative shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[#00e599]">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-white">Walk-In Intake</h3>
          <p className="text-xs font-semibold text-slate-400">Patient Registration & Token Assignment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number (10 Digits)</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="e.g. 9876543210"
              maxLength={10}
              value={phone}
              onChange={handlePhoneChange}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-800 bg-[#131720] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00e599]/30 focus:border-[#00e599] transition-all font-bold tracking-widest text-xs"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Patient Name</label>
          <input
            type="text"
            placeholder="e.g. Rahul Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-[#131720] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00e599]/30 focus:border-[#00e599] transition-all font-semibold text-xs"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Age</label>
            <input
              type="number"
              placeholder="e.g. 32"
              min="1"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-[#131720] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00e599]/30 focus:border-[#00e599] transition-all font-semibold text-xs"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Department</label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full px-3 py-3 rounded-xl border border-slate-800 bg-[#131720] text-white focus:outline-none focus:ring-2 focus:ring-[#00e599]/30 font-semibold text-xs"
            >
              {DEPARTMENTS.map(dept => <option key={dept} value={dept} className="bg-slate-900">{dept}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Assigned Doctor</label>
          <select
            value={assignedDoctor}
            onChange={(e) => setAssignedDoctor(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-[#131720] text-white focus:outline-none focus:ring-2 focus:ring-[#00e599]/30 font-semibold text-xs"
          >
            <option value="Unassigned" className="bg-slate-900">Auto-assign / Unassigned</option>
            {DOCTORS.map(d => <option key={d.id} value={d.name} className="bg-slate-900">{d.name} ({d.specialty})</option>)}
          </select>
        </div>

        {/* Priority Emergency Checkbox */}
        <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Flame className={`w-5 h-5 ${priority ? 'text-red-400 fill-red-400' : 'text-amber-400'}`} />
            <div>
              <span className="text-xs font-extrabold text-white">Critical / Emergency Priority</span>
              <p className="text-[10px] text-slate-400 font-medium">Bypass queue & place at front for immediate consultation</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={priority}
            onChange={(e) => setPriority(e.target.checked)}
            className="w-5 h-5 accent-[#00e599] rounded cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={!name || phone.length < 10 || isSubmitting}
          className="w-full py-3.5 mt-2 rounded-xl bg-[#00e599] hover:bg-[#00c985] disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-black font-extrabold text-sm transition-all shadow-[0_0_25px_rgba(0,229,153,0.25)] hover:shadow-[0_0_35px_rgba(0,229,153,0.4)] hover:-translate-y-0.5 cursor-pointer flex justify-center items-center gap-2"
        >
          {isSubmitting ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <PlusCircle className="w-4 h-4" /> Issue Walk-In Token
            </>
          )}
        </button>
      </form>
    </div>
  );
};
