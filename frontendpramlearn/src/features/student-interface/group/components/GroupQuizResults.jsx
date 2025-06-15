import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Result,
  Button,
  Progress,
  Space,
  Tag,
  List,
  Alert,
  Spin,
  Statistic,
  Row,
  Col,
} from "antd";
import {
  TrophyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
  TeamOutlined,
  BookOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../../../../api";

const { Title, Text } = Typography;

const GroupQuizResults = () => {
  const { quizSlug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get(
          `student/group-quiz/${quizSlug}/results/`
        );
        setResults(response.data);
      } catch (err) {
        setError(err);
        console.error("Error fetching group quiz results:", err);
      } finally {
        setLoading(false);
      }
    };

    if (quizSlug) {
      fetchResults();
    }
  }, [quizSlug]);

  const getScoreColor = (score) => {
    if (score >= 80) return "#52c41a"; // Green
    if (score >= 60) return "#faad14"; // Orange
    return "#ff4d4f"; // Red
  };

  const getGradeText = (score) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "E";
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" tip="Memuat hasil quiz kelompok..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
        <Alert
          message="Gagal memuat hasil quiz"
          description={error.message}
          type="error"
          showIcon
          action={
            <Button onClick={() => navigate("/student/assessments")}>
              Kembali
            </Button>
          }
        />
      </div>
    );
  }

  if (!results) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
        <Alert
          message="Hasil quiz tidak ditemukan"
          description="Belum ada hasil quiz untuk ditampilkan."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/student/assessments")}
          style={{ marginBottom: 16 }}
        >
          Kembali ke Daftar Quiz
        </Button>

        <Title level={2} style={{ color: "#11418b", margin: 0 }}>
          <TeamOutlined style={{ marginRight: 8 }} />
          Hasil Quiz Kelompok: {results.quiz_title}
        </Title>
        <Text type="secondary">
          Kelompok: {results.group_name} • Diselesaikan pada:{" "}
          {dayjs(results.submitted_at).format("DD MMMM YYYY, HH:mm")}
        </Text>
      </div>

      {/* Overall Result Card */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 12,
          background: `linear-gradient(135deg, ${getScoreColor(
            results.score
          )}15, #fff)`,
          border: `2px solid ${getScoreColor(results.score)}`,
        }}
      >
        <Result
          icon={
            <TrophyOutlined
              style={{ color: getScoreColor(results.score), fontSize: 72 }}
            />
          }
          title={
            <Space direction="vertical" size="small">
              <Title
                level={2}
                style={{ margin: 0, color: getScoreColor(results.score) }}
              >
                Skor Kelompok: {results.score.toFixed(1)}
              </Title>
              <Tag
                color={getScoreColor(results.score)}
                style={{
                  fontSize: 16,
                  padding: "4px 12px",
                  fontWeight: "bold",
                }}
              >
                Grade: {getGradeText(results.score)}
              </Tag>
            </Space>
          }
          subTitle={
            <Space direction="vertical" size="small">
              <Text style={{ fontSize: 16 }}>
                {results.correct_answers} dari {results.total_questions} soal
                benar
              </Text>
              <Progress
                percent={results.score}
                strokeColor={getScoreColor(results.score)}
                style={{ maxWidth: 300 }}
              />
            </Space>
          }
        />
      </Card>

      {/* Statistics Row */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card style={{ textAlign: "center", borderRadius: 8 }}>
            <Statistic
              title="Total Soal"
              value={results.total_questions}
              suffix="soal"
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ textAlign: "center", borderRadius: 8 }}>
            <Statistic
              title="Jawaban Benar"
              value={results.correct_answers}
              suffix="soal"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ textAlign: "center", borderRadius: 8 }}>
            <Statistic
              title="Persentase Benar"
              value={(
                (results.correct_answers / results.total_questions) *
                100
              ).toFixed(1)}
              suffix="%"
              valueStyle={{ color: getScoreColor(results.score) }}
            />
          </Card>
        </Col>
      </Row>

      {/* Detailed Answers Review */}
      <Card
        title={
          <Space>
            <BookOutlined />
            <span>Review Jawaban Kelompok</span>
          </Space>
        }
        style={{ borderRadius: 12 }}
      >
        <List
          itemLayout="vertical"
          dataSource={results.answers || []}
          renderItem={(answer, index) => (
            <List.Item
              style={{
                padding: "16px",
                marginBottom: "12px",
                borderRadius: "8px",
                background: answer.is_correct ? "#f6ffed" : "#fff2f0",
                border: `1px solid ${
                  answer.is_correct ? "#b7eb8f" : "#ffccc7"
                }`,
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <Tag color={answer.is_correct ? "success" : "error"}>
                    Soal {index + 1}
                  </Tag>
                  {answer.is_correct ? (
                    <CheckCircleOutlined
                      style={{ color: "#52c41a", fontSize: 16 }}
                    />
                  ) : (
                    <CloseCircleOutlined
                      style={{ color: "#ff4d4f", fontSize: 16 }}
                    />
                  )}
                  <Tag color="blue" size="small">
                    Dijawab oleh: {answer.answered_by}
                  </Tag>
                </div>
                <Title level={5} style={{ margin: 0 }}>
                  {answer.question_text}
                </Title>
              </div>

              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text strong>Jawaban Kelompok: </Text>
                  <Tag color={answer.is_correct ? "success" : "error"}>
                    {answer.selected_answer}
                  </Tag>
                </div>

                {!answer.is_correct && (
                  <div>
                    <Text strong>Jawaban Benar: </Text>
                    <Tag color="success">{answer.correct_answer}</Tag>
                  </div>
                )}
              </Space>
            </List.Item>
          )}
        />
      </Card>

      {/* Action Buttons */}
      <div style={{ textAlign: "center", marginTop: 24 }}>
        <Space size="large">
          <Button
            type="primary"
            icon={<BookOutlined />}
            onClick={() => navigate("/student/subjects")}
            size="large"
          >
            Kembali ke Mata Pelajaran
          </Button>
          <Button onClick={() => navigate("/student/assessments")} size="large">
            Lihat Quiz Lainnya
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default GroupQuizResults;
