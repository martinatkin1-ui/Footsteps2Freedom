
import React, { useRef, useState, useEffect } from 'react';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'user',
            width: { ideal: 1080 },
            height: { ideal: 1080 }
          },
          audio: false
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera Access Error:", err);
        setError("Unable to access the camera sanctuary. Please verify browser permissions.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // High resolution capture
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Ensure selfie is correctly oriented (un-mirror for capture)
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(dataUrl);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-slate-950 p-4 md:p-12 animate-in fade-in duration-700">
      {/* Immersive Camera Frame */}
      <div className="relative w-full max-w-2xl aspect-[3/4] md:aspect-square bg-black rounded-[60px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border-8 border-white/5 ring-1 ring-white/10 group">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center text-4xl mb-2">⚠️</div>
            <h3 className="text-white text-xl font-black uppercase tracking-tight">Access Blocked</h3>
            <p className="text-slate-400 font-bold leading-relaxed">{error}</p>
            <button 
              onClick={onClose} 
              className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase text-xs tracking-widest border border-white/10 transition-all"
            >
              Back to Safety
            </button>
          </div>
        ) : (
          <>
            {/* Mirrored preview for user comfort */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              onCanPlay={() => setIsReady(true)}
              className="w-full h-full object-cover transform -scale-x-100 transition-opacity duration-1000"
              style={{ opacity: isReady ? 1 : 0 }}
            />
            
            {/* Viewfinder Overlays */}
            <div className="absolute inset-0 border-[30px] border-black/20 pointer-events-none z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/20 rounded-full pointer-events-none z-10" />
            
            {!isReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 gap-4">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-teal-400 uppercase tracking-[0.5em] animate-pulse">Initialising Optics...</p>
              </div>
            )}
          </>
        )}
        
        {/* Dynamic Controls */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-between items-center px-12 z-30">
           <button 
            onClick={onClose}
            className="p-6 bg-white/10 backdrop-blur-2xl text-white rounded-full border border-white/20 active:scale-90 transition-all hover:bg-white/20 shadow-2xl"
            aria-label="Abort Capture"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>

           {isReady && (
             <button 
              onClick={handleCapture}
              className="w-24 h-24 bg-white rounded-full border-[8px] border-teal-600 shadow-[0_0_50px_rgba(13,148,136,0.4)] active:scale-[0.85] transition-all flex items-center justify-center group"
              aria-label="Freeze Moment"
             >
                <div className="w-16 h-16 bg-teal-600 rounded-full border-4 border-white/40 shadow-inner group-hover:scale-110 transition-transform"></div>
             </button>
           )}

           <div className="w-16 h-16 flex items-center justify-center text-4xl opacity-50 group-hover:opacity-100 transition-opacity">
              🧘
           </div>
        </div>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Guidance Text */}
      <div className="mt-12 text-center space-y-3 animate-in slide-in-from-bottom-4 duration-1000">
         <div className="flex items-center justify-center gap-3">
            <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse shadow-[0_0_8px_#14b8a6]" />
            <p className="text-teal-400 font-black uppercase tracking-[0.6em] text-[11px]">True-Self Mirroring</p>
         </div>
         <h2 className="text-white text-3xl font-black tracking-tight leading-tight">Gaze at Your Strength</h2>
         <p className="text-slate-500 text-lg font-medium max-w-sm mx-auto leading-relaxed italic">
           "Your progress is reflected in your eyes. This identity anchor is stored only on your secure device."
         </p>
      </div>
    </div>
  );
};

export default CameraCapture;
