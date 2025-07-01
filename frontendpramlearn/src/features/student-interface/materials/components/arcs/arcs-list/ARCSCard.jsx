import React from "react";
import { Card, Typography, Button, Tag, Space, Progress, Divider } from "antd";
import {
  FormOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  LockOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  HeartOutlined,
  RocketOutlined,
  SmileOutlined,
  BookOutlined,
  CalendarOutlined,
  FireOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const ARCSCard = ({ questionnaire, materialSlug, status, timeRemaining }) => {
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 768;

  const handleClick = () => {
    const identifier = questionnaire.slug || `arcs-${questionnaire.id}`;
    if (status.status === "completed") {
      navigate(`/student/materials/${materialSlug}/${identifier}/results`);
    } else if (status.status === "available") {
      navigate(`/student/materials/${materialSlug}/${identifier}`);
    }
  };

  const isDisabled = status.status === "locked" || status.status === "expired";

  const getStatusIcon = () => {
    switch (status.status) {
      case "completed":
        return <CheckCircleOutlined />;
      case "available":
        return <PlayCircleOutlined />;
      case "locked":
        return <LockOutlined />;
      case "expired":
        return <ExclamationCircleOutlined />;
      default:
        return <FormOutlined />;
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case "completed":
        return "success";
      case "available":
        return "processing";
      case "locked":
        return "default";
      case "expired":
        return "error";
      default:
        return "warning";
    }
  };

  const getButtonText = () => {
    switch (status.status) {
      case "available":
        return "Mulai Kuesioner";
      case "completed":
        return "Lihat Hasil & Analisis";
      case "locked":
        return "Belum Tersedia";
      case "expired":
        return "Waktu Habis";
      default:
        return "Lihat Kuesioner";
    }
  };

  const getButtonStyle = () => {
    const disabledStyle = {
      background: "#f5f5f5",
      border: "1px solid #d9d9d9",
      color: "#999",
      boxShadow: "none",
    };

    const completedStyle = {
      background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
      border: "none",
      color: "white",
      boxShadow: "0 4px 12px rgba(82, 196, 26, 0.4)",
    };

    const activeStyle = {
      background:
        "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
      border: "none",
      color: "white",
      boxShadow: "0 4px 12px rgba(0, 21, 41, 0.2)",
    };

    if (isDisabled) return disabledStyle;
    if (status.status === "completed") return completedStyle;
    return activeStyle;
  };

  const getQuestionnairetype = (type) => {
    const types = {
      pre: { text: "Pre-Test", color: "#1890ff", icon: "🔍" },
      post: { text: "Post-Test", color: "#52c41a", icon: "🎯" },
      mid: { text: "Mid-Test", color: "#faad14", icon: "📊" },
    };
    return types[type] || { text: type, color: "#722ed1", icon: "📋" };
  };

  // Format waktu tersisa dalam format yang user-friendly
  const formatTimeRemaining = (minutes) => {
    if (!minutes || minutes <= 0) return null;

    const days = Math.floor(minutes / (24 * 60));
    const hours = Math.floor((minutes % (24 * 60)) / 60);
    const mins = minutes % 60;

    if (days > 0) {
      return {
        text: `${days} hari ${hours} jam`,
        color: days > 3 ? "#52c41a" : days > 1 ? "#faad14" : "#ff4d4f",
        urgency: days <= 1 ? "high" : days <= 3 ? "medium" : "low",
      };
    } else if (hours > 0) {
      return {
        text: `${hours} jam ${mins} menit`,
        color: hours > 6 ? "#faad14" : "#ff4d4f",
        urgency: hours <= 2 ? "high" : "medium",
      };
    } else if (mins > 0) {
      return {
        text: `${mins} menit`,
        color: "#ff4d4f",
        urgency: "critical",
      };
    }
    return null;
  };

  const timeLeft = formatTimeRemaining(questionnaire.time_remaining);
  const questionnaireType = getQuestionnairetype(
    questionnaire.questionnaire_type
  );

  return (
    <Card
      style={{
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        border: "1px solid #f0f0f0",
        height: "100%",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
      }}
      bodyStyle={{ padding: 0 }}
      hoverable={!isDisabled}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = "translateY(-6px)";
          e.currentTarget.style.boxShadow =
            "0 12px 32px rgba(17, 65, 139, 0.12)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
        }
      }}
    >
      {/* Status Badge */}
      <div
        style={{
          position: "absolute",
          top: isMobile ? 8 : 12,
          right: 12,
          zIndex: 3,
        }}
      >
        <Tag
          icon={getStatusIcon()}
          color={getStatusColor()}
          style={{
            fontWeight: 600,
            fontSize: isMobile ? 10 : 11,
            padding: isMobile ? "3px 6px" : "5px 8px",
            borderRadius: 6,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {status.label}
        </Tag>
      </div>

      {/* Urgency Indicator untuk waktu mendesak */}
      {timeLeft?.urgency === "critical" && (
        <div
          style={{
            position: "absolute",
            top: isMobile ? 8 : 12,
            left: 12,
            zIndex: 3,
            animation: "pulse 2s infinite",
          }}
        >
          <Tag
            icon={<FireOutlined />}
            color="error"
            style={{
              fontWeight: 600,
              fontSize: 10,
              padding: "3px 6px",
              borderRadius: 6,
              boxShadow: "0 2px 8px rgba(255, 77, 79, 0.3)",
            }}
          >
            URGENT!
          </Tag>
        </div>
      )}

      {/* Header Section */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
          padding: "24px 20px 20px 20px",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Decorative Elements */}
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.05)",
          }}
        />

        {/* Header Content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            marginTop: isMobile ? 30 : 0,
          }}
        >
          {/* Type Badge */}
          <div style={{ marginBottom: 12 }}>
            <Space size={8}>
              <span style={{ fontSize: 14 }}>{questionnaireType.icon}</span>
              <Tag
                color="rgba(255, 255, 255, 0.2)"
                style={{
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  background: "rgba(255, 255, 255, 0.15)",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {questionnaireType.text}
              </Tag>
            </Space>
          </div>

          {/* Title */}
          <Title
            level={5}
            style={{
              color: "white",
              margin: 0,
              marginBottom: 8,
              fontSize: 16,
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          >
            {questionnaire.title}
          </Title>

          {/* Quick Stats Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Space size={12}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <QuestionCircleOutlined style={{ fontSize: 12 }} />
                <Text
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {questionnaire.total_questions} soal
                </Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <ClockCircleOutlined style={{ fontSize: 12 }} />
                <Text
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {questionnaire.duration_minutes} menit
                </Text>
              </div>
            </Space>
            {questionnaire.estimated_time && (
              <div
                style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: "4px 8px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                <Text style={{ color: "white", fontSize: 11, fontWeight: 600 }}>
                  ~{questionnaire.estimated_time} min
                </Text>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: "20px" }}>
        {/* Description */}
        {questionnaire.description && (
          <div style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 13,
                color: "#666",
                background: "#f8f9fa",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #e9ecef",
                display: "block",
                lineHeight: 1.4,
                fontStyle: "italic",
              }}
            >
              {questionnaire.description.length > 100
                ? `${questionnaire.description.substring(0, 100)}...`
                : questionnaire.description}
            </Text>
          </div>
        )}

        {/* Countdown Timer - Hanya jika ada time_remaining */}
        {timeLeft &&
          questionnaire.is_available &&
          !questionnaire.is_completed && (
            <div
              style={{
                background:
                  timeLeft.urgency === "critical"
                    ? "linear-gradient(135deg, #fff2f0 0%, #ffebe6 100%)"
                    : timeLeft.urgency === "high"
                    ? "linear-gradient(135deg, #fff7e6 0%, #ffeedd 100%)"
                    : "linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%)",
                border: `2px solid ${
                  timeLeft.urgency === "critical"
                    ? "#ffccc7"
                    : timeLeft.urgency === "high"
                    ? "#ffd591"
                    : "#b7eb8f"
                }`,
                borderRadius: 12,
                padding: "12px 16px",
                marginBottom: 16,
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {timeLeft.urgency === "critical" && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,77,79,0.1), transparent)",
                    animation: "shimmer 2s infinite",
                  }}
                />
              )}

              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      background: timeLeft.color,
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ClockCircleOutlined
                      style={{ color: "white", fontSize: 10 }}
                    />
                  </div>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#333",
                    }}
                  >
                    {timeLeft.urgency === "critical"
                      ? "⚠️ WAKTU HAMPIR HABIS"
                      : "⏰ Waktu Tersisa"}
                  </Text>
                </div>

                <div
                  style={{
                    fontSize: timeLeft.urgency === "critical" ? 16 : 14,
                    fontWeight: 700,
                    color: timeLeft.color,
                    marginBottom: 4,
                  }}
                >
                  {timeLeft.text}
                </div>

                <Text style={{ fontSize: 11, color: "#999" }}>
                  Berakhir:{" "}
                  {dayjs(questionnaire.end_date).format("DD MMM, HH:mm")}
                </Text>
              </div>
            </div>
          )}

        {/* Schedule Information */}
        <div
          style={{
            background: "#f8f9fa",
            border: "1px solid #e9ecef",
            borderRadius: 10,
            padding: "12px",
            marginBottom: 16,
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 6,
              }}
            >
              <CalendarOutlined style={{ color: "#1890ff", fontSize: 12 }} />
              <Text strong style={{ fontSize: 12, color: "#333" }}>
                Jadwal Kuesioner
              </Text>
            </div>
            <div style={{ paddingLeft: 18 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text style={{ fontSize: 11, color: "#666" }}>Mulai:</Text>
                <Text style={{ fontSize: 11, fontWeight: 500 }}>
                  {dayjs(questionnaire.start_date).format("DD MMM YYYY, HH:mm")}
                </Text>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 11, color: "#666" }}>Berakhir:</Text>
                <Text style={{ fontSize: 11, fontWeight: 500 }}>
                  {dayjs(questionnaire.end_date).format("DD MMM YYYY, HH:mm")}
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {questionnaire.status_message && (
          <div style={{ marginBottom: 16, textAlign: "center" }}>
            <Tag
              color={
                questionnaire.is_available
                  ? "success"
                  : questionnaire.is_completed
                  ? "processing"
                  : "warning"
              }
              style={{
                fontSize: 12,
                padding: "4px 12px",
                fontWeight: 600,
                borderRadius: 12,
                whiteSpace: "normal",
                wordBreak: "break-word",
                overflowWrap: "break-word",
                display: "inline-block",
                maxWidth: "100%",
                lineHeight: 1.4,
                textAlign: "center",
              }}
            >
              💡 {questionnaire.status_message}
            </Tag>
          </div>
        )}

        <Divider style={{ margin: "16px 0" }} />

        {/* Action Button */}
        <Button
          type="primary"
          icon={getStatusIcon()}
          onClick={handleClick}
          disabled={isDisabled}
          size="large"
          style={{
            width: "100%",
            height: 48,
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 14,
            ...getButtonStyle(),
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (!isDisabled) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                status.status === "completed"
                  ? "0 6px 16px rgba(82, 196, 26, 0.5)"
                  : "0 6px 16px rgba(0, 21, 41, 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isDisabled) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = getButtonStyle().boxShadow;
            }
          }}
        >
          {getButtonText()}
        </Button>

        {/* Completion Info */}
        {questionnaire.completed_at && (
          <Text
            type="secondary"
            style={{
              display: "block",
              textAlign: "center",
              marginTop: 8,
              fontSize: 11,
            }}
          >
            ✅ Selesai:{" "}
            {dayjs(questionnaire.completed_at).format("DD MMM YYYY, HH:mm")}
          </Text>
        )}
      </div>

      {/* Custom CSS untuk animasi */}
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </Card>
  );
};

export default ARCSCard;
