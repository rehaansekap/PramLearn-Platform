import React from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Statistic,
  Tooltip,
} from "antd";
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  TeamOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  TrophyOutlined,
  BarChartOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const SessionsDetailHeader = ({
  sessionDetail,
  onBack,
  onRefresh,
  refreshing,
  isMobile,
}) => {
  if (!sessionDetail) return null;

  const { subject, statistics } = sessionDetail;

  const getProgressColor = (progress) => {
    if (progress >= 80) return "#52c41a";
    if (progress >= 60) return "#faad14";
    return "#ff4d4f";
  };

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Navigation & Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          type="text"
          size={isMobile ? "middle" : "large"}
          style={{
            fontWeight: 600,
            color: "#667eea",
            fontSize: isMobile ? 14 : 16,
            height: isMobile ? 36 : 40,
            borderRadius: 8,
          }}
        >
          Kembali ke Sessions
        </Button>

        <Tooltip title="Refresh Data">
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={refreshing}
            size={isMobile ? "middle" : "large"}
            style={{
              background: "rgba(102, 126, 234, 0.1)",
              border: "1px solid rgba(102, 126, 234, 0.3)",
              color: "#667eea",
              borderRadius: 8,
              height: isMobile ? 36 : 40,
              width: isMobile ? 36 : 40,
              minWidth: isMobile ? 36 : 40,
            }}
          />
        </Tooltip>
      </div>

      {/* Header Card - Same gradient as sessions list */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: isMobile ? 12 : 16,
          padding: isMobile ? "20px 16px" : "32px",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decoration - Same as sessions list */}
        <div
          style={{
            position: "absolute",
            top: isMobile ? -30 : -50,
            right: isMobile ? -30 : -50,
            width: isMobile ? 120 : 200,
            height: isMobile ? 120 : 200,
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            zIndex: 1,
          }}
        />

        <div style={{ position: "relative", zIndex: 2 }}>
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} lg={16}>
              <div>
                <Space
                  align="center"
                  style={{
                    marginBottom: isMobile ? 8 : 12,
                  }}
                  size="small"
                >
                  <CalendarOutlined style={{ fontSize: isMobile ? 20 : 24 }} />
                  <Tag
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      color: "white",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      fontSize: 12,
                      fontWeight: 500,
                      backdropFilter: "blur(10px)",
                      borderRadius: isMobile ? 12 : 16,
                      padding: isMobile ? "2px 8px" : "4px 12px",
                    }}
                  >
                    {subject?.class_name || "Kelas"}
                  </Tag>
                </Space>
                <Title
                  level={isMobile ? 3 : 2}
                  style={{
                    color: "white",
                    marginBottom: 8,
                    fontWeight: 700,
                    fontSize: isMobile ? "18px" : "28px",
                  }}
                >
                  {subject?.name || "Detail Session"}
                </Title>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: isMobile ? 14 : 16,
                    display: "block",
                  }}
                >
                  Kelola materi pembelajaran dan monitor progress siswa
                </Text>
              </div>
            </Col>

            <Col xs={24} lg={8}>
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.2)",
                        padding: isMobile ? "8px 12px" : "12px 16px",
                        borderRadius: isMobile ? 12 : 16,
                        backdropFilter: "blur(10px)",
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          fontSize: isMobile ? 20 : 24,
                          fontWeight: 700,
                          color: "white",
                          lineHeight: 1,
                        }}
                      >
                        {statistics?.total_sessions || 0}
                      </div>
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.8)",
                          fontSize: isMobile ? 10 : 12,
                          textTransform: "uppercase",
                          letterSpacing: 1,
                          fontWeight: 600,
                        }}
                      >
                        Total Sessions
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.2)",
                        padding: isMobile ? "8px 12px" : "12px 16px",
                        borderRadius: isMobile ? 12 : 16,
                        backdropFilter: "blur(10px)",
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          fontSize: isMobile ? 20 : 24,
                          fontWeight: 700,
                          color: "white",
                          lineHeight: 1,
                        }}
                      >
                        {statistics?.students_count || 0}
                      </div>
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.8)",
                          fontSize: isMobile ? 10 : 12,
                          textTransform: "uppercase",
                          letterSpacing: 1,
                          fontWeight: 600,
                        }}
                      >
                        Siswa
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </div>

      {/* Statistics Cards - Consistent with sessions list stats */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={12} sm={6} lg={6}>
          <Card
            style={{
              borderRadius: 16,
              border: "1px solid #52c41a20",
              background: "#f6ffed",
              height: "100%",
            }}
            bodyStyle={{
              padding: isMobile ? "16px" : "20px",
              textAlign: "center",
            }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size="small">
              <div
                style={{
                  background: "white",
                  borderRadius: "50%",
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 8px",
                  fontSize: 20,
                  boxShadow: "0 4px 12px #52c41a20",
                }}
              >
                <BarChartOutlined style={{ color: "#52c41a" }} />
              </div>
              <Statistic
                value={`${Math.round(statistics?.overall_progress || 0)}%`}
                valueStyle={{
                  color: "#52c41a",
                  fontSize: isMobile ? 20 : 24,
                  fontWeight: 700,
                }}
              />
              <Text
                style={{
                  color: "#666",
                  fontSize: isMobile ? 12 : 14,
                  fontWeight: 500,
                }}
              >
                Progress Rata-rata
              </Text>
            </Space>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={6}>
          <Card
            style={{
              borderRadius: 16,
              border: "1px solid #1890ff20",
              background: "#f0f9ff",
              height: "100%",
            }}
            bodyStyle={{
              padding: isMobile ? "16px" : "20px",
              textAlign: "center",
            }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size="small">
              <div
                style={{
                  background: "white",
                  borderRadius: "50%",
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 8px",
                  fontSize: 20,
                  boxShadow: "0 4px 12px #1890ff20",
                }}
              >
                <TeamOutlined style={{ color: "#1890ff" }} />
              </div>
              <Statistic
                value={`${Math.round(statistics?.overall_attendance || 0)}%`}
                valueStyle={{
                  color: "#1890ff",
                  fontSize: isMobile ? 20 : 24,
                  fontWeight: 700,
                }}
              />
              <Text
                style={{
                  color: "#666",
                  fontSize: isMobile ? 12 : 14,
                  fontWeight: 500,
                }}
              >
                Kehadiran
              </Text>
            </Space>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={6}>
          <Card
            style={{
              borderRadius: 16,
              border: "1px solid #faad1420",
              background: "#fffbe6",
              height: "100%",
            }}
            bodyStyle={{
              padding: isMobile ? "16px" : "20px",
              textAlign: "center",
            }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size="small">
              <div
                style={{
                  background: "white",
                  borderRadius: "50%",
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 8px",
                  fontSize: 20,
                  boxShadow: "0 4px 12px #faad1420",
                }}
              >
                <QuestionCircleOutlined style={{ color: "#faad14" }} />
              </div>
              <Statistic
                value={statistics?.total_quizzes || 0}
                valueStyle={{
                  color: "#faad14",
                  fontSize: isMobile ? 20 : 24,
                  fontWeight: 700,
                }}
              />
              <Text
                style={{
                  color: "#666",
                  fontSize: isMobile ? 12 : 14,
                  fontWeight: 500,
                }}
              >
                Total Quiz
              </Text>
            </Space>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={6}>
          <Card
            style={{
              borderRadius: 16,
              border: "1px solid #722ed120",
              background: "#f9f0ff",
              height: "100%",
            }}
            bodyStyle={{
              padding: isMobile ? "16px" : "20px",
              textAlign: "center",
            }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size="small">
              <div
                style={{
                  background: "white",
                  borderRadius: "50%",
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 8px",
                  fontSize: 20,
                  boxShadow: "0 4px 12px #722ed120",
                }}
              >
                <FileTextOutlined style={{ color: "#722ed1" }} />
              </div>
              <Statistic
                value={statistics?.total_assignments || 0}
                valueStyle={{
                  color: "#722ed1",
                  fontSize: isMobile ? 20 : 24,
                  fontWeight: 700,
                }}
              />
              <Text
                style={{
                  color: "#666",
                  fontSize: isMobile ? 12 : 14,
                  fontWeight: 500,
                }}
              >
                Assignment
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SessionsDetailHeader;
