import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Tag,
  Progress,
  Tooltip,
  Space,
  Empty,
  Avatar,
  Dropdown,
  Menu,
} from "antd";
import {
  EyeOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  PlayCircleOutlined,
  BookOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TrophyOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

const SessionsDetailMaterialsGrid = ({
  materials = [],
  onViewMaterial,
  onEditMaterial,
  onDeleteMaterial,
  onAddMaterial,
  actionLoading = {},
  isMobile,
}) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "#52c41a";
    if (percentage >= 60) return "#faad14";
    return "#ff4d4f";
  };

  const getAttendanceColor = (rate) => {
    if (rate >= 80) return "#52c41a";
    if (rate >= 60) return "#faad14";
    return "#ff4d4f";
  };

  const getGradeColor = (grade) => {
    if (grade >= 85) return "#52c41a";
    if (grade >= 70) return "#faad14";
    return "#ff4d4f";
  };

  const getActionMenu = (material) => (
    <Menu
      items={[
        {
          key: "view",
          icon: <PlayCircleOutlined />,
          label: "Kelola Materi",
          onClick: () => onViewMaterial(material),
        },
        {
          key: "edit",
          icon: <EditOutlined />,
          label: "Edit Materi",
          onClick: () => onEditMaterial(material),
        },
        {
          type: "divider",
        },
        {
          key: "delete",
          icon: <DeleteOutlined />,
          label: "Hapus Materi",
          danger: true,
          onClick: () => onDeleteMaterial(material),
        },
      ]}
    />
  );

  if (!materials || materials.length === 0) {
    return (
      <div>
        {/* Add Material Button */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={onAddMaterial}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: 12,
              height: 48,
              fontSize: 16,
              fontWeight: 600,
              padding: "0 32px",
            }}
          >
            Tambah Materi Baru
          </Button>
        </div>

        <Card
          style={{
            borderRadius: 16,
            textAlign: "center",
            border: "1px dashed #d9d9d9",
            background: "linear-gradient(135deg, #f8faff 0%, #f0f9ff 100%)",
            padding: "60px 40px",
          }}
          bodyStyle={{ padding: "60px 40px" }}
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
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "50%",
                  color: "white",
                  fontSize: 48,
                }}
              >
                <BookOutlined />
              </div>
            }
            description={
              <div>
                <Title level={3} style={{ color: "#667eea", marginBottom: 12 }}>
                  Belum Ada Materi
                </Title>
                <Text style={{ color: "#666", fontSize: 16, lineHeight: 1.6 }}>
                  Belum ada materi pembelajaran yang tersedia untuk session ini
                </Text>
                <br />
                <Text style={{ color: "#999", fontSize: 14 }}>
                  Klik tombol "Tambah Materi Baru" untuk memulai
                </Text>
              </div>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Add Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0, color: "#667eea" }}>
            Materi Pembelajaran ({materials.length})
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Kelola dan monitor progress materi pembelajaran
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size={isMobile ? "middle" : "large"}
          onClick={onAddMaterial}
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            borderRadius: 12,
            fontWeight: 600,
          }}
        >
          {isMobile ? "Tambah" : "Tambah Materi"}
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {materials.map((material) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={material.id}>
            <Card
              hoverable
              className="session-card-hover"
              style={{
                borderRadius: 16,
                border: "1px solid #f0f0f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                height: "100%",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                transform:
                  hoveredCard === material.id
                    ? "translateY(-4px)"
                    : "translateY(0)",
              }}
              bodyStyle={{
                padding: isMobile ? 16 : 20,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
              onMouseEnter={() => setHoveredCard(material.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Header with Icon and Actions */}
              <div style={{ marginBottom: 16 }}>
                <Space
                  style={{ width: "100%", justifyContent: "space-between" }}
                  align="start"
                >
                  <div style={{ flex: 1 }}>
                    <Title
                      level={4}
                      style={{
                        margin: 0,
                        marginBottom: 4,
                        color: "#1890ff",
                        fontSize: isMobile ? 16 : 18,
                        fontWeight: 700,
                        lineHeight: 1.3,
                      }}
                      ellipsis={{ rows: 2 }}
                    >
                      {material.title}
                    </Title>
                    {material.last_activity && (
                      <Space size="small">
                        <ClockCircleOutlined
                          style={{ color: "#666", fontSize: 12 }}
                        />
                        <Text
                          style={{
                            color: "#666",
                            fontSize: 12,
                            fontWeight: 500,
                          }}
                        >
                          {dayjs(material.last_activity).format(
                            "DD MMM, HH:mm"
                          )}
                        </Text>
                      </Space>
                    )}
                  </div>

                  <Space>
                    <Avatar
                      style={{
                        background: "linear-gradient(135deg, #1890ff, #722ed1)",
                        fontSize: 16,
                        border: "none",
                      }}
                      icon={<BookOutlined />}
                    />
                    <Dropdown
                      overlay={getActionMenu(material)}
                      trigger={["click"]}
                      placement="bottomRight"
                    >
                      <Button
                        type="text"
                        icon={<MoreOutlined />}
                        style={{
                          border: "none",
                          padding: "4px 8px",
                          borderRadius: 8,
                        }}
                      />
                    </Dropdown>
                  </Space>
                </Space>
              </div>

              {/* Statistics Grid */}
              <div style={{ marginBottom: 16, flex: 1 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  {/* Students Count */}
                  <div
                    style={{
                      background: "#f8faff",
                      borderRadius: 8,
                      padding: 12,
                      textAlign: "center",
                      border: "1px solid #e6f7ff",
                    }}
                  >
                    <TeamOutlined
                      style={{
                        color: "#1890ff",
                        fontSize: 16,
                        marginBottom: 4,
                      }}
                    />
                    <div>
                      <Text
                        style={{
                          display: "block",
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#1890ff",
                        }}
                      >
                        {material.students_count || 0}
                      </Text>
                      <Text style={{ fontSize: 11, color: "#666" }}>Siswa</Text>
                    </div>
                  </div>

                  {/* Quizzes Count */}
                  <div
                    style={{
                      background: "#f9f0ff",
                      borderRadius: 8,
                      padding: 12,
                      textAlign: "center",
                      border: "1px solid #d3adf7",
                    }}
                  >
                    <QuestionCircleOutlined
                      style={{
                        color: "#722ed1",
                        fontSize: 16,
                        marginBottom: 4,
                      }}
                    />
                    <div>
                      <Text
                        style={{
                          display: "block",
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#722ed1",
                        }}
                      >
                        {material.quizzes_count || 0}
                      </Text>
                      <Text style={{ fontSize: 11, color: "#666" }}>Quiz</Text>
                    </div>
                  </div>

                  {/* Assignments Count */}
                  <div
                    style={{
                      background: "#fffbe6",
                      borderRadius: 8,
                      padding: 12,
                      textAlign: "center",
                      border: "1px solid #ffe58f",
                    }}
                  >
                    <FileTextOutlined
                      style={{
                        color: "#faad14",
                        fontSize: 16,
                        marginBottom: 4,
                      }}
                    />
                    <div>
                      <Text
                        style={{
                          display: "block",
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#faad14",
                        }}
                      >
                        {material.assignments_count || 0}
                      </Text>
                      <Text style={{ fontSize: 11, color: "#666" }}>Tugas</Text>
                    </div>
                  </div>

                  {/* Average Grade */}
                  <div
                    style={{
                      background: "#f6ffed",
                      borderRadius: 8,
                      padding: 12,
                      textAlign: "center",
                      border: "1px solid #b7eb8f",
                    }}
                  >
                    <TrophyOutlined
                      style={{
                        color: getGradeColor(material.average_grade || 0),
                        fontSize: 16,
                        marginBottom: 4,
                      }}
                    />
                    <div>
                      <Text
                        style={{
                          display: "block",
                          fontSize: 16,
                          fontWeight: 700,
                          color: getGradeColor(material.average_grade || 0),
                        }}
                      >
                        {Math.round(material.average_grade || 0)}
                      </Text>
                      <Text style={{ fontSize: 11, color: "#666" }}>Nilai</Text>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bars */}
              <div style={{ marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: "100%" }} size={8}>
                  {/* Overall Progress */}
                  <div>
                    <Space
                      style={{ width: "100%", justifyContent: "space-between" }}
                      size="small"
                    >
                      <Text
                        style={{ fontSize: 12, color: "#666", fontWeight: 500 }}
                      >
                        Progress Pembelajaran
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: getProgressColor(
                            material.average_progress || 0
                          ),
                        }}
                      >
                        {Math.round(material.average_progress || 0)}%
                      </Text>
                    </Space>
                    <Progress
                      percent={material.average_progress || 0}
                      size="small"
                      strokeColor={getProgressColor(
                        material.average_progress || 0
                      )}
                      showInfo={false}
                      style={{ marginTop: 4 }}
                    />
                  </div>

                  {/* Attendance */}
                  <div>
                    <Space
                      style={{ width: "100%", justifyContent: "space-between" }}
                      size="small"
                    >
                      <Text
                        style={{ fontSize: 12, color: "#666", fontWeight: 500 }}
                      >
                        Tingkat Kehadiran
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: getAttendanceColor(
                            material.attendance_rate || 0
                          ),
                        }}
                      >
                        {Math.round(material.attendance_rate || 0)}%
                      </Text>
                    </Space>
                    <Progress
                      percent={material.attendance_rate || 0}
                      size="small"
                      strokeColor={getAttendanceColor(
                        material.attendance_rate || 0
                      )}
                      showInfo={false}
                      style={{ marginTop: 4 }}
                    />
                  </div>

                  {/* Completion Rate */}
                  <div>
                    <Space
                      style={{ width: "100%", justifyContent: "space-between" }}
                      size="small"
                    >
                      <Text
                        style={{ fontSize: 12, color: "#666", fontWeight: 500 }}
                      >
                        Tingkat Penyelesaian
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: getProgressColor(
                            material.completion_rate || 0
                          ),
                        }}
                      >
                        {Math.round(material.completion_rate || 0)}%
                      </Text>
                    </Space>
                    <Progress
                      percent={material.completion_rate || 0}
                      size="small"
                      strokeColor={getProgressColor(
                        material.completion_rate || 0
                      )}
                      showInfo={false}
                      style={{ marginTop: 4 }}
                    />
                  </div>
                </Space>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  marginTop: "auto",
                }}
              >
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={() => onViewMaterial(material)}
                  loading={actionLoading[`view_${material.id}`]}
                  style={{
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #1890ff, #722ed1)",
                    border: "none",
                    fontWeight: 600,
                  }}
                >
                  Kelola
                </Button>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => onEditMaterial(material)}
                  loading={actionLoading[`edit_${material.id}`]}
                  style={{
                    borderRadius: 8,
                    fontWeight: 600,
                  }}
                >
                  Edit
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default SessionsDetailMaterialsGrid;
