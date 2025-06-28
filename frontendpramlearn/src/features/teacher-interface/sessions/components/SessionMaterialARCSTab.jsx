import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Tabs,
  Button,
  Space,
  Typography,
  Empty,
  Tag,
  Statistic,
  Row,
  Col,
  Alert,
} from "antd";
import {
  PlusOutlined,
  QuestionCircleOutlined,
  BarChartOutlined,
  FileTextOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import useSessionARCSManagement from "../hooks/useSessionARCSManagement";
import ARCSQuestionnaireList from "./arcs/ARCSQuestionnaireList";
import ARCSQuestionnaireForm from "./arcs/ARCSQuestionnaireForm";
import ARCSQuestionManager from "./arcs/ARCSQuestionManager";
import ARCSResponsesViewer from "./arcs/ARCSResponsesViewer";
import ARCSAnalyticsDashboard from "./arcs/ARCSAnalyticsDashboard";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const SessionMaterialARCSTab = ({ materialSlug }) => {
  const [activeTab, setActiveTab] = useState("questionnaires");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingQuestionnaire, setEditingQuestionnaire] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const {
    questionnaires,
    selectedQuestionnaire,
    setSelectedQuestionnaire,
    questions,
    responses,
    analytics,
    loading,
    questionsLoading,
    responsesLoading,
    analyticsLoading,
    createQuestionnaire,
    updateQuestionnaire,
    deleteQuestionnaire,
    fetchQuestions,
    createQuestion,
    fetchResponses,
    fetchAnalytics,
  } = useSessionARCSManagement(materialSlug);

  // Stabilize resize handler dengan useEffect yang benar
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Set initial value
    setIsMobile(window.innerWidth <= 768);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty dependency array

  // Stabilize handlers with useMemo/useCallback
  const handleCreateQuestionnaire = useMemo(
    () => () => {
      setEditingQuestionnaire(null);
      setModalVisible(true);
    },
    []
  );

  const handleEditQuestionnaire = useMemo(
    () => (questionnaire) => {
      setEditingQuestionnaire(questionnaire);
      setModalVisible(true);
    },
    []
  );

  const handleQuestionnaireSubmit = useMemo(
    () => async (data) => {
      try {
        if (editingQuestionnaire) {
          await updateQuestionnaire(editingQuestionnaire.id, data);
        } else {
          await createQuestionnaire(data);
        }
        setModalVisible(false);
        setEditingQuestionnaire(null);
      } catch (error) {
        console.error("Error submitting questionnaire:", error);
      }
    },
    [editingQuestionnaire, updateQuestionnaire, createQuestionnaire]
  );

  const handleQuestionnaireSelect = useMemo(
    () => (questionnaire) => {
      setSelectedQuestionnaire(questionnaire);
      setActiveTab("questions");
      fetchQuestions(questionnaire.id);
    },
    [setSelectedQuestionnaire, fetchQuestions]
  );

  const handleViewResponses = useMemo(
    () => (questionnaire) => {
      setSelectedQuestionnaire(questionnaire);
      setActiveTab("responses");
      fetchResponses(questionnaire.id);
    },
    [setSelectedQuestionnaire, fetchResponses]
  );

  const handleViewAnalytics = useMemo(
    () => (questionnaire) => {
      setSelectedQuestionnaire(questionnaire);
      setActiveTab("analytics");
      fetchAnalytics(questionnaire.id);
    },
    [setSelectedQuestionnaire, fetchAnalytics]
  );

  // Calculate summary statistics dengan useMemo untuk mencegah recalculation
  const summaryStats = useMemo(() => {
    const totalQuestionnaires = questionnaires.length;
    const activeQuestionnaires = questionnaires.filter(
      (q) => q.is_active
    ).length;
    const totalResponses = questionnaires.reduce(
      (sum, q) => sum + (q.responses_count || 0),
      0
    );
    const avgCompletionRate =
      questionnaires.length > 0
        ? questionnaires.reduce((sum, q) => sum + (q.completion_rate || 0), 0) /
          questionnaires.length
        : 0;

    return {
      totalQuestionnaires,
      activeQuestionnaires,
      totalResponses,
      avgCompletionRate,
    };
  }, [questionnaires]);

  return (
    <div style={{ padding: isMobile ? "16px" : "24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <QuestionCircleOutlined
          style={{
            fontSize: isMobile ? 24 : 32,
            color: "#11418b",
            marginBottom: isMobile ? 8 : 12,
          }}
        />
        <Title
          level={isMobile ? 5 : 4}
          style={{
            marginBottom: 8,
            fontSize: isMobile ? "16px" : "20px",
            fontWeight: 700,
            color: "#11418b",
          }}
        >
          Manajemen Kuesioner ARCS
        </Title>
        <Text
          type="secondary"
          style={{
            fontSize: isMobile ? "12px" : "14px",
            color: "#666",
          }}
        >
          Kelola kuesioner untuk mengukur motivasi siswa berdasarkan model ARCS
        </Text>
      </div>

      {/* Summary Statistics */}
      <Card size="small" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col xs={12} sm={6}>
            <Statistic
              title="Total Kuesioner"
              value={summaryStats.totalQuestionnaires}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#11418b", fontSize: isMobile ? 14 : 16 }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Aktif"
              value={summaryStats.activeQuestionnaires}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a", fontSize: isMobile ? 14 : 16 }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Total Respons"
              value={summaryStats.totalResponses}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: isMobile ? 14 : 16 }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Tingkat Selesai"
              value={summaryStats.avgCompletionRate}
              precision={1}
              suffix="%"
              prefix={<BarChartOutlined />}
              valueStyle={{ color: "#faad14", fontSize: isMobile ? 14 : 16 }}
            />
          </Col>
        </Row>
      </Card>

      {/* Rest of the component remains the same... */}
      {/* Info Alert */}
      <Alert
        message="Tentang Kuesioner ARCS"
        description="Kuesioner ARCS mengukur 4 dimensi motivasi: Attention (Perhatian), Relevance (Relevansi), Confidence (Percaya Diri), dan Satisfaction (Kepuasan). Hasil kuesioner akan otomatis mengisi profil motivasi siswa."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* Main Content Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={
            activeTab === "questionnaires" ? (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateQuestionnaire}
                size={isMobile ? "small" : "middle"}
              >
                {isMobile ? "Buat" : "Buat Kuesioner"}
              </Button>
            ) : selectedQuestionnaire ? (
              <Space>
                <Tag color="blue">{selectedQuestionnaire.title}</Tag>
                <Button
                  size="small"
                  onClick={() => {
                    setActiveTab("questionnaires");
                    setSelectedQuestionnaire(null);
                  }}
                >
                  Kembali
                </Button>
              </Space>
            ) : null
          }
        >
          <TabPane
            tab={
              <span>
                <FileTextOutlined />
                {!isMobile && " Kuesioner"}
              </span>
            }
            key="questionnaires"
          >
            <ARCSQuestionnaireList
              questionnaires={questionnaires}
              loading={loading}
              onEdit={handleEditQuestionnaire}
              onDelete={deleteQuestionnaire}
              onSelect={handleQuestionnaireSelect}
              onViewResponses={handleViewResponses}
              onViewAnalytics={handleViewAnalytics}
              isMobile={isMobile}
            />
          </TabPane>

          {selectedQuestionnaire && (
            <>
              <TabPane
                tab={
                  <span>
                    <QuestionCircleOutlined />
                    {!isMobile && " Pertanyaan"}
                  </span>
                }
                key="questions"
              >
                <ARCSQuestionManager
                  questionnaire={selectedQuestionnaire}
                  questions={questions}
                  loading={questionsLoading}
                  onCreateQuestion={(data) =>
                    createQuestion(selectedQuestionnaire.id, data)
                  }
                  onUpdateQuestion={fetchQuestions}
                  materialSlug={materialSlug}
                  isMobile={isMobile}
                />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <UserOutlined />
                    {!isMobile && " Respons"}
                  </span>
                }
                key="responses"
              >
                <ARCSResponsesViewer
                  questionnaire={selectedQuestionnaire}
                  responses={responses}
                  loading={responsesLoading}
                  isMobile={isMobile}
                />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <BarChartOutlined />
                    {!isMobile && " Analitik"}
                  </span>
                }
                key="analytics"
              >
                <ARCSAnalyticsDashboard
                  questionnaire={selectedQuestionnaire}
                  analytics={analytics}
                  loading={analyticsLoading}
                  isMobile={isMobile}
                />
              </TabPane>
            </>
          )}
        </Tabs>
      </Card>

      {/* Questionnaire Form Modal */}
      <ARCSQuestionnaireForm
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingQuestionnaire(null);
        }}
        onSubmit={handleQuestionnaireSubmit}
        editingQuestionnaire={editingQuestionnaire}
        loading={loading}
      />
    </div>
  );
};

export default SessionMaterialARCSTab;
