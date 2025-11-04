import api from "../../../api";

const useAssignQuizToGroups = () => {
  const assignQuizToGroups = async ({
    quiz_id,
    material_id,
    group_ids,
    start_time,
    end_time,
  }) => {
    const response = await api.post("assign-quiz-to-groups/", {
      quiz_id,
      material_id,
      group_ids,
      start_time,
      end_time,
    });
    return response.data;
  };

  return { assignQuizToGroups };
};

export default useAssignQuizToGroups;
