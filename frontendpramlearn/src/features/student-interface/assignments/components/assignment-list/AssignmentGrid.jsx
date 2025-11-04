import React from "react";
import { Card, List, Empty, Typography } from "antd";
import AssignmentCard from "./AssignmentCard";

const { Text } = Typography;

const AssignmentGrid = ({
  filteredAssignments,
  getAssignmentStatus,
  getTimeRemaining,
  isMobile,
  searchText,
  statusFilter,
}) => {
  return (
    <Card
      style={{
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
      styles={{
        header: {
          borderBottom: "1px solid #f0f0f0",
          background: "#fafafa",
        },
      }}
    >
      {filteredAssignments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px" }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Text style={{ fontSize: 16, color: "#666" }}>
                  {searchText || statusFilter !== "all"
                    ? "Tidak ada tugas yang sesuai dengan filter"
                    : "Belum ada tugas tersedia"}
                </Text>
                <div style={{ marginTop: 12 }}>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    {searchText || statusFilter !== "all"
                      ? "Coba ubah kata kunci pencarian atau filter"
                      : "Tugas akan tersedia setelah ditambahkan oleh guru"}
                  </Text>
                </div>
              </div>
            }
          />
        </div>
      ) : (
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 1,
            md: 1,
            lg: 2,
            xl: 2,
            xxl: 2,
          }}
          dataSource={filteredAssignments}
          renderItem={(assignment) => {
            const status = getAssignmentStatus(assignment);
            const timeRemaining = getTimeRemaining(assignment.due_date);

            return (
              <List.Item>
                <AssignmentCard
                  assignment={assignment}
                  status={status}
                  timeRemaining={timeRemaining}
                  isMobile={isMobile}
                />
              </List.Item>
            );
          }}
        />
      )}
    </Card>
  );
};

export default AssignmentGrid;
