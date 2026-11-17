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

// Default teachers for Education Care Coaching Center with individual Passkeys (name + phone + pin only)
export const defaultStaffTeachers: Teacher[] = [
  {
    id: 'tch-dildihan',
    name: 'দিল দিহান',
    phone: '01812-345678',
    pin: '1122',
  },
  {
    id: 'tch-riaz',
    name: 'মো রিয়াজ',
    phone: '01755-667788',
    pin: '2233',
  },
  {
    id: 'tch-ashraful',
    name: 'আশরাফুল আলম',
    phone: '01722-334455',
    pin: '3344',
  },
  {
    id: 'tch-ashraf',
    name: 'আশরাফ উদ্দীন',
    phone: '01933-445566',
    pin: '4455',
  },
  {
    id: 'tch-mainul',
    name: 'মাইনুল ইসলাম',
    phone: '01644-556677',
    pin: '5566',
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
export const initialRoutines: ClassRoutine[] = [];
