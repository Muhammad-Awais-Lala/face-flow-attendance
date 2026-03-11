import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  User, 
  Activity,
  Mail,
  ShieldAlert,
  Terminal,
  Video
} from 'lucide-react';

// --- Utility Functions ---
const generateId = () => Math.random().toString(36).substr(2, 9).toUpperCase();
const getCurrentTime = () => new Date().toLocaleTimeString('en-US', { hour12: false });
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- Simulated AI Models & Data ---
const DENOMINATIONS = [10, 20, 50, 100, 500, 1000, 5000];

const generateTransaction = () => {
  const amountToPay = randomInt(50, 4500);
  let paymentReceived = 0;
  let receivedNotes = [];
  
  // Simulate AI scanning notes
  while (paymentReceived < amountToPay) {
    const note = DENOMINATIONS[randomInt(0, DENOMINATIONS.length - 1)];
    if (paymentReceived + note <= amountToPay + 5000) {
      paymentReceived += note;
      receivedNotes.push(note);
    }
  }
  
  const changeGiven = paymentReceived - amountToPay;
  const latency = randomInt(800, 4500); // ms
  
  return {
    id: `TXN-${generateId()}`,
    time: getCurrentTime(),
    amountDue: amountToPay,
    received: paymentReceived,
    change: changeGiven,
    notes: receivedNotes,
    latency: latency,
    flagged: latency > 3000 // Flag if it takes more than 3 seconds to close drawer
  };
};

