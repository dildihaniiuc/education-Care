import React, { useState, useEffect } from 'react';
import { X, CreditCard, Check, AlertCircle, Printer } from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';
import { Student, FeePayment, FeeType, PaymentMethod } from '../../types';
import { toBn, bengaliMonths, formatTaka } from '../../utils/bengaliUtils';

interface CollectFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedStudent?: Student | null;
  onPaymentSuccess?: (payment: FeePayment) => void;
}

const feeTypes: FeeType[] = [
  'মাসিক টিউশন ফি',
  'ভর্তি ফি',
  'পরীক্ষার ফি',
  'লেকচার শিট/মডেল টেস্ট',
  'অন্যান্য',
];

const paymentMethods: PaymentMethod[] = [
  'ক্যাশ (নগদ)',
  'বিকাশ',
  'নগদ',
  'রকেট',
  'ব্যাংক',
];

export const CollectFeeModal: React.FC<CollectFeeModalProps> = ({
  isOpen,
  onClose,
  preSelectedStudent,
  onPaymentSuccess,
}) => {
  const { students, batches, addFeePayment } = useCoaching();

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [feeType, setFeeType] = useState<FeeType>('মাসিক টিউশন ফি');
  const [month, setMonth] = useState('সেপ্টেম্বর');
  const [year, setYear] = useState(2026);
  const [amount, setAmount] = useState(1500);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ক্যাশ (নগদ)');
  const [collectedBy, setCollectedBy] = useState('মো: জাহিদুল আলম');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (preSelectedStudent) {
      setSelectedStudentId(preSelectedStudent.id);
      setAmount(preSelectedStudent.monthlyFee);
    } else if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
      setAmount(students[0].monthlyFee);
    }
  }, [preSelectedStudent, isOpen, students]);

  if (!isOpen) return null;

  const currentStudent = students.find((s) => s.id === selectedStudentId);
  const currentBatch = batches.find((b) => b.id === currentStudent?.batchId);

  const handleStudentSelect = (id: string) => {
    setSelectedStudentId(id);
    const stu = students.find((s) => s.id === id);
    if (stu) {
      setAmount(stu.monthlyFee);
    }
  };

  const netPayable = Math.max(0, amount - discount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setError('অনুগ্রহ করে শিক্ষার্থী নির্বাচন করুন।');
      return;
    }
    if (amount <= 0) {
      setError('ফি-এর পরিমাণ শূন্য হতে পারবে না।');
      return;
    }

    const newPayment = addFeePayment({
      studentId: selectedStudentId,
      month,
      year,
      feeType,
      amount,
      discount,
      paidAmount: netPayable,
      dueAmount: 0,
      paymentMethod,
      date: new Date().toISOString().slice(0, 10),
      collectedBy,
      note,
    });

    if (onPaymentSuccess) {
      onPaymentSuccess(newPayment);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-lg">ফি আদায় ও রসিদ তৈরি</h3>
              <p className="text-xs text-teal-100">
                এডুকেশন কেয়ার কোচিং সেন্টার, গুলিয়াখালী, সীতাকুণ্ড
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 flex items-center gap-2 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Select Student */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              শিক্ষার্থী নির্বাচন করুন *
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => handleStudentSelect(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-teal-600 focus:ring-1 focus:ring-teal-600 font-medium"
            >
              {students.map((std) => (
                <option key={std.id} value={std.id}>
                  রোল {toBn(std.roll)} - {std.nameBn} ({std.classGrade})
                </option>
              ))}
            </select>
          </div>

          {/* Student quick detail badge */}
          {currentStudent && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">{currentStudent.nameBn}</p>
                <p className="text-slate-500">
                  {currentStudent.schoolCollege} • ব্যাচ: {currentBatch?.name}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500">মাসিক নির্ধারিত ফি:</span>
                <p className="font-bold text-teal-800 text-sm">
                  {formatTaka(currentStudent.monthlyFee)}
                </p>
              </div>
            </div>
          )}

          {/* Fee Type & Month */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ফি-এর ধরন
              </label>
              <select
                value={feeType}
                onChange={(e) => setFeeType(e.target.value as FeeType)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-teal-600 focus:ring-1 focus:ring-teal-600"
              >
                {feeTypes.map((ft) => (
                  <option key={ft} value={ft}>
                    {ft}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                মাসের নাম
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-teal-600 focus:ring-1 focus:ring-teal-600"
              >
                {bengaliMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount and Discount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ফি-এর পরিমাণ (টাকা) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-teal-600 focus:ring-1 focus:ring-teal-600 font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                বিশেষ ছাড় / ডিসকাউন্ট (টাকা)
              </label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-teal-600 focus:ring-1 focus:ring-teal-600 font-medium"
              />
            </div>
          </div>

          {/* Payment Method & Collector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                পরিশোধের মাধ্যম
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-teal-600 focus:ring-1 focus:ring-teal-600"
              >
                {paymentMethods.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                আদায়কারী
              </label>
              <input
                type="text"
                value={collectedBy}
                onChange={(e) => setCollectedBy(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-teal-600 focus:ring-1 focus:ring-teal-600"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              মন্তব্য / ট্রানজেকশন আইডি (ঐচ্ছিক)
            </label>
            <input
              type="text"
              placeholder="যেমন: বিকাশ ট্রানজেকশন আইডি বা বিশেষ নোট"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-teal-600 focus:ring-1 focus:ring-teal-600"
            />
          </div>

          {/* Net Amount Highlight */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-900">মোট আদায়যোগ্য টাকা:</span>
            <span className="text-lg font-black text-teal-800">{formatTaka(netPayable)}</span>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition font-medium"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold rounded-xl shadow-md transition"
            >
              <Check className="w-4 h-4" />
              টাকা গ্রহণ ও রসিদ তৈরি করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
