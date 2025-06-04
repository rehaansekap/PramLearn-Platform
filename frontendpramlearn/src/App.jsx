import { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import AppLayout from "./features/navigation/components/SideBar";
import StudentLayout from "./features/student-interface/layout/StudentLayout";
import Home from "./pages/Home";
import UserManagement from "./features/users-management/UserManagement";
import ClassManagement from "./features/class-management/ClassManagement";
import ClassDetailPage from "./features/class-management/ClassDetailPage";
import SubjectManagement from "./features/subject-management/SubjectManagement";
import SubjectDetailPage from "./features/subject-management/SubjectDetailPage";
import MaterialDetailPage from "./features/material-management/MaterialDetailPage";
import Login from "./features/authentication/Login";
import Register from "./features/authentication/Register";
import PrivateRoute from "./features/navigation/components/PrivateRoute";
import StudentPrivateRoute from "./features/student-interface/components/StudentPrivateRoute";
import ManagementPage from "./pages/ManagementPage";
import { OnlineStatusProvider } from "./context/OnlineStatusContext";
import "./App.css";

// Student Interface Components (akan dibuat di chat selanjutnya)
import StudentDashboard from "./features/student-interface/dashboard/StudentDashboard";
import StudentSubjects from "./features/student-interface/subjects/StudentSubjects";
import StudentAssessments from "./features/student-interface/assessments/StudentAssessments";
import StudentProgress from "./features/student-interface/progress/StudentProgress";
import StudentGroup from "./features/student-interface/group/StudentGroup";
import StudentMaterialViewer from "./features/student-interface/materials/StudentMaterialViewer";
import StudentQuizList from "./features/student-interface/assessments/StudentQuizList";
import QuizTakingInterface from "./features/student-interface/assessments/components/QuizTakingInterface";
import QuizResultsPage from "./features/student-interface/assessments/components/QuizResultsPage";
import StudentAssignments from "./features/student-interface/assignments/StudentAssignments";
import StudentGradeOverview from "./features/student-interface/grades/StudentGradeOverview";

const RedirectIfAuthenticated = ({ children }) => {
  const { token, loading } = useContext(AuthContext);
  if (loading) return null; // Atau tampilkan spinner jika perlu
  return token ? <Navigate to="/" replace /> : children;
};

const AppRoutes = () => {
  const { token } = useContext(AuthContext);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RedirectIfAuthenticated>
            <Login />
          </RedirectIfAuthenticated>
        }
      />
      {token ? (
        <>
          {/* Student Routes */}
          <Route
            path="/student/*"
            element={
              <StudentPrivateRoute>
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
            <Route path="assessments" element={<StudentQuizList />} />
            <Route
              path="quiz/:quizSlug"
              element={<QuizTakingInterface />}
            />{" "}
            {/* Changed from :quizId to :quizSlug */}
            <Route
              path="quiz/:quizSlug/results"
              element={<QuizResultsPage />}
            />{" "}
            {/* Changed from :quizId to :quizSlug */}
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="grades" element={<StudentGradeOverview />} />
            <Route path="progress" element={<StudentProgress />} />
            <Route path="group" element={<StudentGroup />} />
          </Route>

          {/* Admin/Teacher Routes */}
          <Route
            path="*"
            element={
              <AppLayout>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <PrivateRoute>
                        <Home />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/management"
                    element={
                      <PrivateRoute>
                        <ManagementPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/management/subject/:subjectSlug"
                    element={
                      <PrivateRoute>
                        <SubjectDetailPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/management/subject/:subjectId"
                    element={
                      <PrivateRoute>
                        <SubjectDetailPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/management/class/:classSlug"
                    element={
                      <PrivateRoute>
                        <ClassDetailPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/management/class/:classId"
                    element={
                      <PrivateRoute>
                        <ClassDetailPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/material/:materialSlug"
                    element={
                      <PrivateRoute>
                        <MaterialDetailPage />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </AppLayout>
            }
          />
        </>
      ) : (
        <Route path="*" element={<Login />} />
      )}
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <OnlineStatusProvider>
        <Router>
          <AppRoutes />
        </Router>
      </OnlineStatusProvider>
    </AuthProvider>
  );
}

export default App;
