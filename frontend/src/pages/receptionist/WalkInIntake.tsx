import React, { useState } from 'react';
import { User, Phone, Flame, PlusCircle, RefreshCw } from 'lucide-react';
import { DEPARTMENTS, DOCTORS, QueueItem } from '../../types';
import { walkInClient } from '../../services/walkInService';
import { queueService } from '../../services/queueService';

interface WalkInIntakeProps {
  onWalkInAdded: (item: QueueItem) => void;
}

export const WalkInIntake: React.FC<WalkInIntakeProps> = ({ onWalkInAdded }) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [specialty, setSpecialty] = useState('General Medicine');
  const [assignedDoctor, setAssignedDoctor] = useState('Unassigned');
  const [priority, setPriority] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const PATIENT_DB: Record<string, { name: string; age: string }> = {
    '9876543210': { name: 'Ravi Kumar', age: '45' },
    '9998887776': { name: 'Ananya S.', age: '29' },
    '5551234567': { name: 'John Doe', age: '33' },
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
      const docMatch = DOCTORS.find((d) => d.name === assignedDoctor);
      const doctorId = docMatch ? String(docMatch.id) : '1';

      const res = await walkInClient.createWalkIn({
        name,
        phone,
        age: Number(age) || 30,
        doctor_id: doctorId,
        doctor_name: assignedDoctor,
        department: specialty,
        priority: priority ? 'critical' : 'normal',
      });

      if (res && res.data) {
        registeredToken = {
          id: String(res.data.token_number || res.data.id),
          rawId: res.data.id,
          name: res.data.patient_name || res.data.name,
          phone: res.data.phone,
          age: res.data.age,
          type: 'Walk-in',
          scheduled:
            res.data.scheduled_time ||
            (priority
              ? 'Immediate'
              : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
          status: 'Waiting',
          doctor_name: res.data.doctor_name || assignedDoctor,
          department: res.data.department || specialty,
          priority: Boolean(res.data.priority),
        };
      }
    } catch (err) {
      console.warn('Backend walkin API fallback:', err);
    }

    if (!registeredToken) {
      const currentQueue = queueService.getLocalQueue();
      const maxToken =
        currentQueue.length > 0
          ? Math.max(...currentQueue.map((q) => parseInt(q.id) || 100))
          : 100;
      const newToken = maxToken + 1;
      registeredToken = {
        id: newToken.toString(),
        rawId: newToken.toString(),
        name,
        phone: phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3'),
        age: Number(age) || 30,
        type: 'Walk-in',
        scheduled: priority
          ? 'Immediate'
          : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Waiting',
        doctor_name: assignedDoctor,
        department: specialty,
        priority,
      };
    }

    onWalkInAdded(registeredToken);

    setPhone('');
    setName('');
    setAge('');
    setPriority(false);
    setIsSubmitting(false);
  };

  return (
    <div className="bg-[#0c1017] rounded-lg p-6 border border-slate-800 font-sans">
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800/80">
        <div className="w-9 h-9 rounded-md bg-[#00e599]/10 border border-[#00e599]/30 flex items-center justify-center text-[#00e599]">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Walk-In Intake</h3>
          <p className="text-[11px] text-slate-400">Patient Registration & Token Assignment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phone Number (10 Digits)</label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="e.g. 9876543210"
              maxLength={10}
              value={phone}
              onChange={handlePhoneChange}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-md border border-slate-700 bg-[#07090e] text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00e599] font-mono text-xs font-bold"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Patient Name</label>
          <input
            type="text"
            placeholder="e.g. Rahul Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-md border border-slate-700 bg-[#07090e] text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00e599] text-xs font-medium"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Age</label>
            <input
              type="number"
              placeholder="e.g. 32"
              min="1"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-md border border-slate-700 bg-[#07090e] text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00e599] text-xs font-medium"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Department</label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md border border-slate-700 bg-[#07090e] text-white focus:outline-none focus:border-[#00e599] text-xs font-medium cursor-pointer"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} className="bg-slate-900">
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assigned Doctor</label>
          <select
            value={assignedDoctor}
            onChange={(e) => setAssignedDoctor(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-md border border-slate-700 bg-[#07090e] text-white focus:outline-none focus:border-[#00e599] text-xs font-medium cursor-pointer"
          >
            <option value="Unassigned" className="bg-slate-900">Auto-assign / Unassigned</option>
            {DOCTORS.map((d) => (
              <option key={d.id} value={d.name} className="bg-slate-900">
                {d.name} ({d.specialty})
              </option>
            ))}
          </select>
        </div>

        {/* Priority Emergency Checkbox */}
        <div className="p-3 rounded-md bg-[#07090e] border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className={`w-4 h-4 ${priority ? 'text-red-400' : 'text-amber-400'}`} />
            <div>
              <span className="text-xs font-bold text-white">Emergency / Critical Priority</span>
              <p className="text-[10px] text-slate-400">Place at head of queue for urgent evaluation</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={priority}
            onChange={(e) => setPriority(e.target.checked)}
            className="w-4 h-4 accent-[#00e599] rounded cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={!name || phone.length < 10 || isSubmitting}
          className="w-full py-2.5 mt-2 rounded-md bg-[#00e599] hover:bg-[#00c985] disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-black font-bold text-xs transition-colors cursor-pointer flex justify-center items-center gap-2"
        >
          {isSubmitting ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <PlusCircle className="w-3.5 h-3.5" /> Issue Walk-In Token
            </>
          )}
        </button>
      </form>
    </div>
  );
};
