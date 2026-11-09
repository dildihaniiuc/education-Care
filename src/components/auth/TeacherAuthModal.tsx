import React, { useState } from 'react';
import {
  X,
  Lock,
  UserCheck,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Users,
  GraduationCap,
} from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';
import { Teacher } from '../../types';

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({ isOpen, onClose }) => {
  const { teachers, currentTeacher, loginTeacher, logoutTeacher, lockScreen } = useCoaching();

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    () => currentTeacher?.id || teachers[0]?.id || ''
  );
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedTeacherId) {
      setErrorMsg('অনুগ্রহ করে একজন শিক্ষক নির্বাচন করুন।');
      return;
    }

    const res = loginTeacher(selectedTeacherId, pin);
    if (res.success) {
      setSuccessMsg(res.message);
      setPin('');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 800);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleLogout = () => {
    logoutTeacher();
    setSuccessMsg('লগআউট সম্পন্ন হয়েছে।');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 800);
  };

  const activeSelectedTeacher = teachers.find((t) => t.id === selectedTeacherId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xl shadow-inner">
              <Shield className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30">
                নিরাপদ শিক্ষক প্যানেল
              </span>
              <h3 className="font-extrabold text-xl text-white mt-0.5">শিক্ষক লগইন ও ভেরিফিকেশন</h3>
              <p className="text-xs text-emerald-100/80">
                সকল এন্ট্রি (নম্বর, হাজিরা, ফি) স্বয়ংক্রিয়ভাবে শিক্ষকের নামে সংরক্ষিত হবে
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 font-bold animate-pulse">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Current Active Teacher Indicator */}
          {currentTeacher && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                  {currentTeacher.name.charAt(0)}
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                    বর্তমানে লগইন আছেন:
                  </span>
                  <strong className="text-sm text-slate-900 dark:text-slate-100">
                    {currentTeacher.name}
                  </strong>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-medium">
                    {currentTeacher.designation} • {currentTeacher.role || 'শিক্ষক'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    lockScreen();
                    onClose();
                  }}
                  title="স্ক্রিন লক করুন"
                  className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs transition cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="লগআউট করুন"
                  className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-700 dark:text-rose-300 text-xs transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Teacher Selection Grid */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                শিক্ষক নির্বাচন করুন:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1">
                {teachers.map((tch) => {
                  const isSelected = selectedTeacherId === tch.id;
                  const isCurrent = currentTeacher?.id === tch.id;
                  return (
                    <div
                      key={tch.id}
                      onClick={() => setSelectedTeacherId(tch.id)}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-center gap-2.5 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-xs ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {tch.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {tch.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {tch.designation}
                        </p>
                        {isCurrent && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            ● সক্রিয়
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PIN Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  নিরাপত্তা পিন (Security PIN) *
                </label>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                  ডিফল্ট পিন: ১২৩৪
                </span>
              </div>
              <input
                type="password"
                maxLength={8}
                required
                placeholder="৪-ডিজিট পিন কোড লিখুন..."
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono tracking-widest text-center text-lg font-bold focus:outline-emerald-600 shadow-2xs"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-md transition cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                শিক্ষক হিসেবে প্রবেশ করুন
              </button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>নিরাপত্তা গ্যারান্টি:</strong> যে শিক্ষক লগইন অবস্থায় শিক্ষার্থীদের নম্বর এন্ট্রি,
              হাজিরা বা ফি আদায় করবেন, প্রতিটি অ্যাকশনে তার নাম ও পদবি স্বয়ংক্রিয়ভাবে অডিট ট্রেইলে যুক্ত হবে।
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
