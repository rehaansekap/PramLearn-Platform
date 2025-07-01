import React from "react";
import {
  Card,
  Table,
  Tag,
  Progress,
  Button,
  Space,
  Tooltip,
  Dropdown,
  Menu,
  Typography,
  Empty,
  Avatar,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  TrophyOutlined,
  BarChartOutlined,
  MoreOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
  SyncOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Text } = Typography;

const QuizzesTable = ({
  quizzes = [],
  loading = false,
  actionLoading = {},
  onEditQuiz,
  onDeleteQuiz,
  onViewRanking,
  onViewResults,
  onStatusChange,
  isMobile = false,
}) => {
  // Get status color
  const getStatusColor = (quiz) => {
    if (quiz.assigned_groups_count === 0) return "default";
    if (quiz.completion_rate === 100) return "success";
    if (quiz.completion_rate > 0) return "processing";
    return "warning";
  };

  // Get status text
  const getStatusText = (quiz) => {
    if (quiz.assigned_groups_count === 0) return "Belum Ditugaskan";
    if (quiz.completion_rate === 100) return "Selesai";
    if (quiz.completion_rate > 0) return "Sedang Berlangsung";
    return "Belum Dimulai";
  };

  // Get status icon
  const getStatusIcon = (quiz) => {
    if (quiz.assigned_groups_count === 0) return <QuestionCircleOutlined />;
    if (quiz.completion_rate === 100) return <CheckCircleOutlined />;
    if (quiz.completion_rate > 0) return <SyncOutlined spin />;
    return <PlayCircleOutlined />;
  };

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 85) return "#52c41a";
    if (score >= 70) return "#faad14";
    return "#ff4d4f";
  };

  // Action menu for each quiz
  const getActionMenu = (quiz) => (
    <Menu>
      <Menu.Item
        key="edit"
        icon={<EditOutlined />}
        onClick={() => onEditQuiz(quiz)}
      >
        Edit Quiz
      </Menu.Item>
      <Menu.Item
        key="ranking"
        icon={<TrophyOutlined />}
        onClick={() => onViewRanking(quiz)}
        disabled={quiz.assigned_groups_count === 0}
      >
        Lihat Ranking
      </Menu.Item>
      <Menu.Item
        key="results"
        icon={<BarChartOutlined />}
        onClick={() => onViewResults(quiz)}
        disabled={quiz.completed_submissions === 0}
      >
        Lihat Hasil
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        onClick={() => onDeleteQuiz(quiz)}
        danger
      >
        Hapus Quiz
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: "#",
      key: "index",
      render: (_, __, index) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {index + 1}
          </div>
        </div>
      ),
      width: 80,
      align: "center",
    },
    {
      title: "Quiz",
      key: "quiz",
      render: (_, record) => (
        <div style={{ maxWidth: isMobile ? 200 : 300 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "50%",
                width: isMobile ? 40 : 48,
                height: isMobile ? 40 : 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.2)",
              }}
            >
              <QuestionCircleOutlined
                style={{
                  color: "white",
                  fontSize: isMobile ? 16 : 20,
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text
                strong
                style={{
                  display: "block",
                  fontSize: isMobile ? 14 : 16,
                  color: "#262626",
                  marginBottom: 2,
                }}
                ellipsis
              >
                {record.title}
              </Text>
              <Text
                type="secondary"
                style={{
                  fontSize: isMobile ? 11 : 12,
                  display: "block",
                }}
                ellipsis
              >
                {record.content}
              </Text>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            <Tag color="blue" size="small">
              📝 {record.question_count} soal
            </Tag>
            <Tag color="green" size="small">
              👥 Kelompok
            </Tag>
            <Text
              type="secondary"
              style={{
                marginTop: "auto",
                fontSize: 12,
                marginLeft: 4,
              }}
            >
              {moment(record.created_at).format("DD/MM/YY")}
            </Text>
          </div>
        </div>
      ),
      width: isMobile ? 250 : 350,
    },
    {
      title: "Assignment",
      key: "assignment",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 8 }}>
            <Text
              strong
              style={{ fontSize: isMobile ? 14 : 16, color: "#1890ff" }}
            >
              {record.assigned_groups_count}
            </Text>
            <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
              kelompok
            </Text>
          </div>
          {record.assigned_groups_count > 0 ? (
            <Tag color="blue" size="small">
              <TeamOutlined /> Aktif
            </Tag>
          ) : (
            <Tag color="default" size="small">
              <QuestionCircleOutlined /> Belum
            </Tag>
          )}
        </div>
      ),
      width: 100,
      align: "center",
      responsive: ["sm"],
    },
    {
      title: "Progress",
      key: "progress",
      render: (_, record) => (
        <div style={{ textAlign: "center", minWidth: 80 }}>
          <Progress
            type="circle"
            percent={Math.round(record.completion_rate || 0)}
            width={isMobile ? 50 : 60}
            strokeColor={
              record.completion_rate === 100
                ? "#52c41a"
                : record.completion_rate > 0
                ? "#1890ff"
                : "#d9d9d9"
            }
            strokeWidth={8}
            format={(percent) => (
              <span style={{ fontSize: isMobile ? 10 : 12, fontWeight: 600 }}>
                {percent}%
              </span>
            )}
          />
          <div style={{ marginTop: 4 }}>
            <Text style={{ fontSize: 11, color: "#666" }}>
              {record.completed_submissions}/{record.total_submissions}
            </Text>
          </div>
        </div>
      ),
      width: 100,
      align: "center",
    },
    {
      title: "Skor",
      key: "score",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          {record.completed_submissions > 0 ? (
            <>
              <div
                style={{
                  background: `${getScoreColor(record.average_score)}10`,
                  borderRadius: 8,
                  padding: "4px 8px",
                  marginBottom: 4,
                  border: `1px solid ${getScoreColor(record.average_score)}30`,
                }}
              >
                <Text
                  strong
                  style={{
                    fontSize: isMobile ? 14 : 16,
                    color: getScoreColor(record.average_score),
                  }}
                >
                  {Math.round(record.average_score)}
                </Text>
                <Text type="secondary" style={{ fontSize: 10 }}>
                  %
                </Text>
              </div>
              <div style={{ fontSize: 9, color: "#999" }}>
                <div>Max: {Math.round(record.highest_score)}%</div>
                <div>Min: {Math.round(record.lowest_score)}%</div>
              </div>
            </>
          ) : (
            <Text type="secondary">-</Text>
          )}
        </div>
      ),
      width: 90,
      align: "center",
      responsive: ["md"],
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          <Dropdown
            menu={{
              items: [
                {
                  key: "active",
                  label: (
                    <Space>
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                      Aktif
                    </Space>
                  ),
                  onClick: () => onStatusChange(record.id, true),
                },
                {
                  key: "inactive",
                  label: (
                    <Space>
                      <StopOutlined style={{ color: "#ff4d4f" }} />
                      Non-Aktif
                    </Space>
                  ),
                  onClick: () => onStatusChange(record.id, false),
                },
              ],
            }}
            trigger={["click"]}
          >
            <Tag
              color={record.is_active ? "success" : "error"}
              style={{
                cursor: "pointer",
                minWidth: 70,
                textAlign: "center",
              }}
            >
              {record.is_active ? (
                <Space size={4}>
                  <CheckCircleOutlined />
                  Aktif
                </Space>
              ) : (
                <Space size={4}>
                  <StopOutlined />
                  Off
                </Space>
              )}
            </Tag>
          </Dropdown>

          <div style={{ marginTop: 4 }}>
            <Tag
              color={getStatusColor(record)}
              size="small"
              icon={getStatusIcon(record)}
            >
              {getStatusText(record)}
            </Tag>
          </div>
        </div>
      ),
      width: 110,
      align: "center",
      responsive: ["lg"],
    },
    {
      title: "Aksi",
      key: "actions",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          <Space size="small" direction={isMobile ? "vertical" : "horizontal"}>
            {!isMobile && (
              <>
                <Tooltip title="Edit Quiz">
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => onEditQuiz(record)}
                    loading={actionLoading[`updating_${record.id}`]}
                    style={{
                      color: "#1890ff",
                      borderRadius: 6,
                    }}
                  />
                </Tooltip>
                <Tooltip title="Lihat Ranking">
                  <Button
                    type="text"
                    icon={<TrophyOutlined />}
                    onClick={() => onViewRanking(record)}
                    disabled={record.assigned_groups_count === 0}
                    style={{
                      color: "#faad14",
                      borderRadius: 6,
                    }}
                  />
                </Tooltip>
                <Tooltip title="Lihat Hasil">
                  <Button
                    type="text"
                    icon={<BarChartOutlined />}
                    onClick={() => onViewResults(record)}
                    disabled={record.completed_submissions === 0}
                    style={{
                      color: "#52c41a",
                      borderRadius: 6,
                    }}
                  />
                </Tooltip>
              </>
            )}
            <Dropdown
              overlay={getActionMenu(record)}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                loading={actionLoading[`deleting_${record.id}`]}
                style={{
                  color: "#666",
                  borderRadius: 6,
                }}
              />
            </Dropdown>
          </Space>
        </div>
      ),
      width: isMobile ? 80 : 160,
      align: "center",
    },
  ];

  if (!quizzes || quizzes.length === 0) {
    return (
      <Card
        style={{
          borderRadius: 16,
          border: "2px dashed #d9d9d9",
          background: "#fafafa",
          textAlign: "center",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            background: "rgba(102, 126, 234, 0.1)",
            width: isMobile ? 60 : 80,
            height: isMobile ? 60 : 80,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            marginBottom: 16,
          }}
        >
          <QuestionCircleOutlined
            style={{
              fontSize: isMobile ? 24 : 32,
              color: "#667eea",
            }}
          />
        </div>
        <Empty
          description={
            <Text style={{ color: "#666", fontSize: isMobile ? 14 : 16 }}>
              Belum ada quiz yang dibuat
            </Text>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Card
      style={{
        borderRadius: 16,
        border: "none",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Header Info */}
      <div
        style={{
          padding: isMobile ? "16px 20px" : "20px 24px",
          background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <QuestionCircleOutlined style={{ color: "white", fontSize: 14 }} />
          </div>
          <div>
            <Text
              style={{
                fontSize: isMobile ? 14 : 16,
                fontWeight: 600,
                color: "#262626",
              }}
            >
              Daftar Quiz ({quizzes.length})
            </Text>
            <Text
              style={{
                fontSize: isMobile ? 11 : 12,
                color: "#666",
                display: "block",
              }}
            >
              Quiz yang telah dibuat untuk materi ini
            </Text>
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={quizzes.map((quiz) => ({
          ...quiz,
          key: quiz.id,
        }))}
        loading={loading}
        pagination={{
          pageSize: isMobile ? 5 : 8,
          showSizeChanger: !isMobile,
          showQuickJumper: !isMobile,
          showTotal: (total, range) =>
            `Menampilkan ${range[0]}-${range[1]} dari ${total} quiz`,
          style: {
            padding: "16px 24px",
            background: "#fafafa",
            borderTop: "1px solid #f0f0f0",
          },
        }}
        scroll={{ x: isMobile ? 700 : undefined }}
        size={isMobile ? "small" : "middle"}
        style={{
          background: "white",
        }}
        locale={{
          emptyText: (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <QuestionCircleOutlined
                style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
              />
              <Text type="secondary" style={{ fontSize: 16 }}>
                Belum ada quiz yang dibuat
              </Text>
            </div>
          ),
        }}
      />
    </Card>
  );
};

export default QuizzesTable;
