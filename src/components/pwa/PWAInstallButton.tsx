import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
}

/**
 * ইন-অ্যাপ PWA ইনস্টল বাটন:
 * standalone মোডে থাকলে স্বয়ংক্রিয়ভাবে লুকিয়ে থাকে এবং iOS Safari-র জন্য গাইড দেখায়।
 */
export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        title="অ্যাপ হিসেবে ইনস্টল করুন"
        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 border border-emerald-200 dark:border-emerald-800 px-3 py-2 text-xs font-bold text-[#065F46] dark:text-emerald-300 transition cursor-pointer shrink-0"
      >
        <Download className="w-3.5 h-3.5" />
        <span className={compact ? 'hidden sm:inline' : ''}>অ্যাপ ইনস্টল</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          title="iPhone / iPad-এ ইনস্টল করুন"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer shrink-0"
        >
          <Share className="w-3.5 h-3.5" />
          <span className={compact ? 'hidden sm:inline' : ''}>হোম স্ক্রিনে যোগ</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 no-print">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  iPhone / iPad-এ ইনস্টল করুন
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ol className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed list-decimal pl-4">
                <li>
                  Safari ব্রাউজারের নিচে বা উপরে থাকা <strong>Share</strong> আইকনে ট্যাপ করুন।
                </li>
                <li>
                  নিচে স্ক্রল করে <strong>Add to Home Screen</strong> নির্বাচন করুন।
                </li>
                <li>
                  উপরে ডানদিকে <strong>Add</strong> বাটনে ট্যাপ করলেই অ্যাপটি ইনস্টল হবে।
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#065F46] hover:bg-[#064E3B] py-2.5 text-xs font-bold text-white transition cursor-pointer"
              >
                বুঝেছি
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
