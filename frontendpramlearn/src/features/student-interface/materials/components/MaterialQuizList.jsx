import React from "react";
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
import QuizUnavailableCard from "./quiz/QuizUnavailableCard";

// Configure dayjs
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.locale("id");

const MaterialQuizList = ({ quizzes, material }) => {
  const { enrichedQuizzes, loading } = useQuizEnhancement(quizzes, material);
  const { getTimeRemaining, getTimeRemainingColor } = useQuizTimer();

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
          // Skip quiz yang tidak tersedia untuk user
          if (quiz.not_available) {
            return (
              <Col xs={24} sm={24} md={12} lg={12} xl={12} key={quiz.id}>
                <QuizUnavailableCard quiz={quiz} />
              </Col>
            );
          }

          const timeRemaining = getTimeRemaining(quiz.end_time);
          const timeColor = getTimeRemainingColor(quiz.end_time);

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
