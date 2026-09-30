import React from 'react';
import { Users } from 'lucide-react';
import { QueueItem } from '../../types';
import { queueService } from '../../services/queueService';
import { useTheme } from '../../context/ThemeContext';

interface AllPatientsViewProps {
  queue: QueueItem[];
}

export const AllPatientsView: React.FC<AllPatientsViewProps> = ({ queue }) => {
  const { isDark } = useTheme();
  const history = queueService.getLocalHistory();

  const all = [
    ...history.map((h) => ({
      id: `H-${h.id}`,
      name: h.patient_name,
      type: h.patient_type || 'Walk-in',
      doctor_name: h.doctor_name,
      displayStatus: 'Consulted',
      isHistory: true,
    })),
    ...queue.map((q) => ({
      id: q.id,
      name: q.name,
      type: q.type,
      doctor_name: q.doctor_name,
      displayStatus:
        q.status === 'Consulting'
          ? 'In Room'
          : q.status === 'No-Show'
          ? 'No-Show'
          : q.scheduled,
      isHistory: false,
      raw: q,
    })),
  ];

  return (
    <div className={`rounded-xl p-6 border font-sans transition-colors ${
      isDark ? 'bg-[#0c1017] border-slate-800 text-white' : 'bg-white border-slate-200 shadow-sm text-slate-900'
    }`}>
      <div className={`flex items-center gap-3 mb-6 pb-3 border-b ${
        isDark ? 'border-slate-800' : 'border-slate-100'
      }`}>
        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center text-[#00c985] ${
          isDark ? 'bg-[#00e599]/10 border-[#00e599]/30' : 'bg-emerald-50 border-emerald-200'
        }`}>
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>All Patients Roster</h3>
          <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Aggregated Master Record of Live and Past Consultations</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className={`border-b uppercase text-[10px] font-bold tracking-wider ${
              isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
            }`}>
              <th className="pb-2.5 pl-2">Patient</th>
              <th className="pb-2.5">Type</th>
              <th className="pb-2.5">Doctor</th>
              <th className="pb-2.5 text-right pr-2">Status</th>
            </tr>
          </thead>
          <tbody className={`divide-y font-medium ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
            {all.length === 0 ? (
              <tr>
                <td colSpan={4} className={`py-6 text-center text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  No patient logs recorded yet.
                </td>
              </tr>
            ) : (
              all.map((item, i) => (
                <tr key={i} className={`transition-colors ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                  <td className={`py-3 pl-2 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {item.name}
                    <span className={`block font-mono text-[10px] font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>#{item.id}</span>
                  </td>
                  <td className={`py-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{item.type}</td>
                  <td className={`py-3 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.doctor_name || 'Unassigned'}</td>
                  <td className="py-3 text-right pr-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      item.displayStatus === 'Consulted'
                        ? isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                        : isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-[#00e599]' : 'bg-emerald-50 border-emerald-200 text-[#009b62]'
                    }`}>
                      {item.displayStatus}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
