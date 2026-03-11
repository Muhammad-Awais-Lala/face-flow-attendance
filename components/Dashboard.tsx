
import React from 'react';
import { storageService } from '../services/storageService';
import { AppView } from '../types';

interface Props {
  onViewChange: (view: AppView) => void;
}

export const Dashboard: React.FC<Props> = ({ onViewChange }) => {
  const employees = storageService.getEmployees();
  const logs = storageService.getAttendanceLogs();
  const usage = storageService.getApiUsage();
  const today = new Date().toLocaleDateString();
  
  const todayLogs = logs.filter(log => log.date === today);
  const presentCount = new Set(todayLogs.map(l => l.employeeId)).size;
  const onSiteCount = todayLogs.filter(l => !l.checkOut).length;

  const isExhausted = usage.lastStatus === 'exhausted';

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">System Console</h2>
          <p className="text-gray-500 font-medium">Operations metrics and AI usage tracking.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
           <div className="flex flex-col text-right">
              <span className="text-[9px] font-black text-gray-400 uppercase">API Quota Health</span>
              <span className={`text-[10px] font-black ${isExhausted ? 'text-red-500' : 'text-green-500'}`}>
                {isExhausted ? 'QUOTA EXHAUSTED' : usage.quotaViolations > 10 ? 'DEGRADED' : 'EXCELLENT'}
              </span>
           </div>
           <div className={`w-3 h-3 rounded-full ${isExhausted ? 'bg-red-500 animate-pulse' : usage.quotaViolations > 10 ? 'bg-amber-500' : 'bg-green-500'}`} />
        </div>
      </div>

      {isExhausted && (
        <div className="bg-red-50 border border-red-100 p-6 rounded-[2rem] flex items-center justify-between gap-6 shadow-sm animate-in slide-in-from-top-4">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                 ⚠️
              </div>
              <div>
                 <h4 className="font-black text-red-900 text-sm uppercase tracking-widest leading-none mb-1">Quota Warning</h4>
                 <p className="text-xs text-red-700 font-medium opacity-80">Recognition system is offline due to API rate limits. Manual backup active in Terminal.</p>
              </div>
           </div>
           <button 
            onClick={() => onViewChange(AppView.SETTINGS)}
            className="bg-red-600 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-sm hover:bg-red-700 transition-all"
           >
              MANAGE API KEY
           </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Staff Records" value={employees.length} icon="👥" color="blue" />
        <StatCard title="On-Site" value={onSiteCount} icon="🏢" color="indigo" />
        <StatCard title="API Requests" value={usage.totalRequests} icon="⚡" color="green" />
        <StatCard title="Rate Errors" value={usage.quotaViolations} icon="⚠️" color="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-600 rounded-full" />
              Live Activity
            </h3>
            {todayLogs.length > 0 ? (
              <div className="space-y-4">
                {todayLogs.slice(-4).reverse().map(log => (
                  <div key={log.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black">
                        {log.employeeName[0]}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{log.employeeName}</div>
                        <div className="text-[9px] text-blue-600 font-black uppercase">{log.designation}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-gray-900">{log.checkOut ? `EXIT: ${log.checkOut}` : `ENTRY: ${log.checkIn}`}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-gray-300 border-2 border-dashed border-gray-100 rounded-3xl">
                <p className="font-bold uppercase tracking-widest text-[10px]">No logs today</p>
              </div>
            )}
            <button onClick={() => onViewChange(AppView.LOGS)} className="w-full mt-6 py-4 border-2 border-dashed border-gray-100 text-gray-400 hover:text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">View All logs</button>
          </div>
        </div>

        <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white shadow-2xl space-y-8">
           <h3 className="font-black text-xl tracking-tight">System Health</h3>
           <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                 <p className="text-[10px] font-black text-blue-400 uppercase mb-1">API Reliability</p>
                 <div className="text-2xl font-black">
                    {usage.totalRequests > 0 ? Math.round(((usage.totalRequests - usage.quotaViolations) / usage.totalRequests) * 100) : 100}%
                 </div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                 <p className="text-[10px] font-black text-green-400 uppercase mb-1">Database Sync</p>
                 <div className="text-2xl font-black">ACTIVE</div>
              </div>
           </div>
           <button onClick={() => onViewChange(AppView.ATTENDANCE)} className="w-full py-4 bg-blue-600 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Launch Terminal</button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: { title: string, value: number, icon: string, color: string }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600'
  };
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all hover:border-blue-100">
      <div className={`w-12 h-12 ${colors[color]} rounded-xl flex items-center justify-center text-xl mb-4 shadow-sm`}>{icon}</div>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <div className="text-3xl font-black text-gray-900 tracking-tighter">{value}</div>
    </div>
  );
};
