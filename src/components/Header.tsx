import React from 'react';
import {
  Menu,
  CreditCard,
  CalendarCheck,
  MapPin,
  UserPlus,
  Moon,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import { useCoaching } from '../context/CoachingContext';
import { formatBengaliDate } from '../utils/bengaliUtils';
import { TabType } from '../types';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onNavigate: (tab: TabType) => void;
  onOpenNewAdmission: () => void;
  onOpenQuickFee: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onNavigate,
  onOpenNewAdmission,
  onOpenQuickFee,
}) => {
  const { settings, darkMode, toggleDarkMode } = useCoaching();

  // Bengali day names
  const today = new Date();
  const dayNames = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const dayName = dayNames[today.getDay()];
  const dateStr = today.toISOString().slice(0, 10);
  const formattedDate = `${dayName}, ${formatBengaliDate(dateStr)}`;

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 no-print shadow-xs transition-colors duration-200">
      <div className="flex items-center justify-between gap-3">
        {/* Left Side: Mobile toggle + Date & Institute Location */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-trigger"
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="মেনু খুলুন"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight hidden sm:block">
                {settings.name}
              </h2>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight sm:hidden">
                এডুকেশন কেয়ার
              </h2>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/60">
                <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                {settings.address}, {settings.district}
              </span>
              <span className="hidden xl:inline-flex items-center gap-1 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                অফিসিয়াল খাতা
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{formattedDate}</p>
          </div>
        </div>

        {/* Right Side: Dark Mode Toggle & Quick Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark Mode Toggle Button */}
          <button
            id="dark-mode-toggle"
            onClick={toggleDarkMode}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-slate-600 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
            title={darkMode ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন'}
            aria-label={darkMode ? 'লাইট মোড' : 'ডার্ক মোড'}
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline text-xs font-semibold">লাইট মোড</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <span className="hidden md:inline text-xs font-semibold">ডার্ক মোড</span>
              </>
            )}
          </button>

          <button
            id="quick-action-admission"
            onClick={onOpenNewAdmission}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">নতুন</span> শিক্ষার্থী ভর্তি
          </button>

          <button
            id="quick-action-fee"
            onClick={onOpenQuickFee}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">ফি</span> আদায়
          </button>

          <button
            id="quick-action-attendance"
            onClick={() => onNavigate('attendance')}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium transition-colors border border-slate-200/60 dark:border-slate-700"
          >
            <CalendarCheck className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            হাজিরা
          </button>
        </div>
      </div>
    </header>
  );
};
