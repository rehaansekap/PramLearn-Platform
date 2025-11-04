import { useState, useCallback, useContext, useEffect } from "react";
import { message } from "antd";
import { AuthContext } from "../../../../contexts/AuthContext";

const useGradeAnalytics = () => {
  const { user, token } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch analytics data
  const fetchAnalytics = useCallback(
    async (filters = {}) => {
      if (!token) {
        setError("Token tidak valid");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();

        // Add filters to query params
        Object.keys(filters).forEach((key) => {
          if (
            filters[key] !== null &&
            filters[key] !== undefined &&
            filters[key] !== ""
          ) {
            queryParams.append(key, filters[key]);
          }
        });

        const response = await fetch(
          `/api/student/grades/analytics?${queryParams.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setAnalytics(data.data);
          return data.data;
        } else {
          throw new Error(data.message || "Gagal memuat data analytics");
        }
      } catch (err) {
        const errorMessage =
          err.message || "Terjadi kesalahan saat memuat analytics";
        setError(errorMessage);
        console.error("Error fetching analytics:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Fetch trend analysis
  const fetchTrendAnalysis = useCallback(
    async (period = "6months") => {
      if (!token) {
        setError("Token tidak valid");
        return null;
      }

      try {
        const response = await fetch(
          `/api/student/grades/trend-analysis?period=${period}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          return data.data;
        } else {
          throw new Error(data.message || "Gagal memuat trend analysis");
        }
      } catch (err) {
        console.error("Error fetching trend analysis:", err);
        return null;
      }
    },
    [token]
  );

  // Fetch subject comparison
  const fetchSubjectComparison = useCallback(async () => {
    if (!token) {
      setError("Token tidak valid");
      return null;
    }

    try {
      const response = await fetch(`/api/student/grades/subject-comparison`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(
          data.message || "Gagal memuat perbandingan mata pelajaran"
        );
      }
    } catch (err) {
      console.error("Error fetching subject comparison:", err);
      return null;
    }
  }, [token]);

  // Fetch performance insights
  const fetchPerformanceInsights = useCallback(async () => {
    if (!token) {
      setError("Token tidak valid");
      return null;
    }

    try {
      const response = await fetch(`/api/student/grades/performance-insights`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || "Gagal memuat insights performa");
      }
    } catch (err) {
      console.error("Error fetching performance insights:", err);
      return null;
    }
  }, [token]);

  // Reset analytics state
  const resetAnalytics = useCallback(() => {
    setAnalytics(null);
    setError(null);
  }, []);

  // Utility function to calculate GPA
  const calculateGPA = useCallback((grades) => {
    if (!grades || grades.length === 0) return 0;

    const gradePoints = grades.map((grade) => {
      const score = grade.grade || 0;
      if (score >= 90) return 4.0;
      if (score >= 80) return 3.0;
      if (score >= 70) return 2.0;
      if (score >= 60) return 1.0;
      return 0.0;
    });

    const totalPoints = gradePoints.reduce((sum, point) => sum + point, 0);
    return totalPoints / gradePoints.length;
  }, []);

  // Utility function to get grade letter
  const getGradeLetter = useCallback((score) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "E";
  }, []);

  // Utility function to get performance trend
  const getPerformanceTrend = useCallback((grades) => {
    if (!grades || grades.length < 5) {
      return { trend: "insufficient_data", percentage: 0 };
    }

    const sortedGrades = [...grades].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    const halfPoint = Math.floor(sortedGrades.length / 2);

    const recentGrades = sortedGrades.slice(halfPoint);
    const olderGrades = sortedGrades.slice(0, halfPoint);

    const recentAvg =
      recentGrades.reduce((sum, g) => sum + (g.grade || 0), 0) /
      recentGrades.length;
    const olderAvg =
      olderGrades.reduce((sum, g) => sum + (g.grade || 0), 0) /
      olderGrades.length;

    const difference = recentAvg - olderAvg;
    const percentage = Math.abs((difference / olderAvg) * 100);

    let trend = "stable";
    if (difference > 3) trend = "increasing";
    else if (difference < -3) trend = "decreasing";

    return { trend, percentage: percentage.toFixed(1) };
  }, []);

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
    fetchTrendAnalysis,
    fetchSubjectComparison,
    fetchPerformanceInsights,
    resetAnalytics,
    calculateGPA,
    getGradeLetter,
    getPerformanceTrend,
  };
};

export default useGradeAnalytics;
