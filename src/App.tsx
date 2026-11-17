import React, { useEffect, useRef, useState } from 'react';
import { CoachingProvider, useCoaching } from './context/CoachingContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { StudentManagement } from './components/students/StudentManagement';
import { BatchManagement } from './components/batches/BatchManagement';
import { RoutineManagement } from './components/routine/RoutineManagement';
import { AttendanceManagement } from './components/attendance/AttendanceManagement';
import { AccountsManagement } from './components/accounts/AccountsManagement';
import { ExamManagement } from './components/exams/ExamManagement';
import { TeacherManagement } from './components/teachers/TeacherManagement';
import { SettingsManagement } from './components/settings/SettingsManagement';

// Landing Page Gatekeeper
import { LandingPage } from './components/landing/LandingPage';

// Modals
import { AddEditStudentModal } from './components/students/AddEditStudentModal';
import { StudentProfileModal } from './components/students/StudentProfileModal';
import { StudentIdCardModal } from './components/students/StudentIdCardModal';
import { CollectFeeModal } from './components/accounts/CollectFeeModal';
import { MoneyReceiptModal } from './components/accounts/MoneyReceiptModal';
import { TeacherAuthModal } from './components/auth/TeacherAuthModal';
import { ChangePasskeyModal } from './components/auth/ChangePasskeyModal';
import { TeacherWelcomeModal } from './components/auth/TeacherWelcomeModal';
import { ScreenLockOverlay } from './components/auth/ScreenLockOverlay';
import { IndividualMarksModal } from './components/exams/IndividualMarksModal';
import { PWAUpdateBanner } from './components/pwa/PWAUpdateBanner';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { usePWAUpdate } from './hooks/usePWAUpdate';

import { TabType, Student, FeePayment, Teacher } from './types';
import { LayoutDashboard, Users, CreditCard, Award, Menu as MenuIcon } from 'lucide-react';

