import React from 'react';
import { RefreshCw, Sparkles, X } from 'lucide-react';

interface PWAUpdateBannerProps {
  updateAvailable: boolean;
  isUpdating: boolean;
  updateError?: string | null;
  isDismissed: boolean;
  onUpdateNow: () => void;
  onDismiss: () => void;
  onReopen: () => void;
}

/**
 * নতুন ভার্সন ডিপ্লয় হলে ইউজারকে নোটিফাই করে এবং "Update Now" বাটনে ক্লিকের পর নিরাপদে অ্যাক্টিভেট করে।
 */
export const PWAUpdateBanner: React.FC<PWAUpdateBannerProps> = ({
  updateAvailable,
  isUpdating,
  updateError,
  isDismissed,
  onUpdateNow,
  onDismiss,
  onReopen,
}) => {
  if (!updateAvailable) return null;

  // Compact persistent reminder button if user temporarily dismissed the card
  if (isDismissed) {
    return (
      <div className="fixed bottom-20 md:bottom-5 right-4 z-[120] pointer-events-auto no-print">
        <button
          type="button"
          onClick={onReopen}
          disabled={isUpdating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#065F46] hover:bg-[#064E3B] text-white text-xs font-bold shadow-lg border border-emerald-400/30 transition cursor-pointer touch-manipulation disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
          <span>{isUpdating ? 'আপডেট হচ্ছে...' : 'নতুন আপডেট রয়েছে'}</span>
        </button>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-5 right-4 left-4 sm:left-auto sm:w-[390px] z-[120] pointer-events-auto bg-white dark:bg-slate-900 border-2 border-[#065F46] dark:border-emerald-600 rounded-2xl shadow-2xl p-4 no-print"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-[#065F46] dark:text-emerald-300 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
              নতুন ভার্সন পাওয়া গেছে
            </h4>
            <button
              type="button"
              onClick={onDismiss}
              disabled={isUpdating}
              aria-label="পরে আপডেট করুন"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer touch-manipulation disabled:opacity-40"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            সিস্টেমের নতুন সংস্করণ ডিপ্লয় করা হয়েছে। আপনার কোনো ডেটা না হারিয়ে নিরাপদে নতুন ভার্সন চালু করুন।
          </p>

          {updateError && (
            <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1.5">
              {updateError}
            </p>
          )}

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={onUpdateNow}
              disabled={isUpdating}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#065F46] hover:bg-[#064E3B] active:scale-[0.99] text-white text-xs font-bold shadow-xs transition cursor-pointer touch-manipulation disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>{isUpdating ? 'নতুন ভার্সন লোড হচ্ছে...' : 'Update Now'}</span>
            </button>

            <button
              type="button"
              onClick={onDismiss}
              disabled={isUpdating}
              className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer touch-manipulation disabled:opacity-50"
            >
              পরে
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
