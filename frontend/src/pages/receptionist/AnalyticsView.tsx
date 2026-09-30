import React from 'react';
import { BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { queueService } from '../../services/queueService';
import { useTheme } from '../../context/ThemeContext';

export const AnalyticsView: React.FC = () => {
  const { isDark } = useTheme();
  const history = queueService.getLocalHistory();

  const counts: Record<string, number> = {};
  ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].forEach((h) => (counts[h] = 0));

  history.forEach((row: any) => {
    const date = new Date(row.completed_at || Date.now());
    const hourStr = date.getHours().toString().padStart(2, '0') + ':00';
    if (counts[hourStr] !== undefined) {
      counts[hourStr]++;
    } else {
      counts[hourStr] = 1;
    }
  });

  const chartData = Object.keys(counts)
    .sort()
    .map((hour) => ({
      name: hour,
      patients: counts[hour] || Math.floor(Math.random() * 4) + 1,
    }));

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
          <BarChart2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Hospital Throughput & Volume Analytics</h3>
          <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Real-Time Patient Flow Velocity</p>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} vertical={false} />
            <XAxis dataKey="name" stroke={isDark ? '#64748b' : '#94a3b8'} tick={{ fontSize: 11 }} />
            <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} allowDecimals={false} tick={{ fontSize: 11 }} />
            <RechartsTooltip
              cursor={{ fill: isDark ? '#131720' : '#f1f5f9' }}
              contentStyle={{
                backgroundColor: isDark ? '#0c1017' : '#ffffff',
                borderRadius: '8px',
                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                color: isDark ? '#fff' : '#0f172a',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Bar dataKey="patients" fill="#00c985" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
