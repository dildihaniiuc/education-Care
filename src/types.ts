export type ClassGrade =
  | '১ম'
  | '২য়'
  | '৩য়'
  | '৪র্থ'
  | '৫ম'
  | '৬ষ্ঠ'
  | '৭ম'
  | '৮ম'
  | '৯ম'
  | '১০ম'
  | 'এসএসসি'
  | 'একাদশ'
  | 'দ্বাদশ'
  | 'এইচএসসি';

export type PaymentMethod = 'ক্যাশ (নগদ)' | 'বিকাশ' | 'নগদ' | 'রকেট' | 'ব্যাংক';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-' | 'জানা নেই';

export interface Student {
  id: string;
  roll: string;
  nameBn: string;
  nameEn?: string;
  classGrade: ClassGrade;
  batchId: string;
  fatherName: string;
  motherName?: string;
  phone: string;
  guardianPhone: string;
  schoolCollege: string;
  address: string;
  bloodGroup: BloodGroup;
  admissionDate: string;
  monthlyFee: number;
  status: 'সক্রিয়' | 'নিষ্ক্রিয়';
  photoUrl?: string;
  gender: 'ছাত্র' | 'ছাত্রী';
  addedByTeacherId?: string;
  addedByTeacherName?: string;
  createdAt?: string;
}

export interface Batch {
  id: string;
  name: string;
  classGrade: ClassGrade;
  subject: string;
  teacherId: string;
  scheduleDays: string[]; // e.g. ['রবি', 'মঙ্গল', 'বৃহস্পতি']
  timeSlot: string; // e.g. 'সকাল ৮:০০ - ৯:৩০'
  roomNo: string;
  maxSeats: number;
  monthlyFee: number;
  active: boolean;
}

export type TeacherRole = 'শিক্ষক' | 'সিনিয়র শিক্ষক' | 'এডমিন';

export interface Teacher {
  id: string;
  name: string;
  designation: string;
  subjects: string[];
  phone: string;
  email?: string;
  qualification: string;
  joiningDate: string;
  salary: number;
  bio?: string;
  pin?: string; // 4-digit PIN for teacher login
  role?: TeacherRole;
  avatarUrl?: string;
}

export interface AuditLog {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherRole?: string;
  action: string;
  target: string;
  timestamp: string;
  category: 'exam' | 'student' | 'fee' | 'attendance' | 'security' | 'batch';
}

export type AttendanceStatus = 'উপস্থিত' | 'অনুপস্থিত' | 'বিলম্ব' | 'ছুটি';

export interface StudentAttendance {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  batchId: string;
  records: StudentAttendance[];
  takenByTeacherId?: string;
  takenByTeacherName?: string;
}

export type FeeType = 'মাসিক টিউশন ফি' | 'ভর্তি ফি' | 'পরীক্ষার ফি' | 'লেকচার শিট/মডেল টেস্ট' | 'অন্যান্য';

export interface FeePayment {
  id: string;
  receiptNo: string;
  studentId: string;
  month: string; // e.g. 'জানুয়ারি', 'ফেব্রুয়ারি'
  year: number;
  feeType: FeeType;
  amount: number;
  discount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  date: string; // YYYY-MM-DD
  collectedBy: string;
  collectedByTeacherId?: string;
  collectedByTeacherName?: string;
  timestamp?: string;
  note?: string;
}

export type ExpenseCategory = 'শিক্ষক সম্মানী' | 'রুম ভাড়া' | 'বিদ্যুৎ ও ইউটিলিটি' | 'শিট ও খাতা প্রিন্টিং' | 'আপ্যায়ন ও স্টেশনারি' | 'বিজ্ঞাপন ও প্রচার' | 'অন্যান্য';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  recipient: string;
  paymentMethod: PaymentMethod;
  note?: string;
  recordedByTeacherId?: string;
  recordedByTeacherName?: string;
  createdAt?: string;
}

export interface ExamResult {
  studentId: string;
  marksObtained: number;
  grade: string;
  gpa: number;
  remarks?: string;
  updatedByTeacherId?: string;
  updatedByTeacherName?: string;
  updatedAt?: string;
  scriptPhotoUrl?: string; // uploaded answer script / marksheet image
}

export interface Exam {
  id: string;
  title: string;
  batchId: string;
  classGrade: ClassGrade;
  subject: string;
  totalMarks: number;
  passingMarks: number;
  examDate: string;
  results: ExamResult[];
  createdByTeacherId?: string;
  createdByTeacherName?: string;
  createdAt?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  target: 'সকলের জন্য' | 'শিক্ষার্থী' | 'অভিভাবক' | 'শিক্ষকবৃন্দ';
  date: string;
  isUrgent: boolean;
}

export interface InstituteSettings {
  name: string;
  subtitle?: string;
  address: string;
  union?: string;
  upazila?: string;
  district: string;
  phone: string;
  altPhone?: string;
  email: string;
  directorName: string;
  establishedYear: string;
  motto: string;
}

export type CoachingSettings = InstituteSettings;

export type ShiftType = 'সকাল' | 'বিকাল';

export interface RoutinePeriod {
  periodNo: 1 | 2 | 3;
  subject: string;
  teacherName: string;
  teacherId?: string;
  timeSlot: string;
  roomNo?: string;
}

export interface DayRoutine {
  day: string; // 'শনিবার', 'রবিবার', ...
  dayShort: string; // 'শনি', 'রবি', ...
  periods: RoutinePeriod[]; // 1 to 3 periods per day
}

export interface ClassRoutine {
  id: string;
  title: string;
  classGrade: ClassGrade;
  shift: ShiftType;
  academicYear: string;
  days: DayRoutine[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TabType =
  | 'dashboard'
  | 'students'
  | 'batches'
  | 'routine'
  | 'attendance'
  | 'accounts'
  | 'exams'
  | 'teachers'
  | 'settings';
