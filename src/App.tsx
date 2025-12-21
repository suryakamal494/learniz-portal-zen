
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import NotFound from './pages/NotFound';
import LoginPage from './pages/LoginPage';
import BrochurePage from './pages/BrochurePage';

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import { TeacherLayout } from './components/teacher/layout/TeacherLayout';
import TeacherSchedulePage from './pages/teacher/TeacherSchedulePage';
import TeacherMessagesPage from './pages/teacher/TeacherMessagesPage';
import TeacherNotificationsPage from './pages/teacher/TeacherNotificationsPage';
import QuestionBankPage from './pages/teacher/QuestionBankPage';

// Teacher Batches
import BatchListingPage from './pages/teacher/batches/BatchListingPage';
import AddBatchPage from './pages/teacher/batches/AddBatchPage';
import ViewStudentsPage from './pages/teacher/batches/ViewStudentsPage';
import AssignLMSPage from './pages/teacher/batches/AssignLMSPage';
import BatchNotesAssignmentPage from './pages/teacher/batches/BatchNotesAssignmentPage';

// Teacher Exams
import ExamsMainPage from './pages/teacher/exams/ExamsMainPage';
import CreateExamPage from './pages/teacher/exams/CreateExamPage';
import EditExamPage from './pages/teacher/exams/EditExamPage';
import UpdateQuestionsPage from './pages/teacher/exams/UpdateQuestionsPage';
import UpdateBatchesPage from './pages/teacher/exams/UpdateBatchesPage';
import QuestionBankAddPage from './pages/teacher/exams/QuestionBankAddPage';
import QuestionBankViewPage from './pages/teacher/exams/QuestionBankViewPage';
import DirectoryPage from './pages/teacher/exams/DirectoryPage';
import InstructionsPage from './pages/teacher/exams/InstructionsPage';
import CreateInstructionPage from './pages/teacher/exams/CreateInstructionPage';
import EditInstructionPage from './pages/teacher/exams/EditInstructionPage';

// Teacher Schedule
import CreateClassPage from './pages/teacher/schedule/CreateClassPage';
import AssignLMSNotesPage from './pages/teacher/schedule/AssignLMSNotesPage';
import EditSchedulePage from './pages/teacher/schedule/EditSchedulePage';

// Teacher LMS
import LMSContentPage from './pages/teacher/lms/LMSContentPage';
import CreateLMSContentPage from './pages/teacher/lms/content/CreateLMSContentPage';
import ViewLMSContentPage from './pages/teacher/lms/content/ViewLMSContentPage';
import ContentLibraryPage from './pages/teacher/lms/content/ContentLibraryPage';
import LMSSeriesPage from './pages/teacher/lms/LMSSeriesPage';
import CreateLMSSeriesPage from './pages/teacher/lms/CreateLMSSeriesPage';
import UpdateLMSSeriesPage from './pages/teacher/lms/UpdateLMSSeriesPage';
import UpdateExamOrderPage from './pages/teacher/lms/UpdateExamOrderPage';
import LMSSeriesPreviewPage from './pages/teacher/lms/LMSSeriesPreviewPage';

// Teacher Reports - Enhanced
import ReportsMainPage from './pages/teacher/reports/ReportsMainPage';
import AttendancePage from './pages/teacher/reports/AttendancePage';
import BatchReportsPage from './pages/teacher/reports/BatchReportsPage';
import ChapterAnalyticsListPage from './pages/teacher/reports/ChapterAnalyticsListPage';
import ChapterAnalyticsPage from './pages/teacher/reports/ChapterAnalyticsPage';
import DetailedExamReportPage from './pages/teacher/reports/DetailedExamReportPage';

// Teacher LMS Additional Pages
import LMSMainPage from './pages/teacher/lms/LMSMainPage';
import NotesPage from './pages/teacher/lms/NotesPage';
import LMSDirectoryPage from './pages/teacher/lms/LMSDirectoryPage';
import CreateNotesPage from './pages/teacher/lms/notes/CreateNotesPage';

// Institute Analytics Pages
import InstituteSnapshotPage from './pages/institute/InstituteSnapshotPage';
import TeacherPerformancePage from './pages/institute/TeacherPerformancePage';
import TeacherDetailPage from './pages/institute/TeacherDetailPage';
import SubjectHealthPage from './pages/institute/SubjectHealthPage';
import ClassOverviewPage from './pages/institute/ClassOverviewPage';
import GrandTestsPage from './pages/institute/GrandTestsPage';
import GrandTestDetailPage from './pages/institute/GrandTestDetailPage';

