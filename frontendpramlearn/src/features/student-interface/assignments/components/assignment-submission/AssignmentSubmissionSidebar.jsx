import React from "react";
import {
  Card,
  Space,
  Typography,
  Badge,
  Tag,
  Progress,
  Button,
  Divider,
} from "antd";
import {
  FileTextOutlined,
  TrophyOutlined,
  FlagOutlined,
  SaveOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const AssignmentSubmissionSidebar = ({
  allQuestions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  answers,
  flaggedQuestions,
  toggleQuestionFlag,
  autoSaving,
  progress,
}) => {
  const answeredCount = Object.keys(answers).length;
  const currentQuestion = allQuestions[currentQuestionIndex];

  const getQuestionStatus = (questionIndex) => {
    const question = allQuestions[questionIndex];
    const isAnswered = answers[question.id] !== undefined;
    const isCurrent = questionIndex === currentQuestionIndex;
    const isFlagged = flaggedQuestions.has(question.id);

    if (isCurrent) {
      return {
        color: "#1890ff",
        background: "#1890ff",
        textColor: "white",
        border: "1px solid #1890ff",
      };
    }

    if (isAnswered) {
      return {
        color: "#52c41a",
        background: "#f6ffed",
        textColor: "#52c41a",
        border: "1px solid #b7eb8f",
      };
    }

    if (isFlagged) {
      return {
        color: "#faad14",
        background: "#fff2e8",
        textColor: "#faad14",
        border: "1px solid #ffd591",
      };
    }

    return {
      color: "#d9d9d9",
      background: "#fafafa",
      textColor: "#666",
      border: "1px solid #d9d9d9",
    };
  };

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {/* Progress Tugas */}
      <Card
        title={
          <Space>
            <TrophyOutlined style={{ color: "#faad14" }} />
            <span>Progress Tugas</span>
          </Space>
        }
        size="small"
        style={{
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <Text strong style={{ fontSize: 16 }}>
              {answeredCount} / {allQuestions.length}
            </Text>
            <br />
            <Text type="secondary">Soal Terjawab</Text>
          </div>
          <Progress
            percent={progress}
            strokeColor={{
              "0%": "#001529",
              "100%": "#43cea2",
            }}
            style={{ marginBottom: 8 }}
          />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Progress: {progress.toFixed(1)}%
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {allQuestions.length - answeredCount} tersisa
            </Text>
          </div>
          {autoSaving && (
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <SaveOutlined spin /> Menyimpan otomatis...
              </Text>
            </div>
          )}
        </Space>
      </Card>

      {/* Statistik */}
      <Card
        title={
          <Space>
            <FileTextOutlined style={{ color: "#1890ff" }} />
            <span>Statistik</span>
          </Space>
        }
        size="small"
        style={{
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text type="secondary">Terjawab:</Text>
            <Badge
              count={answeredCount}
              style={{ backgroundColor: "#52c41a" }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text type="secondary">Ditandai:</Text>
            <Badge
              count={flaggedQuestions.size}
              style={{ backgroundColor: "#faad14" }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text type="secondary">Total:</Text>
            <Badge
              count={allQuestions.length}
              style={{ backgroundColor: "#1890ff" }}
            />
          </div>
        </Space>
      </Card>

      {/* Navigasi Soal */}
      <Card
        title="Navigasi Soal"
        size="small"
        style={{
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 8,
            marginBottom: 16,
          }}
        >
          {allQuestions.map((question, index) => {
            const status = getQuestionStatus(index);
            return (
              <Button
                key={question.id}
                size="small"
                onClick={() => setCurrentQuestionIndex(index)}
                style={{
                  height: 40,
                  background: status.background,
                  borderColor: status.color,
                  color: status.textColor,
                  fontWeight:
                    index === currentQuestionIndex ? "bold" : "normal",
                  border: status.border,
                }}
              >
                {index + 1}
              </Button>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ marginBottom: 16 }}>
          <Text
            type="secondary"
            style={{ fontSize: 12, marginBottom: 8, display: "block" }}
          >
            Keterangan:
          </Text>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: "#1890ff",
                  borderRadius: 4,
                }}
              />
              <Text style={{ fontSize: 11 }}>Soal aktif</Text>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: "#f6ffed",
                  border: "1px solid #52c41a",
                  borderRadius: 4,
                }}
              />
              <Text style={{ fontSize: 11 }}>Sudah dijawab</Text>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: "#fff2e8",
                  border: "1px solid #faad14",
                  borderRadius: 4,
                }}
              />
              <Text style={{ fontSize: 11 }}>Ditandai</Text>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: "#fafafa",
                  border: "1px solid #d9d9d9",
                  borderRadius: 4,
                }}
              />
              <Text style={{ fontSize: 11 }}>Belum dijawab</Text>
            </div>
          </Space>
        </div>

        <Divider />

        {/* Toggle Flag untuk Soal Aktif */}
        {currentQuestion && (
          <Button
            type={
              flaggedQuestions.has(currentQuestion.id) ? "primary" : "default"
            }
            icon={<FlagOutlined />}
            onClick={() => toggleQuestionFlag(currentQuestion.id)}
            block
            style={{
              backgroundColor: flaggedQuestions.has(currentQuestion.id)
                ? "#faad14"
                : undefined,
              borderColor: flaggedQuestions.has(currentQuestion.id)
                ? "#faad14"
                : undefined,
            }}
          >
            {flaggedQuestions.has(currentQuestion.id)
              ? "Hapus Tanda"
              : "Tandai Soal"}
          </Button>
        )}
      </Card>
    </Space>
  );
};

export default AssignmentSubmissionSidebar;
