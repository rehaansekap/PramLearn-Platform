import React, { useContext } from "react";
import { Helmet } from "react-helmet";
import { AuthContext } from "../context/AuthContext";
import StudentDashboard from "../features/student-interface/dashboard/StudentDashboard";
import TeacherDashboard from "../features/teacher-interface/dashboard/TeacherDashboard";

const Home = () => {
  const { user } = useContext(AuthContext);

  // Render dashboard berdasarkan role
  if (user?.role === 3) {
    return <StudentDashboard />;
  } else if (user?.role === 2) {
    return <TeacherDashboard />;
  } else if (user?.role === 1) {
    // Admin: tampilkan halaman Home saja, bukan TeacherDashboard
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Helmet>
          <title>Dashboard Admin | PramLearn</title>
        </Helmet>
        <h2>Selamat datang, Admin!</h2>
        <p>Gunakan menu di samping untuk mengelola aplikasi.</p>
      </div>
    );
  }

  // Fallback
  return (
    <div style={{ padding: "24px", textAlign: "center" }}>
      <Helmet>
        <title>Dashboard | PramLearn</title>
      </Helmet>
      <h2>Selamat datang di PramLearn</h2>
      <p>Dashboard akan ditampilkan berdasarkan peran Anda.</p>
    </div>
  );
};

export default Home;
