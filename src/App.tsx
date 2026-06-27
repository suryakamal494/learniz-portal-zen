
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
import SectionWorkspacePage from './pages/teacher/batches/SectionWorkspacePage';
import ViewStudentsPage from './pages/teacher/batches/ViewStudentsPage';
import AssignLMSPage from './pages/teacher/batches/AssignLMSPage';
import BatchNotesAssignmentPage from './pages/teacher/batches/BatchNotesAssignmentPage';
import BatchProgramsPage from './pages/teacher/batches/BatchProgramsPage';
import BatchProgressTrackerPage from './pages/teacher/batches/BatchProgressTrackerPage';

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
import AIExamGeneratorPage from './pages/teacher/exams/AIExamGeneratorPage';

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
import AIPPTGeneratorPage from './pages/teacher/lms/AIPPTGeneratorPage';

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

// Teacher Courses
import CoursesMainPage from './pages/teacher/courses/CoursesMainPage';
import CreateCoursePage from './pages/teacher/courses/CreateCoursePage';
import EditCoursePage from './pages/teacher/courses/EditCoursePage';

// Institute Analytics Pages
import InstituteSnapshotPage from './pages/institute/InstituteSnapshotPage';
import InstituteDashboardPage from './pages/institute/InstituteDashboardPage';
import TeacherPerformancePage from './pages/institute/TeacherPerformancePage';
import TeacherDetailPage from './pages/institute/TeacherDetailPage';
import SubjectHealthPage from './pages/institute/SubjectHealthPage';
import ClassOverviewPage from './pages/institute/ClassOverviewPage';
import GrandTestsPage from './pages/institute/GrandTestsPage';
import GrandTestDetailPage from './pages/institute/GrandTestDetailPage';
import ScheduleTrackingPage from './pages/institute/ScheduleTrackingPage';
import LearningResponsePage from './pages/institute/LearningResponsePage';
import StudentReportsPage from './pages/institute/StudentReportsPage';
import SectionStudentsPage from './pages/institute/SectionStudentsPage';
import StudentDetailPage from './pages/institute/StudentDetailPage';
import { InstituteLayout } from './components/institute/InstituteLayout';
import InstituteExamsPage from './pages/institute/exams/InstituteExamsPage';
import ProgramsListPage from './pages/institute/programs/ProgramsListPage';

import ProgramPreviewPage from './pages/institute/programs/ProgramPreviewPage';
import ProgramSchedulePage from './pages/institute/programs/ProgramSchedulePage';
import InstituteHolidaysPage from './pages/institute/programs/InstituteHolidaysPage';


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
          <Route path="reports/section" element={<BatchReportsPage />} />
          <Route path="reports/section/:batchId/exam/:examId" element={<DetailedExamReportPage />} />
          <Route path="reports/chapter-analytics" element={<ChapterAnalyticsListPage />} />
          <Route path="reports/chapter-analytics/:chapterId" element={<ChapterAnalyticsPage />} />

          {/* Batches */}
          <Route path="batches" element={<BatchListingPage />} />
          <Route path="batches/add" element={<AddBatchPage />} />
          <Route path="batches/:batchId" element={<SectionWorkspacePage />} />
          <Route path="batches/:batchId/students" element={<ViewStudentsPage />} />
          <Route path="batches/:batchId/assign-lms" element={<AssignLMSPage />} />
          <Route path="batches/:batchId/assign-notes" element={<BatchNotesAssignmentPage />} />
          <Route path="batches/:batchId/programs" element={<BatchProgramsPage />} />
          <Route path="batches/:batchId/progress" element={<BatchProgressTrackerPage />} />

          {/* Exams */}
          <Route path="exams" element={<ExamsMainPage />} />
          <Route path="exams/ai-generator" element={<AIExamGeneratorPage />} />
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
          <Route path="lms/ai-ppt-generator" element={<AIPPTGeneratorPage />} />

          {/* Courses Routes */}
          {/* Courses Routes */}
          <Route path="courses" element={<CoursesMainPage />} />
          <Route path="courses/create" element={<CreateCoursePage />} />
          <Route path="courses/:courseId/edit" element={<EditCoursePage />} />
        </Route>

        {/* Institute Panel Routes */}
        <Route path="/institute" element={<InstituteLayout />}>
          <Route index element={<Navigate to="/institute/insights" replace />} />

          {/* Academic Insights module */}
          <Route path="insights" element={<InstituteSnapshotPage />} />
          <Route path="insights/dashboard" element={<InstituteDashboardPage />} />
          <Route path="insights/teachers" element={<TeacherPerformancePage />} />
          <Route path="insights/teachers/:teacherId" element={<TeacherDetailPage />} />
          <Route path="insights/subjects" element={<SubjectHealthPage />} />
          <Route path="insights/classes" element={<ClassOverviewPage />} />
          <Route path="insights/students" element={<StudentReportsPage />} />
          <Route path="insights/students/:classId/:sectionId" element={<SectionStudentsPage />} />
          <Route path="insights/students/:classId/:sectionId/:studentId" element={<StudentDetailPage />} />
          <Route path="insights/grand-tests" element={<GrandTestsPage />} />
          <Route path="insights/grand-tests/:testId" element={<GrandTestDetailPage />} />
          <Route path="insights/schedule-tracking" element={<ScheduleTrackingPage />} />
          <Route path="insights/learning-response" element={<LearningResponsePage />} />

          {/* Programs module */}
          <Route path="programs" element={<ProgramsListPage />} />
          <Route path="programs/holidays" element={<InstituteHolidaysPage />} />
          {/* Legacy: Teaching Hours moved into the Schedule wizard's Step 2. */}
          <Route
            path="programs/:programId/hours"
            element={<Navigate to="../schedule" replace />}
          />
          <Route path="programs/:programId/preview" element={<ProgramPreviewPage />} />
          <Route path="programs/:programId/schedule" element={<ProgramSchedulePage />} />


          {/* Legacy timetable → programs */}
          <Route path="timetable" element={<Navigate to="/institute/programs" replace />} />

          {/* Exam module */}
          <Route path="exams" element={<InstituteExamsPage />} />

          {/* Legacy redirects */}
          <Route path="dashboard" element={<Navigate to="/institute/insights/dashboard" replace />} />
          <Route path="teachers" element={<Navigate to="/institute/insights/teachers" replace />} />
          <Route path="teachers/:teacherId" element={<Navigate to="/institute/insights/teachers" replace />} />
          <Route path="subjects" element={<Navigate to="/institute/insights/subjects" replace />} />
          <Route path="classes" element={<Navigate to="/institute/insights/classes" replace />} />
          <Route path="students" element={<Navigate to="/institute/insights/students" replace />} />
          <Route path="grand-tests" element={<Navigate to="/institute/insights/grand-tests" replace />} />
          <Route path="schedule-tracking" element={<Navigate to="/institute/insights/schedule-tracking" replace />} />
          <Route path="learning-response" element={<Navigate to="/institute/insights/learning-response" replace />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
