import React, { useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
}

/**
 * ইন-অ্যাপ PWA ইনস্টল বাটন:
 * - Android Chrome / Desktop Chrome-এ beforeinstallprompt পাওয়া গেলে সরাসরি নেটিভ ইনস্টল ডায়ালগ খোলে।
 * - Android-এ প্রম্পট সাময়িকভাবে না থাকলে ম্যানুয়াল Chrome ইনস্টল গাইড দেখায়।
 * - iOS Safari-র জন্য Add to Home Screen গাইড দেখায়।
 * - standalone মোডে থাকলে স্বয়ংক্রিয়ভাবে লুকিয়ে থাকে।
 */
export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  // Native Chromium / Android Chrome / Edge install prompt ready
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        title="Install App"
        className="inline-flex items-center gap-1.5 rounded-xl bg-[#065F46] hover:bg-[#064E3B] text-white px-3 py-2 text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
      >
        <Download className="w-3.5 h-3.5" />
        <span className={compact ? 'hidden sm:inline' : ''}>Install App</span>
      </button>
    );
  }

  // Android Chrome fallback if beforeinstallprompt was dismissed or suppressed by in-app browser
  if (isAndroid) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowAndroidGuide(true)}
          title="Install App on Android"
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 border border-emerald-200 dark:border-emerald-800 px-3 py-2 text-xs font-bold text-[#065F46] dark:text-emerald-300 transition cursor-pointer shrink-0"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className={compact ? 'hidden sm:inline' : ''}>Install App</span>
        </button>

        {showAndroidGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 no-print">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Android Chrome-এ অ্যাপ ইনস্টল করুন
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAndroidGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ol className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed list-decimal pl-4">
                <li>
                  সাইটটি <strong>Google Chrome</strong> ব্রাউজারে খুলুন।
                </li>
                <li>
                  উপরে ডানদিকে থাকা <strong>⋮ (Three-dots Menu)</strong> আইকনে ট্যাপ করুন।
                </li>
                <li>
                  <strong>Install app</strong> অথবা <strong>Add to Home screen</strong> অপশনে ট্যাপ করে নিশ্চিত করুন।
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowAndroidGuide(false)}
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

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
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
