import React, { useRef, useState } from 'react';
import { Download, Loader2, Printer, Search, X } from 'lucide-react';
import { InstituteSettings, MonthlyArchive, Student } from '../../types';
import { formatBengaliDate, formatTaka, toBn } from '../../utils/bengaliUtils';
import { downloadElementAsPdf } from '../../utils/pdfGenerator';

interface MonthlyArchiveModalProps {
  archive: MonthlyArchive | null;
  students: Student[];
  settings: InstituteSettings;
  onClose: () => void;
}

/**
 * Detailed re-check viewer for an archived past month.
 * Supports searching receipts/expenses, browser printing, and PDF download.
 */
export const MonthlyArchiveModal: React.FC<MonthlyArchiveModalProps> = ({
  archive,
  students,
  settings,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const archiveRef = useRef<HTMLDivElement>(null);

  if (!archive) return null;

  const filteredPayments = archive.feePayments.filter((p) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const stu = students.find((s) => s.id === p.studentId);
    return (
      p.receiptNo.toLowerCase().includes(q) ||
      (p.collectedBy || '').toLowerCase().includes(q) ||
      (stu?.nameBn || '').toLowerCase().includes(q) ||
      (stu?.roll || '').includes(q)
    );
  });

  const filteredExpenses = archive.expenses.filter((exp) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      exp.title.toLowerCase().includes(q) ||
      exp.category.toLowerCase().includes(q) ||
      (exp.recipient || '').toLowerCase().includes(q) ||
      (exp.recordedByTeacherName || '').toLowerCase().includes(q)
    );
  });

  const handleDownloadPdf = async () => {
    if (!archiveRef.current) return;
    setIsDownloadingPdf(true);
    await downloadElementAsPdf(archiveRef.current, {
      filename: `archive_${archive.month}_${archive.year}.pdf`,
      orientation: 'portrait',
      marginMm: 10,
    });
    setIsDownloadingPdf(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto print-modal-wrapper">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 max-h-[94vh] flex flex-col print-modal-container">
        <div className="no-print bg-[#0F3382] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <span className="font-bold text-sm">
            বিগত মাসের হিসাব রিচেক — {archive.monthLabel}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isDownloadingPdf}
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-60"
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              প্রিন্ট
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="no-print px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="আর্কাইভের রসিদ, শিক্ষার্থী, শিক্ষক বা খরচের নাম খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-white px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-[#0F3382]"
          />
        </div>

        <div className="overflow-y-auto print:overflow-visible bg-white">
          <div ref={archiveRef} className="p-6 sm:p-8 bg-white text-slate-800 space-y-5 printable-card">
            <div className="text-center border-b-2 border-slate-800 pb-3">
              <h2 className="text-2xl font-black text-slate-900">{settings.name}</h2>
              <p className="text-xs text-slate-600">
                {settings.address}, {settings.district} · মোবাইল: {settings.phone}
              </p>
              <div className="mt-2 inline-block px-4 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-xs font-bold">
                বিগত মাসের আয়-ব্যয় রিচেক রিপোর্ট: {archive.monthLabel}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-700 font-semibold block">
                  মোট আয় ({toBn(archive.feePayments.length)} রসিদ)
                </span>
                <span className="text-lg font-black text-emerald-900">
                  {formatTaka(archive.totalIncome)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-rose-700 font-semibold block">
                  মোট ব্যয় ({toBn(archive.expenses.length)} এন্ট্রি)
                </span>
                <span className="text-lg font-black text-rose-900">
                  {formatTaka(archive.totalExpenses)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
                <span className="text-teal-700 font-semibold block">নেট ব্যালেন্স</span>
                <span className="text-lg font-black text-teal-900">
                  {formatTaka(archive.netBalance)}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm text-slate-900 mb-2">
                আদায়কৃত ফি ({toBn(filteredPayments.length)} টি রসিদ)
              </h4>
              {filteredPayments.length === 0 ? (
                <p className="text-xs text-slate-400">কোনো ফি আদায়ের রসিদ নেই।</p>
              ) : (
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
                    {filteredPayments.map((p) => {
                      const stu = students.find((s) => s.id === p.studentId);
                      return (
                        <tr key={p.id}>
                          <td className="p-2 border-r border-slate-200 font-mono font-bold">
                            {p.receiptNo}
                          </td>
                          <td className="p-2 border-r border-slate-200 font-semibold">
                            {stu?.nameBn || 'শিক্ষার্থী'} {stu?.roll ? `(রোল ${toBn(stu.roll)})` : ''}
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
              )}
            </div>

            <div>
              <h4 className="font-bold text-sm text-slate-900 mb-2">
                খরচের বিবরণ ({toBn(filteredExpenses.length)} টি এন্ট্রি)
              </h4>
              {filteredExpenses.length === 0 ? (
                <p className="text-xs text-slate-400">কোনো খরচের এন্ট্রি নেই।</p>
              ) : (
                <table className="w-full text-[11px] text-left border border-slate-300">
                  <thead className="bg-slate-100 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-300">শিরোনাম</th>
                      <th className="p-2 border-r border-slate-300">খাত</th>
                      <th className="p-2 border-r border-slate-300">প্রাপক</th>
                      <th className="p-2 border-r border-slate-300">তারিখ</th>
                      <th className="p-2 border-r border-slate-300">নথিভুক্তকারী শিক্ষক</th>
                      <th className="p-2 text-right">খরচ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredExpenses.map((exp) => (
                      <tr key={exp.id}>
                        <td className="p-2 border-r border-slate-200 font-semibold">{exp.title}</td>
                        <td className="p-2 border-r border-slate-200">{exp.category}</td>
                        <td className="p-2 border-r border-slate-200">{exp.recipient || '—'}</td>
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
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between text-[11px] text-slate-500">
              <span>হিসাব ক্লোজের তারিখ: {formatBengaliDate(archive.closedAt.slice(0, 10))}</span>
              <span>ক্লোজকারী: {archive.closedByTeacherName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
