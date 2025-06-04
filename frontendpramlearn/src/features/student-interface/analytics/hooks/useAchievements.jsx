import { useState, useEffect, useContext } from "react";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";

const useAchievements = () => {
  const { user } = useContext(AuthContext);
  const [achievements, setAchievements] = useState({
    earned: [],
    available: [],
    progress: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchAchievements = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get("/student/achievements/");
        setAchievements(response.data);
      } catch (err) {
        console.error("Error fetching achievements:", err);
        setError(err);
        setAchievements({
          earned: [],
          available: [],
          progress: {},
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user]);

  return { achievements, loading, error };
};

export default useAchievements;
