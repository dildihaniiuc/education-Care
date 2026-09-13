import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Clock,
  UserCheck,
  MapPin,
  Users,
  Edit,
  Trash2,
  CheckCircle,
  X,
  BookOpen,
  Filter,
} from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';
import { Batch, ClassGrade } from '../../types';
import { toBn, formatTaka } from '../../utils/bengaliUtils';
import {
  ALL_CLASS_GRADES,
  SHORTCUT_TEACHERS,
  SHORTCUT_SUBJECTS,
} from '../../constants/academicData';

const availableDays = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র'];

export const BatchManagement: React.FC = () => {
  const { batches, teachers, students, addBatch, updateBatch, deleteBatch, addTeacher } =
    useCoaching();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [viewingBatchStudents, setViewingBatchStudents] = useState<Batch | null>(null);
  const [filterClass, setFilterClass] = useState<string>('সকল');

  const [formData, setFormData] = useState({
    name: '',
    classGrade: '১০ম' as ClassGrade,
    subject: '',
    teacherId: teachers[0]?.id || '',
    scheduleDays: ['রবি', 'মঙ্গল', 'বৃহস্পতি'],
    timeSlot: 'সকাল ৮:০০ - ৯:৩০',
    roomNo: 'কক্ষ ১০১',
    maxSeats: 35,
    monthlyFee: 1500,
    active: true,
  });

  const handleOpenAdd = () => {
    setEditingBatch(null);
    setFormData({
      name: '',
      classGrade: '১০ম',
      subject: '',
      teacherId: teachers[0]?.id || '',
      scheduleDays: ['রবি', 'মঙ্গল', 'বৃহস্পতি'],
      timeSlot: 'সকাল ৮:০০ - ৯:৩০',
      roomNo: 'কক্ষ ১০১',
      maxSeats: 35,
      monthlyFee: 1500,
      active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (batch: Batch) => {
    setEditingBatch(batch);
    setFormData({
      name: batch.name,
      classGrade: batch.classGrade,
      subject: batch.subject,
      teacherId: batch.teacherId,
      scheduleDays: batch.scheduleDays,
      timeSlot: batch.timeSlot,
      roomNo: batch.roomNo,
      maxSeats: batch.maxSeats,
      monthlyFee: batch.monthlyFee,
      active: batch.active,
    });
    setModalOpen(true);
  };

  const handleToggleDay = (day: string) => {
    if (formData.scheduleDays.includes(day)) {
      setFormData({
        ...formData,
        scheduleDays: formData.scheduleDays.filter((d) => d !== day),
      });
    } else {
      setFormData({
        ...formData,
        scheduleDays: [...formData.scheduleDays, day],
      });
    }
  };

  // Shortcut subject toggle/append
  const handleToggleSubject = (sub: string) => {
    const currentSubjects = formData.subject
      ? formData.subject.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    if (currentSubjects.includes(sub)) {
      const remaining = currentSubjects.filter((s) => s !== sub);
      setFormData({ ...formData, subject: remaining.join(', ') });
    } else {
      const updated = [...currentSubjects, sub];
      setFormData({ ...formData, subject: updated.join(', ') });
    }
  };

  // Shortcut teacher select (auto add teacher if not already in system)
  const handleSelectShortcutTeacher = (teacherName: string) => {
    const existing = teachers.find((t) => t.name === teacherName);
    if (existing) {
      setFormData({ ...formData, teacherId: existing.id });
    } else {
      const config = SHORTCUT_TEACHERS.find((st) => st.name === teacherName);
      if (config) {
        addTeacher({
          name: config.name,
          designation: config.designation,
          subjects: config.subjects,
          phone: config.phone,
          qualification: config.qualification,
          joiningDate: new Date().toISOString().slice(0, 10),
          salary: 20000,
        });
        // We set teacherId once created, or will be assigned to latest
        setTimeout(() => {
          const newlyAdded = teachers.find((t) => t.name === teacherName);
          if (newlyAdded) {
            setFormData((prev) => ({ ...prev, teacherId: newlyAdded.id }));
          }
        }, 50);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingBatch) {
      updateBatch(editingBatch.id, formData);
    } else {
      addBatch(formData);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    const enrolled = students.filter((s) => s.batchId === id).length;
    if (enrolled > 0) {
      alert(
        `এই ব্যাচে বর্তমানে ${toBn(
          enrolled
        )} জন শিক্ষার্থী ভর্তি আছে। আগে তাদের অন্য ব্যাচে স্থানান্তর করুন।`
      );
      return;
    }
    if (window.confirm(`আপনি কি "${name}" ব্যাচটি মুছে ফেলতে চান?`)) {
      deleteBatch(id);
    }
  };

  const filteredBatches =
    filterClass === 'সকল'
      ? batches
      : batches.filter((b) => b.classGrade === filterClass);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              ব্যাচ ও ক্লাস রুটিন ব্যবস্থাপনা
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ১ম থেকে ১২শ শ্রেণি পর্যন্ত ব্যাচ তৈরি, শিক্ষক নির্ধারণ ও রুটিন তালিকা। মোট ব্যাচ:{' '}
            <strong className="text-slate-800 dark:text-slate-200 font-bold">{toBn(batches.length)}</strong> টি
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          নতুন ব্যাচ তৈরি করুন
        </button>
      </div>

      {/* Class Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1 pl-1">
            <Filter className="w-3.5 h-3.5" /> শ্রেণি ফিল্টার:
          </span>
          <button
            onClick={() => setFilterClass('সকল')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition shrink-0 ${
              filterClass === 'সকল'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            সকল শ্রেণি
          </button>
          {ALL_CLASS_GRADES.map((cg) => (
            <button
              key={cg}
              onClick={() => setFilterClass(cg)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 ${
                filterClass === cg
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cg}
            </button>
          ))}
        </div>
      </div>

      {/* Batches Grid */}
      {filteredBatches.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center">
          <Layers className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            {filterClass === 'সকল' ? 'কোনো ব্যাচ তৈরি করা হয়নি' : `${filterClass} শ্রেণির কোনো ব্যাচ নেই`}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            ক্লাস রুটিন তৈরি করতে উপরের "নতুন ব্যাচ তৈরি করুন" বাটনে ক্লিক করে বিষয় ও শিক্ষক শর্টকাটে নির্বাচন করুন।
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition"
          >
            <Plus className="w-4 h-4" /> প্রথম ব্যাচ যোগ করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBatches.map((batch) => {
            const teacher = teachers.find((t) => t.id === batch.teacherId);
            const enrolledStudents = students.filter((s) => s.batchId === batch.id);
            const enrolledCount = enrolledStudents.length;
            const capacityPercent = Math.min(100, Math.round((enrolledCount / batch.maxSeats) * 100));

            return (
              <div
                key={batch.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-teal-400 dark:hover:border-teal-600 transition flex flex-col justify-between"
              >
                <div>
                  {/* Header tags */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      শ্রেণি: {batch.classGrade}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {formatTaka(batch.monthlyFee)}/মাস
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {batch.name}
                  </h3>
                  <p className="text-xs text-teal-700 dark:text-teal-400 font-semibold mt-0.5">
                    {batch.subject || 'সকল বিষয়'}
                  </p>

                  {/* Details */}
                  <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {batch.timeSlot}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium">দিনসমূহ:</span>
                      <div className="flex flex-wrap gap-1">
                        {batch.scheduleDays.map((d) => (
                          <span
                            key={d}
                            className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>শিক্ষক: <strong className="text-slate-800 dark:text-slate-200">{teacher ? teacher.name : 'নির্ধারিত হয়নি'}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>রুম: {batch.roomNo}</span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500 dark:text-slate-400">
                        ভর্তি: <strong className="text-slate-800 dark:text-slate-200">{toBn(enrolledCount)}</strong> / {toBn(batch.maxSeats)} জন
                      </span>
                      <span className="font-semibold text-teal-700 dark:text-teal-400">
                        {toBn(capacityPercent)}% পূর্ণ
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          capacityPercent >= 90
                            ? 'bg-rose-500'
                            : capacityPercent >= 70
                            ? 'bg-amber-500'
                            : 'bg-teal-500'
                        }`}
                        style={{ width: `${capacityPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setViewingBatchStudents(batch)}
                    className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-200 flex items-center gap-1"
                  >
                    <Users className="w-3.5 h-3.5" />
                    শিক্ষার্থী দেখুন ({toBn(enrolledCount)})
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(batch)}
                      title="ব্যাচ এডিট করুন"
                      className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(batch.id, batch.name)}
                      title="মুছে ফেলুন"
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Batch Students Modal */}
      {viewingBatchStudents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="bg-teal-800 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">{viewingBatchStudents.name}</h3>
                <p className="text-xs text-teal-200">
                  শ্রেণি: {viewingBatchStudents.classGrade} • {viewingBatchStudents.timeSlot}
                </p>
              </div>
              <button
                onClick={() => setViewingBatchStudents(null)}
                className="p-1 rounded-lg text-teal-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {students.filter((s) => s.batchId === viewingBatchStudents.id).length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  এই ব্যাচে এখনও কোনো শিক্ষার্থী ভর্তি নেই।
                </div>
              ) : (
                students
                  .filter((s) => s.batchId === viewingBatchStudents.id)
                  .map((s) => (
                    <div key={s.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                          রোল {toBn(s.roll)} - {s.nameBn}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">{s.schoolCollege}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                          {s.guardianPhone}
                        </span>
                        <div className="text-slate-400 font-medium">{formatTaka(s.monthlyFee)}</div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Batch Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-teal-700 to-emerald-700 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-lg">
                  {editingBatch ? 'ব্যাচের তথ্য পরিবর্তন' : 'নতুন ব্যাচ তৈরি করুন'}
                </h3>
                <p className="text-xs text-teal-100 mt-0.5">
                  শ্রেণি ১ম থেকে ১২শ, বিষয় ও শিক্ষক শর্টকাটে নির্বাচন করুন
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              {/* Batch Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ব্যাচের নাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ১০ম শ্রেণি গণিত ও বিজ্ঞান স্পেশাল"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-teal-600 font-medium"
                />
              </div>

              {/* Class Selection (1st to 12th) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    শ্রেণি নির্ধারণ (১ম থেকে ১২শ) *
                  </label>
                  <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold">
                    নির্বাচিত: {formData.classGrade}
                  </span>
                </div>
                {/* Quick Class Chips */}
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  {ALL_CLASS_GRADES.map((cg) => (
                    <button
                      type="button"
                      key={cg}
                      onClick={() => setFormData({ ...formData, classGrade: cg })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        formData.classGrade === cg
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Input + Shortcuts */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    বিষয়সমূহ
                  </label>
                  {formData.subject && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, subject: '' })}
                      className="text-[11px] text-rose-500 hover:underline font-semibold"
                    >
                      বিষয় মুছে ফেলুন
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="নিচের বিষয় শর্টকাটে ক্লিক করুন অথবা নিজে লিখুন..."
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-teal-600 mb-2 font-medium"
                />

                {/* Subject Shortcut Chips */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                    বিষয় শর্টকাট (ক্লিক করে নির্বাচন বা বাতিল করুন):
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {SHORTCUT_SUBJECTS.map((sub) => {
                      const isSelected = formData.subject.split(',').map(s => s.trim()).includes(sub);
                      return (
                        <button
                          type="button"
                          key={sub}
                          onClick={() => handleToggleSubject(sub)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                            isSelected
                              ? 'bg-teal-600 text-white shadow-xs font-bold'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}{sub}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Assigned Teacher + Teacher Shortcuts */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  দায়িত্বপ্রাপ্ত শিক্ষক নির্বাচন *
                </label>

                {/* Teacher Shortcuts */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 mb-2">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    শিক্ষক শর্টকাট (এক ক্লিকে নির্বাচন):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SHORTCUT_TEACHERS.map((st) => {
                      const matchedTeacher = teachers.find((t) => t.name === st.name);
                      const isSelected = matchedTeacher && formData.teacherId === matchedTeacher.id;

                      return (
                        <button
                          type="button"
                          key={st.name}
                          onClick={() => handleSelectShortcutTeacher(st.name)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span>{st.name}</span>
                          {isSelected && <span className="text-white text-[10px]">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dropdown fallback */}
                <select
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-teal-600"
                >
                  <option value="">-- শিক্ষক বেছে নিন --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.designation || 'শিক্ষক'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Routine Time & Days */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    রুটিন সময়সূচি
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: সকাল ৮:০০ - ৯:৩০"
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    রুম নং
                  </label>
                  <input
                    type="text"
                    value={formData.roomNo}
                    onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-teal-600"
                  />
                </div>
              </div>

              {/* Days selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ক্লাসের দিনসমূহ
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableDays.map((day) => {
                    const isSelected = formData.scheduleDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleToggleDay(day)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Capacity & Fee */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    সর্বোচ্চ আসন
                  </label>
                  <input
                    type="number"
                    min="5"
                    value={formData.maxSeats}
                    onChange={(e) => setFormData({ ...formData, maxSeats: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    মাসিক ফি (টাকা) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.monthlyFee}
                    onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-teal-600 font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold rounded-xl shadow-md transition"
                >
                  {editingBatch ? 'সংরক্ষণ করুন' : 'ব্যাচ তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
