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

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileDrawerOpen(false);
      }

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

  const getMenuKeyFromPath = (pathname) => {
    const pathSegments = pathname.split("/").filter(Boolean);

    if (pathname === "/student" || pathname === "/student/") {
      return "/student";
    }

    if (pathSegments[1] === "materials") {
      return "/student/subjects";
    }

    if (pathSegments[1] === "quiz" || pathSegments[1] === "group-quiz") {
      return "/student/assessments";
    }

    if (pathSegments[1] === "subjects") {
      return "/student/subjects";
    }

    if (pathSegments[1] === "assessments") {
      return "/student/assessments";
    }

    if (pathSegments[1] === "assignments") {
      return "/student/assignments";
    }

    if (pathSegments[1] === "grades") {
      return "/student/grades";
    }

    if (pathSegments[1] === "progress") {
      return "/student/progress";
    }

    if (pathSegments[1] === "group") {
      return "/student/group";
    }

    if (pathSegments[1] === "analytics") {
      return "/student/analytics";
    }

    if (pathSegments[1] === "notifications") {
      return "/student/notifications";
    }

    return "/student";
  };

  const selectedMenuKey = getMenuKeyFromPath(location.pathname);

  return {
    collapsed,
    isMobile,
    mobileDrawerOpen,
    user,
    token,
    selectedMenuKey,

    setCollapsed,
    setMobileDrawerOpen,

    handleLogout,
  };
};
