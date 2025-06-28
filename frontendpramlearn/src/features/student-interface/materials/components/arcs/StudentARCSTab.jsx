import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Space,
  Button,
  Tag,
  Empty,
  Spin,
  Alert,
  Modal,
  Row,
  Col,
  Progress,
} from "antd";
import {
  FormOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import useStudentARCS from "../../hooks/useStudentARCS";
import StudentARCSQuestionnaire from "./StudentARCSQuestionnaire";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

const StudentARCSTab = ({ materialSlug }) => {
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [selectedQuestionnaireLocal, setSelectedQuestionnaireLocal] =
    useState(null);

  const {
    questionnaires,
    questionnaireDetail,
    isInQuestionnaireMode,
    loading,
    detailLoading,
    error,
    selectQuestionnaire,
    backToList,
    setError,
  } = useStudentARCS(materialSlug);

  const navigate = useNavigate();

  const handleStartQuestionnaire = (questionnaire) => {
    // Check availability before starting
    if (!questionnaire.is_available) {
      Modal.warning({
        title: "Kuesioner Tidak Tersedia",
        content: questionnaire.status_message,
        okText: "Mengerti",
      });
      return;
    }
    const identifier = questionnaire.slug || `arcs-${questionnaire.id}`;
    console.log("🔍 ARCS Navigation identifier:", identifier, questionnaire);

    navigate(`/student/materials/${materialSlug}/${identifier}`);
  };

  const handleProceedToQuestionnaire = async () => {
    console.log("Proceeding to questionnaire:", selectedQuestionnaireLocal);
    setShowIntroModal(false);
    if (selectedQuestionnaireLocal) {
      await selectQuestionnaire(selectedQuestionnaireLocal);
    }
  };

  const handleBackToList = () => {
    setSelectedQuestionnaireLocal(null);
    backToList();
    setError(null);
  };

  const renderActionButton = (questionnaire) => {
    // ✅ GUNAKAN SLUG BUKAN ID
    const identifier = questionnaire.slug || `arcs-${questionnaire.id}`;

    if (questionnaire.is_completed) {
      return (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() =>
            navigate(`/student/materials/${materialSlug}/${identifier}/results`)
          }
          style={{
            width: "100%",
            marginTop: 12,
            backgroundColor: "#52c41a",
            borderColor: "#52c41a",
          }}
        >
          Lihat Hasil
        </Button>
      );
    } else if (questionnaire.is_available) {
      return (
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={() => handleStartQuestionnaire(questionnaire)}
          style={{
            width: "100%",
            marginTop: 12,
            backgroundColor: "#11418b",
            borderColor: "#11418b",
          }}
        >
          Mulai Kuesioner
        </Button>
      );
    } else {
      return (
        <Button
          disabled
          style={{
            width: "100%",
            marginTop: 12,
          }}
        >
          {questionnaire.status_message}
        </Button>
      );
    }
  };

  const getStatusColor = (questionnaire) => {
    if (questionnaire.is_completed) return "success";
    if (!questionnaire.is_available) return "error";
    return "processing";
  };

  const getStatusIcon = (questionnaire) => {
    if (questionnaire.is_completed) return <CheckCircleOutlined />;
    if (!questionnaire.is_available) return <ExclamationCircleOutlined />;
    return <ClockCircleOutlined />;
  };

  const getStatusText = (questionnaire) => {
    if (questionnaire.is_completed) return "Selesai";
    if (!questionnaire.is_available) return "Tidak Tersedia";
    return "Tersedia";
  };

  const formatTimeRemaining = (minutes) => {
    if (!minutes || minutes <= 0) return "Berakhir";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} hari ${hours % 24} jam`;
    } else if (hours > 0) {
      return `${hours} jam ${mins} menit`;
    } else {
      return `${mins} menit`;
    }
  };

  // ✅ SHOW QUESTIONNAIRE FORM JIKA DALAM MODE QUESTIONNAIRE
  if (isInQuestionnaireMode && questionnaireDetail) {
    if (detailLoading) {
      return (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" tip="Memuat kuesioner..." />
        </div>
      );
    }

    return (
      <StudentARCSQuestionnaire
        questionnaire={questionnaireDetail}
        materialSlug={materialSlug}
        onBack={handleBackToList}
      />
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin size="large" tip="Memuat kuesioner ARCS..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        style={{ margin: "24px" }}
      />
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <FormOutlined
          style={{ fontSize: 48, color: "#11418b", marginBottom: 16 }}
        />
        <Title level={3} style={{ margin: 0, color: "#11418b" }}>
          Kuesioner ARCS
        </Title>
        <Paragraph style={{ fontSize: "16px", color: "#666", marginTop: 8 }}>
          ARCS (Attention, Relevance, Confidence, Satisfaction) adalah model
          untuk mengukur motivasi belajar Anda
        </Paragraph>
      </div>

      {/* Questionnaires List */}
      {questionnaires.length === 0 ? (
        <Empty
          description="Belum ada kuesioner ARCS yang tersedia"
          style={{ padding: "60px 0" }}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {questionnaires.map((questionnaire) => (
            <Col xs={24} md={12} lg={8} key={questionnaire.id}>
              <Card
                hoverable={
                  questionnaire.is_available && !questionnaire.is_completed
                }
                style={{
                  borderRadius: 12,
                  height: "100%",
                  border: questionnaire.is_completed
                    ? "2px solid #52c41a"
                    : questionnaire.is_available
                    ? "1px solid #1890ff"
                    : "1px solid #ff4d4f",
                  opacity:
                    questionnaire.is_available || questionnaire.is_completed
                      ? 1
                      : 0.7,
                }}
                bodyStyle={{ padding: "20px" }}
              >
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <Title level={5} style={{ margin: 0, fontSize: "16px" }}>
                      {questionnaire.title}
                    </Title>
                    <Tag
                      color={getStatusColor(questionnaire)}
                      icon={getStatusIcon(questionnaire)}
                    >
                      {getStatusText(questionnaire)}
                    </Tag>
                  </div>

                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {questionnaire.description ||
                      "Kuesioner untuk mengukur motivasi belajar"}
                  </Text>
                </div>

                <Space
                  direction="vertical"
                  style={{ width: "100%" }}
                  size="small"
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Text style={{ fontSize: "13px" }}>
                      <FormOutlined style={{ marginRight: 4 }} />
                      {questionnaire.total_questions} pertanyaan
                    </Text>
                    <Text style={{ fontSize: "13px" }}>
                      <ClockCircleOutlined style={{ marginRight: 4 }} />~
                      {questionnaire.estimated_time} menit
                    </Text>
                  </div>

                  {/* Time Information */}
                  {questionnaire.end_date && (
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      <CalendarOutlined style={{ marginRight: 4 }} />
                      {questionnaire.is_available ? (
                        <span>
                          Berakhir:{" "}
                          {dayjs(questionnaire.end_date).format(
                            "DD/MM/YYYY HH:mm"
                          )}
                          {questionnaire.time_remaining &&
                            questionnaire.time_remaining > 0 && (
                              <Text style={{ color: "#fa8c16", marginLeft: 4 }}>
                                (
                                {formatTimeRemaining(
                                  questionnaire.time_remaining
                                )}{" "}
                                lagi)
                              </Text>
                            )}
                        </span>
                      ) : (
                        <span style={{ color: "#ff4d4f" }}>
                          {questionnaire.status_message}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Duration Info */}
                  {questionnaire.duration_minutes && (
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      Durasi maksimal: {questionnaire.duration_minutes} menit
                    </div>
                  )}

                  {questionnaire.is_completed ? (
                    <div style={{ marginTop: 12 }}>
                      <Text style={{ fontSize: "12px", color: "#52c41a" }}>
                        <CheckCircleOutlined style={{ marginRight: 4 }} />
                        Diselesaikan pada:{" "}
                        {new Date(questionnaire.completed_at).toLocaleString(
                          "id-ID"
                        )}
                      </Text>
                    </div>
                  ) : null}

                  {/* Action Button */}
                  {renderActionButton(questionnaire)}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Introduction Modal */}
      <Modal
        title={
          <Space>
            <InfoCircleOutlined style={{ color: "#11418b" }} />
            <span>Informasi Kuesioner</span>
          </Space>
        }
        open={showIntroModal}
        onCancel={() => setShowIntroModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowIntroModal(false)}>
            Batal
          </Button>,
          <Button
            key="proceed"
            type="primary"
            onClick={handleProceedToQuestionnaire}
            style={{ backgroundColor: "#11418b", borderColor: "#11418b" }}
          >
            Mulai Kuesioner
          </Button>,
        ]}
        width={600}
      >
        {selectedQuestionnaireLocal && (
          <div>
            <Title level={4} style={{ marginBottom: 16 }}>
              {selectedQuestionnaireLocal.title}
            </Title>

            <Paragraph>
              {selectedQuestionnaireLocal.description ||
                "Kuesioner ini dirancang untuk mengukur tingkat motivasi belajar Anda berdasarkan model ARCS."}
            </Paragraph>

            <div
              style={{
                background: "#f5f5f5",
                padding: 16,
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <Text strong>Detail Kuesioner:</Text>
                <Text>
                  • Jumlah pertanyaan:{" "}
                  {selectedQuestionnaireLocal.total_questions}
                </Text>
                <Text>
                  • Estimasi waktu: {selectedQuestionnaireLocal.estimated_time}{" "}
                  menit
                </Text>
                <Text>
                  • Tipe:{" "}
                  {selectedQuestionnaireLocal.questionnaire_type === "pre"
                    ? "Pra-Assessment"
                    : "Pasca-Assessment"}
                </Text>

                {selectedQuestionnaireLocal.duration_minutes && (
                  <Text style={{ color: "#fa8c16" }}>
                    • Durasi maksimal:{" "}
                    {selectedQuestionnaireLocal.duration_minutes} menit
                  </Text>
                )}

                {selectedQuestionnaireLocal.time_remaining &&
                  selectedQuestionnaireLocal.time_remaining > 0 && (
                    <Text style={{ color: "#fa8c16" }}>
                      • Waktu tersisa:{" "}
                      {formatTimeRemaining(
                        selectedQuestionnaireLocal.time_remaining
                      )}
                    </Text>
                  )}
              </Space>
            </div>

            <Alert
              message="Petunjuk Pengerjaan"
              description={
                <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                  <li>
                    Jawab semua pertanyaan dengan jujur sesuai dengan kondisi
                    Anda
                  </li>
                  <li>Tidak ada jawaban yang benar atau salah</li>
                  <li>Anda dapat navigasi antar pertanyaan sebelum submit</li>
                  <li>Setelah submit, jawaban tidak dapat diubah</li>
                  {selectedQuestionnaireLocal.duration_minutes && (
                    <li style={{ color: "#fa8c16" }}>
                      Pastikan menyelesaikan dalam waktu{" "}
                      {selectedQuestionnaireLocal.duration_minutes} menit
                    </li>
                  )}
                </ul>
              }
              type="info"
              showIcon
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentARCSTab;
