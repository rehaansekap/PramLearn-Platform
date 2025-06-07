import { useState, useContext } from "react";
import api from "../../../api";
import { AuthContext } from "../../../context/AuthContext";
import dayjs from "dayjs";

const useAssignmentForm = (materialId, onSuccess, editingAssignment) => {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    questions: [],
  });
  const [loading, setLoading] = useState(false);
  const isEdit = !!editingAssignment;

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          text: "",
          choice_a: "",
          choice_b: "",
          choice_c: "",
          choice_d: "",
          correct_choice: "A",
        },
      ],
    }));
  };

  const updateQuestion = (idx, field, value) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === idx ? { ...q, [field]: value } : q
      ),
    }));
  };

  const removeQuestion = (idx) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const { title, description, due_date, questions } = formData;

      console.log("Submitting assignment:", {
        title,
        description,
        due_date,
        questions,
      });

      // PERBAIKAN: Format due_date ke ISO format
      let formattedDueDate = due_date;
      if (due_date) {
        // Jika due_date adalah string dari DatePicker (DD/MM/YYYY HH:mm)
        if (typeof due_date === "string" && due_date.includes("/")) {
          // Parse dari format DD/MM/YYYY HH:mm ke ISO
          const parsed = dayjs(due_date, "DD/MM/YYYY HH:mm");
          formattedDueDate = parsed.isValid() ? parsed.toISOString() : due_date;
        } else if (dayjs.isDayjs(due_date)) {
          // Jika sudah dayjs object
          formattedDueDate = due_date.toISOString();
        } else if (typeof due_date === "string") {
          // Coba parse sebagai ISO string atau convert ke ISO
          const parsed = dayjs(due_date);
          formattedDueDate = parsed.isValid() ? parsed.toISOString() : due_date;
        }
      }

      console.log("Formatted due_date:", formattedDueDate);

      let assignmentId;

      if (isEdit) {
        // Update assignment
        console.log("Updating assignment with ID:", editingAssignment.id);
        await api.put(`assignments/${editingAssignment.id}/`, {
          material: materialId,
          title,
          description,
          due_date: formattedDueDate,
        });
        assignmentId = editingAssignment.id;

        // Update questions logic...
        const oldQuestionsRes = await api.get(
          `assignment-questions/?assignment=${assignmentId}`
        );
        const oldQuestions = oldQuestionsRes.data;

        const oldQuestionsMap = {};
        oldQuestions.forEach((q) => {
          oldQuestionsMap[q.id] = q;
        });

        const newQuestionsWithId = questions.filter((q) => q.id);
        const newQuestionsWithoutId = questions.filter((q) => !q.id);

        const toDelete = oldQuestions.filter(
          (oldQ) => !newQuestionsWithId.find((newQ) => newQ.id === oldQ.id)
        );

        await Promise.all(
          toDelete.map((q) => api.delete(`assignment-questions/${q.id}/`))
        );

        await Promise.all(
          newQuestionsWithId.map((q) =>
            api.put(`assignment-questions/${q.id}/`, {
              text: q.text,
              choice_a: q.choice_a,
              choice_b: q.choice_b,
              choice_c: q.choice_c,
              choice_d: q.choice_d,
              correct_choice: q.correct_choice,
              assignment: assignmentId,
            })
          )
        );

        await Promise.all(
          newQuestionsWithoutId.map((q) =>
            api.post("assignment-questions/", {
              ...q,
              assignment: assignmentId,
            })
          )
        );
      } else {
        // CREATE assignment
        console.log("Creating new assignment");
        const assignmentPayload = {
          material: materialId,
          title,
          description,
          due_date: formattedDueDate,
        };

        console.log("Assignment payload:", assignmentPayload);

        const res = await api.post("assignments/", assignmentPayload);
        assignmentId = res.data.id;
        console.log("Assignment created with ID:", assignmentId);

        // Create questions
        if (questions && questions.length > 0) {
          console.log("Creating questions for new assignment:", questions);
          await Promise.all(
            questions.map((q) =>
              api.post("assignment-questions/", {
                text: q.text,
                choice_a: q.choice_a,
                choice_b: q.choice_b,
                choice_c: q.choice_c,
                choice_d: q.choice_d,
                correct_choice: q.correct_choice,
                assignment: assignmentId,
              })
            )
          );
          console.log("All questions created successfully");
        }
      }

      console.log("Assignment submission completed successfully");
      if (onSuccess) onSuccess();
      return true;
    } catch (err) {
      console.error("Error submitting assignment:", err);
      console.error("Error details:", err.response?.data);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    handleChange,
    addQuestion,
    updateQuestion,
    removeQuestion,
    handleSubmit,
    loading,
    isEdit,
  };
};

export default useAssignmentForm;
