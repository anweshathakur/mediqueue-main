import React, { useState } from 'react';
import { Users, Search, RefreshCw, Bell, Play, UserMinus, Trash2 } from 'lucide-react';
import { QueueItem } from '../../types';
import { useTheme } from '../../context/ThemeContext';

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
  const { isDark } = useTheme();
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
    <div className={`rounded-xl p-6 border font-sans transition-colors ${
      isDark ? 'bg-[#0c1017] border-slate-800 text-white' : 'bg-white border-slate-200 shadow-sm text-slate-900'
    }`}>
      {/* Header & Filter Controls */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b ${
        isDark ? 'border-slate-800' : 'border-slate-100'
      }`}>
        <div>
          <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Live Patient Master Queue</h3>
          <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Receptionist Control & Routing Center</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search token, patient, doc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-8 pr-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:border-[#00c985] w-48 transition-colors ${
                isDark ? 'bg-[#07090e] border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>

          <div className={`flex items-center p-0.5 rounded-lg border text-xs font-semibold ${
            isDark ? 'bg-[#07090e] border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            {['All', 'Waiting', 'In Room'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
                  filterStatus === status
                    ? 'bg-[#00c985] text-white font-bold shadow-xs'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <button
            onClick={onRefresh}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark ? 'bg-[#07090e] border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Refresh Live Queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#00c985]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className={`border-b uppercase text-[10px] font-bold tracking-wider ${
              isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
            }`}>
              <th className="pb-2.5 pl-2">Token</th>
              <th className="pb-2.5">Patient Details</th>
              <th className="pb-2.5">Doctor & Dept</th>
              <th className="pb-2.5">Status</th>
              <th className="pb-2.5 text-right pr-2">Quick Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y font-medium ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className={`py-8 text-center text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  No active patients found matching current filter.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isConsulting = item.status?.toLowerCase() === 'consulting';

                return (
                  <tr key={item.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                    <td className="py-3 pl-2">
                      <span className={`font-mono font-bold text-xs ${item.priority ? 'text-red-500' : 'text-[#00c985]'}`}>
                        #{item.id}
                      </span>
                      {item.priority && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] font-bold">
                          EMG
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</span>
                      <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.phone || 'No phone'} • {item.type}</span>
                    </td>
                    <td className="py-3">
                      <span className={`font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.doctor_name || 'Unassigned'}</span>
                      <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.department || 'General Medicine'}</span>
                    </td>
                    <td className="py-3">
                      {isConsulting ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[#00c985] text-[10px] font-bold">
                          In Room
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                          isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}>
                          {item.status || 'Waiting'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onPing(item)}
                          className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                            isDark ? 'bg-[#07090e] border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                          title="Ping Patient"
                        >
                          <Bell className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onStatusChange(item, 'Consulting')}
                          className="px-2 py-1 rounded-md bg-[#009b62] hover:bg-[#008754] text-white font-bold text-[10px] transition-colors cursor-pointer shadow-xs"
                          title="Call into Room"
                        >
                          Admit
                        </button>
                        <button
                          onClick={() => onDelete(item)}
                          className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                            isDark ? 'bg-[#07090e] border-slate-800 text-slate-400 hover:text-red-400' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-red-600'
                          }`}
                          title="Remove from Queue"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
