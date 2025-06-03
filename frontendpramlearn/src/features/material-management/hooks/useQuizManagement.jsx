import { useState, useEffect, useCallback } from "react";
import api from "../../../api";
import Swal from "sweetalert2";

const useQuizManagement = (materialId) => {
  const [quizzes, setQuizzes] = useState([]);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);

  // Pindahkan ke sini dan gunakan useCallback
  const fetchQuizzes = useCallback(async () => {
    if (!materialId) return;
    try {
      const res = await api.get(`quizzes/?material=${materialId}`);
      setQuizzes(res.data);
    } catch (err) {
      setQuizzes([]);
    }
  }, [materialId]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes, quizModalOpen]);

  const handleDeleteQuiz = async (quizId) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus quiz ini?",
      text: "Quiz yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (result.isConfirmed) {
      try {
        await api.delete(`quizzes/${quizId}/`);
        setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
        Swal.fire("Berhasil!", "Quiz berhasil dihapus.", "success");
      } catch (err) {
        Swal.fire("Gagal!", "Quiz gagal dihapus.", "error");
      }
    }
  };

  const handleEditQuiz = async (quiz) => {
    try {
      const res = await api.get(`quizzes/${quiz.id}/`);
      const questions = (res.data.questions || []).map((q) => ({
        text: q.text,
        choices: [q.choice_a, q.choice_b, q.choice_c, q.choice_d],
        correctChoice: q.correct_choice,
      }));

      const groupQuizRes = await api.get(`group-quizzes/?quiz=${quiz.id}`);
      const assignedGroupIds = groupQuizRes.data.map((gq) => gq.group);

      setEditingQuiz({ ...res.data, questions, assignedGroupIds });
      setQuizModalOpen(true);
    } catch (err) {
      Swal.fire("Gagal!", "Gagal mengambil detail quiz.", "error");
    }
  };

  const handleSubmitQuiz = useCallback(
    async (
      { title, content, questions, groupIds },
      groups,
      assignQuizToGroups
    ) => {
      if (!groups || groups.length === 0) {
        Swal.fire(
          "Gagal!",
          "Tidak ada kelompok pada materi ini. Silakan bentuk kelompok terlebih dahulu sebelum membuat quiz.",
          "error"
        );
        return;
      }

      try {
        const payload = {
          title,
          material: materialId,
          is_group_quiz: true,
          content,
          questions: questions.map((q) => ({
            text: q.text,
            choice_a: q.choices[0],
            choice_b: q.choices[1],
            choice_c: q.choices[2],
            choice_d: q.choices[3],
            correct_choice: q.correctChoice,
          })),
        };

        let quizId;
        if (editingQuiz) {
          await api.put(`quizzes/${editingQuiz.id}/`, payload);
          quizId = editingQuiz.id;
        } else {
          const res = await api.post("quizzes/", payload);
          quizId = res.data.id;
        }

        if (groupIds && groupIds.length > 0) {
          await assignQuizToGroups({
            quiz_id: quizId,
            material_id: materialId,
            group_ids: groupIds,
            start_time: new Date().toISOString(),
            end_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          });
        }

        Swal.fire(
          "Berhasil!",
          `Quiz berhasil ${editingQuiz ? "diedit" : "disimpan"} & di-assign.`,
          "success"
        );
        setQuizModalOpen(false);
        setEditingQuiz(null);
        fetchQuizzes(); // Sekarang sudah bisa diakses
      } catch (error) {
        Swal.fire(
          "Gagal!",
          error.response?.data?.detail || "Quiz gagal disimpan.",
          "error"
        );
      }
    },
    [materialId, editingQuiz, fetchQuizzes]
  );

  return {
    quizzes,
    quizModalOpen,
    setQuizModalOpen,
    editingQuiz,
    setEditingQuiz,
    handleDeleteQuiz,
    handleEditQuiz,
    handleSubmitQuiz,
  };
};

export default useQuizManagement;
