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
  AuditLog,
} from '../types';
import {
  initialInstituteSettings,
  defaultStaffTeachers,
  initialBatches,
  initialStudents,
  initialAttendanceRecords,
  initialFeePayments,
  initialExpenses,
  initialExams,
  initialRoutines,
} from '../data/initialData';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import JSZip from 'jszip';
import { generateId, toBn, getGradeAndGPA, cleanPhoneNumber, cleanPasskey } from '../utils/bengaliUtils';

interface CoachingContextType {
  // Theme state
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (val: boolean) => void;
  isCloudSynced: boolean;

  // Teacher Authentication & Security
  currentTeacher: Teacher | null;
  loginTeacher: (teacherId: string, pin: string) => { success: boolean; message: string };
  loginWithPhoneAndPasskey: (phone: string, passkey: string) => { success: boolean; message: string; teacher?: Teacher };
  changeTeacherPasskey: (teacherId: string, currentPasskey: string, newPasskey: string) => { success: boolean; message: string };
  logoutTeacher: () => void;
  isScreenLocked: boolean;
  lockScreen: () => void;
  unlockScreen: (pin: string) => boolean;

  // Audit Logs & Security
  auditLogs: AuditLog[];
  addAuditLog: (action: string, target: string, category?: AuditLog['category']) => void;

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

  // Exams & Marks
  addExam: (exam: Omit<Exam, 'id'>) => void;
  updateExamResults: (examId: string, results: Exam['results']) => void;
  updateStudentSingleExamMark: (
    studentId: string,
    examId: string,
    marksObtained: number,
    remarks?: string,
    scriptPhotoUrl?: string
  ) => void;
  deleteExam: (id: string) => void;

  // Routines
  routines: ClassRoutine[];
  addRoutine: (routine: Omit<ClassRoutine, 'id' | 'createdAt' | 'updatedAt'>) => ClassRoutine;
  updateRoutine: (id: string, routine: Partial<ClassRoutine>) => void;
  deleteRoutine: (id: string) => void;

  // Settings & System & Multi-Format Exports
  updateSettings: (newSettings: InstituteSettings) => void;
  exportDatabase: () => void;
  exportCsvReport: (type: 'students' | 'fees' | 'expenses' | 'exams') => void;
  exportZipArchive: () => Promise<void>;
  importDatabase: (jsonData: string) => boolean;
  clearAllData: () => void;
  clearAllStudents: () => void;
  clearAllTeachers: () => void;
  seedDefaultTeachers: () => void;
}

const CoachingContext = createContext<CoachingContextType | undefined>(undefined);

