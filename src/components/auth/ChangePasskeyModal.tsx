import React, { useState } from 'react';
import { X, KeyRound, Shield, CheckCircle2, AlertCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';

interface ChangePasskeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasskeyModal: React.FC<ChangePasskeyModalProps> = ({ isOpen, onClose }) => {
  const { currentTeacher, changeTeacherPasskey } = useCoaching();

  const [currentPasskey, setCurrentPasskey] = useState('');
  const [newPasskey, setNewPasskey] = useState('');
  const [confirmPasskey, setConfirmPasskey] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !currentTeacher) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPasskey.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার বর্তমান পাস কী দিন।');
      return;
    }
    if (!newPasskey.trim()) {
      setErrorMsg('অনুগ্রহ করে একটি নতুন পাস কী নির্ধারণ করুন।');
      return;
    }
    if (newPasskey.trim().length < 4) {
      setErrorMsg('নতুন পাস কী কমপক্ষে ৪ ডিজিট বা অক্ষরের হতে হবে।');
      return;
    }
    if (newPasskey.trim() !== confirmPasskey.trim()) {
      setErrorMsg('নতুন পাস কী এবং কনফার্ম পাস কী মেলেনি!');
      return;
    }
    if (newPasskey.trim() === currentPasskey.trim()) {
      setErrorMsg('নতুন পাস কী বর্তমান পাস কী থেকে ভিন্ন হতে হবে।');
      return;
    }

    setIsSubmitting(true);
    const res = changeTeacherPasskey(currentTeacher.id, currentPasskey, newPasskey);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setCurrentPasskey('');
      setNewPasskey('');
      setConfirmPasskey('');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
              <KeyRound className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/30">
                ব্যক্তিগত নিরাপত্তা
              </span>
              <h3 className="font-extrabold text-lg text-white mt-0.5">পাস কী (Passkey) পরিবর্তন</h3>
              <p className="text-xs text-blue-100/80">
                শিক্ষক: <span className="font-bold text-white">{currentTeacher.name}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content & Form */}
        <div className="p-6 space-y-4">
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

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>নিবন্ধিত মোবাইল:</span>
            </div>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
              {currentTeacher.phone || 'নির্ধারিত'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Current Passkey */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                বর্তমান পাস কী (Current Passkey) *
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  placeholder="বর্তমান পাস কী লিখুন..."
                  value={currentPasskey}
                  onChange={(e) => setCurrentPasskey(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:outline-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Passkey */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                নতুন পাস কী (New Passkey) *
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  placeholder="কমপক্ষে ৪ সংখ্যার নতুন পাস কী লিখুন..."
                  value={newPasskey}
                  onChange={(e) => setNewPasskey(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:outline-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Passkey */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                নতুন পাস কী পুনরায় লিখুন (Confirm Passkey) *
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  placeholder="একই নতুন পাস কী পুনরায় লিখুন..."
                  value={confirmPasskey}
                  onChange={(e) => setConfirmPasskey(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:outline-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Security Guarantee Box */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
              <Shield className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>
                <strong>গোপনীয়তার নিশ্চয়তা:</strong> আপনার পরিবর্তিত পাস কী শুধুমাত্র আপনিই জানবেন।
                অন্য কোনো শিক্ষক বা ব্যবহারকারী আপনার পাস কী অ্যাক্সেস করতে পারবে না।
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-md transition cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>পাস কী সংরক্ষণ করুন</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
