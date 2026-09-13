import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';
import { Student, ClassGrade, BloodGroup } from '../../types';
import { toBn } from '../../utils/bengaliUtils';
import { ALL_CLASS_GRADES } from '../../constants/academicData';

interface AddEditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null;
}

const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'জানা নেই'];

export const AddEditStudentModal: React.FC<AddEditStudentModalProps> = ({
  isOpen,
  onClose,
  studentToEdit,
}) => {
  const { batches, addStudent, updateStudent, students } = useCoaching();

  const [formData, setFormData] = useState({
    roll: '',
    nameBn: '',
    nameEn: '',
    classGrade: '১০ম' as ClassGrade,
    batchId: '',
    fatherName: '',
    motherName: '',
    phone: '',
    guardianPhone: '',
    schoolCollege: '',
    address: 'গুলিয়াখালী, সীতাকুণ্ড, চট্টগ্রাম',
    bloodGroup: 'জানা নেই' as BloodGroup,
    admissionDate: new Date().toISOString().slice(0, 10),
    monthlyFee: 1500,
    status: 'সক্রিয়' as 'সক্রিয়' | 'নিষ্ক্রিয়',
    gender: 'ছাত্র' as 'ছাত্র' | 'ছাত্রী',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        roll: studentToEdit.roll,
        nameBn: studentToEdit.nameBn,
        nameEn: studentToEdit.nameEn || '',
        classGrade: studentToEdit.classGrade,
        batchId: studentToEdit.batchId,
        fatherName: studentToEdit.fatherName,
        motherName: studentToEdit.motherName || '',
        phone: studentToEdit.phone,
        guardianPhone: studentToEdit.guardianPhone,
        schoolCollege: studentToEdit.schoolCollege,
        address: studentToEdit.address,
        bloodGroup: studentToEdit.bloodGroup,
        admissionDate: studentToEdit.admissionDate,
        monthlyFee: studentToEdit.monthlyFee,
        status: studentToEdit.status,
        gender: studentToEdit.gender,
      });
    } else {
      // Auto-suggest next roll
      const nextRoll = students.length > 0 ? String(students.length + 101) : '১০১';
      setFormData({
        roll: nextRoll,
        nameBn: '',
        nameEn: '',
        classGrade: '১০ম',
        batchId: batches[0]?.id || '',
        fatherName: '',
        motherName: '',
        phone: '',
        guardianPhone: '',
        schoolCollege: '',
        address: 'গুলিয়াখালী, সীতাকুণ্ড, চট্টগ্রাম',
        bloodGroup: 'জানা নেই',
        admissionDate: new Date().toISOString().slice(0, 10),
        monthlyFee: batches[0]?.monthlyFee || 1500,
        status: 'সক্রিয়',
        gender: 'ছাত্র',
      });
    }
    setError('');
  }, [studentToEdit, isOpen, batches, students.length]);

  if (!isOpen) return null;

  const handleBatchChange = (selectedBatchId: string) => {
    const selected = batches.find((b) => b.id === selectedBatchId);
    if (selected) {
      setFormData({
        ...formData,
        batchId: selected.id,
        classGrade: selected.classGrade,
        monthlyFee: selected.monthlyFee,
      });
    } else {
      setFormData({
        ...formData,
        batchId: selectedBatchId,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.nameBn.trim()) {
      setError('অনুগ্রহ করে শিক্ষার্থীর নাম (বাংলায়) প্রদান করুন।');
      return;
    }
    if (!formData.roll.trim()) {
      setError('অনুগ্রহ করে রোল নম্বর প্রদান করুন।');
      return;
    }
    if (!formData.guardianPhone.trim()) {
      setError('অনুগ্রহ করে অভিভাবকের মোবাইল নম্বর প্রদান করুন।');
      return;
    }
    if (!formData.batchId) {
      setError('অনুগ্রহ করে একটি ব্যাচ নির্ধারণ করুন।');
      return;
    }

    if (studentToEdit) {
      updateStudent(studentToEdit.id, formData);
    } else {
      addStudent(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-lg">
                {studentToEdit ? 'শিক্ষার্থীর তথ্য পরিবর্তন' : 'নতুন শিক্ষার্থী ভর্তি ফরম'}
              </h3>
              <p className="text-xs text-emerald-100">
                এডুকেশন কেয়ার কোচিং সেন্টার, গুলিয়াখালী, সীতাকুণ্ড
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/60 border-b border-rose-200 dark:border-rose-900 px-6 py-2.5 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Section 1: Basic Info */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              ১. ব্যক্তিগত তথ্য
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  শিক্ষার্থীর নাম (বাংলায়) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মাহমুদুল হাসান সিয়াম"
                  value={formData.nameBn}
                  onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  শিক্ষার্থীর নাম (ইংরেজিতে)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mahmudul Hasan Siam"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  রোল নম্বর *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ১০১"
                  value={formData.roll}
                  onChange={(e) => setFormData({ ...formData, roll: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  লিঙ্গ
                </label>
                <div className="flex gap-4 pt-1.5">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={formData.gender === 'ছাত্র'}
                      onChange={() => setFormData({ ...formData, gender: 'ছাত্র' })}
                      className="text-emerald-600"
                    />
                    ছাত্র
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={formData.gender === 'ছাত্রী'}
                      onChange={() => setFormData({ ...formData, gender: 'ছাত্রী' })}
                      className="text-emerald-600"
                    />
                    ছাত্রী
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  পিতার নাম
                </label>
                <input
                  type="text"
                  placeholder="পিতার নাম"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  মাতার নাম
                </label>
                <input
                  type="text"
                  placeholder="মাতার নাম"
                  value={formData.motherName}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  রক্তের গ্রুপ
                </label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as BloodGroup })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                >
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  বর্তমান স্কুল / কলেজ
                </label>
                <input
                  type="text"
                  placeholder="যেমন: সীতাকুণ্ড সরকারি উচ্চ বিদ্যালয়"
                  value={formData.schoolCollege}
                  onChange={(e) => setFormData({ ...formData, schoolCollege: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Info */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              ২. যোগাযোগ ও ঠিকানা
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  অভিভাবকের মোবাইল নম্বর * (এসএমএস যাবে)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="০১৮১২-৩৪৫৬৭৮"
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  শিক্ষার্থীর মোবাইল নম্বর (যদি থাকে)
                </label>
                <input
                  type="tel"
                  placeholder="০১৭১১-০০১১২২"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ঠিকানা
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Coaching Academic & Fee */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              ৩. কোচিং অ্যাকাডেমিক ও ফি নির্ধারণ
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  নির্ধারিত ব্যাচ *
                </label>
                <select
                  value={formData.batchId}
                  onChange={(e) => handleBatchChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="">-- ব্যাচ নির্বাচন করুন --</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name} ({batch.classGrade})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  শ্রেণি (১ম থেকে ১২শ)
                </label>
                <select
                  value={formData.classGrade}
                  onChange={(e) => setFormData({ ...formData, classGrade: e.target.value as ClassGrade })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                >
                  {ALL_CLASS_GRADES.map((cg) => (
                    <option key={cg} value={cg}>
                      {cg} শ্রেণি
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  মাসিক টিউশন ফি (টাকা)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.monthlyFee}
                  onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ভর্তির তারিখ
                </label>
                <input
                  type="date"
                  value={formData.admissionDate}
                  onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  শিক্ষার্থীর স্ট্যাটাস
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'সক্রিয়' | 'নিষ্ক্রিয়' })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="সক্রিয়">সক্রিয় (Active)</option>
                  <option value="নিষ্ক্রিয়">নিষ্ক্রিয় (Inactive)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-md transition"
            >
              <Save className="w-4 h-4" />
              {studentToEdit ? 'পরিবর্তন সংরক্ষণ করুন' : 'ভর্তি সম্পন্ন করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
