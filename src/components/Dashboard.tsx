import React from 'react';
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
  Receipt,
  MapPin,
  CheckCircle2,
  FileText,
  PlusCircle,
  Database,
  Award,
  Calendar,
} from 'lucide-react';
import { useCoaching } from '../context/CoachingContext';
import { toBn, formatTaka, formatBengaliDate } from '../utils/bengaliUtils';
import { TabType } from '../types';
import { Student, FeePayment } from '../types';

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
    students,
    batches,
    teachers,
    feePayments,
    attendance,
    getStudentDueInfo,
  } = useCoaching();

  // 1. Calculate metrics
  const activeStudents = students.filter((s) => s.status === 'সক্রিয়');
  const activeBatches = batches.filter((b) => b.active);

  // Today's attendance
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

  // Monthly revenue
  const currentMonthPayments = feePayments;
  const currentMonthRevenue = currentMonthPayments.reduce((acc, p) => acc + (p.paidAmount || 0), 0);

  // Due calculation for active students
  let totalDueAmount = 0;
  let dueStudentsCount = 0;
  activeStudents.forEach((student) => {
    const dueInfo = getStudentDueInfo(student.id);
    if (dueInfo.dueEstimate > 0) {
      totalDueAmount += dueInfo.dueEstimate;
      dueStudentsCount++;
    }
  });

  // Recent transactions
  const recentPayments = feePayments.slice(0, 5);

  // Recent admissions
  const recentStudents = students.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-3 backdrop-blur-xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            {settings.address}, {settings.district}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            {settings.name}
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base mt-2 leading-relaxed">
            {settings.motto || 'জ্ঞান ও নৈতিকতায় গড়ি আগামীর ভবিষ্যৎ'}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onOpenNewAdmission}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-sm shadow-md transition"
            >
              <UserPlus className="w-4 h-4" />
              নতুন শিক্ষার্থী ভর্তি
            </button>
            <button
              onClick={onOpenQuickFee}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-semibold text-sm border border-white/20 transition backdrop-blur-xs"
            >
              <CreditCard className="w-4 h-4 text-emerald-300" />
              ফি আদায় করুন
            </button>
            <button
              onClick={() => onNavigate('attendance')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-semibold text-sm border border-white/20 transition backdrop-blur-xs"
            >
              <CalendarCheck className="w-4 h-4 text-teal-300" />
              দৈনিক হাজিরা
            </button>
            <button
              onClick={() => onNavigate('routine')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-semibold text-sm border border-white/20 transition backdrop-blur-xs"
            >
              <Calendar className="w-4 h-4 text-emerald-300" />
              ক্লাস রুটিন তৈরি
            </button>
            <button
              onClick={() => onNavigate('batches')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-semibold text-sm border border-white/20 transition backdrop-blur-xs"
            >
              <Layers className="w-4 h-4 text-teal-300" />
              নতুন ব্যাচ খুলুন
            </button>
          </div>
        </div>
      </div>

      {/* Fresh Start Khata Helper (if no students yet) */}
      {students.length === 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-200">
                ডিজিটাল অফিসিয়াল খাতা সম্পূর্ণ প্রস্তুত
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-300/80 mt-1 leading-relaxed">
                কাগজের খাতার পরিবর্তে এখন থেকে সকল এন্ট্রি এই সিস্টেমে সরাসরি সংরক্ষণ করুন। প্রথমে <strong>ব্যাচ ও রুটিন</strong> তৈরি করে শিক্ষার্থীদের রোল অনুযায়ী ভর্তি করাতে পারেন।
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('batches')}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold hover:bg-emerald-50 transition"
            >
              ১. ব্যাচ তৈরি করুন
            </button>
            <button
              onClick={onOpenNewAdmission}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
            >
              ২. শিক্ষার্থী এন্ট্রি
            </button>
          </div>
        </div>
      )}

      {/* 6 Key Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {/* Metric 1 */}
        <div
          onClick={() => onNavigate('students')}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-emerald-500 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">মোট শিক্ষার্থী</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{toBn(activeStudents.length)}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            সক্রিয়: {toBn(activeStudents.length)} জন
          </p>
        </div>

        {/* Metric 2 */}
        <div
          onClick={() => onNavigate('batches')}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-teal-500 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">চলমান ব্যাচ</span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 group-hover:bg-teal-600 group-hover:text-white transition">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{toBn(activeBatches.length)}</p>
          <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-1">
            {batches.length > 0 ? 'রুটিন নির্ধারিত' : 'নতুন ব্যাচ খুলুন'}
          </p>
        </div>

        {/* Metric 3 */}
        <div
          onClick={() => onNavigate('teachers')}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-blue-500 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">শিক্ষক ও স্টাফ</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{toBn(teachers.length)}</p>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">শিক্ষক পরিষদ</p>
        </div>

        {/* Metric 4 */}
        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-indigo-500 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">আজকের হাজিরা</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{toBn(todayAttendanceRate)}%</p>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">
            {totalMarked > 0 ? `${toBn(totalPresent)}/${toBn(totalMarked)} উপস্থিত` : 'হাজিরা নেওয়া হয়নি'}
          </p>
        </div>

        {/* Metric 5 */}
        <div
          onClick={() => onNavigate('accounts')}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-emerald-500 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">মোট ফি আদায়</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 truncate">
            {formatTaka(currentMonthRevenue)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">নগদ ও ডিজিটাল</p>
        </div>

        {/* Metric 6 */}
        <div
          onClick={() => onNavigate('accounts')}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-rose-500 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">মোট বকেয়া ফি</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-rose-700 dark:text-rose-400 truncate">{formatTaka(totalDueAmount)}</p>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1">
            {toBn(dueStudentsCount)} জন শিক্ষার্থীর
          </p>
        </div>
      </div>

      {/* Main Content Split: Batches & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Batches & Admissions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ongoing Batches card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                  কোচিং ব্যাচ ও সময়সূচি (রুটিন)
                </h3>
              </div>
              <button
                onClick={() => onNavigate('batches')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                সব ব্যাচ দেখুন <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {batches.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
                <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  এখনও কোনো ব্যাচ তৈরি করা হয়নি
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  শ্রেণি ও সময় অনুযায়ী ব্যাচ তৈরি করতে নিচের বাটনে ক্লিক করুন।
                </p>
                <button
                  onClick={() => onNavigate('batches')}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> নতুন ব্যাচ তৈরি করুন
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {batches.slice(0, 4).map((batch) => {
                  const teacher = teachers.find((t) => t.id === batch.teacherId);
                  const enrolledCount = students.filter((s) => s.batchId === batch.id).length;
                  const capacityPercent = Math.min(
                    100,
                    Math.round((enrolledCount / (batch.maxSeats || 30)) * 100)
                  );

                  return (
                    <div
                      key={batch.id}
                      className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 hover:border-emerald-300 dark:hover:border-emerald-600 transition"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                          {batch.classGrade}
                        </span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {formatTaka(batch.monthlyFee)}/মাস
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-2 line-clamp-1">
                        {batch.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{batch.subject}</p>

                      <div className="mt-3 text-xs space-y-1 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{batch.timeSlot} ({batch.scheduleDays.join(', ')})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{teacher?.name || 'শিক্ষক নির্ধারিত'}</span>
                        </div>
                      </div>

                      {/* Seat progress */}
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">
                          ভর্তি: <strong className="text-slate-800 dark:text-slate-200">{toBn(enrolledCount)}</strong> / {toBn(batch.maxSeats)}
                        </span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">{toBn(capacityPercent)}% পূর্ণ</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Admissions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">সাম্প্রতিক ভর্তি শিক্ষার্থী</h3>
              </div>
              <button
                onClick={() => onNavigate('students')}
                className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                সকল শিক্ষার্থী তালিকা <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentStudents.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
                <Users className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  এখনও কোনো শিক্ষার্থী ভর্তি করা হয়নি
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  খাতার রেকর্ড দেখে শিক্ষার্থীদের তথ্য এন্ট্রি করুন।
                </p>
                <button
                  onClick={onOpenNewAdmission}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                >
                  <UserPlus className="w-3.5 h-3.5" /> নতুন শিক্ষার্থী ভর্তি
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentStudents.map((std) => {
                  const batch = batches.find((b) => b.id === std.batchId);
                  return (
                    <div
                      key={std.id}
                      onClick={() => onViewStudent(std)}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-xl transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-sm">
                          {toBn(std.roll)}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{std.nameBn}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {std.schoolCollege} {batch ? `• ${batch.name}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {std.classGrade}
                        </span>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          ভর্তি: {formatBengaliDate(std.admissionDate)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Recent Payments & Khata Quick Hub */}
        <div className="space-y-6">
          {/* Recent Payments Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">সাম্প্রতিক ফি আদায়</h3>
              </div>
              <button
                onClick={() => onNavigate('accounts')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                সকল হিসাব <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentPayments.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
                <CreditCard className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  কোনো ফি আদায় এন্ট্রি করা হয়নি
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  শিক্ষার্থীদের ফি গ্রহণ করে ডিজিটাল রসিদ প্রিন্ট করুন।
                </p>
                <button
                  onClick={onOpenQuickFee}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition"
                >
                  <CreditCard className="w-3.5 h-3.5" /> ফি আদায় করুন
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => {
                  const stu = students.find((s) => s.id === payment.studentId);
                  return (
                    <div
                      key={payment.id}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between gap-2"
                    >
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{stu?.nameBn || 'শিক্ষার্থী'}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {payment.feeType} ({payment.month})
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {formatBengaliDate(payment.date)} • {payment.paymentMethod}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-emerald-700 dark:text-emerald-400">
                          {formatTaka(payment.paidAmount)}
                        </p>
                        <button
                          onClick={() => onViewReceipt(payment)}
                          className="mt-1 text-[11px] text-teal-700 dark:text-teal-400 hover:underline font-semibold"
                        >
                          রসিদ দেখুন
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Official Khata Quick Guide & Shortcuts */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">অফিসিয়াল খাতা সহায়িকা</h3>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              কাগজের খাতা মুক্ত ডিজিটাল কোচিং পরিচালনার জন্য ৪টি মূল ধাপ:
            </p>

            <div className="space-y-2 text-xs">
              <div
                onClick={() => onNavigate('batches')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700 cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px]">১</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">ব্যাচ ও ক্লাস রুটিন যুক্ত করুন</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div
                onClick={onOpenNewAdmission}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700 cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold flex items-center justify-center text-[10px]">২</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">শিক্ষার্থী ভর্তি ও আইডি কার্ড</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div
                onClick={() => onNavigate('attendance')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700 cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold flex items-center justify-center text-[10px]">৩</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">প্রতিদিনের উপস্থিতি হাজিরা খাতা</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div
                onClick={() => onNavigate('accounts')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700 cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold flex items-center justify-center text-[10px]">৪</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">ফি আদায় ও খরচের হিসাব ভাউচার</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('settings')}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                ব্যাকআপ ডাউনলোড ও সেটিংস
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
