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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const filtered = queue.filter(p => {
    const matches = !searchTerm ||
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
    <div className="bg-[#0b0d12] rounded-3xl p-8 border border-slate-800/80 flex flex-col h-full shadow-2xl">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[#00e599]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Live Patient Master Queue</h3>
            <p className="text-xs font-semibold text-slate-400">Receptionist Control & Routing Center</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search token, patient, doc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs font-semibold bg-[#131720] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00e599]/30 focus:border-[#00e599] w-48 transition-all"
            />
          </div>

          <div className="flex items-center bg-[#131720] p-1 rounded-xl text-xs font-bold border border-slate-800">
            {['All', 'Waiting', 'In Room', 'No-Show'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  filterStatus === s ? 'bg-[#00e599] text-black shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={onRefresh}
            title="Sync Live Queue"
            className="p-2 border border-slate-800 bg-[#131720] rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#00e599]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Queue List Table */}
      {filtered.length > 0 ? (
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800/80">
                <th className="pb-4 pl-2 font-bold w-24">Token</th>
                <th className="pb-4 font-bold">Patient Details</th>
                <th className="pb-4 font-bold">Source</th>
                <th className="pb-4 font-bold">Assigned Doctor</th>
                <th className="pb-4 font-bold">Status</th>
                <th className="pb-4 font-bold text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs font-medium divide-y divide-slate-800/50">
              {filtered.map((p) => {
                const isConsulting = p.status?.toLowerCase() === 'consulting';
                const isNoShow = p.status === 'No-Show';
                const isWaiting = !isConsulting && !isNoShow;

                return (
                  <tr key={p.id} className={`transition-colors ${isConsulting ? 'bg-emerald-950/20' : 'hover:bg-slate-900/40'}`}>
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center justify-center min-w-[3.2rem] px-2 py-1 rounded-lg text-xs font-black border ${
                          isConsulting 
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-[#00e599]' 
                            : p.priority 
                            ? 'bg-red-950/60 border-red-500/40 text-red-400' 
                            : 'bg-slate-900 border-slate-800 text-white'
                        }`}>
                          #{p.id}
                        </span>
                      </div>
                      {p.priority && (
                        <span className="inline-block mt-1 text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-red-500 text-white tracking-wider">
                          Critical
                        </span>
                      )}
                    </td>

                    <td className="py-4">
                      <div className="font-bold text-white text-sm">{p.name}</div>
                      <div className="text-slate-400 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                        <span>{p.phone || 'No Phone'}</span>
                        {p.age && <span>• {p.age} yrs</span>}
                      </div>
                    </td>

                    <td className="py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold border ${
                        p.type === 'Online'
                          ? 'bg-blue-950/60 border-blue-500/30 text-blue-400'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}>
                        {p.type}
                      </span>
                      {p.department && (
                        <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{p.department}</div>
                      )}
                    </td>

                    <td className="py-4">
                      <span className="text-slate-300 font-semibold text-xs">{p.doctor_name || 'Unassigned'}</span>
                    </td>

                    <td className="py-4">
                      {isConsulting ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#00e599] bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00e599]"></span> In Room
                        </span>
                      ) : isNoShow ? (
                        <span className="inline-flex items-center text-xs font-extrabold text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/30">
                          No-Show
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-bold text-slate-300 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                          Waiting ({p.scheduled || 'Queued'})
                        </span>
                      )}
                    </td>

                    <td className="py-4 text-right pr-2">
                      <div className="flex justify-end items-center gap-1.5">
                        <button
                          onClick={() => onPing(p)}
                          title="Alert Patient"
                          className="w-8 h-8 rounded-lg border border-slate-800 bg-[#131720] text-amber-400 hover:border-amber-500/40 flex items-center justify-center transition-all cursor-pointer"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>

                        {isWaiting && (
                          <button
                            onClick={() => onStatusChange(p, 'Consulting')}
                            title="Call to Room"
                            className="w-8 h-8 rounded-lg border border-emerald-500/30 bg-emerald-950/40 text-[#00e599] hover:bg-emerald-950/70 flex items-center justify-center transition-all cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-[#00e599]" />
                          </button>
                        )}

                        {isWaiting && (
                          <button
                            onClick={() => onStatusChange(p, 'No-Show')}
                            title="Mark No-Show"
                            className="w-8 h-8 rounded-lg border border-slate-800 bg-[#131720] text-slate-400 hover:text-amber-400 hover:border-amber-500/30 flex items-center justify-center transition-all cursor-pointer"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isNoShow && (
                          <button
                            onClick={() => onStatusChange(p, 'Waiting')}
                            title="Requeue Patient"
                            className="w-8 h-8 rounded-lg border border-blue-500/30 bg-blue-950/40 text-blue-400 hover:bg-blue-950/70 flex items-center justify-center transition-all cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => onDelete(p)}
                          title="Remove from Queue"
                          className="w-8 h-8 rounded-lg border border-slate-800 bg-[#131720] text-slate-400 hover:text-red-400 hover:border-red-500/30 flex items-center justify-center transition-all cursor-pointer"
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
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-16">
          <Users className="w-16 h-16 mb-4 opacity-20" />
          <p className="font-bold text-base text-slate-300">No active patients found in queue</p>
          <p className="text-xs text-slate-500 mt-1">{searchTerm ? 'Try adjusting your search query' : 'Use the intake panel on the left to register a new walk-in patient'}</p>
        </div>
      )}
    </div>
  );
};
