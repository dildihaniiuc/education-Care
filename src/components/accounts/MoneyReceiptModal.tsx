import React, { useRef, useState } from 'react';
import { X, Printer, BookOpen, CheckCircle, ShieldCheck, Download, Loader2 } from 'lucide-react';
import { FeePayment, Student, Batch, InstituteSettings } from '../../types';
import { toBn, formatTaka, formatBengaliDate } from '../../utils/bengaliUtils';
import { downloadElementAsPdf } from '../../utils/pdfGenerator';
import { BrandLogo } from '../common/BrandLogo';

interface MoneyReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: FeePayment | null;
  student?: Student;
  batch?: Batch;
  settings: InstituteSettings;
}

export const MoneyReceiptModal: React.FC<MoneyReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
  student,
  batch,
  settings,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!receiptRef.current) return;
    setIsDownloading(true);
    await downloadElementAsPdf(receiptRef.current, {
      filename: `money_receipt_${payment.receiptNo || payment.id}.pdf`,
      orientation: 'portrait',
      marginMm: 10,
      fitSinglePage: true,
    });
    setIsDownloading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto print-modal-wrapper">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 max-h-[94vh] flex flex-col print-modal-container">
        {/* Top Control Bar (Hidden in Print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <span className="font-semibold text-sm">মানি রিসিট / অফিসিয়াল ক্যাশ মেমো</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-60"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isDownloading ? 'PDF তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}
            </button>
            <button
              type="button"
              onClick={handlePrint}
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

        {/* Printable Receipt Body */}
        <div className="overflow-y-auto print:overflow-visible bg-white">
          <div ref={receiptRef} className="p-6 print:p-5 bg-white printable-card single-page-receipt text-slate-800">
            {/* Header */}
            <div className="text-center pb-3 border-b-2 border-slate-800">
              <div className="flex items-center justify-center gap-3 mb-1">
                <BrandLogo variant="badge" className="w-10 h-10 rounded-xl" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {settings.name}
                </h2>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {settings.address}, {settings.union}, {settings.upazila}, {settings.district}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                হটলাইন: <span className="font-bold">{settings.phone}</span> | ইমেইল: {settings.email}
              </p>
              <div className="inline-block mt-2 px-4 py-1 rounded-full bg-slate-100 border border-slate-300 text-xs font-bold uppercase tracking-wider text-slate-800">
                অর্থ প্রাপ্তির রসিদ (Money Receipt)
              </div>
            </div>

            {/* Receipt Info Bar */}
            <div className="grid grid-cols-2 gap-4 py-3 border-b border-dashed border-slate-300 text-xs">
              <div>
                <p className="text-slate-500">
                  রসিদ নং: <span className="font-bold text-slate-900 font-mono">{payment.receiptNo}</span>
                </p>
                <p className="text-slate-500 mt-1">
                  পরিশোধের মাধ্যম: <span className="font-semibold text-slate-800">{payment.paymentMethod}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-500">
                  তারিখ: <span className="font-semibold text-slate-900">{formatBengaliDate(payment.date)}</span>
                </p>
                <p className="text-slate-500 mt-1 flex items-center justify-end gap-1">
                  <span>আদায়কারী:</span>
                  <span className="font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {payment.collectedBy || 'শিক্ষক'}
                  </span>
                </p>
              </div>
            </div>

            {/* Student Info */}
            <div className="bg-slate-50 rounded-xl p-3.5 my-4 border border-slate-200 text-xs grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500">শিক্ষার্থীর নাম:</span>{' '}
                <span className="font-bold text-slate-900">{student?.nameBn || 'অজ্ঞাত'}</span>
              </div>
              <div>
                <span className="text-slate-500">রোল নম্বর:</span>{' '}
                <span className="font-bold text-slate-900">{toBn(student?.roll || '')}</span>
              </div>
              <div>
                <span className="text-slate-500">শ্রেণি:</span>{' '}
                <span className="font-semibold text-slate-800">{student?.classGrade || ''}</span>
              </div>
              <div>
                <span className="text-slate-500">ব্যাচ:</span>{' '}
                <span className="font-semibold text-slate-800">{batch?.name || 'সাধারণ'}</span>
              </div>
            </div>

            {/* Breakdown Table */}
            <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden my-3">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">ক্রমিক</th>
                  <th className="p-2.5">ফি-এর বিবরণ ও মাস</th>
                  <th className="p-2.5 text-right">নির্ধারিত ফি</th>
                  <th className="p-2.5 text-right">ছাড় (Discount)</th>
                  <th className="p-2.5 text-right">আদায়কৃত টাকা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2.5 text-slate-500">০১.</td>
                  <td className="p-2.5 font-medium text-slate-800">
                    {payment.feeType} - {payment.month}, {toBn(payment.year)}
                    {payment.note && (
                      <span className="block text-[11px] text-slate-500 font-normal">
                        ({payment.note})
                      </span>
                    )}
                  </td>
                  <td className="p-2.5 text-right font-medium">{formatTaka(payment.amount)}</td>
                  <td className="p-2.5 text-right text-slate-500">{formatTaka(payment.discount)}</td>
                  <td className="p-2.5 text-right font-bold text-slate-900">
                    {formatTaka(payment.paidAmount)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-semibold">
                <tr>
                  <td colSpan={4} className="p-2.5 text-right text-slate-700">
                    সর্বমোট পরিশোধিত অর্থ:
                  </td>
                  <td className="p-2.5 text-right font-bold text-emerald-800 text-sm">
                    {formatTaka(payment.paidAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Due Status Pill */}
            <div className="flex items-center justify-between text-xs py-2">
              <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle className="w-4 h-4" />
                পরিশোধিত স্ট্যাটাস: সফলভাবে গৃহীত
              </div>
              {payment.dueAmount > 0 && (
                <span className="font-bold text-rose-700">
                  অবশিষ্ট বকেয়া: {formatTaka(payment.dueAmount)}
                </span>
              )}
            </div>

            {/* Signatures */}
            <div className="mt-8 print:mt-6 pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-600">
              <div className="text-center">
                <div className="w-32 border-b border-slate-400 mb-1" />
                <p>শিক্ষার্থী / অভিভাবকের স্বাক্ষর</p>
              </div>
              <div className="text-center">
                <div className="w-40 border-b border-slate-400 mb-1 mx-auto" />
                <p className="font-bold text-slate-900">{payment.collectedBy || 'দায়িত্বপ্রাপ্ত শিক্ষক'}</p>
                <p className="font-semibold text-slate-800 text-[11px]">আদায়কারী শিক্ষকের সিল ও স্বাক্ষর</p>
                <p className="text-[10px] text-slate-400">এডুকেশন কেয়ার কোচিং সেন্টার</p>
              </div>
            </div>

            {/* Security & Cloud Verification Footer */}
            <div className="mt-4 print:mt-3 pt-2.5 border-t border-dashed border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-mono">আইডি: {payment.id}</span>
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Google Cloud Firestore ডাটাবেসে চিরস্থায়ীভাবে সুরক্ষিত
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
