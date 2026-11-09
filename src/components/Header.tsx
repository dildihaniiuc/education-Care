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
  Lock,
  User,
  Shield,
} from 'lucide-react';
import { useCoaching } from '../context/CoachingContext';
import { formatBengaliDate } from '../utils/bengaliUtils';
import { TabType } from '../types';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onNavigate: (tab: TabType) => void;
  onOpenNewAdmission: () => void;
  onOpenQuickFee: () => void;
  onOpenTeacherAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onNavigate,
  onOpenNewAdmission,
  onOpenQuickFee,
  onOpenTeacherAuth,
}) => {
  const { settings, darkMode, toggleDarkMode, currentTeacher, lockScreen, isCloudSynced } = useCoaching();

  // Bengali day names
  const today = new Date();
  const dayNames = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const dayName = dayNames[today.getDay()];
  const dateStr = today.toISOString().slice(0, 10);
  const formattedDate = `${dayName}, ${formatBengaliDate(dateStr)}`;

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 no-print shadow-xs transition-colors duration-200">
      <div className="flex items-center justify-between gap-3">
        {/* Left Side: Menu toggle button + Date & Institute Location */}
        <div className="flex items-center gap-3">
          <button
            id="menu-toggle-trigger"
            onClick={onOpenMobileSidebar}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer font-bold text-xs sm:text-sm shadow-xs active:scale-95"
            aria-label="মেনু খুলুন"
            title="মেনু তালিকা খুলুন"
          >
            <Menu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold">মেনু</span>
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
              <span className="hidden xl:inline-flex items-center gap-1.5 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {isCloudSynced ? 'সবার জন্য লাইভ ক্লাউড সিঙ্ক চালু' : 'ক্লাউড সিঙ্ক সংযুক্ত'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{formattedDate}</p>
          </div>
        </div>

        {/* Right Side: Teacher Profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Active Teacher Profile Badge */}
          <button
            onClick={onOpenTeacherAuth}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-slate-200 dark:border-slate-700 transition cursor-pointer group shadow-2xs"
            title="শিক্ষক লগইন ও প্রোফাইল পরিবর্তন"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs group-hover:scale-105 transition shrink-0">
              {currentTeacher ? currentTeacher.name.charAt(0) : <User className="w-3.5 h-3.5" />}
            </div>
            <div className="text-left hidden lg:block">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block leading-tight truncate max-w-[110px]">
                {currentTeacher ? currentTeacher.name : 'শিক্ষক লগইন'}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block leading-tight truncate max-w-[110px]">
                {currentTeacher ? currentTeacher.role || currentTeacher.designation : 'লগইন করুন'}
              </span>
            </div>
          </button>

          {/* Screen Lock Button */}
          <button
            onClick={lockScreen}
            className="p-2 sm:px-2.5 sm:py-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="স্ক্রিন লক করুন (তথ্যের নিরাপত্তা)"
            aria-label="লক স্ক্রিন"
          >
            <Lock className="w-4 h-4" />
          </button>

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
                <span className="hidden xl:inline text-xs font-semibold">লাইট</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <span className="hidden xl:inline text-xs font-semibold">ডার্ক</span>
              </>
            )}
          </button>

          <button
            id="quick-action-admission"
            onClick={onOpenNewAdmission}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">নতুন</span> শিক্ষার্থী ভর্তি
          </button>

          <button
            id="quick-action-fee"
            onClick={onOpenQuickFee}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">ফি</span> আদায়
          </button>

          <button
            id="quick-action-attendance"
            onClick={() => onNavigate('attendance')}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium transition-colors border border-slate-200/60 dark:border-slate-700 cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            হাজিরা
          </button>
        </div>
      </div>
    </header>
  );
};
