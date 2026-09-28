import React, { useState } from 'react';
import { Users, Search, RefreshCw, Bell, Play, UserMinus, Trash2 } from 'lucide-react';
import { QueueItem } from '../../types';

interface LiveMasterQueueProps {
  queue: QueueItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onStatusChange: (item: QueueItem, newStatus: string) => void;
  onDelete: (item: QueueItem) => void;
  onPing: (item: QueueItem) => void;
}

export const LiveMasterQueue: React.FC<LiveMasterQueueProps> = ({
  queue,
  isLoading,
  onRefresh,
  onStatusChange,
  onDelete,
  onPing,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const filtered = queue.filter((p) => {
    const matches =
      !searchTerm ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id?.toString().includes(searchTerm) ||
      p.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone?.includes(searchTerm);

    if (!matches) return false;
    if (filterStatus === 'All') return true;
    if (filterStatus === 'In Room') return p.status?.toLowerCase() === 'consulting';
    return p.status === filterStatus;
  });

  return (
    <div className="bg-[#0c1017] rounded-lg p-6 border border-slate-800 font-sans">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <h3 className="text-base font-bold text-white">Live Patient Master Queue</h3>
          <p className="text-[11px] text-slate-400">Receptionist Control & Routing Center</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search token, patient, doc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-[#07090e] border border-slate-700 rounded-md text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00e599] w-48 transition-colors"
            />
          </div>

          <div className="flex items-center bg-[#07090e] p-0.5 rounded-md border border-slate-800 text-xs font-semibold">
            {['All', 'Waiting', 'In Room', 'No-Show'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                  filterStatus === s ? 'bg-[#00e599] text-black font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={onRefresh}
            title="Sync Live Queue"
            className="p-2 border border-slate-700 bg-[#07090e] rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#00e599]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Queue List Table */}
      {filtered.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800/80">
                <th className="pb-2.5 pl-2 w-24">Token</th>
                <th className="pb-2.5">Patient Details</th>
                <th className="pb-2.5">Source</th>
                <th className="pb-2.5">Assigned Doctor</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filtered.map((p) => {
                const isConsulting = p.status?.toLowerCase() === 'consulting';
                const isNoShow = p.status === 'No-Show';

                return (
                  <tr key={p.id} className={`transition-colors ${isConsulting ? 'bg-[#00e599]/5' : 'hover:bg-slate-800/30'}`}>
                    <td className="py-3.5 pl-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                          isConsulting
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-[#00e599]'
                            : p.priority
                            ? 'bg-red-950/60 border-red-500/40 text-red-400'
                            : 'bg-slate-900 border-slate-800 text-white'
                        }`}
                      >
                        #{p.id}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className="font-bold text-white block">{p.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {p.phone || 'No phone'} • Age {p.age || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className="text-slate-300 text-[11px]">{p.type || 'Walk-in'}</span>
                    </td>
                    <td className="py-3.5">
                      <span className="text-slate-200 font-semibold block">{p.doctor_name || 'Unassigned'}</span>
                      <span className="text-[10px] text-slate-400">{p.department}</span>
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border capitalize ${
                          isConsulting
                            ? 'bg-emerald-950/80 border-emerald-500/40 text-[#00e599]'
                            : isNoShow
                            ? 'bg-red-950/60 border-red-500/40 text-red-400'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onPing(p)}
                          title="Ping Patient SMS Alert"
                          className="p-1.5 rounded bg-[#07090e] border border-slate-700 hover:border-amber-500/40 text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onStatusChange(p, isConsulting ? 'Completed' : 'Consulting')}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                            isConsulting
                              ? 'bg-slate-800 hover:bg-slate-700 text-white'
                              : 'bg-[#00e599] hover:bg-[#00c985] text-black'
                          }`}
                        >
                          {isConsulting ? 'Complete' : 'Start'}
                        </button>

                        <button
                          onClick={() => onDelete(p)}
                          title="Remove from queue"
                          className="p-1.5 rounded bg-[#07090e] border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 text-center text-slate-500">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
          <p className="font-semibold text-sm text-white">No patients found in queue</p>
          <p className="text-xs text-slate-500 mt-0.5">Use Walk-In Intake or Patient Portal to register patients.</p>
        </div>
      )}
    </div>
  );
};
