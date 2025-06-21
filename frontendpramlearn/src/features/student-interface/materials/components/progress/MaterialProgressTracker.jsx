import React, { useState, useEffect, useRef } from "react";
import ProgressFloatingButton from "./ProgressFloatingButton";
import ProgressCard from "./ProgressCard";
import ProgressDrawer from "./ProgressDrawer";

const MaterialProgressTracker = ({
  progress,
  updateProgress,
  isActive = true,
  material,
  isActivityCompleted,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [desktopCardOpen, setDesktopCardOpen] = useState(false); // ← TAMBAH INI
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const timeRef = useRef(0);
  const intervalRef = useRef(null);

  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Time tracking
  useEffect(() => {
    if (!isActive || !updateProgress) return;

    intervalRef.current = setInterval(() => {
      timeRef.current += 1;
      if (timeRef.current % 60 === 0) {
        updateProgress((prev) => ({
          ...prev,
          time_spent: (prev.time_spent || 0) + 60,
        }));
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, updateProgress]);

  const formatTime = (seconds) => {
    if (!seconds) return "0m";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getProgressColor = (percent) => {
    if (percent >= 80) return "#52c41a";
    if (percent >= 60) return "#faad14";
    if (percent >= 40) return "#fa8c16";
    return "#ff4d4f";
  };

  const getProgressText = (percent) => {
    if (percent >= 100) return "Pembelajaran Selesai!";
    if (percent >= 80) return "Hampir Selesai";
    if (percent >= 60) return "Sedang Berlangsung";
    if (percent >= 40) return "Baru Dimulai";
    return "Belum Dimulai";
  };

  const progressPercent = Math.round(progress.completion_percentage || 0);

  // Mobile: Floating Action Button + Drawer
  if (isMobile) {
    return (
      <>
        <ProgressFloatingButton
          progressPercent={progressPercent}
          onClick={() => setMobileDrawerOpen(true)}
          getProgressColor={getProgressColor}
        />
        <ProgressDrawer
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          progress={progress}
          progressPercent={progressPercent}
          getProgressColor={getProgressColor}
          getProgressText={getProgressText}
          formatTime={formatTime}
          material={material}
          isActivityCompleted={isActivityCompleted}
          expanded={expanded}
          setExpanded={setExpanded}
        />
      </>
    );
  }

  // Desktop: Floating Action Button + Card (sama seperti mobile tapi pakai card)
  return (
    <>
      {desktopCardOpen && (
        <ProgressCard
          progress={progress}
          progressPercent={progressPercent}
          getProgressColor={getProgressColor}
          getProgressText={getProgressText}
          formatTime={formatTime}
          material={material}
          isActivityCompleted={isActivityCompleted}
          expanded={expanded}
          setExpanded={setExpanded}
          onClose={() => setDesktopCardOpen(false)}
        />
      )}
      <ProgressFloatingButton
        progressPercent={progressPercent}
        onClick={() => setDesktopCardOpen(!desktopCardOpen)}
        getProgressColor={getProgressColor}
        isOpen={desktopCardOpen} // ← TAMBAH PROP INI
      />
    </>
  );
};

export default MaterialProgressTracker;
