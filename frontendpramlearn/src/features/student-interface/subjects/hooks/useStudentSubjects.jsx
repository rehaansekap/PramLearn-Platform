import { useState, useEffect } from "react";
import { message } from "antd";
import api from "../../../../api";

const useStudentSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchSubjects = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token tidak ditemukan");
        }

        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get("/student/subjects/");

        if (mounted) {
          setSubjects(response.data || []);
        }
      } catch (err) {
        console.error("Error fetching student subjects:", err);

        let errorMessage = "Gagal memuat data mata pelajaran";

        if (err.response?.status === 404) {
          errorMessage = "Data mata pelajaran tidak ditemukan";
        } else if (err.response?.status === 403) {
          errorMessage =
            "Anda tidak memiliki akses untuk melihat mata pelajaran";
        } else if (err.response?.status === 401) {
          errorMessage = "Sesi Anda telah berakhir. Silakan login kembali";
        } else if (err.request) {
          errorMessage = "Tidak dapat terhubung ke server";
        } else {
          errorMessage =
            err.message || "Terjadi kesalahan yang tidak diketahui";
        }

        if (mounted) {
          setError({ message: errorMessage });
          message.error(errorMessage);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchSubjects();

    return () => {
      mounted = false;
    };
  }, []);

  // Refresh subjects
  const refreshSubjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get("/student/subjects/");
      setSubjects(response.data || []);
      message.success("Data mata pelajaran berhasil diperbarui");
    } catch (err) {
      console.error("Error refreshing subjects:", err);
      const errorMessage =
        err.response?.data?.message || "Gagal memperbarui data mata pelajaran";
      setError({ message: errorMessage });
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    subjects,
    loading,
    error,
    refreshSubjects,
  };
};

export default useStudentSubjects;
