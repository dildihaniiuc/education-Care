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
  FileText,
  History,
  CalendarX2,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';
import { FeePayment, MonthlyArchive } from '../../types';
import { toBn, formatTaka, formatBengaliDate, bengaliMonths } from '../../utils/bengaliUtils';
import { AddExpenseModal } from './AddExpenseModal';
import { LedgerReportModal } from './LedgerReportModal';
import { MonthCloseModal } from './MonthCloseModal';
import { MonthlyArchiveModal } from './MonthlyArchiveModal';

interface AccountsManagementProps {
  onOpenCollectFee: () => void;
  onViewReceipt: (payment: FeePayment) => void;
}

export const AccountsManagement: React.FC<AccountsManagementProps> = ({
  onOpenCollectFee,
  onViewReceipt,
}) => {
  const {
    feePayments,
    expenses,
    monthlyArchives,
    students,
    batches,
    deleteFeePayment,
    addExpense,
    deleteExpense,
    closeAndClearMonthAccounts,
    getStudentDueInfo,
    settings,
    currentTeacher,
    exportDatabase,
  } = useCoaching();

  const [activeSubTab, setActiveSubTab] = useState<'fees' | 'dues' | 'expenses' | 'history'>('fees');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('সকল');

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [closeMonthModalOpen, setCloseMonthModalOpen] = useState(false);
  const [closeSuccessMsg, setCloseSuccessMsg] = useState('');
  const [selectedArchive, setSelectedArchive] = useState<MonthlyArchive | null>(null);
  const [copiedDueId, setCopiedDueId] = useState<string | null>(null);
  const [ledgerPdfModalOpen, setLedgerPdfModalOpen] = useState(false);

  const currentBengaliMonthName = bengaliMonths[new Date().getMonth()] || 'সেপ্টেম্বর';

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

  const handleCopyDueSms = (studentName: string, amount: number, _phone: string, id: string) => {
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
            onClick={() => setLedgerPdfModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-semibold transition border border-emerald-200 cursor-pointer"
            title="আয়-ব্যয় ও আদায়কারী শিক্ষকের পূর্ণাঙ্গ PDF রিপোর্ট দেখুন ও ডাউনলোড করুন"
          >
            <FileText className="w-4 h-4 text-emerald-700" />
            আয়-ব্যয় PDF রিপোর্ট
          </button>
          <button
            onClick={exportDatabase}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition border border-slate-300 cursor-pointer"
            title="সবগুলো আয় ও ব্যয়ের তথ্য এক্সপোর্ট করুন"
          >
            <Download className="w-4 h-4 text-slate-600" />
            লেজার ব্যাকআপ (JSON)
          </button>
          <button
            onClick={() => setCloseMonthModalOpen(true)}
            disabled={feePayments.length === 0 && expenses.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs sm:text-sm font-semibold transition border border-amber-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="মাস শেষে গত মাসের আয় ও ব্যয় আর্কাইভ করে বর্তমান হিসাব ডিলিট করুন"
          >
            <CalendarX2 className="w-4 h-4 text-amber-700" />
            মাস শেষ হিসাব ক্লোজ
          </button>
          <button
            onClick={onOpenCollectFee}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            ফি আদায় করুন
          </button>
          <button
            onClick={() => setExpenseModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer"
          >
            <TrendingDown className="w-4 h-4" />
            খরচ যুক্ত করুন
          </button>
        </div>
      </div>

      {closeSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl px-4 py-3 text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{closeSuccessMsg}</span>
          </div>
          <button type="button" onClick={() => setCloseSuccessMsg('')} className="p-1 text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Teacher Tracking Info Bar */}
      <div className="bg-[#0F3382] text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-emerald-300">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">
              আয়-ব্যয় হিসাব ও বিগত মাসের আর্কাইভ সুরক্ষিত
            </h3>
            <p className="text-xs text-blue-100 mt-0.5">
              মাস শেষে হিসাব ডিলিট করলে শুধু চলতি মাসের আয় ও ব্যয় রিসেট হবে। বিগত সকল মাসের আয়-ব্যয় স্থায়ীভাবে সংরক্ষিত থাকবে।
            </p>
          </div>
        </div>

        <div className="text-left md:text-right shrink-0">
          <span className="text-[11px] text-blue-200 block">লগইনকৃত শিক্ষক:</span>
          <span className="text-xs font-bold text-white bg-white/10 px-2.5 py-1 rounded-lg inline-block mt-0.5">
            {currentTeacher?.name || 'শিক্ষক'}
          </span>
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
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('fees')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'fees'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          আদায়কৃত ফি ও রসিদ ({toBn(feePayments.length)})
        </button>

        <button
          onClick={() => setActiveSubTab('dues')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'dues'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          বকেয়া তালিকা ও তাগাদা ({toBn(dueStudents.length)})
        </button>

        <button
          onClick={() => setActiveSubTab('expenses')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'expenses'
              ? 'border-rose-600 text-rose-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          কোচিং সেন্টারের খরচ ({toBn(expenses.length)})
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap cursor-pointer inline-flex items-center gap-1.5 ${
            activeSubTab === 'history'
              ? 'border-[#0F3382] text-[#0F3382]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          বিগত মাসের হিসাব (রিচেক) ({toBn(monthlyArchives.length)})
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
                চলতি {currentBengaliMonthName} মাসের টিউশন ফি বকেয়া রয়েছে মোট <strong>{toBn(dueStudents.length)}</strong> জন শিক্ষার্থীর।
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

      {/* TAB 4: PAST MONTHS ARCHIVE (RE-CHECK) */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-[#DCEEFF]/60 border border-blue-200 rounded-2xl p-4 text-xs text-[#0F244D] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#0F3382] shrink-0" />
              <span>
                মাস শেষে ক্লোজ করা বিগত মাসগুলোর মোট আয়, মোট ব্যয় এবং প্রতিটি রসিদ ও খরচের বিস্তারিত তালিকা এখান থেকে রিচেক ও PDF ডাউনলোড করা যাবে।
              </span>
            </div>
            <span className="font-bold text-xs text-[#0F3382] shrink-0">
              মোট আর্কাইভ: {toBn(monthlyArchives.length)} টি মাস
            </span>
          </div>

          {monthlyArchives.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center space-y-2">
              <History className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">এখনো কোনো বিগত মাসের হিসাব আর্কাইভ করা হয়নি</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                মাস শেষে &quot;মাস শেষ হিসাব ক্লোজ&quot; বাটনে ক্লিক করলে ওই মাসের মোট আয় ও ব্যয় এখানে স্থায়ীভাবে সংরক্ষিত হবে এবং চলতি হিসাব রিসেট হবে।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {monthlyArchives.map((arc) => (
                <div
                  key={arc.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#0F3382]/40 transition flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-3 py-1 rounded-xl bg-[#DCEEFF] text-[#0F3382] font-bold text-xs">
                        {arc.monthLabel}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formatBengaliDate(arc.closedAt.slice(0, 10))}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                        <span className="text-emerald-800 font-semibold">মোট আয় ({toBn(arc.feePayments.length)} রসিদ)</span>
                        <span className="font-bold text-emerald-700 font-mono">{formatTaka(arc.totalIncome)}</span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 border border-rose-100">
                        <span className="text-rose-800 font-semibold">মোট ব্যয় ({toBn(arc.expenses.length)} এন্ট্রি)</span>
                        <span className="font-bold text-rose-700 font-mono">{formatTaka(arc.totalExpenses)}</span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-700 font-semibold">নেট ব্যালেন্স</span>
                        <span className="font-bold text-slate-900 font-mono">{formatTaka(arc.netBalance)}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-3">
                      হিসাব ক্লোজ করেছেন: <strong className="text-slate-700">{arc.closedByTeacherName}</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedArchive(arc)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#0F3382] hover:bg-[#0B2666] text-white text-xs font-bold transition cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    বিস্তারিত আয়-ব্যয় রিচেক / PDF
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modular Account Modals */}
      <AddExpenseModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        teacherId={currentTeacher?.id || 'tch-dildihan'}
        teacherName={currentTeacher?.name || 'শিক্ষক'}
        onSubmitExpense={addExpense}
      />

      <LedgerReportModal
        isOpen={ledgerPdfModalOpen}
        onClose={() => setLedgerPdfModalOpen(false)}
        settings={settings}
        feePayments={feePayments}
        expenses={expenses}
        students={students}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        netCashBalance={netCashBalance}
      />

      <MonthCloseModal
        isOpen={closeMonthModalOpen}
        onClose={() => setCloseMonthModalOpen(false)}
        feePayments={feePayments}
        expenses={expenses}
        onConfirmArchiveAndClear={closeAndClearMonthAccounts}
        onCompleted={(archived) => {
          setCloseSuccessMsg(
            `${archived.monthLabel} এর মোট আয় (${formatTaka(archived.totalIncome)}) ও ব্যয় (${formatTaka(archived.totalExpenses)}) আর্কাইভ করে বর্তমান হিসাব রিসেট করা হয়েছে।`
          );
          setActiveSubTab('history');
        }}
      />

      <MonthlyArchiveModal
        archive={selectedArchive}
        students={students}
        settings={settings}
        onClose={() => setSelectedArchive(null)}
      />
    </div>
  );
};
