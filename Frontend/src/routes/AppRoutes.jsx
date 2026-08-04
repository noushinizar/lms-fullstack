import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import ProtectedRoute from "../components/common/ProtectedRoute";

// Layouts
import AdminLayout from "../layouts/AdminLayout";
import MentorLayout from "../layouts/MentorLayout";

// Student Pages
import StudentDashboard from "../pages/student/Dashboard";
import MyCourses from "../pages/student/Courses";
import CourseDetails from "../pages/student/CourseDetails";
import MyEnrolledCourses from "../pages/student/MyCourses";
import CourseLearning from "../pages/student/CourseLearning";
import Lessons from "../pages/student/Lessons";
import LessonPlayer from "../pages/student/LessonPlayer";
import Quiz from "../pages/student/Quiz";
import AttemptQuiz from "../pages/student/AttemptQuiz";
import QuizResult from "../pages/student/QuizResult";
import Assignments from "../pages/student/Assignments";
import AssignmentDetails from "../pages/student/AssignmentDetails";
import MySubmissions from "../pages/student/MySubmissions";
import Progress from "../pages/student/Progress";
import MyCertificates from "../pages/student/MyCertificates";
import CertificatePreview from "../pages/student/CertificatePreview";
// Admin Pages
import AdminDashboard from "../pages/admin/Dashboard";
import Courses from "../pages/admin/Courses";
import People from "../pages/admin/People";

// Mentor Pages
import MentorDashboard from "../pages/mentor/Dashboard";
import MentorCourses from "../pages/mentor/Courses";
import MentorCourseDetails from "../pages/mentor/CourseDetails";
import QuestionManagement from "../pages/mentor/QuestionManagement";
import AssignmentSubmissions from "../pages/mentor/AssignmentSubmissions";
import Profile from "../pages/profile/Profile";
import StudentLayout from "../layouts/StudentLayout";
import PublicLayout from "../layouts/PublicLayout";
import Home from "../pages/public/Home";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import Unauthorized from "../components/common/Unauthorized";
import NotFound from "../components/common/NotFound";
import EnrollmentRequests from "../pages/admin/EnrollmentRequests";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Website */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Route>

        {/* Authentication */}

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/reset-password/:token" element={<ResetPassword />} />
        {/* ================= STUDENT ================= */}

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/courses"
          element={
            <ProtectedRoute role="student">
              <MyCourses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/courses/:id"
          element={
            <ProtectedRoute role="student">
              <CourseDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/my-courses"
          element={
            <ProtectedRoute role="student">
              <MyEnrolledCourses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/course/:id"
          element={
            <ProtectedRoute role="student">
              <CourseLearning />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/course/:id/lessons"
          element={
            <ProtectedRoute role="student">
              <Lessons />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/lesson/:id"
          element={
            <ProtectedRoute role="student">
              <LessonPlayer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/course/:id/quizzes"
          element={
            <ProtectedRoute role="student">
              <Quiz />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/quiz/:quizId/attempt"
          element={
            <ProtectedRoute role="student">
              <AttemptQuiz />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/quiz/result"
          element={
            <ProtectedRoute role="student">
              <QuizResult />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/course/:id/assignments"
          element={
            <ProtectedRoute role="student">
              <Assignments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/assignment/:assignmentId"
          element={
            <ProtectedRoute role="student">
              <AssignmentDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/my-submissions"
          element={
            <ProtectedRoute role="student">
              <MySubmissions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/course/:courseId/progress"
          element={
            <ProtectedRoute role="student">
              <Progress />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/certificates"
          element={
            <ProtectedRoute role="student">
              <MyCertificates />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/certificate/:courseId"
          element={
            <ProtectedRoute role="student">
              <CertificatePreview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute role="student">
              <StudentLayout>
                <Profile />
              </StudentLayout>
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN ================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="enrollments" element={<EnrollmentRequests />} />
          <Route path="courses" element={<Courses />} />
          <Route path="people" element={<People />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* ================= MENTOR ================= */}

        <Route
          path="/mentor"
          element={
            <ProtectedRoute role="mentor">
              <MentorLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<MentorDashboard />} />

          <Route path="courses" element={<MentorCourses />} />

          <Route path="course/:id" element={<MentorCourseDetails />} />

          <Route path="quizzes/:quizId" element={<QuestionManagement />} />

          <Route path="profile" element={<Profile />} />

          <Route
            path="assignments/:assignmentId/submissions"
            element={<AssignmentSubmissions />}
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
