import React, { useState } from 'react';
import { CalendarX2, X } from 'lucide-react';
import { Expense, FeePayment, MonthlyArchive } from '../../types';
import { bengaliMonths, formatTaka, toBn } from '../../utils/bengaliUtils';

interface MonthCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
  feePayments: FeePayment[];
  expenses: Expense[];
  onConfirmArchiveAndClear: (params: {
    month: string;
    year: number;
    scope: 'all' | 'month';
  }) => MonthlyArchive | null;
  onCompleted: (archive: MonthlyArchive) => void;
}

/**
 * Confirmation modal to close a month's financial cycle:
 * snapshots income & expenses into MonthlyArchive so teachers can re-check past months,
 * then clears only active monthly income and expense records.
 */
export const MonthCloseModal: React.FC<MonthCloseModalProps> = ({
  isOpen,
  onClose,
  feePayments,
  expenses,
  onConfirmArchiveAndClear,
  onCompleted,
}) => {
  const now = new Date();
  const prevMonthIndex = (now.getMonth() + 11) % 12;

  const [form, setForm] = useState({
    month: bengaliMonths[prevMonthIndex] || bengaliMonths[0],
    year: prevMonthIndex === 11 ? now.getFullYear() - 1 : now.getFullYear(),
    scope: 'all' as 'all' | 'month',
  });

  if (!isOpen) return null;

  const monthIndex = bengaliMonths.indexOf(form.month);
  const prefix =
    monthIndex >= 0 ? `${form.year}-${String(monthIndex + 1).padStart(2, '0')}` : '';

  const previewPayments =
    form.scope === 'all'
      ? feePayments
      : feePayments.filter((p) => p.month === form.month && p.year === form.year);

  const previewExpenses =
    form.scope === 'all'
      ? expenses
      : expenses.filter((e) => (prefix ? (e.date || '').startsWith(prefix) : true));

  const previewIncome = previewPayments.reduce((a, b) => a + b.paidAmount, 0);
  const previewExpenseTotal = previewExpenses.reduce((a, b) => a + b.amount, 0);
  const hasRecords = previewPayments.length > 0 || previewExpenses.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="bg-amber-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarX2 className="w-5 h-5" />
            <h3 className="font-bold text-base">মাস শেষ হিসাব ডিলিট ও আর্কাইভ</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 leading-relaxed">
            এই অপশনে ক্লিক করলে শুধুমাত্র নির্বাচিত মাসের মোট আয় ও ব্যয় বর্তমান খাতা থেকে ডিলিট/রিসেট হবে এবং স্থায়ীভাবে <strong>&quot;বিগত মাসের হিসাব (রিচেক)&quot;</strong> ট্যাবে জমা থাকবে। শিক্ষার্থী, ব্যাচ, হাজিরা বা পরীক্ষার কোনো তথ্য মুছবে না।
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                আর্কাইভের মাসের নাম
              </label>
              <select
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-amber-600"
              >
                {bengaliMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">সাল</label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-amber-600 font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-semibold text-slate-700">
              কোন হিসাব ডিলিট ও আর্কাইভ করবেন?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, scope: 'all' })}
                className={`p-2.5 rounded-xl border font-bold text-left transition cursor-pointer ${
                  form.scope === 'all'
                    ? 'bg-[#0F3382] text-white border-[#0F3382]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                সকল চলমান আয় ও ব্যয়
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, scope: 'month' })}
                className={`p-2.5 rounded-xl border font-bold text-left transition cursor-pointer ${
                  form.scope === 'month'
                    ? 'bg-[#0F3382] text-white border-[#0F3382]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                শুধু {form.month} মাসের হিসাব
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-slate-500 block">মোট আয়</span>
              <strong className="text-sm text-emerald-700 font-mono">
                {formatTaka(previewIncome)}
              </strong>
              <span className="text-[10px] text-slate-400 block">
                {toBn(previewPayments.length)} রসিদ
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">মোট ব্যয়</span>
              <strong className="text-sm text-rose-700 font-mono">
                {formatTaka(previewExpenseTotal)}
              </strong>
              <span className="text-[10px] text-slate-400 block">
                {toBn(previewExpenses.length)} এন্ট্রি
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">নেট ব্যালেন্স</span>
              <strong className="text-sm text-slate-900 font-mono">
                {formatTaka(previewIncome - previewExpenseTotal)}
              </strong>
            </div>
          </div>

          {!hasRecords && (
            <p className="text-rose-600 font-semibold text-center">
              নির্বাচিত পরিসরে ডিলিট করার মতো কোনো আয় বা ব্যয় নেই।
            </p>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="button"
              disabled={!hasRecords}
              onClick={() => {
                const archived = onConfirmArchiveAndClear(form);
                onClose();
                if (archived) {
                  onCompleted(archived);
                }
              }}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              হিসাব ডিলিট ও আর্কাইভ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
