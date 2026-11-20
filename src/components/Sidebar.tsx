import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Layers,
  CalendarCheck,
  Calendar,
  CreditCard,
  Award,
  BookMarked,
  UserCheck,
  Settings,
  X,
  Moon,
  Sun,
} from 'lucide-react';
import { useCoaching } from '../context/CoachingContext';
import { toBn } from '../utils/bengaliUtils';
import { TabType } from '../types';
import { BrandLogo } from './common/BrandLogo';

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
  const { settings, students, batches, routines, questionBank, darkMode, toggleDarkMode } = useCoaching();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, setIsMobileOpen]);

  const menuItems: { id: TabType; label: string; icon: React.ReactNode; count?: string }[] = [
    {
      id: 'dashboard',
      label: 'ড্যাশবোর্ড',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'students',
      label: 'শিক্ষার্থী',
      icon: <Users className="w-5 h-5" />,
      count: students.length > 0 ? toBn(students.length) : undefined,
    },
    {
      id: 'batches',
      label: 'ব্যাচ',
      icon: <Layers className="w-5 h-5" />,
      count: batches.length > 0 ? toBn(batches.length) : undefined,
    },
    {
      id: 'routine',
      label: 'ক্লাস রুটিন',
      icon: <Calendar className="w-5 h-5" />,
      count: routines && routines.length > 0 ? toBn(routines.length) : undefined,
    },
    {
      id: 'attendance',
      label: 'হাজিরা',
      icon: <CalendarCheck className="w-5 h-5" />,
    },
    {
      id: 'accounts',
      label: 'ফি ও হিসাব',
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      id: 'exams',
      label: 'পরীক্ষা ও ফলাফল',
      icon: <Award className="w-5 h-5" />,
    },
    {
      id: 'questionBank',
      label: 'প্রশ্ন ব্যাংক',
      icon: <BookMarked className="w-5 h-5" />,
      count: questionBank && questionBank.length > 0 ? toBn(questionBank.length) : undefined,
    },
    {
      id: 'teachers',
      label: 'শিক্ষক পরিষদ',
      icon: <UserCheck className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'সেটিংস ও ব্যাকআপ',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleSelect = (tab: TabType) => {
    setCurrentTab(tab);
    setIsMobileOpen(false);
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-50 backdrop-blur-xs transition-opacity cursor-pointer"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 sm:w-80 bg-[#0F3382] dark:bg-[#0A193D] text-white flex flex-col transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } no-print`}
      >
        {/* Clean Logo Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <BrandLogo variant="badge" className="w-14 h-14 shrink-0 border border-white/15" />
            <div className="min-w-0">
              <h1 className="font-bold text-base text-white leading-tight truncate">
                {settings.name}
              </h1>
              <p className="text-[11px] text-blue-200 truncate mt-0.5">
                {settings.address}, {settings.district}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 text-blue-200 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer shrink-0"
            aria-label="মেনু বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-150 text-left cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#0F3382] font-bold shadow-sm'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 whitespace-nowrap">
                  <span className={isActive ? 'text-[#0F3382]' : 'text-blue-200'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.count && (
                  <span
                    className={`text-xs font-mono tabular-nums ${
                      isActive ? 'text-[#0F3382]' : 'text-blue-200/80'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Theme Switch Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-medium text-white transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-blue-200" />}
              {darkMode ? 'লাইট মোড' : 'ডার্ক মোড'}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};
