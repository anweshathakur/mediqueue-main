import React from 'react';
import { Users, CheckCircle2 } from 'lucide-react';
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
      isHistory: true
    })),
    ...queue.map(q => ({
      id: q.id,
      name: q.name,
      type: q.type,
      doctor_name: q.doctor_name,
      displayStatus: q.status === 'Consulting' ? 'In Room' : q.status === 'No-Show' ? 'No-Show' : q.scheduled,
      isHistory: false,
      raw: q
    }))
  ];

  return (
    <div className="lg:col-span-12 bg-[#0b0d12] rounded-3xl p-8 border border-slate-800/80 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[#00e599]">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-white">All Patients Roster</h3>
          <p className="text-xs font-semibold text-slate-400">Aggregated Master Record of Live and Past Consultations</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="pb-3 pl-2">Patient</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Doctor</th>
              <th className="pb-3 text-right pr-2">Status</th>
            </tr>
          </thead>
          <tbody className="text-xs divide-y divide-slate-800/50 font-medium">
            {all.map((p) => (
              <tr key={p.id} className="hover:bg-slate-900/30 transition-colors">
                <td className="py-4 pl-2 font-bold text-white text-sm">{p.name}</td>
                <td className="py-4">
                  <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                    p.type === 'Online' ? 'bg-blue-950/60 text-blue-400 border border-blue-500/30' : 'bg-slate-900 text-slate-300 border border-slate-800'
                  }`}>
                    {p.type}
                  </span>
                </td>
                <td className="py-4 text-slate-400">{p.doctor_name || 'Unassigned'}</td>
                <td className="py-4 text-right pr-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${
                    p.displayStatus === 'Consulted' 
                      ? 'bg-slate-900 text-slate-400 border border-slate-800'
                      : p.displayStatus === 'In Room'
                      ? 'bg-emerald-950/60 text-[#00e599] border border-emerald-500/30 animate-pulse'
                      : 'bg-slate-800 text-white'
                  }`}>
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
