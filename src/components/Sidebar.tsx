import React from 'react';
import {
  LayoutDashboard,
  Users,
  Layers,
  CalendarCheck,
  Calendar,
  CreditCard,
  Award,
  UserCheck,
  Settings,
  X,
  BookOpen,
  MapPin,
  Moon,
  Sun,
  Shield,
} from 'lucide-react';
import { useCoaching } from '../context/CoachingContext';
import { toBn } from '../utils/bengaliUtils';
import { TabType } from '../types';

interface SidebarProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onNewAdmission?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { settings, students, batches, routines, darkMode, toggleDarkMode } = useCoaching();

  const menuItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'ড্যাশবোর্ড',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'students',
      label: 'শিক্ষার্থী তালিকা',
      icon: <Users className="w-5 h-5" />,
      badge: students.length > 0 ? toBn(students.length) : undefined,
    },
    {
      id: 'batches',
      label: 'ব্যাচ ব্যবস্থাপনা',
      icon: <Layers className="w-5 h-5" />,
      badge: batches.length > 0 ? toBn(batches.length) : undefined,
    },
    {
      id: 'routine',
      label: 'ক্লাস রুটিন তৈরি',
      icon: <Calendar className="w-5 h-5" />,
      badge: routines && routines.length > 0 ? toBn(routines.length) : undefined,
    },
    {
      id: 'attendance',
      label: 'উপস্থিতি (হাজিরা)',
      icon: <CalendarCheck className="w-5 h-5" />,
    },
    {
      id: 'accounts',
      label: 'ফি ও আয়-ব্যয় খাতা',
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      id: 'exams',
      label: 'পরীক্ষা ও ফলাফল',
      icon: <Award className="w-5 h-5" />,
    },
    {
      id: 'teachers',
      label: 'শিক্ষক ও স্টাফ',
      icon: <UserCheck className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'প্রতিষ্ঠান সেটিংস ও ব্যাকআপ',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleSelect = (tab: TabType) => {
    setCurrentTab(tab);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-900 dark:bg-slate-950 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print shadow-xl lg:shadow-none border-r border-slate-800 dark:border-slate-900`}
      >
        {/* Institute Branding Header */}
        <div className="p-5 border-b border-slate-800 dark:border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white leading-tight tracking-tight">
                {settings.name.split(' ')[0] || 'এডুকেশন'} {settings.name.split(' ')[1] || 'কেয়ার'}
              </h1>
              <p className="text-xs text-emerald-400 font-medium">অফিসিয়াল খাতা ম্যানেজমেন্ট</p>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[130px]">গুলিয়াখালী, সীতাকুণ্ড</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>অফিসিয়াল মডিউল</span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <Shield className="w-3 h-3" /> অফলাইন সুরক্ষিত
            </span>
          </div>

          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 text-left ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/40 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dark Mode Quick Switch & Location Footer */}
        <div className="p-4 border-t border-slate-800 dark:border-slate-900 bg-slate-950/60 space-y-2">
          {/* Quick theme toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-xs font-medium text-slate-200 transition"
          >
            <span className="flex items-center gap-2">
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
              {darkMode ? 'লাইট মোডে পরিবর্তন' : 'ডার্ক মোড সক্রিয়'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
              {darkMode ? 'ডার্ক' : 'লাইট'}
            </span>
          </button>

          <div className="bg-slate-800/40 rounded-xl p-2.5 border border-slate-700/40 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ডিজিটাল রেজিস্টার সিস্টেম
            </div>
            <p className="mt-0.5 truncate">{settings.address}, {settings.district}</p>
          </div>
        </div>
      </aside>
    </>
  );
};
