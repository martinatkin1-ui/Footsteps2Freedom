
import React, { useState, useEffect } from 'react';
import { useRecoveryStore } from '../store';
import { BiometricData } from '../types';
import SpeakButton from './SpeakButton';
import { triggerHaptic } from '../haptics';

interface BiometricSyncProps {
  onExit: () => void;
}

const BiometricSync: React.FC<BiometricSyncProps> = ({ onExit }) => {
  const { biometrics, updateBiometrics, awardFootsteps } = useRecoveryStore();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(80);
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);
    if (permission === 'granted') {
      new Notification("Vagal Shield Activated", {
        body: "I am now monitoring your pulse for high-arousal spikes.",
        icon: "https://cdn-icons-png.flaticon.com/192/3209/3209949.png"
      });
    }
  };

  const connectHeartRate = async () => {
    setIsScanning(true);
    setError(null);
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }]
      });

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');

      characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        const flags = value.getUint8(0);
        const rate = (flags & 0x01) ? value.getUint16(1, true) : value.getUint8(1);
        updateBiometrics({ heartRate: rate, isSynced: true });
      });

      device.addEventListener('gattserverdisconnected', () => {
        updateBiometrics({ isSynced: false });
      });

      triggerHaptic('SYNC');
      awardFootsteps(20); 
      setIsScanning(false);
      
      if (notificationStatus !== 'granted') {
        requestNotificationPermission();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect to device. Ensure Bluetooth is enabled.");
      setIsScanning(false);
    }
  };

  const saveBloodPressure = () => {
    updateBiometrics({ systolicBP: systolic, diastolicBP: diastolic });
    awardFootsteps(5);
    triggerHaptic('TAP');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32 px-4">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Biometric Link</h2>
           <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">Neural-Physical Interface</p>
        </div>
        <button onClick={onExit} className="p-4 bg-white dark:bg-slate-800 text-slate-400 rounded-3xl border-2 border-slate-100 dark:border-slate-700 transition-all hover:text-rose-500 shadow-sm">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Heart Rate Section */}
        <div className="bg-slate-950 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5 flex flex-col justify-between group">
          <div className={`absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full -mr-32 -mt-32 blur-[80px] transition-all duration-1000 ${biometrics.heartRate > 105 ? 'opacity-40 animate-pulse' : 'opacity-20'}`} />
          
          <div className="relative z-10 space-y-8">
             <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em]">Real-Time Pulse</span>
                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${biometrics.isSynced ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                  {biometrics.isSynced ? 'SYNC_ACTIVE' : 'LINK_OFFLINE'}
                </div>
             </div>

             <div className="flex items-center gap-6">
                <div className={`w-32 h-32 rounded-[40px] bg-white/5 border border-white/10 flex items-center justify-center text-7xl shadow-inner relative transition-all duration-300 ${biometrics.heartRate > 0 ? 'animate-[pulse_1s_infinite]' : ''}`}>
                   ❤️
                </div>
                <div className="space-y-1">
                   <div className={`text-7xl font-black tabular-nums tracking-tighter font-montserrat transition-colors ${biometrics.heartRate > 105 ? 'text-rose-500' : 'text-white'}`}>
                     {biometrics.heartRate || '--'}
                   </div>
                   <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Beats Per Minute</p>
                </div>
             </div>

             <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-3">
                <div className="flex items-center gap-3">
                   <div className={`w-2 h-2 rounded-full ${biometrics.isSynced ? 'bg-emerald-500 shadow-[0_0_8px_#10b981] animate-ping' : 'bg-slate-700'}`} />
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Shield Status: {biometrics.isSynced ? 'Protection Active' : 'Waiting for Uplink'}</p>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed font-medium italic">
                  Background monitoring is active when synced. I will alert you with a system notification and haptic tap if a spike occurs while your device is stowed.
                </p>
             </div>
          </div>

          <div className="relative z-10 mt-10 space-y-4">
            {notificationStatus !== 'granted' && biometrics.isSynced && (
               <button 
                onClick={requestNotificationPermission}
                className="w-full py-4 bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-indigo-600/50"
               >
                 Allow Background Alerts
               </button>
            )}
            <button 
              onClick={connectHeartRate}
              disabled={isScanning}
              className="w-full py-5 bg-rose-600 hover:bg-rose-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-rose-600/20 active:scale-95 flex items-center justify-center gap-3"
            >
              {isScanning ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : <span>📡 Link Watch Sanctuary</span>}
            </button>
            {error && <p className="text-rose-400 text-[9px] font-bold mt-4 text-center">{error}</p>}
          </div>
        </div>

        {/* Blood Pressure Section */}
        <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 border-2 border-slate-100 dark:border-slate-800 shadow-xl space-y-10">
           <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Blood Pressure</h3>
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🩸</div>
           </div>

           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                 <div className="flex justify-between items-end px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Systolic</label>
                    <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{systolic}</span>
                 </div>
                 <input 
                  type="range" min="80" max="200" 
                  value={systolic} 
                  onChange={(e) => setSystolic(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none accent-indigo-600" 
                />
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-end px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diastolic</label>
                    <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{diastolic}</span>
                 </div>
                 <input 
                  type="range" min="50" max="130" 
                  value={diastolic} 
                  onChange={(e) => setDiastolic(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none accent-indigo-600" 
                />
              </div>
           </div>

           <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Health Log Signature</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{systolic} / {diastolic} <span className="text-xs text-slate-400 tracking-normal font-bold">mmHg</span></p>
           </div>

           <button 
             onClick={saveBloodPressure}
             className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
           >
             Archive Pressure Data
           </button>
        </div>
      </div>

      {/* Logic & Science Card */}
      <div className="bg-slate-950 rounded-[60px] p-12 text-white relative overflow-hidden shadow-2xl border-b-[12px] border-slate-900 ring-1 ring-white/5">
         <div className="absolute inset-0 bg-indigo-500/[0.02] animate-pulse pointer-events-none" />
         <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="w-24 h-24 bg-white/10 rounded-[36px] flex items-center justify-center text-5xl shadow-inner backdrop-blur-md shrink-0">🔬</div>
            <div className="space-y-4">
               <h3 className="text-2xl font-black tracking-tight uppercase italic text-indigo-400">The Vagal Shield</h3>
               <p className="text-slate-400 text-lg leading-relaxed font-medium">
                 "High heart rate at rest often indicates 'Amygdala Hijacking'—a state where your logical brain is bypassed by stress. By linking your watch, Footpath Guide can proactively send a haptic tap to your wrist, prompting a TIPP reset before an urge becomes overwhelming."
               </p>
               <SpeakButton text="The Vagal Shield. High heart rate at rest often indicates Amygdala Hijacking. By linking your watch, Footpath Guide can proactively send a haptic tap to your wrist, prompting a reset before an urge becomes overwhelming." size={12} className="opacity-40" />
            </div>
         </div>
      </div>
    </div>
  );
};

export default BiometricSync;
