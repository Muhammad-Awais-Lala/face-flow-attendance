
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { storageService } from '../services/storageService';
import { recognizeEmployee } from '../services/geminiService';
import { AttendanceLog, Employee } from '../types';

export const AttendanceTerminal: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastLog, setLastLog] = useState<AttendanceLog | null>(null);
  const [lastDetected, setLastDetected] = useState<{ id: string, time: number } | null>(null);
  const [currentConfidence, setCurrentConfidence] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [showFallback, setShowFallback] = useState(false);
  const [fallbackSearch, setFallbackSearch] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error' | 'loading' | 'warning', message: string }>({
    type: 'idle',
    message: 'Biometric Ready'
  });

  const employees = storageService.getEmployees();

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setStatus({ type: 'error', message: 'Camera access denied.' });
      }
    }
    setupCamera();
  }, []);

  useEffect(() => {
    let timer: number;
    if (cooldown > 0) {
      timer = window.setTimeout(() => setCooldown(prev => prev - 1), 1000);
    } else if (cooldown === 0) {
      setStatus(prev => prev.type === 'warning' ? { type: 'idle', message: 'Biometric Ready' } : prev);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const captureStabilizedFrame = async (video: HTMLVideoElement, canvas: HTMLCanvasElement): Promise<string> => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return "";
    canvas.width = 640;
    canvas.height = 360;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const handleManualLog = (employee: Employee) => {
    const log = storageService.logAttendance(employee);
    setLastLog(log);
    setStatus({ 
      type: 'success', 
      message: `Manual Log: ${log.checkOut ? 'Exit' : 'Entry'} Confirmed: ${employee.name}` 
    });
    setShowFallback(false);
    setTimeout(() => {
      setStatus({ type: 'idle', message: 'Biometric Ready' });
    }, 3000);
  };

  const handleScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing || cooldown > 0) return;

    setIsProcessing(true);
    setCurrentConfidence(0);
    setStatus({ type: 'loading', message: 'Analyzing Biometrics...' });

    try {
      const frameData = await captureStabilizedFrame(videoRef.current, canvasRef.current);
      const result = await recognizeEmployee(frameData, employees);
      
      setCurrentConfidence(result.confidence);

      if (result.matchId === "QUOTA_EXCEEDED") {
        setStatus({ type: 'warning', message: 'API QUOTA EXHAUSTED' });
        setCooldown(30);
        return;
      }

      if (result.matchId) {
        const now = Date.now();
        if (lastDetected && lastDetected.id === result.matchId && (now - lastDetected.time) < 30000) {
          setStatus({ type: 'idle', message: 'Recently Logged.' });
          return;
        }

        const matchedEmployee = employees.find(e => e.id === result.matchId);
        if (matchedEmployee) {
          const log = storageService.logAttendance(matchedEmployee);
          setLastLog(log);
          setLastDetected({ id: matchedEmployee.id, time: now });
          setStatus({ 
            type: 'success', 
            message: `${log.checkOut ? 'Exit' : 'Entry'} Confirmed: ${matchedEmployee.name}` 
          });
        }
      } else {
        setStatus({ type: 'error', message: result.message || 'Face Verification Failed.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Scan Error.' });
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setStatus(prev => {
          if (prev.type === 'success' || prev.type === 'error') {
            setCurrentConfidence(0);
            return { type: 'idle', message: 'Biometric Ready' };
          }
          return prev;
        });
      }, 3000);
    }
  }, [employees, isProcessing, lastDetected, cooldown]);

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentConfidence * circumference);

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(fallbackSearch.toLowerCase()) || 
    e.designation.toLowerCase().includes(fallbackSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto p-4">
      <div className="flex-1 space-y-4">
        <div className="relative rounded-[3rem] overflow-hidden bg-gray-900 aspect-video shadow-2xl border-4 border-white group">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover opacity-80" />
          <canvas ref={canvasRef} className="hidden" />
          
          {showFallback && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 p-8 flex flex-col animate-in fade-in duration-300">
               <div className="flex justify-between items-center mb-6">
                  <h4 className="font-black text-gray-900 text-lg uppercase tracking-tight">Manual Attendance Fallback</h4>
                  <button onClick={() => setShowFallback(false)} className="text-gray-400 hover:text-red-500 font-bold text-xs uppercase">Close</button>
               </div>
               <input 
                type="text" 
                placeholder="Search employee by name..." 
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold mb-6 focus:ring-4 focus:ring-blue-500/10 outline-none"
                value={fallbackSearch}
                onChange={e => setFallbackSearch(e.target.value)}
                autoFocus
               />
               <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                  {filteredEmployees.map(emp => (
                    <button 
                      key={emp.id} 
                      onClick={() => handleManualLog(emp)}
                      className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:bg-blue-50 hover:border-blue-200 transition-all text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center font-black text-blue-600">{emp.name[0]}</div>
                        <div>
                          <div className="font-black text-gray-900 text-sm">{emp.name}</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase">{emp.designation}</div>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest">Select</div>
                    </button>
                  ))}
               </div>
            </div>
          )}

          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            {cooldown > 0 && (
              <div className="bg-red-600/90 backdrop-blur-xl px-8 py-4 rounded-3xl text-center border border-red-400 shadow-2xl animate-in zoom-in-95 duration-300">
                <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">API Cooldown</p>
                <p className="text-2xl font-black text-white">{cooldown}s</p>
              </div>
            )}
            
            <div className={`relative w-64 h-64 flex items-center justify-center ${cooldown > 0 ? 'opacity-20 grayscale' : ''}`}>
              <div className={`absolute inset-0 border border-white/5 rounded-full transition-all duration-1000 ${isProcessing ? 'scale-110 border-blue-500/50' : ''}`}>
                <div className="absolute -top-1 -left-1 w-10 h-10 border-t-2 border-l-2 border-white/30 rounded-tl-[1.5rem]" />
                <div className="absolute -top-1 -right-1 w-10 h-10 border-t-2 border-r-2 border-white/30 rounded-tr-[1.5rem]" />
                <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-2 border-l-2 border-white/30 rounded-bl-[1.5rem]" />
                <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-2 border-r-2 border-white/30 rounded-br-[1.5rem]" />
              </div>

              <svg className="absolute w-[280px] h-[280px] -rotate-90 transform" viewBox="0 0 256 256">
                <circle cx="128" cy="128" r={radius} stroke="currentColor" strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" fill="transparent" className={`transition-all duration-700 ${currentConfidence > 0.8 ? 'text-green-500' : 'text-blue-500'}`} style={{ filter: 'drop-shadow(0 0 8px currentColor)' }} />
              </svg>

              {currentConfidence > 0 && (
                <div className="absolute bg-white/10 backdrop-blur-xl px-4 py-1 rounded-full border border-white/20">
                  <span className="text-[10px] font-black text-white">SCORE: {Math.round(currentConfidence * 100)}%</span>
                </div>
              )}
            </div>
          </div>

          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <button
              onClick={handleScan}
              disabled={isProcessing || cooldown > 0}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all active:scale-95 ${
                isProcessing || cooldown > 0 ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-white hover:bg-blue-50 text-blue-600'
              }`}
            >
              {isProcessing ? 'VERIFYING...' : cooldown > 0 ? 'COOLDOWN ACTIVE' : 'MANUAL SCAN'}
            </button>
          </div>
        </div>

        {status.type === 'warning' ? (
          <div className="bg-red-50 border border-red-200 p-6 rounded-3xl flex flex-col items-center gap-4 animate-in slide-in-from-top-2">
             <div className="flex items-center gap-2 text-red-700 font-black text-[10px] uppercase tracking-widest">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Quota Exhausted
             </div>
             <p className="text-[11px] text-red-600 text-center font-medium">Your Gemini API key has exceeded its rate limits. Facial recognition is temporarily unavailable.</p>
             
             <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setShowFallback(true)}
                  className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
                >
                  Manual Backup Log
                </button>
                <a 
                  href="https://ai.google.dev/gemini-api/docs/billing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-2xl text-center font-black text-[9px] uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg active:scale-95"
                >
                  Upgrade Key
                </a>
             </div>
          </div>
        ) : (
          <div className={`p-4 rounded-2xl border text-center font-black uppercase tracking-widest text-[10px] transition-all ${
            status.type === 'success' ? 'bg-green-600 border-green-700 text-white' :
            status.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
            'bg-white border-gray-100 text-gray-400'
          }`}>
            {status.message}
          </div>
        )}
      </div>

      <div className="w-full md:w-80 space-y-4">
        <h3 className="text-xl font-black text-gray-900 tracking-tight">Identity Record</h3>
        {lastLog ? (
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl">{lastLog.employeeName[0]}</div>
              <div>
                <div className="font-black text-gray-900 text-sm">{lastLog.employeeName}</div>
                <div className="text-[10px] text-blue-600 font-bold uppercase">{lastLog.designation}</div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-50 flex justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Timestamp</span>
              <span className="text-[10px] font-black text-gray-900">{lastLog.checkIn}</span>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2.5rem] p-12 text-center text-gray-300">
            <p className="font-bold text-[9px] uppercase tracking-widest">Awaiting Scan</p>
          </div>
        )}
      </div>
    </div>
  );
};
