import { useState, useEffect, useContext, useCallback, useRef } from "react";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";

const globalRecordingQuizzes = new Set();
const globalRecordingAssignments = new Set();

const useStudentMaterialAccess = (materialSlug) => {
  const { user } = useContext(AuthContext);
  const [material, setMaterial] = useState(null);
  const [materialId, setMaterialId] = useState(null);
  const [completedActivities, setCompletedActivities] = useState(new Set());
  const [progress, setProgress] = useState({
    completion_percentage: 0,
    time_spent: 0,
    last_position: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const progressRef = useRef(progress);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Track user activity
  useEffect(() => {
    let inactivityTimer;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      setIsActive(true);
      inactivityTimer = setTimeout(() => {
        setIsActive(false);
      }, 5 * 60 * 1000); // 5 menit tidak aktif
    };

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) => {
      document.addEventListener(event, resetInactivityTimer, true);
    });

    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach((event) => {
        document.removeEventListener(event, resetInactivityTimer, true);
      });
    };
  }, []);

  // Fetch material data
  useEffect(() => {
    const fetchMaterial = async () => {
      if (!materialSlug) {
        setError(new Error("Material slug diperlukan"));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const materialResponse = await api.get(
          `materials/?slug=${materialSlug}`
        );
        const foundMaterial = Array.isArray(materialResponse.data)
          ? materialResponse.data.find((m) => m.slug === materialSlug)
          : null;

        if (!foundMaterial) {
          setError(new Error("Materi tidak ditemukan"));
          return;
        }

        setMaterial(foundMaterial);
        setMaterialId(foundMaterial.id);

        // Fetch progress dan aktivitas yang sudah diselesaikan
        await Promise.all([
          fetchProgress(foundMaterial.id),
          fetchCompletedActivities(foundMaterial.id),
          recordMaterialAccess(foundMaterial.id),
        ]);
      } catch (err) {
        console.error("Gagal mengambil data materi:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [materialSlug]);

  const fetchProgress = async (materialId) => {
    try {
      const response = await api.get(
        `/student/materials/${materialId}/progress/`
      );

      // Check if progress was already 100% completed
      if (response.data.completion_percentage >= 100) {
        console.log("⭐ Material already 100% completed!");
        // Make sure we mark it as completed locally
        if (response.data.completed_at) {
          console.log(`Completion date: ${response.data.completed_at}`);
        }
      }

      setProgress(response.data);
    } catch (error) {
      console.error("Error fetching progress:", error);
      setProgress({
        completion_percentage: 0,
        time_spent: 0,
        last_position: 0,
      });
    }
  };

  const fetchCompletedActivities = async (materialId) => {
    try {
      const response = await api.get(
        `/student/materials/${materialId}/activities/`
      );
      const activities = response.data;

      const activityKeys = new Set(
        activities.map((activity) => {
          // ✅ PERBAIKAN: Handle berbagai jenis activity
          if (activity.activity_type === "quiz_completed") {
            return `quiz_completed_${activity.content_index}`;
          } else if (activity.activity_type === "assignment_submitted") {
            return `assignment_submitted_${activity.content_index}`;
          } else {
            return `${activity.activity_type}_${activity.content_index}`;
          }
        })
      );

      console.log("✅ Completed activities loaded:", Array.from(activityKeys));
      setCompletedActivities(activityKeys);
    } catch (error) {
      console.error(
        "Gagal mengambil aktivitas yang sudah diselesaikan:",
        error
      );
      setCompletedActivities(new Set());
    }
  };

  const recordMaterialAccess = async (materialId) => {
    try {
      await api.post(`/student/materials/${materialId}/access/`);
    } catch (error) {
      console.error("Gagal mencatat akses materi:", error);
    }
  };

  const updateProgress = useCallback(
    async (progressDataOrUpdater) => {
      if (!materialId) return;

      // Ambil progress terbaru dari ref
      let progressData = progressDataOrUpdater;
      let baseProgress = progressRef.current;
      if (typeof progressDataOrUpdater === "function") {
        progressData = progressDataOrUpdater(baseProgress);
      }

      const allowedFields = [
        "completion_percentage",
        "time_spent",
        "last_position",
      ];
      const cleanData = {};

      // PERBAIKAN: Hanya kirim field yang benar-benar berubah
      allowedFields.forEach((field) => {
        if (progressData[field] !== undefined) {
          if (field === "completion_percentage") {
            const currentValue = baseProgress[field] || 0;
            const newValue = progressData[field] || 0;
            if (Math.abs(newValue - currentValue) > 0.01) {
              // Toleransi 0.01%
              cleanData[field] = newValue;
            }
          } else {
            if (progressData[field] !== baseProgress[field]) {
              cleanData[field] = progressData[field];
            }
          }
        }
      });
      if (Object.keys(cleanData).length === 0) {
        return baseProgress;
      }

      try {
        const response = await api.put(
          `/student/materials/${materialId}/progress/`,
          cleanData
        );
        setProgress(response.data);
        return response.data;
      } catch (error) {
        console.error("Gagal memperbarui progress:", error);
        throw error;
      }
    },
    [materialId]
  );

  const calculateDynamicProgress = useCallback((material, activityType) => {
    if (!material) return 0;

    const totalPDFs = material.pdf_files?.length || 0;
    const totalVideos =
      material.youtube_videos?.filter((v) => v.url)?.length || 0;
    const totalQuizzes = material.quizzes?.length || 0;
    const totalAssignments = material.assignments?.length || 0;

    const totalComponents =
      totalPDFs + totalVideos + totalQuizzes + totalAssignments;

    if (totalComponents === 0) return 0;

    // Setiap komponen bernilai sama
    return 100 / totalComponents;
  }, []);

  const recordActivityToBackend = useCallback(
    async (activityType, contentIndex) => {
      if (!materialId) return false;

      try {
        await api.post(`/student/materials/${materialId}/activities/`, {
          activity_type: activityType,
          content_index: contentIndex,
          content_id: `${activityType}_${contentIndex}`,
        });
        return true;
      } catch (error) {
        console.error("Gagal mencatat aktivitas ke backend:", error);
        return false;
      }
    },
    [materialId]
  );

  const recordActivity = useCallback(
    async (activityType, activityData = {}) => {
      if (!materialId || !material) return;

      // ✅ CEK APAKAH SUDAH 100% COMPLETED DARI BACKEND
      const currentProgress = progressRef.current.completion_percentage || 0;
      if (
        currentProgress >= 100 &&
        activityType in ["pdf_opened", "video_played"]
      ) {
        console.log(
          `🚫 Skipping ${activityType} - Material already 100% completed`
        );
        return;
      }

      // ✅ IMPROVED KEY GENERATION
      let activityKey;
      if (activityType === "quiz_completed") {
        activityKey = `${activityType}_${activityData.quiz_id}`;
      } else if (activityType === "assignment_submitted") {
        activityKey = `${activityType}_${activityData.assignment_id}`;
      } else {
        const contentIndex = activityData.position || 0;
        activityKey = `${activityType}_${contentIndex}`;
      }

      // Cek apakah aktivitas sudah pernah dilakukan
      if (
        activityType !== "time_spent" &&
        completedActivities.has(activityKey)
      ) {
        console.log(
          `⚠️ Activity ${activityKey} already completed, skipping...`
        );
        return;
      }

      console.log(`🎯 Recording new activity: ${activityKey}`);

      let progressIncrement = 0;
      const timeIncrement = activityData.timeIncrement || 10;

      // ✅ HANYA HITUNG PROGRESS INCREMENT JIKA BELUM 100%
      if (currentProgress < 100) {
        switch (activityType) {
          case "pdf_opened":
          case "video_played":
            progressIncrement = calculateDynamicProgress(
              material,
              activityType
            );
            console.log(
              `📄 ${activityType} - Progress increment: ${progressIncrement}%`
            );
            break;

          case "quiz_completed":
            progressIncrement = calculateDynamicProgress(
              material,
              activityType
            );
            console.log(
              `🎯 Quiz completed (ID: ${activityData.quiz_id}) - Progress increment: ${progressIncrement}%`
            );
            break;

          case "assignment_submitted":
            progressIncrement = calculateDynamicProgress(
              material,
              activityType
            );
            console.log(
              `📝 Assignment submitted (ID: ${activityData.assignment_id}) - Progress increment: ${progressIncrement}%`
            );
            break;

          case "video_progress":
            const { currentTime, duration } = activityData;
            if (duration > 0) {
              const watchPercentage = (currentTime / duration) * 100;
              if (watchPercentage >= 80) {
                progressIncrement = calculateDynamicProgress(
                  material,
                  "video_played"
                );
                console.log(
                  `📺 Video ${watchPercentage.toFixed(
                    1
                  )}% watched - Progress increment: ${progressIncrement}%`
                );
              }
            }
            break;

          case "time_spent":
            const timeSpentMinutes = (progressRef.current.time_spent || 0) / 60;
            if (timeSpentMinutes > 0 && timeSpentMinutes % 5 === 0) {
              progressIncrement = 2.5;
              console.log(
                `⏱️ Time milestone (${timeSpentMinutes}min) - Progress increment: ${progressIncrement}%`
              );
            }
            break;

          default:
            console.log(`❓ Unknown activity type: ${activityType}`);
            break;
        }
      }

      // ✅ SELALU COBA RECORD KE BACKEND (biar backend yang validasi)
      try {
        let backendData;
        if (activityType === "quiz_completed") {
          backendData = {
            activity_type: activityType,
            quiz_id: activityData.quiz_id,
            is_group_quiz: activityData.is_group_quiz || false,
          };
        } else if (activityType === "assignment_submitted") {
          backendData = {
            activity_type: activityType,
            assignment_id: activityData.assignment_id,
          };
        } else {
          const contentIndex = activityData.position || 0;
          backendData = {
            activity_type: activityType,
            content_index: contentIndex,
          };
        }

        const response = await api.post(
          `/student/materials/${materialId}/activities/`,
          backendData
        );

        // Hanya update progress jika backend sukses (status 201) dan ada increment
        if (response.status === 201 && progressIncrement > 0) {
          const newProgress = await updateProgress((prev) => {
            // ✅ JANGAN MELEBIHI 100%
            const newPercentage = Math.min(
              100,
              (prev.completion_percentage || 0) + progressIncrement
            );

            return {
              ...prev,
              completion_percentage: newPercentage,
              time_spent:
                (prev.time_spent || 0) + (activityData.timeIncrement || 10),
            };
          });

          console.log(`Updated progress: ${JSON.stringify(newProgress)}`);
        }

        // Always update local activity set jika sukses
        if (response.status === 201) {
          setCompletedActivities((prev) => new Set([...prev, activityKey]));
        }
      } catch (error) {
        // Don't swallow 409 Conflict errors - they're expected
        if (error.response && error.response.status === 409) {
          console.warn(`Activity ${activityKey} already recorded on server`);
          // Still update local state to match server
          setCompletedActivities((prev) => new Set([...prev, activityKey]));
        } else {
          console.error("Gagal mencatat aktivitas ke backend:", error);
        }
      }
    },
    [
      materialId,
      material,
      updateProgress,
      completedActivities,
      calculateDynamicProgress,
      recordActivityToBackend,
      progressRef,
      setCompletedActivities,
    ]
  );

  const recordQuizCompletion = useCallback(
    async (quizId, isGroupQuiz = false) => {
      const activityKey = `quiz_completed_${quizId}`;
      const globalKey = `${materialId}_${quizId}_${isGroupQuiz}`;

      // ✅ GLOBAL & LOCAL DEDUPLICATION
      if (
        completedActivities.has(activityKey) ||
        globalRecordingQuizzes.has(globalKey)
      ) {
        console.log(
          `⚠️ Quiz ${quizId} already recorded globally or locally, skipping...`
        );
        return;
      }

      // ✅ MARK AS RECORDING GLOBALLY
      globalRecordingQuizzes.add(globalKey);

      try {
        console.log(
          `🎯 Recording quiz completion: ${quizId} (group: ${isGroupQuiz})`
        );
        await recordActivity("quiz_completed", {
          quiz_id: quizId,
          is_group_quiz: isGroupQuiz,
        });
        console.log(`✅ Quiz ${quizId} recorded successfully`);
      } catch (error) {
        console.error(`❌ Failed to record quiz ${quizId}:`, error);
      } finally {
        // ✅ REMOVE FROM GLOBAL TRACKING setelah 2 detik
        setTimeout(() => {
          globalRecordingQuizzes.delete(globalKey);
        }, 2000);
      }
    },
    [recordActivity, completedActivities, materialId]
  );

  const recordAssignmentSubmission = useCallback(
    async (assignmentId) => {
      const activityKey = `assignment_submitted_${assignmentId}`;
      const globalKey = `${materialId}_${assignmentId}`;

      // ✅ GLOBAL & LOCAL DEDUPLICATION
      if (
        completedActivities.has(activityKey) ||
        globalRecordingAssignments.has(globalKey)
      ) {
        console.log(
          `⚠️ Assignment ${assignmentId} already recorded globally or locally, skipping...`
        );
        return;
      }

      // ✅ MARK AS RECORDING GLOBALLY
      globalRecordingAssignments.add(globalKey);

      try {
        console.log(`🎯 Recording assignment submission: ${assignmentId}`);
        await recordActivity("assignment_submitted", {
          assignment_id: assignmentId,
        });
        console.log(`✅ Assignment ${assignmentId} recorded successfully`);
      } catch (error) {
        console.error(`❌ Failed to record assignment ${assignmentId}:`, error);
      } finally {
        // ✅ REMOVE FROM GLOBAL TRACKING setelah 2 detik
        setTimeout(() => {
          globalRecordingAssignments.delete(globalKey);
        }, 2000);
      }
    },
    [recordActivity, completedActivities, materialId]
  );

  // Time tracking
  useEffect(() => {
    if (!isActive || !materialId) return;

    const interval = setInterval(() => {
      recordActivity("time_spent", {
        timeSpent: 120,
        timeIncrement: 10,
      });
    }, 120000); // Setiap 2 menit

    return () => clearInterval(interval);
  }, [isActive, materialId, recordActivity]);

  const isActivityCompleted = useCallback(
    (activityType, contentIndex) => {
      const activityKey = `${activityType}_${contentIndex}`;
      const isCompleted = completedActivities.has(activityKey);

      // ✅ DEBUG LOG untuk quiz
      if (activityType === "quiz_completed") {
        console.log(`🎯 Quiz ${contentIndex} activity check:`, {
          activityKey,
          isCompleted,
          allActivities: Array.from(completedActivities),
        });
      }

      return isCompleted;
    },
    [completedActivities]
  );

  return {
    // Data
    material,
    materialId,
    progress,
    loading,
    error,
    isActive,
    completedActivities,

    // Actions
    updateProgress,
    recordActivity,
    recordQuizCompletion,
    recordAssignmentSubmission,
    isActivityCompleted,

    // Computed values
    isCompleted: progress.completion_percentage >= 100,
    progressPercentage: Math.round(progress.completion_percentage || 0),
    timeSpentMinutes: Math.round((progress.time_spent || 0) / 60),
  };
};

export default useStudentMaterialAccess;
