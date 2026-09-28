import React, { useState, useEffect } from 'react';
import { Building2, ClipboardList, ListOrdered, Users, BarChart2, Lock } from 'lucide-react';
import { QueueItem } from '../../types';
import { walkInClient } from '../../services/walkInService';
import { queueService } from '../../services/queueService';
import { WalkInIntake } from './WalkInIntake';
import { LiveMasterQueue } from './LiveMasterQueue';
import { AllPatientsView } from './AllPatientsView';
import { AnalyticsView } from './AnalyticsView';

interface ReceptionistDashboardProps {
  onBack: () => void;
}

export const ReceptionistDashboard: React.FC<ReceptionistDashboardProps> = ({ onBack }) => {
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
    const interval = setInterval(syncQueue, 8000);
    return () => {
      window.removeEventListener('storage', handleStorage);
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

  const handleStatusChange = async (p: QueueItem, newStatus: string) => {
    const updated = queue.map((item) =>
      item.id === p.id || item.rawId === p.rawId ? { ...item, status: newStatus as any } : item
    );
    setQueue(updated);
    queueService.setLocalQueue(updated);

    try {
      const targetId = String(p.rawId || p.id);
      await walkInClient.updateStatus(targetId, newStatus);
    } catch (e) {
      console.warn('Backend status update error:', e);
    }
  };

  const handleDelete = async (p: QueueItem) => {
    if (!window.confirm(`Are you sure you want to remove Token #${p.id} (${p.name}) from queue?`)) {
      return;
    }
    const updated = queue.filter((item) => item.id !== p.id && item.rawId !== p.rawId);
    setQueue(updated);
    queueService.setLocalQueue(updated);

    try {
      const targetId = String(p.rawId || p.id);
      await walkInClient.deleteWalkIn(targetId);
    } catch (e) {
      console.warn('Backend delete error:', e);
    }
  };

  const handlePing = (p: QueueItem) => {
    alert(`Dispatched alert to patient ${p.name} (${p.phone || 'In Lobby'}): Doctor is ready for consultation!`);
  };

  return (
    <div className="flex w-full min-h-[calc(100vh-64px)] bg-[#07090e] text-white font-sans">
      {/* Left Sidebar */}
      <aside className="w-60 bg-[#080b12] text-white flex flex-col justify-between border-r border-slate-800/80 p-4 shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-2 pt-2">
            <div className="w-7 h-7 rounded-md bg-[#00e599]/10 border border-[#00e599]/30 flex items-center justify-center text-[#00e599]">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">Reception Desk</h1>
              <p className="text-[10px] text-slate-400 font-medium">Station Kiosk #01</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setTab('intake')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer text-left ${
                tab === 'intake'
                  ? 'bg-[#0f1523] text-[#00e599] border-l-2 border-[#00e599]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Walk-In Intake</span>
            </button>

            <button
              onClick={() => setTab('queue')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer text-left ${
                tab === 'queue'
                  ? 'bg-[#0f1523] text-[#00e599] border-l-2 border-[#00e599]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>Live Queue</span>
            </button>

            <button
              onClick={() => setTab('all')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer text-left ${
                tab === 'all'
                  ? 'bg-[#0f1523] text-[#00e599] border-l-2 border-[#00e599]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>All Patients</span>
            </button>

            <button
              onClick={() => setTab('analytics')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer text-left ${
                tab === 'analytics'
                  ? 'bg-[#0f1523] text-[#00e599] border-l-2 border-[#00e599]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Analytics</span>
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800/80">
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#0c1017] hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-md text-xs font-semibold border border-slate-800 hover:border-red-500/30 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" /> Secure Logout
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl">
        {/* Top Section Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {tab === 'intake' && 'Walk-In Patient Intake'}
              {tab === 'queue' && 'Live Master Queue Orchestration'}
              {tab === 'all' && 'All Patient Consult History'}
              {tab === 'analytics' && 'Operational Throughput Analytics'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {tab === 'intake' && 'Register incoming walk-in patients and assign instantaneous priority tokens.'}
              {tab === 'queue' && 'Real-time multi-doctor queue tracking, room routing, and patient notifications.'}
              {tab === 'all' && 'Aggregated logs of all patient consultations, arrival times, and medical departments.'}
              {tab === 'analytics' && 'Live metrics on waiting times, room utilization, and clinic velocity.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-[#00e599]/10 text-[#00e599] border border-[#00e599]/30 rounded-md text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00e599] animate-pulse"></span>
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
