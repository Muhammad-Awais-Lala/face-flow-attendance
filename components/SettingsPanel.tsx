
import React, { useState, useRef } from 'react';
import { storageService } from '../services/storageService';
import { AppSettings } from '../types';

export const SettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdate = (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    storageService.updateSettings(newSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleKeySelect = async () => {
    try {
      const aiStudio = (window as any).aistudio;
      if (aiStudio?.openSelectKey) {
        await aiStudio.openSelectKey();
      } else {
        alert("API Key selection is only available within the AI Studio environment.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (storageService.importDatabase(content)) {
        alert("Database restored successfully. The application will reload.");
        window.location.reload();
      } else {
        alert("Restore failed. Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">System Settings</h2>
          <p className="text-gray-500 font-medium">Configure recognition, office hours, and alerts.</p>
        </div>
        {saved && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-xs font-black animate-bounce">
            SETTINGS SAVED
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {/* Office Hours & Alerts */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Operations & Alerts</h3>
              <p className="text-sm text-gray-400">Define work shifts and automated notification rules.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest block ml-1">Work Start (Late Threshold)</label>
              <input 
                type="time" 
                value={settings.workStartTime}
                onChange={(e) => handleUpdate({ workStartTime: e.target.value })}
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold"
              />
            </div>
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest block ml-1">Work End</label>
              <input 
                type="time" 
                value={settings.workEndTime}
                onChange={(e) => handleUpdate({ workEndTime: e.target.value })}
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-6 bg-orange-50/30 rounded-3xl border border-orange-100">
            <div className="space-y-1">
              <h4 className="font-bold text-gray-900">Smart Notifications</h4>
              <p className="text-xs text-gray-400">Trigger system alerts for late check-ins and missed check-outs.</p>
            </div>
            <button 
              onClick={() => handleUpdate({ enableNotifications: !settings.enableNotifications })}
              className={`w-14 h-8 rounded-full transition-all flex items-center p-1 ${settings.enableNotifications ? 'bg-orange-500' : 'bg-gray-200'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${settings.enableNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Recognition Settings */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Recognition Logic</h3>
              <p className="text-sm text-gray-400">Fine-tune AI strictness and confidence.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Confidence Threshold</label>
                <span className="text-2xl font-black text-blue-600">{Math.round(settings.confidenceThreshold * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="0.99" 
                step="0.01" 
                value={settings.confidenceThreshold}
                onChange={(e) => handleUpdate({ confidenceThreshold: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </div>

        {/* API Management & Quota Troubleshooting */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">API Quota Management</h3>
              <p className="text-sm text-gray-400">Handle "Resource Exhausted" (429) errors.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <h4 className="font-bold text-indigo-900">Active API Identity</h4>
                <p className="text-xs text-indigo-700/70 max-w-sm">
                  To avoid 429 errors, ensure you use an API key from a project with enabled billing.
                </p>
              </div>
              <button 
                onClick={handleKeySelect}
                className="px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95 whitespace-nowrap"
              >
                Switch API Key
              </button>
            </div>

            <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
               <div className="text-2xl">⚠️</div>
               <div className="space-y-2">
                  <h4 className="font-bold text-amber-900 text-sm uppercase">Troubleshoot 429 Errors</h4>
                  <p className="text-xs text-amber-800 font-medium">If you are hitting "RESOURCE_EXHAUSTED" errors frequently, follow the Google Billing documentation to upgrade your project limits.</p>
                  <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block text-[10px] font-black text-amber-900 underline uppercase tracking-widest mt-2"
                  >
                    View Billing Guide & Pricing
                  </a>
               </div>
            </div>
          </div>
        </div>

        {/* Database Management */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Database & Portability</h3>
              <p className="text-sm text-gray-400">Securely back up or restore your entire system database.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <button 
              onClick={() => storageService.exportDatabase()}
              className="flex items-center gap-4 p-6 bg-gray-50 hover:bg-green-50 border border-gray-100 hover:border-green-200 rounded-3xl transition-all group"
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                📤
              </div>
              <div className="text-left">
                <span className="block font-black text-gray-900 text-sm">Export Data</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Download Backup</span>
              </div>
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-4 p-6 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-3xl transition-all group"
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                📥
              </div>
              <div className="text-left">
                <span className="block font-black text-gray-900 text-sm">Restore Data</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Upload Backup</span>
              </div>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-[2.5rem] p-8 border border-red-100 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-red-900">Danger Zone</h3>
            <p className="text-sm text-red-600/70">Destructive actions for maintenance.</p>
          </div>
          <button 
            onClick={() => {
              if (window.confirm("ARE YOU ABSOLUTELY SURE? This will delete ALL employees and ALL attendance logs forever.")) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="w-full py-4 bg-white border-2 border-red-200 text-red-600 font-black rounded-2xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
          >
            Wipe System Database
          </button>
        </div>
      </div>
    </div>
  );
};
