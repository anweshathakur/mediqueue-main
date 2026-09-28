import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';

interface RescheduleModalProps {
  appointment: any;
  onClose: () => void;
  onConfirm: (newTime: string) => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({ appointment, onClose, onConfirm }) => {
  const [selectedTime, setSelectedTime] = useState(appointment?.scheduled || '03:30 PM');
  const SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 font-sans">
      <div className="bg-[#0c1017] border border-slate-800 rounded-lg p-6 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800/80">
          <div className="w-8 h-8 rounded-md bg-[#00e599]/10 border border-[#00e599]/30 flex items-center justify-center text-[#00e599]">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Reschedule Visit</h3>
            <p className="text-[11px] text-slate-400">Select an updated consultation slot</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-4 font-medium">
          Patient: <span className="text-white font-bold">{appointment?.name || 'Patient'}</span> (#{appointment?.id || 'apt'})
        </p>

        <div className="space-y-2 mb-6">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Available Consultation Slots</label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedTime(slot)}
                className={`py-2 px-3 rounded-md text-xs font-semibold transition-colors border cursor-pointer ${
                  selectedTime === slot
                    ? 'bg-[#00e599] text-black border-[#00e599]'
                    : 'bg-[#07090e] text-slate-300 border-slate-700 hover:border-slate-600 hover:text-white'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-md border border-slate-700 bg-[#07090e] text-slate-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedTime)}
            className="flex-1 py-2 rounded-md bg-[#00e599] hover:bg-[#00c985] text-black font-bold text-xs transition-colors cursor-pointer"
          >
            Confirm Slot
          </button>
        </div>
      </div>
    </div>
  );
};
