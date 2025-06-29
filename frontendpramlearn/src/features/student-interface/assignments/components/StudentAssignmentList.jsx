import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";

import useAssignmentList from "../hooks/useAssignmentList";
import {
  AssignmentListHeader,
  AssignmentStatistics,
  AssignmentFilters,
  AssignmentGrid,
  AssignmentListLoading,
  AssignmentListError,
} from "./assignment-list";

dayjs.extend(relativeTime);
dayjs.locale("id");

const StudentAssignmentList = ({
  assignments,
  loading,
  error,
  onSelectAssignment,
  getAssignmentStatus,
  getTimeRemaining,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const {
    searchText,
    setSearchText,
    statusFilter,
    setStatusFilter,
    filteredAssignments,
    statistics,
  } = useAssignmentList(assignments, getAssignmentStatus);

  // Handle responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return <AssignmentListLoading />;
  }

  if (error) {
    return <AssignmentListError error={error} />;
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
      <Helmet>
        <title>Daftar Tugas | PramLearn</title>
      </Helmet>
      {/* Header */}
      <AssignmentListHeader totalAssignments={assignments.length} />

      {/* Statistics */}
      <AssignmentStatistics statistics={statistics} />

      {/* Search and Filter */}
      <AssignmentFilters
        searchText={searchText}
        setSearchText={setSearchText}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        totalFiltered={filteredAssignments.length}
        totalAssignments={assignments.length}
      />

      {/* Assignment Grid */}
      <AssignmentGrid
        filteredAssignments={filteredAssignments}
        getAssignmentStatus={getAssignmentStatus}
        getTimeRemaining={getTimeRemaining}
        isMobile={isMobile}
        searchText={searchText}
        statusFilter={statusFilter}
      />
    </div>
  );
};

export default StudentAssignmentList;
