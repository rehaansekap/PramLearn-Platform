import React, { useState } from "react";
import { Card, Tag, Typography, Space, Tooltip, Pagination } from "antd";
import {
  FileTextOutlined,
  QuestionCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

const getStatus = (dueDate, isOverdue) => {
  const now = dayjs();
  const due = dayjs(dueDate);

  if (due.isBefore(now))
    return { text: "Terlambat", color: "red", bg: "#fff1f0" };
  if (due.isSame(now, "day"))
    return { text: "Hari Ini", color: "orange", bg: "#fffbe6" };
  if (due.diff(now.startOf("day"), "day") === 1)
    return { text: "Besok", color: "gold", bg: "#fffbe6" };
  return { text: `Terjadwal`, color: "blue", bg: "#e6f7ff" };
};

const getTypeIcon = (type) =>
  type === "quiz" ? (
    <Tooltip title="Kuis">
      <QuestionCircleOutlined
        style={{ color: "#faad14", fontSize: 18, marginRight: 6 }}
      />
    </Tooltip>
  ) : (
    <Tooltip title="Tugas">
      <FileTextOutlined
        style={{ color: "#ff4d4f", fontSize: 18, marginRight: 6 }}
      />
    </Tooltip>
  );

const PAGE_SIZE = 3;

const UpcomingDeadlinesCard = ({ deadlines = [] }) => {
  const [page, setPage] = useState(1);

  // Filter: hanya tampilkan yang belum dikerjakan/submit
  const filteredDeadlines = deadlines.filter((item) => !item.is_submitted);

  // Sort: overdue dulu, lalu due date terdekat
  const sortedDeadlines = [...filteredDeadlines].sort((a, b) => {
    if (a.is_overdue !== b.is_overdue) return a.is_overdue ? -1 : 1;
    return dayjs(a.due_date).isAfter(dayjs(b.due_date)) ? 1 : -1;
  });

  const pagedDeadlines = sortedDeadlines.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <Card
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
          <Text strong>Deadline Mendatang</Text>
        </Space>
      }
      style={{ borderRadius: 12 }}
      bodyStyle={{ padding: 0 }}
    >
      {pagedDeadlines.length === 0 ? (
        <div style={{ padding: 32, textAlign: "center", color: "#999" }}>
          Tidak ada deadline dalam waktu dekat.
        </div>
      ) : (
        <>
          {pagedDeadlines.map((item, idx) => {
            const status = getStatus(item.due_date, item.is_overdue);
            return (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  padding: "18px 24px",
                  background: status.bg,
                  borderBottom:
                    idx !== pagedDeadlines.length - 1
                      ? "1px solid #f0f0f0"
                      : "none",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 2,
                    }}
                  >
                    {getTypeIcon(item.type)}
                    <Text
                      strong
                      style={{
                        color: status.color === "red" ? "#ff4d4f" : "#222",
                        fontSize: 15,
                      }}
                    >
                      {item.title}
                    </Text>
                  </div>
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 2 }}>
                    {item.subject}
                    {item.material ? <> • {item.material}</> : null}
                    {item.group_name ? <> • {item.group_name}</> : null}
                  </div>
                  {item.description && (
                    <div style={{ fontSize: 12, color: "#888" }}>
                      {item.description}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right", minWidth: 90 }}>
                  <Tag
                    color={status.color}
                    style={{
                      fontWeight: 500,
                      fontSize: 12,
                      borderRadius: 6,
                      marginBottom: 4,
                    }}
                  >
                    {status.text}
                  </Tag>
                  <div style={{ fontSize: 11, color: "#888" }}>
                    {dayjs(item.due_date).format("DD MMM YYYY, HH:mm")}
                  </div>
                </div>
              </div>
            );
          })}
          {filteredDeadlines.length > PAGE_SIZE && (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <Pagination
                current={page}
                pageSize={PAGE_SIZE}
                total={filteredDeadlines.length}
                onChange={setPage}
                size="small"
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default UpcomingDeadlinesCard;
