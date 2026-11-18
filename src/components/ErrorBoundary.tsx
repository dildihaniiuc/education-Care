import React from 'react';
import { RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare state: ErrorBoundaryState;
  declare readonly props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('Application render error:', error, info);
  }

  private handleSimpleReload = () => {
    window.location.reload();
  };

  private handleResetCacheAndReload = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister().catch(() => {})));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(
          keys
            .filter((k) => !k.includes('firestore') && !k.includes('firebase'))
            .map((k) => caches.delete(k))
        );
      }
      // Clear potentially corrupted local snapshot caches (Firestore cloud data stays untouched)
      const localKeysToReset = [
        'education_care_khata_db_v3_settings',
        'education_care_khata_db_v3_students',
        'education_care_khata_db_v3_batches',
        'education_care_khata_db_v3_teachers',
        'education_care_khata_db_v3_attendance',
        'education_care_khata_db_v3_fees',
        'education_care_khata_db_v3_expenses',
        'education_care_khata_db_v3_monthly_archives',
        'education_care_khata_db_v3_exams',
        'education_care_khata_db_v3_routines',
        'education_care_khata_db_v3_audit_logs',
      ];
      localKeysToReset.forEach((key) => localStorage.removeItem(key));
    } catch {
      // ignore storage errors
    }
    window.location.replace(window.location.pathname || '/');
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              অ্যাপ লোড হতে সমস্যা হয়েছে
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              আপনার ব্রাউজারের পুরোনো ক্যাশ বা অস্থায়ী ত্রুটির কারণে পেজটি আটকে গেছে। নিচের বাটনে ক্লিক করে ঠিক করুন।
            </p>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl p-2.5 text-[11px] text-emerald-800 dark:text-emerald-200 flex items-center justify-center gap-1.5 font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>আপনার ক্লাউড ডাটাবেসের কোনো তথ্য নষ্ট হবে না।</span>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={this.handleResetCacheAndReload}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#065F46] hover:bg-[#064E3B] text-white text-sm font-bold shadow-sm transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              ক্যাশ পরিষ্কার করে ঠিক করুন
            </button>

            <button
              type="button"
              onClick={this.handleSimpleReload}
              className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              শুধু পেজ রিলোড করুন
            </button>
          </div>
        </div>
      </div>
    );
  }
}
