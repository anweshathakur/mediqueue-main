import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface RescheduleModalProps {
  appointment: any;
  onClose: () => void;
  onConfirm: (newTime: string) => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({ appointment, onClose, onConfirm }) => {
  const { isDark } = useTheme();
  const [selectedTime, setSelectedTime] = useState(appointment?.scheduled || '03:30 PM');
  const SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className={`rounded-xl p-6 max-w-md w-full border shadow-2xl relative transition-colors ${
        isDark ? 'bg-[#0c1017] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <button
          onClick={onClose}
          className={`absolute right-4 top-4 p-1.5 rounded-lg transition-colors cursor-pointer ${
            isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        <div className={`flex items-center gap-3 mb-5 pb-3 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-[#00c985] ${
            isDark ? 'bg-[#00e599]/10 border-[#00e599]/30' : 'bg-emerald-50 border-emerald-200'
          }`}>
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Reschedule Visit</h3>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Select an updated consultation slot</p>
          </div>
        </div>

        <p className={`text-xs mb-4 font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Patient: <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{appointment?.name || 'Patient'}</span> (#{appointment?.id || 'apt'})
        </p>

        <div className="space-y-2 mb-6">
          <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Available Consultation Slots</label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedTime(slot)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors border cursor-pointer ${
                  selectedTime === slot
                    ? 'bg-[#009b62] text-white border-[#009b62] shadow-xs'
                    : isDark
                    ? 'bg-[#07090e] text-slate-300 border-slate-700 hover:border-slate-600 hover:text-white'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <div className={`flex gap-2 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <button
            onClick={onClose}
            className={`flex-1 py-2 rounded-lg border font-semibold text-xs transition-colors cursor-pointer ${
              isDark ? 'border-slate-700 bg-[#07090e] text-slate-300 hover:text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedTime)}
            className="flex-1 py-2 rounded-lg bg-[#009b62] hover:bg-[#008754] text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
          >
            Confirm Slot
          </button>
        </div>
      </div>
    </div>
  );
};
