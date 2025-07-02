import React, { useState, useEffect, useMemo } from "react";
import { Card, Tabs, Alert, message, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

import useSessionARCSManagement from "../../hooks/useSessionARCSManagement";

// Import enhanced components
import ARCSHeader from "./arcs/ARCSHeader";
import ARCSStatsCards from "./arcs/ARCSStatsCards";
import ARCSQuestionnaireGrid from "./arcs/ARCSQuestionnaireGrid";
import ARCSQuestionnaireForm from "./arcs/ARCSQuestionnaireForm";
import ARCSQuestionManager from "./arcs/ARCSQuestionManager";
import ARCSResponsesViewer from "./arcs/ARCSResponsesViewer";
import ARCSAnalyticsDashboard from "./arcs/ARCSAnalyticsDashboard";

// Import empty states
import {
  QuestionsEmptyState,
  ResponsesEmptyState,
  AnalyticsEmptyState,
  SelectedQuestionnaireInfo,
} from "./arcs/ARCSEmptyStates";

const { TabPane } = Tabs;

const SessionsMaterialARCSTab = ({ materialSlug, isMobile = false }) => {
  const [activeTab, setActiveTab] = useState("questionnaires");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingQuestionnaire, setEditingQuestionnaire] = useState(null);

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
    updateQuestion,
    deleteQuestion,
    fetchResponses,
    fetchAnalytics,
    fetchQuestionnaires: refetch,
  } = useSessionARCSManagement(materialSlug);

  useEffect(() => {
    const handleResize = () => {
      // Update mobile state if needed
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle create questionnaire
  const handleCreateQuestionnaire = () => {
    setEditingQuestionnaire(null);
    setModalVisible(true);
  };

  // Handle edit questionnaire
  const handleEditQuestionnaire = (questionnaire) => {
    setEditingQuestionnaire(questionnaire);
    setModalVisible(true);
  };

  // Handle questionnaire submission
  const handleQuestionnaireSubmit = async (data) => {
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
  };

  // Handle select questionnaire
  const handleQuestionnaireSelect = (questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    setActiveTab("questions");
    fetchQuestions(questionnaire.id);
  };

  // Handle view responses
  const handleViewResponses = (questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    setActiveTab("responses");
    fetchResponses(questionnaire.id);
  };

  // Handle view analytics
  const handleViewAnalytics = (questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    setActiveTab("analytics");
    fetchAnalytics(questionnaire.id);
  };

  // Handle toggle status
  const handleToggleStatus = async (questionnaireId, isActive) => {
    try {
      await updateQuestionnaire(questionnaireId, { is_active: isActive });
    } catch (error) {
      console.error("Error toggling questionnaire status:", error);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await refetch();
      if (selectedQuestionnaire) {
        // Refresh related data if questionnaire is selected
        if (activeTab === "questions") {
          await fetchQuestions(selectedQuestionnaire.id);
        } else if (activeTab === "responses") {
          await fetchResponses(selectedQuestionnaire.id);
        } else if (activeTab === "analytics") {
          await fetchAnalytics(selectedQuestionnaire.id);
        }
      }
      message.success("Data berhasil diperbarui");
    } catch (error) {
      console.error("Error refreshing data:", error);
      message.error("Gagal memperbarui data");
    }
  };

  // Handle back to questionnaires
  const handleBackToQuestionnaires = () => {
    setActiveTab("questionnaires");
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalQuestionnaires = questionnaires.length;
    const activeQuestionnaires = questionnaires.filter(
      (q) => q.is_active
    ).length;

    // Calculate total responses and completed responses from questionnaires data
    let totalResponses = 0;
    let completedResponses = 0;

    questionnaires.forEach((q) => {
      totalResponses += q.responses_count || 0;
      // Since completion_rate is percentage, calculate completed responses
      const questionnaireCompletedResponses = Math.round(
        ((q.completion_rate || 0) / 100) * (q.responses_count || 0)
      );
      completedResponses += questionnaireCompletedResponses;
    });

    // For ARCS dimension averages, we need to fetch actual response data
    // These will be updated when we have actual response data from the selected questionnaire
    let avgAttention = 0;
    let avgRelevance = 0;
    let avgConfidence = 0;
    let avgSatisfaction = 0;

    // If we have responses data (from selected questionnaire), calculate dimension averages
    if (responses.length > 0) {
      const dimensionSums = {
        attention: 0,
        relevance: 0,
        confidence: 0,
        satisfaction: 0,
      };
      const dimensionCounts = {
        attention: 0,
        relevance: 0,
        confidence: 0,
        satisfaction: 0,
      };

      responses.forEach((response) => {
        if (response.answers && response.is_completed) {
          response.answers.forEach((answer) => {
            const dimension = answer.question?.dimension || answer.dimension;
            if (
              dimension &&
              dimensionSums.hasOwnProperty(dimension) &&
              answer.likert_value
            ) {
              dimensionSums[dimension] += answer.likert_value;
              dimensionCounts[dimension]++;
            }
          });
        }
      });

      avgAttention =
        dimensionCounts.attention > 0
          ? dimensionSums.attention / dimensionCounts.attention
          : 0;
      avgRelevance =
        dimensionCounts.relevance > 0
          ? dimensionSums.relevance / dimensionCounts.relevance
          : 0;
      avgConfidence =
        dimensionCounts.confidence > 0
          ? dimensionSums.confidence / dimensionCounts.confidence
          : 0;
      avgSatisfaction =
        dimensionCounts.satisfaction > 0
          ? dimensionSums.satisfaction / dimensionCounts.satisfaction
          : 0;
    }

    return {
      totalQuestionnaires,
      activeQuestionnaires,
      totalResponses,
      completedResponses,
      avgAttention,
      avgRelevance,
      avgConfidence,
      avgSatisfaction,
    };
  }, [questionnaires, responses]);

  if (loading && questionnaires.length === 0) {
    return (
      <div
        style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
          minHeight: "400px",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              background: "rgba(102, 126, 234, 0.1)",
              width: 80,
              height: 80,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              marginBottom: 16,
            }}
          >
            <ReloadOutlined style={{ fontSize: 32, color: "#667eea" }} spin />
          </div>
          <p style={{ color: "#666", fontSize: 16 }}>Memuat data ARCS...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        // background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
        minHeight: "100vh",
        padding: isMobile ? 16 : 24,
        borderRadius: 16,
      }}
    >
      {/* Header */}
      <ARCSHeader
        isMobile={isMobile}
        questionnaireCount={questionnaires.length}
        onCreateQuestionnaire={handleCreateQuestionnaire}
        onRefresh={handleRefresh}
        loading={loading}
      />

      {/* Statistics Cards */}
      <ARCSStatsCards summaryStats={summaryStats} isMobile={isMobile} />

      {/* Main Content */}
      <Card
        style={{
          borderRadius: 16,
          border: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          size={isMobile ? "small" : "large"}
          style={{
            "& .ant-tabs-tab": {
              borderRadius: "12px 12px 0 0",
              fontWeight: 600,
            },
          }}
        >
          {/* Questionnaires Tab */}
          <TabPane
            tab={
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                📋 Daftar Kuesioner
                {questionnaires.length > 0 && (
                  <span
                    style={{
                      background: "#667eea",
                      color: "white",
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                      fontSize: 11,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                    }}
                  >
                    {questionnaires.length}
                  </span>
                )}
              </span>
            }
            key="questionnaires"
          >
            <div style={{ padding: isMobile ? 16 : 24 }}>
              <ARCSQuestionnaireGrid
                questionnaires={questionnaires}
                loading={loading}
                onEdit={handleEditQuestionnaire}
                onDelete={deleteQuestionnaire}
                onSelect={handleQuestionnaireSelect}
                onViewResponses={handleViewResponses}
                onViewAnalytics={handleViewAnalytics}
                onToggleStatus={handleToggleStatus}
                isMobile={isMobile}
              />
            </div>
          </TabPane>

          {/* Questions Tab */}
          <TabPane
            tab={
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                ❓ Kelola Pertanyaan
                {selectedQuestionnaire && (
                  <span
                    style={{
                      background: "#52c41a",
                      color: "white",
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                      fontSize: 11,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                    }}
                  >
                    {questions.length}
                  </span>
                )}
              </span>
            }
            key="questions"
          >
            <div style={{ padding: isMobile ? 16 : 24 }}>
              {selectedQuestionnaire ? (
                <>
                  <SelectedQuestionnaireInfo
                    questionnaire={selectedQuestionnaire}
                    isMobile={isMobile}
                  />
                  <ARCSQuestionManager
                    questionnaire={selectedQuestionnaire}
                    questions={questions}
                    loading={questionsLoading}
                    onCreateQuestion={createQuestion}
                    onUpdateQuestion={updateQuestion}
                    onDeleteQuestion={deleteQuestion}
                    materialSlug={materialSlug}
                    isMobile={isMobile}
                  />
                </>
              ) : (
                <QuestionsEmptyState
                  onSelectQuestionnaire={handleBackToQuestionnaires}
                  isMobile={isMobile}
                />
              )}
            </div>
          </TabPane>

          {/* Responses Tab */}
          <TabPane
            tab={
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                📊 Data Respons
                {selectedQuestionnaire && responses.length > 0 && (
                  <span
                    style={{
                      background: "#52c41a",
                      color: "white",
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                      fontSize: 11,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                    }}
                  >
                    {responses.length}
                  </span>
                )}
              </span>
            }
            key="responses"
          >
            <div style={{ padding: isMobile ? 16 : 24 }}>
              {selectedQuestionnaire ? (
                <>
                  <SelectedQuestionnaireInfo
                    questionnaire={selectedQuestionnaire}
                    isMobile={isMobile}
                  />
                  <ARCSResponsesViewer
                    questionnaire={selectedQuestionnaire}
                    responses={responses}
                    loading={responsesLoading}
                    isMobile={isMobile}
                  />
                </>
              ) : (
                <ResponsesEmptyState
                  onSelectQuestionnaire={handleBackToQuestionnaires}
                  isMobile={isMobile}
                />
              )}
            </div>
          </TabPane>

          {/* Analytics Tab */}
          <TabPane
            tab={
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                📈 Dashboard Analitik
              </span>
            }
            key="analytics"
          >
            <div style={{ padding: isMobile ? 16 : 24 }}>
              {selectedQuestionnaire ? (
                <>
                  <SelectedQuestionnaireInfo
                    questionnaire={selectedQuestionnaire}
                    isMobile={isMobile}
                  />
                  <ARCSAnalyticsDashboard
                    questionnaire={selectedQuestionnaire}
                    analytics={analytics}
                    loading={analyticsLoading}
                    isMobile={isMobile}
                  />
                </>
              ) : (
                <AnalyticsEmptyState
                  onSelectQuestionnaire={handleBackToQuestionnaires}
                  isMobile={isMobile}
                />
              )}
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Form Modal */}
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

export default SessionsMaterialARCSTab;
