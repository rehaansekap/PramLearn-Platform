import { useState, useEffect, useContext } from "react";
import api from "../../../api";
import { AuthContext } from "../../../context/AuthContext";

export function useUnassignedSubjects() {
  const { token } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  useEffect(() => {
    const fetchSubjects = async () => {
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const res = await api.get("subjects/unassigned/");
        setSubjects(res.data);
      }
    };
    fetchSubjects();
  }, [token]);
  return subjects;
}
