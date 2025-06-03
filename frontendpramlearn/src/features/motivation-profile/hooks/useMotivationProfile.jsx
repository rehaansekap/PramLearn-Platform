import { useState, useEffect, useContext } from "react";
import api from "../../../api";
import { AuthContext } from "../../../context/AuthContext";

const useMotivationProfile = () => {
  const { token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const response = await api.get("student/motivation-profile/");
          setProfile(response.data);
        }
      } catch (error) {
        setError(error);
      }
    };

    fetchProfile();
  }, [token]);

  return { profile, error };
};

export default useMotivationProfile;
