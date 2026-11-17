import React, { useState } from 'react';
import {
  Users,
  Layers,
  CalendarCheck,
  CreditCard,
  UserCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  UserPlus,
  Search,
  Award,
  Play,
  ShieldAlert,
} from 'lucide-react';
import { useCoaching } from '../context/CoachingContext';
import { toBn, formatTaka, formatBengaliDate } from '../utils/bengaliUtils';
import { TabType, Student, FeePayment } from '../types';
import { BrandLogo } from './common/BrandLogo';
import { StudentClassChartCard } from './dashboard/StudentClassChartCard';

interface DashboardProps {
  onNavigate: (tab: TabType) => void;
  onOpenNewAdmission: () => void;
  onOpenQuickFee: () => void;
  onViewReceipt: (payment: FeePayment) => void;
  onViewStudent: (student: Student) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenNewAdmission,
  onOpenQuickFee,
  onViewReceipt,
  onViewStudent,
}) => {
  const {
    settings,
    currentTeacher,
    students,
    batches,
    teachers,
    feePayments,
    attendance,
    exams,
    getStudentDueInfo,
  } = useCoaching();

  const [searchQuery, setSearchQuery] = useState('');

  const activeStudents = students.filter((s) => s.status === 'সক্রিয়');
  const activeBatches = batches.filter((b) => b.active);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRecords = attendance.filter((a) => a.date === todayStr);
  let totalMarked = 0;
  let totalPresent = 0;
  todayRecords.forEach((att) => {
    att.records.forEach((r) => {
      totalMarked++;
      if (r.status === 'উপস্থিত' || r.status === 'বিলম্ব') {
        totalPresent++;
      }
    });
  });
  const todayAttendanceRate = totalMarked > 0 ? Math.round((totalPresent / totalMarked) * 100) : 0;

  const currentMonthRevenue = feePayments.reduce((acc, p) => acc + (p.paidAmount || 0), 0);

  let totalDueAmount = 0;
  let dueStudentsCount = 0;
  activeStudents.forEach((student) => {
    const dueInfo = getStudentDueInfo(student.id);
    if (dueInfo.dueEstimate > 0) {
      totalDueAmount += dueInfo.dueEstimate;
      dueStudentsCount++;
    }
  });

  const recentPayments = feePayments.slice(0, 5);
  const recentStudents = students.slice(0, 4);

  const matchedStudents = searchQuery.trim()
    ? students
        .filter(
          (s) =>
            s.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.roll.includes(searchQuery) ||
            s.phone.includes(searchQuery)
        )
        .slice(0, 5)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Greeting & Search Row (Matches Reference Left Screen) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-400">
            {formatBengaliDate(todayStr)}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
            স্বাগতম &apos;{currentTeacher?.name || 'শিক্ষক'} স্যার&apos;
          </h1>
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mt-1 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>
              ভুল করেও আপনার পাসওয়ার্ড কাউকে শেয়ার করবেন না। তাহলে আপনি নিরাপত্তা ঝুঁকিতে পড়তে পারেন।
            </span>
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="শিক্ষার্থী বা রোল খুঁজুন"
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#EEF1F6] dark:bg-slate-900 border border-transparent focus:border-[#0F3382] focus:bg-white dark:focus:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none transition"
          />

          {searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-20 overflow-hidden">
              {matchedStudents.length === 0 ? (
                <p className="p-3.5 text-xs text-slate-500 text-center">কোনো শিক্ষার্থী পাওয়া যায়নি</p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {matchedStudents.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        onViewStudent(st);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs cursor-pointer"
                    >
                      <span className="font-bold text-slate-900 dark:text-slate-100">{st.nameBn}</span>
                      <span className="text-slate-500 font-mono">রোল: {toBn(st.roll)} · {st.classGrade}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hero Soft Sky-Blue Card (Matches Reference Top Banner) */}
      <div className="bg-[#DCEEFF] dark:bg-[#132B52] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-4 max-w-xl">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F244D] dark:text-white leading-snug">
              {settings.name}
            </h2>
            <p className="text-xs sm:text-sm text-[#35548A] dark:text-blue-200 mt-1">
              {settings.address}, {settings.district}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewAdmission}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-[#0F3382] font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>নতুন ভর্তি</span>
            </button>
            <button
              onClick={onOpenQuickFee}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0F3382] hover:bg-[#0B2666] text-white font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>ফি আদায়</span>
            </button>
          </div>
        </div>

        <BrandLogo variant="badge" className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl self-end sm:self-center" />
      </div>

      {/* Bento Grid Section ("কার্যক্রম" matching Reference "For you") */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">কার্যক্রম</h3>
          <button
            onClick={() => onNavigate('accounts')}
            className="text-xs font-semibold text-[#0F3382] dark:text-blue-400 hover:underline cursor-pointer"
          >
            সব হিসাব দেখুন
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Featured Emerald Green Card (Matches Reference Green Card) */}
          <div
            onClick={() => onNavigate('attendance')}
            className="bg-[#3EA36B] hover:bg-[#379460] text-white rounded-3xl p-5 flex flex-col justify-between min-h-[168px] transition cursor-pointer shadow-xs"
          >
            <div>
              <span className="text-xs text-emerald-100 font-medium">আজকের হাজিরা</span>
              <h4 className="text-2xl font-bold mt-1 font-mono tabular-nums">
                {toBn(todayAttendanceRate)}%
              </h4>
              <p className="text-xs text-emerald-50/90 mt-1.5">
                {totalMarked > 0
                  ? `${toBn(totalPresent)} / ${toBn(totalMarked)} জন উপস্থিত`
                  : 'আজকের হাজিরা গ্রহণ করুন'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <span className="text-xs font-medium text-emerald-50">
                ব্যাচ: {toBn(activeBatches.length)} টি
              </span>
              <span className="w-9 h-9 rounded-full bg-white text-[#3EA36B] flex items-center justify-center shadow-xs">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </span>
            </div>
          </div>

          {/* Students Card with Mini Initials Stack (Matches Reference "Join your class" card) */}
          <div
            onClick={() => onNavigate('students')}
            className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-3xl p-5 flex flex-col justify-between min-h-[168px] hover:border-[#0F3382]/40 transition cursor-pointer shadow-xs"
          >
            <div>
              <span className="text-xs text-slate-400 font-medium">শিক্ষার্থী</span>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
                {toBn(activeStudents.length)} জন
              </h4>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex -space-x-2">
                {recentStudents.slice(0, 3).map((st) => (
                  <span
                    key={st.id}
                    className="w-8 h-8 rounded-full bg-[#DCEEFF] dark:bg-blue-950 text-[#0F3382] dark:text-blue-200 border-2 border-white dark:border-slate-900 text-xs font-bold flex items-center justify-center"
                  >
                    {st.nameBn.charAt(0)}
                  </span>
                ))}
                {activeStudents.length > 3 && (
                  <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-2 border-white dark:border-slate-900 text-[10px] font-bold flex items-center justify-center font-mono">
                    +{toBn(activeStudents.length - 3)}
                  </span>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Total Revenue Card */}
          <div
            onClick={() => onNavigate('accounts')}
            className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-3xl p-5 flex flex-col justify-between min-h-[168px] hover:border-[#0F3382]/40 transition cursor-pointer shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">মোট ফি আদায়</span>
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
                  {formatTaka(currentMonthRevenue)}
                </h4>
              </div>
              <div className="w-9 h-9 rounded-2xl bg-[#DCEEFF] dark:bg-blue-950/60 text-[#0F3382] dark:text-blue-300 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 text-xs">
              <span className="text-rose-600 dark:text-rose-400 font-semibold font-mono tabular-nums">
                বকেয়া: {formatTaka(totalDueAmount)} ({toBn(dueStudentsCount)} জন)
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Exams & Teachers Card */}
          <div className="grid grid-rows-2 gap-3">
            <div
              onClick={() => onNavigate('exams')}
              className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl px-4 py-3 flex items-center justify-between hover:border-[#0F3382]/40 transition cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">পরীক্ষা</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                    {toBn(exams.length)} টি
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>

            <div
              onClick={() => onNavigate('teachers')}
              className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl px-4 py-3 flex items-center justify-between hover:border-[#0F3382]/40 transition cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#DCEEFF] dark:bg-blue-950/50 text-[#0F3382] dark:text-blue-300 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">শিক্ষক পরিষদ</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                    {toBn(teachers.length)} জন
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Class-wise Student Pie Chart & Bar Graph */}
      <StudentClassChartCard
        students={students}
        onNavigateStudents={() => onNavigate('students')}
        onOpenNewAdmission={onOpenNewAdmission}
      />

      {/* Bottom Split: Batches & Recent Fee Collections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Batches */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">চলমান ব্যাচ</h3>
            <button
              onClick={() => onNavigate('batches')}
              className="text-xs font-semibold text-[#0F3382] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              সব দেখুন <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {batches.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              <p>কোনো ব্যাচ তৈরি করা হয়নি</p>
              <button
                onClick={() => onNavigate('batches')}
                className="mt-3 px-4 py-2 rounded-xl bg-[#0F3382] text-white font-semibold cursor-pointer"
              >
                ব্যাচ তৈরি করুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {batches.slice(0, 4).map((batch) => {
                const teacher = teachers.find((t) => t.id === batch.teacherId);
                const enrolledCount = students.filter((s) => s.batchId === batch.id).length;

                return (
                  <div
                    key={batch.id}
                    onClick={() => onNavigate('batches')}
                    className="p-4 rounded-2xl bg-[#F4F6FA] dark:bg-slate-800/50 hover:bg-[#DCEEFF]/50 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#0F3382] dark:text-blue-300">
                        {batch.classGrade}
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-200 font-mono tabular-nums">
                        {formatTaka(batch.monthlyFee)}/মাস
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5 truncate">
                      {batch.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {batch.subject} · {teacher?.name || 'শিক্ষক'}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 truncate">
                        <Clock className="w-3 h-3 shrink-0" />
                        {batch.timeSlot}
                      </span>
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                        {toBn(enrolledCount)}/{toBn(batch.maxSeats)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Fee Collections */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">সাম্প্রতিক ফি আদায়</h3>
            <button
              onClick={() => onNavigate('accounts')}
              className="text-xs font-semibold text-[#0F3382] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              সব হিসাব <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentPayments.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              <p>কোনো ফি আদায় হয়নি</p>
              <button
                onClick={onOpenQuickFee}
                className="mt-3 px-4 py-2 rounded-xl bg-[#3EA36B] text-white font-semibold cursor-pointer"
              >
                ফি আদায় করুন
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentPayments.map((payment) => {
                const stu = students.find((s) => s.id === payment.studentId);
                return (
                  <div
                    key={payment.id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {stu?.nameBn || 'শিক্ষার্থী'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {payment.feeType} · {payment.month} · আদায়কারী: {payment.collectedBy || 'শিক্ষক'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-xs text-[#3EA36B] font-mono tabular-nums">
                        {formatTaka(payment.paidAmount)}
                      </p>
                      <button
                        onClick={() => onViewReceipt(payment)}
                        className="text-[11px] font-semibold text-[#0F3382] dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        রসিদ
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