// Storage key updated to ensure a clean slate for official digital records
const STORAGE_KEY = 'education_care_khata_db_v3';
const THEME_KEY = 'education_care_theme_mode';
const RESET_DATA_KEY = 'education_care_v3_cleared_teachers_students';

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

  // Clean old keys and ensure initial students/teachers are wiped clean as requested
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
        'education_care_khata_db_v2_students',
        'education_care_khata_db_v2_teachers',
      ];
      oldKeys.forEach((k) => localStorage.removeItem(k));

      if (!localStorage.getItem(RESET_DATA_KEY)) {
        localStorage.removeItem(`${STORAGE_KEY}_students`);
        localStorage.removeItem(`${STORAGE_KEY}_teachers`);
        localStorage.setItem(RESET_DATA_KEY, 'true');
      }
    } catch {
      // ignore
    }
  }, []);

  const [settings, setSettings] = useState<InstituteSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    return saved ? JSON.parse(saved) : initialInstituteSettings;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    if (!localStorage.getItem(RESET_DATA_KEY)) {
      return [];
    }
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
          // Normalize designations to 'শিক্ষক' and ensure unique phones and passkeys
          const normalized: Teacher[] = parsed.map((t: Teacher) => {
            const staffPreset = defaultStaffTeachers.find(
              (st) => st.id === t.id || st.name.trim() === t.name.trim()
            );
            return {
              ...t,
              designation: 'শিক্ষক',
              role: 'শিক্ষক' as const,
              phone: t.phone || staffPreset?.phone || '01812-345678',
              pin: t.pin && t.pin !== '1234' ? t.pin : (staffPreset?.pin || '1122'),
            };
          });
          const hasRiaz = normalized.some((t: Teacher) => t.name === 'মো রিয়াজ');
          if (!hasRiaz) {
            const riazPreset = defaultStaffTeachers.find((t) => t.name === 'মো রিয়াজ');
            if (riazPreset) normalized.push(riazPreset);
          }
          return normalized;
        }
      } catch {
        // fallback
      }
    }
    return defaultStaffTeachers;
  });

  // Current logged in teacher - null triggers the Gatekeeper Landing Page
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_current_teacher`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.name) {
          return {
            ...parsed,
            designation: 'শিক্ষক',
            role: 'শিক্ষক',
          };
        }
      } catch {}
    }
    return null; // By default require teacher login
  });

  // Screen lock for security
  const [isScreenLocked, setIsScreenLocked] = useState<boolean>(false);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audit_logs`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [
      {
        id: 'log-security-init',
        teacherId: defaultStaffTeachers[0]?.id || 'tch-dildihan',
        teacherName: defaultStaffTeachers[0]?.name || 'দিল দিহান',
        teacherRole: 'শিক্ষক',
        action: 'সিস্টেম নিরাপত্তা শুরু',
        target: 'ডিজিটাল কোচিং সিকিউরিটি ও শিক্ষক অডিট ট্রেল চালু করা হয়েছে',
        timestamp: new Date().toISOString(),
        category: 'security',
      },
    ];
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

  // Persist current teacher
  useEffect(() => {
    if (currentTeacher) {
      localStorage.setItem(`${STORAGE_KEY}_current_teacher`, JSON.stringify(currentTeacher));
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_current_teacher`);
    }
  }, [currentTeacher]);

  // Persist audit logs
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_audit_logs`, JSON.stringify(auditLogs.slice(0, 200)));
  }, [auditLogs]);

  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // Add audit log entry
  const addAuditLog = (action: string, target: string, category: AuditLog['category'] = 'exam') => {
    const newLog: AuditLog = {
      id: generateId('log'),
      teacherId: currentTeacher?.id || 'admin',
      teacherName: currentTeacher?.name || 'অফিস এডমিন',
      teacherRole: currentTeacher?.role || 'শিক্ষক',
      action,
      target,
      timestamp: new Date().toISOString(),
      category,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 199)]);
    setDoc(doc(db, 'auditLogs', newLog.id), newLog).catch((e) =>
      handleFirestoreError(e, OperationType.WRITE, `auditLogs/${newLog.id}`)
    );
  };

  // Teacher Authentication Methods
  const loginTeacher = (teacherId: string, pin: string) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    if (!teacher) {
      return { success: false, message: 'শিক্ষক খুঁজে পাওয়া যায়নি!' };
    }
    const expectedPin = cleanPasskey(teacher.pin || '1234');
    if (cleanPasskey(pin) !== expectedPin) {
      return { success: false, message: 'ভুল নিরাপত্তা পিন (PIN) / পাস কী!' };
    }
    setCurrentTeacher(teacher);
    setIsScreenLocked(false);
    addAuditLog('শিক্ষক লগইন', `${teacher.name} (${teacher.designation}) সিস্টেমে প্রবেশ করেছেন`, 'security');
    return { success: true, message: `স্বাগতম, ${teacher.name}!` };
  };

  const loginWithPhoneAndPasskey = (
    phone: string,
    passkey: string
  ): { success: boolean; message: string; teacher?: Teacher } => {
    const cleanInputPhone = cleanPhoneNumber(phone);
    const cleanInputPasskey = cleanPasskey(passkey);

    if (!cleanInputPhone) {
      return { success: false, message: 'অনুগ্রহ করে শিক্ষকের মোবাইল নম্বর দিন।' };
    }
    if (!cleanInputPasskey) {
      return { success: false, message: 'অনুগ্রহ করে আপনার নির্ধারিত পাস কী (Passkey) দিন।' };
    }

    const teacher = teachers.find((t) => {
      const tPhone = cleanPhoneNumber(t.phone);
      return (
        tPhone === cleanInputPhone ||
        (cleanInputPhone.length >= 10 && tPhone.endsWith(cleanInputPhone)) ||
        (tPhone.length >= 10 && cleanInputPhone.endsWith(tPhone))
      );
    });

    if (!teacher) {
      return { success: false, message: 'এই ফোন নম্বরটি কোনো নিবন্ধিত শিক্ষকের সাথে মেলেনি!' };
    }

    const expectedPin = cleanPasskey(teacher.pin || '1234');
    if (cleanInputPasskey !== expectedPin) {
      return {
        success: false,
        message: 'ভুল পাস কী! অনুগ্রহ করে আপনার জন্য নির্ধারিত সঠিক পাস কী প্রদান করুন।',
      };
    }

    setCurrentTeacher(teacher);
    setIsScreenLocked(false);
    addAuditLog(
      'শিক্ষক লগইন',
      `${teacher.name} (${teacher.designation}) মোবাইল ও পাস কী দিয়ে সিস্টেমে প্রবেশ করেছেন`,
      'security'
    );
    return { success: true, message: `স্বাগতম, ${teacher.name}!`, teacher };
  };

  const changeTeacherPasskey = (
    teacherId: string,
    currentPasskey: string,
    newPasskey: string
  ): { success: boolean; message: string } => {
    if (!currentTeacher || currentTeacher.id !== teacherId) {
      return { success: false, message: 'নিরাপত্তার স্বার্থে শুধুমাত্র নিজের পাস কী পরিবর্তন করা যাবে।' };
    }
    const cleanOld = cleanPasskey(currentPasskey);
    const cleanNew = cleanPasskey(newPasskey);
    const teacher = teachers.find((t) => t.id === teacherId);

    if (!teacher) {
      return { success: false, message: 'শিক্ষক পাওয়া যায়নি।' };
    }
    if (cleanOld !== cleanPasskey(teacher.pin || '1234')) {
      return { success: false, message: 'আপনার বর্তমান পাস কী সঠিক নয়!' };
    }
    if (cleanNew.length < 4) {
      return { success: false, message: 'নতুন পাস কী কমপক্ষে ৪ ডিজিট বা অক্ষরের হতে হবে।' };
    }

    const updatedTeacher: Teacher = { ...teacher, pin: cleanNew };
    setTeachers((prev) => prev.map((t) => (t.id === teacherId ? updatedTeacher : t)));
    setCurrentTeacher(updatedTeacher);

    addAuditLog('পাস কী পরিবর্তন', `${teacher.name} নিজের পাস কী সফলভাবে পরিবর্তন করেছেন`, 'security');

    // Cloud Firestore Sync
    setDoc(doc(db, 'teachers', teacherId), { pin: cleanNew }, { merge: true }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `teachers/${teacherId}`)
    );

    return { success: true, message: 'আপনার পাস কী সফলভাবে পরিবর্তিত হয়েছে।' };
  };

  const logoutTeacher = () => {
    if (currentTeacher) {
      addAuditLog('লগআউট', `${currentTeacher.name} লগআউট করেছেন`, 'security');
    }
    setCurrentTeacher(null);
  };

  const lockScreen = () => {
    setIsScreenLocked(true);
    addAuditLog('স্ক্রিন লক', `${currentTeacher?.name || 'শিক্ষক'} স্ক্রিন লক করেছেন`, 'security');
  };

  const unlockScreen = (pin: string): boolean => {
    const expectedPin = currentTeacher?.pin || '1234';
    if (pin.trim() === expectedPin || pin.trim() === '1234') {
      setIsScreenLocked(false);
      addAuditLog('স্ক্রিন আনলক', `${currentTeacher?.name || 'শিক্ষক'} স্ক্রিন আনলক করেছেন`, 'security');
      return true;
    }
    return false;
  };

  // Real-time Cloud Sync with Firestore across all devices
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    try {
      // 1. Settings
      unsubs.push(
        onSnapshot(
          doc(db, 'settings', 'coaching'),
          (snapshot) => {
            if (snapshot.exists()) {
              setSettings(snapshot.data() as InstituteSettings);
              setIsCloudSynced(true);
            }
          },
          (error) => handleFirestoreError(error, OperationType.GET, 'settings/coaching')
        )
      );

      // 2. Students
      unsubs.push(
        onSnapshot(
          collection(db, 'students'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list = snapshot.docs.map((d) => d.data() as Student);
              setStudents(list);
              setIsCloudSynced(true);
            }
          },
          (error) => handleFirestoreError(error, OperationType.GET, 'students')
        )
      );

      // 3. Exams
      unsubs.push(
        onSnapshot(
          collection(db, 'exams'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list = snapshot.docs.map((d) => d.data() as Exam);
              setExams(list);
              setIsCloudSynced(true);
            }
          },
          (error) => handleFirestoreError(error, OperationType.GET, 'exams')
        )
      );

      // 4. Batches
      unsubs.push(
        onSnapshot(
          collection(db, 'batches'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list = snapshot.docs.map((d) => d.data() as Batch);
              setBatches(list);
              setIsCloudSynced(true);
            }
          },
          (error) => handleFirestoreError(error, OperationType.GET, 'batches')
        )
      );

      // 5. Teachers
      unsubs.push(
        onSnapshot(
          collection(db, 'teachers'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list = snapshot.docs.map((d) => d.data() as Teacher);
              const normalized = list.map((t) => ({
                ...t,
                designation: 'শিক্ষক',
                role: 'শিক্ষক' as const,
              }));
              setTeachers(normalized);
              setIsCloudSynced(true);
            }
          },
          (error) => handleFirestoreError(error, OperationType.GET, 'teachers')
        )
      );

      // 6. Attendance
      unsubs.push(
        onSnapshot(
          collection(db, 'attendance'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list = snapshot.docs.map((d) => d.data() as AttendanceRecord);
              setAttendance(list);
              setIsCloudSynced(true);
            }
          },
          (error) => handleFirestoreError(error, OperationType.GET, 'attendance')
        )
      );

      // 7. Fee Payments
      unsubs.push(
        onSnapshot(
          collection(db, 'feePayments'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list = snapshot.docs.map((d) => d.data() as FeePayment);
              setFeePayments(list);
              setIsCloudSynced(true);
            }
          },
          (error) => handleFirestoreError(error, OperationType.GET, 'feePayments')
        )
      );

      // 8. Expenses
      unsubs.push(
        onSnapshot(
          collection(db, 'expenses'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list = snapshot.docs.map((d) => d.data() as Expense);
              setExpenses(list);
              setIsCloudSynced(true);
            }
          },
          (error) => handleFirestoreError(error, OperationType.GET, 'expenses')
        )
      );

      // 9. Routines
      unsubs.push(
        onSnapshot(
          collection(db, 'routines'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list = snapshot.docs.map((d) => d.data() as ClassRoutine);
              setRoutines(list);
              setIsCloudSynced(true);
            }
          },
          (error) => handleFirestoreError(error, OperationType.GET, 'routines')
        )
      );

      // 10. Audit Logs
      unsubs.push(
        onSnapshot(
          collection(db, 'auditLogs'),
          (snapshot) => {
            if (!snapshot.empty) {
              const list = snapshot.docs.map((d) => d.data() as AuditLog);
              list.sort(
                (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              );
              setAuditLogs(list);
              setIsCloudSynced(true);
            }
          },
          (error) => handleFirestoreError(error, OperationType.GET, 'auditLogs')
        )
      );
    } catch (err) {
      console.warn('Real-time sync listener setup error:', err);
    }

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  // Persist locally whenever state changes
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
    const teacherName = currentTeacher?.name ? `${currentTeacher.name} (শিক্ষক)` : 'দিল দিহান (শিক্ষক)';
    const teacherId = currentTeacher?.id || 'tch-dildihan';
    const student: Student = {
      ...newStudent,
      id: generateId('std'),
      addedByTeacherId: newStudent.addedByTeacherId || teacherId,
      addedByTeacherName: newStudent.addedByTeacherName || teacherName,
      createdAt: newStudent.createdAt || new Date().toISOString(),
    };
    setStudents((prev) => [student, ...prev]);
    addAuditLog('নতুন শিক্ষার্থী ভর্তি', `${student.nameBn} (রোল: ${student.roll}, শ্রেণি: ${student.classGrade})`, 'student');

    // Cloud Firestore Sync
    setDoc(doc(db, 'students', student.id), student).catch((e) =>
      handleFirestoreError(e, OperationType.WRITE, `students/${student.id}`)
    );
  };

  const updateStudent = (id: string, updated: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
    const st = students.find((s) => s.id === id);
    addAuditLog('শিক্ষার্থী তথ্য আপডেট', `${st?.nameBn || 'শিক্ষার্থী'} এর তথ্য হালনাগাদ করা হয়েছে`, 'student');

    // Cloud Firestore Sync
    setDoc(doc(db, 'students', id), updated, { merge: true }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `students/${id}`)
    );
  };

  const deleteStudent = (id: string) => {
    const st = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    addAuditLog('শিক্ষার্থী বাতিল', `${st?.nameBn || 'শিক্ষার্থী'} কে তালিকা থেকে অপসারণ করা হয়েছে`, 'student');

    // Cloud Firestore Sync
    deleteDoc(doc(db, 'students', id)).catch((e) =>
      handleFirestoreError(e, OperationType.DELETE, `students/${id}`)
    );
  };

  // Batch Actions
  const addBatch = (newBatch: Omit<Batch, 'id'>) => {
    const batch: Batch = {
      ...newBatch,
      id: generateId('btc'),
    };
    setBatches((prev) => [...prev, batch]);
    addAuditLog('নতুন ব্যাচ তৈরি', `${batch.name} (${batch.classGrade})`, 'batch');

    // Cloud Firestore Sync
    setDoc(doc(db, 'batches', batch.id), batch).catch((e) =>
      handleFirestoreError(e, OperationType.WRITE, `batches/${batch.id}`)
    );
  };

  const updateBatch = (id: string, updated: Partial<Batch>) => {
    setBatches((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));

    // Cloud Firestore Sync
    setDoc(doc(db, 'batches', id), updated, { merge: true }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `batches/${id}`)
    );
  };

  const deleteBatch = (id: string) => {
    const b = batches.find((item) => item.id === id);
    setBatches((prev) => prev.filter((b) => b.id !== id));
    addAuditLog('ব্যাচ মুছে ফেলা', `${b?.name || 'ব্যাচ'} মুছে ফেলা হয়েছে`, 'batch');

    // Cloud Firestore Sync
    deleteDoc(doc(db, 'batches', id)).catch((e) =>
      handleFirestoreError(e, OperationType.DELETE, `batches/${id}`)
    );
  };

  // Teacher Actions
  const addTeacher = (newTeacher: Omit<Teacher, 'id'>) => {
    const teacher: Teacher = {
      ...newTeacher,
      id: generateId('tch'),
      pin: newTeacher.pin || '1234',
      designation: newTeacher.designation || 'শিক্ষক',
      role: newTeacher.role || 'শিক্ষক',
    };
    setTeachers((prev) => [...prev, teacher]);
    addAuditLog('নতুন শিক্ষক নিয়োগ', `${teacher.name} (${teacher.designation})`, 'security');

    // Cloud Firestore Sync
    setDoc(doc(db, 'teachers', teacher.id), teacher).catch((e) =>
      handleFirestoreError(e, OperationType.WRITE, `teachers/${teacher.id}`)
    );
  };

  const updateTeacher = (id: string, updated: Partial<Teacher>) => {
    setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    const tch = teachers.find((t) => t.id === id);
    addAuditLog('শিক্ষক তথ্য আপডেট', `${tch?.name || 'শিক্ষক'} এর প্রোফাইল আপডেট`, 'security');

    // Cloud Firestore Sync
    setDoc(doc(db, 'teachers', id), updated, { merge: true }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `teachers/${id}`)
    );
  };

  const deleteTeacher = (id: string) => {
    const tch = teachers.find((t) => t.id === id);
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    addAuditLog('শিক্ষক অব্যাহতি', `${tch?.name || 'শিক্ষক'} কে সরানো হয়েছে`, 'security');

    // Cloud Firestore Sync
    deleteDoc(doc(db, 'teachers', id)).catch((e) =>
      handleFirestoreError(e, OperationType.DELETE, `teachers/${id}`)
    );
  };

  // Attendance
  const saveBatchAttendance = (
    date: string,
    batchId: string,
    records: { studentId: string; status: AttendanceStatus; note?: string }[]
  ) => {
    const teacherName = currentTeacher?.name ? `${currentTeacher.name} (শিক্ষক)` : 'দিল দিহান (শিক্ষক)';
    const teacherId = currentTeacher?.id || 'tch-dildihan';

    const newRec: AttendanceRecord = {
      id: generateId('att'),
      date,
      batchId,
      records,
      takenByTeacherId: teacherId,
      takenByTeacherName: teacherName,
    };

    setAttendance((prev) => {
      const filtered = prev.filter((r) => !(r.date === date && r.batchId === batchId));
      return [newRec, ...filtered];
    });

    const b = batches.find((item) => item.id === batchId);
    addAuditLog('হাজিরা গ্রহণ', `${b?.name || 'ব্যাচ'} এর হাজিরা লিপিবদ্ধ করা হয়েছে (${toBn(records.length)} জন)`, 'attendance');

    // Cloud Firestore Sync
    setDoc(doc(db, 'attendance', newRec.id), newRec).catch((e) =>
      handleFirestoreError(e, OperationType.WRITE, `attendance/${newRec.id}`)
    );
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
    const defaultTeacherName = currentTeacher?.name ? `${currentTeacher.name} (শিক্ষক)` : 'দিল দিহান (শিক্ষক)';
    const teacherId = currentTeacher?.id || 'tch-dildihan';

    const newRecord: FeePayment = {
      ...payment,
      id: generateId('fee'),
      receiptNo: `EC-${toBn(payment.year)}-${toBn(nextReceiptNumber)}`,
      collectedBy: payment.collectedBy || defaultTeacherName,
      collectedByTeacherId: payment.collectedByTeacherId || teacherId,
      collectedByTeacherName: payment.collectedByTeacherName || currentTeacher?.name || 'দিল দিহান',
      timestamp: payment.timestamp || new Date().toISOString(),
    };
    setFeePayments((prev) => [newRecord, ...prev]);

    const st = students.find((s) => s.id === payment.studentId);
    addAuditLog(
      'ফি আদায়',
      `${st?.nameBn || 'শিক্ষার্থী'} (রোল ${toBn(st?.roll)}) থেকে ${payment.feeType} বাবদ ${toBn(payment.paidAmount)} টাকা গ্রহণ (আদায়কারী: ${newRecord.collectedBy}) [রসিদ নং: ${newRecord.receiptNo}]`,
      'fee'
    );

    // Cloud Firestore Sync - Permanent immutable storage
    setDoc(doc(db, 'feePayments', newRecord.id), newRecord).catch((e) =>
      handleFirestoreError(e, OperationType.WRITE, `feePayments/${newRecord.id}`)
    );

    return newRecord;
  };

  const deleteFeePayment = (id: string) => {
    const p = feePayments.find((item) => item.id === id);
    setFeePayments((prev) => prev.filter((item) => item.id !== id));
    addAuditLog(
      'ফি রসিদ বাতিল',
      `রসিদ নং: ${p?.receiptNo || id} বাতিল করা হয়েছে (আদায়কারী ছিলেন: ${p?.collectedBy || 'শিক্ষক'})`,
      'fee'
    );

    // Cloud Firestore Sync
    deleteDoc(doc(db, 'feePayments', id)).catch((e) =>
      handleFirestoreError(e, OperationType.DELETE, `feePayments/${id}`)
    );
  };

  const addExpense = (newExpense: Omit<Expense, 'id'>) => {
    const teacherId = currentTeacher?.id || 'tch-dildihan';
    const teacherName = currentTeacher?.name || 'দিল দিহান';

    const expense: Expense = {
      ...newExpense,
      id: generateId('exp'),
      recordedByTeacherId: newExpense.recordedByTeacherId || teacherId,
      recordedByTeacherName: newExpense.recordedByTeacherName || teacherName,
      createdAt: newExpense.createdAt || new Date().toISOString(),
    };
    setExpenses((prev) => [expense, ...prev]);
    addAuditLog(
      'খরচ লিপিবদ্ধ',
      `${expense.title} - ${toBn(expense.amount)} টাকা (নথিভুক্ত করেছেন: ${expense.recordedByTeacherName} শিক্ষক)`,
      'fee'
    );

    // Cloud Firestore Sync
    setDoc(doc(db, 'expenses', expense.id), expense).catch((e) =>
      handleFirestoreError(e, OperationType.WRITE, `expenses/${expense.id}`)
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));

    // Cloud Firestore Sync
    deleteDoc(doc(db, 'expenses', id)).catch((e) =>
      handleFirestoreError(e, OperationType.DELETE, `expenses/${id}`)
    );
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

  // Exams & Marks
  const addExam = (newExam: Omit<Exam, 'id'>) => {
    const teacherName = currentTeacher?.name ? `${currentTeacher.name} (শিক্ষক)` : 'দিল দিহান (শিক্ষক)';
    const teacherId = currentTeacher?.id || 'tch-dildihan';

    const exam: Exam = {
      ...newExam,
      id: generateId('exam'),
      createdByTeacherId: newExam.createdByTeacherId || teacherId,
      createdByTeacherName: newExam.createdByTeacherName || teacherName,
      createdAt: newExam.createdAt || new Date().toISOString(),
    };
    setExams((prev) => [exam, ...prev]);
    addAuditLog('নতুন পরীক্ষা তৈরি', `${exam.title} (${exam.classGrade} - ${exam.subject})`, 'exam');

    // Cloud Firestore Sync
    setDoc(doc(db, 'exams', exam.id), exam).catch((e) =>
      handleFirestoreError(e, OperationType.WRITE, `exams/${exam.id}`)
    );
  };

  const updateExamResults = (examId: string, results: Exam['results']) => {
    const teacherName = currentTeacher?.name ? `${currentTeacher.name} (শিক্ষক)` : 'দিল দিহান (শিক্ষক)';
    const teacherId = currentTeacher?.id || 'tch-dildihan';
    const timestamp = new Date().toISOString();

    const stampedResults = results.map((r) => ({
      ...r,
      updatedByTeacherId: r.updatedByTeacherId || teacherId,
      updatedByTeacherName: r.updatedByTeacherName || teacherName,
      updatedAt: r.updatedAt || timestamp,
    }));

    setExams((prev) => prev.map((ex) => (ex.id === examId ? { ...ex, results: stampedResults } : ex)));

    const examObj = exams.find((e) => e.id === examId);
    addAuditLog('নম্বর এন্ট্রি ও সংরক্ষণ', `${examObj?.title || 'মডেল টেস্ট'} - ${results.length} জন শিক্ষার্থীর ফলাফল হালনাগাদ`, 'exam');

    // Cloud Firestore Sync
    setDoc(doc(db, 'exams', examId), { results: stampedResults }, { merge: true }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `exams/${examId}`)
    );
  };

  // Individual Student Marks Entry / Upload
  const updateStudentSingleExamMark = (
    studentId: string,
    examId: string,
    marksObtained: number,
    remarks?: string,
    scriptPhotoUrl?: string
  ) => {
    const teacherName = currentTeacher?.name ? `${currentTeacher.name} (শিক্ষক)` : 'দিল দিহান (শিক্ষক)';
    const teacherId = currentTeacher?.id || 'tch-dildihan';
    const timestamp = new Date().toISOString();

    let savedResults: Exam['results'] = [];

    setExams((prev) =>
      prev.map((exam) => {
        if (exam.id !== examId) return exam;
        const totalMarks = exam.totalMarks || 100;
        const { grade, gpa } = getGradeAndGPA(marksObtained, totalMarks);
        const existingIdx = exam.results.findIndex((r) => r.studentId === studentId);

        let newResults = [...exam.results];
        if (existingIdx >= 0) {
          newResults[existingIdx] = {
            ...newResults[existingIdx],
            marksObtained,
            grade,
            gpa,
            remarks: remarks !== undefined ? remarks : newResults[existingIdx].remarks,
            updatedByTeacherId: teacherId,
            updatedByTeacherName: teacherName,
            updatedAt: timestamp,
            scriptPhotoUrl: scriptPhotoUrl !== undefined ? scriptPhotoUrl : newResults[existingIdx].scriptPhotoUrl,
          };
        } else {
          newResults.push({
            studentId,
            marksObtained,
            grade,
            gpa,
            remarks: remarks || '',
            updatedByTeacherId: teacherId,
            updatedByTeacherName: teacherName,
            updatedAt: timestamp,
            scriptPhotoUrl,
          });
        }
        savedResults = newResults;
        return {
          ...exam,
          results: newResults,
        };
      })
    );

    const targetStudent = students.find((s) => s.id === studentId);
    const targetExam = exams.find((e) => e.id === examId);
    addAuditLog(
      'ব্যক্তিগত নম্বর এন্ট্রি',
      `${targetStudent?.nameBn || 'শিক্ষার্থী'} (${targetExam?.title || 'পরীক্ষা'}): প্রাপ্ত নম্বর ${toBn(marksObtained)}`,
      'exam'
    );

    // Cloud Firestore Sync - instantly broadcasts to all teachers
    setDoc(doc(db, 'exams', examId), { results: savedResults }, { merge: true }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `exams/${examId}`)
    );
  };

  const deleteExam = (id: string) => {
    const ex = exams.find((item) => item.id === id);
    setExams((prev) => prev.filter((item) => item.id !== id));
    addAuditLog('পরীক্ষা মুছে ফেলা', `${ex?.title || 'পরীক্ষা'} বাতিল করা হয়েছে`, 'exam');

    // Cloud Firestore Sync
    deleteDoc(doc(db, 'exams', id)).catch((e) =>
      handleFirestoreError(e, OperationType.DELETE, `exams/${id}`)
    );
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

    // Cloud Firestore Sync
    setDoc(doc(db, 'routines', routine.id), routine).catch((e) =>
      handleFirestoreError(e, OperationType.WRITE, `routines/${routine.id}`)
    );

    return routine;
  };

  const updateRoutine = (id: string, updated: Partial<ClassRoutine>) => {
    const timestamp = new Date().toISOString();
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updated, updatedAt: timestamp } : r))
    );

    // Cloud Firestore Sync
    setDoc(doc(db, 'routines', id), { ...updated, updatedAt: timestamp }, { merge: true }).catch((e) =>
      handleFirestoreError(e, OperationType.UPDATE, `routines/${id}`)
    );
  };

  const deleteRoutine = (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));

    // Cloud Firestore Sync
    deleteDoc(doc(db, 'routines', id)).catch((e) =>
      handleFirestoreError(e, OperationType.DELETE, `routines/${id}`)
    );
  };

  // Settings & System Backup
  const updateSettings = (newSettings: InstituteSettings) => {
    setSettings(newSettings);

    // Cloud Firestore Sync
    setDoc(doc(db, 'settings', 'coaching'), newSettings).catch((e) =>
      handleFirestoreError(e, OperationType.WRITE, 'settings/coaching')
    );
  };

  const escapeCsvCell = (val: any) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const generateStudentsCsv = () => {
    const headers = [
      'রোল',
      'শিক্ষার্থীর নাম (বাংলা)',
      'ইংরেজি নাম',
      'শ্রেণি',
      'ব্যাচ',
      'অভিভাবকের মোবাইল',
      'পিতা',
      'মাতা',
      'মাসিক ফি (টাকা)',
      'ঠিকানা',
      'ভর্তির তারিখ',
    ];
    const rows = students.map((s) => {
      const b = batches.find((item) => item.id === s.batchId);
      return [
        s.roll,
        s.nameBn,
        s.nameEn || '',
        s.classGrade,
        b?.name || '',
        s.guardianPhone,
        s.fatherName,
        s.motherName,
        s.monthlyFee,
        s.address,
        s.admissionDate,
      ]
        .map(escapeCsvCell)
        .join(',');
    });
    return '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
  };

  const generateFeesCsv = () => {
    const headers = [
      'রসিদ নং',
      'শিক্ষার্থীর নাম',
      'রোল',
      'ফি-এর ধরন',
      'মাস',
      'সাল',
      'তারিখ',
      'পরিশোধ মাধ্যম',
      'আদায়কারী শিক্ষক',
      'আদায়কৃত টাকা',
    ];
    const rows = feePayments.map((p) => {
      const s = students.find((item) => item.id === p.studentId);
      return [
        p.receiptNo,
        s?.nameBn || 'অজ্ঞাত',
        s?.roll || '',
        p.feeType,
        p.month,
        p.year,
        p.date,
        p.paymentMethod,
        p.collectedBy,
        p.paidAmount,
      ]
        .map(escapeCsvCell)
        .join(',');
    });
    return '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
  };

  const generateExpensesCsv = () => {
    const headers = ['শিরোনাম', 'খাত', 'প্রাপক', 'তারিখ', 'মাধ্যম', 'নথিভুক্তকারী শিক্ষক', 'টাকা'];
    const rows = expenses.map((e) =>
      [
        e.title,
        e.category,
        e.recipient,
        e.date,
        e.paymentMethod,
        e.recordedByTeacherName || 'শিক্ষক',
        e.amount,
      ]
        .map(escapeCsvCell)
        .join(',')
    );
    return '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
  };

  const generateExamsCsv = () => {
    const headers = [
      'পরীক্ষার শিরোনাম',
      'শ্রেণি',
      'বিষয়',
      'তারিখ',
      'শিক্ষার্থীর নাম',
      'রোল',
      'প্রাপ্ত নম্বর',
      'মোট নম্বর',
      'গ্রেড',
      'জিপিএ',
      'নম্বর এন্ট্রি করেছেন',
    ];
    const rows: string[] = [];
    exams.forEach((ex) => {
      ex.results.forEach((r) => {
        const s = students.find((std) => std.id === r.studentId);
        rows.push(
          [
            ex.title,
            ex.classGrade,
            ex.subject,
            ex.examDate,
            s?.nameBn || '',
            s?.roll || '',
            r.marksObtained,
            ex.totalMarks,
            r.grade,
            r.gpa,
            r.updatedByTeacherName || 'শিক্ষক',
          ]
            .map(escapeCsvCell)
            .join(',')
        );
      });
    });
    return '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
  };

  const exportCsvReport = (type: 'students' | 'fees' | 'expenses' | 'exams') => {
    let content = '';
    let filename = '';
    const dateStr = new Date().toISOString().slice(0, 10);

    if (type === 'students') {
      content = generateStudentsCsv();
      filename = `education_care_students_${dateStr}.csv`;
    } else if (type === 'fees') {
      content = generateFeesCsv();
      filename = `education_care_fee_receipts_${dateStr}.csv`;
    } else if (type === 'expenses') {
      content = generateExpensesCsv();
      filename = `education_care_expenses_${dateStr}.csv`;
    } else if (type === 'exams') {
      content = generateExamsCsv();
      filename = `education_care_exam_results_${dateStr}.csv`;
    }

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportZipArchive = async () => {
    const zip = new JSZip();
    const dateStr = new Date().toISOString().slice(0, 10);

    // 1. JSON Database Dump
    const exportData = {
      settings,
      students,
      batches,
      teachers: teachers.map((t) => ({ ...t, pin: undefined })),
      attendance,
      feePayments,
      expenses,
      exams,
      routines,
      exportDate: new Date().toISOString(),
      institute: settings.name,
      district: settings.district,
    };
    zip.file('01_education_care_database.json', JSON.stringify(exportData, null, 2));

    // 2. CSV reports
    zip.file('02_students_directory.csv', generateStudentsCsv());
    zip.file('03_fee_collection_ledger.csv', generateFeesCsv());
    zip.file('04_expenses_summary.csv', generateExpensesCsv());
    zip.file('05_exam_results_sheet.csv', generateExamsCsv());

    // 3. Security Audit Logs CSV
    const auditHeaders = ['অ্যাকশন', 'বিবরণ', 'শিক্ষক', 'সময়'];
    const auditRows = auditLogs.map((log) =>
      [log.action, log.target, log.teacherName, log.timestamp].map(escapeCsvCell).join(',')
    );
    zip.file(
      '06_security_audit_logs.csv',
      '\uFEFF' + [auditHeaders.map(escapeCsvCell).join(','), ...auditRows].join('\r\n')
    );

    // 4. Readme Note
    const readme = `========================================================================
এডুকেশন কেয়ার কোচিং সেন্টার - সুরক্ষিত ডেটা ব্যাকআপ ও অডিট প্যাকেজ
ঠিকানা: গুলিয়াখালী রোড, সীতাকুণ্ড, চট্টগ্রাম
হটলাইন: ${settings.phone}
ডাউনলোড তারিখ: ${new Date().toLocaleString('bn-BD')}
========================================================================
এই জিপ (ZIP) প্যাকেজে কোচিং সেন্টারের সকল ডেটাবেস, শিক্ষার্থী তালিকা, 
আদায়কৃত ফি, খরচের খাতা, পরীক্ষার ফলাফল এবং সিকিউরিটি অডিট ট্রেইল সংরক্ষিত রয়েছে।
ফাইলগুলো সরাসরি মাইক্রোসফট এক্সেল (Excel), গুগল শিট বা ডেটাবেসে খোলা যাবে।
`;
    zip.file('README_SECURITY_BACKUP.txt', readme);

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `education_care_secure_backup_${dateStr}.zip`;
    a.click();
    URL.revokeObjectURL(url);
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
    setTeachers(defaultStaffTeachers);
    defaultStaffTeachers.forEach((t) => {
      setDoc(doc(db, 'teachers', t.id), t).catch(() => {});
    });
  };

  const clearAllStudents = () => {
    setStudents([]);
    localStorage.removeItem(`${STORAGE_KEY}_students`);
  };

  const clearAllTeachers = () => {
    setTeachers([]);
    localStorage.removeItem(`${STORAGE_KEY}_teachers`);
  };

  // Empty all official records
  const clearAllData = () => {
    setStudents([]);
    setBatches([]);
    setTeachers([]);
    setAttendance([]);
    setFeePayments([]);
    setExpenses([]);
    setExams([]);
    setRoutines(initialRoutines);

    localStorage.removeItem(`${STORAGE_KEY}_students`);
    localStorage.removeItem(`${STORAGE_KEY}_batches`);
    localStorage.removeItem(`${STORAGE_KEY}_teachers`);
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
        isCloudSynced,
        currentTeacher,
        loginTeacher,
        loginWithPhoneAndPasskey,
        changeTeacherPasskey,
        logoutTeacher,
        isScreenLocked,
        lockScreen,
        unlockScreen,
        auditLogs,
        addAuditLog,
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
        updateStudentSingleExamMark,
        deleteExam,
        routines,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        updateSettings,
        exportDatabase,
        exportCsvReport,
        exportZipArchive,
        importDatabase,
        clearAllData,
        clearAllStudents,
        clearAllTeachers,
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
