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
          priority: Boolean(item.priority)
        }));
        setQueue(normalized);
        queueService.setLocalQueue(normalized);
        setIsLoading(false);
        return;
      }
      throw new Error("Invalid response format");
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
    const updated = queue.map(item => (item.id === p.id || item.rawId === p.rawId) ? { ...item, status: newStatus as any } : item);
    setQueue(updated);
    queueService.setLocalQueue(updated);

    try {
      const targetId = String(p.rawId || p.id);
      await walkInClient.updateStatus(targetId, newStatus);
    } catch (e) {
      console.warn("Backend status update error:", e);
    }
  };

  const handleDelete = async (p: QueueItem) => {
    if (!window.confirm(`Are you sure you want to remove Token #${p.id} (${p.name}) from queue?`)) {
      return;
    }
    const updated = queue.filter(item => item.id !== p.id && item.rawId !== p.rawId);
    setQueue(updated);
    queueService.setLocalQueue(updated);

    try {
      const targetId = String(p.rawId || p.id);
      await walkInClient.deleteWalkIn(targetId);
    } catch (e) {
      console.warn("Backend delete error:", e);
    }
  };

  const handlePing = (p: QueueItem) => {
    alert(`Dispatched alert to patient ${p.name} (${p.phone || 'In Lobby'}): Doctor is ready for consultation!`);
  };

  return (
    <div className="flex w-full min-h-screen bg-black text-white">
      {/* Dark Cyber Sidebar */}
      <div className="w-64 bg-[#080a0f] text-white flex flex-col border-r border-slate-800/80 z-20 sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[#00e599]">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight leading-tight">Receptionist<br /><span className="text-[#00e599]">Command Desk</span></h1>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1.5 mt-4">
          <button
            onClick={() => setTab('intake')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              tab === 'intake' ? 'bg-[#131720] text-[#00e599] border border-slate-800 shadow-[0_0_20px_rgba(0,229,153,0.1)]' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Walk-In Intake
          </button>
          <button
            onClick={() => setTab('queue')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              tab === 'queue' ? 'bg-[#131720] text-[#00e599] border border-slate-800 shadow-[0_0_20px_rgba(0,229,153,0.1)]' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <ListOrdered className="w-4 h-4" /> Live Queue
          </button>
          <button
            onClick={() => setTab('all')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              tab === 'all' ? 'bg-[#131720] text-[#00e599] border border-slate-800 shadow-[0_0_20px_rgba(0,229,153,0.1)]' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> All Patients
          </button>
          <button
            onClick={() => setTab('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              tab === 'analytics' ? 'bg-[#131720] text-[#00e599] border border-slate-800 shadow-[0_0_20px_rgba(0,229,153,0.1)]' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4" /> Analytics
          </button>
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800/80">
          <button onClick={onBack} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-950/20 hover:bg-red-950/40 text-red-400 rounded-xl font-bold text-xs transition-all border border-red-500/20 cursor-pointer">
            <Lock className="w-4 h-4" /> Secure Logout
          </button>
        </div>
      </div>

      {/* Main Panel View */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-black relative">
        {/* Background Grid Pattern */}
        <div 
          className="absolute inset-0 pointer-events-none z-0" 
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Top Header */}
        <header className="bg-[#080a0f]/80 backdrop-blur-2xl border-b border-slate-800/80 px-8 py-5 flex items-center justify-between z-10 sticky top-0 shadow-sm">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              {tab === 'intake' && 'Walk-In Intake'}
              {tab === 'queue' && 'Live Queue Management'}
              {tab === 'all' && 'All Patient Records'}
              {tab === 'analytics' && 'Operational Analytics'}
            </h2>
            <p className="text-xs font-semibold text-slate-400">
              {tab === 'intake' && 'Register new walk-in patient and assign instantaneous queue token'}
              {tab === 'queue' && 'Live queue orchestration, patient status updates, and call routing'}
              {tab === 'all' && 'Aggregated history of active and completed patient consultations'}
              {tab === 'analytics' && 'Real-time patient throughput, department workload, and velocity metrics'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 bg-emerald-950/60 text-[#00e599] border border-emerald-500/30 rounded-xl text-xs font-extrabold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00e599] animate-pulse"></span>
              {queue.filter(q => q.status !== 'No-Show').length} Active in Queue
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 overflow-y-auto flex-1 relative z-10">
          {tab === 'intake' && (
            <div className="max-w-2xl mx-auto py-4">
              <WalkInIntake onWalkInAdded={handleWalkInAdded} />
            </div>
          )}

          {tab === 'queue' && (
            <div className="w-full">
              <LiveMasterQueue
                queue={queue}
                isLoading={isLoading}
                onRefresh={syncQueue}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onPing={handlePing}
              />
            </div>
          )}

          {tab === 'all' && (
            <div className="w-full">
              <AllPatientsView queue={queue} />
            </div>
          )}

          {tab === 'analytics' && (
            <div className="w-full">
              <AnalyticsView />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
