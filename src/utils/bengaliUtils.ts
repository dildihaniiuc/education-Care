// Bengali Number and text helper utilities

const bnDigits: { [key: string]: string } = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

export const toBn = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null) return '০';
  const str = num.toString();
  return str.replace(/[0-9]/g, (w) => bnDigits[w] || w);
};

export const formatTaka = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) return '৳০';
  const formatted = new Intl.NumberFormat('en-IN').format(amount);
  return `৳${toBn(formatted)}`;
};

export const bengaliMonths = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

export const formatBengaliDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = toBn(parts[0]);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const month = bengaliMonths[monthIndex] || parts[1];
      const day = toBn(parseInt(parts[2], 10));
      return `${day} ${month}, ${year}`;
    }
  } catch (e) {
    // fallback
  }
  return dateStr;
};

export const getGradeAndGPA = (marks: number, totalMarks: number = 100): { grade: string; gpa: number } => {
  const percentage = (marks / totalMarks) * 100;
  if (percentage >= 80) return { grade: 'A+', gpa: 5.0 };
  if (percentage >= 70) return { grade: 'A', gpa: 4.0 };
  if (percentage >= 60) return { grade: 'A-', gpa: 3.5 };
  if (percentage >= 50) return { grade: 'B', gpa: 3.0 };
  if (percentage >= 40) return { grade: 'C', gpa: 2.0 };
  if (percentage >= 33) return { grade: 'D', gpa: 1.0 };
  return { grade: 'F', gpa: 0.0 };
};

const enDigits: { [key: string]: string } = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

export const toEn = (str: string | undefined | null): string => {
  if (!str) return '';
  return str.replace(/[০-৯]/g, (w) => enDigits[w] || w);
};

export const cleanPhoneNumber = (raw: string | undefined | null): string => {
  if (!raw) return '';
  const converted = toEn(raw);
  // Strip all non-digits
  const digitsOnly = converted.replace(/[^0-9]/g, '');
  // If starts with 880, strip 88 to match local 01xxxxxxxxx
  if (digitsOnly.startsWith('880') && digitsOnly.length === 13) {
    return digitsOnly.slice(2);
  }
  return digitsOnly;
};

export const cleanPasskey = (raw: string | undefined | null): string => {
  if (!raw) return '';
  return toEn(raw.trim());
};

export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
};
