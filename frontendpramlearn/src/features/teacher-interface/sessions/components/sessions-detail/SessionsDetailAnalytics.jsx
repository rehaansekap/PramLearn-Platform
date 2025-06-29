import React from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Progress,
  Statistic,
  List,
  Avatar,
  Tag,
  Space,
  Empty,
} from "antd";
import {
  TrophyOutlined,
  UserOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  BookOutlined,
  FireOutlined,
  StarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const SessionsDetailAnalytics = ({ sessionDetail, isMobile }) => {
  if (!sessionDetail) {
    return (
      <Card
        style={{
          borderRadius: 16,
          background: "linear-gradient(135deg, #f8faff 0%, #f0f9ff 100%)",
        }}
      >
        <Empty
          image={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: 120,
                height: 120,
                margin: "0 auto 20px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "50%",
                color: "white",
                fontSize: 48,
              }}
            >
              <BarChartOutlined />
            </div>
          }
          description={
            <div>
              <Title level={3} style={{ color: "#667eea", marginBottom: 8 }}>
                Data Analytics Tidak Tersedia
              </Title>
              <Text style={{ color: "#666", fontSize: 16 }}>
                Silakan coba lagi nanti
              </Text>
            </div>
          }
        />
      </Card>
    );
  }

  const { statistics, students } = sessionDetail;

  // Process student performance data
  const topPerformers = (students || [])
    .sort((a, b) => (b.average_grade || 0) - (a.average_grade || 0))
    .slice(0, 5);

  const recentActivities = (students || [])
    .filter((student) => student.last_activity)
    .sort(
      (a, b) => dayjs(b.last_activity).unix() - dayjs(a.last_activity).unix()
    )
    .slice(0, 8);

  const getGradeColor = (grade) => {
    if (grade >= 85) return "#52c41a";
    if (grade >= 70) return "#faad14";
    return "#ff4d4f";
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "#52c41a";
    if (progress >= 60) return "#faad14";
    return "#ff4d4f";
  };

  return (
    <Row gutter={[16, 16]}>
      {/* Performance Overview */}
      <Col xs={24} lg={12}>
        <Card
          title={
            <Space>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <BarChartOutlined />
              </div>
              <span style={{ color: "#667eea", fontWeight: 600 }}>
                Performance Overview
              </span>
            </Space>
          }
          style={{
            borderRadius: 16,
            height: "100%",
            border: "1px solid #667eea20",
          }}
          headStyle={{
            background: "linear-gradient(135deg, #f8faff 0%, #e6f7ff 100%)",
            borderRadius: "16px 16px 0 0",
            borderBottom: "1px solid #667eea20",
          }}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="small"
              >
                <div
                  style={{
                    background: "white",
                    borderRadius: "50%",
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 8px",
                    fontSize: 16,
                    boxShadow: "0 4px 12px #52c41a20",
                  }}
                >
                  <BarChartOutlined style={{ color: "#52c41a" }} />
                </div>
                <Statistic
                  title="Progress Keseluruhan"
                  value={statistics?.overall_progress || 0}
                  suffix="%"
                  valueStyle={{
                    color: "#52c41a",
                    fontSize: isMobile ? 18 : 20,
                    fontWeight: 700,
                  }}
                />
                <Progress
                  percent={statistics?.overall_progress || 0}
                  size="small"
                  strokeColor="#52c41a"
                  style={{ marginTop: 8 }}
                />
              </Space>
            </Col>
            <Col span={12}>
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="small"
              >
                <div
                  style={{
                    background: "white",
                    borderRadius: "50%",
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 8px",
                    fontSize: 16,
                    boxShadow: "0 4px 12px #1890ff20",
                  }}
                >
                  <UserOutlined style={{ color: "#1890ff" }} />
                </div>
                <Statistic
                  title="Tingkat Kehadiran"
                  value={statistics?.overall_attendance || 0}
                  suffix="%"
                  valueStyle={{
                    color: "#1890ff",
                    fontSize: isMobile ? 18 : 20,
                    fontWeight: 700,
                  }}
                />
                <Progress
                  percent={statistics?.overall_attendance || 0}
                  size="small"
                  strokeColor="#1890ff"
                  style={{ marginTop: 8 }}
                />
              </Space>
            </Col>
            <Col span={12}>
              <Statistic
                title="Completion Rate"
                value={statistics?.overall_completion || 0}
                suffix="%"
                valueStyle={{
                  color: "#52c41a",
                  fontSize: isMobile ? 18 : 20,
                  fontWeight: 700,
                }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Average Grade"
                value={statistics?.average_grade || 0}
                precision={1}
                valueStyle={{
                  color: getGradeColor(statistics?.average_grade || 0),
                  fontSize: isMobile ? 18 : 20,
                  fontWeight: 700,
                }}
              />
            </Col>
          </Row>
        </Card>
      </Col>

      {/* Top Performers */}
      <Col xs={24} lg={12}>
        <Card
          title={
            <Space>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #faad14 0%, #ffd700 100%)",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <TrophyOutlined />
              </div>
              <span style={{ color: "#faad14", fontWeight: 600 }}>
                Top Performers
              </span>
            </Space>
          }
          style={{
            borderRadius: 16,
            height: "100%",
            border: "1px solid #faad1420",
          }}
          headStyle={{
            background: "linear-gradient(135deg, #fff7e6 0%, #fffbe6 100%)",
            borderRadius: "16px 16px 0 0",
            borderBottom: "1px solid #faad1420",
          }}
        >
          {topPerformers.length > 0 ? (
            <List
              dataSource={topPerformers}
              renderItem={(student, index) => (
                <List.Item
                  style={{
                    padding: "12px 0",
                    borderBottom:
                      index === topPerformers.length - 1
                        ? "none"
                        : "1px solid #f0f0f0",
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{ position: "relative" }}>
                        <Avatar
                          icon={<UserOutlined />}
                          style={{
                            background:
                              index === 0
                                ? "linear-gradient(135deg, #faad14 0%, #ffd700 100%)"
                                : index === 1
                                ? "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)"
                                : "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
                          }}
                        />
                        {index < 3 && (
                          <div
                            style={{
                              position: "absolute",
                              top: -4,
                              right: -4,
                              background:
                                index === 0
                                  ? "#ffd700"
                                  : index === 1
                                  ? "#c0c0c0"
                                  : "#cd7f32",
                              borderRadius: "50%",
                              width: 16,
                              height: 16,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                              fontWeight: 700,
                              color: "white",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                            }}
                          >
                            {index + 1}
                          </div>
                        )}
                      </div>
                    }
                    title={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text strong style={{ fontSize: 14 }}>
                          {student.username}
                        </Text>
                        <Tag
                          color={getGradeColor(student.average_grade || 0)}
                          style={{
                            marginLeft: 8,
                            fontWeight: 600,
                            borderRadius: 12,
                          }}
                        >
                          {Math.round(student.average_grade || 0)}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Progress:{" "}
                          {Math.round(student.completion_percentage || 0)}%
                        </Text>
                        <Progress
                          percent={student.completion_percentage || 0}
                          size="small"
                          strokeColor={getProgressColor(
                            student.completion_percentage || 0
                          )}
                          showInfo={false}
                          style={{ marginTop: 4 }}
                        />
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Belum ada data performance"
              style={{ margin: "20px 0" }}
            />
          )}
        </Card>
      </Col>

      {/* Recent Activities */}
      <Col xs={24}>
        <Card
          title={
            <Space>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <ClockCircleOutlined />
              </div>
              <span style={{ color: "#722ed1", fontWeight: 600 }}>
                Aktivitas Terbaru
              </span>
            </Space>
          }
          style={{
            borderRadius: 16,
            border: "1px solid #722ed120",
          }}
          headStyle={{
            background: "linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)",
            borderRadius: "16px 16px 0 0",
            borderBottom: "1px solid #722ed120",
          }}
        >
          {recentActivities.length > 0 ? (
            <List
              grid={{
                gutter: 16,
                xs: 1,
                sm: 2,
                md: 2,
                lg: 3,
                xl: 4,
                xxl: 4,
              }}
              dataSource={recentActivities}
              renderItem={(student) => (
                <List.Item>
                  <Card
                    size="small"
                    hoverable
                    style={{
                      borderRadius: 12,
                      border: "1px solid #f0f0f0",
                      height: "100%",
                      transition: "all 0.3s ease",
                    }}
                    bodyStyle={{ padding: "16px" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Avatar
                        size="small"
                        icon={<UserOutlined />}
                        style={{
                          marginRight: 8,
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                      />
                      <Text
                        strong
                        style={{
                          fontSize: 13,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                        }}
                      >
                        {student.username}
                      </Text>
                    </div>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 11,
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {dayjs(student.last_activity).fromNow()}
                    </Text>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Tag
                        size="small"
                        color={student.is_online ? "green" : "default"}
                        style={{ borderRadius: 8 }}
                      >
                        {student.is_online ? "Online" : "Offline"}
                      </Tag>
                      <Text
                        style={{ fontSize: 11, color: "#666", fontWeight: 600 }}
                      >
                        {Math.round(student.completion_percentage || 0)}%
                      </Text>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Belum ada aktivitas terbaru"
              style={{ margin: "20px 0" }}
            />
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default SessionsDetailAnalytics;
