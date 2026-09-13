import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  BookOpen,
  Save,
  Plus,
  Trash2,
  Copy,
  Sun,
  Sunset,
  Check,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';
import { ClassRoutine, ClassGrade, ShiftType, DayRoutine, RoutinePeriod } from '../../types';
import {
  ALL_CLASS_GRADES,
  SHORTCUT_TEACHERS,
  SHORTCUT_SUBJECTS,
  DAYS_OF_WEEK,
  DEFAULT_SHIFT_TIMES,
} from '../../constants/academicData';
import { toBn } from '../../utils/bengaliUtils';

interface RoutineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  routineToEdit?: ClassRoutine | null;
  onSaved?: (routine: ClassRoutine) => void;
}

export const RoutineFormModal: React.FC<RoutineFormModalProps> = ({
  isOpen,
  onClose,
  routineToEdit,
  onSaved,
}) => {
  const { teachers, addRoutine, updateRoutine } = useCoaching();

  const [title, setTitle] = useState('');
  const [classGrade, setClassGrade] = useState<ClassGrade>('১০ম');
  const [shift, setShift] = useState<ShiftType>('সকাল');
  const [academicYear, setAcademicYear] = useState('২০২৬');
  const [notes, setNotes] = useState('');
  const [selectedDayShorts, setSelectedDayShorts] = useState<string[]>([
    'শনি',
    'রবি',
    'সোম',
    'মঙ্গল',
    'বুধ',
    'বৃহস্পতি',
  ]);

  // Master periods config for quick filling:
  const [periodsPerDay, setPeriodsPerDay] = useState<1 | 2 | 3>(3);

  // Day-specific routines state
  const [days, setDays] = useState<DayRoutine[]>([]);
  const [error, setError] = useState('');

  // Active day index for tabbed editing
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Initialize or reset form
  useEffect(() => {
    if (!isOpen) return;

    if (routineToEdit) {
      setTitle(routineToEdit.title);
      setClassGrade(routineToEdit.classGrade);
      setShift(routineToEdit.shift);
      setAcademicYear(routineToEdit.academicYear || '২০২৬');
      setNotes(routineToEdit.notes || '');
      setSelectedDayShorts(routineToEdit.days.map((d) => d.dayShort));
      setDays(routineToEdit.days);
      const maxP = Math.max(1, ...routineToEdit.days.map((d) => d.periods.length)) as 1 | 2 | 3;
      setPeriodsPerDay(maxP >= 1 && maxP <= 3 ? maxP : 3);
      setActiveDayIndex(0);
    } else {
      // New routine default
      const defaultShift: ShiftType = 'সকাল';
      const defaultDays = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি'];
      setTitle(`১০ম শ্রেণি - নিয়মিত ক্লাস রুটিন (${defaultShift})`);
      setClassGrade('১০ম');
      setShift(defaultShift);
      setAcademicYear('২০২৬');
      setNotes('ক্লাসে আইডি কার্ড ও পাঠ্যবই সাথে আনা বাধ্যতামূলক।');
      setSelectedDayShorts(defaultDays);
      setPeriodsPerDay(3);

      // Generate default period setups for default days
      const times = DEFAULT_SHIFT_TIMES[defaultShift];
      const initialDayRoutines: DayRoutine[] = defaultDays.map((short) => {
        const fullDay = DAYS_OF_WEEK.find((d) => d.short === short)?.full || short;
        return {
          day: fullDay,
          dayShort: short,
          periods: [
            {
              periodNo: 1,
              subject: 'গনিত',
              teacherName: 'দিল দিহান',
              timeSlot: times.period1,
              roomNo: '১০১',
            },
            {
              periodNo: 2,
              subject: 'ইংরেজি',
              teacherName: 'আশরাফুল আলম',
              timeSlot: times.period2,
              roomNo: '১০১',
            },
            {
              periodNo: 3,
              subject: 'বিজ্ঞান',
              teacherName: 'আশরাফ উদ্দীন',
              timeSlot: times.period3,
              roomNo: '১০১',
            },
          ],
        };
      });
      setDays(initialDayRoutines);
      setActiveDayIndex(0);
    }
    setError('');
  }, [routineToEdit, isOpen]);

  if (!isOpen) return null;

  // Handle Shift change with auto-title and time slot update option
  const handleShiftChange = (newShift: ShiftType) => {
    setShift(newShift);
    const times = DEFAULT_SHIFT_TIMES[newShift];
    // Update existing periods time slot to match shift presets
    setDays((prevDays) =>
      prevDays.map((d) => ({
        ...d,
        periods: d.periods.map((p, idx) => ({
          ...p,
          timeSlot:
            idx === 0
              ? times.period1
              : idx === 1
              ? times.period2
              : times.period3,
        })),
      }))
    );
    if (!routineToEdit) {
      setTitle(`${classGrade} শ্রেণি - ক্লাস রুটিন (${newShift})`);
    }
  };

  // Handle Class change
  const handleClassChange = (newClass: ClassGrade) => {
    setClassGrade(newClass);
    if (!routineToEdit) {
      setTitle(`${newClass} শ্রেণি - ক্লাস রুটিন (${shift})`);
    }
  };

  // Toggle Day Selection
  const toggleDay = (short: string) => {
    const full = DAYS_OF_WEEK.find((d) => d.short === short)?.full || short;
    if (selectedDayShorts.includes(short)) {
      if (selectedDayShorts.length <= 1) {
        setError('অন্তত একটি দিন নির্বাচন থাকতে হবে।');
        return;
      }
      const updated = selectedDayShorts.filter((s) => s !== short);
      setSelectedDayShorts(updated);
      setDays((prev) => prev.filter((d) => d.dayShort !== short));
      if (activeDayIndex >= updated.length) {
        setActiveDayIndex(Math.max(0, updated.length - 1));
      }
    } else {
      const updated = [...selectedDayShorts, short];
      // Keep DAYS_OF_WEEK order
      const ordered = DAYS_OF_WEEK.filter((d) => updated.includes(d.short)).map(
        (d) => d.short
      );
      setSelectedDayShorts(ordered);

      // Create periods for this new day
      const times = DEFAULT_SHIFT_TIMES[shift];
      const newDayItem: DayRoutine = {
        day: full,
        dayShort: short,
        periods: Array.from({ length: periodsPerDay }).map((_, i) => ({
          periodNo: (i + 1) as 1 | 2 | 3,
          subject: i === 0 ? 'গনিত' : i === 1 ? 'ইংরেজি' : 'বিজ্ঞান',
          teacherName:
            i === 0 ? 'দিল দিহান' : i === 1 ? 'আশরাফুল আলম' : 'আশরাফ উদ্দীন',
          timeSlot:
            i === 0 ? times.period1 : i === 1 ? times.period2 : times.period3,
          roomNo: '১০১',
        })),
      };

      // Insert keeping day order
      const newDays = [...days, newDayItem].sort((a, b) => {
        const idxA = DAYS_OF_WEEK.findIndex((d) => d.short === a.dayShort);
        const idxB = DAYS_OF_WEEK.findIndex((d) => d.short === b.dayShort);
        return idxA - idxB;
      });
      setDays(newDays);
    }
  };

  // Preset day helpers
  const applyPresetDays = (presets: string[]) => {
    setSelectedDayShorts(presets);
    const times = DEFAULT_SHIFT_TIMES[shift];
    const newDays: DayRoutine[] = presets.map((short) => {
      // Keep existing if already defined
      const existing = days.find((d) => d.dayShort === short);
      if (existing) return existing;

      const full = DAYS_OF_WEEK.find((d) => d.short === short)?.full || short;
      return {
        day: full,
        dayShort: short,
        periods: Array.from({ length: periodsPerDay }).map((_, i) => ({
          periodNo: (i + 1) as 1 | 2 | 3,
          subject: i === 0 ? 'গনিত' : i === 1 ? 'ইংরেজি' : 'বিজ্ঞান',
          teacherName:
            i === 0 ? 'দিল দিহান' : i === 1 ? 'আশরাফুল আলম' : 'আশরাফ উদ্দীন',
          timeSlot:
            i === 0 ? times.period1 : i === 1 ? times.period2 : times.period3,
          roomNo: '১০১',
        })),
      };
    });
    setDays(newDays);
    setActiveDayIndex(0);
  };

  // Change Period Count for Current Day (1 to 3)
  const setDayPeriodCount = (dayIndex: number, count: 1 | 2 | 3) => {
    const times = DEFAULT_SHIFT_TIMES[shift];
    setDays((prev) => {
      const next = [...prev];
      const targetDay = next[dayIndex];
      if (!targetDay) return prev;

      let currentPeriods = [...targetDay.periods];
      if (count > currentPeriods.length) {
        // Add periods up to count
        while (currentPeriods.length < count) {
          const nextNo = (currentPeriods.length + 1) as 1 | 2 | 3;
          currentPeriods.push({
            periodNo: nextNo,
            subject: nextNo === 2 ? 'ইংরেজি' : 'বিজ্ঞান',
            teacherName: nextNo === 2 ? 'আশরাফুল আলম' : 'আশরাফ উদ্দীন',
            timeSlot:
              nextNo === 2 ? times.period2 : times.period3,
            roomNo: '১০১',
          });
        }
      } else if (count < currentPeriods.length) {
        currentPeriods = currentPeriods.slice(0, count);
      }

      next[dayIndex] = {
        ...targetDay,
        periods: currentPeriods,
      };
      return next;
    });
  };

  // Apply periods count to all days
  const setAllDaysPeriodCount = (count: 1 | 2 | 3) => {
    setPeriodsPerDay(count);
    const times = DEFAULT_SHIFT_TIMES[shift];
    setDays((prev) =>
      prev.map((d) => {
        let currentPeriods = [...d.periods];
        if (count > currentPeriods.length) {
          while (currentPeriods.length < count) {
            const nextNo = (currentPeriods.length + 1) as 1 | 2 | 3;
            currentPeriods.push({
              periodNo: nextNo,
              subject: nextNo === 2 ? 'ইংরেজি' : 'বিজ্ঞান',
              teacherName: nextNo === 2 ? 'আশরাফুল আলম' : 'আশরাফ উদ্দীন',
              timeSlot: nextNo === 2 ? times.period2 : times.period3,
              roomNo: '১০১',
            });
          }
        } else if (count < currentPeriods.length) {
          currentPeriods = currentPeriods.slice(0, count);
        }
        return { ...d, periods: currentPeriods };
      })
    );
  };

  // Copy current active day schedule to all other selected days
  const copyActiveDayToAll = () => {
    const activeDay = days[activeDayIndex];
    if (!activeDay) return;

    setDays((prev) =>
      prev.map((d) => ({
        ...d,
        periods: activeDay.periods.map((p) => ({ ...p })),
      }))
    );
  };

  // Update a single period inside active day
  const updatePeriod = (
    dayIndex: number,
    periodIndex: number,
    field: keyof RoutinePeriod,
    value: any
  ) => {
    setDays((prev) => {
      const next = [...prev];
      const targetDay = next[dayIndex];
      if (!targetDay) return prev;
      const targetPeriods = [...targetDay.periods];
      targetPeriods[periodIndex] = {
        ...targetPeriods[periodIndex],
        [field]: value,
      };
      next[dayIndex] = {
        ...targetDay,
        periods: targetPeriods,
      };
      return next;
    });
  };

  // Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('অনুগ্রহ করে রুটিনের একটি শিরোনাম প্রদান করুন।');
      return;
    }
    if (days.length === 0) {
      setError('অন্তত একটি দিন সিলেক্ট থাকতে হবে।');
      return;
    }

    // Verify all periods have subject and teacher
    for (const d of days) {
      if (d.periods.length === 0) {
        setError(`${d.day} এর জন্য অন্তত একটি পিরিয়ড নির্ধারণ করুন।`);
        return;
      }
      for (const p of d.periods) {
        if (!p.subject.trim()) {
          setError(`${d.day} এর ${toBn(p.periodNo)} পিরিয়ডের বিষয় নির্ধারণ করুন।`);
          return;
        }
        if (!p.teacherName.trim()) {
          setError(`${d.day} এর ${toBn(p.periodNo)} পিরিয়ডের শিক্ষক নির্বাচন করুন।`);
          return;
        }
      }
    }

    const payload = {
      title,
      classGrade,
      shift,
      academicYear,
      notes,
      days,
    };

    let savedResult: ClassRoutine;
    if (routineToEdit) {
      updateRoutine(routineToEdit.id, payload);
      savedResult = {
        ...routineToEdit,
        ...payload,
        updatedAt: new Date().toISOString(),
      };
    } else {
      savedResult = addRoutine(payload);
    }

    if (onSaved) {
      onSaved(savedResult);
    }
    onClose();
  };

  const currentDay = days[activeDayIndex] || days[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto no-print">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-800 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {routineToEdit ? 'ক্লাস রুটিন পরিবর্তন করুন' : 'নতুন ক্লাস রুটিন তৈরি করুন'}
              </h3>
              <p className="text-xs text-emerald-100">
                এডুকেশন কেয়ার কোচিং সেন্টার • গুলিয়াখালী, সীতাকুণ্ড
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/70 border-b border-rose-200 dark:border-rose-900 px-6 py-2.5 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Step 1: Routine Basic Meta (Shift, Class, Title, Year) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                ১. শিফট ও শ্রেণি নির্বাচন
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                * শিফট ও ক্লাস পরিবর্তন করলে সময় ও বিষয় শর্টকাট সক্রিয় হবে
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Shift Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  শিফট নির্বাচন করুন *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleShiftChange('সকাল')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold transition cursor-pointer ${
                      shift === 'সকাল'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    সকাল শিফট
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShiftChange('বিকাল')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold transition cursor-pointer ${
                      shift === 'বিকাল'
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-indigo-50'
                    }`}
                  >
                    <Sunset className="w-4 h-4" />
                    বিকাল শিফট
                  </button>
                </div>
              </div>

              {/* Academic Year & Title */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    শিক্ষাবর্ষ
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    রুটিনের শিরোনাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-600 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Class Grade 1-click Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                শ্রেণি শর্টকাট (১ম থেকে ১২শ শ্রেণি):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_CLASS_GRADES.map((cg) => {
                  const isSelected = classGrade === cg;
                  return (
                    <button
                      key={cg}
                      type="button"
                      onClick={() => handleClassChange(cg)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cg} শ্রেণি
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 2: Day Selection Shortcuts */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  ২. বারের শর্টকাট নির্বাচন
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  যে যে বারে ক্লাস হবে সেগুলোতে ক্লিক করুন:
                </p>
              </div>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() =>
                    applyPresetDays(['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি'])
                  }
                  className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  ৬ দিন (শনি-বৃহস্পতি)
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetDays(['শনি', 'সোম', 'বুধ'])}
                  className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  শনি-সোম-বুধ
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetDays(['রবি', 'মঙ্গল', 'বৃহস্পতি'])}
                  className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  রবি-মঙ্গল-বৃহস্পতি
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyPresetDays([
                      'শনি',
                      'রবি',
                      'সোম',
                      'মঙ্গল',
                      'বুধ',
                      'বৃহস্পতি',
                      'শুক্র',
                    ])
                  }
                  className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  সকল দিন
                </button>
              </div>
            </div>

            {/* Day Shortcuts Chips */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {DAYS_OF_WEEK.map((d) => {
                const isSelected = selectedDayShorts.includes(d.short);
                return (
                  <button
                    key={d.short}
                    type="button"
                    onClick={() => toggleDay(d.short)}
                    className={`py-2 px-1 text-center rounded-xl font-bold text-xs sm:text-sm border transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                    }`}
                  >
                    <span>{d.short}</span>
                    <span className="text-[10px] opacity-80 hidden sm:inline">
                      {d.full}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Periods & Teacher/Subject per day */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  ৩. বিষয় ও শিক্ষক নির্ধারণ (একদিনে ১ থেকে ৩টি ক্লাস)
                </h4>
                <p className="text-xs text-slate-500">
                  নিচের বারগুলোতে ক্লিক করে প্রতিটি পিরিয়ডের বিষয় ও শিক্ষক সেট করুন:
                </p>
              </div>

              {/* Global period count switcher */}
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 pl-2">
                  একদিনে ক্লাসের সংখ্যা:
                </span>
                {([1, 2, 3] as const).map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setAllDaysPeriodCount(cnt)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      periodsPerDay === cnt
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {toBn(cnt)}টি ক্লাস
                  </button>
                ))}
              </div>
            </div>

            {/* Day Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {days.map((d, index) => {
                const isActive = activeDayIndex === index;
                return (
                  <button
                    key={d.dayShort}
                    type="button"
                    onClick={() => setActiveDayIndex(index)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{d.day}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {toBn(d.periods.length)}টি ক্লাস
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Day Periods Editor */}
            {currentDay && (
              <div className="p-4 sm:p-5 bg-white dark:bg-slate-800/90 rounded-2xl border-2 border-emerald-500/30 shadow-xs space-y-4">
                {/* Active Day Header with Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-slate-900 dark:text-slate-100">
                      {currentDay.day} এর ক্লাস তালিকা
                    </span>
                    <span className="text-xs text-slate-500">
                      (সর্বনিম্ন ১টি, সর্বোচ্চ ৩টি ক্লাস)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Period count for this day */}
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-slate-500">এই দিনের ক্লাস:</span>
                      {([1, 2, 3] as const).map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setDayPeriodCount(activeDayIndex, cnt)}
                          className={`px-2 py-0.5 rounded-md font-bold text-xs cursor-pointer ${
                            currentDay.periods.length === cnt
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {toBn(cnt)}
                        </button>
                      ))}
                    </div>

                    {/* Copy to all button */}
                    <button
                      type="button"
                      onClick={copyActiveDayToAll}
                      className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 transition cursor-pointer"
                      title="এই দিনের বিষয় ও শিক্ষক সকল বারে কপি করুন"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      সকল বারে কপি করুন
                    </button>
                  </div>
                </div>

                {/* List of Periods (1 to 3) */}
                <div className="space-y-4">
                  {currentDay.periods.map((period, pIndex) => (
                    <div
                      key={pIndex}
                      className="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 space-y-3"
                    >
                      {/* Period Meta Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                            {toBn(period.periodNo)}
                          </span>
                          <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                            {period.periodNo === 1
                              ? '১ম পিরিয়ড'
                              : period.periodNo === 2
                              ? '২য় পিরিয়ড'
                              : '৩য় পিরিয়ড'}
                          </span>
                        </div>

                        {/* Quick Time & Room Fields */}
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <input
                              type="text"
                              value={period.timeSlot}
                              onChange={(e) =>
                                updatePeriod(
                                  activeDayIndex,
                                  pIndex,
                                  'timeSlot',
                                  e.target.value
                                )
                              }
                              placeholder="ক্লাসের সময়"
                              className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs w-36 font-mono"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={period.roomNo || ''}
                              onChange={(e) =>
                                updatePeriod(
                                  activeDayIndex,
                                  pIndex,
                                  'roomNo',
                                  e.target.value
                                )
                              }
                              placeholder="কক্ষ নং"
                              className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs w-18"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Subject & Teacher Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Subject Selection */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            বিষয় *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="যেমন: সাধারণ গণিত"
                            value={period.subject}
                            onChange={(e) =>
                              updatePeriod(
                                activeDayIndex,
                                pIndex,
                                'subject',
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-600 font-bold mb-1.5"
                          />

                          {/* Subject Shortcuts */}
                          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                            {SHORTCUT_SUBJECTS.map((sub) => {
                              const isSubSelected = period.subject === sub;
                              return (
                                <button
                                  key={sub}
                                  type="button"
                                  onClick={() =>
                                    updatePeriod(
                                      activeDayIndex,
                                      pIndex,
                                      'subject',
                                      sub
                                    )
                                  }
                                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                                    isSubSelected
                                      ? 'bg-emerald-600 text-white font-bold'
                                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  {sub}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Teacher Selection */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            শিক্ষক নির্বাচন *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="যেমন: দিল দিহান"
                            value={period.teacherName}
                            onChange={(e) =>
                              updatePeriod(
                                activeDayIndex,
                                pIndex,
                                'teacherName',
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-600 font-semibold mb-1.5"
                          />

                          {/* 5 Official Teachers Shortcuts */}
                          <div className="flex flex-wrap gap-1">
                            {SHORTCUT_TEACHERS.map((tch) => {
                              const isTchSelected = period.teacherName === tch.name;
                              return (
                                <button
                                  key={tch.name}
                                  type="button"
                                  onClick={() =>
                                    updatePeriod(
                                      activeDayIndex,
                                      pIndex,
                                      'teacherName',
                                      tch.name
                                    )
                                  }
                                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer flex items-center gap-1 ${
                                    isTchSelected
                                      ? 'bg-blue-600 text-white font-bold'
                                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-blue-50'
                                  }`}
                                >
                                  <User className="w-2.5 h-2.5" />
                                  {tch.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 4: Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              রুটিন সংক্রান্ত বিশেষ নির্দেশনা বা নিয়মাবলী (প্রিন্ট কপিতে প্রদর্শিত হবে)
            </label>
            <input
              type="text"
              placeholder="যেমন: আইডি কার্ড সাথে আনা বাধ্যতামূলক। ক্লাস শুরুর ১০ মিনিট পূর্বে উপস্থিত হতে হবে।"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-600"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {routineToEdit ? 'রুটিন পরিবর্তন সংরক্ষণ করুন' : 'রুটিন সম্পন্ন করুন ও সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
