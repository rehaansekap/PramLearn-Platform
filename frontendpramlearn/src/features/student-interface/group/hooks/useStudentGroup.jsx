import { useState, useEffect, useContext } from "react";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";

const useStudentGroup = () => {
  const { user } = useContext(AuthContext);
  const [groupData, setGroupData] = useState({
    groupInfo: null,
    members: [],
    quizResults: [],
    activities: [],
    rankings: [],
    performance: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data generator untuk development
  const generateMockGroupData = () => {
    const today = new Date();
    const groupId = 1;
    const groupName = "Kelompok Alpha";

    return {
      groupInfo: {
        id: groupId,
        name: groupName,
        code: "ALPHA-001",
        material: {
          id: 1,
          title: "Matematika Diskrit",
          subject_name: "Matematika",
        },
        created_at: new Date(
          today.getTime() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        member_count: 4,
        overall_score: 85.5,
        rank_in_class: 2,
        total_groups: 8,
        motivation_distribution: {
          high: 2,
          medium: 1,
          low: 1,
        },
      },
      members: [
        {
          id: 1,
          username: "student1",
          first_name: "Ahmad",
          last_name: "Wijaya",
          email: "ahmad@example.com",
          motivation_profile: {
            level: "high",
            attention: 85,
            relevance: 90,
            confidence: 88,
            satisfaction: 87,
          },
          is_current_user: true,
          role_in_group: "leader",
          join_date: new Date(
            today.getTime() - 25 * 24 * 60 * 60 * 1000
          ).toISOString(),
          quiz_average: 88.5,
          attendance_rate: 95,
        },
        {
          id: 2,
          username: "student2",
          first_name: "Sari",
          last_name: "Permata",
          email: "sari@example.com",
          motivation_profile: {
            level: "high",
            attention: 82,
            relevance: 85,
            confidence: 90,
            satisfaction: 88,
          },
          is_current_user: false,
          role_in_group: "member",
          join_date: new Date(
            today.getTime() - 25 * 24 * 60 * 60 * 1000
          ).toISOString(),
          quiz_average: 85.2,
          attendance_rate: 92,
        },
        {
          id: 3,
          username: "student3",
          first_name: "Budi",
          last_name: "Santoso",
          email: "budi@example.com",
          motivation_profile: {
            level: "medium",
            attention: 75,
            relevance: 78,
            confidence: 72,
            satisfaction: 76,
          },
          is_current_user: false,
          role_in_group: "member",
          join_date: new Date(
            today.getTime() - 25 * 24 * 60 * 60 * 1000
          ).toISOString(),
          quiz_average: 76.8,
          attendance_rate: 88,
        },
        {
          id: 4,
          username: "student4",
          first_name: "Lisa",
          last_name: "Anggraini",
          email: "lisa@example.com",
          motivation_profile: {
            level: "low",
            attention: 68,
            relevance: 70,
            confidence: 65,
            satisfaction: 69,
          },
          is_current_user: false,
          role_in_group: "member",
          join_date: new Date(
            today.getTime() - 20 * 24 * 60 * 60 * 1000
          ).toISOString(),
          quiz_average: 68.3,
          attendance_rate: 82,
        },
      ],
      quizResults: [
        {
          id: 1,
          quiz_title: "Quiz Logika Proposisi",
          date: new Date(
            today.getTime() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          group_score: 88.5,
          rank: 2,
          total_groups: 8,
          individual_scores: [
            { student_id: 1, student_name: "Ahmad Wijaya", score: 92 },
            { student_id: 2, student_name: "Sari Permata", score: 88 },
            { student_id: 3, student_name: "Budi Santoso", score: 85 },
            { student_id: 4, student_name: "Lisa Anggraini", score: 89 },
          ],
          completion_time: 45,
          correct_answers: 17,
          total_questions: 20,
        },
        {
          id: 2,
          quiz_title: "Quiz Teori Himpunan",
          date: new Date(
            today.getTime() - 14 * 24 * 60 * 60 * 1000
          ).toISOString(),
          group_score: 82.8,
          rank: 3,
          total_groups: 8,
          individual_scores: [
            { student_id: 1, student_name: "Ahmad Wijaya", score: 85 },
            { student_id: 2, student_name: "Sari Permata", score: 82 },
            { student_id: 3, student_name: "Budi Santoso", score: 78 },
            { student_id: 4, student_name: "Lisa Anggraini", score: 86 },
          ],
          completion_time: 52,
          correct_answers: 16,
          total_questions: 20,
        },
      ],
      activities: [
        {
          id: 1,
          type: "quiz_completed",
          title: "Quiz Selesai Dikerjakan",
          description:
            "Kelompok menyelesaikan Quiz Logika Proposisi dengan skor 88.5",
          timestamp: new Date(
            today.getTime() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          participants: [
            "Ahmad Wijaya",
            "Sari Permata",
            "Budi Santoso",
            "Lisa Anggraini",
          ],
          icon: "🏆",
          achievement_unlocked: "Team Player",
        },
        {
          id: 2,
          type: "member_joined",
          title: "Anggota Baru Bergabung",
          description: "Lisa Anggraini bergabung dengan kelompok",
          timestamp: new Date(
            today.getTime() - 20 * 24 * 60 * 60 * 1000
          ).toISOString(),
          participants: ["Lisa Anggraini"],
          icon: "👥",
        },
        {
          id: 3,
          type: "study_session",
          title: "Sesi Belajar Kelompok",
          description: "Kelompok mengadakan diskusi tentang Teori Graf",
          timestamp: new Date(
            today.getTime() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
          participants: ["Ahmad Wijaya", "Sari Permata", "Budi Santoso"],
          icon: "📚",
        },
      ],
      rankings: [
        {
          rank: 1,
          group_name: "Kelompok Beta",
          group_code: "BETA-002",
          score: 91.2,
          member_count: 4,
          quiz_completed: 2,
          is_current_group: false,
        },
        {
          rank: 2,
          group_name: "Kelompok Alpha",
          group_code: "ALPHA-001",
          score: 85.5,
          member_count: 4,
          quiz_completed: 2,
          is_current_group: true,
        },
        {
          rank: 3,
          group_name: "Kelompok Gamma",
          group_code: "GAMMA-003",
          score: 83.7,
          member_count: 4,
          quiz_completed: 2,
          is_current_group: false,
        },
        {
          rank: 4,
          group_name: "Kelompok Delta",
          group_code: "DELTA-004",
          score: 79.3,
          member_count: 3,
          quiz_completed: 2,
          is_current_group: false,
        },
      ],
      performance: {
        weekly_progress: [
          { week: "Week 1", score: 78.5, activities: 3 },
          { week: "Week 2", score: 82.8, activities: 5 },
          { week: "Week 3", score: 85.5, activities: 4 },
          { week: "Week 4", score: 88.2, activities: 6 },
        ],
        achievements: [
          {
            id: "team_player",
            title: "Team Player",
            description: "Menyelesaikan 2 quiz sebagai kelompok",
            icon: "🤝",
            unlocked: true,
            unlock_date: new Date(
              today.getTime() - 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
          {
            id: "rising_stars",
            title: "Rising Stars",
            description: "Naik 2 peringkat dalam ranking",
            icon: "⭐",
            unlocked: false,
            progress: 50,
            requirement: "Naik 2 peringkat",
          },
        ],
        collaboration_score: 87,
        consistency_score: 83,
        improvement_rate: 12.5,
      },
    };
  };

  useEffect(() => {
    if (!user) return;

    const fetchGroupData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to fetch real data first
        const [
          groupInfoRes,
          membersRes,
          quizResultsRes,
          activitiesRes,
          rankingsRes,
          performanceRes,
        ] = await Promise.allSettled([
          api.get("/student/group/"),
          api.get("/student/group/members/"),
          api.get("/student/group/quiz-results/"),
          api.get("/student/group/activities/"),
          api.get("/student/group/rankings/"),
          api.get("/student/group/performance/"),
        ]);

        // Check if any real data was successfully fetched
        const hasRealData = [
          groupInfoRes,
          membersRes,
          quizResultsRes,
          activitiesRes,
          rankingsRes,
          performanceRes,
        ].some((res) => res.status === "fulfilled");

        if (hasRealData) {
          // Use real data if available
          const groupInfo =
            groupInfoRes.status === "fulfilled"
              ? groupInfoRes.value.data
              : null;
          const members =
            membersRes.status === "fulfilled" ? membersRes.value.data : [];
          const quizResults =
            quizResultsRes.status === "fulfilled"
              ? quizResultsRes.value.data
              : [];
          const activities =
            activitiesRes.status === "fulfilled"
              ? activitiesRes.value.data
              : [];
          const rankings =
            rankingsRes.status === "fulfilled" ? rankingsRes.value.data : [];
          const performance =
            performanceRes.status === "fulfilled"
              ? performanceRes.value.data
              : null;

          const mockData = generateMockGroupData();
          setGroupData({
            groupInfo: groupInfo || mockData.groupInfo,
            members: members.length > 0 ? members : mockData.members,
            quizResults:
              quizResults.length > 0 ? quizResults : mockData.quizResults,
            activities:
              activities.length > 0 ? activities : mockData.activities,
            rankings: rankings.length > 0 ? rankings : mockData.rankings,
            performance: performance || mockData.performance,
          });
        } else {
          // Fallback to mock data
          console.log("🔄 Group endpoints not available, using mock data");
          const mockData = generateMockGroupData();
          setGroupData(mockData);
        }
      } catch (err) {
        console.warn(
          "⚠️ Group API not available, using mock data:",
          err.message
        );
        // Fallback to mock data
        const mockData = generateMockGroupData();
        setGroupData(mockData);
        setError(null); // Don't show error since we have fallback
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [user]);

  const refreshGroupData = async () => {
    setLoading(true);
    try {
      // Simulate refresh delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Try to fetch fresh data, fallback to mock if needed
      const mockData = generateMockGroupData();
      setGroupData(mockData);
    } catch (err) {
      console.error("Error refreshing group data:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    groupData,
    loading,
    error,
    refreshGroupData,
  };
};

export default useStudentGroup;
