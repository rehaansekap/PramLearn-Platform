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
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const progressRef = useRef(progress);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Track user activity untuk menentukan apakah user sedang aktif
  useEffect(() => {
    let inactivityTimer;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      setIsActive(true);
      inactivityTimer = setTimeout(() => {
        setIsActive(false);
      }, 5 * 60 * 1000); // 5 menit inaktif
    };

    // Event listeners untuk aktivitas user
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

    // Initialize timer
    resetInactivityTimer();

    // Cleanup
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
      try {
        setLoading(true);
        setError(null);

        if (!materialSlug) {
          setError(new Error("Material slug is required"));
          return;
        }

        // PERBAIKAN: Fetch material by slug via query param
        const materialResponse = await api.get(
          `materials/?slug=${materialSlug}`
        );
        const foundMaterial = Array.isArray(materialResponse.data)
          ? materialResponse.data.find((m) => m.slug === materialSlug)
          : null;

        if (!foundMaterial) {
          setError(new Error("Material not found"));
          return;
        }
        setMaterial(foundMaterial);
        setMaterialId(foundMaterial.id);

        // Fetch progress and bookmarks
        try {
          const [progressRes, bookmarksRes] = await Promise.all([
            api
              .get(`/student/materials/${foundMaterial.id}/progress/`)
              .catch(() => ({
                data: {
                  completion_percentage: 0,
                  time_spent: 0,
                  last_position: 0,
                },
              })),
            api
              .get(`/student/materials/${foundMaterial.id}/bookmarks/`)
              .catch(() => ({
                data: [],
              })),
          ]);

          setProgress(progressRes.data);
          setBookmarks(bookmarksRes.data);

          // Record material access
          await api
            .post(`/student/materials/${foundMaterial.id}/access/`)
            .catch(console.error);
        } catch (fetchError) {
          console.error("Error fetching progress/bookmarks:", fetchError);
        }
      } catch (err) {
        console.error("Error fetching material:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [materialSlug]);

  // Fetch completed activities dari backend saat load
  useEffect(() => {
    const fetchCompletedActivities = async () => {
      if (!materialId) return;

      try {
        // API call untuk get aktivitas yang sudah completed
        const response = await api.get(
          `/student/materials/${materialId}/activities/`
        );
        const activities = response.data;

        // 🔧 PERBAIKAN: Consistent key generation untuk frontend
        const activityKeys = new Set(
          activities.map((activity) => {
            // Gunakan format yang sama dengan recordActivity
            if (activity.activity_type === "video_played") {
              return `video_played_${activity.content_index}`;
            } else if (activity.activity_type === "pdf_opened") {
              return `pdf_opened_${activity.content_index}`;
            } else {
              return `${activity.activity_type}_${activity.content_index}`;
            }
          })
        );

        setCompletedActivities(activityKeys);
        console.log(
          `📋 Loaded completed activities:`,
          Array.from(activityKeys)
        );
      } catch (error) {
        console.error("Failed to fetch completed activities:", error);
        // Continue dengan set kosong
        setCompletedActivities(new Set());
      }
    };

    fetchCompletedActivities();
  }, [materialId]);

  // Update progress function
  const updateProgress = useCallback(
    async (progressDataOrUpdater) => {
      if (!materialId) return;
      let progressData = progressDataOrUpdater;
      if (typeof progressDataOrUpdater === "function") {
        progressData = progressDataOrUpdater(progress);
      }

      // DEBUG: Log data yang akan dikirim
      console.log("🔍 Raw progressData:", progressData);

      // PERBAIKAN: Filter hanya field yang diizinkan backend
      const allowedFields = [
        "completion_percentage",
        "time_spent",
        "last_position",
      ];
      const cleanData = {};

      allowedFields.forEach((field) => {
        if (progressData[field] !== undefined) {
          cleanData[field] = progressData[field];
        }
      });

      // Patch: selalu kirim completion_percentage terakhir jika tidak ada di payload
      if (cleanData.completion_percentage === undefined) {
        cleanData.completion_percentage = progress.completion_percentage || 0;
      }
      if (cleanData.last_position === undefined) {
        cleanData.last_position = progress.last_position || 0;
      }

      // DEBUG: Log data yang sudah dibersihkan
      console.log("🧹 Clean data to send:", cleanData);

      try {
        const response = await api.put(
          `/student/materials/${materialId}/progress/`,
          cleanData
        );
        setProgress(response.data);
        return response.data;
      } catch (error) {
        console.error("Failed to update progress:", error);
        throw error;
      }
    },
    [materialId, progress]
  );

  // Alias untuk backward compatibility
  const onProgressUpdate = useCallback(
    (progressData) => {
      return updateProgress(progressData);
    },
    [updateProgress]
  );

  // Fungsi untuk menghitung progress dinamis
  const calculateDynamicProgress = useCallback(
    (material, activityType, contentIndex) => {
      if (!material) return 0;

      // Hitung total komponen dalam materi
      const totalPDFs = material.pdf_files?.length || 0;
      const totalVideos =
        material.youtube_videos?.filter((v) => v.url)?.length || 0;
      const totalComponents = totalPDFs + totalVideos;

      if (totalComponents === 0) return 0;

      // Setiap komponen bernilai sama
      const progressPerComponent = 100 / totalComponents;

      console.log(
        `📊 Dynamic Progress: ${progressPerComponent.toFixed(
          1
        )}% per component (${totalComponents} total) - ${activityType} index ${contentIndex}`
      );

      return progressPerComponent;
    },
    []
  );

  // Record activity ke backend
  const recordActivityToBackend = useCallback(
    async (activityType, contentIndex) => {
      if (!materialId) return false;

      try {
        const response = await api.post(
          `/student/materials/${materialId}/activities/`,
          {
            activity_type: activityType,
            content_index: contentIndex,
            // 🔧 PERBAIKAN: Gunakan content_id yang konsisten
            content_id: `${activityType}_${contentIndex}`,
          }
        );

        console.log(`📝 Activity recorded to backend:`, response.data);
        return true;
      } catch (error) {
        console.error("Failed to record activity to backend:", error);
        return false;
      }
    },
    [materialId]
  );

  // Update recordActivity function
  const recordActivity = useCallback(
    async (activityType, activityData = {}) => {
      console.log("recordActivity called:", activityType, activityData);

      if (!materialId || !material) return;

      let progressIncrement = 0;
      let timeIncrement = activityData.timeIncrement || 10;
      const contentIndex = activityData.position || 0;

      // Activity key generation
      let activityKey;
      if (activityType === "video_played") {
        activityKey = `video_played_${contentIndex}`;
      } else if (activityType === "pdf_opened") {
        activityKey = `pdf_opened_${contentIndex}`;
      } else {
        activityKey = `${activityType}_${contentIndex}`;
      }

      console.log(`🔑 Generated activity key: ${activityKey}`);

      // Cek apakah aktivitas sudah pernah dilakukan
      if (
        activityType !== "time_spent" &&
        completedActivities.has(activityKey)
      ) {
        console.log(
          `⚠️ Activity ${activityKey} already completed, skipping progress increment`
        );
        return;
      }

      // Hitung progress increment
      switch (activityType) {
        case "pdf_opened":
        case "video_played":
          progressIncrement = calculateDynamicProgress(
            material,
            activityType,
            contentIndex
          );
          console.log(`🎯 Activity: +${progressIncrement.toFixed(1)}%`);
          break;
        default:
          progressIncrement = 0;
      }

      // 🔧 PERBAIKAN: Gunakan progressRef.current untuk mendapatkan nilai terkini
      if (progressIncrement > 0) {
        try {
          const backendRecorded = await recordActivityToBackend(
            activityType,
            contentIndex
          );

          // Gunakan progressRef untuk nilai terkini
          const currentProgress =
            progressRef.current.completion_percentage || 0;
          const newCompletion = Math.min(
            100,
            currentProgress + progressIncrement
          );

          console.log(
            `🔢 Current progress from ref: ${currentProgress.toFixed(1)}%`
          );
          console.log(
            `🔢 Calculated new progress: ${newCompletion.toFixed(1)}%`
          );

          const updatedProgress = await updateProgress({
            time_spent: (progressRef.current.time_spent || 0) + timeIncrement,
            completion_percentage: newCompletion,
            last_position: contentIndex,
          });

          if (backendRecorded) {
            setCompletedActivities((prev) => new Set([...prev, activityKey]));
            console.log(`🎯 Activity marked as completed: ${activityKey}`);
          }

          console.log(
            `✅ Progress updated: ${currentProgress.toFixed(
              1
            )}% → ${newCompletion.toFixed(1)}%`
          );

          return updatedProgress;
        } catch (error) {
          console.error("Failed to record activity:", error);
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

  // Simple time tracking (hanya untuk waktu, tidak auto-increment progress)
  useEffect(() => {
    if (!isActive || !materialId) return;

    const interval = setInterval(() => {
      // Hanya record time activity tanpa auto-increment progress
      recordActivity("time_spent", {
        timeSpent: 120, // 2 menit
        timeIncrement: 10,
      });
    }, 120000); // Setiap 2 menit

    return () => clearInterval(interval);
  }, [isActive, materialId, recordActivity]);

  // Add bookmark
  const addBookmark = useCallback(
    async (bookmarkData) => {
      if (!materialId) return;

      try {
        const response = await api.post(
          `/student/materials/${materialId}/bookmarks/`,
          {
            ...bookmarkData,
            material: materialId,
            student: user?.id,
          }
        );

        setBookmarks((prev) => [...prev, response.data]);
        console.log("📌 Bookmark added:", response.data);

        return response.data;
      } catch (error) {
        console.error("Failed to add bookmark:", error);
        throw error;
      }
    },
    [materialId, user?.id]
  );

  // Remove bookmark
  const removeBookmark = useCallback(
    async (bookmarkId) => {
      if (!materialId) return;

      try {
        await api.delete(
          `/student/materials/${materialId}/bookmarks/${bookmarkId}/`
        );

        setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
        console.log("🗑️ Bookmark removed:", bookmarkId);
      } catch (error) {
        console.error("Failed to remove bookmark:", error);
        throw error;
      }
    },
    [materialId]
  );

  // Manual progress completion (untuk testing)
  const markAsCompleted = useCallback(async () => {
    if (!materialId) return;

    try {
      const updatedProgress = await updateProgress({
        time_spent: progress.time_spent || 0,
        completion_percentage: 100,
        last_position: progress.last_position || 0,
      });

      console.log("✅ Material marked as completed");
      return updatedProgress;
    } catch (error) {
      console.error("Failed to mark as completed:", error);
    }
  }, [materialId, progress, updateProgress]);

  // Helper function untuk cek apakah aktivitas sudah completed
  const isActivityCompleted = useCallback(
    (activityType, contentIndex) => {
      // 🔧 PERBAIKAN: Gunakan format key yang sama
      let activityKey;
      if (activityType === "video_played") {
        activityKey = `video_played_${contentIndex}`;
      } else if (activityType === "pdf_opened") {
        activityKey = `pdf_opened_${contentIndex}`;
      } else {
        activityKey = `${activityType}_${contentIndex}`;
      }

      const isCompleted = completedActivities.has(activityKey);
      console.log(`🔍 Activity ${activityKey} completed:`, isCompleted);
      return isCompleted;
    },
    [completedActivities]
  );

  return {
    // Data
    material,
    materialId,
    progress,
    bookmarks,
    loading,
    error,
    isActive,
    completedActivities,

    // Actions
    updateProgress,
    onProgressUpdate,
    recordActivity,
    addBookmark,
    removeBookmark,
    markAsCompleted,

    // Helper functions
    isActivityCompleted,

    // Computed values
    isCompleted: progress.completion_percentage >= 100,
    progressPercentage: Math.round(progress.completion_percentage || 0),
    timeSpentMinutes: Math.round((progress.time_spent || 0) / 60),
  };
};

export default useStudentMaterialAccess;
