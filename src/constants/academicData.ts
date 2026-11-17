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
    phone: '01812-345678',
  },
  {
    name: 'মো রিয়াজ',
    phone: '01755-667788',
  },
  {
    name: 'আশরাফুল আলম',
    phone: '01722-334455',
  },
  {
    name: 'আশরাফ উদ্দীন',
    phone: '01933-445566',
  },
  {
    name: 'মাইনুল ইসলাম',
    phone: '01644-556677',
  },
  {
    name: 'সাফায়েত হোসেন',
    phone: '01700-778899',
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
