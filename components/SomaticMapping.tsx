
import React, { useState, useMemo, useEffect } from 'react';
import { recommendSomaticProtocol } from '../geminiService';
import { SomaticRegion } from '../types';
import { useRecoveryStore } from '../store';
import ModuleReflection from './ModuleReflection';

const REGIONS = [
  { id: 'head', label: 'Cranium', cx: 100, cy: 35, r: 18, desc: 'Headaches, racing thoughts' },
  { id: 'jaw', label: 'Masseter', cx: 100, cy: 55, r: 10, desc: 'Clenching, suppressed words' },
  { id: 'neck', label: 'Cervical', cx: 100, cy: 70, r: 12, desc: 'Stiffness, burden' },
  { id: 'shoulders', label: 'Trapezius', cx: 100, cy: 85, r: 40, isEllipse: true, rx: 40, ry: 15, desc: 'Carrying weight, tension' },
  { id: 'chest', label: 'Thoracic', cx: 100, cy: 120, r: 28, desc: 'Anxiety, tightness, shallow breath' },
  { id: 'gut', label: 'Enteric', cx: 100, cy: 165, r: 30, desc: 'Intuition, "knots", digestion' },
  { id: 'hands', label: 'Extremities (Arms)', cx: 50, cy: 150, r: 12, multi: [{cx: 45, cy: 155}, {cx: 155, cy: 155}], desc: 'Fidgeting, need for action' },
  { id: 'legs', label: 'Lower Body', cx: 85, cy: 240, r: 18, multi: [{cx: 80, cy: 250}, {cx: 120, cy: 250}], desc: 'Restlessness, flight response' }
];

