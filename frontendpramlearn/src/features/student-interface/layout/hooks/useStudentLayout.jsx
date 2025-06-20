import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../../../context/AuthContext";
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

  // Dapatkan kunci menu yang dipilih dari path saat ini
  const getMenuKeyFromPath = (pathname) => {
    if (pathname === "/student" || pathname === "/student/") return "/student";
    if (pathname.startsWith("/student/subjects")) return "/student/subjects";
    if (pathname.startsWith("/student/assessments"))
      return "/student/assessments";
    if (pathname.startsWith("/student/assignments"))
      return "/student/assignments";
    if (pathname.startsWith("/student/grades")) return "/student/grades";
    if (pathname.startsWith("/student/progress")) return "/student/progress";
    if (pathname.startsWith("/student/group")) return "/student/group";
    if (pathname.startsWith("/student/analytics")) return "/student/analytics";
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

    // Actions
    setCollapsed,
    setMobileDrawerOpen,
    handleLogout,
  };
};
