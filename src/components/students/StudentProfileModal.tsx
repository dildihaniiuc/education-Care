import React from 'react';
import {
  X,
  User,
  Phone,
  MapPin,
  School,
  Calendar,
  CreditCard,
  Printer,
  Edit,
  Award,
  CalendarCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Student } from '../../types';
import { useCoaching } from '../../context/CoachingContext';
import { toBn, formatTaka, formatBengaliDate } from '../../utils/bengaliUtils';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onEdit: (student: Student) => void;
  onPrintIdCard: (student: Student) => void;
  onCollectFee: (student: Student) => void;
  onEnterMarks?: (student: Student) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  student,
  onEdit,
  onPrintIdCard,
  onCollectFee,
  onEnterMarks,
}) => {
  const { batches, feePayments, exams, getStudentAttendanceRate } = useCoaching();

  if (!isOpen || !student) return null;

  const batch = batches.find((b) => b.id === student.batchId);
  const attendanceRate = getStudentAttendanceRate(student.id);
  const studentPayments = feePayments.filter((p) => p.studentId === student.id);

  // Student exam results
  const studentExams = exams
    .map((exam) => {
      const res = exam.results.find((r) => r.studentId === student.id);
      return res ? { exam, result: res } : null;
    })
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-18 h-18 rounded-2xl bg-emerald-700 border-2 border-emerald-400 flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0">
              {student.nameBn.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-bold text-xl text-white">{student.nameBn}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 font-semibold">
                  রোল: {toBn(student.roll)}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-600/40 text-blue-300 border border-blue-500/40 font-medium">
                  শ্রেণি: {student.classGrade}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {student.nameEn || 'নামের ইংরেজি রূপ নেই'} • বর্তমান প্রতিষ্ঠান: {student.schoolCollege}
              </p>
              <p className="text-xs text-emerald-400 mt-1 font-medium">
                ব্যাচ: {batch?.name || 'সাধারণ'} ({batch?.timeSlot})
              </p>
            </div>
          </div>

          {/* Action Quick Bar */}
          <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-700/60">
            <button
              onClick={() => onPrintIdCard(student)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              আইডি কার্ড প্রিন্ট
            </button>
            <button
              onClick={() => onCollectFee(student)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              ফি গ্রহণ করুন
            </button>
            {onEnterMarks && (
              <button
                onClick={() => {
                  onClose();
                  onEnterMarks(student);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-200" />
                ইনডিভিজুয়াল মার্কস আপলোড
              </button>
            )}
            <button
              onClick={() => {
                onClose();
                onEdit(student);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              তথ্য পরিবর্তন
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Teacher who added this student */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">ভর্তি তথ্য এন্ট্রি করেছেন:</span>
              <strong className="text-slate-800 dark:text-slate-200">
                {student.addedByTeacherName || 'দিল দিহান (শিক্ষক)'}
              </strong>
            </div>
            {student.createdAt && (
              <span className="text-[11px] text-slate-400">
                তারিখ: {formatBengaliDate(student.createdAt.slice(0, 10))}
              </span>
            )}
          </div>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[11px] text-slate-500 font-medium">উপস্থিতির হার</span>
              <p className="text-lg font-bold text-slate-800 mt-0.5">{toBn(attendanceRate)}%</p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[11px] text-slate-500 font-medium">নির্ধারিত মাসিক বেতন</span>
              <p className="text-lg font-bold text-slate-800 mt-0.5">
                {formatTaka(student.monthlyFee)}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[11px] text-slate-500 font-medium">রক্তের গ্রুপ</span>
              <p className="text-lg font-bold text-rose-600 mt-0.5">{student.bloodGroup}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[11px] text-slate-500 font-medium">ভর্তির তারিখ</span>
              <p className="text-sm font-bold text-slate-800 mt-1">
                {formatBengaliDate(student.admissionDate)}
              </p>
            </div>
          </div>

          {/* Detailed Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Guardian & Contact */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-600" />
                পিতা-মাতা ও যোগাযোগের তথ্য
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">পিতার নাম:</span>
                  <span className="font-semibold text-slate-800">{student.fatherName}</span>
                </div>
                {student.motherName && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">মাতার নাম:</span>
                    <span className="font-semibold text-slate-800">{student.motherName}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">অভিভাবকের মোবাইল:</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {student.guardianPhone}
                  </span>
                </div>
                {student.phone && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">শিক্ষার্থীর মোবাইল:</span>
                    <span className="font-semibold text-slate-700 font-mono">{student.phone}</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">ঠিকানা:</span>
                  <span className="font-medium text-slate-800 text-right max-w-[200px]">
                    {student.address}
                  </span>
                </div>
              </div>
            </div>

            {/* Academic details */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <School className="w-4 h-4 text-emerald-600" />
                অ্যাকাডেমিক তথ্য
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">বর্তমান ক্লাস:</span>
                  <span className="font-semibold text-slate-800">{student.classGrade}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">কোচিং ব্যাচ:</span>
                  <span className="font-semibold text-slate-800">{batch?.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">ক্লাসের দিন:</span>
                  <span className="font-semibold text-slate-800">
                    {batch?.scheduleDays.join(', ')}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">রুটিন সময়:</span>
                  <span className="font-semibold text-slate-800">{batch?.timeSlot}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">রুম নম্বর:</span>
                  <span className="font-semibold text-slate-800">{batch?.roomNo}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fee Payment History */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-teal-600" />
                ফি পরিশোধের ইতিহাস
              </h4>
              <span className="text-xs text-slate-500">
                মোট পরিশোধ: {formatTaka(studentPayments.reduce((acc, p) => acc + p.paidAmount, 0))}
              </span>
            </div>
            {studentPayments.length === 0 ? (
              <div className="bg-slate-50 rounded-xl p-4 text-center text-xs text-slate-500 border border-slate-200">
                কোনো ফি পরিশোধের রেকর্ড পাওয়া যায়নি।
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2 font-semibold">রসিদ নং</th>
                      <th className="px-3 py-2 font-semibold">বিবরণ / মাস</th>
                      <th className="px-3 py-2 font-semibold">তারিখ</th>
                      <th className="px-3 py-2 font-semibold">মাধ্যম</th>
                      <th className="px-3 py-2 font-semibold text-right">পরিশোধ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentPayments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-50/80">
                        <td className="px-3 py-2 font-mono font-medium text-slate-700">
                          {pay.receiptNo}
                        </td>
                        <td className="px-3 py-2 text-slate-800 font-medium">
                          {pay.feeType} ({pay.month})
                        </td>
                        <td className="px-3 py-2 text-slate-500">
                          {formatBengaliDate(pay.date)}
                        </td>
                        <td className="px-3 py-2 text-slate-600">{pay.paymentMethod}</td>
                        <td className="px-3 py-2 font-bold text-emerald-700 text-right">
                          {formatTaka(pay.paidAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Exam Results History */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600" />
                মূল্যায়ন ও পরীক্ষার ফলাফল
              </h4>
              {onEnterMarks && (
                <button
                  onClick={() => {
                    onClose();
                    onEnterMarks(student);
                  }}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  + নম্বর এন্ট্রি করুন
                </button>
              )}
            </div>

            {studentExams.length === 0 ? (
              <div className="bg-slate-50 rounded-xl p-6 text-center text-xs text-slate-500 border border-slate-200">
                <p>এখনও কোনো পরীক্ষার ফলাফল এন্ট্রি করা হয়নি।</p>
                {onEnterMarks && (
                  <button
                    onClick={() => {
                      onClose();
                      onEnterMarks(student);
                    }}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs"
                  >
                    + প্রথম পরীক্ষার নম্বর এন্ট্রি করুন
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5 font-semibold">পরীক্ষার নাম</th>
                      <th className="px-3 py-2.5 font-semibold">বিষয়</th>
                      <th className="px-3 py-2.5 font-semibold text-center">পূর্ণমান</th>
                      <th className="px-3 py-2.5 font-semibold text-center">প্রাপ্ত নম্বর</th>
                      <th className="px-3 py-2.5 font-semibold text-center">গ্রেড</th>
                      <th className="px-3 py-2.5 font-semibold">পরীক্ষক / শিক্ষক</th>
                      <th className="px-3 py-2.5 font-semibold text-center">খাতা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentExams.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="px-3 py-2.5 font-medium text-slate-800">
                          {item!.exam.title}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600">{item!.exam.subject}</td>
                        <td className="px-3 py-2.5 text-center text-slate-600 font-mono">
                          {toBn(item!.exam.totalMarks)}
                        </td>
                        <td className="px-3 py-2.5 text-center font-bold text-emerald-700 font-mono">
                          {toBn(item!.result.marksObtained)}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
                            {item!.result.grade}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-slate-700 font-medium">
                          <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-800 font-semibold">
                            👤 {item!.result.updatedByTeacherName || item!.exam.createdByTeacherName || 'দিল দিহান'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {item!.result.scriptPhotoUrl ? (
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              সংযুক্ত ✓
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
