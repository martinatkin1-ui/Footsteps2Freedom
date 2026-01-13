
import React, { useState } from 'react';
import { useRecoveryStore } from '../store';
import Logo from './Logo';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'pin'>('signup');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('Traveller');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const login = useRecoveryStore(state => state.login);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In this frontend-only implementation, we simulate authentication
    // by persisting the user to the local store.
    if (mode === 'signup' && email && name) {
      login(email, name);
    } else if (mode === 'login' && email) {
      login(email, name || 'Traveller');
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md p-6">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[48px] p-8 md:p-12 shadow-2xl space-y-10 animate-in fade-in zoom-in-95 duration-700">
          
          <div className="text-center space-y-4">
             <Logo size="lg" variant="vertical" className="mb-6" />
             <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
               {mode === 'signup' ? 'Begin Your Journey' : 'Welcome Back'}
             </h1>
             <p className="text-slate-400 text-sm font-medium">
               {mode === 'signup' 
                 ? 'Step into a sanctuary of healing and self-discovery.' 
                 : 'Your safe space is waiting for your return.'}
             </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Smith"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all outline-none"
                />
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Email Address</label>
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Password</label>
              <input 
                required
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all outline-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-5 bg-teal-600 text-white font-black rounded-2xl shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs mt-4"
            >
              {mode === 'signup' ? 'Open My Sanctuary' : 'Unlock Portal'}
            </button>
          </form>

          <div className="pt-6 border-t border-white/5 text-center">
            <button 
              onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
              className="text-teal-400 text-xs font-black uppercase tracking-widest hover:text-teal-300 transition-colors"
            >
              {mode === 'signup' ? 'Already a traveller? Log In' : 'New to Footsteps? Sign Up'}
            </button>
          </div>

          <p className="text-[9px] text-slate-500 uppercase tracking-[0.3em] text-center leading-relaxed">
            UK Data Protection Compliant<br />Your privacy is our sacred oath.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
