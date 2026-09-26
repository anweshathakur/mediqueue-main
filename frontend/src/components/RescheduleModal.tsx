import React, { useState } from 'react';
import { X, Clock, CalendarDays } from 'lucide-react';

interface RescheduleModalProps {
  appointment: any;
  onClose: () => void;
  onConfirm: (newTime: string) => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({ appointment, onClose, onConfirm }) => {
  const [selectedTime, setSelectedTime] = useState(appointment?.scheduled || '3:30 PM');
  const SLOTS = ['02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b0d12] border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
        <button onClick={onClose} className="absolute right-6 top-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Reschedule Visit</h3>
            <p className="text-xs text-slate-400">Select an updated consultation slot</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-4 font-semibold">
          Patient: <span className="text-[#00e599]">{appointment?.name}</span> (#{appointment?.id})
        </p>

        <div className="space-y-2 mb-6">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Slots Today</label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedTime(slot)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                  selectedTime === slot
                    ? 'bg-[#00e599] text-black border-[#00e599] shadow-[0_0_15px_rgba(0,229,153,0.3)]'
                    : 'bg-[#131720] text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-800 bg-[#131720] text-slate-400 hover:text-white font-bold text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedTime)}
            className="flex-1 py-3 rounded-xl bg-[#00e599] hover:bg-[#00c985] text-black font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(0,229,153,0.25)] cursor-pointer"
          >
            Confirm Slot
          </button>
        </div>
      </div>
    </div>
  );
};
