import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  Layers,
  Edit,
  Trash2,
  X,
  CreditCard,
  CheckCircle2,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';
import { Teacher } from '../../types';
import { toBn, formatTaka } from '../../utils/bengaliUtils';
import {
  SHORTCUT_TEACHERS,
  SHORTCUT_SUBJECTS,
} from '../../constants/academicData';

export const TeacherManagement: React.FC = () => {
  const { teachers, batches, addTeacher, updateTeacher, deleteTeacher, seedDefaultTeachers } =
    useCoaching();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    designation: 'সহকারী শিক্ষক',
    subjects: 'গনিত, বিজ্ঞান',
    phone: '',
    email: '',
    qualification: '',
    joiningDate: new Date().toISOString().slice(0, 10),
    salary: 20000,
    bio: '',
  });

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      designation: 'সহকারী শিক্ষক',
      subjects: '',
      phone: '',
      email: '',
      qualification: '',
      joiningDate: new Date().toISOString().slice(0, 10),
      salary: 20000,
      bio: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      designation: teacher.designation,
      subjects: teacher.subjects.join(', '),
      phone: teacher.phone,
      email: teacher.email || '',
      qualification: teacher.qualification,
      joiningDate: teacher.joiningDate,
      salary: teacher.salary,
      bio: teacher.bio || '',
    });
    setModalOpen(true);
  };

  // Quick select teacher shortcut to auto-fill form
  const handleApplyTeacherShortcut = (preset: typeof SHORTCUT_TEACHERS[0]) => {
    setFormData((prev) => ({
      ...prev,
      name: preset.name,
      designation: preset.designation,
      qualification: preset.qualification,
      subjects: preset.subjects.join(', '),
      phone: preset.phone,
    }));
  };

  // 1-Click direct add teacher from shortcut card if missing
  const handleDirectAddTeacher = (preset: typeof SHORTCUT_TEACHERS[0]) => {
    const exists = teachers.some((t) => t.name === preset.name);
    if (exists) return;

    addTeacher({
      name: preset.name,
      designation: preset.designation,
      subjects: preset.subjects,
      phone: preset.phone,
      qualification: preset.qualification,
      joiningDate: new Date().toISOString().slice(0, 10),
      salary: 20000,
      bio: '',
    });
  };

  // Toggle subject shortcut chip in modal
  const handleToggleSubjectChip = (sub: string) => {
    const currentSubs = formData.subjects
      ? formData.subjects.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    if (currentSubs.includes(sub)) {
      const remaining = currentSubs.filter((s) => s !== sub);
      setFormData({ ...formData, subjects: remaining.join(', ') });
    } else {
      const updated = [...currentSubs, sub];
      setFormData({ ...formData, subjects: updated.join(', ') });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const subjectsArray = formData.subjects
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingTeacher) {
      updateTeacher(editingTeacher.id, {
        ...formData,
        subjects: subjectsArray,
      });
    } else {
      addTeacher({
        ...formData,
        subjects: subjectsArray,
      });
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`আপনি কি "${name}" শিক্ষকের তথ্য মুছে ফেলতে চান?`)) {
      deleteTeacher(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              শিক্ষক ও কর্মকর্তা পরিষদ
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            মোট শিক্ষক: <strong className="text-slate-800 dark:text-slate-200">{toBn(teachers.length)}</strong> জন • নাম টাইপ না করে নিচের শর্টকাট থেকে নির্বাচন করুন
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={seedDefaultTeachers}
            title="৫ জন অফিশিয়াল শিক্ষক এক ক্লিকে লোড করুন"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 text-xs font-bold transition"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            ৫ জন শিক্ষক লোড করুন
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            নতুন শিক্ষক যুক্ত করুন
          </button>
        </div>
      </div>

      {/* Official Teachers Shortcut Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800/80 border border-blue-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              অফিশিয়াল শিক্ষক শর্টকাট (১-ক্লিক সংযোগ)
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            নাম আলাদাভাবে লিখার প্রয়োজন নেই, সরাসরি ক্লিক করুন
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {SHORTCUT_TEACHERS.map((preset) => {
            const isAdded = teachers.some((t) => t.name === preset.name);
            return (
              <div
                key={preset.name}
                className={`p-3 rounded-xl border transition flex flex-col justify-between ${
                  isAdded
                    ? 'bg-white dark:bg-slate-900 border-blue-300 dark:border-blue-800 shadow-xs'
                    : 'bg-white/70 dark:bg-slate-900/60 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {preset.name}
                    </span>
                    {isAdded ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> যুক্ত
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">অনুপস্থিত</span>
                    )}
                  </div>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                    {preset.designation}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {preset.subjects.join(', ')}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {isAdded ? (
                    <button
                      onClick={() => {
                        const existing = teachers.find((t) => t.name === preset.name);
                        if (existing) handleOpenEdit(existing);
                      }}
                      className="w-full text-center text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline py-0.5"
                    >
                      তথ্য দেখুন / এডিট
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDirectAddTeacher(preset)}
                      className="w-full text-center text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-1 transition"
                    >
                      + ১ ক্লিকে যুক্ত করুন
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((teacher) => {
          const taughtBatches = batches.filter((b) => b.teacherId === teacher.id);

          return (
            <div
              key={teacher.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-600 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-sm shrink-0">
                    {teacher.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug">
                      {teacher.name}
                    </h3>
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mt-0.5">
                      {teacher.designation}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{teacher.qualification}</p>
                  </div>
                </div>

                {/* Subjects Badges */}
                <div className="my-3">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block mb-1">
                    পাঠদানের বিষয়সমূহ:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {teacher.subjects.map((sub, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-medium text-xs border border-blue-100 dark:border-blue-800"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact & Batches */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <a href={`tel:${teacher.phone}`} className="font-mono hover:underline">
                      {teacher.phone}
                    </a>
                  </div>

                  {teacher.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{teacher.email}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      নির্ধারিত ব্যাচ:{' '}
                      <strong className="text-slate-800 dark:text-slate-200">{toBn(taughtBatches.length)} টি</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      মাসিক সম্মানী:{' '}
                      <strong className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                        {formatTaka(teacher.salary)}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  যোগদান: {toBn(teacher.joiningDate)}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(teacher)}
                    title="শিক্ষকের তথ্য পরিবর্তন"
                    className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(teacher.id, teacher.name)}
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

      {/* Add/Edit Teacher Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-lg">
                  {editingTeacher ? 'শিক্ষকের তথ্য পরিবর্তন' : 'নতুন শিক্ষক নিবন্ধন'}
                </h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  শর্টকাট থেকে বেছে নিন অথবা বিস্তারিত তথ্য প্রদান করুন
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
              {/* Teacher Shortcut Selector inside Modal */}
              <div className="p-3 bg-blue-50 dark:bg-slate-800/60 rounded-xl border border-blue-200 dark:border-slate-700">
                <div className="text-[11px] font-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  শিক্ষক শর্টকাট (ক্লিক করে স্বয়ংক্রিয় পূরণ করুন):
                </div>
                <div className="flex flex-wrap gap-2">
                  {SHORTCUT_TEACHERS.map((st) => (
                    <button
                      type="button"
                      key={st.name}
                      onClick={() => handleApplyTeacherShortcut(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                        formData.name === st.name
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-blue-50'
                      }`}
                    >
                      {st.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  শিক্ষকের নাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: দিল দিহান / আশরাফুল আলম"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-blue-600 font-medium"
                />
              </div>

              {/* Designation & Qualification */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    পদবি
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: সহকারী শিক্ষক"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    শিক্ষাগত যোগ্যতা
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: বি.এসসি / এম.এসসি"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-blue-600"
                  />
                </div>
              </div>

              {/* Subjects & Subject Shortcuts */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    পাঠদানের বিষয়সমূহ *
                  </label>
                  {formData.subjects && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, subjects: '' })}
                      className="text-[11px] text-rose-500 hover:underline font-semibold"
                    >
                      মুছে ফেলুন
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder="নিচের বিষয় শর্টকাটে ক্লিক করে নির্বাচন করুন..."
                  value={formData.subjects}
                  onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-blue-600 mb-2 font-medium"
                />

                {/* Subject Shortcut Chips */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    বিষয় শর্টকাট (ক্লিক করে যুক্ত/বাতিল করুন):
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {SHORTCUT_SUBJECTS.map((sub) => {
                      const isSelected = formData.subjects.split(',').map(s => s.trim()).includes(sub);
                      return (
                        <button
                          type="button"
                          key={sub}
                          onClick={() => handleToggleSubjectChip(sub)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs font-bold'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-blue-50'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}{sub}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    মোবাইল নম্বর *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="০১৭১১-২২৩৩৪৪"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-blue-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ইমেইল (ঐচ্ছিক)
                  </label>
                  <input
                    type="email"
                    placeholder="teacher@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-blue-600"
                  />
                </div>
              </div>

              {/* Salary & Joining Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    মাসিক সম্মানী (টাকা)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-blue-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    যোগদানের তারিখ
                  </label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-blue-600"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl shadow-md transition"
                >
                  {editingTeacher ? 'সংরক্ষণ করুন' : 'নিবন্ধন সম্পন্ন করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
