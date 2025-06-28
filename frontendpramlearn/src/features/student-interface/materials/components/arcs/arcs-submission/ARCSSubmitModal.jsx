import React from "react";
import {
  Modal,
  Space,
  Typography,
  Progress,
  Alert,
  Card,
  Row,
  Col,
  Tag,
} from "antd";
import {
  SendOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

const ARCSSubmitModal = ({
  visible,
  onOk,
  onCancel,
  answeredCount,
  totalQuestions,
  progress,
  questionnaire,
}) => {
  const getDimensionColor = (dimension) => {
    const colors = {
      attention: "#ff4d4f",
      relevance: "#52c41a",
      confidence: "#1890ff",
      satisfaction: "#fa8c16",
    };
    return colors[dimension] || "#11418b";
  };

  const isComplete = answeredCount === totalQuestions;

  return (
    <Modal
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText={
        isComplete ? "Ya, Submit Sekarang" : "Submit Meskipun Belum Lengkap"
      }
      cancelText="Batal"
      title={
        <Space>
          <SendOutlined
            style={{
              color: getDimensionColor(questionnaire?.dimension),
              fontSize: 20,
            }}
          />
          <Title level={4} style={{ margin: 0 }}>
            Submit Kuesioner ARCS
          </Title>
        </Space>
      }
      centered
      width={560}
      okButtonProps={{
        size: "large",
        style: {
          background: isComplete
            ? "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)"
            : getDimensionColor(questionnaire?.dimension),
          borderRadius: 8,
          border: 0,
          height: 44,
          fontWeight: 600,
        },
      }}
      cancelButtonProps={{
        size: "large",
        style: {
          borderRadius: 8,
          height: 44,
        },
      }}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          {isComplete ? (
            <CheckCircleOutlined
              style={{
                fontSize: 48,
                color: "#52c41a",
                marginBottom: 16,
                display: "block",
              }}
            />
          ) : (
            <ExclamationCircleOutlined
              style={{
                fontSize: 48,
                color: "#faad14",
                marginBottom: 16,
                display: "block",
              }}
            />
          )}

          <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
            {isComplete ? "Siap untuk Submit?" : "Yakin ingin Submit?"}
          </Title>

          <Text style={{ color: "#666", fontSize: 14 }}>
            {isComplete
              ? "Anda telah menyelesaikan semua pertanyaan dalam kuesioner ini."
              : "Masih ada beberapa pertanyaan yang belum dijawab."}
          </Text>
        </div>

        {/* Progress Card */}
        <Card
          style={{
            background: "#fafafa",
            border: "1px solid #f0f0f0",
            borderRadius: 12,
          }}
          bodyStyle={{ padding: "20px" }}
        >
          <Row gutter={16} align="middle">
            <Col span={16}>
              <Space direction="vertical" size={4} style={{ width: "100%" }}>
                <Text strong style={{ fontSize: 15 }}>
                  Progress Saat Ini
                </Text>
                <Text style={{ color: "#666" }}>
                  {answeredCount} dari {totalQuestions} pertanyaan terjawab
                </Text>
                <Progress
                  percent={progress}
                  size="small"
                  strokeColor={
                    "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)"
                  }
                  strokeWidth={6}
                  style={{ marginTop: 8 }}
                />
              </Space>
            </Col>
            <Col span={8} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    color: getDimensionColor(questionnaire?.dimension),
                  }}
                >
                  {Math.round(progress)}%
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {!isComplete && (
          <Alert
            message="Pertanyaan Belum Lengkap"
            description={
              <div>
                <Text>
                  Anda masih bisa melanjutkan untuk melengkapi semua pertanyaan
                  sebelum submit.
                </Text>
                <br />
                <Text style={{ fontSize: 12, color: "#666" }}>
                  Pertanyaan yang belum dijawab:{" "}
                  {totalQuestions - answeredCount}
                </Text>
              </div>
            }
            type="warning"
            showIcon
            style={{
              borderRadius: 8,
              border: "1px solid #faad14",
            }}
          />
        )}

        {isComplete && (
          <Alert
            message="Semua Pertanyaan Telah Dijawab"
            description="Terima kasih telah menyelesaikan kuesioner ARCS ini dengan lengkap."
            type="success"
            showIcon
            style={{
              borderRadius: 8,
              border: "1px solid #52c41a",
            }}
          />
        )}
      </Space>
    </Modal>
  );
};

export default ARCSSubmitModal;
