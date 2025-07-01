import React, { useState } from "react";
import {
  Card,
  Tag,
  Typography,
  Space,
  Button,
  Dropdown,
  Progress,
  Tooltip,
  Avatar,
  Popover,
  Divider,
  Row,
  Col,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  BarChartOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  StopOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import Swal from "sweetalert2";

const { Text, Title } = Typography;

const ARCSQuestionnaireCard = ({
  questionnaire,
  onEdit,
  onDelete,
  onSelect,
  onViewResponses,
  onViewAnalytics,
  onToggleStatus,
  isMobile = false,
  loading = false,
}) => {
  const [actionLoading, setActionLoading] = useState({});

  const getTypeColor = (type) => {
    return type === "pre" ? "#1890ff" : "#52c41a";
  };

  const getTypeIcon = (type) => {
    return type === "pre" ? "🔍" : "✅";
  };

  const getStatusColor = (isActive) => {
    return isActive ? "#52c41a" : "#ff4d4f";
  };

  const handleAction = async (action, actionKey) => {
    setActionLoading((prev) => ({ ...prev, [actionKey]: true }));
    try {
      await action();
    } catch (error) {
      console.error(`Error in ${actionKey}:`, error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleDelete = () => {
    Swal.fire({
      title: "Hapus Kuesioner?",
      text: "Tindakan ini akan menghapus semua pertanyaan dan respons yang terkait.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff4d4f",
      cancelButtonColor: "#d9d9d9",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        handleAction(() => onDelete(questionnaire.id), "delete");
      }
    });
  };

  const handleToggleStatus = () => {
    const newStatus = !questionnaire.is_active;
    const actionText = newStatus ? "mengaktifkan" : "menonaktifkan";

    Swal.fire({
      title: `${newStatus ? "Aktifkan" : "Nonaktifkan"} Kuesioner?`,
      text: `Apakah Anda yakin ingin ${actionText} kuesioner ini?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: newStatus ? "#52c41a" : "#faad14",
      cancelButtonColor: "#d9d9d9",
      confirmButtonText: `Ya, ${newStatus ? "Aktifkan" : "Nonaktifkan"}!`,
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        handleAction(
          () => onToggleStatus(questionnaire.id, newStatus),
          "toggle"
        );
      }
    });
  };

  const menuItems = [
    {
      key: "edit",
      label: "Edit Kuesioner",
      icon: <EditOutlined />,
      onClick: () => handleAction(() => onEdit(questionnaire), "edit"),
    },
    {
      key: "questions",
      label: "Kelola Pertanyaan",
      icon: <QuestionCircleOutlined />,
      onClick: () => handleAction(() => onSelect(questionnaire), "select"),
    },
    {
      key: "responses",
      label: "Lihat Respons",
      icon: <UserOutlined />,
      onClick: () =>
        handleAction(() => onViewResponses(questionnaire), "responses"),
      disabled: (questionnaire.responses_count || 0) === 0,
    },
    {
      key: "analytics",
      label: "Lihat Analitik",
      icon: <BarChartOutlined />,
      onClick: () =>
        handleAction(() => onViewAnalytics(questionnaire), "analytics"),
      disabled: (questionnaire.responses_count || 0) === 0,
    },
    {
      type: "divider",
    },
    {
      key: "toggle",
      label: questionnaire.is_active ? "Nonaktifkan" : "Aktifkan",
      icon: questionnaire.is_active ? <StopOutlined /> : <PlayCircleOutlined />,
      onClick: handleToggleStatus,
    },
    {
      key: "delete",
      label: "Hapus Kuesioner",
      icon: <DeleteOutlined />,
      onClick: handleDelete,
      danger: true,
    },
  ];

  const isExpired =
    questionnaire.end_date && dayjs().isAfter(dayjs(questionnaire.end_date));
  const isUpcoming =
    questionnaire.start_date &&
    dayjs().isBefore(dayjs(questionnaire.start_date));

  return (
    <Card
      style={{
        borderRadius: 16,
        border: "none",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        position: "relative",
        height: "100%",
        background: "white",
      }}
      bodyStyle={{ padding: isMobile ? "16px" : "20px" }}
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
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
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
              }}
            >
              {getTypeIcon(questionnaire.questionnaire_type)}
            </div>
            <Tag
              color={getTypeColor(questionnaire.questionnaire_type)}
              style={{
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 10,
                padding: "2px 8px",
              }}
            >
              {questionnaire.questionnaire_type === "pre"
                ? "Pre-Assessment"
                : "Post-Assessment"}
            </Tag>
          </div>

          <Title
            level={5}
            style={{
              margin: 0,
              fontSize: isMobile ? 14 : 16,
              fontWeight: 600,
              color: "#262626",
              lineHeight: 1.3,
              marginBottom: 4,
            }}
            ellipsis={{ rows: 2, tooltip: questionnaire.title }}
          >
            {questionnaire.title}
          </Title>
        </div>

        <Dropdown
          menu={{
            items: menuItems,
            onClick: ({ key, domEvent }) => {
              domEvent.stopPropagation();
            },
          }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            size="small"
            loading={Object.values(actionLoading).some(Boolean)}
            style={{
              borderRadius: 6,
              flexShrink: 0,
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      </div>

      {/* Description */}
      {questionnaire.description && (
        <Text
          type="secondary"
          style={{
            fontSize: 12,
            display: "block",
            marginBottom: 16,
            lineHeight: 1.4,
          }}
          ellipsis={{ rows: 2, tooltip: questionnaire.description }}
        >
          {questionnaire.description}
        </Text>
      )}

      {/* Statistics */}
      <div
        style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
          borderRadius: 12,
          padding: "12px 16px",
          marginBottom: 16,
        }}
      >
        <Row gutter={[8, 8]} style={{ fontSize: 12 }}>
          <Col span={12}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#1890ff", fontWeight: 600, fontSize: 16 }}>
                {questionnaire.questions_count || 0}
              </div>
              <div style={{ color: "#666", fontSize: 10 }}>Pertanyaan</div>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#52c41a", fontWeight: 600, fontSize: 16 }}>
                {questionnaire.responses_count || 0}
              </div>
              <div style={{ color: "#666", fontSize: 10 }}>Respons</div>
            </div>
          </Col>
        </Row>

        {questionnaire.responses_count > 0 && (
          <div style={{ marginTop: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Text style={{ fontSize: 10, color: "#666" }}>Progress:</Text>
              <Text style={{ fontSize: 10, color: "#666" }}>
                {Math.round(questionnaire.completion_rate || 0)}%
              </Text>
            </div>
            <Progress
              percent={questionnaire.completion_rate || 0}
              size="small"
              showInfo={false}
              strokeColor="linear-gradient(135deg, #52c41a 0%, #73d13d 100%)"
            />
          </div>
        )}
      </div>

      {/* Time Information */}
      {(questionnaire.start_date ||
        questionnaire.end_date ||
        questionnaire.duration_minutes) && (
        <div
          style={{
            background: "#fafafa",
            borderRadius: 8,
            padding: "8px 12px",
            marginBottom: 16,
            fontSize: 11,
          }}
        >
          {questionnaire.start_date && questionnaire.end_date && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginBottom: 4,
              }}
            >
              <CalendarOutlined style={{ color: "#666" }} />
              <Text style={{ fontSize: 10, color: "#666" }}>
                {dayjs(questionnaire.start_date).format("DD/MM HH:mm")} -{" "}
                {dayjs(questionnaire.end_date).format("DD/MM HH:mm")}
              </Text>
            </div>
          )}

          {questionnaire.duration_minutes && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <ClockCircleOutlined style={{ color: "#666" }} />
              <Text style={{ fontSize: 10, color: "#666" }}>
                Durasi: {questionnaire.duration_minutes} menit
              </Text>
            </div>
          )}

          {isExpired && (
            <Tag color="red" size="small" style={{ marginTop: 4, fontSize: 9 }}>
              ⏰ Sudah Berakhir
            </Tag>
          )}
          {isUpcoming && (
            <Tag
              color="orange"
              size="small"
              style={{ marginTop: 4, fontSize: 9 }}
            >
              ⏳ Akan Dimulai
            </Tag>
          )}
        </div>
      )}

      {/* Status Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 12,
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: getStatusColor(questionnaire.is_active),
            }}
          />
          <Text style={{ fontSize: 11, color: "#666" }}>
            {questionnaire.is_active ? "🟢 Aktif" : "🔴 Non-Aktif"}
          </Text>
        </div>

        <Text type="secondary" style={{ fontSize: 10 }}>
          {dayjs(questionnaire.created_at).format("DD/MM/YY")}
        </Text>
      </div>

      {/* Quick Actions on Hover */}
      <div
        className="quick-actions"
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          display: "flex",
          gap: 4,
          opacity: 0,
          transition: "opacity 0.3s",
        }}
      >
        <Tooltip title="Kelola Pertanyaan">
          <Button
            type="primary"
            size="small"
            icon={<QuestionCircleOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(questionnaire);
            }}
            style={{ borderRadius: 6 }}
          />
        </Tooltip>

        {questionnaire.responses_count > 0 && (
          <Tooltip title="Lihat Respons">
            <Button
              type="default"
              size="small"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onViewResponses(questionnaire);
              }}
              style={{ borderRadius: 6 }}
            />
          </Tooltip>
        )}
      </div>

      <style>
        {`
          .ant-card:hover .quick-actions {
            opacity: 1 !important;
          }
        `}
      </style>
    </Card>
  );
};

export default ARCSQuestionnaireCard;
