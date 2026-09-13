import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Printer,
  Edit2,
  Trash2,
  Copy,
  Clock,
  BookOpen,
  User,
  Sun,
  Sunset,
  Search,
  Filter,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';
import { ClassRoutine, ClassGrade, ShiftType } from '../../types';
import { ALL_CLASS_GRADES } from '../../constants/academicData';
import { toBn } from '../../utils/bengaliUtils';
import { RoutineFormModal } from './RoutineFormModal';
import { RoutinePrintView } from './RoutinePrintView';

export const RoutineManagement: React.FC = () => {
  const { routines, deleteRoutine, addRoutine } = useCoaching();

  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<ClassRoutine | null>(null);
  const [printingRoutine, setPrintingRoutine] = useState<ClassRoutine | null>(null);

  // Filtered routines
  const filteredRoutines = routines.filter((r) => {
    if (selectedShift !== 'all' && r.shift !== selectedShift) return false;
    if (selectedGrade !== 'all' && r.classGrade !== selectedGrade) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchClass = r.classGrade.toLowerCase().includes(q);
      const matchShift = r.shift.toLowerCase().includes(q);
      return matchTitle || matchClass || matchShift;
    }
    return true;
  });

  const handleEdit = (routine: ClassRoutine) => {
    setEditingRoutine(routine);
    setIsFormOpen(true);
  };

  const handleCreateNew = () => {
    setEditingRoutine(null);
    setIsFormOpen(true);
  };

  const handleDuplicate = (routine: ClassRoutine) => {
    const duplicatedTitle = `${routine.title} (অনুলিপি)`;
    addRoutine({
      title: duplicatedTitle,
      classGrade: routine.classGrade,
      shift: routine.shift,
      academicYear: routine.academicYear,
      notes: routine.notes,
      days: routine.days.map((d) => ({
        ...d,
        periods: d.periods.map((p) => ({ ...p })),
      })),
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`আপনি কি "${title}" রুটিনটি মুছে ফেলতে চান?`)) {
      deleteRoutine(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                ক্লাস রুটিন তৈরি ও ব্যবস্থাপনা
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                সকাল ও বিকাল শিফট, ১-৩টি দৈনিক পিরিয়ড, শিক্ষক ও বিষয় শর্টকাট এবং সরাসরি PDF প্রিন্ট
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            নতুন রুটিন তৈরি করুন
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="রুটিনের নাম বা শ্রেণি খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-emerald-600"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Shift Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <span className="text-slate-500 px-2 font-medium">শিফট:</span>
            <button
              onClick={() => setSelectedShift('all')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                selectedShift === 'all'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              সকল
            </button>
            <button
              onClick={() => setSelectedShift('সকাল')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                selectedShift === 'সকাল'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Sun className="w-3 h-3" />
              সকাল
            </button>
            <button
              onClick={() => setSelectedShift('বিকাল')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                selectedShift === 'বিকাল'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Sunset className="w-3 h-3" />
              বিকাল
            </button>
          </div>

          {/* Grade Filter */}
          <div className="flex items-center gap-1 text-xs">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold cursor-pointer"
            >
              <option value="all">সকল শ্রেণি ({toBn(ALL_CLASS_GRADES.length)})</option>
              {ALL_CLASS_GRADES.map((cg) => (
                <option key={cg} value={cg}>
                  {cg} শ্রেণি
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Routine Cards Grid */}
      {filteredRoutines.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 mx-auto mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            কোনো ক্লাস রুটিন পাওয়া যায়নি
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            সকাল বা বিকাল শিফট সিলেক্ট করে শ্রেণি অনুযায়ী নতুন রুটিন তৈরি করুন।
          </p>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            নতুন রুটিন তৈরি করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRoutines.map((routine) => {
            const isMorning = routine.shift === 'সকাল';
            const totalDays = routine.days.length;
            const maxPeriods = Math.max(1, ...routine.days.map((d) => d.periods.length));

            return (
              <div
                key={routine.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Card Header Top */}
                  <div
                    className={`p-4 border-b ${
                      isMorning
                        ? 'bg-gradient-to-r from-amber-500/10 to-transparent border-amber-200/50 dark:border-amber-900/30'
                        : 'bg-gradient-to-r from-indigo-500/10 to-transparent border-indigo-200/50 dark:border-indigo-900/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      {/* Shift Badge */}
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          isMorning
                            ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                        }`}
                      >
                        {isMorning ? <Sun className="w-3 h-3" /> : <Sunset className="w-3 h-3" />}
                        {routine.shift} শিফট
                      </span>

                      {/* Class Grade Badge */}
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        {routine.classGrade} শ্রেণি
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                      {routine.title}
                    </h3>
                  </div>

                  {/* Card Body - Days and Periods Snippet */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>সপ্তাহে দিন: <strong className="text-slate-800 dark:text-slate-200">{toBn(totalDays)} দিন</strong></span>
                      <span>দৈনিক ক্লাস: <strong className="text-slate-800 dark:text-slate-200">সর্বোচ্চ {toBn(maxPeriods)}টি</strong></span>
                    </div>

                    {/* Day Pill Badges */}
                    <div className="flex flex-wrap gap-1">
                      {routine.days.map((dayItem) => (
                        <span
                          key={dayItem.dayShort}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                        >
                          {dayItem.dayShort} ({toBn(dayItem.periods.length)})
                        </span>
                      ))}
                    </div>

                    {/* Sample first day preview */}
                    {routine.days[0] && (
                      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-500 uppercase">
                          {routine.days[0].day} এর ক্লাস নমুনা:
                        </div>
                        {routine.days[0].periods.slice(0, 3).map((p) => (
                          <div
                            key={p.periodNo}
                            className="flex items-center justify-between text-[11px] border-b border-slate-200/60 dark:border-slate-700/60 last:border-none pb-1 last:pb-0"
                          >
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {toBn(p.periodNo)}. {p.subject}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <User className="w-2.5 h-2.5" />
                              {p.teacherName}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPrintingRoutine(routine)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                    title="রুটিন প্রিন্ট বা PDF ডাউনলোড করুন"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    প্রিন্ট / PDF
                  </button>

                  <button
                    onClick={() => handleEdit(routine)}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    title="রুটিন পরিবর্তন করুন"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDuplicate(routine)}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    title="রুটিনের অনুলিপি তৈরি করুন"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(routine.id, routine.title)}
                    className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl border border-rose-200 dark:border-rose-900/60 transition cursor-pointer"
                    title="রুটিন মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Routine Form Modal */}
      <RoutineFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        routineToEdit={editingRoutine}
        onSaved={(saved) => {
          // Open print view directly if user desires, or view in list
          setPrintingRoutine(saved);
        }}
      />

      {/* Print View Modal */}
      {printingRoutine && (
        <RoutinePrintView
          routine={printingRoutine}
          onClose={() => setPrintingRoutine(null)}
        />
      )}
    </div>
  );
};
