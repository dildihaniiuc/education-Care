import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, CreditCard, Check, AlertCircle, Lock, Search, ChevronDown } from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';
import { Student, FeePayment, FeeType, PaymentMethod } from '../../types';
import { toBn, toEn, bengaliMonths, formatTaka } from '../../utils/bengaliUtils';

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
  const { students, batches, addFeePayment, currentTeacher } = useCoaching();

  const autoDetectedTeacher = currentTeacher?.name
    ? `${currentTeacher.name} (শিক্ষক)`
    : 'অজ্ঞাত শিক্ষক';

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [feeType, setFeeType] = useState<FeeType>('মাসিক টিউশন ফি');
  const [month, setMonth] = useState('সেপ্টেম্বর');
  const [year] = useState(2026);
  const [amount, setAmount] = useState(1500);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ক্যাশ (নগদ)');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setSearchQuery('');
    setIsStudentDropdownOpen(false);
    if (preSelectedStudent) {
      setSelectedStudentId(preSelectedStudent.id);
      setAmount(preSelectedStudent.monthlyFee);
    }
  }, [preSelectedStudent, isOpen]);

  useEffect(() => {
    if (!isOpen || preSelectedStudent) return;
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
      setAmount(students[0].monthlyFee);
    }
  }, [isOpen, preSelectedStudent, students, selectedStudentId]);

  useEffect(() => {
    if (!isStudentDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStudentDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isStudentDropdownOpen]);

  const batchMap = useMemo(() => {
    const map = new Map<string, string>();
    batches.forEach((b) => map.set(b.id, b.name));
    return map;
  }, [batches]);

  const filteredStudents = useMemo(() => {
    const raw = searchQuery.trim().toLowerCase();
    if (!raw) return students;
    const normalizedDigits = toEn(raw);

    return students.filter((std) => {
      const nameBn = (std.nameBn || '').toLowerCase();
      const nameEn = (std.nameEn || '').toLowerCase();
      const classGrade = (std.classGrade || '').toLowerCase();
      const rollEn = toEn(String(std.roll || '')).toLowerCase();
      const rollBn = toBn(std.roll || '').toLowerCase();
      const gPhone = toEn(std.guardianPhone || '').toLowerCase();
      const sPhone = toEn(std.studentPhone || '').toLowerCase();
      const batchName = (batchMap.get(std.batchId) || '').toLowerCase();

      return (
        nameBn.includes(raw) ||
        nameEn.includes(raw) ||
        classGrade.includes(raw) ||
        rollEn.includes(normalizedDigits) ||
        rollBn.includes(raw) ||
        gPhone.includes(normalizedDigits) ||
        sPhone.includes(normalizedDigits) ||
        batchName.includes(raw)
      );
    });
  }, [students, searchQuery, batchMap]);

  if (!isOpen) return null;

  const currentStudent = students.find((s) => s.id === selectedStudentId);
  const currentBatch = batches.find((b) => b.id === currentStudent?.batchId);

  const handleStudentSelect = (id: string) => {
    setSelectedStudentId(id);
    const stu = students.find((s) => s.id === id);
    if (stu) {
      setAmount(stu.monthlyFee);
    }
    setIsStudentDropdownOpen(false);
  };

  const netPayable = Math.max(0, amount - discount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeacher) {
      setError('ফি আদায় করতে অনুগ্রহ করে শিক্ষক হিসেবে লগইন করুন।');
      return;
    }
    if (!selectedStudentId) {
      setError('অনুগ্রহ করে শিক্ষার্থী নির্বাচন করুন।');
      return;
    }
    if (amount <= 0) {
      setError('ফি-এর পরিমাণ শূন্য হতে পারবে না।');
      return;
    }

    // Collector identity is strictly enforced on context level from currentTeacher
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
      collectedBy: autoDetectedTeacher,
      collectedByTeacherId: currentTeacher.id,
      collectedByTeacherName: currentTeacher.name,
      timestamp: new Date().toISOString(),
      note,
    });

    if (onPaymentSuccess) {
      onPaymentSuccess(newPayment);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-700 px-6 py-4 text-white flex items-center justify-between shrink-0">
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
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/60 border-b border-rose-200 dark:border-rose-800 px-6 py-2.5 flex items-center gap-2 text-rose-700 dark:text-rose-200 text-xs font-semibold shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Strictly Locked Automatic Teacher Detection Banner */}
          <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/90 dark:border-emerald-800/80 rounded-xl p-3 flex items-center justify-between text-xs shadow-xs">
            <div className="flex items-center gap-2">
              <span className="inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600 shrink-0"></span>
              <div>
                <span className="text-slate-600 dark:text-slate-300">স্বয়ংক্রিয় আদায়কারী:</span>
                <span className="font-bold text-emerald-950 dark:text-emerald-200 ml-1.5">
                  {autoDetectedTeacher}
                </span>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                  আপনার লগইন আইডি হিসেবে স্থায়ীভাবে সংরক্ষিত হবে (সকল শিক্ষক দেখতে পারবেন)
                </p>
              </div>
            </div>
            <span className="bg-emerald-100 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shrink-0 border border-emerald-200 dark:border-emerald-700">
              <Lock className="w-3 h-3" />
              সুরক্ষিত
            </span>
          </div>

          {/* Search & Select Student */}
          <div ref={dropdownRef} className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                শিক্ষার্থী খুঁজুন ও নির্বাচন করুন *
              </label>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                মোট: {toBn(students.length)} জন
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsStudentDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsStudentDropdownOpen(true);
                }}
                placeholder="নাম, রোল, শ্রেণি, ব্যাচ বা মোবাইল নম্বর দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-16 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-teal-600 focus:ring-1 focus:ring-teal-600 font-medium"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setIsStudentDropdownOpen(true);
                    }}
                    title="সার্চ মুছুন"
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsStudentDropdownOpen((prev) => !prev)}
                  title="শিক্ষার্থীর তালিকা দেখুন"
                  className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isStudentDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Searchable Dropdown List */}
            {isStudentDropdownOpen && (
              <div className="mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 z-20">
                {filteredStudents.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                    "{searchQuery}" এর সাথে মিলে এমন কোনো শিক্ষার্থী পাওয়া যায়নি।
                  </div>
                ) : (
                  filteredStudents.map((std) => {
                    const isSelected = std.id === selectedStudentId;
                    const stdBatchName = batchMap.get(std.batchId) || 'ব্যাচ নির্ধারিত নয়';
                    return (
                      <button
                        type="button"
                        key={std.id}
                        onClick={() => handleStudentSelect(std.id)}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-2 transition cursor-pointer ${
                          isSelected
                            ? 'bg-teal-50 dark:bg-teal-950/60'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
                              রোল {toBn(std.roll)}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {std.nameBn}
                            </span>
                            <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">
                              ({std.classGrade})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {stdBatchName} • {std.guardianPhone || 'নম্বর নেই'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400">
                            {formatTaka(std.monthlyFee)}
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Selected Student quick detail badge */}
          {currentStudent && (
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-slate-800 dark:text-slate-100 truncate">
                  রোল {toBn(currentStudent.roll)} - {currentStudent.nameBn} ({currentStudent.classGrade})
                </p>
                <p className="text-slate-500 dark:text-slate-400 truncate">
                  {currentStudent.schoolCollege || 'প্রতিষ্ঠান উল্লেখ নেই'} • ব্যাচ:{' '}
                  {currentBatch?.name || 'নির্ধারিত নয়'}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">মাসিক নির্ধারিত ফি:</span>
                <p className="font-bold text-teal-800 dark:text-teal-400 text-sm">
                  {formatTaka(currentStudent.monthlyFee)}
                </p>
              </div>
            </div>
          )}

          {/* Fee Type & Month */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ফি-এর ধরন
              </label>
              <select
                value={feeType}
                onChange={(e) => setFeeType(e.target.value as FeeType)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-teal-600 focus:ring-1 focus:ring-teal-600"
              >
                {feeTypes.map((ft) => (
                  <option key={ft} value={ft}>
                    {ft}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                মাসের নাম
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-teal-600 focus:ring-1 focus:ring-teal-600"
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ফি-এর পরিমাণ (টাকা) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-teal-600 focus:ring-1 focus:ring-teal-600 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                বিশেষ ছাড় / ডিসকাউন্ট (টাকা)
              </label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-teal-600 focus:ring-1 focus:ring-teal-600 font-medium"
              />
            </div>
          </div>

          {/* Payment Method (No Collector Selection Option!) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              পরিশোধের মাধ্যম
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-teal-600 focus:ring-1 focus:ring-teal-600"
            >
              {paymentMethods.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              মন্তব্য / ট্রানজেকশন আইডি (ঐচ্ছিক)
            </label>
            <input
              type="text"
              placeholder="যেমন: বিকাশ ট্রানজেকশন আইডি বা বিশেষ নোট"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-teal-600 focus:ring-1 focus:ring-teal-600"
            />
          </div>

          {/* Net Amount Highlight */}
          <div className="bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-xl p-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-900 dark:text-teal-200">মোট আদায়যোগ্য টাকা:</span>
            <span className="text-lg font-black text-teal-800 dark:text-teal-300">{formatTaka(netPayable)}</span>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition font-medium cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold rounded-xl shadow-md transition cursor-pointer"
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
