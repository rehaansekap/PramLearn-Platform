import React from "react";
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

const MaterialAssignmentList = ({ assignments, material }) => {
  const { enrichedAssignments, loading } = useAssignmentEnhancement(
    assignments,
    material
  );
  const { getTimeRemaining } = useAssignmentTimer();

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
