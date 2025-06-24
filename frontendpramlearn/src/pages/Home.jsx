import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import StudentDashboard from "../features/student-interface/dashboard/StudentDashboard";
import TeacherDashboard from "../features/teacher-interface/dashboard/TeacherDashboard"; // Import Teacher Dashboard

const Home = () => {
  const { user } = useContext(AuthContext);

  // Render dashboard berdasarkan role
  if (user?.role === 3) {
    return <StudentDashboard />;
  } else if (user?.role === 2) {
    return <TeacherDashboard />; // Render Teacher Dashboard
  } else if (user?.role === 1) {
    // Admin bisa menggunakan Teacher Dashboard atau buat Admin Dashboard tersendiri
    return <TeacherDashboard />;
  }

  // Fallback
  return (
    <div style={{ padding: "24px", textAlign: "center" }}>
      <h2>Selamat datang di PramLearn</h2>
      <p>Dashboard akan ditampilkan berdasarkan peran Anda.</p>
    </div>
  );
};

export default Home;
