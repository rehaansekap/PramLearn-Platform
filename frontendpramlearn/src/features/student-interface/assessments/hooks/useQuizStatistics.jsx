import { useMemo } from "react";

const useQuizStatistics = (allQuizzes, getQuizStatus) => {
  return useMemo(() => {
    const completedQuizzes = allQuizzes.filter((quiz) => {
      const status = getQuizStatus(quiz);
      return status.status === "completed";
    });

    const inProgressQuizzes = allQuizzes.filter((quiz) => {
      const status = getQuizStatus(quiz);
      return status.status === "in_progress";
    });

    const availableQuizzes = allQuizzes.filter((quiz) => {
      const status = getQuizStatus(quiz);
      return status.status === "available";
    });

    const averageScore =
      completedQuizzes.length > 0
        ? completedQuizzes.reduce(
            (sum, quiz) =>
              sum + (quiz.student_attempt?.score || quiz.score || 0),
            0
          ) / completedQuizzes.length
        : 0;

    return {
      total: allQuizzes.length,
      completed: completedQuizzes.length,
      inProgress: inProgressQuizzes.length,
      available: availableQuizzes.length,
      averageScore,
    };
  }, [allQuizzes, getQuizStatus]);
};

export default useQuizStatistics;
