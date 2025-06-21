import React, { useEffect, useRef, useCallback } from "react";
import { Row, Col } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import "dayjs/locale/id";

// Hooks
import useQuizEnhancement from "../hooks/useQuizEnhancement";
import useQuizTimer from "../hooks/useQuizTimer";

// Components
import QuizHeader from "./quiz/QuizHeader";
import QuizLoadingState from "./quiz/QuizLoadingState";
import QuizEmptyState from "./quiz/QuizEmptyState";
import QuizCard from "./quiz/QuizCard";

// Configure dayjs
dayjs.extend(relativeTime);
dayjs.extend(duration);

const MaterialQuizList = ({
  quizzes,
  material,
  recordQuizCompletion,
  completedActivities = new Set(),
}) => {
  const { enrichedQuizzes, loading } = useQuizEnhancement(quizzes, material);
  const { getTimeRemaining, getTimeRemainingColor } = useQuizTimer();

  // ✅ IMPROVED: Better tracking with more specific refs
  const recordedQuizzes = useRef(new Set());
  const recordingInProgress = useRef(new Set());
  const initialLoadComplete = useRef(false);

  // ✅ THROTTLED RECORD FUNCTION
  const throttledRecordQuizCompletion = useCallback(
    async (quizId, isGroupQuiz) => {
      const quizKey = `${quizId}_${isGroupQuiz}`;

      // Skip if already recorded or currently recording
      if (
        recordedQuizzes.current.has(quizKey) ||
        recordingInProgress.current.has(quizKey)
      ) {
        console.log(
          `⚠️ Quiz ${quizId} already recorded or recording, skipping...`
        );
        return;
      }

      // Mark as recording
      recordingInProgress.current.add(quizKey);

      try {
        await recordQuizCompletion(quizId, isGroupQuiz);
        recordedQuizzes.current.add(quizKey);
        console.log(`✅ Quiz ${quizId} recorded successfully`);
      } catch (error) {
        console.error(`❌ Failed to record quiz ${quizId}:`, error);
      } finally {
        // Remove from recording progress
        recordingInProgress.current.delete(quizKey);
      }
    },
    [recordQuizCompletion]
  );

  // ✅ IMPROVED: Auto-record with better deduplication
  useEffect(() => {
    if (
      !enrichedQuizzes ||
      !recordQuizCompletion ||
      !initialLoadComplete.current
    ) {
      return;
    }

    const timeoutId = setTimeout(() => {
      enrichedQuizzes.forEach((quiz) => {
        const quizKey = `${quiz.id}_${quiz.is_group_quiz || false}`;
        const activityKey = `quiz_completed_${quiz.id}`;

        // ✅ PERBAIKAN: Cek dari berbagai sumber completion
        const isCompletedByActivity = completedActivities.has(activityKey);
        const isCompletedByQuizData =
          quiz.completed === true || quiz.is_completed === true;
        const isCompletedByAttempt = quiz.student_attempt?.submitted_at;

        const shouldRecord =
          (isCompletedByQuizData || isCompletedByAttempt) &&
          !isCompletedByActivity &&
          !recordedQuizzes.current.has(quizKey) &&
          !recordingInProgress.current.has(quizKey);

        if (shouldRecord) {
          throttledRecordQuizCompletion(quiz.id, quiz.is_group_quiz || false);
        }
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [enrichedQuizzes, throttledRecordQuizCompletion, completedActivities]);

  // ✅ INITIAL LOAD TRACKING
  useEffect(() => {
    if (enrichedQuizzes && enrichedQuizzes.length > 0) {
      initialLoadComplete.current = true;
    }
  }, [enrichedQuizzes]);

  // ✅ RESET SAAT MATERIAL BERUBAH
  // useEffect(() => {
  //   recordedQuizzes.current.clear();
  //   recordingInProgress.current.clear();
  //   initialLoadComplete.current = false;
  // }, [material?.id]);

  if (loading) {
    return <QuizLoadingState />;
  }

  if (!enrichedQuizzes || enrichedQuizzes.length === 0) {
    return <QuizEmptyState />;
  }

  return (
    <div>
      <QuizHeader />

      <Row gutter={[16, 16]}>
        {enrichedQuizzes.map((quiz) => {
          const timeRemaining = getTimeRemaining(quiz.end_time);
          const timeColor = getTimeRemainingColor(timeRemaining);

          return (
            <Col xs={24} sm={24} md={12} lg={12} xl={12} key={quiz.id}>
              <QuizCard
                quiz={quiz}
                timeRemaining={timeRemaining}
                timeColor={timeColor}
              />
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default MaterialQuizList;