export function CoachingApp() {
  const { currentTeacher, students, batches, settings } = useCoaching();

  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modal States
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [printingIdCardStudent, setPrintingIdCardStudent] = useState<Student | null>(null);

  const [isCollectFeeOpen, setIsCollectFeeOpen] = useState(false);
  const [collectFeeStudent, setCollectFeeStudent] = useState<Student | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<FeePayment | null>(null);

  // Teacher Auth, Passkey & Individual Marks Modals
  const [isTeacherAuthOpen, setIsTeacherAuthOpen] = useState(false);
  const [isChangePasskeyOpen, setIsChangePasskeyOpen] = useState(false);
  const [passkeyModalTab, setPasskeyModalTab] = useState<'passkey' | 'phone'>('passkey');
  const [individualMarksStudent, setIndividualMarksStudent] = useState<Student | null>(null);
  const [welcomeTeacher, setWelcomeTeacher] = useState<Teacher | null>(null);
  const lastWelcomedTeacherIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentTeacher) {
      lastWelcomedTeacherIdRef.current = null;
      setWelcomeTeacher(null);
      return;
    }
    if (lastWelcomedTeacherIdRef.current !== currentTeacher.id) {
      lastWelcomedTeacherIdRef.current = currentTeacher.id;
      setWelcomeTeacher(currentTeacher);
    }
  }, [currentTeacher]);

  // If no teacher is logged in, strictly display the Landing Page Gatekeeper
  if (!currentTeacher) {
    return <LandingPage onSuccessLogin={() => {}} />;
  }

  // Handlers
  const handleOpenNewAdmission = () => {
    setEditingStudent(null);
    setIsAdmissionModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsAdmissionModalOpen(true);
  };

  const handleCollectFeeForStudent = (student: Student) => {
    setCollectFeeStudent(student);
    setIsCollectFeeOpen(true);
  };

  const handleOpenGeneralCollectFee = () => {
    setCollectFeeStudent(null);
    setIsCollectFeeOpen(true);
  };

  const handleFeePaymentSuccess = (payment: FeePayment) => {
    setViewingReceipt(payment);
  };

  const idCardBatch = printingIdCardStudent
    ? batches.find((b) => b.id === printingIdCardStudent.batchId)
    : undefined;
  const receiptStudent = viewingReceipt
    ? students.find((s) => s.id === viewingReceipt.studentId)
    : undefined;
  const receiptBatch = receiptStudent
    ? batches.find((b) => b.id === receiptStudent.batchId)
    : undefined;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        onNewAdmission={handleOpenNewAdmission}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full min-w-0 app-main-shell">
        <Header
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onNavigate={(tab) => setCurrentTab(tab)}
          onOpenNewAdmission={handleOpenNewAdmission}
          onOpenQuickFee={handleOpenGeneralCollectFee}
          onOpenTeacherAuth={() => setIsTeacherAuthOpen(true)}
          onOpenChangePasskey={() => {
            setPasskeyModalTab('passkey');
            setIsChangePasskeyOpen(true);
          }}
        />

        {/* Scrollable Main Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F4F6FA] dark:bg-slate-950 transition-colors duration-200 pb-24 md:pb-10">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <Dashboard
                onNavigate={(tab) => setCurrentTab(tab)}
                onOpenNewAdmission={handleOpenNewAdmission}
                onOpenQuickFee={handleOpenGeneralCollectFee}
                onViewReceipt={(p) => setViewingReceipt(p)}
                onViewStudent={(std) => setViewingStudent(std)}
              />
            )}

            {currentTab === 'students' && (
              <StudentManagement
                onOpenNewAdmission={handleOpenNewAdmission}
                onEditStudent={handleEditStudent}
                onViewStudent={(std) => setViewingStudent(std)}
                onPrintIdCard={(std) => setPrintingIdCardStudent(std)}
                onCollectFee={handleCollectFeeForStudent}
                onEnterMarks={(std) => setIndividualMarksStudent(std)}
              />
            )}

            {currentTab === 'batches' && <BatchManagement />}

            {currentTab === 'routine' && <RoutineManagement />}

            {currentTab === 'attendance' && <AttendanceManagement />}

            {currentTab === 'accounts' && (
              <AccountsManagement
                onOpenCollectFee={handleOpenGeneralCollectFee}
                onViewReceipt={(p) => setViewingReceipt(p)}
              />
            )}

            {currentTab === 'exams' && <ExamManagement />}

            {currentTab === 'teachers' && <TeacherManagement />}

            {currentTab === 'settings' && <SettingsManagement />}
          </div>
        </main>

        {/* Mobile Bottom Tab Bar (Matches Reference Image Bottom Bar) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-5 h-16 px-1 no-print">
          <button
            type="button"
            onClick={() => setCurrentTab('dashboard')}
            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition cursor-pointer ${
              currentTab === 'dashboard' ? 'text-[#0F3382] dark:text-blue-400' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>হোম</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('students')}
            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition cursor-pointer ${
              currentTab === 'students' ? 'text-[#0F3382] dark:text-blue-400' : 'text-slate-400'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>শিক্ষার্থী</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('accounts')}
            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition cursor-pointer ${
              currentTab === 'accounts' ? 'text-[#0F3382] dark:text-blue-400' : 'text-slate-400'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>হিসাব</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('exams')}
            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition cursor-pointer ${
              currentTab === 'exams' ? 'text-[#0F3382] dark:text-blue-400' : 'text-slate-400'
            }`}
          >
            <Award className="w-5 h-5" />
            <span>পরীক্ষা</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-slate-400 hover:text-[#0F3382] transition cursor-pointer"
          >
            <MenuIcon className="w-5 h-5" />
            <span>মেনু</span>
          </button>
        </nav>
      </div>

      {/* Global Modals */}
      {isAdmissionModalOpen && (
        <AddEditStudentModal
          isOpen={isAdmissionModalOpen}
          onClose={() => {
            setIsAdmissionModalOpen(false);
            setEditingStudent(null);
          }}
          initialStudent={editingStudent || undefined}
        />
      )}

      {viewingStudent && (
        <StudentProfileModal
          isOpen={!!viewingStudent}
          student={viewingStudent}
          onClose={() => setViewingStudent(null)}
          onEdit={(std) => {
            setViewingStudent(null);
            handleEditStudent(std);
          }}
          onPrintIdCard={(std) => {
            setViewingStudent(null);
            setPrintingIdCardStudent(std);
          }}
          onCollectFee={(std) => {
            setViewingStudent(null);
            handleCollectFeeForStudent(std);
          }}
          onEnterMarks={(std) => {
            setViewingStudent(null);
            setIndividualMarksStudent(std);
          }}
        />
      )}

      {printingIdCardStudent && (
        <StudentIdCardModal
          isOpen={!!printingIdCardStudent}
          student={printingIdCardStudent}
          batch={idCardBatch}
          settings={settings}
          onClose={() => setPrintingIdCardStudent(null)}
        />
      )}

      {isCollectFeeOpen && (
        <CollectFeeModal
          isOpen={isCollectFeeOpen}
          onClose={() => {
            setIsCollectFeeOpen(false);
            setCollectFeeStudent(null);
          }}
          preSelectedStudent={collectFeeStudent}
          onPaymentSuccess={handleFeePaymentSuccess}
        />
      )}

      {viewingReceipt && (
        <MoneyReceiptModal
          isOpen={!!viewingReceipt}
          payment={viewingReceipt}
          student={receiptStudent}
          batch={receiptBatch}
          settings={settings}
          onClose={() => setViewingReceipt(null)}
        />
      )}

      {/* Teacher Authentication Modal */}
      <TeacherAuthModal
        isOpen={isTeacherAuthOpen}
        onClose={() => setIsTeacherAuthOpen(false)}
        onOpenChangePasskey={(tab) => {
          setIsTeacherAuthOpen(false);
          setPasskeyModalTab(tab);
          setIsChangePasskeyOpen(true);
        }}
      />

      {/* Change Passkey & Phone Modal */}
      <ChangePasskeyModal
        isOpen={isChangePasskeyOpen}
        onClose={() => setIsChangePasskeyOpen(false)}
        defaultTab={passkeyModalTab}
      />

      {/* Individual Student Marks Upload Modal */}
      {individualMarksStudent && (
        <IndividualMarksModal
          isOpen={!!individualMarksStudent}
          student={individualMarksStudent}
          onClose={() => setIndividualMarksStudent(null)}
        />
      )}

      {/* Post-Login Welcome & Password Security Alert */}
      <TeacherWelcomeModal
        teacher={welcomeTeacher}
        onClose={() => setWelcomeTeacher(null)}
      />

      {/* Security Screen Lock Overlay */}
      <ScreenLockOverlay />
    </div>
  );
}

export default function App() {
  const {
    updateAvailable,
    isUpdating,
    isDismissed,
    applyUpdate,
    dismissBanner,
    reopenBanner,
  } = usePWAUpdate();

  return (
    <CoachingProvider>
      <CoachingApp />
      <PWAUpdateBanner
        updateAvailable={updateAvailable}
        isUpdating={isUpdating}
        isDismissed={isDismissed}
        onUpdateNow={() => void applyUpdate()}
        onDismiss={dismissBanner}
        onReopen={reopenBanner}
      />
      <OfflineIndicator />
    </CoachingProvider>
  );
}
