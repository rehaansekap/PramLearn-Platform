import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../../../context/AuthContext";
import api from "../../../../api";
import Swal from "sweetalert2";

export const useStudentLayout = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const { user, logout, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Validasi role - redirect jika bukan siswa
  useEffect(() => {
    if (user && user.role !== 3) {
      Swal.fire({
        title: "Akses Ditolak",
        text: "Halaman ini khusus untuk siswa.",
        icon: "warning",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/management");
      });
    }
  }, [user, navigate]);

  // Handler responsif
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileDrawerOpen(false);
      }
      // Auto-collapse pada layar kecil
      if (mobile) {
        setCollapsed(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "Konfirmasi Keluar",
      text: "Apakah Anda yakin ingin keluar?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/login");
        Swal.fire(
          "Keluar Berhasil!",
          "Anda telah keluar dari sistem.",
          "success"
        );
      }
    });
  };

  // ✅ PERBAIKAN: Fungsi untuk mendapatkan menu key yang tepat berdasarkan path
  const getMenuKeyFromPath = (pathname) => {
    const pathSegments = pathname.split("/").filter(Boolean);

    // Base case - dashboard
    if (pathname === "/student" || pathname === "/student/") {
      return "/student";
    }

    // ✅ HANDLE MATERIALS ROUTE - materials berasal dari subjects
    if (pathSegments[1] === "materials") {
      return "/student/subjects"; // Material adalah bagian dari subjects
    }

    // ✅ HANDLE QUIZ ROUTES - quiz berasal dari assessments
    if (pathSegments[1] === "quiz" || pathSegments[1] === "group-quiz") {
      return "/student/assessments"; // Quiz adalah bagian dari assessments
    }

    // ✅ HANDLE SUBJECTS ROUTES
    if (pathSegments[1] === "subjects") {
      return "/student/subjects";
    }

    // ✅ HANDLE ASSESSMENTS ROUTES
    if (pathSegments[1] === "assessments") {
      return "/student/assessments";
    }

    // ✅ HANDLE ASSIGNMENTS ROUTES
    if (pathSegments[1] === "assignments") {
      return "/student/assignments";
    }

    // ✅ HANDLE GRADES ROUTES
    if (pathSegments[1] === "grades") {
      return "/student/grades";
    }

    // ✅ HANDLE PROGRESS ROUTES (jika ada)
    if (pathSegments[1] === "progress") {
      return "/student/progress";
    }

    // ✅ HANDLE GROUP ROUTES (jika ada)
    if (pathSegments[1] === "group") {
      return "/student/group";
    }

    // ✅ HANDLE ANALYTICS ROUTES (jika ada)
    if (pathSegments[1] === "analytics") {
      return "/student/analytics";
    }

    // ✅ HANDLE NOTIFICATIONS ROUTES (jika ada)
    if (pathSegments[1] === "notifications") {
      return "/student/notifications";
    }

    // Default fallback ke dashboard
    return "/student";
  };

  const selectedMenuKey = getMenuKeyFromPath(location.pathname);

  return {
    // State
    collapsed,
    isMobile,
    mobileDrawerOpen,
    user,
    token,
    selectedMenuKey,

    // Setters
    setCollapsed,
    setMobileDrawerOpen,

    // Handlers
    handleLogout,
  };
};
