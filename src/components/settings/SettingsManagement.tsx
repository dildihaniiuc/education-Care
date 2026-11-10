import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Download,
  Upload,
  Building,
  CheckCircle2,
  AlertTriangle,
  Moon,
  Sun,
  Trash2,
  Database,
  FileSpreadsheet,
  Archive,
  KeyRound,
} from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';
import { InstituteSettings } from '../../types';
import { ChangePasskeyModal } from '../auth/ChangePasskeyModal';

export const SettingsManagement: React.FC = () => {
  const {
    settings,
    updateSettings,
    clearAllData,
    exportDatabase,
    exportCsvReport,
    exportZipArchive,
    importDatabase,
    darkMode,
    toggleDarkMode,
    students,
    batches,
    feePayments,
    teachers,
    currentTeacher,
  } = useCoaching();

  const [formData, setFormData] = useState<InstituteSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);
  const [isChangePasskeyOpen, setIsChangePasskeyOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Handle Restore
  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], 'UTF-8');
      fileReader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const success = importDatabase(content);
          if (success) {
            alert('ব্যাকআপ ফাইল সফলভাবে রিস্টোর হয়েছে!');
          } else {
            alert('ত্রুটি: ব্যাকআপ ফাইলের ফরম্যাট সঠিক নয়।');
          }
        } catch {
          alert('ফাইল পড়তে ত্রুটি হয়েছে।');
        }
      };
    }
  };

  const handleClearAllData = () => {
    if (
      window.confirm(
        'সতর্কতা: আপনি কি নিশ্চিতভাবে সমস্ত শিক্ষার্থী, ব্যাচ, হাজিরা ও ফি রেকর্ড মুছে সম্পূর্ণ খালি খাতা হিসেবে শুরু করতে চান?'
      )
    ) {
      clearAllData();
      setClearSuccess(true);
      setTimeout(() => setClearSuccess(false), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-slate-700 dark:text-slate-200" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">প্রতিষ্ঠানের সেটিংস ও ব্যাকআপ</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            কোচিং সেন্টারের নাম, ঠিকানা, রশিদ প্রিন্টিং তথ্য, থিম এবং ডেটা ব্যাকআপ ও রিস্টোর।
          </p>
        </div>

        {/* Quick Theme Switch */}
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          <span>{darkMode ? 'লাইট মোডে যান' : 'ডার্ক মোড চালু করুন'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          প্রতিষ্ঠানের তথ্য সফলভাবে আপডেট ও সংরক্ষিত হয়েছে!
        </div>
      )}

      {clearSuccess && (
        <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          সকল ডেটা সম্পূর্ণ খালি করা হয়েছে। খাতা নতুনভাবে শুরু করার জন্য প্রস্তুত!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            প্রতিষ্ঠানের মৌলিক তথ্য (আইডি কার্ড ও রসিদে প্রদর্শিত)
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                প্রতিষ্ঠানের নাম *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-emerald-600 font-bold text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  উপ-শিরোনাম / ট্যাগলাইন
                </label>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-emerald-600 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  স্থাপিত সাল
                </label>
                <input
                  type="text"
                  value={formData.establishedYear || ''}
                  onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-emerald-600 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ঠিকানা *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-emerald-600 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  থানা ও জেলা *
                </label>
                <input
                  type="text"
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-emerald-600 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  প্রধান মোবাইল নম্বর *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-emerald-600 font-mono text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  বিকল্প যোগাযোগ নম্বর
                </label>
                <input
                  type="tel"
                  value={formData.altPhone || ''}
                  onChange={(e) => setFormData({ ...formData, altPhone: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-emerald-600 font-mono text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  অফিসিয়াল ইমেইল
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-emerald-600 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  প্রধান সমন্বয়কারী / শিক্ষক প্রতিনিধি
                </label>
                <input
                  type="text"
                  value={formData.directorName || ''}
                  onChange={(e) => setFormData({ ...formData, directorName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-emerald-600 font-medium text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                প্রতিষ্ঠানের মূল বাণী / স্লোগান
              </label>
              <input
                type="text"
                value={formData.motto || ''}
                onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-emerald-600 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-md transition"
              >
                <Save className="w-4 h-4" />
                তথ্য সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </div>

        {/* Data Persistence & Export Card (1 col) */}
        <div className="space-y-4">
          {/* Theme Display Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              {darkMode ? <Moon className="w-4 h-4 text-emerald-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              অ্যাপ থিম সেটিংস
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              অফিসিয়াল কাজের জন্য চোখ স্বস্তিদায়ক ডার্ক মোড অথবা ঝকঝকে লাইট মোড বেছে নিন।
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => !darkMode && null}
                disabled={!darkMode}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border ${
                  !darkMode
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
                onClickCapture={() => darkMode && toggleDarkMode()}
              >
                <Sun className="w-3.5 h-3.5" />
                লাইট মোড
              </button>

              <button
                type="button"
                onClick={() => darkMode && null}
                disabled={darkMode}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border ${
                  darkMode
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
                onClickCapture={() => !darkMode && toggleDarkMode()}
              >
                <Moon className="w-3.5 h-3.5" />
                ডার্ক মোড
              </button>
            </div>
          </div>

          {/* Multi-Format Data Backup Center */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Download className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                মাল্টি-ফরম্যাট ডেটা ব্যাকআপ ও ডাউনলোড
              </h3>
              <span className="text-[10px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                ৩টি ফরম্যাট উপলব্ধ
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              কোনো তথ্য যেন কখনো না হারায়, সেজন্য সম্পূর্ণ ডেটাবেস JSON, এক্সেল শিট (CSV) এবং অল-ইন-ওয়ান ZIP প্যাকেজে সংরক্ষণ করুন।
            </p>

            <div className="space-y-2">
              {/* 1. All-in-One ZIP Archive */}
              <button
                onClick={exportZipArchive}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                title="সকল ডেটাবেস ও রিপোর্ট একসাথে জিপ ফাইল হিসেবে ডাউনলোড করুন"
              >
                <div className="flex items-center gap-2">
                  <Archive className="w-4 h-4 text-teal-200" />
                  <span className="text-left">
                    <span className="block text-white leading-tight">অল-ইন-ওয়ান জিপ প্যাকেজ (ZIP)</span>
                    <span className="text-[10px] text-teal-100 font-normal">JSON + সকল CSV + অডিট লগ</span>
                  </span>
                </div>
                <Download className="w-4 h-4 shrink-0" />
              </button>

              {/* 2. Full JSON Database Dump */}
              <button
                onClick={exportDatabase}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer border border-slate-200/80 dark:border-slate-700"
                title="সম্পূর্ণ ডেটাবেস ব্যাকআপ ডাউনলোড করুন"
              >
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span>সম্পূর্ণ ডাটাবেস ব্যাকআপ (JSON)</span>
                </div>
                <Download className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* 3. Excel-compatible CSV Reports */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-2">
                  এক্সেল উপযোগী সিএসভি (CSV) রিপোর্ট ডাউনলোড:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => exportCsvReport('students')}
                    className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>শিক্ষার্থী তালিকা (CSV)</span>
                  </button>

                  <button
                    onClick={() => exportCsvReport('fees')}
                    className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
                    <span>ফি আদায় খাতা (CSV)</span>
                  </button>

                  <button
                    onClick={() => exportCsvReport('expenses')}
                    className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-rose-600" />
                    <span>খরচ রিপোর্ট (CSV)</span>
                  </button>

                  <button
                    onClick={() => exportCsvReport('exams')}
                    className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                    <span>পরীক্ষার রেজাল্ট (CSV)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Restore from JSON */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                পূর্বে সেভ করা ব্যাকআপ থেকে রিস্টোর
              </label>
              <label className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs cursor-pointer transition">
                <Upload className="w-4 h-4" />
                ফাইল নির্বাচন করুন (JSON)
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Teacher Passkey & Security Settings */}
          {currentTeacher && (
            <div className="bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-blue-900/60 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  ব্যক্তিগত পাস কী পরিবর্তন
                </h4>
                <span className="text-[10px] bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                  {currentTeacher.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                আপনার অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করতে নিয়মিত পাস কী পরিবর্তন করুন। পরিবর্তিত পাস কী সরাসরি ক্লাউড ডাটাবেসে সেভ হবে।
              </p>
              <button
                type="button"
                onClick={() => setIsChangePasskeyOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow-2xs"
              >
                <KeyRound className="w-3.5 h-3.5" />
                আমার পাস কী পরিবর্তন করুন
              </button>
            </div>
          )}

          {/* Blank Slate Reset (Clear Data) */}
          <div className="bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/60 rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-rose-800 dark:text-rose-400 flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              সকল ডেটা খালি করুন (খাতার শূন্য রূপ)
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              অফিসিয়াল ব্যবহারের জন্য পূর্বের কোনো তথ্য থাকলে মুছে একদম নতুন ও ফাঁকা ডিজিটাল খাতা তৈরি করতে নিচের বাটনটি চাপুন।
            </p>
            <button
              onClick={handleClearAllData}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 font-bold text-xs transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              সকল ডেটা খালি করুন
            </button>
          </div>

          {/* About App */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
            <div className="font-bold text-slate-800 dark:text-slate-200">এডুকেশন কেয়ার কোচিং সেন্টার</div>
            <div>অফিসিয়াল ডিজিটাল খাতা ম্যানেজমেন্ট সিস্টেম</div>
            <div>গুলিয়াখালী, সীতাকুণ্ড, চট্টগ্রাম</div>
          </div>
        </div>
      </div>

      {/* Change Passkey Modal */}
      <ChangePasskeyModal
        isOpen={isChangePasskeyOpen}
        onClose={() => setIsChangePasskeyOpen(false)}
      />
    </div>
  );
};
