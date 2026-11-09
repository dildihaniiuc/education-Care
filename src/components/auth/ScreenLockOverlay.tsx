import React, { useState } from 'react';
import { Lock, Shield, KeyRound, AlertCircle, Unlock } from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';

export const ScreenLockOverlay: React.FC = () => {
  const { isScreenLocked, unlockScreen, currentTeacher, settings } = useCoaching();
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isScreenLocked) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) {
      setErrorMsg('পিন কোড লিখুন।');
      return;
    }

    const success = unlockScreen(pin);
    if (!success) {
      setErrorMsg('ভুল পিন কোড! ডিফল্ট পিন ১২৩৪ দিন।');
      setPin('');
    } else {
      setErrorMsg('');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-center space-y-5">
        {/* Animated Lock Shield Icon */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 rounded-3xl bg-emerald-500/20 animate-ping opacity-50" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg mx-auto">
            <Lock className="w-9 h-9" />
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-800/80">
            নিরাপত্তা লক সক্রিয়
          </span>
          <h3 className="font-extrabold text-xl text-slate-900 dark:text-slate-100 mt-2">
            {settings.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            তথ্যের গোপনীয়তা রক্ষায় স্ক্রিন লক রয়েছে।
          </p>
        </div>

        {/* Current Teacher Avatar */}
        {currentTeacher && (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
              {currentTeacher.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] text-slate-400 block font-medium">শিক্ষক প্রোফাইল</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {currentTeacher.name}
              </h4>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate font-semibold">
                {currentTeacher.designation}
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-1.5 justify-center">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <input
              type="password"
              maxLength={8}
              required
              autoFocus
              placeholder="পিন কোড দিন..."
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono tracking-widest text-center text-xl font-bold focus:outline-emerald-600 shadow-inner"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">ডিফল্ট নিরাপত্তা পিন: ১২৩৪</p>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-bold shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Unlock className="w-4 h-4" />
            আনলক করুন
          </button>
        </form>
      </div>
    </div>
  );
};
