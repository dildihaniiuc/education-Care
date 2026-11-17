import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Phone,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  KeyRound,
  Activity,
  Search,
  Filter,
} from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';
import { Teacher } from '../../types';
import { toBn, formatBengaliDate } from '../../utils/bengaliUtils';
import { SHORTCUT_TEACHERS } from '../../constants/academicData';
import { ChangePasskeyModal } from '../auth/ChangePasskeyModal';

export const TeacherManagement: React.FC = () => {
  const {
    teachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    seedDefaultTeachers,
    clearAllTeachers,
    currentTeacher,
    auditLogs,
  } = useCoaching();

  const [activeTab, setActiveTab] = useState<'teachers' | 'audit'>('teachers');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isChangePasskeyOpen, setIsChangePasskeyOpen] = useState(false);
  const [passkeyModalTab, setPasskeyModalTab] = useState<'passkey' | 'phone'>('passkey');
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilterAction, setAuditFilterAction] = useState<string>('ALL');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pin: '1234',
  });

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      phone: '',
      pin: '1234',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      phone: teacher.phone,
      pin: '',
    });
    setModalOpen(true);
  };

  const handleApplyTeacherShortcut = (preset: typeof SHORTCUT_TEACHERS[0]) => {
    setFormData((prev) => ({
      ...prev,
      name: preset.name,
      phone: preset.phone,
    }));
  };

  const handleDirectAddTeacher = (preset: typeof SHORTCUT_TEACHERS[0]) => {
    const exists = teachers.some((t) => t.name === preset.name);
    if (exists) return;

    addTeacher({
      name: preset.name,
      phone: preset.phone,
      pin: '1234',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingTeacher) {
      updateTeacher(editingTeacher.id, {
        name: formData.name.trim(),
      });
    } else {
      if (!formData.phone.trim()) return;
      addTeacher({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        pin: formData.pin.trim() || '1234',
      });
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`আপনি কি "${name}" শিক্ষকের নাম তালিকা থেকে মুছে ফেলতে চান?`)) {
      deleteTeacher(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[#0F3382] dark:text-blue-400" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              শিক্ষক পরিষদ
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            মোট শিক্ষক: <strong className="text-slate-800 dark:text-slate-200">{toBn(teachers.length)}</strong> জন
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
            >
              <Trash2 className="w-4 h-4" />
              সব ক্লিয়ার করুন
            </button>
          )}
          <button
            onClick={seedDefaultTeachers}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#DCEEFF] dark:bg-blue-950/60 text-[#0F3382] dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 text-xs font-bold transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            সকল শিক্ষক লোড করুন
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F3382] hover:bg-[#0B2666] text-white text-sm font-semibold shadow-xs transition cursor-pointer"
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
              ? 'bg-[#0F3382] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>শিক্ষক তালিকা ({toBn(teachers.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer shrink-0 ${
            activeTab === 'audit'
              ? 'bg-[#0F3382] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>অ্যাক্টিভিটি অডিট লগ ({toBn(auditLogs.length)})</span>
        </button>
      </div>

      {/* Tab 1: Teachers View (Name Only) */}
      {activeTab === 'teachers' && (
        <div className="space-y-6">
          {/* Official Teachers Shortcut Panel (Name Only) */}
          <div className="bg-[#DCEEFF]/50 dark:bg-slate-900 border border-blue-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0F3382] dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  দ্রুত শিক্ষক যুক্ত করুন
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {SHORTCUT_TEACHERS.map((preset) => {
                const isAdded = teachers.some((t) => t.name === preset.name);
                return (
                  <div
                    key={preset.name}
                    className={`p-3 rounded-xl border transition flex flex-col justify-between gap-2 ${
                      isAdded
                        ? 'bg-white dark:bg-slate-900 border-blue-300 dark:border-blue-800 shadow-xs'
                        : 'bg-white/70 dark:bg-slate-900/60 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {preset.name}
                      </span>
                      {isAdded && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3EA36B] shrink-0" />
                      )}
                    </div>

                    {isAdded ? (
                      <span className="text-[11px] font-semibold text-[#3EA36B]">যুক্ত আছে</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDirectAddTeacher(preset)}
                        className="w-full text-center text-[11px] font-bold bg-[#0F3382] hover:bg-[#0B2666] text-white rounded-lg py-1 transition cursor-pointer"
                      >
                        + যুক্ত করুন
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Teachers Grid (Strictly Name Only + Actions) */}
          {teachers.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-10 text-center shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-[#DCEEFF] dark:bg-blue-950/60 flex items-center justify-center text-[#0F3382] dark:text-blue-400 mx-auto mb-3.5">
                <UserCheck className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4">
                কোনো শিক্ষকের নাম তালিকাভুক্ত নেই
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleOpenAdd}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F3382] hover:bg-[#0B2666] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  নতুন শিক্ষক যুক্ত করুন
                </button>
                <button
                  onClick={seedDefaultTeachers}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#DCEEFF] dark:bg-blue-950/60 text-[#0F3382] dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  সকল শিক্ষক লোড করুন
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teachers.map((teacher) => {
                const isCurrent = currentTeacher?.id === teacher.id;

                return (
                  <div
                    key={teacher.id}
                    className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between gap-4 ${
                      isCurrent
                        ? 'border-[#3EA36B] ring-2 ring-[#3EA36B]/20'
                        : 'border-slate-200/80 dark:border-slate-800 hover:border-[#0F3382]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-[#0F3382] text-white font-bold flex items-center justify-center text-lg shadow-xs shrink-0">
                          {teacher.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">
                            {teacher.name}
                          </h3>
                          {isCurrent && (
                            <span className="inline-block text-[10px] font-bold text-[#3EA36B] mt-0.5">
                              বর্তমান লগইনকৃত
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEdit(teacher)}
                          title="নাম পরিবর্তন"
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

                    {isCurrent && (
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPasskeyModalTab('passkey');
                            setIsChangePasskeyOpen(true);
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-[#DCEEFF] dark:bg-blue-950/60 text-[#0F3382] dark:text-blue-300 text-xs font-bold hover:bg-blue-100 transition cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5" /> পাস কী বদলান
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPasskeyModalTab('phone');
                            setIsChangePasskeyOpen(true);
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#3EA36B] dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" /> ফোন বদলান
                        </button>
                      </div>
                    )}
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
          <div className="bg-[#0F3382] text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                <ShieldCheck className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  অ্যাক্টিভিটি অডিট লগ
                </h3>
                <p className="text-xs text-blue-100 mt-1 max-w-2xl leading-relaxed">
                  ফি আদায়, খরচ, মার্কস এন্ট্রি এবং হাজিরার সকল কার্যক্রম শিক্ষকের নাম ও সময়সহ স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়।
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/10 text-center">
                <div className="text-[10px] text-blue-200 font-medium">মোট অ্যাক্টিভিটি</div>
                <div className="text-lg font-bold text-white">{toBn(auditLogs.length)}</div>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/10 text-center">
                <div className="text-[10px] text-blue-200 font-medium">বর্তমান শিক্ষক</div>
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
                placeholder="শিক্ষকের নাম, বিবরণ বা ছাত্রের নাম দিয়ে খুঁজুন..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-[#0F3382]"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={auditFilterAction}
                onChange={(e) => setAuditFilterAction(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium focus:outline-[#0F3382]"
              >
                <option value="ALL">সকল অ্যাকশন</option>
                <option value="fee">ফি ও ব্যয় হিসাব</option>
                <option value="exam">পরীক্ষার মার্কস এন্ট্রি</option>
                <option value="student">শিক্ষার্থী ভর্তি ও তথ্য</option>
                <option value="attendance">উপস্থিতি সংরক্ষণ</option>
                <option value="batch">ব্যাচ ব্যবস্থাপনা</option>
                <option value="security">লগইন ও নিরাপত্তা</option>
              </select>
            </div>
          </div>

          {/* Audit Logs Table */}
          {auditLogs.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-10 text-center shadow-xs">
              <Activity className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">এখনো কোনো অডিট লগ রেকর্ড হয়নি</h4>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                      <th className="px-4 py-3">সময় ও তারিখ</th>
                      <th className="px-4 py-3">শিক্ষক</th>
                      <th className="px-4 py-3">অ্যাকশন ক্যাটাগরি</th>
                      <th className="px-4 py-3">বিস্তারিত বিবরণ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {auditLogs
                      .filter((log) => {
                        const searchLower = auditSearch.toLowerCase();
                        const matchesSearch =
                          !auditSearch ||
                          (log.teacherName || '').toLowerCase().includes(searchLower) ||
                          (log.action || '').toLowerCase().includes(searchLower) ||
                          (log.target || '').toLowerCase().includes(searchLower);
                        const matchesFilter =
                          auditFilterAction === 'ALL' || log.category === auditFilterAction;
                        return matchesSearch && matchesFilter;
                      })
                      .map((log) => {
                        let badgeColor = 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
                        if (log.category === 'exam') {
                          badgeColor = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
                        } else if (log.category === 'student') {
                          badgeColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
                        } else if (log.category === 'fee') {
                          badgeColor = 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
                        } else if (log.category === 'attendance') {
                          badgeColor = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
                        } else if (log.category === 'security') {
                          badgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
                        }

                        return (
                          <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono text-[11px]">
                              {formatBengaliDate(log.timestamp)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-md bg-[#0F3382] text-white flex items-center justify-center text-[10px] font-bold">
                                  {(log.teacherName || 'শ').charAt(0)}
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
                                {log.target || '—'}
                              </p>
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

      {/* Add/Edit Teacher Modal (Name only on Edit, Name + Phone + Passkey on Add) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="bg-[#0F3382] px-6 py-4 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold text-lg">
                {editingTeacher ? 'শিক্ষকের নাম পরিবর্তন' : 'নতুন শিক্ষক যুক্ত করুন'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!editingTeacher && (
                <div className="p-3 bg-[#DCEEFF]/50 dark:bg-slate-800/60 rounded-xl border border-blue-200 dark:border-slate-700">
                  <div className="text-[11px] font-bold text-[#0F3382] dark:text-blue-300 mb-2 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    দ্রুত নাম নির্বাচন করুন:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SHORTCUT_TEACHERS.map((st) => (
                      <button
                        type="button"
                        key={st.name}
                        onClick={() => handleApplyTeacherShortcut(st)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border cursor-pointer ${
                          formData.name === st.name
                            ? 'bg-[#0F3382] text-white border-[#0F3382]'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-blue-50'
                        }`}
                      >
                        {st.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  শিক্ষকের নাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: দিল দিহান"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-[#0F3382] font-medium"
                />
              </div>

              {!editingTeacher && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      লগইন মোবাইল নম্বর *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="01812-345678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-[#0F3382] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      প্রাথমিক পাস কী *
                    </label>
                    <input
                      type="password"
                      maxLength={8}
                      required
                      placeholder="যেমন: 1234"
                      value={formData.pin}
                      onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-[#0F3382] font-mono tracking-widest text-center"
                    />
                  </div>
                </>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0F3382] hover:bg-[#0B2666] text-white font-semibold text-sm rounded-xl shadow-xs transition cursor-pointer"
                >
                  {editingTeacher ? 'সংরক্ষণ করুন' : 'যুক্ত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Passkey & Phone Modal */}
      <ChangePasskeyModal
        isOpen={isChangePasskeyOpen}
        onClose={() => setIsChangePasskeyOpen(false)}
        defaultTab={passkeyModalTab}
      />
    </div>
  );
};
