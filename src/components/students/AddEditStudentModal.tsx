import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';
import { Student, ClassGrade, BloodGroup } from '../../types';
import { ALL_CLASS_GRADES } from '../../constants/academicData';

interface AddEditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null;
  initialStudent?: Student | null;
}

export const AddEditStudentModal: React.FC<AddEditStudentModalProps> = ({
  isOpen,
  onClose,
  studentToEdit,
  initialStudent,
}) => {
  const { batches, addStudent, updateStudent, students } = useCoaching();
  const activeStudent = studentToEdit || initialStudent || null;

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
    if (activeStudent) {
      setFormData({
        roll: activeStudent.roll,
        nameBn: activeStudent.nameBn,
        nameEn: activeStudent.nameEn || '',
        classGrade: activeStudent.classGrade,
        batchId: activeStudent.batchId,
        fatherName: activeStudent.fatherName || '',
        motherName: activeStudent.motherName || '',
        phone: activeStudent.phone || '',
        guardianPhone: activeStudent.guardianPhone,
        schoolCollege: activeStudent.schoolCollege || '',
        address: activeStudent.address || 'গুলিয়াখালী, সীতাকুণ্ড, চট্টগ্রাম',
        bloodGroup: activeStudent.bloodGroup || 'জানা নেই',
        admissionDate: activeStudent.admissionDate || new Date().toISOString().slice(0, 10),
        monthlyFee: activeStudent.monthlyFee,
        status: activeStudent.status,
        gender: activeStudent.gender || 'ছাত্র',
      });
    } else {
      const nextRoll = students.length > 0 ? String(students.length + 101) : '১০১';
      setFormData({
        roll: nextRoll,
        nameBn: '',
        nameEn: '',
        classGrade: batches[0]?.classGrade || '১০ম',
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
  }, [activeStudent, isOpen, batches, students.length]);

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

    if (!formData.nameBn.trim()) {
      setError('অনুগ্রহ করে শিক্ষার্থীর নাম প্রদান করুন।');
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

    if (activeStudent) {
      updateStudent(activeStudent.id, formData);
    } else {
      addStudent(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-lg">
                {activeStudent ? 'শিক্ষার্থীর তথ্য পরিবর্তন' : 'নতুন শিক্ষার্থী ভর্তি ফরম'}
              </h3>
              <p className="text-xs text-emerald-100">
                এডুকেশন কেয়ার কোচিং সেন্টার, গুলিয়াখালী, সীতাকুণ্ড
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
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

        {/* Streamlined Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Basic Student Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                শিক্ষার্থীর নাম *
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="যেমন: মাহমুদুল হাসান সিয়াম"
                value={formData.nameBn}
                onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
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
                অভিভাবকের মোবাইল নম্বর *
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
                পিতার নাম (ঐচ্ছিক)
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
                স্কুল / কলেজ (ঐচ্ছিক)
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

          {/* Batch & Tuition Fee */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
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
                  শ্রেণি
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

              {activeStudent && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    স্ট্যাটাস
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'সক্রিয়' | 'নিষ্ক্রিয়' })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="সক্রিয়">সক্রিয়</option>
                    <option value="নিষ্ক্রিয়">নিষ্ক্রিয়</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {activeStudent ? 'পরিবর্তন সংরক্ষণ করুন' : 'ভর্তি সম্পন্ন করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
