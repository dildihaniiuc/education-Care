import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Student,
  Batch,
  Teacher,
  AttendanceRecord,
  FeePayment,
  Expense,
  Exam,
  InstituteSettings,
  AttendanceStatus,
  ClassRoutine,
} from '../types';
import {
  initialInstituteSettings,
  initialTeachers,
  initialBatches,
  initialStudents,
  initialAttendanceRecords,
  initialFeePayments,
  initialExpenses,
  initialExams,
  initialRoutines,
} from '../data/initialData';
import { generateId, toBn } from '../utils/bengaliUtils';

interface CoachingContextType {
  // Theme state
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (val: boolean) => void;

  // Data state
  settings: InstituteSettings;
  students: Student[];
  batches: Batch[];
  teachers: Teacher[];
  attendance: AttendanceRecord[];
  feePayments: FeePayment[];
  expenses: Expense[];
  exams: Exam[];

  // Student CRUD
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  // Batch CRUD
  addBatch: (batch: Omit<Batch, 'id'>) => void;
  updateBatch: (id: string, batch: Partial<Batch>) => void;
  deleteBatch: (id: string) => void;

  // Teacher CRUD
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, teacher: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;

  // Attendance
  saveBatchAttendance: (date: string, batchId: string, records: { studentId: string; status: AttendanceStatus; note?: string }[]) => void;
  getStudentAttendanceRate: (studentId: string) => number;

  // Fees & Accounts
  addFeePayment: (payment: Omit<FeePayment, 'id' | 'receiptNo'>) => FeePayment;
  deleteFeePayment: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  getStudentDueInfo: (studentId: string) => { totalPaid: number; dueEstimate: number; payments: FeePayment[] };

  // Exams
  addExam: (exam: Omit<Exam, 'id'>) => void;
  updateExamResults: (examId: string, results: Exam['results']) => void;
  deleteExam: (id: string) => void;

  // Routines
  routines: ClassRoutine[];
  addRoutine: (routine: Omit<ClassRoutine, 'id' | 'createdAt' | 'updatedAt'>) => ClassRoutine;
  updateRoutine: (id: string, routine: Partial<ClassRoutine>) => void;
  deleteRoutine: (id: string) => void;

  // Settings & System
  updateSettings: (newSettings: InstituteSettings) => void;
  exportDatabase: () => void;
  importDatabase: (jsonData: string) => boolean;
  clearAllData: () => void;
  seedDefaultTeachers: () => void;
}

const CoachingContext = createContext<CoachingContextType | undefined>(undefined);

// Storage key updated to ensure a clean slate for official digital records
const STORAGE_KEY = 'education_care_khata_db_v2';
const THEME_KEY = 'education_care_theme_mode';

