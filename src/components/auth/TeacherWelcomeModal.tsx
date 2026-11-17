import React from 'react';
import { ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { Teacher } from '../../types';
import { BrandLogo } from '../common/BrandLogo';

interface TeacherWelcomeModalProps {
  teacher: Teacher | null;
  onClose: () => void;
}

/**
 * শিক্ষক লগইন করার সাথে সাথেই তাঁর নাম ধরে স্বাগতম ও পাসওয়ার্ড নিরাপত্তা সতর্কতা দেখায়।
 */
export const TeacherWelcomeModal: React.FC<TeacherWelcomeModalProps> = ({
  teacher,
  onClose,
}) => {
  if (!teacher) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="teacher-welcome-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-4 no-print"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Top Accent Header */}
        <div className="bg-gradient-to-r from-[#064E3B] to-[#0F766E] px-6 py-5 text-white relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="absolute top-4 right-4 p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5 pr-8">
            <BrandLogo variant="badge" className="w-12 h-12 rounded-2xl shrink-0" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-200">
                নিরাপদ শিক্ষক পোর্টাল
              </p>
              <h3 id="teacher-welcome-title" className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                স্বাগতম &apos;{teacher.name} স্যার&apos;
              </h3>
            </div>
          </div>
        </div>

        {/* Security Notice Body */}
        <div className="p-6 space-y-5">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                পাসওয়ার্ড ও নিরাপত্তা সতর্কতা
              </p>
              <p className="text-sm leading-relaxed text-amber-950 dark:text-amber-100 font-medium">
                ভুল করেও আপনার পাসওয়ার্ড কাউকে শেয়ার করবেন না। তাহলে আপনি নিরাপত্তা ঝুঁকিতে পড়তে পারেন।
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-[#065F46] hover:bg-[#064E3B] active:scale-[0.99] text-white font-bold text-sm shadow-sm transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ঠিক আছে, ড্যাশবোর্ডে প্রবেশ করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
