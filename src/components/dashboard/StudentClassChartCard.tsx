import React, { useMemo, useState } from 'react';
import { PieChart as PieChartIcon, BarChart3, Users, UserPlus, ArrowRight } from 'lucide-react';
import { Student } from '../../types';
import { ALL_CLASS_GRADES } from '../../constants/academicData';
import { toBn } from '../../utils/bengaliUtils';

interface StudentClassChartCardProps {
  students: Student[];
  onNavigateStudents: () => void;
  onOpenNewAdmission: () => void;
}

interface ClassStat {
  classGrade: string;
  count: number;
  percentage: number;
  color: string;
}

const CHART_COLORS = [
  '#0F3382', // Deep Royal Blue
  '#059669', // Emerald
  '#EA580C', // Orange
  '#CA8A04', // Deep Amber
  '#0D9488', // Teal
  '#4F46E5', // Indigo
  '#E11D48', // Rose
  '#0284C7', // Sky Blue
  '#7C3AED', // Violet
  '#15803D', // Forest Green
  '#B45309', // Ochre
  '#BE185D', // Magenta
  '#0369A1', // Ocean
  '#475569', // Slate
];

/**
 * ড্যাশবোর্ডে মোট শিক্ষার্থী ও শ্রেণিভিত্তিক শিক্ষার্থী সংখ্যার পাইচিত্র এবং বার গ্রাফ প্রদর্শন করে।
 */
