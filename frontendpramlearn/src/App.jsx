import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { OnlineStatusProvider } from "./context/OnlineStatusContext";
import { ConfigProvider } from "antd";
import Login from "./features/authentication/Login";
import PrivateRoute from "./features/navigation/components/PrivateRoute";
import StudentPrivateRoute from "./features/student-interface/components/StudentPrivateRoute";
import TeacherPrivateRoute from "./features/teacher-interface/components/TeacherPrivateRoute";
import Sidebar from "./features/navigation/components/SideBar";
import StudentLayout from "./features/student-interface/layout/StudentLayout";
import TeacherLayout from "./features/teacher-interface/layout/TeacherLayout";
import NotFound from "./pages/NotFound";

// Management Components
import Home from "./pages/Home";
import ManagementPage from "./pages/ManagementPage";
import SubjectDetailPage from "./features/subject-management/SubjectDetailPage";
import MaterialDetailPage from "./features/material-management/MaterialDetailPage";

// Student Interface Components
import StudentDashboard from "./features/student-interface/dashboard/StudentDashboard";
import StudentSubjects from "./features/student-interface/subjects/StudentSubjects";
import StudentAssessments from "./features/student-interface/assessments/StudentAssessments";
import StudentMaterialViewer from "./features/student-interface/materials/StudentMaterialViewer";
import StudentQuizList from "./features/student-interface/assessments/StudentQuizList";
import QuizTakingInterface from "./features/student-interface/assessments/components/quiz-taking/QuizTakingInterface";
import QuizResultsPage from "./features/student-interface/assessments/components/quiz-results/QuizResultsPage";
import StudentAssignments from "./features/student-interface/assignments/StudentAssignments";
import StudentGradeOverview from "./features/student-interface/grades/StudentGradeOverview";
import GroupQuizInterface from "./features/student-interface/assessments/components/groupquiz/GroupQuizInterface";
import GroupQuizResults from "./features/student-interface/assessments/components/group-quiz-results/GroupQuizResults";
import StudentARCSSubmissionForm from "./features/student-interface/materials/components/arcs/StudentARCSSubmissionForm";
import StudentARCSResultsPage from "./features/student-interface/materials/components/arcs/StudentARCSResultsPage";

// Teacher Interface Components
import TeacherDashboard from "./features/teacher-interface/dashboard/TeacherDashboard";
import TeacherClasses from "./features/teacher-interface/classes/TeacherClasses";
import TeacherClassDetail from "./features/teacher-interface/classes/TeacherClassDetail";
import TeacherSubjects from "./features/teacher-interface/subjects/TeacherSubjects";
import TeacherSubjectDetail from "./features/teacher-interface/subjects/TeacherSubjectDetail";
import TeacherSessions from "./features/teacher-interface/sessions/TeacherSessions";
import TeacherSessionDetail from "./features/teacher-interface/sessions/TeacherSessionDetail";
import TeacherSessionMaterialDetailPage from "./features/teacher-interface/sessions/TeacherSessionMaterialDetailPage";

// Anti Design theme configuration
const antdTheme = {
  token: {
    colorPrimary: "#11418b",
    colorInfo: "#11418b",
    colorSuccess: "#52c41a",
    borderRadius: 8,
    wireframe: false,
  },
  components: {
    Button: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Card: {
      borderRadius: 12,
    },
  },
};

// Helper function untuk mendapatkan role path
const getRolePath = (roleId) => {
  switch (roleId) {
    case 1:
      return "admin";
    case 2:
      return "teacher";
    case 3:
      return "student";
    default:
      return "user";
  }
};

// Redirect component untuk user yang sudah login
const RedirectIfAuthenticated = ({ children }) => {
  const { token, user, loading } = useContext(AuthContext);

  if (loading) return null; // Loading state

  if (token && user) {
    const rolePath = getRolePath(user.role);
    // Redirect berdasarkan role
    if (user.role === 3) {
      return <Navigate to="/student" replace />;
    } else if (user.role === 1 || user.role === 2) {
      return <Navigate to={`/${rolePath}`} replace />;
    }
  }

  return children;
};

