import React, { useState, useEffect } from 'react';
import { Building2, ClipboardList, ListOrdered, Users, BarChart2, Lock } from 'lucide-react';
import { QueueItem } from '../../types';
import { walkInClient } from '../../services/walkInService';
import { queueService } from '../../services/queueService';
import { WalkInIntake } from './WalkInIntake';
import { LiveMasterQueue } from './LiveMasterQueue';
import { AllPatientsView } from './AllPatientsView';
import { AnalyticsView } from './AnalyticsView';
import { useTheme } from '../../context/ThemeContext';
import { realtimeService } from '../../services/realtimeService';
import { ThemeToggle } from '../../components/ThemeToggle';

interface ReceptionistDashboardProps {
  onBack: () => void;
}

export const ReceptionistDashboard: React.FC<ReceptionistDashboardProps> = ({ onBack }) => {
  const { isDark } = useTheme();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [tab, setTab] = useState<'intake' | 'queue' | 'all' | 'analytics'>('intake');
  const [isLoading, setIsLoading] = useState(false);

  const syncQueue = async () => {
    setIsLoading(true);
    try {
      const res = await walkInClient.getQueue();
      if (res && res.data && Array.isArray(res.data)) {
        const normalized: QueueItem[] = res.data.map((item: any) => ({
          id: String(item.token_number || item.id),
          rawId: item.id,
          name: item.patient_name || item.name,
          phone: item.phone || '',
          age: item.age || 30,
          type: item.patient_type || item.type || 'Walk-in',
          scheduled: item.scheduled_time || item.scheduled || (item.priority ? 'Immediate' : 'In Queue'),
          status: item.status || 'Waiting',
          doctor_name: item.doctor_name || 'Unassigned',
          department: item.department || 'General Medicine',
          priority: Boolean(item.priority),
        }));
        setQueue(normalized);
        queueService.setLocalQueue(normalized);
        setIsLoading(false);
        return;
      }
      throw new Error('Invalid response format');
    } catch (err) {
      const local = queueService.getLocalQueue();
      setQueue(local);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    syncQueue();
    const handleStorage = () => {
      setQueue(queueService.getLocalQueue());
    };
    window.addEventListener('storage', handleStorage);
    // Realtime Supabase changes
    const unsubscribe = realtimeService.subscribe((event) => {
      syncQueue();
    });
    const interval = setInterval(syncQueue, 8000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleWalkInAdded = (item: QueueItem) => {
    const updated = [...queue];
    if (item.priority) {
      if (updated.length > 0 && updated[0].status?.toLowerCase() === 'consulting') {
        updated.splice(1, 0, item);
      } else {
        updated.unshift(item);
      }
    } else {
      updated.push(item);
    }
    setQueue(updated);
    queueService.setLocalQueue(updated);
  };

  const handleStatusChange = async (item: QueueItem, newStatus: string) => {
    const updated = queue.map((q) => (q.id === item.id ? { ...q, status: newStatus as any } : q));
    setQueue(updated);
    queueService.setLocalQueue(updated);
    try {
      if (item.rawId) {
        await walkInClient.updateStatus(item.rawId, newStatus);
      }
    } catch (err) {}
  };

  const handleDelete = (item: QueueItem) => {
    const updated = queue.filter((q) => q.id !== item.id);
    setQueue(updated);
    queueService.setLocalQueue(updated);
  };

  const handlePing = (item: QueueItem) => {
    alert(`Notification ping dispatched to patient ${item.name} (${item.phone})`);
  };

  return (
    <div className={`flex flex-col md:flex-row min-h-screen font-sans transition-colors duration-200 ${
      isDark ? 'bg-[#07090e] text-white' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Sidebar Navigation */}
      <aside className={`w-full md:w-64 border-r flex flex-col justify-between p-5 ${
        isDark ? 'bg-[#0c1017] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-[#00c985] ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-emerald-50 border-emerald-200'
              }`}>
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h1 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Reception Desk</h1>
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Station Kiosk #01</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setTab('intake')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
                tab === 'intake'
                  ? isDark ? 'bg-[#0f1523] text-[#00e599] border-l-2 border-[#00e599]' : 'bg-emerald-50 text-[#009b62] border-l-2 border-[#009b62]'
                  : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Walk-In Intake</span>
            </button>

            <button
              onClick={() => setTab('queue')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
                tab === 'queue'
                  ? isDark ? 'bg-[#0f1523] text-[#00e599] border-l-2 border-[#00e599]' : 'bg-emerald-50 text-[#009b62] border-l-2 border-[#009b62]'
                  : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>Live Queue</span>
            </button>

            <button
              onClick={() => setTab('all')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
                tab === 'all'
                  ? isDark ? 'bg-[#0f1523] text-[#00e599] border-l-2 border-[#00e599]' : 'bg-emerald-50 text-[#009b62] border-l-2 border-[#009b62]'
                  : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>All Patients</span>
            </button>

            <button
              onClick={() => setTab('analytics')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
                tab === 'analytics'
                  ? isDark ? 'bg-[#0f1523] text-[#00e599] border-l-2 border-[#00e599]' : 'bg-emerald-50 text-[#009b62] border-l-2 border-[#009b62]'
                  : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Analytics</span>
            </button>
          </nav>
        </div>

        <div className={`pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <button
            onClick={onBack}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              isDark
                ? 'bg-[#0c1017] hover:bg-red-500/10 text-slate-400 hover:text-red-400 border-slate-800 hover:border-red-500/30'
                : 'bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border-slate-200 hover:border-red-300'
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Secure Logout
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        {/* Top Section Header */}
        <div className={`flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 pb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div>
            <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {tab === 'intake' && 'Walk-In Patient Intake'}
              {tab === 'queue' && 'Live Master Queue Orchestration'}
              {tab === 'all' && 'All Patient Consult History'}
              {tab === 'analytics' && 'Operational Throughput Analytics'}
            </h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {tab === 'intake' && 'Register incoming walk-in patients and assign instantaneous priority tokens.'}
              {tab === 'queue' && 'Real-time multi-doctor queue tracking, room routing, and patient notifications.'}
              {tab === 'all' && 'Aggregated logs of all patient consultations, arrival times, and medical departments.'}
              {tab === 'analytics' && 'Live metrics on waiting times, room utilization, and clinic velocity.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border ${
              isDark
                ? 'bg-[#00e599]/10 text-[#00e599] border-[#00e599]/30'
                : 'bg-emerald-50 text-[#009b62] border-emerald-200'
            }`}>
              <span className="w-2 h-2 rounded-full bg-[#00c985] animate-pulse"></span>
              {queue.filter((q) => q.status !== 'No-Show').length} Active in Queue
            </span>
          </div>
        </div>

        {/* View Contents */}
        <div>
          {tab === 'intake' && (
            <div className="max-w-xl">
              <WalkInIntake onWalkInAdded={handleWalkInAdded} />
            </div>
          )}

          {tab === 'queue' && (
            <LiveMasterQueue
              queue={queue}
              isLoading={isLoading}
              onRefresh={syncQueue}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onPing={handlePing}
            />
          )}

          {tab === 'all' && <AllPatientsView queue={queue} />}

          {tab === 'analytics' && <AnalyticsView />}
        </div>
      </main>
    </div>
  );
};
