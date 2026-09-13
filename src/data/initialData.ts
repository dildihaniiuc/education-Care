import { Student, Batch, Teacher, AttendanceRecord, FeePayment, Expense, Exam, Notice, InstituteSettings, ClassRoutine } from '../types';

export const initialInstituteSettings: InstituteSettings = {
  name: 'এডুকেশন কেয়ার কোচিং সেন্টার',
  subtitle: 'ডিজিটাল কোচিং ও শিক্ষা ব্যবস্থাপনা খাতা',
  address: 'গুলিয়াখালী রোড, সীতাকুণ্ড পৌরসভা',
  union: 'গুলিয়াখালী',
  upazila: 'সীতাকুণ্ড',
  district: 'চট্টগ্রাম',
  phone: '০১৭১১-২২৩৩৪৪',
  altPhone: '০১৮১২-৩৪৫৬৭৮',
  email: 'educationcare.sitakunda@gmail.com',
  directorName: 'মো: জাহিদুল আলম',
  establishedYear: '২০১৮',
  motto: 'জ্ঞান ও নৈতিকতায় গড়ি আগামীর ভবিষ্যৎ',
};

// Official teachers pre-configured as requested
export const initialTeachers: Teacher[] = [
  {
    id: 't-dildihan',
    name: 'দিল দিহান',
    designation: 'পরিচালক ও সিনিয়র শিক্ষক',
    subjects: ['গনিত', 'উচ্চতর গনিত', 'আইসিটি'],
    phone: '০১৭০০-১১২২৩৩',
    qualification: 'বি.এসসি / এম.এসসি',
    joiningDate: '২০১৮-০১-০১',
    salary: 25000,
  },
  {
    id: 't-ashraful',
    name: 'আশরাফুল আলম',
    designation: 'সহকারী শিক্ষক',
    subjects: ['ইংরেজি', 'ইংরেজি -১ম', 'ইংরেজি -২য়'],
    phone: '০১৭০০-২২৩৩৪৪',
    qualification: 'বি.এ / এম.এ (ইংরেজি)',
    joiningDate: '২০১৯-০১-০১',
    salary: 20000,
  },
  {
    id: 't-ashrafuddin',
    name: 'আশরাফ উদ্দীন',
    designation: 'সহকারী শিক্ষক',
    subjects: ['পদার্থ বিজ্ঞান', 'বিজ্ঞান', 'গনিত'],
    phone: '০১৭০০-৩৩৪৪৫৫',
    qualification: 'বি.এসসি (পদার্থ বিজ্ঞান)',
    joiningDate: '২০১৯-০৩-০১',
    salary: 20000,
  },
  {
    id: 't-mainul',
    name: 'মাইনুল ইসলাম',
    designation: 'সহকারী শিক্ষক',
    subjects: ['রসায়ন', 'বিজ্ঞান', 'বাংলাদেশ ও বিশ্ব পরিচয়'],
    phone: '০১৭০০-৪৪৫৫৬৬',
    qualification: 'বি.এসসি (রসায়ন)',
    joiningDate: '২০২০-০১-০১',
    salary: 20000,
  },
  {
    id: 't-safayet',
    name: 'সাফায়েত হোসেন',
    designation: 'সহকারী শিক্ষক',
    subjects: ['হিসাববিজ্ঞান', 'ব্যবসা উদ্যোগ', 'ফিন্যান্স'],
    phone: '০১৭০০-৫৫৬৬৭৭',
    qualification: 'বি.বি.এস / এম.বি.এস',
    joiningDate: '২০২০-০২-০১',
    salary: 20000,
  },
];
export const initialBatches: Batch[] = [];
export const initialStudents: Student[] = [];
export const initialAttendanceRecords: AttendanceRecord[] = [];
export const initialFeePayments: FeePayment[] = [];
export const initialExpenses: Expense[] = [];
export const initialExams: Exam[] = [];
export const initialNotices: Notice[] = [];

