import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Printer,
  CreditCard,
  Phone,
  UserPlus,
  Award,
} from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';
import { Student } from '../../types';
import { toBn, formatTaka } from '../../utils/bengaliUtils';
import { ALL_CLASS_GRADES } from '../../constants/academicData';

interface StudentManagementProps {
  onOpenNewAdmission: () => void;
  onEditStudent: (student: Student) => void;
  onViewStudent: (student: Student) => void;
  onPrintIdCard: (student: Student) => void;
  onCollectFee: (student: Student) => void;
  onEnterMarks?: (student: Student) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  onOpenNewAdmission,
  onEditStudent,
  onViewStudent,
  onPrintIdCard,
  onCollectFee,
  onEnterMarks,
}) => {
  const { students, batches, deleteStudent, getStudentAttendanceRate, clearAllStudents } = useCoaching();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('সকল');
  const [selectedBatch, setSelectedBatch] = useState<string>('সকল');
  const [selectedStatus, setSelectedStatus] = useState<string>('সকল');

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.nameBn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.nameEn && student.nameEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
      student.roll.includes(searchTerm) ||
      student.guardianPhone.includes(searchTerm) ||
      student.schoolCollege.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = selectedClass === 'সকল' || student.classGrade === selectedClass;
    const matchesBatch = selectedBatch === 'সকল' || student.batchId === selectedBatch;
    const matchesStatus = selectedStatus === 'সকল' || student.status === selectedStatus;

    return matchesSearch && matchesClass && matchesBatch && matchesStatus;
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`আপনি কি নিশ্চিতভাবে "${name}"-এর তথ্য মুছে ফেলতে চান?`)) {
      deleteStudent(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">শিক্ষার্থী ব্যবস্থাপনা ও ভর্তি খাতা</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            মোট নথিভুক্ত শিক্ষার্থী: <strong className="text-slate-800 dark:text-slate-200 font-bold">{toBn(students.length)}</strong> জন
            • সক্রিয়: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{toBn(students.filter(s => s.status === 'সক্রিয়').length)}</strong> জন
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {students.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('আপনি কি নিশ্চিত যে সকল শিক্ষার্থীর ডাটা মুছে ফেলতে চান? এটি শিক্ষার্থীর তালিকা পরিষ্কার করবে।')) {
                  clearAllStudents();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 text-xs font-bold transition cursor-pointer"
              title="সকল শিক্ষার্থীর ডাটা ক্লিয়ার করুন"
            >
              <Trash2 className="w-4 h-4" />
              সব শিক্ষার্থী ক্লিয়ার করুন
            </button>
          )}

          <button
            id="btn-add-student"
            onClick={onOpenNewAdmission}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            নতুন শিক্ষার্থী ভর্তি
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="নাম, রোল, ফোন বা স্কুল খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600 font-medium"
            >
              <option value="সকল">সকল শ্রেণি</option>
              {ALL_CLASS_GRADES.map((cg) => (
                <option key={cg} value={cg}>
                  {cg} শ্রেণি
                </option>
              ))}
            </select>
          </div>

          {/* Batch Filter */}
          <div>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600 font-medium"
            >
              <option value="সকল">সকল ব্যাচ</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600 font-medium"
            >
              <option value="সকল">সকল স্ট্যাটাস</option>
              <option value="সক্রিয়">শুধুমাত্র সক্রিয় (Active)</option>
              <option value="নিষ্ক্রিয়">নিষ্ক্রিয় (Inactive)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">রোল</th>
                <th className="px-4 py-3">শিক্ষার্থীর নাম</th>
                <th className="px-4 py-3">শ্রেণি ও ব্যাচ</th>
                <th className="px-4 py-3">অভিভাবক ও ফোন</th>
                <th className="px-4 py-3">মাসিক বেতন</th>
                <th className="px-4 py-3 text-center">উপস্থিতি</th>
                <th className="px-4 py-3 text-center">স্ট্যাটাস</th>
                <th className="px-4 py-3 text-right">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500 dark:text-slate-400">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <Users className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">কোনো শিক্ষার্থীর তথ্য নেই</p>
                      <p className="text-xs">কাগজের খাতা থেকে নতুন শিক্ষার্থী এন্ট্রি করতে ভর্তি বাটনে ক্লিক করুন।</p>
                      <button
                        onClick={onOpenNewAdmission}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition mt-2"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> নতুন শিক্ষার্থী ভর্তি
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => {
                  const batch = batches.find((b) => b.id === std.batchId);
                  const attRate = getStudentAttendanceRate(std.id);

                  return (
                    <tr key={std.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Roll */}
                      <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {toBn(std.roll)}
                      </td>

                      {/* Name & School */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{std.nameBn}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                          {std.schoolCollege}
                        </div>
                        <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                          <span>👤 এন্ট্রি: {std.addedByTeacherName || 'দিল দিহান'}</span>
                        </div>
                      </td>

                      {/* Class & Batch */}
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium text-xs">
                          {std.classGrade}
                        </span>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[150px]">
                          {batch?.name || 'অ্যাসাইন করা হয়নি'}
                        </div>
                      </td>

                      {/* Guardian & Phone */}
                      <td className="px-4 py-3">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">{std.fatherName}</div>
                        <a
                          href={`tel:${std.guardianPhone}`}
                          className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3" />
                          {std.guardianPhone}
                        </a>
                      </td>

                      {/* Monthly Fee */}
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200 font-mono">
                        {formatTaka(std.monthlyFee)}
                      </td>

                      {/* Attendance % */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                            attRate >= 85
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                              : attRate >= 70
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {toBn(attRate)}%
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            std.status === 'সক্রিয়'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {std.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewStudent(std)}
                            title="বিস্তারিত প্রোফাইল"
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {onEnterMarks && (
                            <button
                              onClick={() => onEnterMarks(std)}
                              title="ইনডিভিজুয়াল মার্কস এন্ট্রি / আপলোড"
                              className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition cursor-pointer"
                            >
                              <Award className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => onCollectFee(std)}
                            title="ফি আদায় করুন"
                            className="p-1.5 rounded-lg text-teal-600 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-200 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onPrintIdCard(std)}
                            title="ডিজিটাল আইডি কার্ড"
                            className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onEditStudent(std)}
                            title="তথ্য এডিট করুন"
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(std.id, std.nameBn)}
                            title="মুছে ফেলুন"
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
