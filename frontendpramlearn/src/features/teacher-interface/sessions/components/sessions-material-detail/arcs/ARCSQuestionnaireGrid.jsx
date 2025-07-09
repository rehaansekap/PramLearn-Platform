import React from "react";
import {
  Card,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Popconfirm,
  Switch,
  Tooltip,
  Empty,
  Progress,
} from "antd";
import {
  FileTextOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  BarChartOutlined,
  EyeOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const ARCSQuestionnaireGrid = ({
  questionnaires = [],
  loading = false,
  onEdit,
  onDelete,
  onSelect,
  onViewResponses,
  onViewAnalytics,
  onToggleStatus,
  isMobile = false,
}) => {
  const getTypeColor = (type) => {
    const colors = {
      pre_learning: "#1890ff",
      post_learning: "#52c41a",
      mid_learning: "#faad14",
    };
    return colors[type] || "#666";
  };

  const getTypeLabel = (type) => {
    const labels = {
      pre_learning: "Pre-Learning",
      post_learning: "Post-Learning",
      mid_learning: "Mid-Learning",
    };
    return labels[type] || type;
  };

  const getStatusTag = (questionnaire) => {
    if (!questionnaire.is_active) {
      return <Tag color="red">🚫 Non-Aktif</Tag>;
    }

    if (!questionnaire.start_date && !questionnaire.end_date) {
      return <Tag color="blue">⏰ Tanpa Batas</Tag>;
    }

    const now = dayjs();
    const startDate = questionnaire.start_date
      ? dayjs(questionnaire.start_date)
      : null;
    const endDate = questionnaire.end_date
      ? dayjs(questionnaire.end_date)
      : null;

    if (startDate && now.isBefore(startDate)) {
      return <Tag color="orange">⏳ Belum Mulai</Tag>;
    }

    if (endDate && now.isAfter(endDate)) {
      return <Tag color="red">⏰ Berakhir</Tag>;
    }

    return <Tag color="green">✅ Aktif</Tag>;
  };

  if (questionnaires.length === 0) {
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
          <FileTextOutlined
            style={{
              fontSize: isMobile ? 24 : 32,
              color: "#667eea",
            }}
          />
        </div>
        <Empty
          description={
            <Text style={{ color: "#666", fontSize: isMobile ? 14 : 16 }}>
              Belum ada kuesioner ARCS yang dibuat
            </Text>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {questionnaires.map((questionnaire) => {
        const completionRate =
          questionnaire.responses_count > 0
            ? (questionnaire.completed_responses /
                questionnaire.responses_count) *
              100
            : 0;

        return (
          <Col xs={24} sm={12} lg={8} xl={6} key={questionnaire.id}>
            <Card
              style={{
                borderRadius: 16,
                border: "1px solid #f0f0f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
              bodyStyle={{
                padding: isMobile ? "16px" : "20px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
              hoverable
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(102, 126, 234, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
              }}
            >
              {/* Header */}
              <div style={{ marginBottom: 16 }}>
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
                      background: `linear-gradient(135deg, ${getTypeColor(
                        questionnaire.questionnaire_type
                      )} 0%, ${getTypeColor(
                        questionnaire.questionnaire_type
                      )}80 100%)`,
                      borderRadius: "50%",
                      width: 40,
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FileTextOutlined
                      style={{ color: "white", fontSize: 16 }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      strong
                      style={{
                        fontSize: isMobile ? 14 : 16,
                        color: "#262626",
                        display: "block",
                        marginBottom: 2,
                      }}
                      ellipsis
                    >
                      {questionnaire.title}
                    </Text>
                    <Tag
                      color={getTypeColor(questionnaire.questionnaire_type)}
                      size="small"
                      style={{ fontSize: 10, fontWeight: 600 }}
                    >
                      {getTypeLabel(questionnaire.questionnaire_type)}
                    </Tag>
                  </div>
                </div>

                {/* Status & Active Toggle */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {getStatusTag(questionnaire)}
                  <Tooltip
                    title={questionnaire.is_active ? "Nonaktifkan" : "Aktifkan"}
                  >
                    <Switch
                      size="small"
                      checked={questionnaire.is_active}
                      onChange={(checked) =>
                        onToggleStatus(questionnaire.id, checked)
                      }
                    />
                  </Tooltip>
                </div>
              </div>

              {/* Description */}
              <div style={{ flex: 1, marginBottom: 16 }}>
                <Text
                  type="secondary"
                  style={{
                    fontSize: isMobile ? 12 : 13,
                    lineHeight: 1.5,
                    display: "block",
                    marginBottom: 12,
                  }}
                >
                  {questionnaire.description
                    ? questionnaire.description.length > 100
                      ? `${questionnaire.description.substring(0, 100)}...`
                      : questionnaire.description
                    : "Tidak ada deskripsi"}
                </Text>

                {/* Schedule Info */}
                {(questionnaire.start_date || questionnaire.end_date) && (
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "8px 12px",
                      borderRadius: 8,
                      marginBottom: 12,
                    }}
                  >
                    {questionnaire.start_date && (
                      <div
                        style={{ fontSize: 11, color: "#666", marginBottom: 2 }}
                      >
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        Mulai:{" "}
                        {dayjs(questionnaire.start_date).format(
                          "DD/MM/YY HH:mm"
                        )}
                      </div>
                    )}
                    {questionnaire.end_date && (
                      <div style={{ fontSize: 11, color: "#666" }}>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        Berakhir:{" "}
                        {dayjs(questionnaire.end_date).format("DD/MM/YY HH:mm")}
                      </div>
                    )}
                    {questionnaire.duration_minutes && (
                      <div
                        style={{ fontSize: 11, color: "#666", marginTop: 2 }}
                      >
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        Durasi: {questionnaire.duration_minutes} menit
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Statistics */}
              <div style={{ marginBottom: 16 }}>
                <Row gutter={8}>
                  <Col span={8}>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: isMobile ? 16 : 18,
                          fontWeight: 700,
                          color: "#1890ff",
                        }}
                      >
                        {questionnaire.questions_count || 0}
                      </div>
                      <div style={{ fontSize: 10, color: "#666" }}>Soal</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: isMobile ? 16 : 18,
                          fontWeight: 700,
                          color: "#52c41a",
                        }}
                      >
                        {questionnaire.responses_count || 0}
                      </div>
                      <div style={{ fontSize: 10, color: "#666" }}>Respons</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: isMobile ? 16 : 18,
                          fontWeight: 700,
                          color: "#faad14",
                        }}
                      >
                        {Math.round(completionRate)}%
                      </div>
                      <div style={{ fontSize: 10, color: "#666" }}>Selesai</div>
                    </div>
                  </Col>
                </Row>

                {questionnaire.responses_count > 0 && (
                  <Progress
                    percent={completionRate}
                    size="small"
                    strokeColor="#52c41a"
                    showInfo={false}
                    style={{ marginTop: 8 }}
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div>
                <Space size="small" wrap style={{ width: "100%" }}>
                  <Button
                    size="small"
                    icon={<QuestionCircleOutlined />}
                    onClick={() => onSelect(questionnaire)}
                    style={{
                      borderColor: "#1890ff",
                      color: "#1890ff",
                      borderRadius: 6,
                      fontSize: 11,
                    }}
                  >
                    Soal
                  </Button>

                  <Button
                    size="small"
                    icon={<UserOutlined />}
                    onClick={() => onViewResponses(questionnaire)}
                    disabled={questionnaire.responses_count === 0}
                    style={{
                      borderColor: "#52c41a",
                      color:
                        questionnaire.responses_count > 0 ? "#52c41a" : "#ccc",
                      borderRadius: 6,
                      fontSize: 11,
                    }}
                  >
                    Respons
                  </Button>

                  <Button
                    size="small"
                    icon={<BarChartOutlined />}
                    onClick={() => onViewAnalytics(questionnaire)}
                    disabled={questionnaire.responses_count === 0}
                    style={{
                      borderColor: "#faad14",
                      color:
                        questionnaire.responses_count > 0 ? "#faad14" : "#ccc",
                      borderRadius: 6,
                      fontSize: 11,
                    }}
                  >
                    Analitik
                  </Button>

                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => onEdit(questionnaire)}
                    style={{
                      borderColor: "#722ed1",
                      color: "#722ed1",
                      borderRadius: 6,
                      fontSize: 11,
                    }}
                  >
                    Edit
                  </Button>

                  <Popconfirm
                    title="Hapus kuesioner?"
                    description="Semua pertanyaan dan respons akan terhapus"
                    onConfirm={() => onDelete(questionnaire.id)}
                    okText="Ya"
                    cancelText="Tidak"
                  >
                    <Button
                      size="small"
                      icon={<DeleteOutlined />}
                      danger
                      style={{
                        borderRadius: 6,
                        fontSize: 11,
                      }}
                    >
                      Hapus
                    </Button>
                  </Popconfirm>
                </Space>
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default ARCSQuestionnaireGrid;
