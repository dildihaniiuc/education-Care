import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  LogIn,
  KeyRound,
  Phone,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  BookOpen,
  Award,
  Users,
  Calendar,
  CreditCard,
  Download,
  HelpCircle,
  Sparkles,
  ArrowRight,
  MapPin,
  Mail,
  Moon,
  Sun,
} from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';
import { toBn } from '../../utils/bengaliUtils';

interface LandingPageProps {
  onSuccessLogin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSuccessLogin }) => {
  const {
    settings,
    teachers,
    loginWithPhoneAndPasskey,
    darkMode,
    toggleDarkMode,
  } = useCoaching();

  const [phone, setPhone] = useState('');
  const [passkey, setPasskey] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTeacherGuide, setShowTeacherGuide] = useState(false);

  // Pre-configured staff credentials list for reference
  const teacherCredentials = [
    {
      name: 'দিল দিহান',
      designation: 'শিক্ষক',
      subjects: 'গনিত, উচ্চতর গনিত, আইসিটি',
      phone: '01812-345678',
      rawPhone: '01812345678',
      passkey: '1122',
      color: 'from-blue-600 to-indigo-700',
    },
    {
      name: 'মো রিয়াজ',
      designation: 'শিক্ষক',
      subjects: 'গনিত, বিজ্ঞান, বাংলা',
      phone: '01755-667788',
      rawPhone: '01755667788',
      passkey: '2233',
      color: 'from-teal-600 to-emerald-700',
    },
    {
      name: 'আশরাফুল আলম',
      designation: 'শিক্ষক',
      subjects: 'ইংরেজি -১ম, ইংরেজি -২য়',
      phone: '01722-334455',
      rawPhone: '01722334455',
      passkey: '3344',
      color: 'from-purple-600 to-indigo-700',
    },
    {
      name: 'আশরাফ উদ্দীন',
      designation: 'শিক্ষক',
      subjects: 'পদার্থ বিজ্ঞান, রসায়ন',
      phone: '01933-445566',
      rawPhone: '01933445566',
      passkey: '4455',
      color: 'from-amber-600 to-orange-700',
    },
    {
      name: 'মাইনুল ইসলাম',
      designation: 'শিক্ষক',
      subjects: 'বাংলাদেশ ও বিশ্ব পরিচয়, বাংলা',
      phone: '01644-556677',
      rawPhone: '01644556677',
      passkey: '5566',
      color: 'from-rose-600 to-pink-700',
    },
  ];

  const handleQuickSelectTeacher = (cred: typeof teacherCredentials[0]) => {
    setPhone(cred.phone);
    setPasskey(cred.passkey);
    setErrorMsg('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!phone.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার নিবন্ধিত মোবাইল নম্বর দিন।');
      return;
    }
    if (!passkey.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার নির্ধারিত পাস কী (Passkey) দিন।');
      return;
    }

    setIsSubmitting(true);
    const res = loginWithPhoneAndPasskey(phone, passkey);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        if (onSuccessLogin) onSuccessLogin();
      }, 500);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-700 to-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
              {settings.name || 'এডুকেশন কেয়ার কোচিং সেন্টার'}
            </h1>
            <p className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold flex items-center gap-1.5">
              <span>{settings.address || 'গুলিয়াখালী রোড, সীতাকুণ্ড'}</span>
              <span>•</span>
              <span>ডিজিটাল শিক্ষা ব্যবস্থাপনা পোর্টাল</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleDarkMode}
            title={darkMode ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন'}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          <a
            href="#teacher-login-section"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>শিক্ষক পোর্টাল লগইন</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section with Integrated Gatekeeper Login */}
        <section className="relative overflow-hidden pt-8 pb-16 px-4 sm:px-6 lg:px-8">
          {/* Subtle Background Glows */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-blue-500/10 blur-3xl pointer-events-none rounded-full" />

          <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Branding, Mission & Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/80 dark:bg-teal-950/80 border border-teal-300/60 dark:border-teal-700/60 text-teal-900 dark:text-teal-200 text-xs font-bold shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>ক্লাউড এনক্রিপ্টেড সুরক্ষিত শিক্ষা খাতা</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                জ্ঞান ও নৈতিকতায় গড়ি <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-emerald-600 to-blue-700 dark:from-teal-400 dark:via-emerald-300 dark:to-blue-400">
                  আগামীর সোনালী ভবিষ্যৎ
                </span>
              </h2>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                সীতাকুণ্ডের গুলিয়াখালীতে অবস্থিত অন্যতম শীর্ষস্থানীয় কোচিং সেন্টারের অফিশিয়াল সেন্ট্রালাইজড ম্যানেজমেন্ট প্ল্যাটফর্ম। অননুমোদিত প্রবেশ সম্পূর্ণ নিষিদ্ধ—নিবন্ধিত শিক্ষকবৃন্দ নিজস্ব মোবাইল নম্বর ও পাস কী দিয়ে নিরাপদভাবে প্রবেশ করুন।
              </p>

              {/* Security Key Points */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-left">
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>ব্যক্তিগত পাস কী</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    প্রতিটি শিক্ষকের জন্য আলাদা ও পরিবর্তনযোগ্য পাস কী
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>স্বয়ংক্রিয় ট্র্যাকিং</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    কে ফি নিয়েছেন বা নম্বর দিয়েছেন তা স্বয়ংক্রিয় রেকর্ড
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>মাল্টি-ফরম্যাট ব্যাকআপ</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    JSON, CSV ও সুরক্ষিত ZIP প্যাকেজ ডাউনলোড
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Secure Gatekeeper Teacher Login Box */}
            <div id="teacher-login-section" className="lg:col-span-5">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-200/90 dark:border-slate-800 relative">
                {/* Header Badge */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                        শিক্ষক লগইন গেটওয়ে
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        লগইন ছাড়া ভেতরের তথ্য দেখা যাবে না
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTeacherGuide(!showTeacherGuide)}
                    className="flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>পাস কী সহায়িকা</span>
                  </button>
                </div>

                {/* Alerts */}
                {errorMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 font-bold animate-pulse">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Teacher Credentials Accordion / Helper Drawer */}
                {showTeacherGuide && (
                  <div className="mb-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        শিক্ষকবৃন্দের পাস কী ও নম্বর তালিকা (১ ক্লিকে অটোফিল):
                      </span>
                      <button
                        onClick={() => setShowTeacherGuide(false)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {teacherCredentials.map((cred) => (
                        <div
                          key={cred.phone}
                          onClick={() => handleQuickSelectTeacher(cred)}
                          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 hover:border-teal-500 hover:shadow-xs transition cursor-pointer flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100">
                              {cred.name} ({cred.designation})
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              ফোন: <span className="font-mono">{cred.phone}</span> • বিষয়: {cred.subjects}
                            </p>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <span className="text-[10px] text-teal-700 dark:text-teal-300 font-bold bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 font-mono">
                              পাস কী: {cred.passkey}
                            </span>
                            <span className="block text-[9px] text-slate-400 mt-0.5 font-semibold">
                              নির্বাচন করুন ➜
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Phone Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-teal-600" />
                      শিক্ষকের মোবাইল নম্বর *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: 01812-345678 বা 01812345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm font-medium focus:bg-white focus:outline-teal-600 shadow-2xs"
                    />
                  </div>

                  {/* Passkey Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-teal-600" />
                        ব্যক্তিগত পাস কী (Passkey) *
                      </label>
                      <span className="text-[10px] text-slate-400">
                        প্রতি শিক্ষকের জন্য আলাদা
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type={showPasskey ? 'text' : 'password'}
                        required
                        placeholder="আপনার পাস কী লিখুন..."
                        value={passkey}
                        onChange={(e) => setPasskey(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm font-bold focus:bg-white focus:outline-teal-600 shadow-2xs tracking-wider"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasskey(!showPasskey)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-sm shadow-md transition cursor-pointer disabled:opacity-50"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>কোচিং ড্যাশবোর্ডে প্রবেশ করুন</span>
                  </button>
                </form>

                {/* Footer security badge */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    ১০০% তথ্য গোপনীয়তা
                  </span>
                  <span>সীতাকুণ্ড, চট্টগ্রাম</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Section */}
        <section className="py-12 bg-white dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                আধুনিক শিক্ষা খাতা
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                এডুকেশন কেয়ার ডিজিটাল কোচিং-এর বিশেষত্ব
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
                শ্রেণিকক্ষে পাঠদান থেকে শুরু করে পরীক্ষার ফলাফল ও অভিভাবক যোগাযোগ—সবকিছু এক প্ল্যাটফর্মে।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-3">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  ইনডিভিজুয়াল মার্কস এন্ট্রি
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  পরীক্ষার উত্তরপত্রের ছবি ও প্রতিটি শিক্ষার্থীর আলাদা নম্বর শিক্ষক কর্তৃক আপলোড ও স্বয়ংক্রিয় গ্রেডিং।
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  স্বয়ংক্রিয় ফি ট্র্যাকিং
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  কোন শিক্ষক কোন শিক্ষার্থীর বেতন নিয়েছেন তা স্বয়ংক্রিয়ভাবে শনাক্ত ও ক্যাশ রসিদে প্রিন্ট হয়।
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  জিরো ডেটা লস গ্যারান্টি
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  গুগল ক্লাউড ফায়ারবেসে রিয়েল-টাইম সিঙ্ক এবং অপরিবর্তনীয় অডিট লগে সব আর্থিক ও অ্যাকাডেমিক ডেটা সুরক্ষিত।
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center mb-3">
                  <Download className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  JSON, CSV ও ZIP ব্যাকআপ
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  এক ক্লিকেই এক্সেল শিট, সিএসভি এবং জিপ ফাইলের মাধ্যমে অফলাইনে সমস্ত তথ্যের ব্যাকআপ সংরক্ষণ।
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Teacher Council & Contact Overview */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                  এডুকেশন কেয়ার পরিবার
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  অভিজ্ঞ শিক্ষক পরিষদ ও নিবেদিত পরিচর্যা
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  আমাদের রয়েছে সীতাকুণ্ডের স্বনামধন্য ও অভিজ্ঞ শিক্ষকমণ্ডলী। প্রতিটি শিক্ষার্থীর পড়াশোনার অগ্রগতি নিয়মিত পর্যবেক্ষণ ও অভিভাবকদের সাথে সার্বক্ষণিক যোগাযোগ বজায় রাখা হয়।
                </p>

                <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-teal-400" />
                    <span>{settings.address}, সীতাকুণ্ড, চট্টগ্রাম</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-teal-400" />
                    <span>হটলাইন: {settings.phone}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-3">
                <h4 className="font-bold text-sm text-teal-200 flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-400" />
                  সম্মানিত শিক্ষকবৃন্দ ও বিষয়সমূহ:
                </h4>
                <div className="space-y-2 text-xs">
                  {teacherCredentials.map((t) => (
                    <div
                      key={t.name}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                    >
                      <span className="font-bold text-white">{t.name} ({t.designation})</span>
                      <span className="text-slate-400 text-[11px]">{t.subjects}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 py-6 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          © {new Date().getFullYear()} {settings.name} • সর্বস্বত্ব সংরক্ষিত
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
          ডিজিটাল অ্যাকাডেমিক ম্যানেজমেন্ট প্ল্যাটফর্ম • গুলিয়াখালী, সীতাকুণ্ড, চট্টগ্রাম
        </p>
      </footer>
    </div>
  );
};