const SomaticMapping: React.FC<{ onExit: (rating?: number, refl?: string, art?: string) => void }> = ({ onExit }) => {
  const store = useRecoveryStore();
  const persistentMap = store.sobriety.somaticMap || {};
  const [map, setMap] = useState<Record<string, number>>(persistentMap);
  const [protocol, setProtocol] = useState<{ title: string; instruction: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'map' | 'protocol' | 'reflection'>('map');

  const handleToggle = (id: string) => {
    const current = map[id] || 0;
    const next = (current + 1) % 4;
    
    if ('vibrate' in navigator) {
      if (next === 1) navigator.vibrate(10);
      if (next === 2) navigator.vibrate(20);
      if (next === 3) navigator.vibrate([30, 10, 30]);
    }
    
    const newMap = { ...map, [id]: next };
    setMap(newMap);
    store.updateSomaticMap(newMap);
  };

  const handleGenerate = async () => {
    const tensionAreas: SomaticRegion[] = (Object.entries(map) as [string, number][])
      .filter(([_, intensity]) => intensity > 0)
      .map(([id, intensity]) => ({
        id,
        intensity,
        label: REGIONS.find(r => r.id === id)?.label || id
      }));

    if (tensionAreas.length === 0) return;

    setIsLoading(true);
    const result = await recommendSomaticProtocol(tensionAreas);
    if (result) {
      setProtocol(result);
      setView('protocol');
    }
    setIsLoading(false);
  };

  const totalIntensity = useMemo(() => 
    Object.values(map).reduce((a: number, b: number) => a + b, 0), 
  [map]);

  if (view === 'reflection') {
    return (
      <ModuleReflection 
        moduleName="Somatic Heat Map"
        title="Physical Integration"
        context={`User mapped a total tension intensity of ${totalIntensity}. Protocol executed: ${protocol?.title}. Focused regions: ${Object.keys(map).filter(k => map[k] > 0).join(', ')}.`}
        onClose={onExit}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 md:py-12 px-4 animate-in fade-in duration-1000 pb-32">
      <div className="flex flex-col lg:flex-row gap-12 lg:items-center">
        
        {/* Silhouette Column */}
        <div className="lg:w-1/2 flex flex-col items-center">
          <div className="bg-slate-950 rounded-[60px] p-6 md:p-10 border-4 border-slate-900 shadow-[0_0_80px_rgba(0,0,0,0.5)] relative w-full aspect-[3/4] max-w-[450px] overflow-hidden group/map">
            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
            
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1">
               <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.8em] animate-pulse">Neural_Somatic_Link</span>
               <div className="h-0.5 w-12 bg-amber-500/30 rounded-full" />
            </div>

            <svg viewBox="0 0 200 300" className="w-full h-full relative z-10">
              <defs>
                <filter id="heatBlur">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                  <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                </filter>
                <radialGradient id="gradLow">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="gradMed">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="gradHigh">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
                  <stop offset="60%" stopColor="#e11d48" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
                </radialGradient>
              </defs>

              <path 
                d="M100 20 C 80 20, 75 40, 75 50 C 75 60, 85 70, 100 70 C 115 70, 125 60, 125 50 C 125 40, 120 20, 100 20 Z
                   M100 70 L100 80
                   M100 80 L65 95 C 55 98, 50 110, 50 120 L50 170 C 50 180, 60 180, 60 170 L60 120 L75 120 L75 210 L85 210 L85 295 C 85 300, 95 300, 95 295 L95 210 L105 210 L105 295 C 105 300, 115 300, 115 295 L115 210 L125 210 L125 120 L140 120 L140 170 C 140 180, 150 180, 150 170 L150 120 C 150 110, 145 98, 135 95 L100 80" 
                fill="#0f172a" 
                stroke="#1e293b" 
                strokeWidth="2"
                className="transition-all duration-1000"
              />

              <g filter="url(#heatBlur)">
                {REGIONS.map(r => {
                  const intensity = map[r.id] || 0;
                  if (intensity === 0) return null;
                  
                  const grad = intensity === 1 ? 'url(#gradLow)' : intensity === 2 ? 'url(#gradMed)' : 'url(#gradHigh)';
                  const scale = intensity === 1 ? 0.8 : intensity === 2 ? 1.2 : 1.6;

                  if (r.multi) {
                    return r.multi.map((m, i) => (
                      <circle 
                        key={`${r.id}-glow-${i}`}
                        cx={m.cx} cy={m.cy} r={r.r * scale}
                        fill={grad}
                        className="animate-pulse-slow"
                      />
                    ));
                  }
                  if (r.isEllipse) {
                    return (
                      <ellipse 
                        key={`${r.id}-glow`}
                        cx={r.cx} cy={r.cy} rx={r.rx * scale} ry={r.ry * scale}
                        fill={grad}
                        className="animate-pulse-slow"
                      />
                    );
                  }
                  return (
                    <circle 
                      key={`${r.id}-glow`}
                      cx={r.cx} cy={r.cy} r={r.r * scale}
                      fill={grad}
                      className="animate-pulse-slow"
                    />
                  );
                })}
              </g>

              {REGIONS.map(r => {
                const intensity = map[r.id] || 0;
                
                const Node = (props: any) => (
                  <g className="cursor-pointer group/node" onClick={() => handleToggle(r.id)}>
                    {r.isEllipse ? <ellipse {...props} /> : <circle {...props} />}
                    <circle 
                      cx={props.cx} cy={props.cy} r="2" 
                      fill={intensity > 0 ? "white" : "rgba(255,255,255,0.2)"} 
                      className="pointer-events-none transition-all group-hover/node:scale-150" 
                    />
                  </g>
                );

                if (r.multi) {
                  return r.multi.map((m, i) => (
                    <Node 
                      key={`${r.id}-${i}`}
                      cx={m.cx} cy={m.cy} r={r.r}
                      fill="transparent"
                    />
                  ));
                }

                return (
                  <Node 
                    key={r.id}
                    cx={r.cx} cy={r.cy} r={r.r} rx={r.rx} ry={r.ry}
                    fill="transparent"
                  />
                );
              })}
            </svg>

            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6 px-8 z-20">
               <div className="flex flex-col items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                 <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Baseline</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                 <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest">Glimmer</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" />
                 <span className="text-[7px] font-black text-orange-500 uppercase tracking-widest">Inflamed</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-rose-600 shadow-[0_0_8px_#e11d48] animate-pulse" />
                 <span className="text-[7px] font-black text-rose-500 uppercase tracking-widest">Critical</span>
               </div>
            </div>
          </div>
        </div>

        <div className="lg:w-1/2 space-y-10 flex flex-col justify-center">
          {view === 'map' && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-700">
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm shadow-lg">🌡️</div>
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em]">Somatic Diagnostic</span>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">Heat Map Protocol</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-bold italic text-lg leading-relaxed border-l-4 border-slate-100 dark:border-slate-800 pl-6">
                    "Emotions that cannot find words often manifest as heat or tightness in the body. This map tracks your burden throughout the week."
                  </p>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {REGIONS.filter(r => !r.multi).concat(REGIONS.filter(r => r.multi)).map(r => (
                    <button 
                      key={r.id}
                      onClick={() => handleToggle(r.id)}
                      className={`group p-5 rounded-3xl border-2 transition-all text-left flex items-center justify-between gap-4 ${
                        (map[r.id] || 0) > 0 
                          ? 'bg-slate-900 border-amber-500 text-white shadow-xl' 
                          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${map[r.id] > 0 ? 'text-amber-400' : 'text-slate-500'}`}>{r.label}</span>
                        <span className="text-[8px] font-bold opacity-60 truncate">{r.desc}</span>
                      </div>
                      {(map[r.id] || 0) > 0 && (
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-inner ${
                          map[r.id] === 3 ? 'bg-rose-600' : map[r.id] === 2 ? 'bg-orange-500' : 'bg-amber-400'
                        }`}>
                          {map[r.id]}
                        </div>
                      )}
                    </button>
                  ))}
               </div>

               <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                  <button 
                    onClick={handleGenerate}
                    disabled={Object.values(map).every(v => v === 0) || isLoading}
                    className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs disabled:opacity-30 active:scale-95 flex items-center justify-center gap-4"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Scanning Patterns...
                      </>
                    ) : (
                      <>
                        <span>🧬</span> Synthesise Clinical Reset
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => { setMap({}); store.updateSomaticMap({}); }}
                    className="text-slate-400 font-black uppercase text-[9px] tracking-widest hover:text-rose-500"
                  >
                    Reset Map Data
                  </button>
               </div>
            </div>
          )}

          {view === 'protocol' && protocol && (
            <div className="space-y-8 animate-in zoom-in-95 duration-700">
               <div className="bg-slate-900 rounded-[50px] p-10 md:p-14 border-b-[14px] border-indigo-600 shadow-2xl relative overflow-hidden text-white group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full -mr-40 -mt-40 blur-[100px] animate-pulse" />
                  
                  <div className="relative z-10 space-y-10">
                     <div className="space-y-2">
                        <div className="flex items-center gap-3">
                           <span className="w-2 h-2 bg-indigo-400 rounded-full animate-ping" />
                           <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em]">Field Intervention Protocol</span>
                        </div>
                        <h4 className="text-4xl font-black italic tracking-tighter leading-none text-white group-hover:text-indigo-200 transition-colors">
                          {protocol.title}
                        </h4>
                     </div>
                     
                     <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[48px] border border-white/10 shadow-inner group-hover:bg-white/[0.08] transition-all">
                        <p className="text-2xl font-medium italic leading-relaxed text-slate-100 font-serif">
                           "{protocol.instruction}"
                        </p>
                     </div>

                     <div className="flex flex-col gap-4">
                        <button 
                          onClick={() => setView('reflection')}
                          className="w-full py-6 bg-teal-600 text-white font-black rounded-3xl shadow-xl hover:bg-teal-700 transition-all uppercase tracking-widest text-xs shadow-teal-500/20"
                        >
                          Protocol Executed & Integrity Confirmed
                        </button>
                        <button 
                          onClick={() => setView('map')}
                          className="text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors"
                        >
                          Refine Thermal Mapping
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SomaticMapping;
