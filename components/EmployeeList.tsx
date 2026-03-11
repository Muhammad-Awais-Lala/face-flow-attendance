
import React, { useState, useMemo, useRef } from 'react';
import { storageService } from '../services/storageService';
import { Employee } from '../types';

export const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(storageService.getEmployees());
  const [searchQuery, setSearchQuery] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this employee? This will stop facial recognition for them.')) {
      storageService.deleteEmployee(id);
      setEmployees(storageService.getEmployees());
    }
  };

  const handleUpdate = (updated: Employee) => {
    storageService.updateEmployee(updated);
    setEmployees(storageService.getEmployees());
    setEditingEmployee(null);
  };

  const filteredEmployees = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return employees;
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        emp.designation.toLowerCase().includes(query)
    );
  }, [employees, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Employee Directory</h2>
          <p className="text-gray-500 font-medium">Manage and view all registered staff members.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-80 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name or role..."
              className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl leading-5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="bg-white px-6 py-2 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center min-w-[120px]">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              {searchQuery ? 'Matches' : 'Total Staff'}
            </span>
            <div className="text-2xl font-black text-blue-600">
              {filteredEmployees.length}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.length > 0 ? filteredEmployees.map((employee) => (
          <div key={employee.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
              <img 
                src={employee.photoBase64} 
                alt={employee.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-6">
                <button 
                  onClick={() => setEditingEmployee(employee)}
                  className="w-full py-3 bg-white text-gray-900 font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl active:scale-95 flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                  Edit Profile
                </button>
                <button 
                  onClick={() => handleDelete(employee.id)}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Remove Staff
                </button>
              </div>
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[10px] font-black text-gray-900 rounded-full shadow-sm border border-white/20">
                  ID: {employee.id.slice(0, 4)}
                </span>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                   <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                      <img 
                        src={employee.photoBase64} 
                        alt={employee.name} 
                        className="w-full h-full object-cover"
                      />
                   </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 truncate leading-tight mb-1">{employee.name}</h3>
                  <p className="text-blue-600 font-bold text-xs uppercase tracking-widest">{employee.designation}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="text-xs">
                  <span className="block font-bold text-gray-400 uppercase tracking-tighter mb-0.5">Joined on</span>
                  <span className="font-semibold text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                    {new Date(employee.registeredAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 border-2 border-white shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-24 bg-white border border-gray-100 rounded-[3rem] text-center shadow-sm">
            <div className="flex flex-col items-center gap-6">
              <div className="p-8 bg-blue-50 rounded-[2.5rem] relative">
                <svg className="w-16 h-16 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full border-4 border-white animate-pulse" />
              </div>
              <div className="space-y-2 max-w-xs mx-auto">
                <p className="text-2xl font-black text-gray-900">{employees.length === 0 ? 'Directory Empty' : 'No matches'}</p>
                <p className="text-gray-400 font-medium leading-relaxed">
                  {employees.length === 0 
                    ? 'Start building your team by registering your first employee today.' 
                    : `We couldn't find any staff member matching "${searchQuery}".`}
                </p>
                {searchQuery && (
                   <button onClick={() => setSearchQuery('')} className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors shadow-lg active:scale-95">Reset Search</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {editingEmployee && (
        <EditModal 
          employee={editingEmployee} 
          onClose={() => setEditingEmployee(null)} 
          onSave={handleUpdate} 
        />
      )}
    </div>
  );
};

const EditModal = ({ employee, onClose, onSave }: { employee: Employee, onClose: () => void, onSave: (emp: Employee) => void }) => {
  const [name, setName] = useState(employee.name);
  const [designation, setDesignation] = useState(employee.designation);
  const [photo, setPhoto] = useState(employee.photoBase64);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert('Camera error');
      setIsCapturing(false);
    }
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      setPhoto(canvas.toDataURL('image/jpeg'));
      setIsCapturing(false);
      (video.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="bg-gray-900 p-8 text-white flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black">Edit Personnel</h3>
            <p className="text-gray-400 text-sm font-medium">Update profile details and biometrics</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-10 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Designation</label>
              <input value={designation} onChange={e => setDesignation(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold" />
            </div>
          </div>

          <div className="space-y-3">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Facial Reference</label>
             <div className="relative aspect-[16/9] bg-gray-100 rounded-[2rem] overflow-hidden border-2 border-gray-100 group">
                {isCapturing ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                    <button onClick={capture} className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-blue-600 px-8 py-3 rounded-2xl font-black shadow-2xl">CAPTURE NEW</button>
                  </>
                ) : (
                  <>
                    <img src={photo} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={startCamera} className="bg-white/90 backdrop-blur text-gray-900 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">Update Biometrics</button>
                    </div>
                  </>
                )}
                <canvas ref={canvasRef} className="hidden" />
             </div>
          </div>

          <button 
            onClick={() => onSave({...employee, name, designation, photoBase64: photo})}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-[2rem] transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] uppercase tracking-widest"
          >
            Apply Profile Changes
          </button>
        </div>
      </div>
    </div>
  );
};
