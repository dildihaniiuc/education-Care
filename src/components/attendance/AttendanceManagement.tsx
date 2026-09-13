import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Copy,
  Check,
  Users,
  AlertTriangle,
  Calendar,
  Save,
  MessageSquare,
} from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';
import { AttendanceStatus } from '../../types';
import { toBn, formatBengaliDate } from '../../utils/bengaliUtils';

export const AttendanceManagement: React.FC = () => {
  const { batches, students, attendance, saveBatchAttendance, settings } = useCoaching();

  const todayStr = '2026-09-13'; // matching app runtime
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id || '');
  const [statusMap, setStatusMap] = useState<{ [studentId: string]: AttendanceStatus }>({});
  const [noteMap, setNoteMap] = useState<{ [studentId: string]: string }>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedSmsId, setCopiedSmsId] = useState<string | null>(null);

  const currentBatch = batches.find((b) => b.id === selectedBatchId);
  const batchStudents = students.filter((s) => s.batchId === selectedBatchId && s.status === 'সক্রিয়');

  // Load existing records if any
  useEffect(() => {
    if (!selectedBatchId || !selectedDate) return;

    const existing = attendance.find(
      (a) => a.date === selectedDate && a.batchId === selectedBatchId
    );

    const initialStatus: { [studentId: string]: AttendanceStatus } = {};
    const initialNotes: { [studentId: string]: string } = {};

    batchStudents.forEach((student) => {
      const rec = existing?.records.find((r) => r.studentId === student.id);
      if (rec) {
        initialStatus[student.id] = rec.status;
        initialNotes[student.id] = rec.note || '';
      } else {
        initialStatus[student.id] = 'উপস্থিত'; // default present
        initialNotes[student.id] = '';
      }
    });

    setStatusMap(initialStatus);
    setNoteMap(initialNotes);
    setSaveSuccess(false);
  }, [selectedDate, selectedBatchId, attendance, batchStudents.length]);

  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    setStatusMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: { [studentId: string]: AttendanceStatus } = {};
    batchStudents.forEach((s) => {
      updated[s.id] = status;
    });
    setStatusMap(updated);
  };

  const handleSave = () => {
    const records = batchStudents.map((s) => ({
      studentId: s.id,
      status: statusMap[s.id] || 'উপস্থিত',
      note: noteMap[s.id] || undefined,
    }));

    saveBatchAttendance(selectedDate, selectedBatchId, records);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Absent students
  const absentStudents = batchStudents.filter(
    (s) => statusMap[s.id] === 'অনুপস্থিত'
  );

  const getSmsText = (studentName: string, roll: string) => {
    return `শ্রদ্ধেয় অভিভাবক, আপনার সন্তান ${studentName} (রোল: ${toBn(roll)}), আজ ${formatBengaliDate(selectedDate)} ক্লাসে অনুপস্থিত রয়েছে। বিষয়টি গুরুত্বের সাথে দেখবেন। - ${settings.name}, গুলিয়াখালী, সীতাকুণ্ড। হেল্পলাইন: ${settings.phone}`;
  };

  const handleCopySms = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSmsId(id);
    setTimeout(() => setCopiedSmsId(null), 2000);
  };

  // Attendance stats for selected batch & date
  const presentCount = batchStudents.filter((s) => statusMap[s.id] === 'উপস্থিত' || statusMap[s.id] === 'বিলম্ব').length;
  const absentCount = batchStudents.filter((s) => statusMap[s.id] === 'অনুপস্থিত').length;
  const leaveCount = batchStudents.filter((s) => statusMap[s.id] === 'ছুটি').length;
  const presentPercentage = batchStudents.length > 0 ? Math.round((presentCount / batchStudents.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-800">দৈনিক ডিজিটাল উপস্থিতি (হাজিরা)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            তারিখ ও ব্যাচ নির্বাচন করে এক ক্লিকে উপস্থিতি সম্পন্ন করুন এবং অনুপস্থিত শিক্ষার্থীদের অভিভাবককে এসএমএস পাঠান।
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold shadow-md transition"
        >
          <Save className="w-4 h-4" />
          হাজিরা সংরক্ষণ করুন
        </button>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          হাজিরা সফলভাবে ডেটাবেজে সংরক্ষিত হয়েছে!
        </div>
      )}

      {/* Control Filters Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              হাজিরার তারিখ নির্বাচন
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ব্যাচ নির্বাচন করুন
            </label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600 font-medium"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.classGrade})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              দ্রুত অ্যাকশন
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleMarkAll('উপস্থিত')}
                className="flex-1 px-3 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-semibold transition"
              >
                সকলকে উপস্থিত
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('অনুপস্থিত')}
                className="px-3 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-semibold transition"
              >
                সকলকে অনুপস্থিত
              </button>
            </div>
          </div>
        </div>

        {/* Quick Summary Pill Row */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs">
          <span className="text-slate-600">
            মোট ছাত্র: <strong className="text-slate-900">{toBn(batchStudents.length)} জন</strong>
          </span>
          <span className="text-emerald-700 font-medium">
            উপস্থিত: <strong>{toBn(presentCount)} জন</strong>
          </span>
          <span className="text-rose-700 font-medium">
            অনুপস্থিত: <strong>{toBn(absentCount)} জন</strong>
          </span>
          <span className="text-blue-700 font-medium">
            ছুটি: <strong>{toBn(leaveCount)} জন</strong>
          </span>
          <span className="ml-auto font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            উপস্থিতির হার: {toBn(presentPercentage)}%
          </span>
        </div>
      </div>

      {/* Attendance Sheet Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-600" />
            <h3 className="font-bold text-sm text-slate-800">
              {currentBatch?.name} — {formatBengaliDate(selectedDate)} এর হাজিরা তালিকা
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">{currentBatch?.timeSlot}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 w-16">রোল</th>
                <th className="px-4 py-3">শিক্ষার্থীর নাম</th>
                <th className="px-4 py-3">অভিভাবকের ফোন</th>
                <th className="px-4 py-3 text-center">উপস্থিতি নির্বাচন</th>
                <th className="px-4 py-3">নোট / কারণ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batchStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    এই ব্যাচে কোনো শিক্ষার্থী তালিকাভুক্ত নেই।
                  </td>
                </tr>
              ) : (
                batchStudents.map((std) => {
                  const currentStatus = statusMap[std.id] || 'উপস্থিত';
                  return (
                    <tr key={std.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">
                        {toBn(std.roll)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{std.nameBn}</div>
                        <div className="text-[11px] text-slate-500">{std.schoolCollege}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">
                        {std.guardianPhone}
                      </td>

                      {/* Status Selection Buttons */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSetStatus(std.id, 'উপস্থিত')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                              currentStatus === 'উপস্থিত'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            উপস্থিত
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSetStatus(std.id, 'অনুপস্থিত')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                              currentStatus === 'অনুপস্থিত'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            অনুপস্থিত
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSetStatus(std.id, 'বিলম্ব')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                              currentStatus === 'বিলম্ব'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            বিলম্ব
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSetStatus(std.id, 'ছুটি')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                              currentStatus === 'ছুটি'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            ছুটি
                          </button>
                        </div>
                      </td>

                      {/* Note */}
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder="নোট..."
                          value={noteMap[std.id] || ''}
                          onChange={(e) =>
                            setNoteMap({ ...noteMap, [std.id]: e.target.value })
                          }
                          className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Automated Absent Alert SMS Section */}
      {absentStudents.length > 0 && (
        <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-900">
              <MessageSquare className="w-5 h-5 text-rose-600" />
              <h4 className="font-bold text-sm">
                অনুপস্থিত শিক্ষার্থীদের অভিভাবকের জন্য স্বয়ংক্রিয় এসএমএস ড্রাফট ({toBn(absentStudents.length)} জন)
              </h4>
            </div>
            <span className="text-xs text-rose-700 font-medium">এক ক্লিকে কপি করুন</span>
          </div>

          <div className="space-y-2">
            {absentStudents.map((std) => {
              const smsText = getSmsText(std.nameBn, std.roll);
              const isCopied = copiedSmsId === std.id;
              return (
                <div
                  key={std.id}
                  className="bg-white rounded-xl p-3 border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">
                      {std.nameBn} (রোল: {toBn(std.roll)}) • অভিভাবক: {std.guardianPhone}
                    </p>
                    <p className="text-slate-600 mt-1 font-serif leading-relaxed italic">
                      "{smsText}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopySms(smsText, std.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-xs transition ${
                        isCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {isCopied ? 'কপি হয়েছে' : 'মেসেজ কপি'}
                    </button>
                    <a
                      href={`sms:${std.guardianPhone}?body=${encodeURIComponent(smsText)}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      এসএমএস পাঠান
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
