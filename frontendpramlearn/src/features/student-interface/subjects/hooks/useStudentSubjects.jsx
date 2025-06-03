import { useState, useEffect } from "react";
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
        const res = await api.get("/student/subjects/");
        if (mounted) setSubjects(res.data);
      } catch (err) {
        setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchSubjects();
    return () => {
      mounted = false;
    };
  }, []);

  return { subjects, loading, error };
};

export default useStudentSubjects;
