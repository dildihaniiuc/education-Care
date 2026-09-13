import React from 'react';
import { X, Printer, BookOpen, ShieldCheck, User, MapPin, Phone } from 'lucide-react';
import { Student, Batch, InstituteSettings } from '../../types';
import { toBn } from '../../utils/bengaliUtils';

interface StudentIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  batch?: Batch;
  settings: InstituteSettings;
}

export const StudentIdCardModal: React.FC<StudentIdCardModalProps> = ({
  isOpen,
  onClose,
  student,
  batch,
  settings,
}) => {
  if (!isOpen || !student) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        {/* Modal Controls (Hidden in print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <span className="font-semibold text-sm">শিক্ষার্থী ডিজিটাল আইডি কার্ড</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              প্রিন্ট আইডি কার্ড
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div className="p-6 bg-slate-100 flex flex-col items-center justify-center">
          {/* Front Side ID Card */}
          <div
            id="student-id-card"
            className="w-full max-w-[360px] bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-300 relative printable-card"
          >
            {/* Top decorative header band */}
            <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 text-white p-4 text-center relative overflow-hidden">
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-1 text-white border border-white/30 shadow-inner">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base leading-tight tracking-tight">
                  {settings.name}
                </h3>
                <p className="text-[11px] text-emerald-200 font-medium mt-0.5">
                  {settings.address}, {settings.district}
                </p>
                <div className="mt-1 bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  শিক্ষার্থী পরিচয়পত্র (২০২৬)
                </div>
              </div>
            </div>

            {/* Student Photo & Profile info */}
            <div className="p-5 flex flex-col items-center">
              <div className="w-22 h-24 rounded-xl bg-gradient-to-b from-slate-100 to-slate-200 border-2 border-emerald-600 flex flex-col items-center justify-center shadow-xs overflow-hidden -mt-2">
                <User className="w-12 h-12 text-slate-400" />
                <span className="text-[10px] text-slate-500 font-semibold mt-1">পাসপোর্ট ছবি</span>
              </div>

              <h4 className="mt-3 font-bold text-lg text-slate-800 text-center leading-tight">
                {student.nameBn}
              </h4>
              {student.nameEn && (
                <p className="text-xs text-slate-500 font-medium">{student.nameEn}</p>
              )}

              {/* Badges */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
                  রোল: {toBn(student.roll)}
                </span>
                <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2.5 py-0.5 rounded-full">
                  শ্রেণি: {student.classGrade}
                </span>
                {student.bloodGroup !== 'জানা নেই' && (
                  <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                    রক্ত: {student.bloodGroup}
                  </span>
                )}
              </div>

              {/* Data list */}
              <div className="w-full mt-4 bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">ব্যাচের নাম:</span>
                  <span className="font-semibold text-slate-800">{batch?.name || 'সাধারণ ব্যাচ'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">পিতার নাম:</span>
                  <span className="font-semibold text-slate-800">{student.fatherName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">প্রতিষ্ঠান:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                    {student.schoolCollege}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">জরুরি অভিভাবক:</span>
                  <span className="font-bold text-emerald-800 font-mono">
                    {student.guardianPhone}
                  </span>
                </div>
              </div>

              {/* Barcode Mock & Signature */}
              <div className="w-full mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                <div className="flex flex-col">
                  {/* barcode graphic lines */}
                  <div className="flex items-center gap-0.5 h-6">
                    {[4, 2, 6, 1, 3, 5, 2, 4, 3, 1, 6, 2, 4, 2, 5, 3].map((w, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-800 h-full"
                        style={{ width: `${w * 1.5}px` }}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono tracking-widest mt-0.5">
                    EC-ID-{student.roll}
                  </span>
                </div>

                <div className="text-right">
                  <div className="h-6 flex items-end justify-end">
                    <span className="text-xs font-serif italic text-slate-800 font-bold underline decoration-emerald-600">
                      জাহিদুল আলম
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">পরিচালক / প্রধান শিক্ষক</p>
                </div>
              </div>
            </div>

            {/* Bottom Footer Ribbon */}
            <div className="bg-slate-900 text-white text-[10px] py-1.5 px-3 text-center">
              জরুরি প্রয়োজনে: {settings.phone} • গুলিয়াখালী, সীতাকুণ্ড
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
