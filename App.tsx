
// import React, { useState, useEffect } from 'react';
// import { AppView, AttendanceLog } from './types';
// import { AttendanceTerminal } from './components/AttendanceTerminal';
// import { RegistrationForm } from './components/RegistrationForm';
// import { LogsTable } from './components/LogsTable';
// import { EmployeeList } from './components/EmployeeList';
// import { SettingsPanel } from './components/SettingsPanel';
// import { Dashboard } from './components/Dashboard';
// import { AdminLogin } from './components/AdminLogin';
// import { storageService } from './services/storageService';

// const App: React.FC = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
//   const [currentView, setCurrentView] = useState<AppView>(AppView.ATTENDANCE);
//   const [alerts, setAlerts] = useState<AttendanceLog[]>([]);
//   const settings = storageService.getSettings();

//   useEffect(() => {
//     if (settings.enableNotifications && isAuthenticated) {
//       const missed = storageService.getMissedCheckouts();
//       setAlerts(missed);
//     }
//   }, [currentView, settings.enableNotifications, isAuthenticated]);

//   const handleLogout = () => {
//     setIsAuthenticated(false);
//     setCurrentView(AppView.ATTENDANCE);
//   };

//   const NavItem = ({ view, icon, label, badge, disabled }: { view: AppView, icon: React.ReactNode, label: string, badge?: number, disabled?: boolean }) => (
//     <button
//       onClick={() => !disabled && setCurrentView(view)}
//       disabled={disabled}
//       className={`relative flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold transition-all w-full text-left ${
//         currentView === view 
//           ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 translate-x-1' 
//           : disabled 
//             ? 'text-gray-300 cursor-not-allowed opacity-50' 
//             : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
//       }`}
//     >
//       {icon}
//       {label}
//       {badge && badge > 0 && (
//         <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full ring-2 ring-white">
//           {badge}
//         </span>
//       )}
//     </button>
//   );

//   return (
//     <div className="min-h-screen flex bg-[#f8fafc]">
//       {/* Sidebar */}
//       <aside className="w-72 bg-white border-r border-gray-100 p-8 flex flex-col gap-10 sticky top-0 h-screen hidden lg:flex">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
//           </div>
//           <h1 className="text-xl font-black text-gray-900 tracking-tight">FaceFlow</h1>
//         </div>

//         <nav className="flex flex-col gap-2">
//           {isAuthenticated ? (
//             <>
//               <NavItem 
//                 view={AppView.DASHBOARD} 
//                 label="Dashboard"
//                 icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
//               />
//               <NavItem 
//                 view={AppView.ATTENDANCE} 
//                 label="Public Terminal"
//                 icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>}
//               />
//               <NavItem 
//                 view={AppView.LOGS} 
//                 label="Activity Logs"
//                 badge={alerts.length}
//                 icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 0 -2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
//               />
//               <NavItem 
//                 view={AppView.EMPLOYEES} 
//                 label="Staff Records"
//                 icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
//               />
//               <NavItem 
//                 view={AppView.REGISTER} 
//                 label="Onboard Staff"
//                 icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>}
//               />
//               <div className="mt-4 pt-4 border-t border-gray-50">
//                 <NavItem 
//                   view={AppView.SETTINGS} 
//                   label="Configuration"
//                   icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
//                 />
//               </div>
//             </>
//           ) : (
//             <>
//               <NavItem 
//                 view={AppView.ATTENDANCE} 
//                 label="Attendance Terminal"
//                 icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>}
//               />
//               <NavItem 
//                 view={AppView.LOGIN} 
//                 label="Admin Access"
//                 icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>}
//               />
//             </>
//           )}
//         </nav>

//         <div className="mt-auto space-y-4">
//           {isAuthenticated && (
//              <button 
//               onClick={handleLogout}
//               className="w-full flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-red-500 hover:bg-red-50 transition-all text-xs uppercase tracking-widest"
//              >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
//                 Sign Out
//              </button>
//           )}
//           <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
//             <p className="text-[10px] text-gray-400 leading-relaxed font-black uppercase tracking-widest">
//               {isAuthenticated ? 'Admin Session Active' : 'Public Kiosk Mode'} <br/>
//               Secure Biometric Auth
//             </p>
//           </div>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 overflow-y-auto">
//         <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 px-8 py-6 border-b border-gray-100 flex justify-between items-center lg:hidden">
//            <div className="flex items-center gap-3">
//             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
//             </div>
//             <h1 className="text-lg font-black text-gray-900 tracking-tight">FaceFlow</h1>
//           </div>
//           <div className="flex gap-4 overflow-x-auto whitespace-nowrap pb-2">
//              {!isAuthenticated ? (
//                <>
//                  <button onClick={() => setCurrentView(AppView.ATTENDANCE)} className={`p-2 rounded-lg text-sm ${currentView === AppView.ATTENDANCE ? 'text-blue-600 bg-blue-50 font-bold' : 'text-gray-400'}`}>Terminal</button>
//                  <button onClick={() => setCurrentView(AppView.LOGIN)} className={`p-2 rounded-lg text-sm ${currentView === AppView.LOGIN ? 'text-blue-600 bg-blue-50 font-bold' : 'text-gray-400'}`}>Login</button>
//                </>
//              ) : (
//                <>
//                  <button onClick={() => setCurrentView(AppView.DASHBOARD)} className={`p-2 rounded-lg text-sm ${currentView === AppView.DASHBOARD ? 'text-blue-600 bg-blue-50 font-bold' : 'text-gray-400'}`}>Stats</button>
//                  <button onClick={() => setCurrentView(AppView.ATTENDANCE)} className={`p-2 rounded-lg text-sm ${currentView === AppView.ATTENDANCE ? 'text-blue-600 bg-blue-50 font-bold' : 'text-gray-400'}`}>Terminal</button>
//                  <button onClick={() => setCurrentView(AppView.LOGS)} className={`p-2 rounded-lg text-sm ${currentView === AppView.LOGS ? 'text-blue-600 bg-blue-50 font-bold' : 'text-gray-400'}`}>History</button>
//                  <button onClick={handleLogout} className="p-2 rounded-lg text-sm text-red-500">Exit</button>
//                </>
//              )}
//           </div>
//         </header>

