import React from "react";
import {
  Card,
  List,
  Typography,
  Space,
  Tag,
  Empty,
  Skeleton,
  Avatar,
} from "antd";
import {
  FileTextOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("id");

const { Text, Title } = Typography;

const RecentSubmissionsCard = ({ submissions, loading }) => {
  const formatTime = (timeString) => {
    try {
      const time = dayjs(timeString);
      if (time.isValid()) {
        if (dayjs().diff(time, "hour") > 24) {
          return time.format("DD MMM, HH:mm");
        }
        return time.fromNow();
      }
      return timeString;
    } catch (error) {
      return timeString;
    }
  };

  const getGradeColor = (grade) => {
    if (grade === null || grade === undefined) return "#faad14";
    if (grade >= 85) return "#52c41a";
    if (grade >= 70) return "#1890ff";
    if (grade >= 60) return "#faad14";
    return "#ff4d4f";
  };

  return (
    <Card
      title={
        <Space>
          <FileTextOutlined style={{ color: "#11418b" }} />
          <Text strong>Submission Terbaru</Text>
        </Space>
      }
      style={{ borderRadius: 12, marginBottom: 16 }}
      bodyStyle={{ padding: 16 }}
      extra={
        <Text type="secondary" style={{ fontSize: 12 }}>
          7 hari terakhir
        </Text>
      }
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : submissions && submissions.length > 0 ? (
        <List
          itemLayout="horizontal"
          dataSource={submissions}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: "12px 0",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    size={40}
                    icon={<UserOutlined />}
                    style={{
                      backgroundColor: "#1890ff",
                    }}
                  />
                }
                title={
                  <div>
                    <Text strong style={{ fontSize: 14 }}>
                      {item.student_name}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.assignment_title}
                    </Text>
                  </div>
                }
                description={
                  <Space direction="vertical" size={4}>
                    <Space size={8}>
                      <Tag color="blue" style={{ fontSize: 11 }}>
                        {item.subject_name}
                      </Tag>
                      <Space size={4}>
                        <ClockCircleOutlined
                          style={{ fontSize: 11, color: "#999" }}
                        />
                        <Text style={{ fontSize: 11, color: "#999" }}>
                          {formatTime(item.submission_date)}
                        </Text>
                      </Space>
                    </Space>
                    <div>
                      {item.is_graded ? (
                        <Space size={4}>
                          <CheckCircleOutlined
                            style={{ color: "#52c41a", fontSize: 12 }}
                          />
                          <Text
                            style={{
                              fontSize: 12,
                              color: getGradeColor(item.grade),
                            }}
                          >
                            Nilai: {item.grade}
                          </Text>
                        </Space>
                      ) : (
                        <Space size={4}>
                          <ExclamationCircleOutlined
                            style={{ color: "#faad14", fontSize: 12 }}
                          />
                          <Text style={{ fontSize: 12, color: "#faad14" }}>
                            Menunggu Penilaian
                          </Text>
                        </Space>
                      )}
                    </div>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text style={{ fontSize: 14, color: "#666" }}>
                Belum ada submission terbaru
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Submission dari siswa akan muncul di sini
              </Text>
            </div>
          }
        />
      )}
    </Card>
  );
};

export default RecentSubmissionsCard;
