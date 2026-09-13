import React from 'react';
import { Printer, X, Download, Calendar, Clock, MapPin, User, CheckCircle2 } from 'lucide-react';
import { ClassRoutine } from '../../types';
import { useCoaching } from '../../context/CoachingContext';
import { toBn } from '../../utils/bengaliUtils';

interface RoutinePrintViewProps {
  routine: ClassRoutine;
  onClose: () => void;
}

export const RoutinePrintView: React.FC<RoutinePrintViewProps> = ({ routine, onClose }) => {
  const { settings } = useCoaching();

  const handlePrint = () => {
    window.print();
  };

  // Find max periods across days
  const maxPeriods = Math.max(1, ...routine.days.map((d) => d.periods.length));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[96vh] flex flex-col">
        {/* Modal Controls Header - Hidden on Print */}
        <div className="bg-slate-900 px-6 py-3.5 text-white flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">রুটিন প্রিন্ট ও পিডিএফ প্রিভিউ</h3>
              <p className="text-xs text-slate-300">A4 সাইজে পরিষ্কারভাবে প্রিন্ট বা PDF ডাউনলোড করুন</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              প্রিন্ট / PDF সংরক্ষণ
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950 flex justify-center">
          <div
            id="printable-routine-area"
            className="bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] p-6 sm:p-10 shadow-lg print:shadow-none print:p-6 print:m-0 rounded-xl print:rounded-none border border-slate-200 print:border-none flex flex-col justify-between text-left relative"
          >
            {/* Top Institutional Header */}
            <div>
              <div className="text-center border-b-2 border-slate-800 pb-4">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  {settings.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1">
                  {settings.address}, {settings.upazila || 'সীতাকুণ্ড'}, {settings.district}
                </p>
                <p className="text-xs text-slate-600 font-medium">
                  মোবাইল: {settings.phone} {settings.altPhone && `| ${settings.altPhone}`}
                </p>

                <div className="mt-3 inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-bold tracking-wide">
                  <span>অফিশিয়াল ক্লাস রুটিন ২০২৬</span>
                </div>
              </div>

              {/* Routine Meta Info Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">শ্রেণি:</span>{' '}
                  <strong className="text-slate-900 font-bold text-sm">
                    {routine.classGrade} শ্রেণি
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">শিফট:</span>{' '}
                  <span className="inline-block px-2 py-0.5 rounded-md font-bold bg-amber-100 text-amber-900">
                    {routine.shift} শিফট
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">মোট বার:</span>{' '}
                  <strong className="text-slate-900">{toBn(routine.days.length)} দিন</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">শিক্ষাবর্ষ:</span>{' '}
                  <strong className="text-slate-900 font-mono">{routine.academicYear}</strong>
                </div>
              </div>

              {/* Title / Description */}
              <div className="mb-4 text-center">
                <h2 className="text-base font-bold text-slate-800 underline underline-offset-4 decoration-emerald-600">
                  {routine.title}
                </h2>
              </div>

              {/* Routine Table */}
              <div className="overflow-x-auto my-2">
                <table className="w-full text-xs text-left border-collapse border border-slate-400">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 border-b border-slate-400">
                      <th className="border border-slate-400 p-2.5 text-center font-bold w-24">
                        বার (দিন)
                      </th>
                      {Array.from({ length: maxPeriods }).map((_, idx) => (
                        <th
                          key={idx}
                          className="border border-slate-400 p-2.5 text-center font-bold"
                        >
                          {idx === 0 ? '১ম পিরিয়ড' : idx === 1 ? '২য় পিরিয়ড' : '৩য় পিরিয়ড'}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {routine.days.map((dayItem, dIndex) => (
                      <tr
                        key={dIndex}
                        className={dIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}
                      >
                        {/* Day Name */}
                        <td className="border border-slate-400 p-2.5 text-center font-bold text-slate-900 bg-slate-100/50">
                          <div className="font-bold text-sm">{dayItem.day}</div>
                          <span className="text-[10px] text-slate-500">
                            ({toBn(dayItem.periods.length)}টি ক্লাস)
                          </span>
                        </td>

                        {/* Periods */}
                        {Array.from({ length: maxPeriods }).map((_, pIndex) => {
                          const period = dayItem.periods[pIndex];
                          if (!period) {
                            return (
                              <td
                                key={pIndex}
                                className="border border-slate-400 p-2.5 text-center text-slate-400 italic bg-slate-50/40"
                              >
                                — ছুটি / বিরতি —
                              </td>
                            );
                          }

                          return (
                            <td
                              key={pIndex}
                              className="border border-slate-400 p-2.5 align-top"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-slate-900 text-sm">
                                    {period.subject || 'বিষয় নির্ধারিত নয়'}
                                  </span>
                                  {period.roomNo && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded font-mono">
                                      কক্ষ {toBn(period.roomNo)}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                                  <span>শিক্ষক:</span>
                                  <span>{period.teacherName || 'নির্ধারিত নয়'}</span>
                                </div>
                                <div className="text-[10px] text-slate-600 font-mono flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{period.timeSlot || 'সময় নির্ধারিত নেই'}</span>
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Instructions / Notes */}
              <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  শিক্ষার্থী ও অভিভাবকদের জন্য জরুরি নিয়মাবলী:
                </div>
                <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-0.5 pl-1">
                  <li>ক্লাস শুরুর কমপক্ষে ১০ মিনিট পূর্বে কোচিং সেন্টারে উপস্থিত হতে হবে।</li>
                  <li>প্রতিটি বিষয়ের জন্য আলাদা খাতা ও পাঠ্যবই বাধ্যতামূলকভাবে সাথে আনতে হবে।</li>
                  <li>জরুরি প্রয়োজনে অনুপস্থিত থাকলে অভিভাবকের মোবাইল থেকে কর্তৃপক্ষকে অবগত করতে হবে।</li>
                  {routine.notes && (
                    <li className="font-semibold text-slate-800">বিশেষ দ্রষ্টব্য: {routine.notes}</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Bottom Official Signatures */}
            <div className="pt-12 pb-4 mt-auto">
              <div className="grid grid-cols-3 gap-4 text-center text-xs text-slate-700">
                <div>
                  <div className="w-32 sm:w-40 border-b border-slate-400 mx-auto mb-1.5" />
                  <p className="font-medium">অভিভাবকের স্বাক্ষর</p>
                </div>
                <div>
                  <div className="w-32 sm:w-40 border-b border-slate-400 mx-auto mb-1.5" />
                  <p className="font-medium">বিষয় শিক্ষকের স্বাক্ষর</p>
                </div>
                <div>
                  <div className="w-36 sm:w-44 border-b border-slate-800 mx-auto mb-1.5" />
                  <p className="font-bold text-slate-900">পরিচালক / প্রধান সমন্বয়কারী</p>
                  <p className="text-[10px] text-slate-500">এডুকেশন কেয়ার কোচিং সেন্টার</p>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500 flex justify-between items-center">
                <span>মুদ্রণ তারিখ: {new Date().toLocaleDateString('bn-BD')}</span>
                <span>ডিজিটাল খাতা সিস্টেম • গুলিয়াখালী, সীতাকুণ্ড, চট্টগ্রাম</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
