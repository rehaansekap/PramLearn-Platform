import React from "react";
import QuizAnswerItem from "./QuizAnswerItem";

const QuizAnswersReview = ({ questions, isGroupQuiz }) => {
  return (
    <div style={{ marginBottom: 24 }}>
      {questions.map((question, index) => (
        <QuizAnswerItem
          key={question.id || index}
          question={question}
          index={index}
          isGroupQuiz={isGroupQuiz}
        />
      ))}
    </div>
  );
};

export default QuizAnswersReview;
