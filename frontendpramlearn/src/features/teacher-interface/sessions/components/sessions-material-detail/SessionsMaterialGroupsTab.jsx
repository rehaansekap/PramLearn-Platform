import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Typography,
  Space,
  Button,
  Tag,
  Modal,
  Spin,
  Empty,
  Row,
  Col,
  Statistic,
  Avatar,
  Tooltip,
  message,
} from "antd";
import {
  TeamOutlined,
  UserOutlined,
  EyeOutlined,
  ReloadOutlined,
  PlusOutlined,
  LoadingOutlined,
  FilePdfOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import SessionsGroupMembersModal from "./SessionsGroupMembersModal";
import SessionsGroupFormationSection from "./SessionsGroupFormationSection";
import useSessionGroupFormation from "../../hooks/useSessionGroupFormation";

const { Title, Text } = Typography;

const SessionsMaterialGroupsTab = ({
  materialSlug,
  groups,
  students,
  onGroupsChanged,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [membersModalVisible, setMembersModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Get export functionality from hook
  const { exportingPdf, handleExportAnalysis } = useSessionGroupFormation(
    materialSlug,
    onGroupsChanged
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleShowMembers = (group) => {
    setSelectedGroup(group);
    setMembersModalVisible(true);
  };

  const handleCloseMembersModal = () => {
    setMembersModalVisible(false);
    setSelectedGroup(null);
  };

  // Handle refresh data groups
  const handleRefreshGroups = async () => {
    setRefreshing(true);
    try {
      if (onGroupsChanged) {
        await onGroupsChanged();
      }
    } catch (error) {
      console.error("Error refreshing groups:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle groups update after formation
  const handleGroupsUpdate = async () => {
    setLoading(true);
    try {
      if (onGroupsChanged) {
        await onGroupsChanged();
      }
    } catch (error) {
      console.error("Error updating groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGroupStatistics = () => {
    const totalGroups = groups?.length || 0;
    const totalMembers =
      groups?.reduce((sum, group) => sum + (group.member_count || 0), 0) || 0;
    const averageMembersPerGroup =
      totalGroups > 0 ? (totalMembers / totalGroups).toFixed(1) : 0;
    const groupsWithQuizzes =
      groups?.filter((group) => (group.quiz_count || 0) > 0).length || 0;

    return {
      totalGroups,
      totalMembers,
      averageMembersPerGroup,
      groupsWithQuizzes,
    };
  };

  const statistics = getGroupStatistics();

  const columns = [
    {
      title: "No",
      key: "no",
      render: (_, __, index) => index + 1,
      width: 60,
      align: "center",
    },
    {
      title: "Nama Kelompok",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <div>
          <Text strong style={{ display: "block" }}>
            {name}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Kode: {record.code}
          </Text>
        </div>
      ),
      ellipsis: true,
    },
    {
      title: "Anggota",
      key: "members",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar.Group maxCount={3} size="small">
            {record.members?.slice(0, 3).map((member, index) => (
              <Tooltip key={index} title={member.username}>
                <Avatar size="small" icon={<UserOutlined />} />
              </Tooltip>
            ))}
          </Avatar.Group>
          <Tag
            color="blue"
            style={{ cursor: "pointer" }}
            onClick={() => handleShowMembers(record)}
          >
            {record.member_count || 0} Anggota
          </Tag>
        </div>
      ),
      width: 200,
      responsive: ["md"],
    },
    {
      title: "Quiz Assigned",
      key: "quiz_count",
      render: (_, record) => (
        <Tag color={record.quiz_count > 0 ? "green" : "default"}>
          {record.quiz_count || 0} Quiz
        </Tag>
      ),
      width: 120,
      align: "center",
      responsive: ["lg"],
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleShowMembers(record)}
            style={{ backgroundColor: "#1890ff", color: "#fff" }}
          >
            {!isMobile && "Detail"}
          </Button>
        </Space>
      ),
      width: isMobile ? 80 : 120,
      fixed: "right",
    },
  ];

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Spin indicator={antIcon} />
        <p style={{ marginTop: 16, color: "#666" }}>Memuat data kelompok...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Space direction="vertical" size="small">
              <Title level={4} style={{ margin: 0, color: "#11418b" }}>
                <TeamOutlined style={{ marginRight: 8 }} />
                Manajemen Kelompok
              </Title>
              <Text type="secondary">
                Kelola kelompok belajar dan pantau aktivitas mereka
              </Text>
            </Space>
          </Col>
          <Col xs={24} lg={8}>
            <div style={{ textAlign: isMobile ? "center" : "right" }}>
              <Space>
                {/* Export PDF Button - only show if groups exist */}
                {groups && groups.length > 0 && (
                  <Tooltip title="Download laporan analisis kelompok">
                    <Button
                      icon={
                        exportingPdf ? <LoadingOutlined /> : <FilePdfOutlined />
                      }
                      onClick={handleExportAnalysis}
                      loading={exportingPdf}
                      disabled={refreshing}
                      style={{
                        borderColor: "#11418b",
                        color: "#11418b",
                        borderRadius: 8,
                      }}
                    >
                      {!isMobile && (exportingPdf ? "Export..." : "Export PDF")}
                    </Button>
                  </Tooltip>
                )}

                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={handleRefreshGroups}
                  loading={refreshing}
                  disabled={exportingPdf}
                  style={{ borderRadius: 8 }}
                >
                  {refreshing ? "Refreshing..." : "Refresh Data"}
                </Button>
              </Space>
            </div>
          </Col>
        </Row>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8 }}>
            <Statistic
              title="Total Kelompok"
              value={statistics.totalGroups}
              prefix={<TeamOutlined style={{ color: "#1677ff" }} />}
              valueStyle={{ color: "#1677ff", fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8 }}>
            <Statistic
              title="Total Anggota"
              value={statistics.totalMembers}
              prefix={<UserOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a", fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8 }}>
            <Statistic
              title="Rata-rata/Kelompok"
              value={statistics.averageMembersPerGroup}
              prefix={<UserOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14", fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 8 }}>
            <Statistic
              title="Kelompok Aktif"
              value={statistics.groupsWithQuizzes}
              prefix={<TeamOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1", fontSize: 18 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Groups Table */}
      <Card
        style={{ borderRadius: 12, marginBottom: 24 }}
        bodyStyle={{ padding: "24px" }}
      >
        {groups && groups.length > 0 ? (
          <>
            {/* Additional Export Button above table for easy access */}
            <div style={{ marginBottom: 16, textAlign: "right" }}>
              <Button
                type="dashed"
                icon={exportingPdf ? <LoadingOutlined /> : <DownloadOutlined />}
                onClick={handleExportAnalysis}
                loading={exportingPdf}
                disabled={refreshing}
                style={{
                  borderColor: "#11418b",
                  color: "#11418b",
                  backgroundColor: "#f8f9ff",
                  borderRadius: 6,
                }}
              >
                📊{" "}
                {exportingPdf
                  ? "Membuat Laporan..."
                  : "Download Laporan Analisis"}
              </Button>
            </div>

            <Table
              dataSource={groups.map((group) => ({
                ...group,
                key: group.id,
              }))}
              columns={columns}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} dari ${total} kelompok`,
                style: { textAlign: "center" },
              }}
              className="session-groups-table"
              style={{ width: "100%" }}
              scroll={{ x: isMobile ? 800 : undefined }}
              size="middle"
              loading={refreshing}
            />
          </>
        ) : (
          <Empty
            description="Belum ada kelompok dibuat"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>

      {/* Group Formation Section */}
      <SessionsGroupFormationSection
        materialSlug={materialSlug}
        students={students}
        onGroupsChanged={handleGroupsUpdate}
      />

      {/* Group Members Modal */}
      <SessionsGroupMembersModal
        open={membersModalVisible}
        onClose={handleCloseMembersModal}
        group={selectedGroup}
        students={students}
      />
    </div>
  );
};

export default SessionsMaterialGroupsTab;
