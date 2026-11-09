import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  User,
  ShieldCheck,
  Eye,
  Trash2,
  Save,
  BookOpen,
} from 'lucide-react';
import { Student, Exam } from '../../types';
import { useCoaching } from '../../context/CoachingContext';
import { toBn, getGradeAndGPA, formatBengaliDate } from '../../utils/bengaliUtils';

interface IndividualMarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  defaultExamId?: string;
  onSuccess?: () => void;
}

export const IndividualMarksModal: React.FC<IndividualMarksModalProps> = ({
  isOpen,
  onClose,
  student,
  defaultExamId,
  onSuccess,
}) => {
  const { exams, updateStudentSingleExamMark, currentTeacher, addExam } = useCoaching();

  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [marks, setMarks] = useState<number | ''>('');
  const [remarks, setRemarks] = useState<string>('');
  const [scriptPhotoUrl, setScriptPhotoUrl] = useState<string>('');
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Available exams for this student (matching classGrade or all active)
  const availableExams = React.useMemo(() => {
    if (!student) return [];
    const classFiltered = exams.filter(
      (e) => e.classGrade === student.classGrade || (student.batchId && e.batchId === student.batchId)
    );
    return classFiltered.length > 0 ? classFiltered : exams;
  }, [exams, student]);

  // Selected Exam object
  const currentExam = React.useMemo(() => {
    return exams.find((e) => e.id === selectedExamId) || availableExams[0] || null;
  }, [exams, selectedExamId, availableExams]);

  // Sync state when exam or student changes
  useEffect(() => {
    if (defaultExamId) {
      setSelectedExamId(defaultExamId);
    } else if (availableExams.length > 0 && !selectedExamId) {
      setSelectedExamId(availableExams[0].id);
    }
  }, [defaultExamId, availableExams, selectedExamId]);

  useEffect(() => {
    if (!student || !currentExam) {
      setMarks('');
      setRemarks('');
      setScriptPhotoUrl('');
      return;
    }

    const existingResult = currentExam.results.find((r) => r.studentId === student.id);
    if (existingResult) {
      setMarks(existingResult.marksObtained);
      setRemarks(existingResult.remarks || '');
      setScriptPhotoUrl(existingResult.scriptPhotoUrl || '');
    } else {
      setMarks('');
      setRemarks('');
      setScriptPhotoUrl('');
    }
    setErrorMsg('');
    setSuccessMsg('');
  }, [currentExam, student]);

  if (!isOpen || !student) return null;

  // Handle Image Upload (Answer Script or Marksheet scan)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setErrorMsg('ছবির সাইজ সর্বোচ্চ ৪ মেগাবাইট (4MB) হতে হবে।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setScriptPhotoUrl(result);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentExam) {
      setErrorMsg('অনুগ্রহ করে একটি পরীক্ষা নির্বাচন করুন বা নতুন পরীক্ষা তৈরি করুন।');
      return;
    }

    if (marks === '' || isNaN(Number(marks))) {
      setErrorMsg('অনুগ্রহ করে প্রাপ্ত নম্বর সঠিকভাবে লিখুন।');
      return;
    }

    const numericMarks = Number(marks);
    if (numericMarks < 0 || numericMarks > currentExam.totalMarks) {
      setErrorMsg(`প্রাপ্ত নম্বর ০ থেকে পূর্ণমান ${toBn(currentExam.totalMarks)} এর মধ্যে হতে হবে।`);
      return;
    }

    updateStudentSingleExamMark(student.id, currentExam.id, numericMarks, remarks, scriptPhotoUrl);
    setSuccessMsg('নম্বর এবং খাতার রেকর্ড সফলভাবে সংরক্ষিত হয়েছে!');
    setTimeout(() => {
      setSuccessMsg('');
      if (onSuccess) onSuccess();
      onClose();
    }, 1200);
  };

  const calcGrade =
    marks !== '' && currentExam ? getGradeAndGPA(Number(marks), currentExam.totalMarks) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xl font-bold shadow-inner shrink-0">
              {student.nameBn.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider bg-emerald-500/30 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  ইনডিভিজুয়াল নম্বর এন্ট্রি
                </span>
                <span className="text-[11px] font-mono text-emerald-200">
                  রোল: {toBn(student.roll)}
                </span>
              </div>
              <h3 className="font-extrabold text-lg sm:text-xl text-white mt-0.5">
                {student.nameBn}
              </h3>
              <p className="text-xs text-emerald-100/80">
                শ্রেণি: {student.classGrade} • প্রতিষ্ঠান: {student.schoolCollege}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 font-bold animate-pulse">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Exam Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              মডেল টেস্ট / পরীক্ষা নির্বাচন করুন *
            </label>
            {availableExams.length > 0 ? (
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-semibold focus:outline-emerald-600 cursor-pointer shadow-2xs"
              >
                {availableExams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} • {ex.subject} ({ex.classGrade}) — পূর্ণমান: {toBn(ex.totalMarks)}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                এই শ্রেণির কোনো পরীক্ষা এখনো তৈরি করা হয়নি। নিচে ক্লিক করে স্বয়ংক্রিয় পরীক্ষা তৈরি করতে পারেন।
              </div>
            )}
          </div>

          {/* Selected Exam Information Pill */}
          {currentExam && (
            <div className="bg-slate-100 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">বিষয়</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{currentExam.subject}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">পূর্ণমান</span>
                <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">
                  {toBn(currentExam.totalMarks)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">পাস নম্বর</span>
                <span className="font-bold font-mono text-slate-700 dark:text-slate-300">
                  {toBn(currentExam.passingMarks)}
                </span>
              </div>
            </div>
          )}

          {/* Marks Input & Live Grade Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                প্রাপ্ত নম্বর (Marks Obtained) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max={currentExam?.totalMarks || 100}
                  step="0.5"
                  required
                  placeholder={`০ থেকে ${currentExam ? currentExam.totalMarks : 50}`}
                  value={marks}
                  onChange={(e) => setMarks(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full pl-3.5 pr-14 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-base focus:outline-emerald-600 font-mono shadow-2xs"
                />
                <span className="absolute right-3.5 top-3 text-xs text-slate-400 font-medium">
                  /{currentExam ? toBn(currentExam.totalMarks) : '৫০'}
                </span>
              </div>
            </div>

            {/* Live Calculated Grade */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                স্বয়ংক্রিয় গ্রেড ও GPA
              </label>
              <div className="h-[42px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                {calcGrade ? (
                  <>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-lg font-bold ${
                        calcGrade.grade === 'A+'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : calcGrade.grade === 'A' || calcGrade.grade === 'A-'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : calcGrade.grade === 'F'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      গ্রেড: {calcGrade.grade}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      GPA: {toBn(calcGrade.gpa)}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-slate-400 italic">নম্বর লিখলে গ্রেড দেখাবে</span>
                )}
              </div>
            </div>
          </div>

          {/* Teacher Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              শিক্ষকের মন্তব্য ও পর্যবেক্ষণ (Teacher Remarks)
            </label>
            <input
              type="text"
              placeholder="যেমন: গণিত উপপাদ্যে ভালো করেছে, চমৎকার প্রস্তুতি..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-600 shadow-2xs"
            />
          </div>

          {/* Answer Script / Marksheet Photo Upload */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-600" />
                উত্তরপত্র বা মার্কশিটের ছবি আপলোড (ঐচ্ছিক)
              </label>
              {scriptPhotoUrl && (
                <button
                  type="button"
                  onClick={() => setScriptPhotoUrl('')}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> ছবি মুছুন
                </button>
              )}
            </div>

            {scriptPhotoUrl ? (
              <div className="relative group rounded-xl overflow-hidden border border-emerald-300 dark:border-emerald-800 bg-slate-900 max-h-40 flex items-center justify-center">
                <img
                  src={scriptPhotoUrl}
                  alt="Answer Script Scan"
                  className="w-full h-40 object-cover object-top opacity-90 group-hover:opacity-100 transition"
                />
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition font-bold text-xs gap-1.5"
                >
                  <Eye className="w-4 h-4" /> বড় করে দেখুন
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer transition bg-white dark:bg-slate-800/60">
                <FileText className="w-8 h-8 text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  খাতা বা নম্বরপত্রের ছবি নির্বাচন করুন
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  JPG, PNG ফরম্যাট (সর্বোচ্চ ৪ মেগাবাইট)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Teacher Attribution & Security Badge */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/5 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-300/60 dark:border-emerald-800/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                  তথ্যের সত্যতা ও শিক্ষক অডিট ডিটেকশন:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  এন্ট্রি করছেন: {currentTeacher?.name || 'দিল দিহান'} ({currentTeacher?.designation || currentTeacher?.role || 'শিক্ষক'})
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
              স্বয়ংক্রিয় লক
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              নম্বর ও ফলাফল সংরক্ষণ করুন
            </button>
          </div>
        </form>

        {/* Script Fullscreen Preview Modal */}
        {previewOpen && scriptPhotoUrl && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
            <div className="relative max-w-3xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden p-2">
              <button
                onClick={() => setPreviewOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={scriptPhotoUrl}
                alt="Full Preview"
                className="max-h-[85vh] w-auto mx-auto object-contain rounded-xl"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
