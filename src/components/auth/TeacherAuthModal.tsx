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
  Phone,
} from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChangePasskey?: (tab: 'passkey' | 'phone') => void;
}

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({
  isOpen,
  onClose,
  onOpenChangePasskey,
}) => {
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
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="bg-[#0F3382] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center text-white shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">শিক্ষক প্রোফাইল ও নিরাপত্তা</h3>
              <p className="text-xs text-blue-200 mt-0.5">
                পাস কী, মোবাইল নম্বর পরিবর্তন ও অ্যাকাউন্ট সুইচ
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-200 text-xs flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Current Active Teacher Profile + Self-Service Passkey/Phone Change */}
          {currentTeacher && (
            <div className="p-4 rounded-2xl bg-[#F4F6FA] dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0F3382] text-white flex items-center justify-center font-bold text-base shrink-0">
                    {currentTeacher.name.charAt(0)}
                  </div>
                  <div>
                    <strong className="text-sm text-slate-900 dark:text-slate-100 block">
                      {currentTeacher.name}
                    </strong>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {currentTeacher.phone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      lockScreen();
                      onClose();
                    }}
                    title="স্ক্রিন লক"
                    className="p-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 transition cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    title="লগআউট"
                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {onOpenChangePasskey && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => onOpenChangePasskey('passkey')}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#0F3382] hover:bg-[#0B2666] text-white text-xs font-bold transition cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>পাস কী বদলান</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenChangePasskey('phone')}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#3EA36B] hover:bg-[#358E5C] text-white text-xs font-bold transition cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>ফোন বদলান</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Switch Teacher Account */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#0F3382] dark:text-blue-400" />
                অন্য শিক্ষক অ্যাকাউন্টে পরিবর্তন
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-0.5">
                {teachers.map((tch) => {
                  const isSelected = selectedTeacherId === tch.id;
                  return (
                    <button
                      type="button"
                      key={tch.id}
                      onClick={() => setSelectedTeacherId(tch.id)}
                      className={`p-2.5 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                        isSelected
                          ? 'border-[#0F3382] bg-[#DCEEFF]/60 dark:bg-blue-950/40'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-[#0F3382] text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {tch.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {tch.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                          {tch.phone}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-[#0F3382] dark:text-blue-400" />
                নির্বাচিত শিক্ষকের পাস কী
              </label>
              <input
                type="password"
                maxLength={16}
                required
                placeholder="পাস কী লিখুন"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-[#F4F6FA] dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono tracking-widest text-center text-base font-bold focus:outline-none focus:ring-2 focus:ring-[#0F3382]"
              />
            </div>

            <div className="pt-1 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F3382] hover:bg-[#0B2666] text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                প্রবেশ করুন
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
