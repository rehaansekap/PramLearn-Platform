import React from "react";
import { Card, Empty, Typography, Button } from "antd";
import {
  QuestionCircleOutlined,
  FileTextOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

// Empty state untuk Questions tab
export const QuestionsEmptyState = ({
  onSelectQuestionnaire,
  isMobile = false,
}) => (
  <Card
    style={{
      borderRadius: 16,
      border: "2px dashed #d9d9d9",
      background: "#fafafa",
      textAlign: "center",
      padding: isMobile ? "20px" : "40px 20px",
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

    <Title level={4} style={{ color: "#667eea", marginBottom: 8 }}>
      Belum Ada Kuesioner Dipilih
    </Title>

    <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
      Silakan pilih kuesioner dari tab "Daftar Kuesioner" untuk mengelola
      pertanyaan
    </Text>

    <Button
      type="primary"
      onClick={onSelectQuestionnaire}
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        border: "none",
        borderRadius: 8,
      }}
    >
      Pilih Kuesioner
    </Button>
  </Card>
);

// Empty state untuk Responses tab
export const ResponsesEmptyState = ({
  onSelectQuestionnaire,
  isMobile = false,
}) => (
  <Card
    style={{
      borderRadius: 16,
      border: "2px dashed #d9d9d9",
      background: "#fafafa",
      textAlign: "center",
      padding: isMobile ? "20px" : "40px 20px",
    }}
  >
    <div
      style={{
        background: "rgba(82, 196, 26, 0.1)",
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
          color: "#52c41a",
        }}
      />
    </div>

    <Title level={4} style={{ color: "#52c41a", marginBottom: 8 }}>
      Belum Ada Kuesioner Dipilih
    </Title>

    <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
      Silakan klik pada tag{" "}
      <Text
        code
        style={{
          background: "#52c41a",
          color: "white",
          padding: "2px 8px",
          borderRadius: 4,
        }}
      >
        Respons
      </Text>{" "}
      di daftar kuesioner untuk melihat data respons siswa
    </Text>

    <Button
      type="primary"
      onClick={onSelectQuestionnaire}
      style={{
        background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
        border: "none",
        borderRadius: 8,
      }}
    >
      Pilih Kuesioner
    </Button>
  </Card>
);

// Empty state untuk Analytics tab
export const AnalyticsEmptyState = ({
  onSelectQuestionnaire,
  isMobile = false,
}) => (
  <Card
    style={{
      borderRadius: 16,
      border: "2px dashed #d9d9d9",
      background: "#fafafa",
      textAlign: "center",
      padding: isMobile ? "20px" : "40px 20px",
    }}
  >
    <div
      style={{
        background: "rgba(250, 173, 20, 0.1)",
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
      <BarChartOutlined
        style={{
          fontSize: isMobile ? 24 : 32,
          color: "#faad14",
        }}
      />
    </div>

    <Title level={4} style={{ color: "#faad14", marginBottom: 8 }}>
      Belum Ada Kuesioner Dipilih
    </Title>

    <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
      Silakan klik pada tag{" "}
      <Text
        code
        style={{
          background: "#faad14",
          color: "white",
          padding: "2px 8px",
          borderRadius: 4,
        }}
      >
        Analitik
      </Text>{" "}
      di daftar kuesioner untuk melihat dashboard analitik
    </Text>

    <Button
      type="primary"
      onClick={onSelectQuestionnaire}
      style={{
        background: "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)",
        border: "none",
        borderRadius: 8,
      }}
    >
      Pilih Kuesioner
    </Button>
  </Card>
);

// Info card untuk menunjukkan kuesioner yang dipilih
export const SelectedQuestionnaireInfo = ({
  questionnaire,
  isMobile = false,
}) => (
  <Card
    style={{
      borderRadius: 12,
      background: "linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)",
      border: "1px solid #91d5ff",
      marginBottom: 16,
    }}
    bodyStyle={{ padding: isMobile ? 12 : 16 }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          background: "#1890ff",
          borderRadius: "50%",
          width: isMobile ? 32 : 40,
          height: isMobile ? 32 : 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <InfoCircleOutlined
          style={{ color: "white", fontSize: isMobile ? 14 : 16 }}
        />
      </div>

      <div style={{ flex: 1 }}>
        <Text strong style={{ color: "#1890ff", fontSize: isMobile ? 14 : 16 }}>
          Kuesioner Terpilih: {questionnaire.title}
        </Text>
        <Text
          type="secondary"
          style={{
            display: "block",
            fontSize: isMobile ? 11 : 12,
            marginTop: 2,
          }}
        >
          {questionnaire.description}
        </Text>
      </div>
    </div>
  </Card>
);
