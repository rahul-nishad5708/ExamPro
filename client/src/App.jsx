import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Layouts & Route guards
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';

// Entry & Auth pages
import StudentEntryPage from './pages/StudentEntryPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';

// Student / Examination pages
import ExamsListPage from './pages/ExamsListPage';
import ExamInstructionsPage from './pages/ExamInstructionsPage';
import ExamAttemptPage from './pages/ExamAttemptPage';
import ResultsListPage from './pages/ResultsListPage';
import ResultDetailPage from './pages/ResultDetailPage';
import StudentDashboard from './pages/StudentDashboard';

// Practice Test pages
import PracticeTestsListPage from './pages/PracticeTestsListPage';
import PracticeTestInstructionsPage from './pages/PracticeTestInstructionsPage';
import PracticeAttemptPage from './pages/PracticeAttemptPage';
import PracticeResultPage from './pages/PracticeResultPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminExamsPage from './pages/admin/AdminExamsPage';
import AdminExamFormPage from './pages/admin/AdminExamFormPage';
import AdminQuestionsPage from './pages/admin/AdminQuestionsPage';
import AdminGlobalQuestionsPage from './pages/admin/AdminGlobalQuestionsPage';
import AdminResultsPage from './pages/admin/AdminResultsPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminPracticeTestsPage from './pages/admin/AdminPracticeTestsPage';
import AdminStudentActivityPage from './pages/admin/AdminStudentActivityPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '1rem',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />

        <Routes>
          {/* Public Student Entry Flow */}
          <Route path="/" element={<StudentEntryPage />} />
          <Route path="/entry" element={<StudentEntryPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route path="/forgot-password" element={<Navigate to="/" replace />} />

          {/* Fullscreen Proctored Exam Attempt Engine */}
          <Route
            path="/exams/:id/attempt"
            element={
              <ProtectedRoute>
                <ExamAttemptPage />
              </ProtectedRoute>
            }
          />

          {/* Fullscreen Interactive Practice Engine */}
          <Route
            path="/practice-tests/:id/attempt"
            element={
              <ProtectedRoute>
                <PracticeAttemptPage />
              </ProtectedRoute>
            }
          />

          {/* Student Protected Portal (Within DashboardLayout) */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/exams" element={<ExamsListPage />} />
            <Route path="/exams/:id/instructions" element={<ExamInstructionsPage />} />
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/results" element={<ResultsListPage />} />
            <Route path="/results/:id" element={<ResultDetailPage />} />

            {/* Practice Test Routes */}
            <Route path="/practice-tests" element={<PracticeTestsListPage />} />
            <Route path="/practice-tests/:id" element={<PracticeTestInstructionsPage />} />
            <Route path="/practice-results/:id" element={<PracticeResultPage />} />
          </Route>

          {/* Admin Protected Console */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <DashboardLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="exams" element={<AdminExamsPage />} />
            <Route path="exams/create" element={<AdminExamFormPage />} />
            <Route path="exams/:id/edit" element={<AdminExamFormPage />} />
            <Route path="exams/:id/questions" element={<AdminQuestionsPage />} />
            <Route path="questions" element={<AdminGlobalQuestionsPage />} />
            <Route path="results" element={<AdminResultsPage />} />
            <Route path="students" element={<AdminStudentsPage />} />
            <Route path="practice-tests" element={<AdminPracticeTestsPage />} />
            <Route path="student-activity" element={<AdminStudentActivityPage />} />
          </Route>

          {/* Catch-all: Redirect to student entry */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
