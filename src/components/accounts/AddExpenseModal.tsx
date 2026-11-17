import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Expense, ExpenseCategory, PaymentMethod } from '../../types';

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'শিক্ষক সম্মানী',
  'রুম ভাড়া',
  'বিদ্যুৎ ও ইউটিলিটি',
  'শিট ও খাতা প্রিন্টিং',
  'আপ্যায়ন ও স্টেশনারি',
  'বিজ্ঞাপন ও প্রচার',
  'অন্যান্য',
];

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string;
  teacherName: string;
  onSubmitExpense: (expense: Omit<Expense, 'id'>) => void;
}

/**
 * Modal form for recording a coaching center expense entry.
 * Automatically attributes the expense to the currently logged-in teacher.
 */
export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  teacherId,
  teacherName,
  onSubmitExpense,
}) => {
  const [form, setForm] = useState({
    title: '',
    category: 'শিক্ষক সম্মানী' as ExpenseCategory,
    amount: 1000,
    date: new Date().toISOString().slice(0, 10),
    recipient: '',
    paymentMethod: 'ক্যাশ (নগদ)' as PaymentMethod,
    note: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    onSubmitExpense({
      ...form,
      recordedByTeacherId: teacherId,
      recordedByTeacherName: teacherName,
      createdAt: new Date().toISOString(),
    });

    setForm({
      title: '',
      category: 'শিক্ষক সম্মানী',
      amount: 1000,
      date: new Date().toISOString().slice(0, 10),
      recipient: '',
      paymentMethod: 'ক্যাশ (নগদ)',
      note: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="bg-rose-700 px-6 py-4 text-white flex items-center justify-between">
          <h3 className="font-bold text-lg">কোচিং সেন্টারের খরচ এন্ট্রি</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-rose-50 border border-rose-200/90 rounded-xl p-3 flex items-center justify-between text-xs shadow-xs">
            <div>
              <span className="text-slate-600">খরচ নথিভুক্তকারী শিক্ষক:</span>
              <span className="font-bold text-rose-950 ml-1.5">{teacherName}</span>
            </div>
            <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
              স্বয়ংক্রিয়
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              খরচের বিবরণ / শিরোনাম *
            </label>
            <input
              type="text"
              required
              placeholder="যেমন: মাসিক ভবন ভাড়া বা ফটোকপি খরচ"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-rose-600 focus:ring-1 focus:ring-rose-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                খরচের খাত
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as ExpenseCategory })
                }
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-rose-600 focus:ring-1 focus:ring-rose-600"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                টাকার পরিমাণ *
              </label>
              <input
                type="number"
                min="1"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-rose-600 focus:ring-1 focus:ring-rose-600 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                টাকা প্রাপকের নাম / দোকান
              </label>
              <input
                type="text"
                placeholder="যেমন: সীতাকুণ্ড প্রেস"
                value={form.recipient}
                onChange={(e) => setForm({ ...form, recipient: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-rose-600 focus:ring-1 focus:ring-rose-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                তারিখ
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-rose-600 focus:ring-1 focus:ring-rose-600"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-md cursor-pointer"
            >
              খরচ সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
