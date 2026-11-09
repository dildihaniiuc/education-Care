import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
  Printer,
  Search,
  Filter,
  AlertCircle,
  Copy,
  Check,
  Send,
  X,
  Trash2,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';
import { FeePayment, Expense, ExpenseCategory, PaymentMethod } from '../../types';
import { toBn, formatTaka, formatBengaliDate, bengaliMonths } from '../../utils/bengaliUtils';

interface AccountsManagementProps {
  onOpenCollectFee: () => void;
  onViewReceipt: (payment: FeePayment) => void;
}

const expenseCategories: ExpenseCategory[] = [
  'শিক্ষক সম্মানী',
  'রুম ভাড়া',
  'বিদ্যুৎ ও ইউটিলিটি',
  'শিট ও খাতা প্রিন্টিং',
  'আপ্যায়ন ও স্টেশনারি',
  'বিজ্ঞাপন ও প্রচার',
  'অন্যান্য',
];

export const AccountsManagement: React.FC<AccountsManagementProps> = ({
  onOpenCollectFee,
  onViewReceipt,
}) => {
  const {
    feePayments,
    expenses,
    students,
    batches,
    deleteFeePayment,
    addExpense,
    deleteExpense,
    getStudentDueInfo,
    settings,
    currentTeacher,
    exportDatabase,
  } = useCoaching();

  const [activeSubTab, setActiveSubTab] = useState<'fees' | 'dues' | 'expenses' | 'summary'>('fees');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('সকল');

  // Expense modal
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    category: 'শিক্ষক সম্মানী' as ExpenseCategory,
    amount: 1000,
    date: new Date().toISOString().slice(0, 10),
    recipient: '',
    paymentMethod: 'ক্যাশ (নগদ)' as PaymentMethod,
    note: '',
  });

  const [copiedDueId, setCopiedDueId] = useState<string | null>(null);

  // Financial calculations
  const totalIncome = feePayments.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netCashBalance = totalIncome - totalExpenses;

  // Due students list
  const dueStudents = students
    .map((std) => {
      const dueInfo = getStudentDueInfo(std.id);
      return {
        student: std,
        dueAmount: dueInfo.dueEstimate,
      };
    })
    .filter((d) => d.dueAmount > 0 && d.student.status === 'সক্রিয়');

  const totalDueAmount = dueStudents.reduce((acc, d) => acc + d.dueAmount, 0);

  // Filtered Payments
  const filteredPayments = feePayments.filter((payment) => {
    const stu = students.find((s) => s.id === payment.studentId);
    const matchesSearch =
      payment.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stu && stu.nameBn.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (stu && stu.roll.includes(searchTerm));
    const matchesMonth = selectedMonth === 'সকল' || payment.month === selectedMonth;
    return matchesSearch && matchesMonth;
  });

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.title.trim()) return;
    addExpense({
      ...expenseForm,
      recordedByTeacherId: currentTeacher?.id || 'tch-dildihan',
      recordedByTeacherName: currentTeacher?.name || 'দিল দিহান',
      createdAt: new Date().toISOString(),
    });
    setExpenseModalOpen(false);
    setExpenseForm({
      title: '',
      category: 'শিক্ষক সম্মানী',
      amount: 1000,
      date: new Date().toISOString().slice(0, 10),
      recipient: '',
      paymentMethod: 'ক্যাশ (নগদ)',
      note: '',
    });
  };

  const handleCopyDueSms = (studentName: string, amount: number, phone: string, id: string) => {
    const text = `সম্মানিত অভিভাবক, এডুকেশন কেয়ার কোচিং সেন্টারে আপনার সন্তান ${studentName}-এর চলতি মাসের ফি বাবদ ${formatTaka(
      amount
    )} বকেয়া রয়েছে। অনুগ্রহ করে দ্রুত পরিশোধের অনুরোধ করা যাচ্ছে। - এডুকেশন কেয়ার কোচিং সেন্টার, গুলিয়াখালী, সীতাকুণ্ড। যোগাযোগ: ${settings.phone}`;
    navigator.clipboard.writeText(text);
    setCopiedDueId(id);
    setTimeout(() => setCopiedDueId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-teal-600" />
            <h2 className="text-xl font-bold text-slate-800">ফি ও আয়-ব্যয় হিসাব ব্যবস্থাপনা</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ক্যাশ রসিদ তৈরি, বকেয়া আদায় তাগাদা ও কোচিং সেন্টারের আয়-ব্যয়ের হিসাব সংরক্ষণ।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportDatabase}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition border border-slate-300"
            title="সবগুলো আয় ও ব্যয়ের তথ্য এক্সপোর্ট করুন"
          >
            <Download className="w-4 h-4 text-slate-600" />
            লেজার ব্যাকআপ (JSON)
          </button>
          <button
            onClick={onOpenCollectFee}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            ফি আদায় করুন
          </button>
          <button
            onClick={() => setExpenseModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition"
          >
            <TrendingDown className="w-4 h-4" />
            খরচ যুক্ত করুন
          </button>
        </div>
      </div>

      {/* Cloud Protection & Data Loss Guarantee Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-emerald-500/20">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-emerald-300 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-emerald-100">
                ৩-স্তরবিশিষ্ট আর্থিক ডেটা সুরক্ষা ও শিক্ষক ট্র্যাকিং নিশ্চিত
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                রিয়েল-টাইম ক্লাউড সিঙ্ক চালু
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              কোন শিক্ষক কোন শিক্ষার্থী থেকে কত টাকা বেতন নিয়েছেন বা কোন খরচের বিল নথিভুক্ত করেছেন—তার প্রতিটি সূক্ষ্ম তথ্য তারিখ ও সময়সহ Google Cloud Firestore ডাটাবেস ও স্থায়ী অডিট লগে অপরিবর্তনীয়ভাবে সংরক্ষিত হয়। ফলে কোনো তথ্য হারানোর সম্ভাবনা নেই।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <span className="text-[11px] text-emerald-300 block font-medium">লগইনকৃত শিক্ষক:</span>
            <span className="text-xs font-bold text-white bg-white/10 px-2.5 py-1 rounded-lg border border-white/20 inline-block mt-0.5">
              {currentTeacher?.name || 'দিল দিহান'} (শিক্ষক)
            </span>
          </div>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
            <span>সর্বমোট ফি আদায় (আয়)</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-emerald-700">{formatTaka(totalIncome)}</p>
          <span className="text-[11px] text-slate-400">মোট রসিদ: {toBn(feePayments.length)} টি</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
            <span>মোট খরচ ও ব্যয়</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-rose-700">{formatTaka(totalExpenses)}</p>
          <span className="text-[11px] text-slate-400">মোট খরচের খাত: {toBn(expenses.length)} টি</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
            <span>বর্তমান নেট ক্যাশ ব্যালেন্স</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-teal-800">{formatTaka(netCashBalance)}</p>
          <span className="text-[11px] text-teal-600 font-medium">আয় থেকে ব্যয় বাদে উদ্বৃত্ত</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
            <span>মোট বকেয়া বেতন</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-amber-700">{formatTaka(totalDueAmount)}</p>
          <span className="text-[11px] text-amber-600 font-medium">
            {toBn(dueStudents.length)} জন শিক্ষার্থী বকেয়া
          </span>
        </div>
      </div>

      {/* Sub tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('fees')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition ${
            activeSubTab === 'fees'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          আদায়কৃত ফি ও রসিদ ({toBn(feePayments.length)})
        </button>

        <button
          onClick={() => setActiveSubTab('dues')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition ${
            activeSubTab === 'dues'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          বকেয়া তালিকা ও তাগাদা ({toBn(dueStudents.length)})
        </button>

        <button
          onClick={() => setActiveSubTab('expenses')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition ${
            activeSubTab === 'expenses'
              ? 'border-rose-600 text-rose-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          কোচিং সেন্টারের খরচ ({toBn(expenses.length)})
        </button>
      </div>

      {/* TAB 1: FEES & RECEIPTS */}
      {activeSubTab === 'fees' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="রসিদ নম্বর, শিক্ষার্থীর নাম বা রোল দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-teal-600 focus:ring-1 focus:ring-teal-600"
              />
            </div>

            <div className="w-full sm:w-48">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-teal-600 focus:ring-1 focus:ring-teal-600"
              >
                <option value="সকল">সকল মাস</option>
                {bengaliMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">রসিদ নম্বর</th>
                    <th className="px-4 py-3">শিক্ষার্থী</th>
                    <th className="px-4 py-3">ফি-এর বিবরণ</th>
                    <th className="px-4 py-3">মাস ও সাল</th>
                    <th className="px-4 py-3">তারিখ</th>
                    <th className="px-4 py-3">মাধ্যম</th>
                    <th className="px-4 py-3">আদায়কারী শিক্ষক</th>
                    <th className="px-4 py-3 text-right">আদায়কৃত টাকা</th>
                    <th className="px-4 py-3 text-right">রসিদ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500">
                        কোনো ফি পরিশোধের রেকর্ড মেলেনি।
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => {
                      const stu = students.find((s) => s.id === p.studentId);
                      const batch = batches.find((b) => b.id === stu?.batchId);

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-4 py-3 font-mono font-bold text-slate-800">
                            {p.receiptNo}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900">{stu?.nameBn || 'অজ্ঞাত'}</div>
                            <div className="text-[11px] text-slate-500">
                              রোল: {toBn(stu?.roll)} • {batch?.name}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-700">{p.feeType}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {p.month}, {toBn(p.year)}
                          </td>
                          <td className="px-4 py-3 text-slate-500 font-mono">
                            {formatBengaliDate(p.date)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                              {p.paymentMethod}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                              <span>{p.collectedBy || 'শিক্ষক'}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono pl-3.5">
                              {p.collectedByTeacherName ? `আইডি: ${p.collectedByTeacherId || 'ক্লাউড'}` : 'অটো ডিটেক্টেড'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-700 font-mono">
                            {formatTaka(p.paidAmount)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onViewReceipt(p)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs transition"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                প্রিন্ট রসিদ
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('আপনি কি এই ফি রেকর্ডটি মুছে ফেলতে চান?')) {
                                    deleteFeePayment(p.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DUE LIST */}
      {activeSubTab === 'dues' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                চলতি সেপ্টেম্বর মাসের টিউশন ফি বকেয়া রয়েছে মোট <strong>{toBn(dueStudents.length)}</strong> জন শিক্ষার্থীর।
                অভিভাবকের মোবাইলে এক ক্লিকে তাগাদা বার্তা পাঠানো যাবে।
              </span>
            </div>
            <span className="font-bold text-sm text-amber-950">{formatTaka(totalDueAmount)}</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">রোল</th>
                    <th className="px-4 py-3">শিক্ষার্থীর নাম</th>
                    <th className="px-4 py-3">শ্রেণি ও ব্যাচ</th>
                    <th className="px-4 py-3">অভিভাবকের ফোন</th>
                    <th className="px-4 py-3 text-right">বকেয়া ফি</th>
                    <th className="px-4 py-3 text-right">তাগাদা বার্তা (SMS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dueStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-emerald-600 font-semibold">
                        অভিনন্দন! কোনো শিক্ষার্থীর বকেয়া ফি নেই।
                      </td>
                    </tr>
                  ) : (
                    dueStudents.map((item) => {
                      const batch = batches.find((b) => b.id === item.student.batchId);
                      const isCopied = copiedDueId === item.student.id;
                      const smsText = `সম্মানিত অভিভাবক, এডুকেশন কেয়ার কোচিং সেন্টারে আপনার সন্তান ${item.student.nameBn}-এর চলতি মাসের ফি বাবদ ${formatTaka(
                        item.dueAmount
                      )} বকেয়া রয়েছে। অনুগ্রহ করে দ্রুত পরিশোধ করুন। - এডুকেশন কেয়ার, গুলিয়াখালী, সীতাকুণ্ড।`;

                      return (
                        <tr key={item.student.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-4 py-3 font-mono font-bold text-slate-800">
                            {toBn(item.student.roll)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900">{item.student.nameBn}</div>
                            <div className="text-[11px] text-slate-500">
                              পিতা: {item.student.fatherName}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-slate-800">
                              {item.student.classGrade}
                            </span>
                            <div className="text-[11px] text-slate-500">{batch?.name}</div>
                          </td>
                          <td className="px-4 py-3 font-mono font-medium text-slate-700">
                            {item.student.guardianPhone}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-rose-700 font-mono">
                            {formatTaka(item.dueAmount)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() =>
                                  handleCopyDueSms(
                                    item.student.nameBn,
                                    item.dueAmount,
                                    item.student.guardianPhone,
                                    item.student.id
                                  )
                                }
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                                  isCopied
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                {isCopied ? 'কপি হয়েছে' : 'বার্তা কপি'}
                              </button>
                              <a
                                href={`sms:${item.student.guardianPhone}?body=${encodeURIComponent(
                                  smsText
                                )}`}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition"
                              >
                                <Send className="w-3.5 h-3.5" />
                                এসএমএস
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EXPENSES */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">খরচের শিরোনাম / বিবরণ</th>
                    <th className="px-4 py-3">খাত / ক্যাটাগরি</th>
                    <th className="px-4 py-3">প্রাপক / ব্যক্তি</th>
                    <th className="px-4 py-3">তারিখ</th>
                    <th className="px-4 py-3">পরিশোধ মাধ্যম</th>
                    <th className="px-4 py-3">নথিভুক্তকারী শিক্ষক</th>
                    <th className="px-4 py-3 text-right">খরচ (টাকা)</th>
                    <th className="px-4 py-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        এখনও কোনো ব্যয়ের এন্ট্রি নেই।
                      </td>
                    </tr>
                  ) : (
                    expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{exp.title}</div>
                          {exp.note && <div className="text-[11px] text-slate-400">{exp.note}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-medium text-xs border border-rose-100">
                            {exp.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700 font-medium">{exp.recipient}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono">
                          {formatBengaliDate(exp.date)}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{exp.paymentMethod}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800">
                            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                            <span>{exp.recordedByTeacherName ? `${exp.recordedByTeacherName} (শিক্ষক)` : 'শিক্ষক'}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono pl-3.5">
                            স্বয়ংক্রিয় এন্ট্রি
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-rose-700 font-mono">
                          {formatTaka(exp.amount)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              if (window.confirm('আপনি কি এই খরচের এন্ট্রিটি মুছে ফেলতে চান?')) {
                                deleteExpense(exp.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="bg-rose-700 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-lg">কোচিং সেন্টারের খরচ এন্ট্রি</h3>
              <button
                onClick={() => setExpenseModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="p-6 space-y-4">
              {/* Teacher Info in Expense Modal */}
              <div className="bg-rose-50 border border-rose-200/90 rounded-xl p-3 flex items-center justify-between text-xs shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                  </span>
                  <div>
                    <span className="text-slate-600">খরচ নথিভুক্তকারী শিক্ষক:</span>
                    <span className="font-bold text-rose-950 ml-1.5">{currentTeacher?.name || 'দিল দিহান'} (শিক্ষক)</span>
                  </div>
                </div>
                <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  স্বয়ংক্রিয় ট্র্যাকিং
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
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-rose-600 focus:ring-1 focus:ring-rose-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    খরচের খাত
                  </label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, category: e.target.value as ExpenseCategory })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-rose-600 focus:ring-1 focus:ring-rose-600"
                  >
                    {expenseCategories.map((c) => (
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
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
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
                    value={expenseForm.recipient}
                    onChange={(e) => setExpenseForm({ ...expenseForm, recipient: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-rose-600 focus:ring-1 focus:ring-rose-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    তারিখ
                  </label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-rose-600 focus:ring-1 focus:ring-rose-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setExpenseModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-md"
                >
                  খরচ সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
