import React, { useState } from 'react';
import {
  Award,
  Plus,
  Printer,
  Edit,
  Trash2,
  CheckCircle,
  X,
  BookOpen,
  User,
  School,
  Save,
} from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';
import { Exam, ClassGrade } from '../../types';
import { toBn, getGradeAndGPA, formatBengaliDate } from '../../utils/bengaliUtils';
import { ALL_CLASS_GRADES, SHORTCUT_SUBJECTS } from '../../constants/academicData';

const classOptions: ClassGrade[] = ALL_CLASS_GRADES;

export const ExamManagement: React.FC = () => {
  const { exams, batches, students, addExam, updateExamResults, deleteExam, settings } =
    useCoaching();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [markingExam, setMarkingExam] = useState<Exam | null>(null);
  const [printingResult, setPrintingResult] = useState<{
    exam: Exam;
    studentId: string;
  } | null>(null);

  // New Exam Form
  const [newExamForm, setNewExamForm] = useState({
    title: '',
    batchId: batches[0]?.id || '',
    classGrade: '১০ম' as ClassGrade,
    subject: '',
    totalMarks: 50,
    passingMarks: 20,
    examDate: new Date().toISOString().slice(0, 10),
  });

  // Marks map for marking modal
  const [marksMap, setMarksMap] = useState<{ [studentId: string]: number }>({});
  const [remarksMap, setRemarksMap] = useState<{ [studentId: string]: string }>({});

  const handleOpenMarking = (exam: Exam) => {
    setMarkingExam(exam);
    const m: { [id: string]: number } = {};
    const r: { [id: string]: string } = {};

    exam.results.forEach((res) => {
      m[res.studentId] = res.marksObtained;
      r[res.studentId] = res.remarks || '';
    });
    setMarksMap(m);
    setRemarksMap(r);
  };

  const handleSaveMarks = () => {
    if (!markingExam) return;
    const batchStudents = students.filter(
      (s) => s.batchId === markingExam.batchId && s.status === 'সক্রিয়'
    );

    const updatedResults = batchStudents.map((std) => {
      const marks = marksMap[std.id] || 0;
      const { grade, gpa } = getGradeAndGPA(marks, markingExam.totalMarks);
      return {
        studentId: std.id,
        marksObtained: marks,
        grade,
        gpa,
        remarks: remarksMap[std.id] || '',
      };
    });

    updateExamResults(markingExam.id, updatedResults);
    setMarkingExam(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamForm.title.trim()) return;

    const batchStudents = students.filter(
      (s) => s.batchId === newExamForm.batchId && s.status === 'সক্রিয়'
    );

    const initialResults = batchStudents.map((std) => ({
      studentId: std.id,
      marksObtained: 0,
      grade: 'F',
      gpa: 0,
      remarks: '',
    }));

    addExam({
      ...newExamForm,
      results: initialResults,
    });

    setCreateModalOpen(false);
    setNewExamForm({
      title: '',
      batchId: batches[0]?.id || '',
      classGrade: '১০ম',
      subject: '',
      totalMarks: 50,
      passingMarks: 20,
      examDate: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-bold text-slate-800">পরীক্ষা ও ফলাফল ব্যবস্থাপনা</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            সাপ্তাহিক ও মাসিক মডেল টেস্ট গ্রহণ, নম্বর এন্ট্রি ও প্রগ্রেস রিপোর্ট কার্ড তৈরি।
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-sm font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          নতুন পরীক্ষা তৈরি করুন
        </button>
      </div>

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exams.map((exam) => {
          const batch = batches.find((b) => b.id === exam.batchId);
          const hasMarks = exam.results.some((r) => r.marksObtained > 0);

          return (
            <div
              key={exam.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-amber-400 transition space-y-3"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 font-bold">
                  {exam.classGrade} • {exam.subject}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {formatBengaliDate(exam.examDate)}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 leading-snug">{exam.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">ব্যাচ: {batch?.name}</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs flex justify-between">
                <div>
                  <span className="text-slate-500">পূর্ণমান:</span>{' '}
                  <strong className="text-slate-800 font-mono">{toBn(exam.totalMarks)}</strong>
                </div>
                <div>
                  <span className="text-slate-500">পাস নম্বর:</span>{' '}
                  <strong className="text-slate-800 font-mono">{toBn(exam.passingMarks)}</strong>
                </div>
                <div>
                  <span className="text-slate-500">পরীক্ষার্থী:</span>{' '}
                  <strong className="text-emerald-700 font-mono">
                    {toBn(exam.results.length)} জন
                  </strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => handleOpenMarking(exam)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs transition"
                >
                  <Edit className="w-3.5 h-3.5" />
                  {hasMarks ? 'নম্বর আপডেট করুন' : 'নম্বর এন্ট্রি করুন'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (exam.results.length > 0) {
                        setPrintingResult({ exam, studentId: exam.results[0].studentId });
                      }
                    }}
                    title="প্রোগ্রেস কার্ড প্রিন্ট"
                    className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    মার্কশিট প্রিভিউ
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('আপনি কি এই পরীক্ষাটি মুছে ফেলতে চান?')) {
                        deleteExam(exam.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Marks Entry Modal */}
      {markingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="bg-amber-700 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{markingExam.title}</h3>
                <p className="text-xs text-amber-100">
                  পূর্ণমান: {toBn(markingExam.totalMarks)} • পাস: {toBn(markingExam.passingMarks)}
                </p>
              </div>
              <button
                onClick={() => setMarkingExam(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Students marks table */}
            <div className="flex-1 overflow-y-auto p-6">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 w-16">রোল</th>
                    <th className="px-3 py-2">শিক্ষার্থীর নাম</th>
                    <th className="px-3 py-2 w-32">প্রাপ্ত নম্বর</th>
                    <th className="px-3 py-2 text-center w-24">গ্রেড ও GPA</th>
                    <th className="px-3 py-2">মন্তব্য</th>
                    <th className="px-3 py-2 text-right">প্রিন্ট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students
                    .filter((s) => s.batchId === markingExam.batchId && s.status === 'সক্রিয়')
                    .map((std) => {
                      const marks = marksMap[std.id] || 0;
                      const { grade, gpa } = getGradeAndGPA(marks, markingExam.totalMarks);

                      return (
                        <tr key={std.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-mono font-bold">{toBn(std.roll)}</td>
                          <td className="px-3 py-2 font-bold text-slate-800">{std.nameBn}</td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min="0"
                              max={markingExam.totalMarks}
                              value={marksMap[std.id] ?? 0}
                              onChange={(e) =>
                                setMarksMap({ ...marksMap, [std.id]: Number(e.target.value) })
                              }
                              className="w-24 px-2 py-1 text-sm font-bold border border-slate-300 rounded-lg focus:outline-amber-600"
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                                grade === 'F'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {grade} ({toBn(gpa)})
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              placeholder="মন্তব্য..."
                              value={remarksMap[std.id] || ''}
                              onChange={(e) =>
                                setRemarksMap({ ...remarksMap, [std.id]: e.target.value })
                              }
                              className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => setPrintingResult({ exam: markingExam, studentId: std.id })}
                              className="p-1 text-slate-600 hover:text-amber-700"
                              title="মার্কশিট প্রিন্ট"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setMarkingExam(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSaveMarks}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-xl shadow-md"
              >
                <Save className="w-4 h-4" />
                ফলাফল সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Marksheet Modal */}
      {printingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
            <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <span className="font-semibold text-sm">প্রোগ্রেস রিপোর্ট / মার্কশিট প্রিভিউ</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
                >
                  <Printer className="w-4 h-4" />
                  প্রিন্ট মার্কশিট
                </button>
                <button
                  onClick={() => setPrintingResult(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print Content */}
            {(() => {
              const std = students.find((s) => s.id === printingResult.studentId);
              const res = printingResult.exam.results.find(
                (r) => r.studentId === printingResult.studentId
              );
              const marks = res ? res.marksObtained : 0;
              const { grade, gpa } = getGradeAndGPA(marks, printingResult.exam.totalMarks);

              return (
                <div className="p-8 bg-white printable-card text-slate-800 space-y-4">
                  <div className="text-center border-b-2 border-slate-800 pb-3">
                    <h2 className="text-xl font-black text-slate-900">{settings.name}</h2>
                    <p className="text-xs text-slate-600">{settings.address}, {settings.district}</p>
                    <div className="mt-2 inline-block px-3 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-xs font-bold uppercase tracking-wider">
                      শিক্ষার্থী মূল্যায়ন প্রোগ্রেস রিপোর্ট
                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500">শিক্ষার্থীর নাম:</span>{' '}
                      <strong className="text-slate-900">{std?.nameBn}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">রোল নম্বর:</span>{' '}
                      <strong className="text-slate-900 font-mono">{toBn(std?.roll)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">শ্রেণি:</span>{' '}
                      <span className="font-semibold">{std?.classGrade}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">বিদ্যালয়:</span>{' '}
                      <span className="font-semibold truncate">{std?.schoolCollege}</span>
                    </div>
                  </div>

                  {/* Exam Table */}
                  <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden my-3">
                    <thead className="bg-slate-100 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">পরীক্ষার নাম</th>
                        <th className="p-2.5">বিষয়</th>
                        <th className="p-2.5 text-center">পূর্ণমান</th>
                        <th className="p-2.5 text-center">প্রাপ্ত নম্বর</th>
                        <th className="p-2.5 text-center">লেটার গ্রেড</th>
                        <th className="p-2.5 text-center">জিপিএ (GPA)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900">
                          {printingResult.exam.title}
                        </td>
                        <td className="p-2.5">{printingResult.exam.subject}</td>
                        <td className="p-2.5 text-center font-mono font-bold">
                          {toBn(printingResult.exam.totalMarks)}
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-emerald-800 text-sm">
                          {toBn(marks)}
                        </td>
                        <td className="p-2.5 text-center font-bold">{grade}</td>
                        <td className="p-2.5 text-center font-bold font-mono">{toBn(gpa)}</td>
                      </tr>
                    </tbody>
                  </table>

                  {res?.remarks && (
                    <div className="text-xs p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                      <strong>শিক্ষকের মন্তব্য:</strong> {res.remarks}
                    </div>
                  )}

                  <div className="pt-8 flex justify-between text-xs text-slate-600">
                    <div className="text-center">
                      <div className="w-32 border-b border-slate-400 mb-1" />
                      <p>অভিভাবকের স্বাক্ষর</p>
                    </div>
                    <div className="text-center">
                      <div className="w-36 border-b border-slate-400 mb-1" />
                      <p className="font-bold text-slate-800">পরিচালক / বিষয় শিক্ষকের স্বাক্ষর</p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Create Exam Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-amber-700 to-amber-800 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-lg">নতুন মূল্যায়ন বা মডেল টেস্ট তৈরি</h3>
                <p className="text-xs text-amber-200 mt-0.5">বিষয় শর্টকাট থেকে এক ক্লিকে নির্বাচন করুন</p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  পরীক্ষার শিরোনাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: অধ্যায় ৪ ও ৫ স্পেশাল মডেল টেস্ট"
                  value={newExamForm.title}
                  onChange={(e) => setNewExamForm({ ...newExamForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-amber-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ব্যাচ নির্বাচন *
                  </label>
                  <select
                    value={newExamForm.batchId}
                    onChange={(e) => {
                      const bId = e.target.value;
                      const matched = batches.find((b) => b.id === bId);
                      setNewExamForm({
                        ...newExamForm,
                        batchId: bId,
                        classGrade: matched ? matched.classGrade : newExamForm.classGrade,
                        subject: matched && matched.subject ? matched.subject.split(',')[0].trim() : newExamForm.subject,
                      });
                    }}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-amber-600"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.classGrade})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    বিষয় *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: বাংলা / পদার্থ বিজ্ঞান"
                    value={newExamForm.subject}
                    onChange={(e) => setNewExamForm({ ...newExamForm, subject: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-amber-600 font-medium"
                  />
                </div>
              </div>

              {/* Subject Shortcut Chips */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  বিষয় শর্টকাট (ক্লিক করলে বিষয় স্বয়ংক্রিয় বসবে):
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {SHORTCUT_SUBJECTS.map((sub) => {
                    const isSelected = newExamForm.subject === sub;
                    return (
                      <button
                        type="button"
                        key={sub}
                        onClick={() => setNewExamForm({ ...newExamForm, subject: sub })}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition ${
                          isSelected
                            ? 'bg-amber-600 text-white shadow-xs font-bold'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    পূর্ণমান *
                  </label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={newExamForm.totalMarks}
                    onChange={(e) =>
                      setNewExamForm({ ...newExamForm, totalMarks: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-amber-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    পাস নম্বর
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newExamForm.passingMarks}
                    onChange={(e) =>
                      setNewExamForm({ ...newExamForm, passingMarks: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    তারিখ
                  </label>
                  <input
                    type="date"
                    value={newExamForm.examDate}
                    onChange={(e) => setNewExamForm({ ...newExamForm, examDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-amber-600"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-sm rounded-xl shadow-md transition"
                >
                  পরীক্ষা তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
