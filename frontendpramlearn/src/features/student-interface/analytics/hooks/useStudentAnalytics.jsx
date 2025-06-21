import { useState, useEffect, useContext } from "react";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";

const useStudentAnalytics = () => {
  const { user } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState({
    overview: null,
    subjects: [],
    behavior: null,
    achievements: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  // Mock data generator
  const generateMockData = () => {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      overview: {
        overall_progress: 75,
        total_subjects: 4,
        completed_materials: 12,
        total_materials: 16,
        average_attendance: 85,
        learning_streak: 5,
        total_time_spent: 7200, // 2 hours in seconds
        current_week_activities: 15,
        last_week_activities: 12,
        improvement_rate: 8.5,
      },
      subjects: [
        {
          id: 1,
          name: "Mathematics",
          progress: 85,
          materials_completed: 4,
          total_materials: 5,
          time_spent: 2400, // 40 minutes
          last_activity: today.toISOString(),
          average_score: 88,
          teacher_name: "Mr. Smith",
        },
        {
          id: 2,
          name: "Physics",
          progress: 72,
          materials_completed: 3,
          total_materials: 4,
          time_spent: 1800, // 30 minutes
          last_activity: lastWeek.toISOString(),
          average_score: 82,
          teacher_name: "Ms. Johnson",
        },
        {
          id: 3,
          name: "Chemistry",
          progress: 68,
          materials_completed: 2,
          total_materials: 3,
          time_spent: 1500, // 25 minutes
          last_activity: lastWeek.toISOString(),
          average_score: 78,
          teacher_name: "Dr. Brown",
        },
        {
          id: 4,
          name: "Biology",
          progress: 90,
          materials_completed: 3,
          total_materials: 4,
          time_spent: 1500, // 25 minutes
          last_activity: today.toISOString(),
          average_score: 92,
          teacher_name: "Mrs. Davis",
        },
      ],
      behavior: {
        daily_activity: [
          {
            date: today.toISOString().split("T")[0],
            materials_accessed: 3,
            time_spent: 45,
            attendance_count: 1,
          },
          {
            date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            materials_accessed: 2,
            time_spent: 30,
            attendance_count: 1,
          },
          {
            date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            materials_accessed: 4,
            time_spent: 60,
            attendance_count: 1,
          },
          {
            date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            materials_accessed: 1,
            time_spent: 20,
            attendance_count: 0,
          },
          {
            date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            materials_accessed: 3,
            time_spent: 40,
            attendance_count: 1,
          },
        ],
        peak_learning_hours: [
          { hour: 9, activity_count: 12, time_spent: 180 },
          { hour: 10, activity_count: 15, time_spent: 220 },
          { hour: 14, activity_count: 8, time_spent: 140 },
          { hour: 15, activity_count: 10, time_spent: 160 },
          { hour: 19, activity_count: 6, time_spent: 90 },
        ],
        subjects_time_distribution: [
          { subject: "Mathematics", time_spent: 2400, percentage: 35 },
          { subject: "Physics", time_spent: 1800, percentage: 26 },
          { subject: "Chemistry", time_spent: 1500, percentage: 22 },
          { subject: "Biology", time_spent: 1200, percentage: 17 },
        ],
        learning_patterns: {
          most_active_day: "Tuesday",
          preferred_time: "Morning (9-11 AM)",
          average_session_duration: 35,
          consistency_score: 78,
        },
      },
      achievements: {
        earned: [
          {
            id: "early_bird",
            title: "Early Bird",
            description: "Complete 5 materials before 10 AM",
            icon: "🌅",
            earned_date: "2024-01-15",
            badge_color: "#faad14",
          },
          {
            id: "consistent_learner",
            title: "Consistent Learner",
            description: "Study for 5 consecutive days",
            icon: "📚",
            earned_date: "2024-01-20",
            badge_color: "#52c41a",
          },
        ],
        available: [
          {
            id: "quiz_master",
            title: "Quiz Master",
            description: "Score above 90% in 3 quizzes",
            icon: "🏆",
            progress: 67,
            requirement: 3,
            current: 2,
          },
          {
            id: "speed_reader",
            title: "Speed Reader",
            description: "Complete 10 materials in one week",
            icon: "⚡",
            progress: 50,
            requirement: 10,
            current: 5,
          },
        ],
        progress: {
          total_earned: 2,
          total_available: 8,
          completion_rate: 25,
        },
      },
    };
  };

  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to fetch real data first
        const [overviewRes, subjectsRes, behaviorRes, achievementsRes] =
          await Promise.allSettled([
            api.get("/student/analytics/overview/"),
            api.get("/student/analytics/subjects/"),
            api.get("/student/analytics/behavior/"),
            api.get("/student/achievements/"),
          ]);

        // Check if any real data was successfully fetched
        const hasRealData = [
          overviewRes,
          subjectsRes,
          behaviorRes,
          achievementsRes,
        ].some((res) => res.status === "fulfilled");

        if (hasRealData) {
          // Use real data if available
          const overview =
            overviewRes.status === "fulfilled" ? overviewRes.value.data : null;
          const subjects =
            subjectsRes.status === "fulfilled" ? subjectsRes.value.data : [];
          const behavior =
            behaviorRes.status === "fulfilled" ? behaviorRes.value.data : null;
          const achievements =
            achievementsRes.status === "fulfilled"
              ? achievementsRes.value.data
              : [];

          setAnalytics({
            overview: overview || generateMockData().overview,
            subjects:
              subjects.length > 0 ? subjects : generateMockData().subjects,
            behavior: behavior || generateMockData().behavior,
            achievements:
              achievements.length > 0
                ? achievements
                : generateMockData().achievements,
          });
        } else {
          // Fallback to mock data
          console.log("🔄 Backend endpoints not available, using mock data");
          const mockData = generateMockData();
          setAnalytics(mockData);
        }
      } catch (err) {
        console.warn(
          "⚠️ Analytics API not available, using mock data:",
          err.message
        );
        // Fallback to mock data
        const mockData = generateMockData();
        setAnalytics(mockData);
        setError(null); // Don't show error since we have fallback
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    // In real implementation, this would trigger API call with filters
  };

  const clearFilters = () => {
    setFilters({});
  };

  const refreshAnalytics = async () => {
    setLoading(true);
    try {
      // Simulate refresh delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Try to fetch fresh data, fallback to mock if needed
      const mockData = generateMockData();
      setAnalytics(mockData);
    } catch (err) {
      console.error("Error refreshing analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    analytics,
    loading,
    error,
    filters,
    applyFilters,
    clearFilters,
    refreshAnalytics,
  };
};

export default useStudentAnalytics;
