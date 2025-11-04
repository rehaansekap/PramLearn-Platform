import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";

import useStudentARCS from "../../hooks/useStudentARCS";
import useARCSList from "./hooks/useARCSList";
import {
  ARCSListHeader,
  ARCSStatistics,
  ARCSFilters,
  ARCSGrid,
  ARCSListLoading,
  ARCSListError,
} from "./arcs-list";
import StudentARCSQuestionnaire from "./StudentARCSQuestionnaire";
import useARCSTimer from "../../hooks/useARCSTimer";

dayjs.extend(relativeTime);
dayjs.locale("id");

const StudentARCSTab = ({ materialSlug }) => {
  const { getTimeRemaining } = useARCSTimer();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const {
    questionnaires,
    questionnaireDetail,
    isInQuestionnaireMode,
    loading,
    detailLoading,
    error,
    selectQuestionnaire,
    backToList,
    setError,
  } = useStudentARCS(materialSlug);

  // Function to get ARCS status (similar to assignment status)
  const getARCSStatus = (questionnaire) => {
    if (questionnaire.is_completed) {
      return {
        status: "completed",
        label: "Selesai",
        color: "#52c41a",
      };
    }

    if (!questionnaire.is_available) {
      return {
        status: "locked",
        label: "Terkunci",
        color: "#8c8c8c",
      };
    }

    const now = dayjs();
    const availableUntil = questionnaire.available_until
      ? dayjs(questionnaire.available_until)
      : null;

    if (availableUntil && now.isAfter(availableUntil)) {
      return {
        status: "expired",
        label: "Kadaluarsa",
        color: "#ff4d4f",
      };
    }

    return {
      status: "available",
      label: "Tersedia",
      color: "#1890ff",
    };
  };

  // Function to get time remaining
  // const getTimeRemaining = (availableUntil) => {
  //   if (!availableUntil) return null;

  //   const now = dayjs();
  //   const deadline = dayjs(availableUntil);
  //   const diff = deadline.diff(now);

  //   if (diff <= 0) {
  //     return { expired: true, text: "Kadaluarsa", color: "#ff4d4f" };
  //   }

  //   const days = deadline.diff(now, "days");
  //   const hours = deadline.diff(now, "hours") % 24;
  //   const minutes = deadline.diff(now, "minutes") % 60;

  //   if (days > 0) {
  //     return {
  //       expired: false,
  //       text: `${days} hari lagi`,
  //       color: days > 3 ? "#52c41a" : "#faad14",
  //     };
  //   } else if (hours > 0) {
  //     return {
  //       expired: false,
  //       text: `${hours} jam lagi`,
  //       color: hours > 6 ? "#faad14" : "#ff4d4f",
  //     };
  //   } else {
  //     return {
  //       expired: false,
  //       text: `${minutes} menit lagi`,
  //       color: "#ff4d4f",
  //     };
  //   }
  // };

  const {
    searchText,
    setSearchText,
    statusFilter,
    setStatusFilter,
    filteredQuestionnaires,
    statistics,
  } = useARCSList(questionnaires, getARCSStatus);

  // Handle responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Show questionnaire form if in questionnaire mode
  if (isInQuestionnaireMode && questionnaireDetail) {
    return (
      <StudentARCSQuestionnaire
        questionnaire={questionnaireDetail}
        materialSlug={materialSlug}
        onBack={backToList}
      />
    );
  }

  if (loading) {
    return <ARCSListLoading />;
  }

  if (error) {
    return <ARCSListError error={error} />;
  }

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px 16px",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      {/* Header */}
      <ARCSListHeader totalQuestionnaires={questionnaires.length} />

      {/* Statistics */}
      {/* <ARCSStatistics statistics={statistics} /> */}

      {/* Search and Filter */}
      {/* <ARCSFilters
        searchText={searchText}
        setSearchText={setSearchText}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        totalFiltered={filteredQuestionnaires.length}
        totalQuestionnaires={questionnaires.length}
      /> */}

      {/* ARCS Grid */}
      <ARCSGrid
        filteredQuestionnaires={filteredQuestionnaires}
        questionnaires={questionnaires}
        materialSlug={materialSlug}
        getARCSStatus={getARCSStatus}
        isMobile={isMobile}
        searchText={searchText}
        statusFilter={statusFilter}
      />
    </div>
  );
};

export default StudentARCSTab;
