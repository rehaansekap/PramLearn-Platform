import { useState } from "react";

export default function useQuizForm() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false); // Tambahkan loading state

  const addQuestion = () => {
    setLoading(true);
    // Simulasi delay untuk UX yang lebih baik
    setTimeout(() => {
      setQuestions([
        ...questions,
        {
          text: "",
          choices: ["", "", "", ""],
          correctChoice: "A",
        },
      ]);
      setLoading(false);
    }, 200);
  };

  const updateQuestion = (idx, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    );
  };

  const updateChoice = (qIdx, cIdx, value) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              choices: q.choices.map((c, j) => (j === cIdx ? value : c)),
            }
          : q
      )
    );
  };

  const removeQuestion = (idx) => {
    setLoading(true);
    // Simulasi delay untuk UX yang lebih baik
    setTimeout(() => {
      setQuestions((prev) => prev.filter((_, i) => i !== idx));
      setLoading(false);
    }, 200);
  };

  return {
    questions,
    setQuestions,
    addQuestion,
    updateQuestion,
    updateChoice,
    removeQuestion,
    loading, // Export loading state
  };
}