export const initialRoutines: ClassRoutine[] = [
  {
    id: 'rtn-sample-10',
    title: '১০ম শ্রেণি - নিয়মিত ক্লাস রুটিন ২০২৬',
    classGrade: '১০ম',
    shift: 'সকাল',
    academicYear: '২০২৬',
    notes: 'সঠিক সময়ে ক্লাসে উপস্থিত থাকা বাধ্যতামূলক। আইডি কার্ড সাথে আনতে হবে।',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    days: [
      {
        day: 'শনিবার',
        dayShort: 'শনি',
        periods: [
          { periodNo: 1, subject: 'গনিত', teacherName: 'দিল দিহান', timeSlot: 'সকাল ৭:৩০ - ৮:২০', roomNo: '১০১' },
          { periodNo: 2, subject: 'ইংরেজি -১ম', teacherName: 'আশরাফুল আলম', timeSlot: 'সকাল ৮:২৫ - ৯:১৫', roomNo: '১০১' },
          { periodNo: 3, subject: 'পদার্থ বিজ্ঞান', teacherName: 'আশরাফ উদ্দীন', timeSlot: 'সকাল ৯:২০ - ১০:১০', roomNo: '১০১' },
        ],
      },
      {
        day: 'রবিবার',
        dayShort: 'রবি',
        periods: [
          { periodNo: 1, subject: 'রসায়ন', teacherName: 'মাইনুল ইসলাম', timeSlot: 'সকাল ৭:৩০ - ৮:২০', roomNo: '১০১' },
          { periodNo: 2, subject: 'গনিত', teacherName: 'দিল দিহান', timeSlot: 'সকাল ৮:২৫ - ৯:১৫', roomNo: '১০১' },
          { periodNo: 3, subject: 'ইংরেজি -২য়', teacherName: 'আশরাফুল আলম', timeSlot: 'সকাল ৯:২০ - ১০:১০', roomNo: '১০১' },
        ],
      },
      {
        day: 'সোমবার',
        dayShort: 'সোম',
        periods: [
          { periodNo: 1, subject: 'পদার্থ বিজ্ঞান', teacherName: 'আশরাফ উদ্দীন', timeSlot: 'সকাল ৭:৩০ - ৮:২০', roomNo: '১০১' },
          { periodNo: 2, subject: 'বাংলা-১ম', teacherName: 'সাফায়েত হোসেন', timeSlot: 'সকাল ৮:২৫ - ৯:১৫', roomNo: '১০১' },
          { periodNo: 3, subject: 'গনিত', teacherName: 'দিল দিহান', timeSlot: 'সকাল ৯:২০ - ১০:১০', roomNo: '১০১' },
        ],
      },
      {
        day: 'মঙ্গলবার',
        dayShort: 'মঙ্গল',
        periods: [
          { periodNo: 1, subject: 'রসায়ন', teacherName: 'মাইনুল ইসলাম', timeSlot: 'সকাল ৭:৩০ - ৮:২০', roomNo: '১০১' },
          { periodNo: 2, subject: 'ইংরেজি -১ম', teacherName: 'আশরাফুল আলম', timeSlot: 'সকাল ৮:২৫ - ৯:১৫', roomNo: '১০১' },
          { periodNo: 3, subject: 'আইসিটি', teacherName: 'দিল দিহান', timeSlot: 'সকাল ৯:২০ - ১০:১০', roomNo: '১০১' },
        ],
      },
      {
        day: 'বুধবার',
        dayShort: 'বুধ',
        periods: [
          { periodNo: 1, subject: 'গনিত', teacherName: 'দিল দিহান', timeSlot: 'সকাল ৭:৩০ - ৮:২০', roomNo: '১০১' },
          { periodNo: 2, subject: 'পদার্থ বিজ্ঞান', teacherName: 'আশরাফ উদ্দীন', timeSlot: 'সকাল ৮:২৫ - ৯:১৫', roomNo: '১০১' },
          { periodNo: 3, subject: 'বাংলাদেশ ও বিশ্ব পরিচয়', teacherName: 'মাইনুল ইসলাম', timeSlot: 'সকাল ৯:২০ - ১০:১০', roomNo: '১০১' },
        ],
      },
      {
        day: 'বৃহস্পতিবার',
        dayShort: 'বৃহস্পতি',
        periods: [
          { periodNo: 1, subject: 'রসায়ন', teacherName: 'মাইনুল ইসলাম', timeSlot: 'সকাল ৭:৩০ - ৮:২০', roomNo: '১০১' },
          { periodNo: 2, subject: 'ইংরেজি -২য়', teacherName: 'আশরাফুল আলম', timeSlot: 'সকাল ৮:২৫ - ৯:১৫', roomNo: '১০১' },
          { periodNo: 3, subject: 'উচ্চতর গনিত', teacherName: 'দিল দিহান', timeSlot: 'সকাল ৯:২০ - ১০:১০', roomNo: '১০১' },
        ],
      },
    ],
  },
];