export const CoachingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Dark Mode Theme initialization
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved !== null) {
      return saved === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkModeState((prev) => !prev);
  };

  const setDarkMode = (val: boolean) => {
    setDarkModeState(val);
  };

  // Clean old mock v1 keys if any exist in browser
  useEffect(() => {
    try {
      const oldKeys = [
        'education_care_sitakunda_db_v1',
        'education_care_sitakunda_db_v1_students',
        'education_care_sitakunda_db_v1_batches',
        'education_care_sitakunda_db_v1_teachers',
        'education_care_sitakunda_db_v1_attendance',
        'education_care_sitakunda_db_v1_fees',
        'education_care_sitakunda_db_v1_expenses',
        'education_care_sitakunda_db_v1_exams',
        'education_care_sitakunda_db_v1_notices',
        'education_care_sitakunda_db_v1_settings',
      ];
      oldKeys.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }
  }, []);

  const [settings, setSettings] = useState<InstituteSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    return saved ? JSON.parse(saved) : initialInstituteSettings;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
    return saved ? JSON.parse(saved) : initialStudents;
  });

  const [batches, setBatches] = useState<Batch[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_batches`);
    return saved ? JSON.parse(saved) : initialBatches;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_teachers`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return initialTeachers;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_attendance`);
    return saved ? JSON.parse(saved) : initialAttendanceRecords;
  });

  const [feePayments, setFeePayments] = useState<FeePayment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_fees`);
    return saved ? JSON.parse(saved) : initialFeePayments;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`);
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_exams`);
    return saved ? JSON.parse(saved) : initialExams;
  });

  const [routines, setRoutines] = useState<ClassRoutine[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_routines`);
    return saved ? JSON.parse(saved) : initialRoutines;
  });

  // Persist whenever state changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_batches`, JSON.stringify(batches));
  }, [batches]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_teachers`, JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_attendance`, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_fees`, JSON.stringify(feePayments));
  }, [feePayments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_exams`, JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_routines`, JSON.stringify(routines));
  }, [routines]);

  // Student Actions
  const addStudent = (newStudent: Omit<Student, 'id'>) => {
    const student: Student = {
      ...newStudent,
      id: generateId('std'),
    };
    setStudents((prev) => [student, ...prev]);
  };

  const updateStudent = (id: string, updated: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  // Batch Actions
  const addBatch = (newBatch: Omit<Batch, 'id'>) => {
    const batch: Batch = {
      ...newBatch,
      id: generateId('btc'),
    };
    setBatches((prev) => [...prev, batch]);
  };

  const updateBatch = (id: string, updated: Partial<Batch>) => {
    setBatches((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
  };

  const deleteBatch = (id: string) => {
    setBatches((prev) => prev.filter((b) => b.id !== id));
  };

  // Teacher Actions
  const addTeacher = (newTeacher: Omit<Teacher, 'id'>) => {
    const teacher: Teacher = {
      ...newTeacher,
      id: generateId('tch'),
    };
    setTeachers((prev) => [...prev, teacher]);
  };

  const updateTeacher = (id: string, updated: Partial<Teacher>) => {
    setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
  };

  const deleteTeacher = (id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  };

  // Attendance
  const saveBatchAttendance = (
    date: string,
    batchId: string,
    records: { studentId: string; status: AttendanceStatus; note?: string }[]
  ) => {
    setAttendance((prev) => {
      const filtered = prev.filter((r) => !(r.date === date && r.batchId === batchId));
      const newRec: AttendanceRecord = {
        id: generateId('att'),
        date,
        batchId,
        records,
      };
      return [newRec, ...filtered];
    });
  };

  const getStudentAttendanceRate = (studentId: string): number => {
    let totalClasses = 0;
    let presentClasses = 0;
    attendance.forEach((rec) => {
      const match = rec.records.find((r) => r.studentId === studentId);
      if (match) {
        totalClasses++;
        if (match.status === 'উপস্থিত' || match.status === 'বিলম্ব') {
          presentClasses++;
        }
      }
    });
    if (totalClasses === 0) return 100;
    return Math.round((presentClasses / totalClasses) * 100);
  };

  // Fees & Accounts
  const addFeePayment = (payment: Omit<FeePayment, 'id' | 'receiptNo'>): FeePayment => {
    const nextReceiptNumber = feePayments.length + 1001;
    const newRecord: FeePayment = {
      ...payment,
      id: generateId('fee'),
      receiptNo: `EC-${toBn(payment.year)}-${toBn(nextReceiptNumber)}`,
    };
    setFeePayments((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const deleteFeePayment = (id: string) => {
    setFeePayments((prev) => prev.filter((p) => p.id !== id));
  };

  const addExpense = (newExpense: Omit<Expense, 'id'>) => {
    const expense: Expense = {
      ...newExpense,
      id: generateId('exp'),
    };
    setExpenses((prev) => [expense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const getStudentDueInfo = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    const payments = feePayments.filter((p) => p.studentId === studentId);
    const totalPaid = payments.reduce((acc, curr) => acc + curr.paidAmount, 0);

    if (!student) return { totalPaid, dueEstimate: 0, payments };

    // Check if current month fee is paid
    const currentYear = new Date().getFullYear();
    const bengaliMonths = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    const currentMonth = bengaliMonths[new Date().getMonth()] || 'সেপ্টেম্বর';

    const currentMonthPaid = payments.some(
      (p) => p.month === currentMonth && p.year === currentYear && p.feeType === 'মাসিক টিউশন ফি'
    );
    const dueEstimate = currentMonthPaid ? 0 : (student.monthlyFee || 0);

    return {
      totalPaid,
      dueEstimate,
      payments,
    };
  };

  // Exams
  const addExam = (newExam: Omit<Exam, 'id'>) => {
    const exam: Exam = {
      ...newExam,
      id: generateId('exam'),
    };
    setExams((prev) => [exam, ...prev]);
  };

  const updateExamResults = (examId: string, results: Exam['results']) => {
    setExams((prev) => prev.map((ex) => (ex.id === examId ? { ...ex, results } : ex)));
  };

  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((ex) => ex.id !== id));
  };

  // Routine Actions
  const addRoutine = (newRoutine: Omit<ClassRoutine, 'id' | 'createdAt' | 'updatedAt'>) => {
    const timestamp = new Date().toISOString();
    const routine: ClassRoutine = {
      ...newRoutine,
      id: generateId('rtn'),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setRoutines((prev) => [routine, ...prev]);
    return routine;
  };

  const updateRoutine = (id: string, updated: Partial<ClassRoutine>) => {
    const timestamp = new Date().toISOString();
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updated, updatedAt: timestamp } : r))
    );
  };

  const deleteRoutine = (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  };

  // Settings & System Backup
  const updateSettings = (newSettings: InstituteSettings) => {
    setSettings(newSettings);
  };

  const exportDatabase = () => {
    const exportData = {
      settings,
      students,
      batches,
      teachers,
      attendance,
      feePayments,
      expenses,
      exams,
      routines,
      exportDate: new Date().toISOString(),
      institute: settings.name,
      district: settings.district,
    };
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `education_care_khata_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDatabase = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data && (Array.isArray(data.students) || data.settings)) {
        if (data.settings) setSettings(data.settings);
        if (Array.isArray(data.students)) setStudents(data.students);
        if (Array.isArray(data.batches)) setBatches(data.batches);
        if (Array.isArray(data.teachers)) setTeachers(data.teachers);
        if (Array.isArray(data.attendance)) setAttendance(data.attendance);
        if (Array.isArray(data.feePayments)) setFeePayments(data.feePayments);
        if (Array.isArray(data.expenses)) setExpenses(data.expenses);
        if (Array.isArray(data.exams)) setExams(data.exams);
        if (Array.isArray(data.routines)) setRoutines(data.routines);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to import database:', e);
      return false;
    }
  };

  const seedDefaultTeachers = () => {
    setTeachers(initialTeachers);
  };

  // Empty all official records (clear digital khata, preserving default faculty)
  const clearAllData = () => {
    setStudents([]);
    setBatches([]);
    setTeachers(initialTeachers);
    setAttendance([]);
    setFeePayments([]);
    setExpenses([]);
    setExams([]);
    setRoutines(initialRoutines);

    localStorage.removeItem(`${STORAGE_KEY}_students`);
    localStorage.removeItem(`${STORAGE_KEY}_batches`);
    localStorage.setItem(`${STORAGE_KEY}_teachers`, JSON.stringify(initialTeachers));
    localStorage.removeItem(`${STORAGE_KEY}_attendance`);
    localStorage.removeItem(`${STORAGE_KEY}_fees`);
    localStorage.removeItem(`${STORAGE_KEY}_expenses`);
    localStorage.removeItem(`${STORAGE_KEY}_exams`);
    localStorage.setItem(`${STORAGE_KEY}_routines`, JSON.stringify(initialRoutines));
  };

  return (
    <CoachingContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        setDarkMode,
        settings,
        students,
        batches,
        teachers,
        attendance,
        feePayments,
        expenses,
        exams,
        addStudent,
        updateStudent,
        deleteStudent,
        addBatch,
        updateBatch,
        deleteBatch,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        saveBatchAttendance,
        getStudentAttendanceRate,
        addFeePayment,
        deleteFeePayment,
        addExpense,
        deleteExpense,
        getStudentDueInfo,
        addExam,
        updateExamResults,
        deleteExam,
        routines,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        updateSettings,
        exportDatabase,
        importDatabase,
        clearAllData,
        seedDefaultTeachers,
      }}
    >
      {children}
    </CoachingContext.Provider>
  );
};

export const useCoaching = () => {
  const context = useContext(CoachingContext);
  if (!context) {
    throw new Error('useCoaching must be used within a CoachingProvider');
  }
  return context;
};
