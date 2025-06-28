import { useState, useEffect } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

const useARCSTimer = () => {
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTimeRemaining = (availableUntil) => {
    if (!availableUntil)
      return { text: "Unlimited", expired: false, color: "#52c41a" };

    const now = currentTime;
    const deadline = dayjs(availableUntil);

    if (now.isAfter(deadline)) {
      return { text: "EXPIRED", expired: true, color: "#ff4d4f" };
    }

    const diff = deadline.diff(now);
    const duration = dayjs.duration(diff);

    const days = Math.floor(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();

    if (days > 0) {
      return {
        text: `${days} hari ${hours} jam`,
        expired: false,
        color: days > 3 ? "#52c41a" : days > 1 ? "#faad14" : "#ff4d4f",
      };
    } else if (hours > 0) {
      return {
        text: `${hours} jam ${minutes} menit`,
        expired: false,
        color: hours > 6 ? "#faad14" : "#ff4d4f",
      };
    } else {
      return {
        text: `${minutes} menit`,
        expired: false,
        color: "#ff4d4f",
      };
    }
  };

  return { currentTime, getTimeRemaining };
};

export default useARCSTimer;
