import React, { useState, useMemo } from 'react';
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
  Save,
  Search,
  Trophy,
  FileSpreadsheet,
  CheckSquare,
  AlertCircle,
  TrendingUp,
  GraduationCap,
  Sparkles,
  UserPlus,
  Users,
  Upload,
  ShieldCheck,
} from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';
import { Exam, ClassGrade, Student } from '../../types';
import { toBn, getGradeAndGPA, formatBengaliDate } from '../../utils/bengaliUtils';
import { ALL_CLASS_GRADES, SHORTCUT_SUBJECTS } from '../../constants/academicData';
import { IndividualMarksModal } from './IndividualMarksModal';

type ExamViewMode = 'entry' | 'list' | 'merit';

export const ExamManagement: React.FC = () => {
  const { exams, batches, students, addExam, updateExamResults, deleteExam, settings, addStudent, currentTeacher } =
    useCoaching();

  // Active view tab
  const [activeTab, setActiveTab] = useState<ExamViewMode>('entry');

  // Currently selected exam for marks entry or results viewing
  const [selectedExamId, setSelectedExamId] = useState<string>(() => exams[0]?.id || '');

  // Individual marks upload modal state
  const [individualUploadStudent, setIndividualUploadStudent] = useState<Student | null>(null);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [printingResult, setPrintingResult] = useState<{
    exam: Exam;
    studentId: string;
  } | null>(null);
  const [printingTabulationExam, setPrintingTabulationExam] = useState<Exam | null>(null);

  // Success toast state
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // New Exam Form
  const [newExamForm, setNewExamForm] = useState({
    title: '',
    batchId: '',
    classGrade: '১০ম' as ClassGrade,
    subject: 'গনিত',
    totalMarks: 50,
    passingMarks: 20,
    examDate: new Date().toISOString().slice(0, 10),
  });

  // Current selected exam object
  const currentExam = useMemo(() => {
    return exams.find((e) => e.id === selectedExamId) || exams[0] || null;
  }, [exams, selectedExamId]);

  // Keep selectedExamId valid
  React.useEffect(() => {
    if (exams.length > 0 && (!selectedExamId || !exams.some((e) => e.id === selectedExamId))) {
      setSelectedExamId(exams[0].id);
    }
  }, [exams, selectedExamId]);

  // Local state for marks and remarks for the active exam
  const [marksMap, setMarksMap] = useState<{ [studentId: string]: number }>({});
  const [remarksMap, setRemarksMap] = useState<{ [studentId: string]: string }>({});
  const [absentMap, setAbsentMap] = useState<{ [studentId: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Sync marksMap whenever currentExam changes
  React.useEffect(() => {
    if (!currentExam) {
      setMarksMap({});
      setRemarksMap({});
      setAbsentMap({});
      return;
    }

    const m: { [id: string]: number } = {};
    const r: { [id: string]: string } = {};
    const a: { [id: string]: boolean } = {};

    currentExam.results.forEach((res) => {
      m[res.studentId] = res.marksObtained;
      r[res.studentId] = res.remarks || '';
      if (res.remarks === 'অনুপস্থিত' || (res.marksObtained === 0 && res.grade === 'F' && res.remarks?.includes('অনুপস্থিত'))) {
        a[res.studentId] = true;
      }
    });

    setMarksMap(m);
    setRemarksMap(r);
    setAbsentMap(a);
  }, [currentExam]);

  // Find eligible students for an exam
  const getEligibleStudents = (exam: Exam | null): Student[] => {
    if (!exam) return [];
    
    // 1. Students explicitly enrolled in the exam's batch (if set)
    let matched = students.filter((s) => s.status === 'সক্রিয়');

    if (exam.batchId) {
      const byBatch = matched.filter((s) => s.batchId === exam.batchId);
      if (byBatch.length > 0) {
        matched = byBatch;
      }
    }

    // 2. Filter by classGrade
    if (exam.classGrade) {
      const byClass = matched.filter((s) => s.classGrade === exam.classGrade);
      if (byClass.length > 0) {
        matched = byClass;
      }
    }

    // 3. Include any student who already has recorded results in this exam
    const existingResultIds = new Set(exam.results.map((r) => r.studentId));
    const extraStudents = students.filter((s) => existingResultIds.has(s.id));

    const combined = [...matched];
    extraStudents.forEach((st) => {
      if (!combined.some((item) => item.id === st.id)) {
        combined.push(st);
      }
    });

    // If no match found by class, return all active students so the teacher is never blocked
    if (combined.length === 0 && students.length > 0) {
      return students.filter((s) => s.status === 'সক্রিয়');
    }

    return combined;
  };

  const eligibleStudents = useMemo(() => {
    return getEligibleStudents(currentExam);
  }, [currentExam, students]);

  // Filtered by search
  const displayedStudents = useMemo(() => {
    if (!searchTerm.trim()) return eligibleStudents;
    const term = searchTerm.toLowerCase();
    return eligibleStudents.filter(
      (s) =>
        s.nameBn.toLowerCase().includes(term) ||
        (s.nameEn && s.nameEn.toLowerCase().includes(term)) ||
        s.roll.toString().includes(term)
    );
  }, [eligibleStudents, searchTerm]);

  // Handle saving marks for the current exam
  const handleSaveMarks = () => {
    if (!currentExam) return;

    const updatedResults = eligibleStudents.map((std) => {
      const isAbsent = !!absentMap[std.id];
      const marks = isAbsent ? 0 : Number(marksMap[std.id] ?? 0);
      const { grade, gpa } = getGradeAndGPA(marks, currentExam.totalMarks);

      let remark = remarksMap[std.id] || '';
      if (isAbsent && !remark) {
        remark = 'অনুপস্থিত';
      }

      return {
        studentId: std.id,
        marksObtained: marks,
        grade: isAbsent ? 'F' : grade,
        gpa: isAbsent ? 0 : gpa,
        remarks: remark,
      };
    });

    updateExamResults(currentExam.id, updatedResults);
    setSaveSuccessMsg(`'${currentExam.title}' এর নম্বর সফলভাবে সংরক্ষিত হয়েছে!`);
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  // Quick helper: Fill all with pass marks
  const handleFillPassMarks = () => {
    if (!currentExam) return;
    const newMap = { ...marksMap };
    eligibleStudents.forEach((s) => {
      if (!absentMap[s.id]) {
        newMap[s.id] = currentExam.passingMarks;
      }
    });
    setMarksMap(newMap);
  };

  // Quick helper: Clear all marks
  const handleClearMarks = () => {
    if (window.confirm('আপনি কি এই পরীক্ষার সকল ইনপুটকৃত নম্বর মুছে শূন্য করতে চান?')) {
      const newMap: { [id: string]: number } = {};
      eligibleStudents.forEach((s) => {
        newMap[s.id] = 0;
      });
      setMarksMap(newMap);
      setAbsentMap({});
    }
  };

  // Quick seed sample students if none exist
  const handleSeedSampleStudents = () => {
    const sampleList: Array<Omit<Student, 'id'>> = [
      {
        roll: '১০১',
        nameBn: 'তানভীর আহমেদ',
        nameEn: 'Tanvir Ahmed',
        classGrade: currentExam ? currentExam.classGrade : '১০ম',
        batchId: currentExam?.batchId || '',
        fatherName: 'মোহাম্মদ রফিক',
        phone: '০১৮১২-৩৪৫৬৭৮',
        guardianPhone: '০১৮১২-৩৪৫৬৭৮',
        schoolCollege: 'সীতাকুণ্ড সরকারি মডেল হাই স্কুল',
        address: 'গুলিয়াখালী, সীতাকুণ্ড, চট্টগ্রাম',
        bloodGroup: 'B+',
        admissionDate: new Date().toISOString().slice(0, 10),
        monthlyFee: 1500,
        status: 'সক্রিয়',
        gender: 'ছাত্র',
      },
      {
        roll: '১০২',
        nameBn: 'মেহেদী হাসান',
        nameEn: 'Mehedi Hasan',
        classGrade: currentExam ? currentExam.classGrade : '১০ম',
        batchId: currentExam?.batchId || '',
        fatherName: 'আজিজুল হক',
        phone: '০১৮২৩-৪৫৬৭৮৯',
        guardianPhone: '০১৮২৩-৪৫৬৭৮৯',
        schoolCollege: 'সীতাকুণ্ড মডেল স্কুল ও কলেজ',
        address: 'সীতাকুণ্ড পৌরসভা, চট্টগ্রাম',
        bloodGroup: 'O+',
        admissionDate: new Date().toISOString().slice(0, 10),
        monthlyFee: 1500,
        status: 'সক্রিয়',
        gender: 'ছাত্র',
      },
      {
        roll: '১০৩',
        nameBn: 'নাসরিন সুলতানা',
        nameEn: 'Nasrin Sultana',
        classGrade: currentExam ? currentExam.classGrade : '১০ম',
        batchId: currentExam?.batchId || '',
        fatherName: 'আবুল কাসেম',
        phone: '০১৮৩৪-৫৬৭৮৯০',
        guardianPhone: '০১৮৩৪-৫৬৭৮৯০',
        schoolCollege: 'সীতাকুণ্ড বালিকা উচ্চ বিদ্যালয়',
        address: 'সীতাকুণ্ড, চট্টগ্রাম',
        bloodGroup: 'A+',
        admissionDate: new Date().toISOString().slice(0, 10),
        monthlyFee: 1500,
        status: 'সক্রিয়',
        gender: 'ছাত্রী',
      },
    ];

    sampleList.forEach((s) => addStudent(s));
  };

  // Quick create demo exam if none exist
  const handleCreateQuickSampleExam = () => {
    addExam({
      title: '১০ম শ্রেণি - গণিত ১ম মাসিক মডেল টেস্ট',
      batchId: batches[0]?.id || '',
      classGrade: '১০ম',
      subject: 'গনিত',
      totalMarks: 50,
      passingMarks: 20,
      examDate: new Date().toISOString().slice(0, 10),
      results: [],
    });
  };

  // Create exam submission
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamForm.title.trim()) return;

    // Pre-populate initial results for students of this class/batch
    const targetStudents = students.filter(
      (s) =>
        s.status === 'সক্রিয়' &&
        (s.classGrade === newExamForm.classGrade || (newExamForm.batchId && s.batchId === newExamForm.batchId))
    );

    const initialResults = targetStudents.map((std) => ({
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
      subject: 'গনিত',
      totalMarks: 50,
      passingMarks: 20,
      examDate: new Date().toISOString().slice(0, 10),
    });

    // Automatically switch to marks entry tab
    setActiveTab('entry');
  };

  // Statistics calculation for currentExam
  const stats = useMemo(() => {
    if (!currentExam || eligibleStudents.length === 0) {
      return { total: 0, entered: 0, passed: 0, failed: 0, highest: 0, average: 0, passRate: 0 };
    }

    const marksList = eligibleStudents.map((s) => {
      const isAb = absentMap[s.id];
      return isAb ? 0 : Number(marksMap[s.id] ?? 0);
    });

    const enteredCount = eligibleStudents.filter((s) => marksMap[s.id] !== undefined || absentMap[s.id]).length;
    const passedCount = eligibleStudents.filter((s) => !absentMap[s.id] && (marksMap[s.id] || 0) >= currentExam.passingMarks).length;
    const failedCount = eligibleStudents.filter((s) => absentMap[s.id] || (marksMap[s.id] !== undefined && marksMap[s.id] < currentExam.passingMarks)).length;

    const highest = marksList.length > 0 ? Math.max(...marksList) : 0;
    const totalScore = marksList.reduce((acc, curr) => acc + curr, 0);
    const average = marksList.length > 0 ? Math.round(totalScore / marksList.length) : 0;
    const passRate = eligibleStudents.length > 0 ? Math.round((passedCount / eligibleStudents.length) * 100) : 0;

    return {
      total: eligibleStudents.length,
      entered: enteredCount,
      passed: passedCount,
      failed: failedCount,
      highest,
      average,
      passRate,
    };
  }, [currentExam, eligibleStudents, marksMap, absentMap]);

  // Ranked results for Merit List
  const meritList = useMemo(() => {
    if (!currentExam) return [];
    return eligibleStudents
      .map((std) => {
        const isAbsent = !!absentMap[std.id];
        const marks = isAbsent ? 0 : Number(marksMap[std.id] ?? 0);
        const { grade, gpa } = getGradeAndGPA(marks, currentExam.totalMarks);
        const remark = remarksMap[std.id] || (isAbsent ? 'অনুপস্থিত' : '');
        const isPassed = !isAbsent && marks >= currentExam.passingMarks;

        return {
          student: std,
          marks,
          grade: isAbsent ? 'F' : grade,
          gpa: isAbsent ? 0 : gpa,
          remarks: remark,
          isAbsent,
          isPassed,
        };
      })
      .sort((a, b) => {
        if (a.isAbsent && !b.isAbsent) return 1;
        if (!a.isAbsent && b.isAbsent) return -1;
        return b.marks - a.marks;
      });
  }, [currentExam, eligibleStudents, marksMap, absentMap, remarksMap]);

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                পরীক্ষা ও ফলাফল ব্যবস্থাপনা
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                মডেল টেস্ট গ্রহণ, সরাসরি নম্বর এন্ট্রি, মেধা তালিকা ও মার্কশিট প্রিন্ট
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => {
              setActiveTab('entry');
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-sm font-bold shadow-xs transition cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            নম্বর এন্ট্রি করুন
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            নতুন পরীক্ষা তৈরি
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('entry')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer shrink-0 ${
            activeTab === 'entry'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Edit className="w-4 h-4" />
          <span>নম্বর এন্ট্রি (Marks Entry)</span>
          {currentExam && (
            <span className="ml-1 px-2 py-0.5 rounded-md bg-amber-600 text-white text-[11px]">
              {toBn(eligibleStudents.length)} জন
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer shrink-0 ${
            activeTab === 'list'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>পরীক্ষাসমূহ ({toBn(exams.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('merit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer shrink-0 ${
            activeTab === 'merit'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>মেধা তালিকা ও ফলাফল শিট</span>
        </button>
      </div>

      {/* Save Success Alert */}
      {saveSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl flex items-center gap-2.5 text-sm font-semibold shadow-xs animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* ========================================================
          TAB 1: MARKS ENTRY VIEW (Direct Number Entry)
      ======================================================== */}
      {activeTab === 'entry' && (
        <div className="space-y-4">
          {/* Exam Selection Bar & Actions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex-1 w-full lg:w-auto">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  পরীক্ষা নির্বাচন করুন:
                </label>

                {exams.length > 0 ? (
                  <select
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-sm focus:outline-amber-600 cursor-pointer shadow-2xs"
                  >
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.title} • {ex.classGrade} ({ex.subject}) — পূর্ণমান: {toBn(ex.totalMarks)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3">
                    <span>বর্তমানে কোনো পরীক্ষা তৈরি করা হয়নি। নম্বর এন্ট্রি করতে একটি পরীক্ষা তৈরি করুন।</span>
                    <button
                      onClick={handleCreateQuickSampleExam}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer"
                    >
                      + নমুনা পরীক্ষা তৈরি
                    </button>
                  </div>
                )}
              </div>

              {currentExam && (
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
                  <button
                    onClick={handleFillPassMarks}
                    title="সকল শিক্ষার্থীকে নূন্যতম পাস নম্বর দিন"
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    সকলকে পাস নম্বর
                  </button>

                  <button
                    onClick={handleClearMarks}
                    title="নম্বর ক্লিয়ার করুন"
                    className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-semibold transition cursor-pointer border border-rose-200 dark:border-rose-900"
                  >
                    নম্বর ক্লিয়ার
                  </button>

                  <button
                    onClick={handleSaveMarks}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-bold shadow-xs transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    সংরক্ষণ করুন
                  </button>
                </div>
              )}
            </div>

            {/* Exam Quick Specs Banner */}
            {currentExam && (
              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">বিষয়</span>
                  <strong className="text-slate-800 dark:text-slate-200 text-xs font-bold">{currentExam.subject}</strong>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">শ্রেণি</span>
                  <strong className="text-slate-800 dark:text-slate-200 text-xs font-bold">{currentExam.classGrade}</strong>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200/60 dark:border-amber-900">
                  <span className="text-amber-700 dark:text-amber-400 block text-[11px]">পূর্ণমান</span>
                  <strong className="text-amber-900 dark:text-amber-300 font-mono font-bold">{toBn(currentExam.totalMarks)}</strong>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">পাস নম্বর</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-mono font-bold">{toBn(currentExam.passingMarks)}</strong>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">সর্বোচ্চ নম্বর</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{toBn(stats.highest)}</strong>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200/60 dark:border-emerald-900">
                  <span className="text-emerald-700 dark:text-emerald-400 block text-[11px]">পাসের হার</span>
                  <strong className="text-emerald-900 dark:text-emerald-300 font-mono font-bold">{toBn(stats.passRate)}%</strong>
                </div>

                <div className="col-span-2 sm:col-span-4 lg:col-span-6 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      পরীক্ষার প্রশ্ন ও রেকর্ড তৈরি করেছেন: <strong className="text-slate-900 dark:text-slate-100">{currentExam.createdByTeacherName || 'দিল দিহান (শিক্ষক)'}</strong>
                    </span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                    তারিখ: {formatBengaliDate(currentExam.examDate)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Student Marks Entry Table */}
          {currentExam ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
              {/* Table search & filter toolbar */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="রোল বা নাম দিয়ে খুঁজুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-amber-600"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 w-full sm:w-auto justify-between sm:justify-end">
                  <span>
                    মোট পরীক্ষার্থী:{' '}
                    <strong className="text-slate-900 dark:text-white font-mono font-bold">
                      {toBn(eligibleStudents.length)} জন
                    </strong>
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span>
                    পাস:{' '}
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      {toBn(stats.passed)}
                    </strong>
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span>
                    ফেল:{' '}
                    <strong className="text-rose-600 dark:text-rose-400 font-mono font-bold">
                      {toBn(stats.failed)}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Main Marks Entry Table */}
              {displayedStudents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 text-xs">
                      <tr>
                        <th className="px-3 py-3 w-16 text-center font-bold">রোল</th>
                        <th className="px-3 py-3 min-w-[160px] font-bold">শিক্ষার্থীর নাম ও তথ্য</th>
                        <th className="px-3 py-3 w-36 font-bold">
                          প্রাপ্ত নম্বর (/{toBn(currentExam.totalMarks)})
                        </th>
                        <th className="px-3 py-3 w-28 text-center font-bold">অনুপস্থিত</th>
                        <th className="px-3 py-3 w-28 text-center font-bold">গ্রেড ও GPA</th>
                        <th className="px-3 py-3 w-32 text-center font-bold">ইন্ডিভিজুয়াল আপলোড</th>
                        <th className="px-3 py-3 min-w-[140px] font-bold">শিক্ষকের মন্তব্য</th>
                        <th className="px-3 py-3 w-20 text-center font-bold">প্রিন্ট</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {displayedStudents.map((std, idx) => {
                        const isAbsent = !!absentMap[std.id];
                        const marks = isAbsent ? 0 : Number(marksMap[std.id] ?? 0);
                        const { grade, gpa } = getGradeAndGPA(marks, currentExam.totalMarks);

                        const isTop = marks > 0 && marks === stats.highest;

                        return (
                          <tr
                            key={std.id}
                            className={`hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition ${
                              isAbsent ? 'bg-slate-50/60 dark:bg-slate-900/40 opacity-75' : ''
                            }`}
                          >
                            {/* Roll */}
                            <td className="px-3 py-3 text-center">
                              <span className="inline-block px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold text-xs">
                                {toBn(std.roll)}
                              </span>
                            </td>

                            {/* Student Info */}
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold flex items-center justify-center text-xs shrink-0">
                                  {std.nameBn.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <strong className="text-slate-900 dark:text-slate-100 truncate block text-xs sm:text-sm">
                                      {std.nameBn}
                                    </strong>
                                    {isTop && (
                                      <span
                                        title="সর্বোচ্চ নম্বর অর্জনকারী"
                                        className="inline-flex items-center px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold shrink-0"
                                      >
                                        ১ম
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                    {std.schoolCollege || `${std.classGrade} শ্রেণি`}
                                  </p>
                                  {(() => {
                                    const matchRes = currentExam.results.find((r) => r.studentId === std.id);
                                    const tName = matchRes?.updatedByTeacherName || currentExam.createdByTeacherName;
                                    return (
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                                          👤 শিক্ষক: {tName || 'দিল দিহান'}
                                        </span>
                                        {matchRes?.scriptPhotoUrl && (
                                          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950 px-1 py-0.2 rounded border border-amber-200">
                                            খাতা সংযুক্ত ✓
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            </td>

                            {/* Marks Input Field */}
                            <td className="px-3 py-3">
                              <div className="relative flex items-center">
                                <input
                                  type="number"
                                  min="0"
                                  max={currentExam.totalMarks}
                                  disabled={isAbsent}
                                  value={isAbsent ? '' : (marksMap[std.id] ?? '')}
                                  placeholder={isAbsent ? 'অনুপস্থিত' : '০'}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? 0 : Number(e.target.value);
                                    if (val <= currentExam.totalMarks) {
                                      setMarksMap({ ...marksMap, [std.id]: val });
                                    }
                                  }}
                                  className={`w-28 px-3 py-2 text-sm font-mono font-bold rounded-xl border transition ${
                                    isAbsent
                                      ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 text-slate-400 cursor-not-allowed'
                                      : marks >= currentExam.passingMarks
                                      ? 'bg-white dark:bg-slate-800 border-amber-300 dark:border-amber-600 text-slate-900 dark:text-slate-100 focus:outline-amber-600 focus:ring-2 focus:ring-amber-500/20 shadow-2xs'
                                      : 'bg-white dark:bg-slate-800 border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 focus:outline-rose-600 shadow-2xs'
                                  }`}
                                />
                                <span className="ml-2 text-xs text-slate-400 font-mono hidden sm:inline">
                                  /{toBn(currentExam.totalMarks)}
                                </span>
                              </div>
                            </td>

                            {/* Absent Toggle */}
                            <td className="px-3 py-3 text-center">
                              <label className="inline-flex items-center gap-1.5 cursor-pointer select-none text-xs">
                                <input
                                  type="checkbox"
                                  checked={isAbsent}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setAbsentMap({ ...absentMap, [std.id]: checked });
                                    if (checked) {
                                      setMarksMap({ ...marksMap, [std.id]: 0 });
                                      setRemarksMap({ ...remarksMap, [std.id]: 'অনুপস্থিত' });
                                    } else {
                                      setRemarksMap({ ...remarksMap, [std.id]: '' });
                                    }
                                  }}
                                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 rounded-md cursor-pointer"
                                />
                                <span className={isAbsent ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                                  {isAbsent ? 'অনুপস্থিত' : 'হাজির'}
                                </span>
                              </label>
                            </td>

                            {/* Live Grade & GPA Badge */}
                            <td className="px-3 py-3 text-center">
                              {isAbsent ? (
                                <span className="px-2 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-500 dark:bg-slate-800">
                                  F (০.০০)
                                </span>
                              ) : (
                                <span
                                  className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                                    grade === 'A+'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                      : grade === 'A' || grade === 'A-'
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                                      : grade === 'F'
                                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                  }`}
                                >
                                  {grade} ({toBn(gpa)})
                                </span>
                              )}
                            </td>

                            {/* Individual Upload / Script Attachment */}
                            <td className="px-3 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => setIndividualUploadStudent(std)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold transition cursor-pointer shadow-2xs active:scale-95"
                                title="খাতা আপলোড ও ইনডিভিজুয়াল নম্বর এন্ট্রি"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>আপলোড</span>
                              </button>
                            </td>

                            {/* Remarks Field */}
                            <td className="px-3 py-3">
                              <input
                                type="text"
                                placeholder="মন্তব্য (যেমন: চমৎকার, পড়া ভালো)..."
                                value={remarksMap[std.id] || ''}
                                onChange={(e) =>
                                  setRemarksMap({ ...remarksMap, [std.id]: e.target.value })
                                }
                                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-amber-600"
                              />
                            </td>

                            {/* Print Action */}
                            <td className="px-3 py-3 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  setPrintingResult({ exam: currentExam, studentId: std.id })
                                }
                                title="শিক্ষার্থীর মার্কশিট প্রিন্ট করুন"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition cursor-pointer"
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
              ) : (
                <div className="p-10 text-center">
                  <Users className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    কোনো শিক্ষার্থী পাওয়া যায়নি
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    {searchTerm
                      ? 'অনুসন্ধানের সাথে কোনো শিক্ষার্থীর মিল পাওয়া যায়নি।'
                      : 'এই শ্রেণির কোনো শিক্ষার্থী এখনো ভর্তি করা হয়নি। নিচে ক্লিক করে নমুনা শিক্ষার্থী তৈরি করতে পারেন।'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={handleSeedSampleStudents}
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-4 h-4" />
                      ৩ জন ডেমো শিক্ষার্থী যুক্ত করুন
                    </button>
                  )}
                </div>
              )}

              {/* Bottom Sticky Action Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
                  নম্বর ইনপুট দিয়ে নিচের <strong>'ফলাফল ও নম্বর সংরক্ষণ করুন'</strong> বাটনে চাপ দিন।
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab('merit')}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                  >
                    মেধা তালিকা দেখুন
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveMarks}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    ফলাফল ও নম্বর সংরক্ষণ করুন
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 mx-auto mb-3.5">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                কোনো পরীক্ষা পাওয়া যায়নি
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
                নম্বর এন্ট্রি করার জন্য প্রথমে একটি পরীক্ষা তৈরি করুন। এক ক্লিকে পরীক্ষা তৈরি করে সরাসরি নম্বর ইনপুট করতে পারবেন।
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  নতুন পরীক্ষা তৈরি করুন
                </button>
                <button
                  onClick={handleCreateQuickSampleExam}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  নমুনা মডেল টেস্ট তৈরি করুন
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: EXAMS LIST VIEW
      ======================================================== */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {exams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.map((exam) => {
                const batch = batches.find((b) => b.id === exam.batchId);
                const hasMarks = exam.results.some((r) => r.marksObtained > 0);
                const examEligible = getEligibleStudents(exam);
                const enteredCount = exam.results.length;

                return (
                  <div
                    key={exam.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-amber-400 dark:hover:border-amber-600 transition space-y-3.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs px-2.5 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                          {exam.classGrade} শ্রেণি • {exam.subject}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {formatBengaliDate(exam.examDate)}
                        </span>
                      </div>

                      <div className="mt-2.5">
                        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug">
                          {exam.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          ব্যাচ: {batch ? batch.name : 'সকল শিক্ষার্থী'}
                        </p>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-700 text-xs flex justify-between mt-3">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">পূর্ণমান:</span>{' '}
                          <strong className="text-slate-800 dark:text-slate-200 font-mono">
                            {toBn(exam.totalMarks)}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">পাস নম্বর:</span>{' '}
                          <strong className="text-slate-800 dark:text-slate-200 font-mono">
                            {toBn(exam.passingMarks)}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">পরীক্ষার্থী:</span>{' '}
                          <strong className="text-emerald-700 dark:text-emerald-400 font-mono">
                            {toBn(examEligible.length)} জন
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setSelectedExamId(exam.id);
                          setActiveTab('entry');
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-900 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800 transition cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5 text-amber-600" />
                        {hasMarks ? 'নম্বর আপডেট করুন' : 'নম্বর এন্ট্রি করুন'}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedExamId(exam.id);
                            setActiveTab('merit');
                          }}
                          title="মেধা তালিকা ও ফলাফল দেখুন"
                          className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                        >
                          <Trophy className="w-3.5 h-3.5" />
                          ফলাফল
                        </button>

                        <button
                          onClick={() => setPrintingTabulationExam(exam)}
                          title="ট্যাবুলেশন শিট প্রিন্ট করুন"
                          className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm('আপনি কি এই পরীক্ষাটি মুছে ফেলতে চান?')) {
                              deleteExam(exam.id);
                            }
                          }}
                          title="মুছে ফেলুন"
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 mx-auto mb-3.5">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                কোনো পরীক্ষা তালিকাভুক্ত নেই
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
                নতুন পরীক্ষা তৈরি করতে নিচের বাটনে ক্লিক করুন।
              </p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                নতুন পরীক্ষা তৈরি করুন
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: MERIT LIST & TABULATION SHEET VIEW
      ======================================================== */}
      {activeTab === 'merit' && (
        <div className="space-y-4">
          {/* Exam Filter & Print Tabulation */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:w-80">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ফলাফল পরীক্ষার নির্বাচন:
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-xs sm:text-sm focus:outline-amber-600 cursor-pointer"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} • {ex.classGrade} ({ex.subject})
                  </option>
                ))}
              </select>
            </div>

            {currentExam && (
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setPrintingTabulationExam(currentExam)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  সম্পূর্ণ ট্যাবুলেশন শিট প্রিন্ট
                </button>
              </div>
            )}
          </div>

          {/* Merit List Table */}
          {currentExam ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/20 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-600" />
                    {currentExam.title} — মেধা তালিকা (Merit List)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    পূর্ণমান: {toBn(currentExam.totalMarks)} • পাস নম্বর: {toBn(currentExam.passingMarks)}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                    পাস: {toBn(stats.passed)} জন ({toBn(stats.passRate)}%)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold">
                    ফেল: {toBn(stats.failed)} জন
                  </span>
                </div>
              </div>

              {meritList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="px-3 py-3 w-16 text-center font-bold">স্থান (Rank)</th>
                        <th className="px-3 py-3 w-16 text-center font-bold">রোল</th>
                        <th className="px-3 py-3 font-bold">শিক্ষার্থীর নাম</th>
                        <th className="px-3 py-3 text-center font-bold">
                          প্রাপ্ত নম্বর (/{toBn(currentExam.totalMarks)})
                        </th>
                        <th className="px-3 py-3 text-center font-bold">গ্রেড ও GPA</th>
                        <th className="px-3 py-3 text-center font-bold">ফলাফল</th>
                        <th className="px-3 py-3 font-bold">মন্তব্য</th>
                        <th className="px-3 py-3 text-center font-bold">মার্কশিট</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {meritList.map((item, idx) => {
                        const rank = idx + 1;
                        return (
                          <tr
                            key={item.student.id}
                            className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                              rank === 1
                                ? 'bg-amber-50/40 dark:bg-amber-950/20'
                                : rank <= 3
                                ? 'bg-blue-50/20 dark:bg-blue-950/10'
                                : ''
                            }`}
                          >
                            <td className="px-3 py-3 text-center font-bold">
                              {rank === 1 ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-white font-bold text-xs shadow-xs">
                                  ১
                                </span>
                              ) : rank === 2 ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-white font-bold text-xs shadow-xs">
                                  ২
                                </span>
                              ) : rank === 3 ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white font-bold text-xs shadow-xs">
                                  ৩
                                </span>
                              ) : (
                                <span className="text-slate-500 font-mono">{toBn(rank)}</span>
                              )}
                            </td>

                            <td className="px-3 py-3 text-center font-mono font-bold">
                              {toBn(item.student.roll)}
                            </td>

                            <td className="px-3 py-3">
                              <strong className="text-slate-800 dark:text-slate-200">
                                {item.student.nameBn}
                              </strong>
                              <p className="text-[11px] text-slate-500 truncate">
                                {item.student.schoolCollege || `${item.student.classGrade} শ্রেণি`}
                              </p>
                            </td>

                            <td className="px-3 py-3 text-center font-mono font-bold text-sm">
                              {item.isAbsent ? (
                                <span className="text-slate-400">অনুপস্থিত</span>
                              ) : (
                                <span
                                  className={
                                    item.isPassed ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'
                                  }
                                >
                                  {toBn(item.marks)}
                                </span>
                              )}
                            </td>

                            <td className="px-3 py-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                                  item.grade === 'A+'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : item.grade === 'F'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {item.grade} ({toBn(item.gpa)})
                              </span>
                            </td>

                            <td className="px-3 py-3 text-center">
                              {item.isAbsent ? (
                                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold">
                                  অনুপস্থিত
                                </span>
                              ) : item.isPassed ? (
                                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                                  কৃতকার্য
                                </span>
                              ) : (
                                <span className="text-xs px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold">
                                  অকৃতকার্য
                                </span>
                              )}
                            </td>

                            <td className="px-3 py-3 text-xs text-slate-600 dark:text-slate-400">
                              {item.remarks || '—'}
                            </td>

                            <td className="px-3 py-3 text-center">
                              <button
                                onClick={() =>
                                  setPrintingResult({ exam: currentExam, studentId: item.student.id })
                                }
                                title="প্রোগ্রেস কার্ড প্রিন্ট"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition cursor-pointer"
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
              ) : (
                <div className="p-10 text-center text-slate-500">কোনো ফলাফল পাওয়া যায়নি।</div>
              )}
            </div>
          ) : (
            <div className="p-10 text-center text-slate-500">কোনো পরীক্ষা পাওয়া যায়নি।</div>
          )}
        </div>
      )}

      {/* ========================================================
          CREATE EXAM MODAL
      ======================================================== */}
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
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
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
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-amber-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    শ্রেণি নির্বাচন *
                  </label>
                  <select
                    value={newExamForm.classGrade}
                    onChange={(e) =>
                      setNewExamForm({ ...newExamForm, classGrade: e.target.value as ClassGrade })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-amber-600 font-semibold"
                  >
                    {ALL_CLASS_GRADES.map((cg) => (
                      <option key={cg} value={cg}>
                        {cg} শ্রেণি
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ব্যাচ (ঐচ্ছিক)
                  </label>
                  <select
                    value={newExamForm.batchId}
                    onChange={(e) => setNewExamForm({ ...newExamForm, batchId: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-amber-600"
                  >
                    <option value="">এই শ্রেণির সকল শিক্ষার্থী</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.classGrade})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  বিষয় *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: গনিত / উচ্চতর গনিত / পদার্থ বিজ্ঞান"
                  value={newExamForm.subject}
                  onChange={(e) => setNewExamForm({ ...newExamForm, subject: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-amber-600 font-medium"
                />
              </div>

              {/* Subject Shortcut Chips */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  বিষয় শর্টকাট (ক্লিক করলে স্বয়ংক্রিয়ভাবে বসবে):
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {SHORTCUT_SUBJECTS.map((sub) => {
                    const isSelected = newExamForm.subject === sub;
                    return (
                      <button
                        type="button"
                        key={sub}
                        onClick={() => setNewExamForm({ ...newExamForm, subject: sub })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
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
                    onChange={(e) => {
                      const tm = Number(e.target.value);
                      setNewExamForm({
                        ...newExamForm,
                        totalMarks: tm,
                        passingMarks: Math.round(tm * 0.4),
                      });
                    }}
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
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-amber-600 font-bold"
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
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-sm rounded-xl shadow-md transition cursor-pointer"
                >
                  পরীক্ষা তৈরি ও নম্বর এন্ট্রি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          PRINTABLE INDIVIDUAL MARKSHEET MODAL
      ======================================================== */}
      {printingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
            <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
              <span className="font-semibold text-sm">প্রোগ্রেস রিপোর্ট / মার্কশিট প্রিভিউ</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  প্রিন্ট মার্কশিট
                </button>
                <button
                  onClick={() => setPrintingResult(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="p-6 sm:p-8 bg-white printable-card text-slate-800 space-y-4 overflow-y-auto">
              {(() => {
                const std = students.find((s) => s.id === printingResult.studentId);
                const marks = Number(marksMap[printingResult.studentId] ?? 0);
                const isAbsent = !!absentMap[printingResult.studentId];
                const { grade, gpa } = getGradeAndGPA(marks, printingResult.exam.totalMarks);
                const remark = remarksMap[printingResult.studentId] || (isAbsent ? 'অনুপস্থিত' : '');

                return (
                  <>
                    <div className="text-center border-b-2 border-slate-800 pb-3">
                      <h2 className="text-xl font-black text-slate-900">{settings.name}</h2>
                      <p className="text-xs text-slate-600">
                        {settings.address}, {settings.district}
                      </p>
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
                        <span className="font-semibold">{std?.classGrade || printingResult.exam.classGrade}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">বিদ্যালয়:</span>{' '}
                        <span className="font-semibold truncate">{std?.schoolCollege || '—'}</span>
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
                          <td className="p-2.5 font-bold text-slate-900">{printingResult.exam.title}</td>
                          <td className="p-2.5">{printingResult.exam.subject}</td>
                          <td className="p-2.5 text-center font-mono font-bold">
                            {toBn(printingResult.exam.totalMarks)}
                          </td>
                          <td className="p-2.5 text-center font-mono font-bold text-emerald-800 text-sm">
                            {isAbsent ? 'অনুপস্থিত' : toBn(marks)}
                          </td>
                          <td className="p-2.5 text-center font-bold">{isAbsent ? 'F' : grade}</td>
                          <td className="p-2.5 text-center font-bold font-mono">
                            {isAbsent ? toBn(0) : toBn(gpa)}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {remark && (
                      <div className="text-xs p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                        <strong>শিক্ষকের মন্তব্য:</strong> {remark}
                      </div>
                    )}

                    <div className="pt-8 flex justify-between text-xs text-slate-600">
                      <div className="text-center">
                        <div className="w-32 border-b border-slate-400 mb-1" />
                        <p>অভিভাবকের স্বাক্ষর</p>
                      </div>
                      <div className="text-center">
                        <div className="w-36 border-b border-slate-400 mb-1" />
                        <p className="font-bold text-slate-800">বিষয় শিক্ষকের স্বাক্ষর</p>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PRINTABLE TABULATION SHEET MODAL (Full Batch / Class)
      ======================================================== */}
      {printingTabulationExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
            <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
              <span className="font-semibold text-sm">ট্যাবুলেশন শিট প্রিভিউ</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  প্রিন্ট শিট
                </button>
                <button
                  onClick={() => setPrintingTabulationExam(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabulation Content */}
            <div className="p-6 sm:p-8 bg-white printable-card text-slate-800 space-y-4 overflow-y-auto">
              <div className="text-center border-b-2 border-slate-800 pb-3">
                <h2 className="text-xl font-black text-slate-900">{settings.name}</h2>
                <p className="text-xs text-slate-600">
                  {settings.address}, {settings.district}
                </p>
                <div className="mt-1.5 font-bold text-sm text-slate-800">
                  মডেল টেস্ট ফলাফল ও ট্যাবুলেশন শিট
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  পরীক্ষা: <strong>{printingTabulationExam.title}</strong> • বিষয়:{' '}
                  <strong>{printingTabulationExam.subject}</strong> • শ্রেণি:{' '}
                  <strong>{printingTabulationExam.classGrade}</strong> • পূর্ণমান:{' '}
                  <strong>{toBn(printingTabulationExam.totalMarks)}</strong>
                </p>
              </div>

              <table className="w-full text-xs text-left border border-slate-300">
                <thead className="bg-slate-100 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-300 text-center w-12">মেধাক্রম</th>
                    <th className="p-2 border-r border-slate-300 text-center w-12">রোল</th>
                    <th className="p-2 border-r border-slate-300">শিক্ষার্থীর নাম</th>
                    <th className="p-2 border-r border-slate-300 text-center w-24">প্রাপ্ত নম্বর</th>
                    <th className="p-2 border-r border-slate-300 text-center w-16">গ্রেড</th>
                    <th className="p-2 border-r border-slate-300 text-center w-16">GPA</th>
                    <th className="p-2 text-center w-20">ফলাফল</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {meritList.map((item, idx) => (
                    <tr key={item.student.id}>
                      <td className="p-2 border-r border-slate-200 text-center font-bold">
                        {toBn(idx + 1)}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-center font-mono font-bold">
                        {toBn(item.student.roll)}
                      </td>
                      <td className="p-2 border-r border-slate-200 font-semibold">
                        {item.student.nameBn}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-center font-mono font-bold">
                        {item.isAbsent ? 'অনুপস্থিত' : toBn(item.marks)}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-center font-bold">
                        {item.grade}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-center font-mono font-bold">
                        {toBn(item.gpa)}
                      </td>
                      <td className="p-2 text-center font-bold text-[11px]">
                        {item.isAbsent ? (
                          <span className="text-slate-500">অনুপস্থিত</span>
                        ) : item.isPassed ? (
                          <span className="text-emerald-800">কৃতকার্য</span>
                        ) : (
                          <span className="text-rose-700">অকৃতকার্য</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-6 flex justify-between text-xs text-slate-600">
                <div className="text-center">
                  <p>মুদ্রণের তারিখ: {formatBengaliDate(new Date().toISOString().slice(0, 10))}</p>
                </div>
                <div className="text-center">
                  <div className="w-36 border-b border-slate-400 mb-1" />
                  <p className="font-bold text-slate-800">সংশ্লিষ্ট শিক্ষকের স্বাক্ষর</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Student Marks Upload Modal */}
      {individualUploadStudent && (
        <IndividualMarksModal
          isOpen={!!individualUploadStudent}
          student={individualUploadStudent}
          defaultExamId={currentExam?.id}
          onClose={() => setIndividualUploadStudent(null)}
        />
      )}
    </div>
  );
};
