import React, { useMemo, useRef, useState } from 'react';
import {
  BookMarked,
  Camera,
  ImagePlus,
  Search,
  Filter,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Printer,
  Edit3,
  Trash2,
  X,
  Eye,
  Calendar,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileText,
  Plus,
} from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';
import { ClassGrade, QuestionPaper } from '../../types';
import { ALL_CLASS_GRADES, SHORTCUT_SUBJECTS } from '../../constants/academicData';
import { formatBengaliDate, toBn, toEn } from '../../utils/bengaliUtils';
import {
  compressQuestionPaperImage,
  MAX_QUESTION_PAGES,
} from '../../utils/imageCompression';

const EXAM_TYPE_PRESETS = [
  'বার্ষিক পরীক্ষা',
  'অর্ধ-বার্ষিক পরীক্ষা',
  'মডেল টেস্ট',
  'প্রি-টেস্ট',
  'টেস্ট পরীক্ষা',
  'মাসিক পরীক্ষা',
  'সাপ্তাহিক / অধ্যায় পরীক্ষা',
];

const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_YEAR_OPTIONS = Array.from({ length: 8 }, (_, idx) => CURRENT_YEAR + 1 - idx);

export const QuestionBankManagement: React.FC = () => {
  const {
    questionBank,
    addQuestionPaper,
    updateQuestionPaper,
    deleteQuestionPaper,
    currentTeacher,
    settings,
  } = useCoaching();

  // Filter & search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('সকল');
  const [filterYear, setFilterYear] = useState<string>('সকল');
  const [filterSubject, setFilterSubject] = useState<string>('সকল');

  // Upload / Edit Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState<QuestionPaper | null>(null);
  const [classGrade, setClassGrade] = useState<ClassGrade>('১০ম');
  const [year, setYear] = useState<number>(CURRENT_YEAR);
  const [subject, setSubject] = useState<string>('গনিত');
  const [examType, setExamType] = useState<string>('বার্ষিক পরীক্ষা');
  const [title, setTitle] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Viewer Lightbox states
  const [viewingPaper, setViewingPaper] = useState<QuestionPaper | null>(null);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Delete confirmation modal state
  const [deletingPaper, setDeletingPaper] = useState<QuestionPaper | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Derived filter metadata lists
  const availableYears = useMemo(() => {
    const years = new Set<number>(questionBank.map((q) => q.year));
    return Array.from(years).sort((a, b) => b - a);
  }, [questionBank]);

  const availableSubjects = useMemo(() => {
    const subjects = new Set<string>(questionBank.map((q) => q.subject).filter(Boolean));
    return Array.from(subjects).sort((a, b) => a.localeCompare(b, 'bn'));
  }, [questionBank]);

  const availableClasses = useMemo(() => {
    const classes = new Set<string>(questionBank.map((q) => q.classGrade));
    return ALL_CLASS_GRADES.filter((c) => classes.has(c));
  }, [questionBank]);

  const allSubjectSuggestions = useMemo(() => {
    const merged = new Set<string>([...SHORTCUT_SUBJECTS, ...availableSubjects]);
    return Array.from(merged);
  }, [availableSubjects]);

  // Filtered question papers
  const filteredPapers = useMemo(() => {
    const rawQuery = searchQuery.trim().toLowerCase();
    const enQuery = toEn(rawQuery);
    const bnQuery = toBn(rawQuery);

    return questionBank.filter((q) => {
      if (filterClass !== 'সকল' && q.classGrade !== filterClass) return false;
      if (filterYear !== 'সকল' && String(q.year) !== filterYear) return false;
      if (filterSubject !== 'সকল' && q.subject !== filterSubject) return false;

      if (!rawQuery) return true;

      const yearStrEn = String(q.year);
      const yearStrBn = toBn(q.year);
      const haystack = [
        q.title,
        q.subject,
        q.classGrade,
        q.examType || '',
        q.note || '',
        q.uploadedByTeacherName,
        yearStrEn,
        yearStrBn,
      ]
        .join(' ')
        .toLowerCase();

      return (
        haystack.includes(rawQuery) ||
        (enQuery && haystack.includes(enQuery)) ||
        (bnQuery && haystack.includes(bnQuery))
      );
    });
  }, [questionBank, filterClass, filterYear, filterSubject, searchQuery]);

  const hasActiveFilters =
    filterClass !== 'সকল' ||
    filterYear !== 'সকল' ||
    filterSubject !== 'সকল' ||
    searchQuery.trim() !== '';

  const resetFilters = () => {
    setFilterClass('সকল');
    setFilterYear('সকল');
    setFilterSubject('সকল');
    setSearchQuery('');
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? '' : prev));
    }, 3500);
  };

  const openAddModal = () => {
    setEditingPaper(null);
    setClassGrade(filterClass !== 'সকল' ? (filterClass as ClassGrade) : '১০ম');
    setYear(filterYear !== 'সকল' ? Number(filterYear) : CURRENT_YEAR);
    setSubject(filterSubject !== 'সকল' ? filterSubject : 'গনিত');
    setExamType('বার্ষিক পরীক্ষা');
    setTitle('');
    setNote('');
    setImageUrls([]);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (paper: QuestionPaper) => {
    setEditingPaper(paper);
    setClassGrade(paper.classGrade);
    setYear(paper.year);
    setSubject(paper.subject);
    setExamType(paper.examType || 'বার্ষিক পরীক্ষা');
    setTitle(paper.title);
    setNote(paper.note || '');
    setImageUrls(paper.imageUrls || []);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleImageSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList) as File[];
    const remainingSlots = MAX_QUESTION_PAGES - imageUrls.length;
    if (remainingSlots <= 0) {
      setFormError(`একটি প্রশ্নে সর্বোচ্চ ${toBn(MAX_QUESTION_PAGES)}টি পাতা যোগ করা যাবে।`);
      e.target.value = '';
      return;
    }

    const selectedFiles = files.slice(0, remainingSlots);
    setIsProcessingImages(true);
    setFormError('');

    try {
      const compressedList: string[] = [];
      for (const file of selectedFiles) {
        const compressed = await compressQuestionPaperImage(file);
        compressedList.push(compressed);
      }
      setImageUrls((prev) => [...prev, ...compressedList]);

      if (files.length > remainingSlots) {
        setFormError(
          `সর্বোচ্চ ${toBn(MAX_QUESTION_PAGES)}টি ছবি রাখা যায়, তাই প্রথম ${toBn(remainingSlots)}টি ছবি যুক্ত হয়েছে।`
        );
      }
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'ছবি প্রসেস করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
      );
    } finally {
      setIsProcessingImages(false);
      e.target.value = '';
    }
  };

  const removeImageAt = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (imageUrls.length === 0) {
      setFormError('অনুগ্রহ করে ক্যামেরা বা গ্যালারি থেকে অন্তত ১টি প্রশ্নের ছবি আপলোড করুন।');
      return;
    }

    const cleanSubject = subject.trim();
    if (!cleanSubject) {
      setFormError('অনুগ্রহ করে বিষয়ের নাম লিখুন বা নির্বাচন করুন।');
      return;
    }

    const numericYear = Number(toEn(String(year)));
    if (!Number.isFinite(numericYear) || numericYear < 2000 || numericYear > 2100) {
      setFormError('অনুগ্রহ করে সঠিক সাল লিখুন (যেমন: ২০২৬)।');
      return;
    }

    const finalTitle =
      title.trim() || `${examType || 'পরীক্ষার প্রশ্ন'} - ${cleanSubject} (${toBn(numericYear)})`;

    setIsSaving(true);
    try {
      if (editingPaper) {
        await updateQuestionPaper(editingPaper.id, {
          title: finalTitle,
          examType: examType.trim(),
          classGrade,
          year: numericYear,
          subject: cleanSubject,
          note: note.trim(),
          imageUrls,
        });
        showToast('প্রশ্নপত্রের তথ্য ও ছবি সফলভাবে হালনাগাদ হয়েছে!');
      } else {
        await addQuestionPaper({
          title: finalTitle,
          examType: examType.trim(),
          classGrade,
          year: numericYear,
          subject: cleanSubject,
          note: note.trim(),
          imageUrls,
        });
        showToast('প্রশ্নপত্র ডাটাবেসে সুরক্ষিতভাবে সংরক্ষিত হয়েছে!');
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'ডাটাবেসে সংরক্ষণ করতে সমস্যা হয়েছে। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPaper) return;
    setIsDeleting(true);
    try {
      await deleteQuestionPaper(deletingPaper.id);
      if (viewingPaper?.id === deletingPaper.id) {
        setViewingPaper(null);
      }
      setDeletingPaper(null);
      showToast('প্রশ্নটি প্রশ্ন ব্যাংক থেকে মুছে ফেলা হয়েছে।');
    } catch {
      setDeletingPaper(null);
      showToast('মুছে ফেলতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsDeleting(false);
    }
  };

  const openViewer = (paper: QuestionPaper, pageIdx: number = 0) => {
    setViewingPaper(paper);
    setActivePageIndex(pageIdx);
    setZoomLevel(1);
  };

  const handleDownloadImage = (paper: QuestionPaper, pageIdx: number = 0) => {
    const src = paper.imageUrls?.[pageIdx];
    if (!src) return;
    const link = document.createElement('a');
    link.href = src;
    const pageSuffix = paper.imageUrls.length > 1 ? `_page-${pageIdx + 1}` : '';
    link.download = `${paper.classGrade}_${paper.subject}_${paper.year}${pageSuffix}.jpg`;
    link.click();
  };

  const handlePrintViewer = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0F3382] text-white flex items-center justify-center shrink-0 shadow-xs">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                প্রশ্ন ব্যাংক (Question Bank)
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                ক্লাউড সুরক্ষিত
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              বিগত ও বর্তমান বছরের পরীক্ষার প্রশ্নপত্র ছবি তুলে শ্রেণি, সাল ও বিষয় অনুযায়ী সংরক্ষণ করুন — পরবর্তী বছর পরীক্ষার সময় এক ক্লিকেই দেখতে পারবেন।
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#065F46] hover:bg-[#064E3B] active:scale-[0.99] text-white text-sm font-bold shadow-sm transition cursor-pointer shrink-0"
        >
          <Camera className="w-4 h-4" />
          <span>+ নতুন প্রশ্ন সংরক্ষণ করুন</span>
        </button>
      </div>

      {/* Success Toast */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs no-print">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 no-print">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-[#DCEEFF] dark:bg-blue-950/60 text-[#0F3382] dark:text-blue-300 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">মোট সংরক্ষিত প্রশ্ন</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {toBn(questionBank.length)} টি
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">সংরক্ষিত শিক্ষাবর্ষ</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {availableYears.length > 0 ? `${toBn(availableYears.length)} টি সাল` : '—'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">শ্রেণি ও বিষয়</p>
            <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {toBn(availableClasses.length)} শ্রেণি · {toBn(availableSubjects.length)} বিষয়
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xs no-print">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="বিষয়, সাল, শ্রেণি বা শিরোনাম খুঁজুন..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3382]"
            />
          </div>

          {/* Class Filter */}
          <div className="md:col-span-2">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              aria-label="শ্রেণি অনুযায়ী ফিল্টার"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0F3382] cursor-pointer"
            >
              <option value="সকল">সকল শ্রেণি</option>
              {ALL_CLASS_GRADES.map((grade) => (
                <option key={grade} value={grade}>
                  {grade} শ্রেণি
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="md:col-span-2">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              aria-label="সাল অনুযায়ী ফিল্টার"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0F3382] cursor-pointer"
            >
              <option value="সকল">সকল সাল</option>
              {(availableYears.length > 0 ? availableYears : DEFAULT_YEAR_OPTIONS).map((yr) => (
                <option key={yr} value={String(yr)}>
                  {toBn(yr)} সাল
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div className="md:col-span-3 flex items-center gap-2">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              aria-label="বিষয় অনুযায়ী ফিল্টার"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0F3382] cursor-pointer"
            >
              <option value="সকল">সকল বিষয়</option>
              {allSubjectSuggestions.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                title="ফিল্টার পরিষ্কার করুন"
                className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0 cursor-pointer transition"
              >
                রিসেট
              </button>
            )}
          </div>
        </div>

        {/* Quick Year Tabs for Fast Previous-Year Comparison */}
        {availableYears.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              সাল অনুযায়ী দেখুন:
            </span>
            <button
              type="button"
              onClick={() => setFilterYear('সকল')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterYear === 'সকল'
                  ? 'bg-[#0F3382] text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              সব সাল ({toBn(questionBank.length)})
            </button>
            {availableYears.map((yr) => {
              const count = questionBank.filter((q) => q.year === yr).length;
              const isSelected = filterYear === String(yr);
              return (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setFilterYear(isSelected ? 'সকল' : String(yr))}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-mono tabular-nums transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#065F46] text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {toBn(yr)} ({toBn(count)})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Question Bank Grid / Empty State */}
      {filteredPapers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-8 sm:p-12 text-center space-y-4 no-print">
          <div className="w-16 h-16 rounded-3xl bg-[#DCEEFF] dark:bg-blue-950/60 text-[#0F3382] dark:text-blue-300 flex items-center justify-center mx-auto">
            <BookMarked className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {questionBank.length === 0
                ? 'এখনো কোনো প্রশ্ন সংরক্ষণ করা হয়নি'
                : 'আপনার ফিল্টার অনুযায়ী কোনো প্রশ্ন পাওয়া যায়নি'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {questionBank.length === 0
                ? 'চলতি বা বিগত পরীক্ষার প্রশ্নপত্রের ছবি তুলে শ্রেণি, সাল ও বিষয়সহ সংরক্ষণ করে রাখুন।'
                : 'অনুগ্রহ করে ফিল্টার পরিবর্তন করুন বা নতুন প্রশ্নপত্র যোগ করুন।'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                সব প্রশ্ন দেখুন
              </button>
            )}
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#065F46] hover:bg-[#064E3B] text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>প্রথম প্রশ্ন আপলোড করুন</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 no-print">
          {filteredPapers.map((paper) => {
            const pageCount = paper.imageUrls?.length || 1;
            const thumbSrc = paper.imageUrls?.[0];

            return (
              <div
                key={paper.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#0F3382]/40 transition flex flex-col"
              >
                {/* Question Paper Thumbnail */}
                <div
                  onClick={() => openViewer(paper, 0)}
                  className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden group cursor-pointer"
                >
                  {thumbSrc ? (
                    <img
                      src={thumbSrc}
                      alt={paper.title}
                      className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <FileText className="w-10 h-10" />
                    </div>
                  )}

                  {/* Top Metadata Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-[#065F46] text-white text-xs font-bold font-mono tabular-nums shadow-sm">
                      {toBn(paper.year)}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-[#0F3382] text-white text-xs font-bold shadow-sm">
                      {paper.classGrade} শ্রেণি
                    </span>
                  </div>

                  {pageCount > 1 && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/80 text-white text-[11px] font-bold flex items-center gap-1 backdrop-blur-xs">
                      <Layers className="w-3 h-3" />
                      {toBn(pageCount)} পাতা
                    </span>
                  )}

                  <div className="absolute inset-0 bg-slate-950/35 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="px-3.5 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold flex items-center gap-1.5 shadow-lg">
                      <Eye className="w-4 h-4 text-[#0F3382]" />
                      বড় করে পড়ুন
                    </span>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-[#DCEEFF] dark:bg-blue-950/70 text-[#0F3382] dark:text-blue-300 text-[11px] font-bold">
                        {paper.subject}
                      </span>
                      {paper.examType && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold">
                          {paper.examType}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 leading-snug">
                      {paper.title}
                    </h3>

                    {paper.note && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {paper.note}
                      </p>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="truncate font-medium">
                        সংরক্ষক: {paper.uploadedByTeacherName}
                      </span>
                      <span className="shrink-0 font-mono">
                        {formatBengaliDate(paper.createdAt.slice(0, 10))}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => openViewer(paper, 0)}
                        className="col-span-2 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#EEF2FF] dark:bg-blue-950/50 hover:bg-[#DCEEFF] dark:hover:bg-blue-900/60 text-[#0F3382] dark:text-blue-200 text-xs font-bold transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        দেখুন
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadImage(paper, 0)}
                        title="ডাউনলোড করুন"
                        className="flex items-center justify-center py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(paper)}
                          title="তথ্য পরিবর্তন করুন"
                          className="flex-1 flex items-center justify-center py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-200 hover:text-amber-700 transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingPaper(paper)}
                          title="মুছে ফেলুন"
                          className="flex-1 flex items-center justify-center py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-200 hover:text-rose-600 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto no-print">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0F3382] to-[#065F46] text-white p-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">
                    {editingPaper ? 'প্রশ্নের তথ্য ও ছবি হালনাগাদ' : 'নতুন প্রশ্নপত্র সংরক্ষণ করুন'}
                  </h2>
                  <p className="text-xs text-blue-100">
                    শ্রেণি, সাল ও বিষয়সহ ক্লাউড ডাটাবেসে সুরক্ষিত থাকবে
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isSaving && setIsModalOpen(false)}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Camera & Gallery Photo Capture Area */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <ImagePlus className="w-4 h-4 text-[#065F46] dark:text-emerald-400" />
                    প্রশ্নপত্রের ছবি তুলুন বা আপলোড করুন *
                  </label>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {toBn(imageUrls.length)} / {toBn(MAX_QUESTION_PAGES)} পাতা
                  </span>
                </div>

                {/* Hidden inputs for Camera (environment) and Gallery */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageSelection}
                  className="hidden"
                />
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelection}
                  className="hidden"
                />

                {imageUrls.length < MAX_QUESTION_PAGES && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      disabled={isProcessingImages || isSaving}
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#065F46] hover:bg-[#064E3B] text-white text-xs sm:text-sm font-bold shadow-2xs transition cursor-pointer disabled:opacity-60"
                    >
                      {isProcessingImages ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                      <span>ক্যামেরা দিয়ে ছবি তুলুন</span>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessingImages || isSaving}
                      onClick={() => galleryInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-bold transition cursor-pointer disabled:opacity-60"
                    >
                      <ImagePlus className="w-4 h-4 text-[#0F3382] dark:text-blue-300" />
                      <span>গ্যালারি থেকে ছবি বাছাই</span>
                    </button>
                  </div>
                )}

                {isProcessingImages && (
                  <div className="flex items-center gap-2 text-xs text-[#0F3382] dark:text-blue-300 font-semibold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>ছবি স্পষ্ট ও কম সাইজে প্রসেস করা হচ্ছে...</span>
                  </div>
                )}

                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    {imageUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 aspect-[3/4] group"
                      >
                        <img
                          src={url}
                          alt={`প্রশ্ন পাতা ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-slate-900/75 text-white text-[10px] font-bold">
                          পাতা {toBn(idx + 1)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeImageAt(idx)}
                          title="ছবি সরান"
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-sm hover:bg-rose-700 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Class, Year & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-[#0F3382] dark:text-blue-400" />
                    শ্রেণি *
                  </label>
                  <select
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value as ClassGrade)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#065F46] cursor-pointer"
                  >
                    {ALL_CLASS_GRADES.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade} শ্রেণি
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#065F46] dark:text-emerald-400" />
                    সাল *
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold font-mono focus:outline-none focus:ring-2 focus:ring-[#065F46] cursor-pointer"
                  >
                    {DEFAULT_YEAR_OPTIONS.map((yr) => (
                      <option key={yr} value={yr}>
                        {toBn(yr)} ({yr})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                    বিষয় *
                  </label>
                  <input
                    type="text"
                    list="question-bank-subjects"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    placeholder="যেমন: গনিত, ইংরেজি"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#065F46]"
                  />
                  <datalist id="question-bank-subjects">
                    {allSubjectSuggestions.map((sub) => (
                      <option key={sub} value={sub} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Exam Type Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  পরীক্ষার ধরন
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {EXAM_TYPE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setExamType(preset)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        examType === preset
                          ? 'bg-[#0F3382] text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Optional Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    প্রশ্নের শিরোনাম
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={`${examType} - ${subject} (${toBn(year)})`}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#065F46]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    অধ্যায় বা বিশেষ নোট (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="যেমন: অধ্যায় ১-৪, সৃজনশীল ও বহুনির্বাচনি"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#065F46]"
                  />
                </div>
              </div>

              {/* Teacher Attribution Footer */}
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    সংরক্ষণ করছেন: <strong>{currentTeacher?.name || 'দিল দিহান'}</strong>
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                  ক্লাউডে সুরক্ষিত থাকবে
                </span>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isProcessingImages}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#065F46] hover:bg-[#064E3B] text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>{editingPaper ? 'পরিবর্তন সেভ করুন' : 'প্রশ্ন ব্যাংকে সংরক্ষণ করুন'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen High-Res Zoom Viewer Modal */}
      {viewingPaper && (
        <div className="fixed inset-0 z-[70] bg-slate-950/95 flex flex-col">
          {/* Viewer Top Bar */}
          <div className="p-3 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-white no-print">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#065F46] text-xs font-bold font-mono">
                  {toBn(viewingPaper.year)}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#0F3382] text-xs font-bold">
                  {viewingPaper.classGrade} শ্রেণি
                </span>
                <span className="text-xs font-bold text-blue-200">{viewingPaper.subject}</span>
              </div>
              <h3 className="font-bold text-sm sm:text-base truncate mt-0.5">
                {viewingPaper.title}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {/* Zoom Controls */}
              <div className="flex items-center bg-slate-800 rounded-xl p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.75, Number((z - 0.25).toFixed(2))))}
                  title="জুম কমান"
                  className="p-1.5 rounded-lg hover:bg-slate-700 cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono px-1.5 min-w-[44px] text-center">
                  {toBn(Math.round(zoomLevel * 100))}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(3, Number((z + 0.25).toFixed(2))))}
                  title="জুম বাড়ান"
                  className="p-1.5 rounded-lg hover:bg-slate-700 cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  title="রিসেট জুম"
                  className="p-1.5 rounded-lg hover:bg-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleDownloadImage(viewingPaper, activePageIndex)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">ডাউনলোড</span>
              </button>

              <button
                type="button"
                onClick={handlePrintViewer}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">প্রিন্ট</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingPaper(null)}
                className="p-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white cursor-pointer"
                aria-label="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Header (Only visible during print) */}
          <div className="hidden print:block p-4 text-center border-b border-slate-300 bg-white text-black">
            <h2 className="text-lg font-bold">{settings.name}</h2>
            <p className="text-sm">
              প্রশ্ন ব্যাংক — {viewingPaper.classGrade} শ্রেণি · {viewingPaper.subject} · {toBn(viewingPaper.year)} সাল ({viewingPaper.title})
            </p>
          </div>

          {/* Scrollable Zoom Canvas */}
          <div className="flex-1 overflow-auto p-4 flex items-start justify-center bg-slate-950 print:bg-white print:p-0">
            {viewingPaper.imageUrls?.[activePageIndex] && (
              <img
                src={viewingPaper.imageUrls[activePageIndex]}
                alt={`${viewingPaper.title} - পাতা ${activePageIndex + 1}`}
                style={{ width: `${Math.round(zoomLevel * 100)}%`, maxWidth: zoomLevel === 1 ? '900px' : 'none' }}
                className="rounded-xl shadow-2xl bg-white object-contain transition-all duration-150 print:w-full print:shadow-none"
              />
            )}
          </div>

          {/* Multi-Page Navigation Footer */}
          {viewingPaper.imageUrls && viewingPaper.imageUrls.length > 1 && (
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-3 text-white no-print">
              <button
                type="button"
                disabled={activePageIndex === 0}
                onClick={() => setActivePageIndex((i) => Math.max(0, i - 1))}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> আগের পাতা
              </button>
              <span className="text-xs font-mono font-bold">
                পাতা {toBn(activePageIndex + 1)} / {toBn(viewingPaper.imageUrls.length)}
              </span>
              <button
                type="button"
                disabled={activePageIndex >= viewingPaper.imageUrls.length - 1}
                onClick={() =>
                  setActivePageIndex((i) => Math.min(viewingPaper.imageUrls.length - 1, i + 1))
                }
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                পরের পাতা <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Custom In-App Delete Confirmation Modal */}
      {deletingPaper && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 no-print">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  প্রশ্নটি কি মুছে ফেলতে চান?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  <strong>{deletingPaper.title}</strong> ({deletingPaper.classGrade} শ্রেণি ·{' '}
                  {deletingPaper.subject} · {toBn(deletingPaper.year)}) প্রশ্ন ব্যাংক থেকে স্থায়ীভাবে মুছে যাবে।
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingPaper(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
              >
                না, রাখুন
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>হ্যাঁ, মুছে ফেলুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