export default function Muzammil() {
  const [transactions, setTransactions] = useState([]);
  const [cashierPresent, setCashierPresent] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [stats, setStats] = useState({ totalProcessed: 0, avgLatency: 0, flags: 0 });

  // --- Simulation Engine ---
  useEffect(() => {
    // 1. Transaction Simulation Loop
    const txnInterval = setInterval(() => {
      setIsScanning(true);
      
      setTimeout(() => {
        const newTxn = generateTransaction();
        setTransactions(prev => [newTxn, ...prev].slice(0, 50)); // Keep last 50
        
        setStats(prev => {
          const newTotal = prev.totalProcessed + newTxn.received;
          const newAvg = prev.avgLatency === 0 ? newTxn.latency : Math.round((prev.avgLatency * 9 + newTxn.latency) / 10);
          return {
            totalProcessed: newTotal,
            avgLatency: newAvg,
            flags: prev.flags + (newTxn.flagged ? 1 : 0)
          };
        });
        
        setIsScanning(false);
      }, 1500); // Simulate AI processing time
      
    }, randomInt(6000, 12000)); // New customer every 6-12 seconds

    // 2. Cashier Absence Simulation Loop
    const absenceInterval = setInterval(() => {
      const isAbsent = Math.random() > 0.85; // 15% chance to simulate leaving
      if (isAbsent && cashierPresent) {
        setCashierPresent(false);
        const alertId = generateId();
        const alertTime = getCurrentTime();
        
        setAlerts(prev => [{
          id: alertId,
          time: alertTime,
          message: "Cashier Absence Detected (ROI Exited)",
          type: "critical"
        }, ...prev]);

        // Simulate SMTP Alert Dispatch
        setTimeout(() => {
          setAlerts(prev => [{
            id: `SMTP-${alertId}`,
            time: getCurrentTime(),
            message: `SMTP Alert dispatched to admin@muz-retail.com`,
            type: "system"
          }, ...prev]);
        }, 1000);

        // Auto-return after some time
        setTimeout(() => {
          setCashierPresent(true);
          setAlerts(prev => [{
            id: generateId(),
            time: getCurrentTime(),
            message: "Cashier Returned to ROI",
            type: "resolved"
          }, ...prev]);
        }, randomInt(5000, 10000));
      }
    }, 15000);

    return () => {
      clearInterval(txnInterval);
      clearInterval(absenceInterval);
    };
  }, [cashierPresent]);

  return (
    <div className="min-h-screen bg-[#0A1118] text-[#F5F5F5] font-sans selection:bg-[#2E865F] selection:text-white">
      {/* Top Navigation Bar */}
      <header className="bg-[#101A26] border-b border-[#1E2E40] px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="bg-[#2E865F] p-2 rounded-lg shadow-[0_0_15px_rgba(46,134,95,0.4)]">
            <Activity size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Muz Analyzer</h1>
            <p className="text-xs text-[#8A9BB0] uppercase tracking-wider font-semibold">Enterprise POS Vision - Lane 04</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex flex-col items-end">
            <span className="text-sm text-[#8A9BB0]">System Status</span>
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E865F] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2E865F]"></span>
              </span>
              <span className="text-sm font-semibold text-[#2E865F]">Gemini 2.0 Active</span>
            </div>
          </div>
          <div className="h-8 w-px bg-[#1E2E40]"></div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-[#8A9BB0] tabular-nums">{getCurrentTime()}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#1E2E40] flex items-center justify-center border border-[#2A3A4C]">
              <User size={20} className="text-[#8A9BB0]" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="p-6 max-w-screen-2xl mx-auto space-y-6">
        
        {/* Critical Absence Alert Banner */}
        {!cashierPresent && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 flex items-center justify-between animate-pulse shadow-[0_0_30px_rgba(255,0,0,0.15)]">
            <div className="flex items-center space-x-4">
              <div className="bg-red-500/20 p-3 rounded-full">
                <ShieldAlert size={28} className="text-[#FF0000]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#FF0000]">CRITICAL: Cashier Absence Detected</h2>
                <p className="text-sm text-red-200">Lane 04 workstation abandoned. Drawer unverified. Automated SMTP alert dispatched to loss prevention.</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-red-300 font-bold uppercase tracking-wider mb-1">Time Elapsed</p>
              <p className="text-2xl font-mono text-[#FF0000] tabular-nums">&lt; 30s</p>
            </div>
          </div>
        )}

        {/* Top KPIs - Z-Pattern Hierarchy */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPICard 
            title="Total Cash Processed" 
            value={`₨ ${stats.totalProcessed.toLocaleString()}`} 
            icon={<DollarSign size={20} />} 
            color="green"
          />
          <KPICard 
            title="Avg Drawer Latency" 
            value={`${stats.avgLatency} ms`} 
            icon={<Clock size={20} />} 
            color={stats.avgLatency > 3000 ? "orange" : "blue"}
          />
          <KPICard 
            title="Transactions Flagged" 
            value={stats.flags.toString()} 
            icon={<AlertTriangle size={20} />} 
            color={stats.flags > 0 ? "red" : "gray"}
          />
          <KPICard 
            title="Cashier Presence" 
            value={cashierPresent ? "Active / In ROI" : "Absent"} 
            icon={<User size={20} />} 
            color={cashierPresent ? "green" : "red"}
          />
        </div>

        {/* Main Grid: Live Feed & Transaction Log */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: AI Vision Feed & Analytics */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Live Camera Feed Simulation */}
            <div className="bg-[#101A26] rounded-xl border border-[#1E2E40] overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-[#1E2E40] flex justify-between items-center bg-[#142030]">
                <div className="flex items-center space-x-2">
                  <Video size={16} className="text-[#8A9BB0]" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8A9BB0]">Live Vision Feed</h3>
                </div>
                <span className="text-xs bg-[#2E865F]/20 text-[#2E865F] px-2 py-1 rounded font-mono font-bold">RTSP: LIVE</span>
              </div>
              
              <div className="relative aspect-video bg-[#05080C] overflow-hidden group">
                {/* Simulated Camera Static/Noise Background */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700 via-slate-900 to-black"></div>
                
                {/* Cashier ROI Boundary */}
                <div className={`absolute inset-4 border-2 border-dashed rounded-lg transition-colors duration-500 ${cashierPresent ? 'border-[#2E865F]/40' : 'border-[#FF0000]/60 bg-red-500/5'}`}>
                  <p className={`absolute -top-3 left-4 px-2 text-[10px] font-mono uppercase ${cashierPresent ? 'bg-[#101A26] text-[#2E865F]' : 'bg-[#101A26] text-[#FF0000]'}`}>
                    Cashier ROI {cashierPresent ? '(Occupied)' : '(EMPTY)'}
                  </p>
                </div>

                {/* Customer Approach / Scanning Simulation */}
                {isScanning && (
                  <>
                    <div className="absolute top-1/4 right-1/4 w-32 h-40 border border-[#4299E1] bg-[#4299E1]/10 rounded shadow-[0_0_15px_rgba(66,153,225,0.5)] flex items-center justify-center">
                       <span className="absolute -top-5 left-0 text-[#4299E1] text-[10px] font-mono">Person_ReID: Active</span>
                       <div className="w-full h-0.5 bg-[#4299E1] opacity-70 animate-scan"></div>
                    </div>
                    
                    {/* Hand/Currency Tracking box */}
                    <div className="absolute bottom-1/4 left-1/3 w-24 h-24 border border-[#EAB308] bg-[#EAB308]/10 rounded">
                      <span className="absolute -top-5 left-0 text-[#EAB308] text-[10px] font-mono">Hand_Track: Currency</span>
                    </div>
                  </>
                )}

                {/* Overlays */}
                <div className="absolute bottom-2 left-2 flex items-center space-x-2">
                  <div className="bg-black/60 px-2 py-1 rounded text-[10px] font-mono text-white backdrop-blur-sm">CAM_04_OVERHEAD</div>
                  <div className="bg-black/60 px-2 py-1 rounded text-[10px] font-mono text-[#2E865F] backdrop-blur-sm">FPS: 59.9</div>
                </div>
                <div className="absolute top-2 right-2 flex space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* System Event Log */}
            <div className="bg-[#101A26] rounded-xl border border-[#1E2E40] overflow-hidden flex flex-col h-[300px]">
              <div className="px-4 py-3 border-b border-[#1E2E40] flex justify-between items-center bg-[#142030]">
                <div className="flex items-center space-x-2">
                  <Terminal size={16} className="text-[#8A9BB0]" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8A9BB0]">Security Event Stream</h3>
                </div>
              </div>
              <div className="p-4 overflow-y-auto font-mono text-xs space-y-3 flex-1">
                {alerts.length === 0 ? (
                  <p className="text-[#4A5B70] italic">No active security events.</p>
                ) : (
                  alerts.map(alert => (
                    <div key={alert.id} className={`flex items-start space-x-3 pb-2 border-b border-[#1E2E40]/50 ${
                      alert.type === 'critical' ? 'text-[#FF0000]' : 
                      alert.type === 'resolved' ? 'text-[#2E865F]' : 'text-[#4299E1]'
                    }`}>
                      <span className="opacity-70 tabular-nums">[{alert.time}]</span>
                      <span>{alert.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Transaction Data Table */}
          <div className="lg:col-span-2 bg-[#101A26] rounded-xl border border-[#1E2E40] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#1E2E40] flex justify-between items-center bg-[#142030]">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8A9BB0]">Real-Time Transaction Ledger</h3>
              <div className="flex space-x-2">
                <span className="px-2 py-1 bg-[#1E2E40] rounded text-xs text-[#8A9BB0]">Showing Last 50</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-[#8A9BB0] uppercase bg-[#142030] sticky top-0 border-b border-[#1E2E40]">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Session ID / Time</th>
                    <th className="px-6 py-3 font-semibold">Payment Received</th>
                    <th className="px-6 py-3 font-semibold">Detected Notes (AI)</th>
                    <th className="px-6 py-3 font-semibold">Drawer Latency</th>
                    <th className="px-6 py-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2E40]">
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-[#4A5B70]">
                        <Camera size={32} className="mx-auto mb-3 opacity-50" />
                        <p>Awaiting customer arrivals at POS...</p>
                      </td>
                    </tr>
                  )}
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-[#1A2639] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-mono text-[#E2E8F0]">{txn.id}</div>
                        <div className="text-xs text-[#8A9BB0] tabular-nums mt-1">{txn.time}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[#2E865F] font-semibold tabular-nums">₨ {txn.received.toLocaleString()}</div>
                        <div className="text-xs text-[#8A9BB0] tabular-nums mt-1">Change: ₨ {txn.change.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {txn.notes.map((note, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-[#1E2E40] border border-[#2A3A4C] rounded text-xs tabular-nums text-[#CBD5E1]">
                              {note}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center space-x-2 font-mono tabular-nums ${txn.flagged ? 'text-[#FF0000] font-bold' : 'text-[#E2E8F0]'}`}>
                          <span>{txn.latency} ms</span>
                          {txn.flagged && <AlertTriangle size={14} />}
                        </div>
                        {/* Inline micro-chart for visual context */}
                        <div className="w-24 h-1.5 bg-[#1E2E40] rounded mt-2 overflow-hidden">
                          <div 
                            className={`h-full ${txn.flagged ? 'bg-[#FF0000]' : 'bg-[#4299E1]'}`} 
                            style={{ width: `${Math.min((txn.latency / 4000) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {txn.flagged ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-red-500/10 text-[#FF0000] border border-red-500/20 text-xs font-semibold uppercase">
                            <span>Review</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[#2E865F]/10 text-[#2E865F] border border-[#2E865F]/20 text-xs font-semibold uppercase">
                            <CheckCircle2 size={12} />
                            <span>Cleared</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Global CSS for custom animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(160px); }
          100% { transform: translateY(0); }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}} />
    </div>
  );
}

// --- Reusable UI Components ---

function KPICard({ title, value, icon, color }) {
  const colorMap = {
    green: "text-[#2E865F] bg-[#2E865F]/10 border-[#2E865F]/30",
    red: "text-[#FF0000] bg-[#FF0000]/10 border-[#FF0000]/30",
    orange: "text-[#EAB308] bg-[#EAB308]/10 border-[#EAB308]/30",
    blue: "text-[#4299E1] bg-[#4299E1]/10 border-[#4299E1]/30",
    gray: "text-[#8A9BB0] bg-[#1E2E40] border-[#2A3A4C]"
  };

  const iconColors = {
    green: "text-[#2E865F]",
    red: "text-[#FF0000]",
    orange: "text-[#EAB308]",
    blue: "text-[#4299E1]",
    gray: "text-[#8A9BB0]"
  };

  return (
    <div className="bg-[#101A26] rounded-xl border border-[#1E2E40] p-5 flex items-start justify-between relative overflow-hidden group">
      {/* Subtle top border highlight */}
      <div className={`absolute top-0 left-0 w-full h-0.5 bg-current opacity-20 ${iconColors[color]}`}></div>
      
      <div>
        <h3 className="text-[#8A9BB0] text-xs font-semibold uppercase tracking-wider mb-2">{title}</h3>
        <p className={`text-2xl font-bold font-mono tabular-nums ${iconColors[color]}`}>{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${colorMap[color]} transition-colors`}>
        {icon}
      </div>
    </div>
  );
}