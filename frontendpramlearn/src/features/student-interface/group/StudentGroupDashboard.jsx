import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Alert,
  Spin,
  Tag,
  Avatar,
  Statistic,
  Tabs,
  Badge,
  Tooltip,
} from "antd";
import {
  TeamOutlined,
  TrophyOutlined,
  BarChartOutlined,
  CalendarOutlined,
  UserOutlined,
  ReloadOutlined,
  CrownOutlined,
  FireOutlined,
  RiseOutlined,
  BookOutlined,
} from "@ant-design/icons";

import useStudentGroup from "./hooks/useStudentGroup";
import GroupMembersView from "./components/GroupMembersView";
import GroupQuizResults from "../assessments/components/group-quiz-results/GroupQuizResults";
import GroupActivities from "./components/GroupActivities";
import GroupPerformanceChart from "./components/GroupPerformanceChart";

const { Title, Text } = Typography;

const StudentGroupDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { groupData, loading, error, refreshGroupData } = useStudentGroup();

  if (loading && !groupData.groupInfo) {
    return (
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: 16 }}>
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" tip="Loading group data..." />
        </div>
      </div>
    );
  }

  if (error && !groupData.groupInfo) {
    return (
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: 16 }}>
        <Alert
          message="Failed to load group data"
          description="Please try refreshing the page or contact support if the problem persists."
          type="error"
          showIcon
          action={
            <Button onClick={refreshGroupData} type="primary" size="small">
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  const { groupInfo, members, quizResults, activities, rankings, performance } =
    groupData;

  // If user is not in any group
  if (!groupInfo) {
    return (
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: 16 }}>
        <Card>
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <TeamOutlined
              style={{ fontSize: 64, color: "#d9d9d9", marginBottom: 16 }}
            />
            <Title level={3} type="secondary">
              Anda Belum Bergabung dalam Kelompok
            </Title>
            <Text type="secondary">
              Hubungi instruktur untuk bergabung dalam kelompok pembelajaran
            </Text>
          </div>
        </Card>
      </div>
    );
  }

  // Get current user data
  const currentUser = members.find((member) => member.is_current_user);
  const currentUserRole = currentUser?.role_in_group || "member";

  // Calculate quick stats
  const quickStats = {
    groupRank:
      groupInfo.rank_in_class ||
      rankings.find((r) => r.is_current_group)?.rank ||
      0,
    totalGroups: groupInfo.total_groups || rankings.length,
    averageScore:
      quizResults.length > 0
        ? (
            quizResults.reduce((sum, q) => sum + q.group_score, 0) /
            quizResults.length
          ).toFixed(1)
        : 0,
    recentActivities: activities.filter((a) => {
      const activityDate = new Date(a.timestamp);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return activityDate >= weekAgo;
    }).length,
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "#faad14";
    if (rank === 2) return "#52c41a";
    if (rank === 3) return "#ff7a45";
    return "#1890ff";
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "🏅";
  };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: 16 }}>
      {/* Header */}
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <Title level={2} style={{ color: "#11418b", marginBottom: 8 }}>
          <TeamOutlined style={{ marginRight: 8 }} />
          Kelompok Pembelajaran
        </Title>
        <Text type="secondary">
          Kolaborasi dan progress bersama anggota kelompok
        </Text>
        <div style={{ marginTop: 16 }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={refreshGroupData}
            loading={loading}
            type="default"
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Group Info Header */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" size="small">
              <div>
                <Title level={3} style={{ margin: 0, color: "#11418b" }}>
                  {groupInfo.name}
                </Title>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  {groupInfo.code}
                </Text>
              </div>
              <Tag color="blue" icon={<BookOutlined />}>
                {groupInfo.material?.subject_name} - {groupInfo.material?.title}
              </Tag>
              <Space>
                {currentUserRole === "leader" && (
                  <Tag color="gold" icon={<CrownOutlined />}>
                    Leader
                  </Tag>
                )}
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  Dibuat:{" "}
                  {new Date(groupInfo.created_at).toLocaleDateString("id-ID")}
                </Text>
              </Space>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={16}>
            <Row gutter={16}>
              <Col xs={12} sm={6}>
                <Card size="small" style={{ textAlign: "center" }}>
                  <Statistic
                    title="Anggota"
                    value={groupInfo.member_count}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small" style={{ textAlign: "center" }}>
                  <div style={{ padding: "8px 0" }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>
                      {getRankIcon(quickStats.groupRank)}
                    </div>
                    <Text
                      strong
                      style={{ color: getRankColor(quickStats.groupRank) }}
                    >
                      #{quickStats.groupRank}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      dari {quickStats.totalGroups} kelompok
                    </Text>
                  </div>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small" style={{ textAlign: "center" }}>
                  <Statistic
                    title="Rata-rata Skor"
                    value={quickStats.averageScore}
                    precision={1}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small" style={{ textAlign: "center" }}>
                  <Statistic
                    title="Aktivitas (7 hari)"
                    value={quickStats.recentActivities}
                    prefix={<FireOutlined />}
                    valueStyle={{ color: "#ff4d4f" }}
                  />
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Member Quick View */}
      <Card
        title={
          <Space>
            <UserOutlined style={{ color: "#1890ff" }} />
            <span>👥 Anggota Kelompok</span>
          </Space>
        }
        size="small"
        style={{ marginBottom: 24 }}
      >
        <Space wrap>
          {members.map((member) => (
            <Tooltip
              key={member.id}
              title={
                <div>
                  <div>
                    <strong>
                      {member.first_name} {member.last_name}
                    </strong>
                  </div>
                  <div>
                    Quiz Average: {(member.quiz_average || 0).toFixed(1)}
                  </div>
                  <div>
                    Attendance: {(member.attendance_rate || 0).toFixed(0)}%
                  </div>
                  <div>
                    Motivation: {member.motivation_profile?.level || "N/A"}
                  </div>
                </div>
              }
            >
              <Badge
                count={
                  member.role_in_group === "leader" ? (
                    <CrownOutlined style={{ color: "#faad14" }} />
                  ) : (
                    0
                  )
                }
                offset={[-5, 5]}
              >
                <Avatar
                  size={48}
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: member.is_current_user
                      ? "#1890ff"
                      : "#87d068",
                    border: member.is_current_user
                      ? "3px solid #1890ff"
                      : "2px solid #f0f0f0",
                    cursor: "pointer",
                  }}
                />
              </Badge>
            </Tooltip>
          ))}
        </Space>
      </Card>

      {/* Main Content Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        items={[
          {
            key: "overview",
            label: (
              <span>
                <BarChartOutlined />
                Overview
              </span>
            ),
            children: (
              <Row gutter={16}>
                <Col xs={24} lg={12}>
                  <GroupMembersView members={members} loading={loading} />
                </Col>
                <Col xs={24} lg={12}>
                  <GroupPerformanceChart
                    performance={performance}
                    loading={loading}
                  />
                </Col>
              </Row>
            ),
          },
          {
            key: "quiz-results",
            label: (
              <span>
                <TrophyOutlined />
                Quiz Results
                {quizResults.length > 0 && (
                  <Badge
                    count={quizResults.length}
                    size="small"
                    style={{ marginLeft: 8 }}
                  />
                )}
              </span>
            ),
            children: (
              <GroupQuizResults
                quizResults={quizResults}
                rankings={rankings}
                loading={loading}
              />
            ),
          },
          {
            key: "activities",
            label: (
              <span>
                <CalendarOutlined />
                Activities
                {quickStats.recentActivities > 0 && (
                  <Badge
                    count={quickStats.recentActivities}
                    size="small"
                    style={{ marginLeft: 8 }}
                  />
                )}
              </span>
            ),
            children: (
              <GroupActivities
                activities={activities}
                achievements={performance?.achievements || []}
                loading={loading}
              />
            ),
          },
        ]}
      />
    </div>
  );
};

export default StudentGroupDashboard;
