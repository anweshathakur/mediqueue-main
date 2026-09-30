import React, { useState } from 'react';
import { User, Phone, Flame, PlusCircle, RefreshCw } from 'lucide-react';
import { DEPARTMENTS, DOCTORS, QueueItem } from '../../types';
import { walkInClient } from '../../services/walkInService';
import { queueService } from '../../services/queueService';
import { useTheme } from '../../context/ThemeContext';

interface WalkInIntakeProps {
  onWalkInAdded: (item: QueueItem) => void;
}

export const WalkInIntake: React.FC<WalkInIntakeProps> = ({ onWalkInAdded }) => {
  const { isDark } = useTheme();
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
          name: res.data.patient_name || name,
          phone: res.data.phone || phone,
          age: res.data.age || (Number(age) || 30),
          type: 'Walk-in',
          scheduled: priority ? 'Immediate' : 'In Queue',
          status: 'Waiting',
          doctor_name: res.data.doctor_name || assignedDoctor,
          department: res.data.department || specialty,
          priority,
        };
      }
    } catch (err) {
      console.warn('Backend intake fallback to local memory state:', err);
    }

    if (!registeredToken) {
      registeredToken = {
        id: String(Math.floor(Math.random() * 90) + 10),
        name,
        phone,
        age: Number(age) || 30,
        type: 'Walk-in',
        scheduled: priority ? 'Immediate' : 'In Queue',
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
    <div className={`rounded-xl p-6 border font-sans transition-colors ${
      isDark ? 'bg-[#0c1017] border-slate-800 text-white' : 'bg-white border-slate-200 shadow-sm text-slate-900'
    }`}>
      <h3 className={`text-base font-bold mb-4 pb-3 border-b ${
        isDark ? 'border-slate-800 text-white' : 'border-slate-100 text-slate-900'
      }`}>
        Patient Walk-In Registration
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Phone Number</label>
          <div className="relative">
            <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={handlePhoneChange}
              maxLength={10}
              className={`w-full pl-9 pr-3 py-2 rounded-lg border text-xs font-mono font-bold focus:outline-none focus:border-[#00c985] ${
                isDark ? 'bg-[#07090e] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Patient Name</label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-xs font-medium focus:outline-none focus:border-[#00c985] ${
                isDark ? 'bg-[#07090e] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
              required
            />
          </div>

          <div className="space-y-1">
            <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Age</label>
            <input
              type="number"
              placeholder="e.g. 35"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-xs font-medium focus:outline-none focus:border-[#00c985] ${
                isDark ? 'bg-[#07090e] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Department</label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-xs font-medium focus:outline-none focus:border-[#00c985] cursor-pointer ${
                isDark ? 'bg-[#07090e] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Doctor</label>
            <select
              value={assignedDoctor}
              onChange={(e) => setAssignedDoctor(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-xs font-medium focus:outline-none focus:border-[#00c985] cursor-pointer ${
                isDark ? 'bg-[#07090e] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option value="Unassigned">Any Available</option>
              {DOCTORS.map((doc) => (
                <option key={doc.id} value={doc.name}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer ${
          priority
            ? 'bg-red-500/10 border-red-500/30'
            : isDark ? 'bg-[#07090e] border-slate-800' : 'bg-slate-50 border-slate-200'
        }`} onClick={() => setPriority(!priority)}>
          <div className="flex items-center gap-2">
            <Flame className={`w-4 h-4 ${priority ? 'text-red-500' : 'text-slate-400'}`} />
            <span className={`text-xs font-bold ${priority ? 'text-red-500' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>Emergency / Critical Case</span>
          </div>
          <input
            type="checkbox"
            checked={priority}
            onChange={(e) => setPriority(e.target.checked)}
            className="w-4 h-4 accent-red-500 cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 rounded-lg bg-[#009b62] hover:bg-[#008754] text-white font-bold text-xs transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Issuing Token...
            </>
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
