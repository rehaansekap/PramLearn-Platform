import { useState, useEffect } from "react";
import api from "../../../../api";

const useQuizEnhancement = (quizzes, material) => {
  const [enrichedQuizzes, setEnrichedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const enhanceQuizData = async () => {
      if (!quizzes || quizzes.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const enhancedQuizzes = await Promise.all(
          quizzes.map(async (quiz) => {
            let enhancedQuiz = {
              ...quiz,
              questions_count: quiz.questions?.length || 0,
              duration: quiz.duration || null,
              end_time: quiz.end_time,
              subject_name: material?.subject_name || quiz.subject_name,
              subject_id: material?.subject || quiz.subject_id,
              material_name: material?.title || quiz.material_name,
              material_id: material?.id || quiz.material_id,
              material_slug: material?.slug || quiz.material_slug,
              is_completed: false,
              score: null,
              student_attempt: null,
            };

            if (quiz.is_group_quiz) {
              try {
                const response = await api.get(
                  `/student/group-quiz/${quiz.slug}/`
                );

                enhancedQuiz = {
                  ...enhancedQuiz,
                  ...response.data,
                  subject_name:
                    enhancedQuiz.subject_name || response.data.subject_name,
                  material_name:
                    enhancedQuiz.material_name || response.data.material_name,
                  is_completed: response.data.is_completed || false,
                  score: response.data.score || null,
                  completed_at: response.data.completed_at || null,
                  group: response.data.group,
                  time_remaining: response.data.time_remaining,
                  current_answers: response.data.current_answers || {},
                  questions_count:
                    response.data.questions?.length ||
                    response.data.questions_count ||
                    quiz.questions?.length ||
                    0,
                };
              } catch (error) {
                console.error(`Error fetching group quiz ${quiz.slug}:`, error);
              }
            }

            return enhancedQuiz;
          })
        );

        setEnrichedQuizzes(enhancedQuizzes);
      } catch (error) {
        console.error("Error enhancing quiz data:", error);
      } finally {
        setLoading(false);
      }
    };

    enhanceQuizData();
  }, [quizzes, material]);

  return { enrichedQuizzes, loading };
};

export default useQuizEnhancement;
