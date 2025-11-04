import { useState, useEffect, useContext, useCallback } from "react";
import api from "../../../api";
import { AuthContext } from "../../../context/AuthContext";

const useFetchClasses = () => {
  const { user, token } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        let data = [];
        if (user?.role === 2) {
          // Coba ambil dari user.class_ids
          if (user.class_ids && user.class_ids.length > 0) {
            const allClasses = await api.get("classes/");
            data = allClasses.data.filter((cls) =>
              user.class_ids.includes(cls.id)
            );
          } else {
            // Fallback: ambil dari endpoint khusus teacher
            const res = await api.get("teacher/related-users/");
            data = res.data.classes || [];
          }
        } else {
          // Admin/operator: ambil semua kelas
          const res = await api.get("classes/");
          data = res.data;
        }
        setClasses(data);
      }
      setError(null);
    } catch (err) {
      setError(err);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return { classes, error, loading, fetchClasses };
};

export default useFetchClasses;
