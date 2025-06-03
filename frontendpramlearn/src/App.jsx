import { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import AppLayout from "./features/navigation/components/SideBar";
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
import ManagementPage from "./pages/ManagementPage";
import { OnlineStatusProvider } from "./context/OnlineStatusContext";
import "./App.css";

const AppRoutes = () => {
  const { token } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {token ? (
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
