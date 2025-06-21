import { useState, useEffect, useContext, useCallback, useRef } from "react";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";

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
      setProgress(response.data);
    } catch (error) {
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
          return `${activity.activity_type}_${activity.content_index}`;
        })
      );

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
    const totalComponents = totalPDFs + totalVideos;

    if (totalComponents === 0) return 0;

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

      const contentIndex = activityData.position || 0;
      const activityKey = `${activityType}_${contentIndex}`;

      // Cek apakah aktivitas sudah pernah dilakukan
      if (
        activityType !== "time_spent" &&
        completedActivities.has(activityKey)
      ) {
        return;
      }

      let progressIncrement = 0;
      const timeIncrement = activityData.timeIncrement || 10;

      switch (activityType) {
        case "pdf_opened":
        case "video_played":
          progressIncrement = calculateDynamicProgress(material, activityType);
          break;
        default:
          progressIncrement = 0;
      }

      if (progressIncrement > 0) {
        try {
          const backendRecorded = await recordActivityToBackend(
            activityType,
            contentIndex
          );

          const currentProgress =
            progressRef.current.completion_percentage || 0;
          const newCompletion = Math.min(
            100,
            currentProgress + progressIncrement
          );

          await updateProgress({
            time_spent: (progressRef.current.time_spent || 0) + 1,
            completion_percentage: newCompletion,
            last_position: contentIndex,
          });

          if (backendRecorded) {
            setCompletedActivities((prev) => new Set([...prev, activityKey]));
          }
        } catch (error) {
          console.error("Gagal mencatat aktivitas:", error);
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
    ]
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
      return completedActivities.has(activityKey);
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
    isActivityCompleted,

    // Computed values
    isCompleted: progress.completion_percentage >= 100,
    progressPercentage: Math.round(progress.completion_percentage || 0),
    timeSpentMinutes: Math.round((progress.time_spent || 0) / 60),
  };
};

export default useStudentMaterialAccess;
