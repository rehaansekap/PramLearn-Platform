import { useState, useEffect, useContext, useCallback } from "react";
import api from "../../../api";
import { AuthContext } from "../../../context/AuthContext";

const useGroupQuizAssignments = (materialId) => {
  const { token } = useContext(AuthContext);
  const [groupQuizAssignments, setGroupQuizAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAssignments = useCallback(async () => {
    if (!materialId) return;
    setLoading(true);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      const res = await api.get(`group-quizzes/?material=${materialId}`);
      setGroupQuizAssignments(res.data);
    } catch {
      setGroupQuizAssignments([]);
    }
    setLoading(false);
  }, [materialId, token]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return { groupQuizAssignments, loading, refetch: fetchAssignments };
};

export default useGroupQuizAssignments;
