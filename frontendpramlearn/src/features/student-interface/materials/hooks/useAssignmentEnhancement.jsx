import { useState, useEffect } from "react";

const useAssignmentEnhancement = (assignments, material) => {
  const [enrichedAssignments, setEnrichedAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const enhanceAssignmentData = async () => {
      if (!assignments || assignments.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const enhancedAssignments = assignments.map((assignment) => {
          return {
            ...assignment,
            questions_count: assignment.questions?.length || 0,
            subject_name: material?.subject_name || assignment.subject_name,
            subject_id: material?.subject || assignment.subject_id,
            material_name: material?.title || assignment.material_name,
            material_id: material?.id || assignment.material_id,
            material_slug: material?.slug || assignment.material_slug,
            is_submitted: assignment.is_submitted || false,
            grade: assignment.grade || null,
            submitted_at: assignment.submitted_at || null,
            submission_id: assignment.submission_id || null,
            allow_late_submission: assignment.allow_late_submission !== false,
          };
        });

        setEnrichedAssignments(enhancedAssignments);
      } catch (error) {
        console.error("Error enhancing assignment data:", error);
      } finally {
        setLoading(false);
      }
    };

    enhanceAssignmentData();
  }, [assignments, material]);

  return { enrichedAssignments, loading };
};

export default useAssignmentEnhancement;
