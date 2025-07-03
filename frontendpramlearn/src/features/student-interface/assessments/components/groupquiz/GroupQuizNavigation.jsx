import React, { useState } from "react";
import { Button, Typography, Space, Badge, Collapse } from "antd";
import {
  CheckCircleOutlined,
  QuestionCircleOutlined,
  MenuOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const GroupQuizNavigation = ({
  questions,
  answers,
  currentQuestionIndex,
  onQuestionSelect,
  collapsed,
  isMobile = false,
}) => {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  if (collapsed) {
    return (
      <div style={{ padding: 16, textAlign: "center" }}>
        <MenuOutlined style={{ fontSize: 24, color: "#666" }} />
      </div>
    );
  }

  const getQuestionStatus = (question, index) => {
    const isAnswered = answers[question.id] !== undefined;
    const isCurrent = index === currentQuestionIndex;

    if (isCurrent) {
      return {
        style: {
          backgroundColor: "#722ed1",
          borderColor: "#722ed1",
          color: "#fff",
          fontWeight: "bold",
        },
        icon: null,
      };
    }

    if (isAnswered) {
      return {
        style: {
          backgroundColor: "#f6ffed",
          borderColor: "#52c41a",
          color: "#52c41a",
        },
        icon: <CheckCircleOutlined style={{ fontSize: isMobile ? 8 : 10 }} />,
      };
    }

    return {
      style: {
        backgroundColor: "#fafafa",
        borderColor: "#d9d9d9",
        color: "#999",
      },
      icon: <QuestionCircleOutlined style={{ fontSize: isMobile ? 8 : 10 }} />,
    };
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const progress =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  if (isMobile) {
    return (
      <div style={{ padding: 12 }}>
        {/* Mobile Header dengan Progress */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
            cursor: "pointer",
          }}
          onClick={() => setMobileExpanded(!mobileExpanded)}
        >
          <div>
            <Title level={5} style={{ margin: 0, fontSize: 14 }}>
              Navigasi Soal
            </Title>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {answeredCount} / {totalQuestions} terjawab
            </Text>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 60,
                height: 6,
                background: "#e9ecef",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
                  height: "100%",
                  width: `${progress}%`,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            {mobileExpanded ? <UpOutlined /> : <DownOutlined />}
          </div>
        </div>

        {/* Mobile Question Grid - Collapsible */}
        {mobileExpanded && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 6,
              marginBottom: 12,
            }}
          >
            {questions.map((question, index) => {
              const status = getQuestionStatus(question, index);
              return (
                <Button
                  key={question.id}
                  size="small"
                  onClick={() => {
                    onQuestionSelect(index);
                    setMobileExpanded(false);
                  }}
                  style={{
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    borderRadius: 4,
                    padding: 0,
                    ...status.style,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <span>{index + 1}</span>
                    {status.icon}
                  </div>
                </Button>
              );
            })}
          </div>
        )}

        {/* Mobile Legend - Only when expanded */}
        {mobileExpanded && (
          <div style={{ marginTop: 12 }}>
            <Space size={8} wrap>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: "#722ed1",
                    borderRadius: 1,
                  }}
                />
                <Text style={{ fontSize: 9 }}>Aktif</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: "#f6ffed",
                    border: "1px solid #52c41a",
                    borderRadius: 1,
                  }}
                />
                <Text style={{ fontSize: 9 }}>Terjawab</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: "#fafafa",
                    border: "1px solid #d9d9d9",
                    borderRadius: 1,
                  }}
                />
                <Text style={{ fontSize: 9 }}>Belum</Text>
              </div>
            </Space>
          </div>
        )}
      </div>
    );
  }

  // Desktop version (original)
  return (
    <div
      style={{
        padding: 16,
        height: "100%",
        overflowY: "auto",
        maxHeight: "calc(100vh - 200px)",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
          Navigasi Soal
        </Title>
        <Text type="secondary" style={{ fontSize: 11 }}>
          Klik nomor soal untuk berpindah
        </Text>
      </div>

      {/* Progress Overview */}
      <div
        style={{
          background: "#f8fafc",
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <Text strong style={{ fontSize: 14, color: "#722ed1" }}>
            {answeredCount} / {totalQuestions}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            Soal Terjawab
          </Text>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            background: "#e9ecef",
            height: 6,
            borderRadius: 3,
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
              height: "100%",
              width: `${progress}%`,
              transition: "width 0.3s ease",
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text type="secondary" style={{ fontSize: 10 }}>
            {progress.toFixed(1)}%
          </Text>
          <Text type="secondary" style={{ fontSize: 10 }}>
            {totalQuestions - answeredCount} tersisa
          </Text>
        </div>
      </div>

      {/* Question Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {questions.map((question, index) => {
          const status = getQuestionStatus(question, index);
          return (
            <Button
              key={question.id}
              size="small"
              onClick={() => onQuestionSelect(index)}
              style={{
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                borderRadius: 6,
                padding: 0,
                ...status.style,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                <span>{index + 1}</span>
                {status.icon}
              </div>
            </Button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ marginBottom: 16 }}>
        <Text
          type="secondary"
          style={{ fontSize: 11, marginBottom: 8, display: "block" }}
        >
          Keterangan:
        </Text>
        <Space direction="vertical" size={4} style={{ width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 12,
                height: 12,
                backgroundColor: "#722ed1",
                borderRadius: 2,
              }}
            />
            <Text style={{ fontSize: 10 }}>Soal aktif</Text>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 12,
                height: 12,
                backgroundColor: "#f6ffed",
                border: "1px solid #52c41a",
                borderRadius: 2,
              }}
            />
            <Text style={{ fontSize: 10 }}>Sudah dijawab</Text>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 12,
                height: 12,
                backgroundColor: "#fafafa",
                border: "1px solid #d9d9d9",
                borderRadius: 2,
              }}
            />
            <Text style={{ fontSize: 10 }}>Belum dijawab</Text>
          </div>
        </Space>
      </div>

      {/* Statistics */}
      <div
        style={{
          background: "#f8fafc",
          padding: 12,
          borderRadius: 8,
          border: "1px solid #e2e8f0",
        }}
      >
        <Text
          strong
          style={{
            fontSize: 11,
            color: "#374151",
            marginBottom: 8,
            display: "block",
          }}
        >
          Statistik
        </Text>
        <Space direction="vertical" size={4} style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text type="secondary" style={{ fontSize: 10 }}>
              Terjawab:
            </Text>
            <Badge
              count={answeredCount}
              style={{ backgroundColor: "#52c41a", fontSize: 10 }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text type="secondary" style={{ fontSize: 10 }}>
              Belum dijawab:
            </Text>
            <Badge
              count={totalQuestions - answeredCount}
              style={{
                backgroundColor: "#d9d9d9",
                color: "#666",
                fontSize: 10,
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text type="secondary" style={{ fontSize: 10 }}>
              Total:
            </Text>
            <Badge
              count={totalQuestions}
              style={{ backgroundColor: "#722ed1", fontSize: 10 }}
            />
          </div>
        </Space>
      </div>
    </div>
  );
};

export default GroupQuizNavigation;