export const StudentClassChartCard: React.FC<StudentClassChartCardProps> = ({
  students,
  onNavigateStudents,
  onOpenNewAdmission,
}) => {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [hoveredGrade, setHoveredGrade] = useState<string | null>(null);

  const { stats, totalStudents, maxClassCount } = useMemo(() => {
    const counts = new Map<string, number>();
    students.forEach((student) => {
      const grade = student.classGrade || 'অন্যান্য';
      counts.set(grade, (counts.get(grade) || 0) + 1);
    });

    const orderedGrades: string[] = [
      ...ALL_CLASS_GRADES.filter((g) => counts.has(g)),
      ...Array.from(counts.keys()).filter(
        (g) => !ALL_CLASS_GRADES.includes(g as typeof ALL_CLASS_GRADES[number])
      ),
    ];

    const total = students.length;
    const computedStats: ClassStat[] = orderedGrades.map((grade, index) => {
      const count = counts.get(grade) || 0;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return {
        classGrade: grade,
        count,
        percentage,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
    });

    const maxCount = computedStats.reduce((max, item) => Math.max(max, item.count), 0);

    return {
      stats: computedStats,
      totalStudents: total,
      maxClassCount: maxCount,
    };
  }, [students]);

  const hoveredItem = hoveredGrade
    ? stats.find((s) => s.classGrade === hoveredGrade) || null
    : null;

  // SVG Donut ring geometry
  const radius = 74;
  const circumference = 2 * Math.PI * radius;
  let runningOffset = 0;

  return (
    <section
      aria-label="শ্রেণিভিত্তিক শিক্ষার্থী পরিসংখ্যান"
      className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs"
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#DCEEFF] dark:bg-blue-950/60 text-[#0F3382] dark:text-blue-300 flex items-center justify-center shrink-0">
            <PieChartIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              শ্রেণিভিত্তিক শিক্ষার্থী পরিসংখ্যান
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              মোট শিক্ষার্থী: <strong className="text-slate-800 dark:text-slate-200 font-mono">{toBn(totalStudents)} জন</strong>
              {stats.length > 0 && (
                <span> · {toBn(stats.length)} টি শ্রেণি</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setChartType('pie')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                chartType === 'pie'
                  ? 'bg-white dark:bg-slate-900 text-[#0F3382] dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span>পাইচিত্র</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-slate-900 text-[#0F3382] dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>গ্রাফ</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onNavigateStudents}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#0F3382] dark:text-blue-400 hover:underline px-2 py-1.5 cursor-pointer"
          >
            <span>তালিকা</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {totalStudents === 0 ? (
        <div className="py-10 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full border-[10px] border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center mb-3">
            <span className="text-lg font-extrabold text-slate-700 dark:text-slate-200 font-mono">
              {toBn(0)} জন
            </span>
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            এখনও কোনো শিক্ষার্থী ভর্তি হয়নি
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            নতুন শিক্ষার্থী ভর্তি করলে এখানে মোট স্টুডেন্ট ও শ্রেণিভিত্তিক পাইচিত্র ও গ্রাফ দেখাবে।
          </p>
          <button
            type="button"
            onClick={onOpenNewAdmission}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F3382] hover:bg-[#0B2666] text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>প্রথম শিক্ষার্থী ভর্তি করুন</span>
          </button>
        </div>
      ) : (
        <div className="pt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Chart Area (Pie Chart OR Bar Graph) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            {chartType === 'pie' ? (
              <div className="relative w-56 h-56 flex items-center justify-center">
                <svg
                  viewBox="0 0 220 220"
                  className="w-full h-full overflow-visible"
                  role="img"
                  aria-label="শ্রেণিভিত্তিক শিক্ষার্থীর পাইচিত্র"
                >
                  {/* Subtle Track */}
                  <circle
                    cx="110"
                    cy="110"
                    r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="28"
                    className="text-slate-100 dark:text-slate-800"
                  />

                  <g transform="rotate(-90 110 110)">
                    {stats.map((item) => {
                      const sliceFraction = item.count / totalStudents;
                      const rawArc = sliceFraction * circumference;
                      const gap = stats.length > 1 ? 2.5 : 0;
                      const dashLength = Math.max(2, rawArc - gap);
                      const dashOffset = -runningOffset;
                      runningOffset += rawArc;

                      const isActive = hoveredGrade === item.classGrade;
                      const isDimmed = hoveredGrade !== null && !isActive;

                      return (
                        <circle
                          key={item.classGrade}
                          cx="110"
                          cy="110"
                          r={radius}
                          fill="transparent"
                          stroke={item.color}
                          strokeWidth={isActive ? 34 : 28}
                          strokeDasharray={`${dashLength} ${circumference}`}
                          strokeDashoffset={dashOffset}
                          onMouseEnter={() => setHoveredGrade(item.classGrade)}
                          onMouseLeave={() => setHoveredGrade(null)}
                          onClick={() =>
                            setHoveredGrade((prev) =>
                              prev === item.classGrade ? null : item.classGrade
                            )
                          }
                          className="transition-all duration-200 cursor-pointer"
                          style={{ opacity: isDimmed ? 0.4 : 1 }}
                        />
                      );
                    })}
                  </g>
                </svg>

                {/* Center Summary Readout */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-6">
                  {hoveredItem ? (
                    <>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {hoveredItem.classGrade} শ্রেণি
                      </span>
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums mt-0.5">
                        {toBn(hoveredItem.count)} জন
                      </span>
                      <span
                        className="text-xs font-bold mt-0.5 font-mono"
                        style={{ color: hoveredItem.color }}
                      >
                        {toBn(hoveredItem.percentage)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Users className="w-3 h-3" /> মোট স্টুডেন্ট
                      </span>
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums mt-0.5">
                        {toBn(totalStudents)} জন
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                        {toBn(stats.length)} টি শ্রেণি
                      </span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* Bar Graph View */
              <div className="w-full h-56 flex items-end justify-center gap-2 sm:gap-3 px-2 pt-6 pb-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                {stats.map((item) => {
                  const heightPercent =
                    maxClassCount > 0
                      ? Math.max(12, Math.round((item.count / maxClassCount) * 100))
                      : 0;
                  const isActive = hoveredGrade === item.classGrade;

                  return (
                    <div
                      key={item.classGrade}
                      onMouseEnter={() => setHoveredGrade(item.classGrade)}
                      onMouseLeave={() => setHoveredGrade(null)}
                      className="flex flex-col items-center justify-end h-full min-w-[36px] flex-1 max-w-[54px] cursor-pointer group"
                    >
                      <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100 font-mono tabular-nums mb-1">
                        {toBn(item.count)}
                      </span>
                      <div className="w-full flex-1 flex items-end justify-center">
                        <div
                          className={`w-full max-w-[32px] rounded-t-lg transition-all duration-300 ${
                            isActive ? 'brightness-110 scale-y-[1.03]' : ''
                          }`}
                          style={{
                            height: `${heightPercent}%`,
                            backgroundColor: item.color,
                          }}
                          title={`${item.classGrade} শ্রেণি: ${toBn(item.count)} জন (${toBn(item.percentage)}%)`}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mt-1.5 truncate max-w-full">
                        {item.classGrade}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Class-wise Breakdown List */}
          <div className="lg:col-span-7 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 pb-1">
              <span>শ্রেণি অনুযায়ী বিস্তারিত</span>
              <span>সংখ্যা ও শতকরা হার</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {stats.map((item) => {
                const isActive = hoveredGrade === item.classGrade;
                return (
                  <div
                    key={item.classGrade}
                    onMouseEnter={() => setHoveredGrade(item.classGrade)}
                    onMouseLeave={() => setHoveredGrade(null)}
                    onClick={onNavigateStudents}
                    className={`p-3 rounded-2xl border transition cursor-pointer ${
                      isActive
                        ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-300 dark:border-slate-600 shadow-xs'
                        : 'bg-[#F4F6FA] dark:bg-slate-800/40 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-3 h-3 rounded-sm shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
                          {item.classGrade} শ্রেণি
                        </span>
                      </div>
                      <div className="font-mono tabular-nums shrink-0">
                        <strong className="text-slate-900 dark:text-white">
                          {toBn(item.count)} জন
                        </strong>
                        <span className="text-slate-500 dark:text-slate-400 ml-1 text-[11px]">
                          ({toBn(item.percentage)}%)
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 w-full h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(4, item.percentage)}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
