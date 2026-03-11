
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Employee } from '../types';

interface Props {
  onSuccess: () => void;
}

export const RegistrationForm: React.FC<Props> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
  const [croppedPhoto, setCroppedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isStabilizing, setIsStabilizing] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  
  // Crop states
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropPreviewRef = useRef<HTMLDivElement>(null);

  const startCamera = async () => {
    setIsCapturing(true);
    setOriginalPhoto(null);
    setCroppedPhoto(null);
    setIsCropping(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert('Camera access error');
      setIsCapturing(false);
    }
  };

  const captureStabilizedPhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      setIsStabilizing(true);
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const framesToAverage = 8;
      for (let i = 0; i < framesToAverage; i++) {
        ctx.globalAlpha = 1 / (i + 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        await new Promise(resolve => setTimeout(resolve, 40));
      }
      
      ctx.globalAlpha = 1.0;
      const data = canvas.toDataURL('image/jpeg', 0.95);
      setOriginalPhoto(data);
      setIsCapturing(false);
      setIsStabilizing(false);
      setIsCropping(true);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isCropping) return;
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isCropping) return;
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const confirmCrop = () => {
    if (!originalPhoto || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Define final biometric reference size (Square for consistent matching)
    const size = 512;
    canvas.width = size;
    canvas.height = size;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, size, size);

      // Calculate source coordinates based on zoom and pan
      const previewEl = cropPreviewRef.current;
      if (!previewEl) return;

      const rect = previewEl.getBoundingClientRect();
      const scaleX = img.width / rect.width;
      const scaleY = img.height / rect.height;

      const viewSize = 256; 
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const sourceX = (centerX - (viewSize / 2) - pan.x) / zoom * scaleX;
      const sourceY = (centerY - (viewSize / 2) - pan.y) / zoom * scaleY;
      const sourceW = (viewSize / zoom) * scaleX;
      const sourceH = (viewSize / zoom) * scaleY;

      ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, size, size);
      setCroppedPhoto(canvas.toDataURL('image/jpeg', 0.9));
      setIsCropping(false);
    };
    img.src = originalPhoto;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !designation || !croppedPhoto) return;

    const newEmployee: Employee = {
      id: crypto.randomUUID(),
      name,
      designation,
      photoBase64: croppedPhoto,
      registeredAt: new Date().toISOString()
    };

    storageService.saveEmployee(newEmployee);
    onSuccess();
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-blue-600 p-10 text-white relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <h2 className="text-3xl font-black tracking-tight mb-2">Staff Onboarding</h2>
        <p className="opacity-80 font-medium text-sm">Create a high-fidelity biometric profile.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-10">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Personnel Name</label>
            <input 
              required
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-gray-900"
              placeholder="Full Legal Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Operational Role</label>
            <input 
              required
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-gray-900"
              placeholder="Designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
            {isCropping ? 'Refine Biometric Frame' : 'Facial Recognition Capture'}
          </label>
          
          <div 
            className="relative aspect-video bg-gray-100 rounded-[2.5rem] overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center transition-all select-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {isCapturing ? (
              <>
                <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                   <div className="w-64 h-64 border-2 border-blue-500/30 rounded-full relative">
                      <div className="absolute inset-0 border-2 border-blue-500 rounded-full animate-ping opacity-10" />
                   </div>
                </div>
                <button 
                  type="button" 
                  onClick={captureStabilizedPhoto}
                  disabled={isStabilizing}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white text-blue-600 px-10 py-4 rounded-2xl font-black shadow-2xl active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  {isStabilizing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      ANALYZING...
                    </>
                  ) : 'FREEZE FRAME'}
                </button>
              </>
            ) : isCropping && originalPhoto ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                <div 
                  ref={cropPreviewRef}
                  className="relative w-full h-full overflow-hidden cursor-move"
                  onMouseDown={handleMouseDown}
                >
                  <img 
                    src={originalPhoto} 
                    className="absolute max-w-none transition-transform duration-75"
                    style={{
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                      transformOrigin: 'center center'
                    }}
                    draggable={false}
                  />
                  {/* Cropping Mask */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-full h-full bg-black/60 flex items-center justify-center">
                       <div className="w-64 h-64 rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] border-2 border-blue-500" />
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex items-center gap-6 bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
                   <div className="flex-1 flex items-center gap-4">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest min-w-[40px]">Zoom</span>
                      <input 
                        type="range" 
                        min="1" 
                        max="3" 
                        step="0.1" 
                        value={zoom} 
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <span className="text-[10px] font-black text-blue-400 min-w-[32px]">{zoom.toFixed(1)}x</span>
                   </div>
                   <button 
                    type="button" 
                    onClick={confirmCrop}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all"
                   >
                     Confirm Alignment
                   </button>
                   <button 
                    type="button" 
                    onClick={startCamera}
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                   >
                     Discard
                   </button>
                </div>
              </div>
            ) : croppedPhoto ? (
              <>
                <img src={croppedPhoto} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20" />
                <button 
                  type="button" 
                  onClick={startCamera}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md text-gray-900 px-8 py-3 rounded-2xl font-black text-xs shadow-2xl active:scale-95 transition-all"
                >
                  RETAKE BIOMETRICS
                </button>
              </>
            ) : (
              <button 
                type="button" 
                onClick={startCamera}
                className="flex flex-col items-center gap-6 group"
              >
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-gray-300 group-hover:text-blue-500 group-hover:scale-110 transition-all shadow-xl group-hover:shadow-blue-500/20">
                   <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div className="space-y-1">
                  <p className="font-black text-gray-900">Initiate Scanner</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Click to start biometric capture</p>
                </div>
              </button>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>

        <button 
          type="submit"
          disabled={!croppedPhoto || !name || !designation}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-black py-5 rounded-[2rem] transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] text-lg uppercase tracking-widest"
        >
          Finalize Onboarding
        </button>
      </form>

      <div className="bg-gray-50 p-8 border-t border-gray-100 flex items-center gap-6">
         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">💡</div>
         <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-sm">Pro Tip: Biometric Precision</h4>
            <p className="text-xs text-gray-500 font-medium">Use the cropping tool to center the face exactly within the circle. This ensures maximum recognition accuracy during check-ins.</p>
         </div>
      </div>
    </div>
  );
};
