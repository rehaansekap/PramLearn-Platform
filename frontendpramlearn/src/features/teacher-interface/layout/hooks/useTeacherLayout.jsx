import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../../../context/AuthContext";
import Swal from "sweetalert2";

export const useTeacherLayout = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const { user, logout, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && user.role !== 2 && user.role !== 1) {
      Swal.fire({
        title: "Akses Ditolak",
        text: "Halaman ini khusus untuk guru dan admin.",
        icon: "warning",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/student");
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
    const userRolePath = user?.role === 1 ? "admin" : "teacher";

    if (pathname === `/${userRolePath}` || pathname === `/${userRolePath}/`) {
      return `/${userRolePath}`;
    }

    if (pathSegments[1] === "management") {
      return `/${userRolePath}/management`;
    }

    if (pathSegments[1] === "sessions") {
      return `/${userRolePath}/sessions`;
    }

    if (pathSegments[1] === "classes") {
      return `/${userRolePath}/classes`;
    }

    if (pathSegments[1] === "subjects") {
      return `/${userRolePath}/subjects`;
    }

    if (pathSegments[1] === "analytics") {
      return `/${userRolePath}/analytics`;
    }

    if (pathSegments[1] === "students") {
      return `/${userRolePath}/students`;
    }

    if (pathSegments[1] === "reports") {
      return `/${userRolePath}/reports`;
    }

    return `/${userRolePath}`;
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
