import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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

// Common / Profile
import Profile from "../pages/profile/Profile";
import StudentLayout from "../layouts/StudentLayout";

// Public
import PublicLayout from "../layouts/PublicLayout";
import Home from "../pages/public/Home";

// Authentication
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// Common
import Unauthorized from "../components/common/Unauthorized";
import NotFound from "../components/common/NotFound";

// Admin
import EnrollmentRequests from "../pages/admin/EnrollmentRequests";

/* =========================================================
   GET LOGGED-IN USER
========================================================= */

const getStoredUser = () => {
  try {
    const user = localStorage.getItem("user");

    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Failed to read stored user:", error);

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    return null;
  }
};

/* =========================================================
   DASHBOARD REDIRECT
========================================================= */

const getDashboardPath = (role) => {
  switch (role) {
    case "admin":
      return "/admin/dashboard";

    case "mentor":
      return "/mentor/dashboard";

    case "student":
      return "/student/dashboard";

    default:
      return "/";
  }
};

/* =========================================================
   HOME ROUTE
   - Guest → Landing Page
   - Logged-in user → Dashboard
========================================================= */

function HomeRoute() {
  const user = getStoredUser();

  if (user) {
    return (
      <Navigate
        to={getDashboardPath(user.role)}
        replace
      />
    );
  }

  return <Home />;
}

/* =========================================================
   PUBLIC AUTH ROUTE
   - Guest → Login/Register
   - Logged-in user → Dashboard
========================================================= */

function PublicAuthRoute({ children }) {
  const user = getStoredUser();

  if (user) {
    return (
      <Navigate
        to={getDashboardPath(user.role)}
        replace
      />
    );
  }

  return children;
}

/* =========================================================
   APP ROUTES
========================================================= */

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =================================================
            PUBLIC WEBSITE
        ================================================= */}

        <Route element={<PublicLayout />}>

          <Route
            path="/"
            element={<HomeRoute />}
          />

          <Route
            path="/unauthorized"
            element={<Unauthorized />}
          />

        </Route>

        {/* =================================================
            AUTHENTICATION
        ================================================= */}

        <Route
          path="/login"
          element={
            <PublicAuthRoute>
              <Login />
            </PublicAuthRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicAuthRoute>
              <Register />
            </PublicAuthRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />

        {/* =================================================
            STUDENT
        ================================================= */}

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

        {/* =================================================
            ADMIN
        ================================================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >

          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="enrollments"
            element={<EnrollmentRequests />}
          />

          <Route
            path="courses"
            element={<Courses />}
          />

          <Route
            path="people"
            element={<People />}
          />

          <Route
            path="profile"
            element={<Profile />}
          />

        </Route>

        {/* =================================================
            MENTOR
        ================================================= */}

        <Route
          path="/mentor"
          element={
            <ProtectedRoute role="mentor">
              <MentorLayout />
            </ProtectedRoute>
          }
        >

          <Route
            path="dashboard"
            element={<MentorDashboard />}
          />

          <Route
            path="courses"
            element={<MentorCourses />}
          />

          <Route
            path="course/:id"
            element={<MentorCourseDetails />}
          />

          <Route
            path="quizzes/:quizId"
            element={<QuestionManagement />}
          />

          <Route
            path="profile"
            element={<Profile />}
          />

          <Route
            path="assignments/:assignmentId/submissions"
            element={<AssignmentSubmissions />}
          />

        </Route>

        {/* =================================================
            404
        ================================================= */}

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;