//         <div className="p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
//           {/* Global Alert Banner */}
//           {isAuthenticated && settings.enableNotifications && alerts.length > 0 && currentView !== AppView.LOGS && (
//             <div className="mb-8 max-w-6xl mx-auto animate-in slide-in-from-top-4 duration-500">
//               <div className="bg-red-50 border border-red-100 p-6 rounded-[2rem] flex items-center justify-between gap-6 shadow-sm">
//                 <div className="flex items-center gap-4">
//                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
//                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
//                    </div>
//                    <div>
//                       <h4 className="font-black text-red-900 text-sm uppercase tracking-widest leading-none mb-1">Anomalies Detected</h4>
//                       <p className="text-xs text-red-700 font-medium opacity-80">There are {alerts.length} missed shift terminations requiring review.</p>
//                    </div>
//                 </div>
//                 <button 
//                   onClick={() => setCurrentView(AppView.LOGS)}
//                   className="bg-white border border-red-200 text-red-600 px-6 py-2.5 rounded-xl text-xs font-black shadow-sm hover:bg-red-600 hover:text-white transition-all whitespace-nowrap"
//                 >
//                   RESOLVE NOW
//                 </button>
//               </div>
//             </div>
//           )}

//           {currentView === AppView.LOGIN && !isAuthenticated && (
//             <AdminLogin 
//               onLogin={() => {
//                 setIsAuthenticated(true);
//                 setCurrentView(AppView.DASHBOARD);
//               }}
//               onCancel={() => setCurrentView(AppView.ATTENDANCE)}
//             />
//           )}

//           {currentView === AppView.DASHBOARD && isAuthenticated && (
//             <Dashboard onViewChange={setCurrentView} />
//           )}

//           {currentView === AppView.ATTENDANCE && (
//             <div className="space-y-8">
//               <div className="max-w-6xl mx-auto flex justify-between items-end">
//                 <div>
//                   <h2 className="text-4xl font-black text-gray-900 mb-2">Check-In Terminal</h2>
//                   <p className="text-gray-500 font-medium">Position your face within the frame to verify identity.</p>
//                 </div>
//                 {!isAuthenticated && (
//                    <button 
//                     onClick={() => setCurrentView(AppView.LOGIN)}
//                     className="hidden sm:flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest mb-2 group"
//                    >
//                      <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
//                      Admin Entrance
//                    </button>
//                 )}
//               </div>
//               <AttendanceTerminal />
//             </div>
//           )}

//           {currentView === AppView.REGISTER && isAuthenticated && (
//             <div className="space-y-8">
//               <div className="max-w-3xl mx-auto">
//                 <h2 className="text-4xl font-black text-gray-900 mb-2">New Staff Onboarding</h2>
//                 <p className="text-gray-500 font-medium">Capture biometric reference data for a new employee.</p>
//               </div>
//               <RegistrationForm onSuccess={() => setCurrentView(AppView.EMPLOYEES)} />
//             </div>
//           )}

//           {currentView === AppView.LOGS && isAuthenticated && (
//             <div className="space-y-8">
//               <div className="max-w-6xl mx-auto">
//                 <h2 className="text-4xl font-black text-gray-900 mb-2">Shift Records</h2>
//                 <p className="text-gray-500 font-medium">Comprehensive audit log of all attendance activity.</p>
//               </div>
//               <LogsTable />
//             </div>
//           )}

//           {currentView === AppView.EMPLOYEES && isAuthenticated && (
//             <EmployeeList />
//           )}

//           {currentView === AppView.SETTINGS && isAuthenticated && (
//             <SettingsPanel />
//           )}

//           {/* Catch-all for non-auth access to auth views */}
//           {!isAuthenticated && currentView !== AppView.ATTENDANCE && currentView !== AppView.LOGIN && (
//             <div className="flex flex-col items-center justify-center py-40">
//                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
//                   <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
//                </div>
//                <h3 className="text-2xl font-black text-gray-900">Restricted View</h3>
//                <p className="text-gray-500 mt-2 font-medium">Please login with admin credentials to view this page.</p>
//                <button 
//                 onClick={() => setCurrentView(AppView.LOGIN)}
//                 className="mt-8 px-8 py-3 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all uppercase tracking-widest text-xs"
//                >
//                  Go to Login
//                </button>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default App;
 
import React from 'react'
import Muzammil from './components/Muzammil'

export default function App() {
  return (
    <div>
      <Muzammil />
    </div>
  )
}
