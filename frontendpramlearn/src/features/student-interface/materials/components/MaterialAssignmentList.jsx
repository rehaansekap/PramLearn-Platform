import React, { useEffect, useRef, useCallback } from "react";
import { Row, Col } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";

// Hooks
import useAssignmentEnhancement from "../hooks/useAssignmentEnhancement";
import useAssignmentTimer from "../hooks/useAssignmentTimer";

// Components
import AssignmentHeader from "./assignment/AssignmentHeader";
import AssignmentLoadingState from "./assignment/AssignmentLoadingState";
import AssignmentEmptyState from "./assignment/AssignmentEmptyState";
import AssignmentCard from "./assignment/AssignmentCard";

// Configure dayjs
dayjs.extend(relativeTime);
dayjs.locale("id");

const MaterialAssignmentList = ({
  assignments,
  material,
  recordAssignmentSubmission,
  completedActivities = new Set(),
}) => {
  const { enrichedAssignments, loading } = useAssignmentEnhancement(
    assignments,
    material
  );
  const { getTimeRemaining } = useAssignmentTimer();

  // ✅ IMPROVED: Better tracking refs
  const recordedAssignments = useRef(new Set());
  const recordingInProgress = useRef(new Set());
  const initialLoadComplete = useRef(false);

  // ✅ THROTTLED RECORD FUNCTION
  const throttledRecordAssignmentSubmission = useCallback(
    async (assignmentId) => {
      const assignmentKey = assignmentId.toString();

      // Skip if already recorded or currently recording
      if (
        recordedAssignments.current.has(assignmentKey) ||
        recordingInProgress.current.has(assignmentKey)
      ) {
        console.log(
          `⚠️ Assignment ${assignmentId} already recorded or recording, skipping...`
        );
        return;
      }

      // Mark as recording
      recordingInProgress.current.add(assignmentKey);

      try {
        console.log(`🎯 Recording assignment submission: ${assignmentId}`);
        await recordAssignmentSubmission(assignmentId);
        recordedAssignments.current.add(assignmentKey);
        console.log(`✅ Assignment ${assignmentId} recorded successfully`);
      } catch (error) {
        console.error(`❌ Failed to record assignment ${assignmentId}:`, error);
      } finally {
        // Remove from recording progress
        recordingInProgress.current.delete(assignmentKey);
      }
    },
    [recordAssignmentSubmission]
  );

  // ✅ IMPROVED: Auto-record with throttling
  useEffect(() => {
    if (
      !enrichedAssignments ||
      !recordAssignmentSubmission ||
      !initialLoadComplete.current
    ) {
      return;
    }

    const timeoutId = setTimeout(() => {
      enrichedAssignments.forEach((assignment) => {
        const assignmentKey = assignment.id.toString();
        // CEK: Hanya record jika belum pernah dicatat DAN belum completed di backend
        if (
          (assignment.is_submitted || assignment.submitted_at) &&
          !recordedAssignments.current.has(assignmentKey) &&
          !recordingInProgress.current.has(assignmentKey)
        ) {
          if (
            completedActivities.has(`assignment_submitted_${assignment.id}`)
          ) {
            return;
          }
          throttledRecordAssignmentSubmission(assignment.id);
        }
      });
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [
    enrichedAssignments,
    throttledRecordAssignmentSubmission,
    completedActivities,
  ]);

  // ✅ INITIAL LOAD TRACKING
  useEffect(() => {
    if (enrichedAssignments && enrichedAssignments.length > 0) {
      initialLoadComplete.current = true;
    }
  }, [enrichedAssignments]);

  // ✅ RESET SAAT MATERIAL BERUBAH
  // useEffect(() => {
  //   recordedAssignments.current.clear();
  //   recordingInProgress.current.clear();
  //   initialLoadComplete.current = false;
  // }, [material?.id]);

  if (loading) {
    return <AssignmentLoadingState />;
  }

  if (!enrichedAssignments || enrichedAssignments.length === 0) {
    return <AssignmentEmptyState />;
  }

  return (
    <div>
      <AssignmentHeader />

      <Row gutter={[16, 16]}>
        {enrichedAssignments.map((assignment) => {
          const timeRemaining = getTimeRemaining(assignment.due_date);

          return (
            <Col xs={24} sm={24} md={12} lg={12} xl={12} key={assignment.id}>
              <AssignmentCard
                assignment={assignment}
                timeRemaining={timeRemaining}
              />
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default MaterialAssignmentList;
