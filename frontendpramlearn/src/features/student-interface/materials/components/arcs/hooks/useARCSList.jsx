import { useState, useMemo } from "react";

const useARCSList = (questionnaires, getARCSStatus) => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter questionnaires based on search and status
  const filteredQuestionnaires = useMemo(() => {
    return questionnaires.filter((questionnaire) => {
      const matchSearch =
        questionnaire.title.toLowerCase().includes(searchText.toLowerCase()) ||
        (questionnaire.description &&
          questionnaire.description
            .toLowerCase()
            .includes(searchText.toLowerCase()));

      if (!matchSearch) return false;

      if (statusFilter === "all") return true;

      const status = getARCSStatus(questionnaire);
      return status.status === statusFilter;
    });
  }, [questionnaires, searchText, statusFilter, getARCSStatus]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const completedQuestionnaires = questionnaires.filter((questionnaire) => {
      const status = getARCSStatus(questionnaire);
      return status.status === "completed";
    });

    const availableQuestionnaires = questionnaires.filter((questionnaire) => {
      const status = getARCSStatus(questionnaire);
      return status.status === "available";
    });

    const averageScore =
      completedQuestionnaires.length > 0
        ? completedQuestionnaires.reduce(
            (sum, questionnaire) => sum + (questionnaire.score || 0),
            0
          ) / completedQuestionnaires.length
        : 0;

    return {
      total: questionnaires.length,
      completed: completedQuestionnaires.length,
      available: availableQuestionnaires.length,
      averageScore,
    };
  }, [questionnaires, getARCSStatus]);

  return {
    searchText,
    setSearchText,
    statusFilter,
    setStatusFilter,
    filteredQuestionnaires,
    statistics,
  };
};

export default useARCSList;
