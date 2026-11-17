import React, { useEffect, useRef, useState } from 'react';
import {
  LogIn,
  KeyRound,
  Phone,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Moon,
  Sun,
} from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';
import { BrandLogo } from '../common/BrandLogo';
import { AnimatedSlogan } from './AnimatedSlogan';
import { cleanPhoneNumber } from '../../utils/bengaliUtils';

interface LandingPageProps {
  onSuccessLogin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSuccessLogin }) => {
  const {
    settings,
    lastLoginPhone,
    loginWithPhoneAndPasskey,
    darkMode,
    toggleDarkMode,
  } = useCoaching();

  const [phone, setPhone] = useState<string>(() => lastLoginPhone || '');
  const [passkey, setPasskey] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const passkeyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (lastLoginPhone) {
      setPhone((prev) => prev || lastLoginPhone);
    }
  }, [lastLoginPhone]);

  const isRememberedPhone =
    Boolean(lastLoginPhone) &&
    cleanPhoneNumber(lastLoginPhone) === cleanPhoneNumber(phone);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!phone.trim()) {
      setErrorMsg('অনুগ্রহ করে মোবাইল নম্বর দিন।');
      return;
    }
    if (!passkey.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার পাস কী দিন।');
      return;
    }

    setIsSubmitting(true);
    const res = loginWithPhoneAndPasskey(phone, passkey);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        if (onSuccessLogin) onSuccessLogin();
      }, 400);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col justify-between p-4 sm:p-8 lg:p-12 font-sans transition-colors duration-200">
      {/* Minimal Top Bar */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-900">
        <div className="flex items-center gap-3 min-w-0">
          <BrandLogo variant="badge" className="w-10 h-10 rounded-xl shrink-0" />
          <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
            {settings.name}
          </span>
        </div>

        <button
          type="button"
          onClick={toggleDarkMode}
          aria-label="থিম পরিবর্তন"
          className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 transition cursor-pointer shrink-0"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Main White-Background Split Showcase */}
      <main className="w-full max-w-6xl mx-auto my-auto py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left White Showcase */}
        <section className="lg:col-span-7 bg-white dark:bg-slate-950 space-y-8 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-5">
            <BrandLogo variant="badge" className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl shadow-md shrink-0" />
            <div className="space-y-1.5 pt-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-balance">
                {settings.name}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {settings.address}, {settings.district}
              </p>
            </div>
          </div>

          {/* Single-Line Animated Slogan Component */}
          <AnimatedSlogan />
        </section>

        {/* Right Clean Login Card */}
        <section className="lg:col-span-5">
          <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                শিক্ষক লগইন
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isRememberedPhone
                  ? 'সংরক্ষিত নম্বরে পাস কী দিয়ে প্রবেশ করুন'
                  : 'মোবাইল নম্বর ও পাস কী দিয়ে প্রবেশ করুন'}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-200 text-xs flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    মোবাইল নম্বর
                  </label>
                  {isRememberedPhone && (
                    <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                      সংরক্ষিত নম্বর
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    ref={phoneInputRef}
                    type="text"
                    required
                    autoFocus={!lastLoginPhone}
                    placeholder="মোবাইল নম্বর লিখুন"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-20 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono tabular-nums text-sm focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#065F46]"
                  />
                  {phone && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhone('');
                        setPasskey('');
                        setErrorMsg('');
                        setTimeout(() => phoneInputRef.current?.focus(), 20);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 cursor-pointer"
                    >
                      পরিবর্তন
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  ব্যক্তিগত পাস কী
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    ref={passkeyInputRef}
                    type={showPasskey ? 'text' : 'password'}
                    required
                    autoFocus={Boolean(lastLoginPhone)}
                    placeholder="পাস কী লিখুন"
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-sm font-bold tracking-wider focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#065F46]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasskey(!showPasskey)}
                    aria-label={showPasskey ? 'পাস কী লুকান' : 'পাস কী দেখুন'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-[#065F46] hover:bg-[#064E3B] active:scale-[0.99] text-white font-bold text-sm shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>ড্যাশবোর্ডে প্রবেশ করুন</span>
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="w-full max-w-6xl mx-auto pt-4 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
        <span>{settings.name}</span>
        <span>{settings.address}, {settings.district}</span>
      </footer>
    </div>
  );
};