const AppRoutes = () => {
  const { token, user, loading } = useContext(AuthContext);

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div style={{ textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: 24, marginBottom: 16 }}>PramLearn</div>
          <div>Memuat aplikasi...</div>
        </div>
      </div>
    );
  }

  // Get role path untuk user saat ini
  const userRolePath = user ? getRolePath(user.role) : null;

  return (
    <Routes>
      {/* Login Route - Landing Page */}
      <Route
        path="/login"
        element={
          <RedirectIfAuthenticated>
            <Login />
          </RedirectIfAuthenticated>
        }
      />

      {/* Root redirect berdasarkan role */}
      <Route
        path="/"
        element={
          token && user ? (
            user.role === 3 ? (
              <Navigate to="/student" replace />
            ) : (
              <Navigate to={`/${userRolePath}`} replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {token ? (
        <>
          {/* Student Routes */}
          <Route
            path="/student/*"
            element={
              <StudentPrivateRoute allowedRoles={[3]}>
                <StudentLayout />
              </StudentPrivateRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="subjects" element={<StudentSubjects />} />
            <Route path="subjects/:subjectId" element={<StudentSubjects />} />
            <Route
              path="materials/:materialSlug"
              element={<StudentMaterialViewer />}
            />
            <Route
              path="materials/:materialSlug/:arcsSlug"
              element={<StudentARCSSubmissionForm />}
            />
            <Route
              path="materials/:materialSlug/:arcsSlug/results"
              element={<StudentARCSResultsPage />}
            />
            <Route path="assessments" element={<StudentQuizList />} />
            <Route path="quiz/:quizSlug" element={<QuizTakingInterface />} />
            <Route
              path="quiz/:quizSlug/results"
              element={<QuizResultsPage />}
            />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route
              path="assignments/:assignmentSlug"
              element={<StudentAssignments />}
            />
            <Route
              path="assignments/:assignmentSlug/results"
              element={<StudentAssignments />}
            />
            <Route path="grades" element={<StudentGradeOverview />} />
            <Route
              path="group-quiz/:quizSlug"
              element={<GroupQuizInterface />}
            />
            <Route
              path="group-quiz/:quizSlug/results"
              element={<GroupQuizResults />}
            />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Teacher Routes */}
          <Route
            path="/teacher/*"
            element={
              <TeacherPrivateRoute allowedRoles={[1, 2]}>
                <TeacherLayout />
              </TeacherPrivateRoute>
            }
          >
            <Route index element={<TeacherDashboard />} />
            <Route path="management" element={<ManagementPage />} />
            <Route path="classes" element={<TeacherClasses />} />
            <Route path="classes/:classSlug" element={<TeacherClassDetail />} />
            <Route path="subjects" element={<TeacherSubjects />} />
            <Route
              path="subjects/:subjectSlug"
              element={<TeacherSubjectDetail />}
            />
            <Route path="sessions" element={<TeacherSessions />} />
            <Route
              path="sessions/:subjectSlug"
              element={<TeacherSessionDetail />}
            />
            <Route
              path="sessions/:subjectSlug/:materialSlug"
              element={<TeacherSessionMaterialDetailPage />}
            />
            <Route path="management" element={<ManagementPage />} />
            <Route
              path="management/material/:materialSlug"
              element={<MaterialDetailPage />}
            />
            {/* <Route path="subjects" element={<TeacherSubjects />} />
            <Route
              path="subjects/:subjectSlug"
              element={<TeacherSubjectDetail />}
            /> */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute allowedRoles={[1]}>
                <Sidebar />
              </PrivateRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="management" element={<ManagementPage />} />
            <Route
              path="management/material/:materialSlug"
              element={<MaterialDetailPage />}
            />
            <Route
              path="management/subject/:subjectSlug"
              element={<SubjectDetailPage />}
            />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Legacy Management Routes - Redirect to role-based routes */}
          <Route
            path="/management/*"
            element={
              token && user ? (
                <Navigate to={`/${userRolePath}/management`} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </>
      ) : null}

      {/* Global 404 Route - harus di paling bawah */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <Router>
        <OnlineStatusProvider>
          <AppRoutes />
        </OnlineStatusProvider>
      </Router>
    </ConfigProvider>
  );
}

export default App;
