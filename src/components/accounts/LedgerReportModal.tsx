import React, { useRef, useState } from 'react';
import { Download, Loader2, Printer, X } from 'lucide-react';
import { Expense, FeePayment, InstituteSettings, Student } from '../../types';
import { formatBengaliDate, formatTaka, toBn } from '../../utils/bengaliUtils';
import { downloadElementAsPdf } from '../../utils/pdfGenerator';

interface LedgerReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: InstituteSettings;
  feePayments: FeePayment[];
  expenses: Expense[];
  students: Student[];
  totalIncome: number;
  totalExpenses: number;
  netCashBalance: number;
}

/**
 * Printable & PDF-exportable ledger report for all active income and expenses.
 */
export const LedgerReportModal: React.FC<LedgerReportModalProps> = ({
  isOpen,
  onClose,
  settings,
  feePayments,
  expenses,
  students,
  totalIncome,
  totalExpenses,
  netCashBalance,
}) => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const ledgerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    if (!ledgerRef.current) return;
    setIsDownloadingPdf(true);
    await downloadElementAsPdf(ledgerRef.current, {
      filename: `accounts_ledger_${new Date().toISOString().slice(0, 10)}.pdf`,
      orientation: 'portrait',
      marginMm: 10,
    });
    setIsDownloadingPdf(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto print-modal-wrapper">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 max-h-[94vh] flex flex-col print-modal-container">
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <span className="font-semibold text-sm">আর্থিক আয়-ব্যয় ও ফি আদায় লেজার (PDF)</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isDownloadingPdf}
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-60"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isDownloadingPdf ? 'PDF তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              প্রিন্ট
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto print:overflow-visible bg-white">
          <div ref={ledgerRef} className="p-6 sm:p-8 bg-white text-slate-800 space-y-5 printable-card">
            <div className="text-center border-b-2 border-slate-800 pb-3">
              <h2 className="text-2xl font-black text-slate-900">{settings.name}</h2>
              <p className="text-xs text-slate-600">
                {settings.address}, {settings.district} · মোবাইল: {settings.phone}
              </p>
              <div className="mt-2 inline-block px-4 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-xs font-bold">
                আয়-ব্যয় ও ফি আদায়ের পূর্ণাঙ্গ আর্থিক প্রতিবেদন
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-700 font-semibold block">মোট আয় (ফি আদায়)</span>
                <span className="text-lg font-black text-emerald-900">
                  {formatTaka(totalIncome)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-rose-700 font-semibold block">মোট ব্যয় (খরচ)</span>
                <span className="text-lg font-black text-rose-900">
                  {formatTaka(totalExpenses)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
                <span className="text-teal-700 font-semibold block">নেট ক্যাশ ব্যালেন্স</span>
                <span className="text-lg font-black text-teal-900">
                  {formatTaka(netCashBalance)}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm text-slate-900 mb-2">
                আদায়কৃত ফি ও আদায়কারী শিক্ষকের বিবরণ ({toBn(feePayments.length)} টি রসিদ)
              </h4>
              <table className="w-full text-[11px] text-left border border-slate-300">
                <thead className="bg-slate-100 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-300">রসিদ নং</th>
                    <th className="p-2 border-r border-slate-300">শিক্ষার্থী</th>
                    <th className="p-2 border-r border-slate-300">বিবরণ / মাস</th>
                    <th className="p-2 border-r border-slate-300">তারিখ</th>
                    <th className="p-2 border-r border-slate-300">আদায়কারী শিক্ষক</th>
                    <th className="p-2 text-right">পরিমাণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {feePayments.map((p) => {
                    const stu = students.find((s) => s.id === p.studentId);
                    return (
                      <tr key={p.id}>
                        <td className="p-2 border-r border-slate-200 font-mono font-bold">
                          {p.receiptNo}
                        </td>
                        <td className="p-2 border-r border-slate-200 font-semibold">
                          {stu?.nameBn || 'অজ্ঞাত'} (রোল {toBn(stu?.roll)})
                        </td>
                        <td className="p-2 border-r border-slate-200">
                          {p.feeType} - {p.month}
                        </td>
                        <td className="p-2 border-r border-slate-200">
                          {formatBengaliDate(p.date)}
                        </td>
                        <td className="p-2 border-r border-slate-200 font-bold text-emerald-800">
                          {p.collectedBy}
                        </td>
                        <td className="p-2 text-right font-bold">{formatTaka(p.paidAmount)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {expenses.length > 0 && (
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-2">
                  কোচিং সেন্টারের খরচের বিবরণ ({toBn(expenses.length)} টি এন্ট্রি)
                </h4>
                <table className="w-full text-[11px] text-left border border-slate-300">
                  <thead className="bg-slate-100 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-300">শিরোনাম</th>
                      <th className="p-2 border-r border-slate-300">খাত</th>
                      <th className="p-2 border-r border-slate-300">তারিখ</th>
                      <th className="p-2 border-r border-slate-300">নথিভুক্তকারী শিক্ষক</th>
                      <th className="p-2 text-right">খরচ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {expenses.map((exp) => (
                      <tr key={exp.id}>
                        <td className="p-2 border-r border-slate-200 font-semibold">{exp.title}</td>
                        <td className="p-2 border-r border-slate-200">{exp.category}</td>
                        <td className="p-2 border-r border-slate-200">
                          {formatBengaliDate(exp.date)}
                        </td>
                        <td className="p-2 border-r border-slate-200">
                          {exp.recordedByTeacherName || 'শিক্ষক'}
                        </td>
                        <td className="p-2 text-right font-bold text-rose-700">
                          {formatTaka(exp.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 flex justify-between text-[11px] text-slate-500">
              <span>প্রস্তুতের তারিখ: {formatBengaliDate(new Date().toISOString().slice(0, 10))}</span>
              <span>ডিজিটাল অডিট রিপোর্ট · {settings.name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
