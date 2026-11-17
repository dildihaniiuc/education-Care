import React from 'react';
import {
  Menu,
  CreditCard,
  UserPlus,
  Moon,
  Sun,
  Lock,
  User,
  KeyRound,
  LogOut,
} from 'lucide-react';
import { useCoaching } from '../context/CoachingContext';
import { formatBengaliDate } from '../utils/bengaliUtils';
import { TabType } from '../types';
import { BrandLogo } from './common/BrandLogo';
import { PWAInstallButton } from './pwa/PWAInstallButton';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onNavigate: (tab: TabType) => void;
  onOpenNewAdmission: () => void;
  onOpenQuickFee: () => void;
  onOpenTeacherAuth?: () => void;
  onOpenChangePasskey?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onOpenNewAdmission,
  onOpenQuickFee,
  onOpenTeacherAuth,
  onOpenChangePasskey,
}) => {
  const { settings, darkMode, toggleDarkMode, currentTeacher, logoutTeacher, lockScreen } = useCoaching();

  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  const formattedDate = formatBengaliDate(dateStr);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-3 no-print transition-colors duration-200">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Menu + Logo + Institute Name */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            id="menu-toggle-trigger"
            onClick={onOpenMobileSidebar}
            className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-700 dark:text-slate-200 bg-[#F4F6FA] dark:bg-slate-800 hover:bg-[#DCEEFF] dark:hover:bg-slate-700 transition cursor-pointer shrink-0"
            aria-label="মেনু খুলুন"
            title="মেনু"
          >
            <Menu className="w-5 h-5 text-[#0F3382] dark:text-blue-300" />
          </button>

          <BrandLogo variant="badge" className="w-10 h-10 hidden sm:flex" />

          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {settings.name}
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium truncate">
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Right: Quick Actions + Teacher Profile */}
        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton compact />

          <button
            id="quick-action-admission"
            onClick={onOpenNewAdmission}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3EA36B] hover:bg-[#358E5C] text-white text-xs font-semibold transition cursor-pointer whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>ভর্তি</span>
          </button>

          <button
            id="quick-action-fee"
            onClick={onOpenQuickFee}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F3382] hover:bg-[#0B2666] text-white text-xs font-semibold transition cursor-pointer whitespace-nowrap"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>ফি আদায়</span>
          </button>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F4F6FA] dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
            <button
              onClick={onOpenTeacherAuth}
              className="flex items-center gap-2 px-2 py-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
              title="শিক্ষক প্রোফাইল"
            >
              <div className="w-7 h-7 rounded-lg bg-[#0F3382] text-white font-bold flex items-center justify-center text-xs shrink-0">
                {currentTeacher ? currentTeacher.name.charAt(0) : <User className="w-3.5 h-3.5" />}
              </div>
              <span className="hidden lg:inline text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[100px]">
                {currentTeacher ? currentTeacher.name : 'শিক্ষক'}
              </span>
            </button>

            {onOpenChangePasskey && (
              <button
                onClick={onOpenChangePasskey}
                title="পাস কী ও মোবাইল নম্বর পরিবর্তন করুন"
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-[#0F3382] hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={lockScreen}
              title="স্ক্রিন লক"
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-amber-600 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>

            <button
              id="dark-mode-toggle"
              onClick={toggleDarkMode}
              title={darkMode ? 'লাইট মোড' : 'ডার্ক মোড'}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => {
                if (window.confirm('আপনি কি শিক্ষক অ্যাকাউন্ট থেকে লগআউট করতে চান?')) {
                  logoutTeacher();
                }
              }}
              title="লগআউট"
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
