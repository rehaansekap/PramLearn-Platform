import { useState, useEffect } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

const useQuizTimer = () => {
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTimeRemaining = (endTime) => {
    if (!endTime) return null;

    const end = dayjs(endTime);
    if (currentTime.isAfter(end)) return "EXPIRED";

    const diff = end.diff(currentTime);
    const duration = dayjs.duration(diff);

    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const getTimeRemainingColor = (endTime) => {
    if (!endTime) return "#52c41a";
    const now = dayjs();
    const end = dayjs(endTime);

    if (now.isAfter(end)) return "#ff4d4f";

    const diffMinutes = end.diff(now, "minute");
    if (diffMinutes <= 30) return "#ff4d4f";
    if (diffMinutes <= 60) return "#fa8c16";
    if (diffMinutes <= 180) return "#faad14";
    return "#52c41a";
  };

  return { currentTime, getTimeRemaining, getTimeRemainingColor };
};

export default useQuizTimer;