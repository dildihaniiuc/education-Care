import React, { useState, useEffect } from 'react';
import { X, KeyRound, Shield, CheckCircle2, AlertCircle, Eye, EyeOff, Lock, Phone } from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';

interface ChangePasskeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'passkey' | 'phone';
}

export const ChangePasskeyModal: React.FC<ChangePasskeyModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'passkey',
}) => {
  const { currentTeacher, changeTeacherPasskey, changeTeacherPhone } = useCoaching();

  const [activeTab, setActiveTab] = useState<'passkey' | 'phone'>(defaultTab);

  // Passkey form state
  const [currentPasskey, setCurrentPasskey] = useState('');
  const [newPasskey, setNewPasskey] = useState('');
  const [confirmPasskey, setConfirmPasskey] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Phone form state
  const [newPhone, setNewPhone] = useState('');
  const [verifyPasskeyForPhone, setVerifyPasskeyForPhone] = useState('');
  const [showPhonePasskey, setShowPhonePasskey] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setErrorMsg('');
      setSuccessMsg('');
      setCurrentPasskey('');
      setNewPasskey('');
      setConfirmPasskey('');
      setNewPhone('');
      setVerifyPasskeyForPhone('');
    }
  }, [isOpen, defaultTab]);

  if (!isOpen || !currentTeacher) return null;

  const handleTabSwitch = (tab: 'passkey' | 'phone') => {
    setActiveTab(tab);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handlePasskeySubmit = (e: React.FormEvent) => {
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

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPhone.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার নতুন মোবাইল নম্বর লিখুন।');
      return;
    }
    if (!verifyPasskeyForPhone.trim()) {
      setErrorMsg('নিরাপত্তা যাচাইয়ের জন্য আপনার বর্তমান পাস কী দিন।');
      return;
    }

    setIsSubmitting(true);
    const res = changeTeacherPhone(currentTeacher.id, verifyPasskeyForPhone, newPhone);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setNewPhone('');
      setVerifyPasskeyForPhone('');
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
        <div className="bg-[#0F3382] text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white">
              {activeTab === 'passkey' ? (
                <KeyRound className="w-5 h-5 text-white" />
              ) : (
                <Phone className="w-5 h-5 text-emerald-300" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                পাস কী ও ফোন নম্বর পরিবর্তন
              </h3>
              <p className="text-xs text-blue-200">
                শিক্ষক: <span className="font-bold text-white">{currentTeacher.name}</span>
              </p>
            </div>
          </div>

          {/* Sub-Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-white/10 rounded-xl border border-white/15">
            <button
              type="button"
              onClick={() => handleTabSwitch('passkey')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'passkey'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              পাস কী পরিবর্তন
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('phone')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'phone'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              মোবাইল নম্বর বদলান
            </button>
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
              <span>বর্তমান নিবন্ধিত মোবাইল:</span>
            </div>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
              {currentTeacher.phone || 'নির্ধারিত'}
            </span>
          </div>

          {activeTab === 'passkey' ? (
            <form onSubmit={handlePasskeySubmit} className="space-y-3.5">
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
          ) : (
            <form onSubmit={handlePhoneSubmit} className="space-y-3.5">
              {/* New Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  নতুন মোবাইল নম্বর (New Mobile Number) *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="যেমন: 01812-345678 বা ০১৭১২৩৪৫৬৭৮"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:outline-emerald-600"
                  />
                  <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  পরবর্তী লগইনে এই নতুন মোবাইল নম্বর ব্যবহার করে প্রবেশ করতে পারবেন।
                </p>
              </div>

              {/* Verify Current Passkey */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  আপনার পাস কী দিয়ে নিশ্চিত করুন *
                </label>
                <div className="relative">
                  <input
                    type={showPhonePasskey ? 'text' : 'password'}
                    required
                    placeholder="আপনার বর্তমান পাস কী লিখুন..."
                    value={verifyPasskeyForPhone}
                    onChange={(e) => setVerifyPasskeyForPhone(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:outline-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPhonePasskey(!showPhonePasskey)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPhonePasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Info Box */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
                <Shield className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>
                  নম্বর পরিবর্তন করার সাথে সাথেই ক্লাউড ডেটাবেজ আপডেট হয়ে যাবে এবং সকল ডিভাইস থেকে নতুন নম্বর দিয়ে লগইন করা যাবে।
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
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ফোন নম্বর সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
