import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

/**
 * ইন্টারনেট সংযোগ বিচ্ছিন্ন হলে অ-বিঘ্নিত অফলাইন ব্যানার দেখায়।
 */
export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-5 left-4 z-40 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg no-print"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>অফলাইন মোড — ক্যাশকৃত ও লোকাল ডেটা ব্যবহৃত হচ্ছে</span>
    </div>
  );
};
