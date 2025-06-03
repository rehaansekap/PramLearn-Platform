import { useState, useEffect, useContext } from "react";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";

const useStudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/student/dashboard/");
        console.log("Dashboard data:", res.data);
        if (mounted) setDashboard(res.data);
      } catch (err) {
        setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  return { dashboard, loading, error, user };
};

export default useStudentDashboard;
