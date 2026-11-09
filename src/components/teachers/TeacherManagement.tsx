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
  Shield,
  ShieldCheck,
  KeyRound,
  Activity,
  Lock,
  Clock,
  Search,
  Award,
  LogIn,
  Filter,
} from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';
import { Teacher, TeacherRole } from '../../types';
import { toBn, formatTaka, formatBengaliDate } from '../../utils/bengaliUtils';
import {
  SHORTCUT_TEACHERS,
  SHORTCUT_SUBJECTS,
} from '../../constants/academicData';

export const TeacherManagement: React.FC = () => {
  const {
    teachers,
    batches,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    seedDefaultTeachers,
    clearAllTeachers,
    currentTeacher,
    loginTeacher,
    auditLogs,
  } = useCoaching();

  const [activeTab, setActiveTab] = useState<'teachers' | 'audit'>('teachers');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilterAction, setAuditFilterAction] = useState<string>('ALL');

  const [formData, setFormData] = useState({
    name: '',
    designation: 'শিক্ষক',
    role: 'শিক্ষক' as TeacherRole,
    pin: '1234',
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
      designation: 'শিক্ষক',
      role: 'শিক্ষক',
      pin: '1234',
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
      designation: teacher.designation || 'শিক্ষক',
      role: teacher.role || 'শিক্ষক',
      pin: teacher.pin || '1234',
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
      designation: preset.designation || 'শিক্ষক',
      subjects: preset.subjects,
      phone: preset.phone,
      qualification: preset.qualification,
      joiningDate: new Date().toISOString().slice(0, 10),
      salary: 20000,
      role: 'শিক্ষক',
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

        <div className="flex flex-wrap items-center gap-2.5">
          {teachers.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('আপনি কি নিশ্চিত যে সকল শিক্ষকের ডাটা মুছে ফেলতে চান?')) {
                  clearAllTeachers();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 text-xs font-bold transition cursor-pointer"
              title="সকল শিক্ষকের ডাটা ক্লিয়ার করুন"
            >
              <Trash2 className="w-4 h-4" />
              সব শিক্ষক ক্লিয়ার করুন
            </button>
          )}
          <button
            onClick={seedDefaultTeachers}
            title="সকল অফিশিয়াল শিক্ষক এক ক্লিকে লোড করুন"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 text-xs font-bold transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            সকল শিক্ষক লোড করুন
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            নতুন শিক্ষক যুক্ত করুন
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('teachers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer shrink-0 ${
            activeTab === 'teachers'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>শিক্ষক পরিষদ ({toBn(teachers.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer shrink-0 ${
            activeTab === 'audit'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>নিরাপত্তা ও অ্যাক্টিভিটি অডিট লগ ({toBn(auditLogs.length)})</span>
        </button>
      </div>

      {/* Tab 1: Teachers View */}
      {activeTab === 'teachers' && (
        <div className="space-y-6">
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

          {/* Teachers Grid or Empty State */}
          {teachers.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-10 text-center shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-3.5">
                <UserCheck className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                কোনো শিক্ষকের তথ্য নেই
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
                বর্তমানে কোনো শিক্ষকের ডাটা তালিকাভুক্ত নেই। নতুন শিক্ষক যুক্ত করতে নিচের বাটনে ক্লিক করুন অথবা উপরের শর্টকাট থেকে নির্বাচন করুন।
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleOpenAdd}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  নতুন শিক্ষক যুক্ত করুন
                </button>
                <button
                  onClick={seedDefaultTeachers}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  সকল শিক্ষক লোড করুন
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teachers.map((teacher) => {
                const taughtBatches = batches.filter((b) => b.teacherId === teacher.id);
                const isCurrent = currentTeacher?.id === teacher.id;

                return (
                  <div
                    key={teacher.id}
                    className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between ${
                      isCurrent
                        ? 'border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600'
                    }`}
                  >
                    <div>
                      {/* Active Status Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {teacher.designation || teacher.role || 'শিক্ষক'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            PIN: ••••
                          </span>
                        </div>

                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> সক্রিয় লগইন
                          </span>
                        ) : (
                          <button
                            onClick={() => loginTeacher(teacher.id, teacher.pin || '1234')}
                            title="এই শিক্ষকের আইডিতে দ্রুত সুইচ করুন"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold hover:bg-blue-100 border border-blue-200 dark:border-blue-800 transition cursor-pointer"
                          >
                            <LogIn className="w-3 h-3" /> লগইন করুন
                          </button>
                        )}
                      </div>

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
                          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(teacher.id, teacher.name)}
                          title="মুছে ফেলুন"
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
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
        </div>
      )}

      {/* Tab 2: Security & Teacher Activity Audit Log */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Security Banner */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-5 shadow-sm border border-emerald-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                <ShieldCheck className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  তথ্য নিরাপত্তা ও অটোমেটিক টিচার ডিটেকশন সিস্টেম
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 font-mono border border-emerald-400/30">
                    REAL-TIME ENCRYPTED LOG
                  </span>
                </h3>
                <p className="text-xs text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
                  সিস্টেমে যেকোনো শিক্ষক মার্কস আপলোড, নতুন ছাত্র ভর্তি, উপস্থিতি গ্রহণ অথবা ফি কালেকশন করলে স্বয়ংক্রিয়ভাবে শিক্ষকের নাম, পদবি এবং সময় টাইমস্ট্যাম্প সহ এখানে অডিট লগ হিসেবে স্থায়ীভাবে সংরক্ষিত হয়।
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/10 text-center">
                <div className="text-[10px] text-emerald-200 font-medium">মোট অ্যাক্টিভিটি</div>
                <div className="text-lg font-bold text-white">{toBn(auditLogs.length)}</div>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/10 text-center">
                <div className="text-[10px] text-emerald-200 font-medium">বর্তমান শিক্ষক</div>
                <div className="text-sm font-bold text-emerald-300 truncate max-w-[120px]">
                  {currentTeacher?.name || 'অজ্ঞাত'}
                </div>
              </div>
            </div>
          </div>

          {/* Audit Search and Filter Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="শিক্ষকের নাম, বিষয়ের নাম অথবা ছাত্রের নাম দিয়ে খুঁজুন..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-blue-600"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={auditFilterAction}
                onChange={(e) => setAuditFilterAction(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium focus:outline-blue-600"
              >
                <option value="ALL">সকল অ্যাকশন</option>
                <option value="EXAM_MARKS_UPDATE">পরীক্ষার মার্কস এন্ট্রি</option>
                <option value="STUDENT_ENROLL">শিক্ষার্থী ভর্তি</option>
                <option value="EXAM_CREATE">পরীক্ষা তৈরি</option>
                <option value="ATTENDANCE_SAVE">উপস্থিতি সংরক্ষণ</option>
                <option value="FEE_COLLECTION">ফি গ্রহণ</option>
                <option value="AUTH">লগইন ও নিরাপত্তা</option>
              </select>
            </div>
          </div>

          {/* Audit Logs Table */}
          {auditLogs.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-10 text-center shadow-xs">
              <Activity className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">এখনো কোনো অডিট লগ রেকর্ড হয়নি</h4>
              <p className="text-xs text-slate-400 mt-1">শিক্ষক লগইন করে মার্কস আপলোড বা তথ্য এন্ট্রি করলেই স্বয়ংক্রিয়ভাবে রেকর্ড প্রদর্শিত হবে।</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                      <th className="px-4 py-3">সময় ও তারিখ</th>
                      <th className="px-4 py-3">কর্মকর্তা / শিক্ষক</th>
                      <th className="px-4 py-3">অ্যাকশন ক্যাটাগরি</th>
                      <th className="px-4 py-3">বিস্তারিত বিবরণ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {auditLogs
                      .filter((log) => {
                        const matchesSearch =
                          !auditSearch ||
                          log.teacherName.toLowerCase().includes(auditSearch.toLowerCase()) ||
                          log.description.toLowerCase().includes(auditSearch.toLowerCase()) ||
                          (log.details && log.details.toLowerCase().includes(auditSearch.toLowerCase()));
                        const matchesFilter =
                          auditFilterAction === 'ALL' ||
                          (auditFilterAction === 'AUTH'
                            ? log.action.includes('LOGIN') || log.action.includes('LOCK')
                            : log.action.includes(auditFilterAction));
                        return matchesSearch && matchesFilter;
                      })
                      .map((log) => {
                        let badgeColor = 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
                        if (log.action.includes('EXAM_MARKS') || log.action.includes('INDIVIDUAL')) {
                          badgeColor = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
                        } else if (log.action.includes('STUDENT') || log.action.includes('ENROLL')) {
                          badgeColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
                        } else if (log.action.includes('FEE')) {
                          badgeColor = 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
                        } else if (log.action.includes('ATTENDANCE')) {
                          badgeColor = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
                        } else if (log.action.includes('LOCK') || log.action.includes('LOGIN')) {
                          badgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
                        }

                        return (
                          <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono text-[11px]">
                              {formatBengaliDate(log.timestamp)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                                  {log.teacherName.charAt(0)}
                                </span>
                                <span>{log.teacherName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-700 dark:text-slate-300">
                                {log.description}
                              </p>
                              {log.details && (
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                  {log.details}
                                </p>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

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
                    placeholder="যেমন: শিক্ষক"
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

              {/* Role & Login PIN for Security */}
              <div className="p-3.5 bg-blue-50/70 dark:bg-slate-800/80 rounded-xl border border-blue-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>নিরাপত্তা ও লগইন অ্যাক্সেস</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      দায়িত্ব / রোল
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as TeacherRole })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-blue-600 font-medium"
                    >
                      <option value="শিক্ষক">শিক্ষক</option>
                      <option value="সিনিয়র শিক্ষক">সিনিয়র শিক্ষক</option>
                      <option value="এডমিন">এডমিন</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      ৪-সংখ্যার সিকিউরিটি পিন (PIN) *
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      required
                      placeholder="যেমন: 1234"
                      value={formData.pin}
                      onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-blue-600 font-mono tracking-widest text-center"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  ডিফল্ট পিন: <strong className="font-mono text-blue-600 dark:text-blue-400">1234</strong>। এই পিন ব্যবহার করে শিক্ষক লগইন করতে পারবেন এবং তাঁর অধীনে সকল তথ্য ও মার্কস স্বয়ংক্রিয়ভাবে রেকর্ড হবে।
                </p>
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
