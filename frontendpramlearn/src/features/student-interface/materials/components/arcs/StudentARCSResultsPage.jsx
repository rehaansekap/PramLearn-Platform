import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Result,
  Button,
  Typography,
  Space,
  Progress,
  Tag,
  Row,
  Col,
  Divider,
  List,
  Statistic,
  Alert,
  Spin,
} from "antd";
import {
  TrophyOutlined,
  ArrowLeftOutlined,
  BookOutlined,
  FileTextOutlined,
  HeartOutlined,
  EyeOutlined,
  UserOutlined,
  StarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import useStudentARCSResults from "../../hooks/useStudentARCSResults";

const { Title, Text, Paragraph } = Typography;

const StudentARCSResultsPage = () => {
  const { materialSlug, arcsSlug } = useParams();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const { results, loading, error } = useStudentARCSResults(
    materialSlug,
    arcsSlug
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getDimensionColor = (dimension) => {
    const colors = {
      attention: "#ff7875",
      relevance: "#73d13d",
      confidence: "#40a9ff",
      satisfaction: "#b37feb",
    };
    return colors[dimension] || "#11418b";
  };

  const getDimensionName = (dimension) => {
    const names = {
      attention: "Perhatian",
      relevance: "Relevansi",
      confidence: "Percaya Diri",
      satisfaction: "Kepuasan",
    };
    return names[dimension] || dimension;
  };

  const getDimensionIcon = (dimension) => {
    const icons = {
      attention: <EyeOutlined />,
      relevance: <StarOutlined />,
      confidence: <UserOutlined />,
      satisfaction: <HeartOutlined />,
    };
    return icons[dimension] || <StarOutlined />;
  };

  const getMotivationColor = (level) => {
    const colors = {
      High: "#52c41a",
      Medium: "#faad14",
      Low: "#ff4d4f",
    };
    return colors[level] || "#666";
  };

  const getMotivationDescription = (level) => {
    const descriptions = {
      High: "Anda memiliki motivasi belajar yang tinggi! Pertahankan semangat belajar Anda.",
      Medium:
        "Motivasi belajar Anda cukup baik. Terus tingkatkan untuk hasil yang lebih optimal.",
      Low: "Motivasi belajar Anda perlu ditingkatkan. Jangan menyerah, terus semangat!",
    };
    return descriptions[level] || "Motivasi belajar Anda sedang dianalisis.";
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin size="large" tip="Memuat hasil kuesioner..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button
              onClick={() => navigate(`/student/materials/${materialSlug}`)}
            >
              Kembali ke Material
            </Button>
          }
        />
      </div>
    );
  }

  if (!results) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
        <Alert
          message="Hasil tidak ditemukan"
          description="Hasil kuesioner ARCS tidak tersedia."
          type="warning"
          showIcon
          action={
            <Button
              onClick={() => navigate(`/student/materials/${materialSlug}`)}
            >
              Kembali ke Material
            </Button>
          }
        />
      </div>
    );
  }

  const {
    questionnaire,
    material,
    response,
    dimension_scores,
    motivation_level,
    answers,
  } = results;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/student/materials/${materialSlug}`)}
              style={{ marginBottom: 16 }}
            >
              Kembali ke Material
            </Button>
            <Title level={2} style={{ color: "#11418b", margin: 0 }}>
              Hasil Kuesioner ARCS
            </Title>
            <Text type="secondary">
              Diselesaikan pada:{" "}
              {dayjs(response.completed_at).format("DD MMMM YYYY, HH:mm")}
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Overall Result */}
      {motivation_level && (
        <Card
          style={{
            marginBottom: 24,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${getMotivationColor(
              motivation_level
            )}15, #fff)`,
            border: `2px solid ${getMotivationColor(motivation_level)}`,
          }}
        >
          <Result
            icon={
              <TrophyOutlined
                style={{
                  color: getMotivationColor(motivation_level),
                  fontSize: isMobile ? 56 : 72,
                }}
              />
            }
            title={
              <Space direction="vertical" size="small">
                <Title
                  level={2}
                  style={{
                    margin: 0,
                    color: getMotivationColor(motivation_level),
                    fontSize: isMobile ? 24 : 32,
                  }}
                >
                  Tingkat Motivasi: {motivation_level}
                </Title>
                <Tag
                  color={getMotivationColor(motivation_level)}
                  style={{
                    fontSize: isMobile ? 12 : 14,
                    padding: "4px 12px",
                    fontWeight: "bold",
                  }}
                >
                  {questionnaire.title}
                </Tag>
              </Space>
            }
            subTitle={
              <div style={{ marginTop: 16 }}>
                <Paragraph style={{ fontSize: 16, color: "#666" }}>
                  {getMotivationDescription(motivation_level)}
                </Paragraph>
              </div>
            }
          />
        </Card>
      )}

      <Row gutter={[24, 24]}>
        {/* Dimension Scores */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <StarOutlined style={{ color: "#11418b" }} />
                <span>Skor Dimensi ARCS</span>
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            <Row gutter={[16, 16]}>
              {Object.entries(dimension_scores).map(([dimension, score]) => (
                <Col xs={12} sm={6} key={dimension}>
                  <Card
                    style={{
                      textAlign: "center",
                      borderColor: getDimensionColor(dimension),
                      borderWidth: 2,
                    }}
                  >
                    <div
                      style={{
                        color: getDimensionColor(dimension),
                        fontSize: 24,
                        marginBottom: 8,
                      }}
                    >
                      {getDimensionIcon(dimension)}
                    </div>
                    <Statistic
                      title={getDimensionName(dimension)}
                      value={score}
                      suffix="/ 5"
                      valueStyle={{
                        color: getDimensionColor(dimension),
                        fontSize: isMobile ? 18 : 24,
                      }}
                    />
                    <Progress
                      percent={(score / 5) * 100}
                      strokeColor={getDimensionColor(dimension)}
                      size="small"
                      style={{ marginTop: 8 }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Answer Review */}
          <Card
            title={
              <Space>
                <FileTextOutlined style={{ color: "#11418b" }} />
                <span>Review Jawaban</span>
              </Space>
            }
          >
            <List
              dataSource={answers}
              renderItem={(answer, index) => (
                <List.Item>
                  <div style={{ width: "100%" }}>
                    <div style={{ marginBottom: 8 }}>
                      <Tag
                        color={getDimensionColor(answer.dimension)}
                        size="small"
                      >
                        {getDimensionName(answer.dimension)}
                      </Tag>
                      <Text strong style={{ marginLeft: 8 }}>
                        Soal {answer.order}
                      </Text>
                    </div>
                    <Paragraph style={{ marginBottom: 8 }}>
                      {answer.question_text}
                    </Paragraph>
                    <div
                      style={{
                        background: "#f6f6f6",
                        padding: "8px 12px",
                        borderRadius: 6,
                        borderLeft: `4px solid ${getDimensionColor(
                          answer.dimension
                        )}`,
                      }}
                    >
                      <Text strong>Jawaban Anda: </Text>
                      <Text>{answer.answer_text}</Text>
                    </div>
                  </div>
                </List.Item>
              )}
              pagination={{
                pageSize: 5,
                size: "small",
              }}
            />
          </Card>
        </Col>

        {/* Statistics */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            {/* Summary Stats */}
            <Card title="Ringkasan" style={{ borderRadius: 12 }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Statistic
                  title="Total Pertanyaan"
                  value={response.total_questions}
                  prefix={<FileTextOutlined />}
                />
                <Statistic
                  title="Pertanyaan Terjawab"
                  value={response.answered_questions}
                  prefix={<FileTextOutlined />}
                />
                <Statistic
                  title="Tingkat Kelengkapan"
                  value={(
                    (response.answered_questions / response.total_questions) *
                    100
                  ).toFixed(1)}
                  suffix="%"
                  prefix={<TrophyOutlined />}
                />
              </Space>
            </Card>

            {/* Material Info */}
            <Card title="Informasi Material" style={{ borderRadius: 12 }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text strong>Material: </Text>
                  <Text>{material.title}</Text>
                </div>
                <div>
                  <Text strong>Kuesioner: </Text>
                  <Text>{questionnaire.title}</Text>
                </div>
                <div>
                  <Text strong>Tipe: </Text>
                  <Tag color="blue">
                    {questionnaire.questionnaire_type === "pre"
                      ? "Pra-Assessment"
                      : "Pasca-Assessment"}
                  </Tag>
                </div>
              </Space>
            </Card>

            {/* Motivation Tips */}
            {motivation_level && (
              <Card title="Tips Motivasi" style={{ borderRadius: 12 }}>
                <div
                  style={{
                    background: `${getMotivationColor(motivation_level)}10`,
                    padding: 16,
                    borderRadius: 8,
                    border: `1px solid ${getMotivationColor(
                      motivation_level
                    )}30`,
                  }}
                >
                  {motivation_level === "High" && (
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      <li>Pertahankan konsistensi belajar Anda</li>
                      <li>Tantang diri dengan materi yang lebih kompleks</li>
                      <li>Bantu teman-teman yang kesulitan</li>
                    </ul>
                  )}
                  {motivation_level === "Medium" && (
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      <li>Cari cara belajar yang lebih menyenangkan</li>
                      <li>Atur target belajar yang spesifik</li>
                      <li>Bergabung dengan kelompok belajar</li>
                    </ul>
                  )}
                  {motivation_level === "Low" && (
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      <li>Mulai dengan target kecil yang mudah dicapai</li>
                      <li>Cari tahu manfaat materi untuk kehidupan Anda</li>
                      <li>Diskusikan kesulitan dengan guru</li>
                    </ul>
                  )}
                </div>
              </Card>
            )}
          </Space>
        </Col>
      </Row>

      {/* Action Buttons */}
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <Space size="large" wrap>
          <Button
            icon={<BookOutlined />}
            onClick={() => navigate("/student/subjects")}
            size="large"
          >
            Kembali ke Mata Pelajaran
          </Button>
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={() => navigate(`/student/materials/${materialSlug}`)}
            size="large"
          >
            Lihat Material Lainnya
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default StudentARCSResultsPage;