// Institute Layout with Navigation
function InstituteLayout() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);
  
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link to="/institute" className="text-xl font-bold text-primary">
                Academic Insights
              </Link>
              <div className="hidden md:flex items-center gap-1">
                <Link 
                  to="/institute" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/institute' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  Snapshot
                </Link>
                <Link 
                  to="/institute/teachers" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/institute/teachers') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  Teachers
                </Link>
                <Link 
                  to="/institute/subjects" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/institute/subjects') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  Subjects
                </Link>
                <Link 
                  to="/institute/classes" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/institute/classes' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  Classes
                </Link>
                <Link 
                  to="/institute/grand-tests" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/institute/grand-tests') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  Grand Tests
                </Link>
              </div>
            </div>
            <Link 
              to="/teacher" 
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              ← Back to Teacher Panel
            </Link>
          </div>
          {/* Mobile nav */}
          <div className="flex md:hidden items-center gap-1 pb-3 overflow-x-auto">
            <Link 
              to="/institute" 
              className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap ${
                location.pathname === '/institute' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
              }`}
            >
              Snapshot
            </Link>
            <Link 
              to="/institute/teachers" 
              className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap ${
                isActive('/institute/teachers') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
              }`}
            >
              Teachers
            </Link>
            <Link 
              to="/institute/subjects" 
              className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap ${
                isActive('/institute/subjects') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
              }`}
            >
              Subjects
            </Link>
            <Link 
              to="/institute/classes" 
              className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap ${
                location.pathname === '/institute/classes' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
              }`}
            >
              Classes
            </Link>
            <Link 
              to="/institute/grand-tests" 
              className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap ${
                isActive('/institute/grand-tests') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
              }`}
            >
              Grand Tests
            </Link>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}

function TeacherLayoutWrapper() {
  return (
    <TeacherLayout>
      <Outlet />
    </TeacherLayout>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/brochure" element={<BrochurePage />} />

        {/* Teacher Routes */}
        <Route path="/teacher" element={<TeacherLayoutWrapper />}>
          <Route index element={<TeacherDashboard />} />
          {/* Classroom Routes */}
          <Route path="classroom/schedule" element={<TeacherSchedulePage />} />
          <Route path="classroom/schedule/create" element={<CreateClassPage />} />
          <Route path="classroom/schedule/assign/:scheduleId" element={<AssignLMSNotesPage />} />
          <Route path="classroom/schedule/edit/:scheduleId" element={<EditSchedulePage />} />
          <Route path="classroom/live-quizzes" element={<ExamsMainPage />} />
          <Route path="classroom/notes" element={<NotesPage />} />
          <Route path="classroom/notes/create" element={<CreateNotesPage />} />
          <Route path="messages" element={<TeacherMessagesPage />} />
          <Route path="notifications" element={<TeacherNotificationsPage />} />
          
          {/* Question Bank Routes */}
          <Route path="question-bank" element={<QuestionBankPage />} />
          <Route path="question-bank/add" element={<QuestionBankAddPage />} />
          <Route path="question-bank/:subjectId" element={<QuestionBankViewPage />} />
          <Route path="question-bank/directory" element={<DirectoryPage />} />

          {/* Instructions Route - Alias for convenience */}
          <Route path="instructions" element={<Navigate to="/teacher/exams/instructions" replace />} />

          {/* Reports Routes - Enhanced */}
          <Route path="reports" element={<ReportsMainPage />} />
          <Route path="reports/attendance" element={<AttendancePage />} />
          <Route path="reports/batch" element={<BatchReportsPage />} />
          <Route path="reports/batch/:batchId/exam/:examId" element={<DetailedExamReportPage />} />
          <Route path="reports/chapter-analytics" element={<ChapterAnalyticsListPage />} />
          <Route path="reports/chapter-analytics/:chapterId" element={<ChapterAnalyticsPage />} />

          {/* Batches */}
          <Route path="batches" element={<BatchListingPage />} />
          <Route path="batches/add" element={<AddBatchPage />} />
          <Route path="batches/:batchId/students" element={<ViewStudentsPage />} />
          <Route path="batches/:batchId/assign-lms" element={<AssignLMSPage />} />
          <Route path="batches/:batchId/assign-notes" element={<BatchNotesAssignmentPage />} />

          {/* Exams */}
          <Route path="exams" element={<ExamsMainPage />} />
          <Route path="exams/create" element={<CreateExamPage />} />
          <Route path="exams/:examId/edit" element={<EditExamPage />} />
          <Route path="exams/:examId/update-questions" element={<UpdateQuestionsPage />} />
          <Route path="exams/:examId/update-batches" element={<UpdateBatchesPage />} />
          <Route path="exams/directory" element={<DirectoryPage />} />
          <Route path="exams/instructions" element={<InstructionsPage />} />
          <Route path="exams/instructions/create" element={<CreateInstructionPage />} />
          <Route path="exams/instructions/:instructionId/edit" element={<EditInstructionPage />} />

          {/* LMS Routes - Enhanced */}
          <Route path="lms" element={<LMSMainPage />} />
          <Route path="lms/content" element={<LMSContentPage />} />
          <Route path="lms/content/create" element={<CreateLMSContentPage />} />
          <Route path="lms/content/:contentId/view" element={<ViewLMSContentPage />} />
          <Route path="lms/library" element={<ContentLibraryPage />} />
          <Route path="lms/series" element={<LMSSeriesPage />} />
          <Route path="lms/series/create" element={<CreateLMSSeriesPage />} />
          <Route path="lms/series/:seriesId/update" element={<UpdateLMSSeriesPage />} />
          <Route path="lms/series/:seriesId/update-order" element={<UpdateExamOrderPage />} />
          <Route path="lms/series/:seriesId/preview" element={<LMSSeriesPreviewPage />} />
          <Route path="lms/directory" element={<LMSDirectoryPage />} />
        </Route>

        {/* Institute Analytics Routes */}
        <Route path="/institute" element={<InstituteLayout />}>
          <Route index element={<InstituteSnapshotPage />} />
          <Route path="teachers" element={<TeacherPerformancePage />} />
          <Route path="teachers/:teacherId" element={<TeacherDetailPage />} />
          <Route path="subjects" element={<SubjectHealthPage />} />
          <Route path="classes" element={<ClassOverviewPage />} />
          <Route path="grand-tests" element={<GrandTestsPage />} />
          <Route path="grand-tests/:testId" element={<GrandTestDetailPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
