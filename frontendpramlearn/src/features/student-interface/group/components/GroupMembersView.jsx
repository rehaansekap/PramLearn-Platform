import React from "react";
import {
  Card,
  Row,
  Col,
  Avatar,
  Tag,
  Progress,
  Tooltip,
  Space,
  Typography,
  Statistic,
  Divider,
} from "antd";
import {
  UserOutlined,
  CrownOutlined,
  TrophyOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

const GroupMembersView = ({ members, loading }) => {
  if (loading) {
    return (
      <Card loading title="👥 Anggota Kelompok">
        <div style={{ height: 200 }} />
      </Card>
    );
  }

  const getMotivationColor = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
        return "#52c41a";
      case "medium":
        return "#faad14";
      case "low":
        return "#ff4d4f";
      default:
        return "#d9d9d9";
    }
  };

  const getMotivationTag = (level) => {
    const colors = {
      high: "green",
      medium: "orange",
      low: "red",
    };
    const labels = {
      high: "Tinggi",
      medium: "Sedang",
      low: "Rendah",
    };
    return (
      <Tag color={colors[level?.toLowerCase()] || "default"}>
        {labels[level?.toLowerCase()] || "Belum Dianalisis"}
      </Tag>
    );
  };

  const getRoleIcon = (role) => {
    return role === "leader" ? (
      <CrownOutlined style={{ color: "#faad14" }} />
    ) : (
      <UserOutlined style={{ color: "#1890ff" }} />
    );
  };

  const getRoleTag = (role) => {
    return role === "leader" ? (
      <Tag color="gold" icon={<CrownOutlined />}>
        Leader
      </Tag>
    ) : (
      <Tag color="blue" icon={<UserOutlined />}>
        Member
      </Tag>
    );
  };

  // Calculate group statistics
  const groupStats = {
    totalMembers: members.length,
    averageQuizScore:
      members.reduce((sum, m) => sum + (m.quiz_average || 0), 0) /
      members.length,
    averageAttendance:
      members.reduce((sum, m) => sum + (m.attendance_rate || 0), 0) /
      members.length,
    motivationDistribution: members.reduce((acc, m) => {
      const level = m.motivation_profile?.level?.toLowerCase() || "unknown";
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {}),
  };

  return (
    <Card
      title={
        <Space>
          <UserOutlined style={{ color: "#1890ff" }} />
          <span>👥 Anggota Kelompok</span>
        </Space>
      }
      extra={<Tag color="blue">{members.length} Anggota</Tag>}
    >
      {/* Group Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ textAlign: "center" }}>
            <Statistic
              title="Rata-rata Quiz"
              value={groupStats.averageQuizScore}
              precision={1}
              suffix="/100"
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ textAlign: "center" }}>
            <Statistic
              title="Rata-rata Kehadiran"
              value={groupStats.averageAttendance}
              precision={1}
              suffix="%"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ textAlign: "center", padding: "8px" }}>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Distribusi Motivasi
            </Text>
            <Space size="small" wrap>
              <Tag color="green">
                Tinggi: {groupStats.motivationDistribution.high || 0}
              </Tag>
              <Tag color="orange">
                Sedang: {groupStats.motivationDistribution.medium || 0}
              </Tag>
              <Tag color="red">
                Rendah: {groupStats.motivationDistribution.low || 0}
              </Tag>
            </Space>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Members List */}
      <Row gutter={[16, 16]}>
        {members.map((member) => (
          <Col xs={24} sm={12} lg={6} key={member.id}>
            <Card
              size="small"
              style={{
                borderRadius: 12,
                border: member.is_current_user
                  ? "2px solid #1890ff"
                  : "1px solid #f0f0f0",
                backgroundColor: member.is_current_user ? "#f6ffed" : "#fff",
              }}
              hoverable
            >
              {/* Member Header */}
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <Avatar
                  size={64}
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: getMotivationColor(
                      member.motivation_profile?.level
                    ),
                    marginBottom: 8,
                  }}
                />
                <div>
                  <Text strong style={{ fontSize: 16, display: "block" }}>
                    {member.first_name} {member.last_name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    @{member.username}
                  </Text>
                  {member.is_current_user && (
                    <Tag color="blue" size="small" style={{ marginTop: 4 }}>
                      Anda
                    </Tag>
                  )}
                </div>
              </div>

              {/* Role */}
              <div style={{ marginBottom: 12, textAlign: "center" }}>
                {getRoleTag(member.role_in_group)}
              </div>

              {/* Performance Stats */}
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="small"
              >
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Rata-rata Quiz:
                  </Text>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Progress
                      percent={member.quiz_average || 0}
                      size="small"
                      strokeColor="#1890ff"
                      showInfo={false}
                    />
                    <Text strong style={{ fontSize: 12 }}>
                      {(member.quiz_average || 0).toFixed(1)}
                    </Text>
                  </div>
                </div>

                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Kehadiran:
                  </Text>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Progress
                      percent={member.attendance_rate || 0}
                      size="small"
                      strokeColor="#52c41a"
                      showInfo={false}
                    />
                    <Text strong style={{ fontSize: 12 }}>
                      {(member.attendance_rate || 0).toFixed(0)}%
                    </Text>
                  </div>
                </div>

                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Motivasi:
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    {getMotivationTag(member.motivation_profile?.level)}
                  </div>
                </div>

                {/* ARCS Profile Detail */}
                {member.motivation_profile && (
                  <div style={{ marginTop: 8 }}>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 11,
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      Profil ARCS:
                    </Text>
                    <Row gutter={4}>
                      <Col span={6}>
                        <Tooltip title="Attention">
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 10, color: "#666" }}>A</div>
                            <div style={{ fontSize: 11, fontWeight: 500 }}>
                              {member.motivation_profile.attention || 0}
                            </div>
                          </div>
                        </Tooltip>
                      </Col>
                      <Col span={6}>
                        <Tooltip title="Relevance">
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 10, color: "#666" }}>R</div>
                            <div style={{ fontSize: 11, fontWeight: 500 }}>
                              {member.motivation_profile.relevance || 0}
                            </div>
                          </div>
                        </Tooltip>
                      </Col>
                      <Col span={6}>
                        <Tooltip title="Confidence">
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 10, color: "#666" }}>C</div>
                            <div style={{ fontSize: 11, fontWeight: 500 }}>
                              {member.motivation_profile.confidence || 0}
                            </div>
                          </div>
                        </Tooltip>
                      </Col>
                      <Col span={6}>
                        <Tooltip title="Satisfaction">
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 10, color: "#666" }}>S</div>
                            <div style={{ fontSize: 11, fontWeight: 500 }}>
                              {member.motivation_profile.satisfaction || 0}
                            </div>
                          </div>
                        </Tooltip>
                      </Col>
                    </Row>
                  </div>
                )}

                {/* Join Date */}
                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: "1px solid #f0f0f0",
                  }}
                >
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    Bergabung:{" "}
                    {new Date(member.join_date).toLocaleDateString("id-ID")}
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default GroupMembersView;
