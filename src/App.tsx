import React, { useState } from 'react';
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
import { ScreenLockOverlay } from './components/auth/ScreenLockOverlay';
import { IndividualMarksModal } from './components/exams/IndividualMarksModal';

import { TabType, Student, FeePayment } from './types';

export function CoachingApp() {
  const { currentTeacher } = useCoaching();

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
  const [individualMarksStudent, setIndividualMarksStudent] = useState<Student | null>(null);

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
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full min-w-0">
        <Header
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onNavigate={(tab) => setCurrentTab(tab)}
          onOpenNewAdmission={handleOpenNewAdmission}
          onOpenQuickFee={handleOpenGeneralCollectFee}
          onOpenTeacherAuth={() => setIsTeacherAuthOpen(true)}
          onOpenChangePasskey={() => setIsChangePasskeyOpen(true)}
        />

        {/* Scrollable Main Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
          <div className="max-w-7xl mx-auto pb-10">
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
          student={printingIdCardStudent}
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
          initialStudent={collectFeeStudent || undefined}
          onFeeSuccess={handleFeePaymentSuccess}
        />
      )}

      {viewingReceipt && (
        <MoneyReceiptModal
          payment={viewingReceipt}
          onClose={() => setViewingReceipt(null)}
        />
      )}

      {/* Teacher Authentication Modal */}
      <TeacherAuthModal
        isOpen={isTeacherAuthOpen}
        onClose={() => setIsTeacherAuthOpen(false)}
      />

      {/* Change Passkey Modal */}
      <ChangePasskeyModal
        isOpen={isChangePasskeyOpen}
        onClose={() => setIsChangePasskeyOpen(false)}
      />

      {/* Individual Student Marks Upload Modal */}
      {individualMarksStudent && (
        <IndividualMarksModal
          isOpen={!!individualMarksStudent}
          student={individualMarksStudent}
          onClose={() => setIndividualMarksStudent(null)}
        />
      )}

      {/* Security Screen Lock Overlay */}
      <ScreenLockOverlay />
    </div>
  );
}

export default function App() {
  return (
    <CoachingProvider>
      <CoachingApp />
    </CoachingProvider>
  );
}
