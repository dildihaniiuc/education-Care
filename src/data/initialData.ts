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

// Default teachers for Education Care Coaching Center with individual Passkeys
export const defaultStaffTeachers: Teacher[] = [
  {
    id: 'tch-dildihan',
    name: 'দিল দিহান',
    designation: 'শিক্ষক',
    subjects: ['গনিত', 'উচ্চতর গনিত', 'আইসিটি'],
    phone: '01812-345678',
    email: 'dildihan@educationcare.edu',
    qualification: 'বিএসসি (সম্মান), এমএসসি (গণিত)',
    joiningDate: '২০১৮-০১-০১',
    salary: 35000,
    role: 'শিক্ষক',
    pin: '1122',
    bio: 'এডুকেশন কেয়ার কোচিং সেন্টারের গণিত শিক্ষক।',
  },
  {
    id: 'tch-riaz',
    name: 'মো রিয়াজ',
    designation: 'শিক্ষক',
    subjects: ['গনিত', 'বিজ্ঞান', 'বাংলা'],
    phone: '01755-667788',
    email: 'riaz@educationcare.edu',
    qualification: 'বিএসসি / বিএ',
    joiningDate: '২০২২-০১-১৫',
    salary: 25000,
    role: 'শিক্ষক',
    pin: '2233',
    bio: 'এডুকেশন কেয়ার কোচিং সেন্টারের শিক্ষক।',
  },
  {
    id: 'tch-ashraful',
    name: 'আশরাফুল আলম',
    designation: 'শিক্ষক',
    subjects: ['ইংরেজি -১ম', 'ইংরেজি -২য়'],
    phone: '01722-334455',
    email: 'ashraful@educationcare.edu',
    qualification: 'বিএ (সম্মান), এমএ (ইংরেজি)',
    joiningDate: '২০১৯-০২-১৫',
    salary: 28000,
    role: 'শিক্ষক',
    pin: '3344',
    bio: 'ইংরেজি ব্যাকরণ ও মডেল টেস্ট স্পেশালিস্ট।',
  },
  {
    id: 'tch-ashraf',
    name: 'আশরাফ উদ্দীন',
    designation: 'শিক্ষক',
    subjects: ['পদার্থ বিজ্ঞান', 'রসায়ন'],
    phone: '01933-445566',
    email: 'ashraf@educationcare.edu',
    qualification: 'বিএসসি (পদার্থবিজ্ঞান)',
    joiningDate: '২০২০-০১-১০',
    salary: 26000,
    role: 'শিক্ষক',
    pin: '4455',
    bio: 'বিজ্ঞান বিভাগের ব্যবহারিক ও থিওরি ক্লাস তত্ত্বাবধায়ক।',
  },
  {
    id: 'tch-mainul',
    name: 'মাইনুল ইসলাম',
    designation: 'শিক্ষক',
    subjects: ['বাংলাদেশ ও বিশ্ব পরিচয়', 'বাংলা-১ম'],
    phone: '01644-556677',
    email: 'mainul@educationcare.edu',
    qualification: 'বিএসসি (রসায়ন), ডিপ্লোমা',
    joiningDate: '২০২১-০৩-০১',
    salary: 25000,
    role: 'শিক্ষক',
    pin: '5566',
    bio: 'নিয়মিত ক্লাস ও উপস্থিতি নিরীক্ষক।',
  },
];

// Teachers and Students initial state (prefilled with staff teachers so login works immediately)
export const initialTeachers: Teacher[] = defaultStaffTeachers;
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
