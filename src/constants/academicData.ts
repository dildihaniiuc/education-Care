import { ClassGrade, Teacher } from '../types';

export const ALL_CLASS_GRADES: ClassGrade[] = [
  '১ম',
  '২য়',
  '৩য়',
  '৪র্থ',
  '৫ম',
  '৬ষ্ঠ',
  '৭ম',
  '৮ম',
  '৯ম',
  '১০ম',
  'এসএসসি',
  'একাদশ',
  'দ্বাদশ',
  'এইচএসসি',
];

export const SHORTCUT_TEACHERS = [
  {
    name: 'দিল দিহান',
    designation: 'পরিচালক ও সিনিয়র শিক্ষক',
    qualification: 'বি.এসসি / এম.এস.সি',
    subjects: ['গনিত', 'উচ্চতর গনিত', 'আইসিটি'],
    phone: '০১৭০০-১১২২৩৩',
  },
  {
    name: 'আশরাফুল আলম',
    designation: 'সহকারী শিক্ষক',
    qualification: 'বি.এ / এম.এ (ইংরেজি)',
    subjects: ['ইংরেজি', 'ইংরেজি -১ম', 'ইংরেজি -২য়'],
    phone: '০১৭০০-২২৩৩৪৪',
  },
  {
    name: 'আশরাফ উদ্দীন',
    designation: 'সহকারী শিক্ষক',
    qualification: 'বি.এসসি (পদার্থ বিজ্ঞান)',
    subjects: ['পদার্থ বিজ্ঞান', 'বিজ্ঞান', 'গনিত'],
    phone: '০১৭০০-৩৩৪৪৫৫',
  },
  {
    name: 'মাইনুল ইসলাম',
    designation: 'সহকারী শিক্ষক',
    qualification: 'বি.এসসি (রসায়ন)',
    subjects: ['রসায়ন', 'বিজ্ঞান', 'বাংলাদেশ ও বিশ্ব পরিচয়'],
    phone: '০১৭০০-৪৪৫৫৬৬',
  },
  {
    name: 'সাফায়েত হোসেন',
    designation: 'সহকারী শিক্ষক',
    qualification: 'বি.বি.এস / এম.বি.এস',
    subjects: ['হিসাববিজ্ঞান', 'ব্যবসা উদ্যোগ', 'ফিন্যান্স'],
    phone: '০১৭০০-৫৫৬৬৭৭',
  },
];

export const SHORTCUT_SUBJECTS: string[] = [
  'বাংলা',
  'বাংলা-১ম',
  'বাংলা-২য়',
  'ইংরেজি',
  'ইংরেজি -১ম',
  'ইংরেজি -২য়',
  'গনিত',
  'বাংলাদেশ ও বিশ্ব পরিচয়',
  'বিজ্ঞান',
  'ধর্ম',
  'আইসিটি',
  'ব্যবসা উদ্যোগ',
  'হিসাববিজ্ঞান',
  'ফিন্যান্স',
  'কৃষিশিক্ষা',
  'পৌরনীতি',
  'ভূগোল',
  'ইতিহাস',
  'পদার্থ বিজ্ঞান',
  'রসায়ন',
  'উচ্চতর গনিত',
];

export interface DayOption {
  short: string;
  full: string;
}

export const DAYS_OF_WEEK: DayOption[] = [
  { short: 'শনি', full: 'শনিবার' },
  { short: 'রবি', full: 'রবিবার' },
  { short: 'সোম', full: 'সোমবার' },
  { short: 'মঙ্গল', full: 'মঙ্গলবার' },
  { short: 'বুধ', full: 'বুধবার' },
  { short: 'বৃহস্পতি', full: 'বৃহস্পতিবার' },
  { short: 'শুক্র', full: 'শুক্রবার' },
];

export const DEFAULT_SHIFT_TIMES = {
  সকাল: {
    period1: 'সকাল ৭:৩০ - ৮:২০',
    period2: 'সকাল ৮:২৫ - ৯:১৫',
    period3: 'সকাল ৯:২০ - ১০:১০',
  },
  বিকাল: {
    period1: 'বিকাল ৩:০০ - ৩:৫০',
    period2: 'বিকাল ৩:৫৫ - ৪:৪৫',
    period3: 'বিকাল ৪:৫০ - ৫:৪০',
  },
};
