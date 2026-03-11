
import React from 'react';
import { storageService } from '../services/storageService';

export const LogsTable: React.FC = () => {
  const logs = [...storageService.getAttendanceLogs()].reverse();

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden max-w-6xl mx-auto">
      <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Attendance History</h2>
          <p className="text-gray-500 text-sm">View all check-in and check-out logs.</p>
        </div>
        <button 
          onClick={() => {
            const csv = [
              ['Date', 'Name', 'Designation', 'Check In', 'Check Out', 'Late Arrival'].join(','),
              ...logs.map(log => [
                log.date, 
                log.employeeName, 
                log.designation, 
                log.checkIn, 
                log.checkOut || '-',
                log.isLate ? 'YES' : 'NO'
              ].join(','))
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('hidden', '');
            a.setAttribute('href', url);
            a.setAttribute('download', `attendance_${new Date().toLocaleDateString()}.csv`);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-8 py-5">Date</th>
              <th className="px-8 py-5">Staff Member</th>
              <th className="px-8 py-5">Check In</th>
              <th className="px-8 py-5">Check Out</th>
              <th className="px-8 py-5">Status / Alerts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.length > 0 ? logs.map((log) => {
              const isToday = log.date === new Date().toLocaleDateString();
              const isMissed = !isToday && !log.checkOut;

              return (
                <tr key={log.id} className={`hover:bg-gray-50/50 transition-colors ${isMissed ? 'bg-red-50/30' : ''}`}>
                  <td className="px-8 py-5 text-sm font-bold text-gray-500">{log.date}</td>
                  <td className="px-8 py-5">
                    <div className="font-black text-gray-900 leading-tight">{log.employeeName}</div>
                    <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wide">{log.designation}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <span className="font-black text-gray-700 text-sm">{log.checkIn}</span>
                       {log.isLate && (
                         <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black rounded-md border border-red-200 uppercase tracking-tighter">LATE</span>
                       )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {log.checkOut ? (
                      <span className="font-black text-gray-700 text-sm">{log.checkOut}</span>
                    ) : (
                      <span className={`text-[10px] font-black px-3 py-1 rounded-lg ${isMissed ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {isMissed ? 'MISSED LOGOUT' : 'PENDING'}
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${log.checkOut ? 'text-gray-400' : isMissed ? 'text-red-600' : 'text-blue-500'}`}>
                      <div className={`w-2 h-2 rounded-full ${log.checkOut ? 'bg-gray-300' : isMissed ? 'bg-red-500 animate-pulse' : 'bg-blue-500 animate-pulse'}`} />
                      {log.checkOut ? 'SHIFT COMPLETED' : isMissed ? 'SYSTEM EXCEPTION' : 'CURRENTLY ON-SITE'}
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={5} className="px-8 py-32 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="font-black uppercase tracking-widest text-xs">Database Empty</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
