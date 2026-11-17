import React, { useMemo } from 'react';
import { BarChart3, Users, Banknote, Layers, Trash2 } from 'lucide-react';
import { Batch, FeePayment, Student } from '../../types';
import { formatTaka, toBn } from '../../utils/bengaliUtils';

export interface BatchSummaryItem {
  batch: Batch;
  studentCount: number;
  collectedFees: number;
}

interface BatchSummaryCardProps {
  batches: Batch[];
  students: Student[];
  feePayments: FeePayment[];
  filterClass: string;
  onSelectBatch?: (batch: Batch) => void;
  onDeleteBatch?: (batch: Batch) => void;
}

/**
 * ব্যাচভিত্তিক সারসংক্ষেপ কার্ড:
 * প্রতিটি ব্যাচের মোট শিক্ষার্থী সংখ্যা ও মোট আদায়কৃত ফি এক নজরে দেখায়।
 */
export const BatchSummaryCard: React.FC<BatchSummaryCardProps> = ({
  batches,
  students,
  feePayments,
  filterClass,
  onSelectBatch,
  onDeleteBatch,
}) => {
  const { items, totalStudents, totalCollectedFees } = useMemo(() => {
    const studentCountByBatch = new Map<string, number>();
    const studentBatchMap = new Map<string, string>();

    students.forEach((student) => {
      studentBatchMap.set(student.id, student.batchId);
      studentCountByBatch.set(
        student.batchId,
        (studentCountByBatch.get(student.batchId) || 0) + 1
      );
    });

    const feesByBatch = new Map<string, number>();
    feePayments.forEach((payment) => {
      const batchId = studentBatchMap.get(payment.studentId);
      if (batchId) {
        feesByBatch.set(batchId, (feesByBatch.get(batchId) || 0) + (payment.paidAmount || 0));
      }
    });

    const summaryItems: BatchSummaryItem[] = batches.map((batch) => ({
      batch,
      studentCount: studentCountByBatch.get(batch.id) || 0,
      collectedFees: feesByBatch.get(batch.id) || 0,
    }));

    const studentSum = summaryItems.reduce((acc, item) => acc + item.studentCount, 0);
    const feeSum = summaryItems.reduce((acc, item) => acc + item.collectedFees, 0);

    return {
      items: summaryItems,
      totalStudents: studentSum,
      totalCollectedFees: feeSum,
    };
  }, [batches, students, feePayments]);

  return (
    <section
      aria-label="ব্যাচভিত্তিক সারসংক্ষেপ"
      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4"
    >
      {/* Header & Aggregate Totals */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400 shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              ব্যাচভিত্তিক সারসংক্ষেপ
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {filterClass === 'সকল'
                ? 'সকল ব্যাচের শিক্ষার্থী সংখ্যা ও মোট আদায়কৃত ফির হিসাব'
                : `${filterClass} শ্রেণির ব্যাচসমূহের শিক্ষার্থী ও ফি আদায়ের হিসাব`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>মোট ব্যাচ</span>
            </div>
            <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-0.5 tabular-nums">
              {toBn(items.length)} টি
            </div>
          </div>

          <div className="px-3.5 py-2.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/70 dark:border-teal-800/70">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-teal-700 dark:text-teal-300">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>মোট শিক্ষার্থী</span>
            </div>
            <div className="text-base sm:text-lg font-extrabold text-teal-900 dark:text-teal-100 mt-0.5 tabular-nums">
              {toBn(totalStudents)} জন
            </div>
          </div>

          <div className="px-3.5 py-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/70">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              <Banknote className="w-3.5 h-3.5 shrink-0" />
              <span>মোট আদায়</span>
            </div>
            <div className="text-base sm:text-lg font-extrabold text-emerald-900 dark:text-emerald-100 mt-0.5 font-mono tabular-nums">
              {formatTaka(totalCollectedFees)}
            </div>
          </div>
        </div>
      </div>

      {/* Per-Batch Breakdown */}
      {items.length === 0 ? (
        <div className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">
          {filterClass === 'সকল'
            ? 'কোনো ব্যাচ পাওয়া যায়নি। নতুন ব্যাচ তৈরি করলে এখানে ব্যাচভিত্তিক শিক্ষার্থী ও ফি দেখা যাবে।'
            : `${filterClass} শ্রেণিতে কোনো ব্যাচ পাওয়া যায়নি।`}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <th className="py-2 pr-4">ব্যাচের নাম</th>
                <th className="py-2 px-3">শ্রেণি</th>
                <th className="py-2 px-3 text-right">মোট শিক্ষার্থী</th>
                <th className="py-2 pl-3 text-right">মোট আদায়কৃত ফি</th>
                {onDeleteBatch && <th className="py-2 pl-3 text-right">অ্যাকশন</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {items.map(({ batch, studentCount, collectedFees }) => (
                <tr
                  key={batch.id}
                  onClick={() => onSelectBatch?.(batch)}
                  className={`transition ${
                    onSelectBatch
                      ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer'
                      : ''
                  }`}
                >
                  <td className="py-2.5 pr-4">
                    <div className="font-bold text-slate-800 dark:text-slate-100">
                      {batch.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {batch.subject || 'সকল বিষয়'}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800 font-semibold text-[11px]">
                      {batch.classGrade}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                    {toBn(studentCount)} জন{' '}
                    <span className="text-[11px] font-normal text-slate-400">
                      / {toBn(batch.maxSeats)}
                    </span>
                  </td>
                  <td className="py-2.5 pl-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {formatTaka(collectedFees)}
                  </td>
                  {onDeleteBatch && (
                    <td className="py-2.5 pl-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteBatch(batch);
                        }}
                        title="ব্যাচ মুছে ফেলুন"
                        className="inline-flex items-center justify-center p-1.5 rounded-lg text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
