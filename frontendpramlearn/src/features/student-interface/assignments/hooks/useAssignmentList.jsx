import { useState, useMemo } from "react";

const useAssignmentList = (assignments, getAssignmentStatus) => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter assignments based on search and status
  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const matchSearch =
        assignment.title.toLowerCase().includes(searchText.toLowerCase()) ||
        assignment.description.toLowerCase().includes(searchText.toLowerCase());

      if (!matchSearch) return false;

      if (statusFilter === "all") return true;

      const status = getAssignmentStatus(assignment);
      return status.status === statusFilter;
    });
  }, [assignments, searchText, statusFilter, getAssignmentStatus]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const completedAssignments = assignments.filter((assignment) => {
      const status = getAssignmentStatus(assignment);
      return status.status === "submitted" || status.status === "graded";
    });

    const overdueAssignments = assignments.filter((assignment) => {
      const status = getAssignmentStatus(assignment);
      return status.status === "overdue";
    });

    const availableAssignments = assignments.filter((assignment) => {
      const status = getAssignmentStatus(assignment);
      return status.status === "available";
    });

    const averageScore =
      completedAssignments.length > 0
        ? completedAssignments.reduce(
            (sum, assignment) => sum + (assignment.grade || 0),
            0
          ) / completedAssignments.length
        : 0;

    return {
      total: assignments.length,
      completed: completedAssignments.length,
      overdue: overdueAssignments.length,
      available: availableAssignments.length,
      averageScore,
    };
  }, [assignments, getAssignmentStatus]);

  return {
    searchText,
    setSearchText,
    statusFilter,
    setStatusFilter,
    filteredAssignments,
    statistics,
  };
};

export default useAssignmentList;
