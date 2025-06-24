import React from "react";
import {
  Card,
  List,
  Typography,
  Space,
  Tag,
  Empty,
  Skeleton,
  Progress,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

const UpcomingDeadlinesCard = ({ deadlines, loading }) => {
  const getDaysLeftColor = (days) => {
    if (days <= 1) return "#ff4d4f";
    if (days <= 3) return "#faad14";
    return "#52c41a";
  };

  const getCompletionColor = (rate) => {
    if (rate >= 80) return "#52c41a";
    if (rate >= 60) return "#1890ff";
    if (rate >= 40) return "#faad14";
    return "#ff4d4f";
  };

  return (
    <Card
      title={
        <Space>
          <CalendarOutlined style={{ color: "#11418b" }} />
          <Text strong>Deadline Mendatang</Text>
        </Space>
      }
      style={{ borderRadius: 12, marginBottom: 16 }}
      bodyStyle={{ padding: 16 }}
      extra={
        <Text type="secondary" style={{ fontSize: 12 }}>
          7 hari ke depan
        </Text>
      }
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : deadlines && deadlines.length > 0 ? (
        <List
          itemLayout="vertical"
          dataSource={deadlines}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: "12px 0",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <div style={{ width: "100%" }}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong style={{ fontSize: 14 }}>
                    {item.title}
                  </Text>
                  <br />
                  <Tag color="blue" style={{ fontSize: 11, marginTop: 4 }}>
                    {item.subject_name}
                  </Tag>
                </div>

                <Space direction="vertical" style={{ width: "100%" }} size={8}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Space size={8}>
                      <ClockCircleOutlined
                        style={{ fontSize: 12, color: "#666" }}
                      />
                      <Text style={{ fontSize: 12, color: "#666" }}>
                        {dayjs(item.due_date).format("DD MMM YYYY, HH:mm")}
                      </Text>
                    </Space>
                    <Tag
                      color={getDaysLeftColor(item.days_left)}
                      style={{ fontSize: 11, fontWeight: 500 }}
                    >
                      {item.days_left === 0
                        ? "Hari ini"
                        : `${item.days_left} hari lagi`}
                    </Tag>
                  </div>

                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <Text style={{ fontSize: 12, color: "#666" }}>
                        Submission Progress
                      </Text>
                      <Text style={{ fontSize: 12, color: "#666" }}>
                        {item.submissions_count}/{item.expected_submissions}
                      </Text>
                    </div>
                    <Progress
                      percent={item.completion_rate}
                      strokeColor={getCompletionColor(item.completion_rate)}
                      showInfo={false}
                      size="small"
                    />
                  </div>
                </Space>
              </div>
            </List.Item>
          )}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text style={{ fontSize: 14, color: "#666" }}>
                Tidak ada deadline mendatang
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Semua tugas sudah terjadwal dengan baik
              </Text>
            </div>
          }
        />
      )}
    </Card>
  );
};

export default UpcomingDeadlinesCard;
