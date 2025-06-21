import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../../api";

const useSubmissionHistory = (assignment, submissions) => {
  const { assignmentSlug } = useParams();
  const navigate = useNavigate();
  const [assignmentState, setAssignment] = useState(assignment);
  const [submissionsState, setSubmissions] = useState(submissions || []);
  const [loading, setLoading] = useState(!assignment || !submissions);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (assignment?.id && (!submissions || submissions.length === 0)) {
      console.log("🔄 Fetching submission data for history:", assignment.id);
      fetchSubmissionData();
    }
  }, [assignment?.id, submissions]);

  const fetchSubmissionData = async () => {
    if (!assignment?.id) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(
        `student/assignment/${assignment.id}/submissions/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubmissions(response.data || []);
    } catch (error) {
      console.error("Error fetching submission data:", error);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch assignment data jika diakses langsung via route
  const fetchAssignmentData = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/student/assignments/${assignmentSlug}/results/`
      );

      if (response.data.assignment && response.data.submissions) {
        setAssignment(response.data.assignment);
        setSubmissions(response.data.submissions);
      } else {
        throw new Error("Format response tidak valid");
      }
    } catch (error) {
      if (error.response?.status === 404) {
        try {
          // Fallback: ambil dari assignment list
          const assignmentsResponse = await api.get(
            "/student/assignments/available/"
          );
          const foundAssignment = assignmentsResponse.data.find((a) => {
            const titleSlug = a.title.toLowerCase().replace(/\s+/g, "-");
            return a.slug === assignmentSlug || titleSlug === assignmentSlug;
          });

          if (foundAssignment) {
            setAssignment(foundAssignment);

            try {
              const submissionsResponse = await api.get(
                `/student/assignment/${foundAssignment.id}/submissions/`
              );
              setSubmissions(submissionsResponse.data || []);
            } catch (submissionError) {
              setSubmissions([]);
            }
          } else {
            setAssignment(null);
            setSubmissions([]);
          }
        } catch (fallbackError) {
          setAssignment(null);
          setSubmissions([]);
        }
      } else {
        setAssignment(null);
        setSubmissions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch detailed submission data
  const fetchSubmissionDetails = async (submissionId) => {
    setLoadingDetails(true);
    try {
      const response = await api.get(
        `/student/assignment-submission/${submissionId}/details/`
      );
      setSubmissionDetails(response.data);
    } catch (error) {
      setSubmissionDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (assignmentSlug && (!assignment || !submissions)) {
      fetchAssignmentData();
    }
  }, [assignmentSlug, assignment, submissions]);

  useEffect(() => {
    if (submissionsState.length > 0 && !selectedSubmission) {
      fetchSubmissionDetails(submissionsState[0].id);
    }
  }, [submissionsState]);

  useEffect(() => {
    if (selectedSubmission) {
      fetchSubmissionDetails(selectedSubmission.id);
    }
  }, [selectedSubmission]);

  const handleBack = () => {
    navigate("/student/assignments");
  };

  return {
    assignmentState,
    submissionsState,
    loading,
    selectedSubmission,
    setSelectedSubmission,
    submissionDetails,
    loadingDetails,
    handleBack,
  };
};

export default useSubmissionHistory;
