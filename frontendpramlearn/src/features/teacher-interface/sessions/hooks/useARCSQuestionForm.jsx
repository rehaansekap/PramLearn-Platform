import { useState } from "react";

const useARCSQuestionForm = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    const newQuestion = {
      id: `temp_${Date.now()}`,
      text: "",
      dimension: "attention",
      question_type: "likert_5",
      order: questions.length + 1,
      is_required: true,
      choice_a: "",
      choice_b: "",
      choice_c: "",
      choice_d: "",
      choice_e: "",
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const reorderQuestions = (fromIndex, toIndex) => {
    const newQuestions = [...questions];
    const [movedQuestion] = newQuestions.splice(fromIndex, 1);
    newQuestions.splice(toIndex, 0, movedQuestion);

    // Update order numbers
    const reorderedQuestions = newQuestions.map((q, index) => ({
      ...q,
      order: index + 1,
    }));

    setQuestions(reorderedQuestions);
  };

  const validateQuestions = () => {
    const errors = [];

    questions.forEach((question, index) => {
      if (!question.text.trim()) {
        errors.push(`Pertanyaan ${index + 1}: Teks pertanyaan harus diisi`);
      }

      if (question.question_type === "multiple_choice") {
        const choices = [
          question.choice_a,
          question.choice_b,
          question.choice_c,
          question.choice_d,
        ];
        const filledChoices = choices.filter(
          (choice) => choice && choice.trim()
        );

        if (filledChoices.length < 2) {
          errors.push(
            `Pertanyaan ${
              index + 1
            }: Minimal 2 pilihan jawaban harus diisi untuk multiple choice`
          );
        }
      }
    });

    return errors;
  };

  const resetForm = () => {
    setQuestions([]);
  };

  return {
    questions,
    setQuestions,
    addQuestion,
    updateQuestion,
    removeQuestion,
    reorderQuestions,
    validateQuestions,
    resetForm,
    loading,
    setLoading,
  };
};

export default useARCSQuestionForm;
