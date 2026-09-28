import React from 'react';
import { Users } from 'lucide-react';
import { QueueItem } from '../../types';
import { queueService } from '../../services/queueService';

interface AllPatientsViewProps {
  queue: QueueItem[];
}

export const AllPatientsView: React.FC<AllPatientsViewProps> = ({ queue }) => {
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
    <div className="bg-[#0c1017] rounded-lg p-6 border border-slate-800 font-sans">
      <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-800/80">
        <div className="w-9 h-9 rounded-md bg-[#00e599]/10 border border-[#00e599]/30 flex items-center justify-center text-[#00e599]">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">All Patients Roster</h3>
          <p className="text-[11px] text-slate-400">Aggregated Master Record of Live and Past Consultations</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <th className="pb-2.5 pl-2">Patient</th>
              <th className="pb-2.5">Type</th>
              <th className="pb-2.5">Doctor</th>
              <th className="pb-2.5 text-right pr-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {all.map((p) => (
              <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3.5 pl-2 font-bold text-white">{p.name}</td>
                <td className="py-3.5">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                      p.type === 'Online'
                        ? 'bg-blue-950/60 text-blue-400 border-blue-500/30'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    {p.type}
                  </span>
                </td>
                <td className="py-3.5 text-slate-300">{p.doctor_name || 'Unassigned'}</td>
                <td className="py-3.5 text-right pr-2">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                      p.displayStatus === 'Consulted'
                        ? 'bg-slate-900 text-slate-400 border-slate-800'
                        : p.displayStatus === 'In Room'
                        ? 'bg-emerald-950/60 text-[#00e599] border-emerald-500/30'
                        : 'bg-slate-800 text-white border-slate-700'
                    }`}
                  >
                    {p.displayStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
