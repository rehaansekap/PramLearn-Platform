import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Alert,
  Typography,
  Space,
  Tooltip,
  Row,
  Col,
  Select,
  Divider,
  Tag,
  Switch,
  Badge,
  Spin,
  Modal,
  Progress,
} from "antd";
import {
  TeamOutlined,
  LoadingOutlined,
  UsergroupAddOutlined,
  InfoCircleOutlined,
  ExperimentOutlined,
  SyncOutlined,
  SettingOutlined,
  TrophyOutlined,
  BarChartOutlined,
  RiseOutlined,
  RobotOutlined,
  EyeOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  FireOutlined,
  AimOutlined,
  GroupOutlined,
} from "@ant-design/icons";
import useSessionGroupFormation from "../../../hooks/useSessionGroupFormation";

const { Title, Text } = Typography;
const { Option } = Select;

const GroupFormationSection = ({
  materialSlug,
  students,
  onGroupsChanged,
  isMobile = false,
}) => {
  const {
    groupMessage,
    groupProcessing,
    handleAutoGroup,
    // Adaptive algorithm states and functions
    analyzingClass,
    classAnalysis,
    recommendedMode,
    analyzeClassCharacteristics,
  } = useSessionGroupFormation(materialSlug, onGroupsChanged);

  // State for priority mode
  const [priorityMode, setPriorityMode] = useState("balanced");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Adaptive algorithm states
  const [useAdaptive, setUseAdaptive] = useState(false);
  const [showClassAnalysis, setShowClassAnalysis] = useState(false);
  const [analysisRequested, setAnalysisRequested] = useState(false);

  // Priority mode configurations
  const priorityModes = [
    {
      key: "balanced",
      label: "Seimbang",
      description:
        "Untuk kondisi kelas normal dengan distribusi motivasi yang beragam",
      icon: <BarChartOutlined />,
      color: "#1677ff",
      weights: "40% Ukuran, 40% Distribusi, 20% Keberagaman",
      recommendation: "Direkomendasikan untuk sebagian besar kelas",
      scenarios: [
        "Kelas dengan distribusi motivasi yang cukup beragam",
        "Pembelajaran kolaboratif standar",
        "Kondisi kelas yang normal dan seimbang",
      ],
    },
    {
      key: "size_first",
      label: "Ukuran Prioritas",
      description:
        "Untuk kelas dengan jumlah siswa yang tidak ideal atau perlu keseimbangan ukuran",
      icon: <TeamOutlined />,
      color: "#52c41a",
      weights: "60% Ukuran, 25% Distribusi, 15% Keberagaman",
      recommendation: "Untuk kelas dengan jumlah siswa yang sulit dibagi rata",
      scenarios: [
        "Kelas dengan jumlah siswa ganjil",
        "Prioritas keseimbangan ukuran kelompok",
        "Keterbatasan ruang atau resources",
      ],
    },
    {
      key: "uniformity_first",
      label: "Distribusi Prioritas",
      description: "Untuk kelas dengan data motivasi yang sangat beragam",
      icon: <SyncOutlined />,
      color: "#faad14",
      weights: "25% Ukuran, 60% Distribusi, 15% Keberagaman",
      recommendation: "Untuk kelas dengan motivasi yang sangat bervariasi",
      scenarios: [
        "Kelas dengan motivasi High, Medium, Low yang seimbang",
        "Perlu distribusi yang seragam antar kelompok",
        "Aktivitas yang membutuhkan kesetaraan kelompok",
      ],
    },
    {
      key: "heterogeneity_first",
      label: "Keberagaman Prioritas",
      description:
        "Untuk pembelajaran kolaboratif yang maksimal dengan peer learning",
      icon: <RiseOutlined />,
      color: "#722ed1",
      weights: "25% Ukuran, 25% Distribusi, 50% Keberagaman",
      recommendation: "Untuk memaksimalkan pembelajaran peer-to-peer",
      scenarios: [
        "Pembelajaran kolaboratif intensif",
        "Peer learning dan mentoring",
        "Diskusi dan brainstorming kelompok",
      ],
    },
  ];

  const selectedMode = priorityModes.find((mode) => mode.key === priorityMode);

  // Auto-analyze class when adaptive mode is enabled
  useEffect(() => {
    if (useAdaptive && !analysisRequested && materialSlug) {
      setAnalysisRequested(true);
      analyzeClassCharacteristics();
    }
  }, [
    useAdaptive,
    materialSlug,
    analysisRequested,
    analyzeClassCharacteristics,
  ]);

  // Update priority mode when recommendation is available
  useEffect(() => {
    if (
      useAdaptive &&
      recommendedMode &&
      recommendedMode.mode !== priorityMode
    ) {
      setPriorityMode(recommendedMode.mode);
    }
  }, [useAdaptive, recommendedMode, priorityMode]);

  // Handle adaptive mode toggle
  const handleAdaptiveToggle = async (checked) => {
    setUseAdaptive(checked);
    if (checked) {
      setAnalysisRequested(false);
      await analyzeClassCharacteristics();
    } else {
      // Reset to balanced mode when adaptive is disabled
      setPriorityMode("balanced");
    }
  };

  // Handle analyze class button
  const handleAnalyzeClass = async () => {
    setShowClassAnalysis(true);
    if (!classAnalysis) {
      await analyzeClassCharacteristics();
    }
  };

  // Handle create homogeneous groups
  const handleCreateHomogen = async () => {
    try {
      await handleAutoGroup("homogen", priorityMode, useAdaptive);
      if (onGroupsChanged) onGroupsChanged();
    } catch (error) {
      console.error("Error creating homogeneous groups:", error);
    }
  };

  // Handle create heterogeneous groups
  const handleCreateHeterogen = async () => {
    try {
      await handleAutoGroup("heterogen", priorityMode, useAdaptive);
      if (onGroupsChanged) onGroupsChanged();
    } catch (error) {
      console.error("Error creating heterogeneous groups:", error);
    }
  };

  // Helper function to get priority mode info
  const getPriorityModeInfo = (mode) => {
    return priorityModes.find((m) => m.key === mode) || priorityModes[0];
  };

  const hasStudents = students && students.length > 0;

  return (
    <Card
      style={{
        borderRadius: 16,
        border: "2px dashed #e6f7ff",
        background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
        overflow: "hidden",
        position: "relative",
        marginTop: 24,
      }}
      bodyStyle={{ padding: isMobile ? "20px" : "32px" }}
    >
      {/* Background Pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "url(data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23667eea' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='8'/%3E%3Ccircle cx='10' cy='10' r='4'/%3E%3Ccircle cx='50' cy='50' r='4'/%3E%3C/g%3E%3C/svg%3E)",
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        {/* Header */}
        <div style={{ marginBottom: isMobile ? 24 : 32 }}>
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "50%",
              width: isMobile ? 80 : 100,
              height: isMobile ? 80 : 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              marginBottom: isMobile ? 16 : 20,
              boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
            }}
          >
            <UsergroupAddOutlined
              style={{
                fontSize: isMobile ? 32 : 40,
                color: "white",
              }}
            />
          </div>

          <Title
            level={isMobile ? 5 : 4}
            style={{
              margin: 0,
              marginBottom: 8,
              color: "#262626",
              fontSize: isMobile ? 18 : 22,
              fontWeight: 700,
            }}
          >
            Pembentukan Kelompok Otomatis
          </Title>

          <Text
            style={{
              fontSize: isMobile ? 13 : 15,
              color: "#666",
              display: "block",
              maxWidth: 400,
              margin: "0 auto",
            }}
          >
            Bentuk kelompok berdasarkan profil motivasi ARCS siswa secara
            otomatis
          </Text>
        </div>

        {/* Adaptive Algorithm Toggle */}
        <Card
          size="small"
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: 12,
            border: "1px solid #722ed1",
            textAlign: "left",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <RobotOutlined style={{ color: "#722ed1", fontSize: 18 }} />
              <div>
                <Text strong style={{ fontSize: 14, color: "#722ed1" }}>
                  🤖 Analisis Otomatis
                </Text>
                <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                  Sistem otomatis menganalisis karakteristik kelas dan
                  merekomendasikan mode prioritas terbaik
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Switch
                checked={useAdaptive}
                onChange={handleAdaptiveToggle}
                loading={analyzingClass}
                checkedChildren="ON"
                unCheckedChildren="OFF"
              />
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                onClick={handleAnalyzeClass}
                disabled={!hasStudents}
              >
                Lihat Analisis
              </Button>
            </div>
          </div>

          {/* Show recommendation when adaptive is enabled */}
          {useAdaptive && recommendedMode && (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                background: "#f0f7ff",
                borderRadius: 8,
                border: "1px solid #1677ff30",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <BulbOutlined style={{ color: "#1677ff", fontSize: 16 }} />
                <Text strong style={{ color: "#1677ff", fontSize: 14 }}>
                  Rekomendasi Sistem
                </Text>
                <Badge
                  count={`${(recommendedMode.confidence * 100).toFixed(0)}%`}
                  style={{
                    backgroundColor:
                      recommendedMode.confidence > 0.7 ? "#52c41a" : "#faad14",
                    color: "white",
                    fontSize: 10,
                  }}
                />
              </div>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
                <strong>Mode yang direkomendasikan:</strong>{" "}
                {getPriorityModeInfo(recommendedMode.mode).label}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>
                <strong>Alasan:</strong> {recommendedMode.reason}
              </div>
            </div>
          )}
        </Card>

        {/* Priority Mode Selection */}
        <Card
          size="small"
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: 12,
            border: "1px solid #d6e4ff",
            textAlign: "left",
            marginBottom: 24,
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <SettingOutlined style={{ color: "#1677ff", fontSize: 16 }} />
              <Text strong style={{ fontSize: 14, color: "#1677ff" }}>
                🎯 Mode Prioritas Pembentukan
              </Text>
              {useAdaptive && (
                <Tag color="#722ed1" size="small">
                  <RobotOutlined style={{ fontSize: 10, marginRight: 4 }} />
                  Auto-Selected
                </Tag>
              )}
              <Button
                type="link"
                size="small"
                icon={<InfoCircleOutlined />}
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                style={{ fontSize: 12, padding: 0 }}
              >
                {showAdvancedOptions ? "Sembunyikan" : "Info Detail"}
              </Button>
            </div>

            <Select
              value={priorityMode}
              onChange={setPriorityMode}
              style={{ width: "100%", minHeight: 40 }}
              size="large"
              placeholder="Pilih mode prioritas"
              disabled={useAdaptive}
              dropdownStyle={{
                zIndex: 1050,
              }}
              getPopupContainer={(trigger) => trigger.parentNode}
            >
              {priorityModes.map((mode) => (
                <Option key={mode.key} value={mode.key}>
                  <span
                    style={{ color: mode.color, fontSize: 16, marginRight: 8 }}
                  >
                    {mode.icon}
                  </span>
                  <span style={{ color: "#222", fontWeight: 600 }}>
                    {mode.label}
                  </span>
                  {useAdaptive &&
                    recommendedMode &&
                    recommendedMode.mode === mode.key && (
                      <Tag
                        color="#52c41a"
                        size="small"
                        style={{ marginLeft: 8 }}
                      >
                        <CheckCircleOutlined
                          style={{ fontSize: 10, marginRight: 2 }}
                        />
                        Recommended
                      </Tag>
                    )}
                </Option>
              ))}
            </Select>
          </div>

          {/* Selected Mode Info */}
          {selectedMode && (
            <div
              style={{
                background: `${selectedMode.color}10`,
                padding: 16,
                borderRadius: 8,
                border: `1px solid ${selectedMode.color}30`,
                marginTop: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span style={{ color: selectedMode.color, fontSize: 16 }}>
                  {selectedMode.icon}
                </span>
                <Text strong style={{ color: selectedMode.color }}>
                  {selectedMode.label}
                </Text>
                <Tag color={selectedMode.color} size="small">
                  {selectedMode.recommendation.includes("Direkomendasikan")
                    ? "Recommended"
                    : "Specialized"}
                </Tag>
                {useAdaptive &&
                  recommendedMode &&
                  recommendedMode.mode === selectedMode.key && (
                    <Tag color="#722ed1" size="small">
                      <ThunderboltOutlined
                        style={{ fontSize: 10, marginRight: 2 }}
                      />
                      AI Selected
                    </Tag>
                  )}
              </div>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
                <strong>Bobot:</strong> {selectedMode.weights}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>
                <strong>Cocok untuk:</strong> {selectedMode.recommendation}
              </div>
            </div>
          )}

          {/* Advanced Options */}
          {showAdvancedOptions && (
            <>
              <Divider style={{ margin: "16px 0" }} />
              <div style={{ fontSize: 12 }}>
                <Text
                  strong
                  style={{
                    color: "#1677ff",
                    marginBottom: 8,
                    display: "block",
                  }}
                >
                  📊 Detail Skenario Penggunaan:
                </Text>
                <div
                  style={{
                    display: "grid",
                    gap: 12,
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
                  }}
                >
                  {priorityModes.map((mode) => (
                    <div
                      key={mode.key}
                      style={{
                        padding: 12,
                        background: `${mode.color}08`,
                        borderRadius: 6,
                        border: `1px solid ${mode.color}20`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ color: mode.color, fontSize: 14 }}>
                          {mode.icon}
                        </span>
                        <Text
                          strong
                          style={{ fontSize: 12, color: mode.color }}
                        >
                          {mode.label}
                        </Text>
                      </div>
                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: 16,
                          fontSize: 11,
                          color: "#666",
                        }}
                      >
                        {mode.scenarios.map((scenario, idx) => (
                          <li key={idx} style={{ marginBottom: 2 }}>
                            {scenario}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Formation Methods */}
        <Row gutter={[16, 16]} style={{ marginBottom: isMobile ? 24 : 32 }}>
          <Col xs={24} sm={12}>
            <Card
              style={{
                borderRadius: 12,
                border: "1px solid #52c41a30",
                background: "white",
                height: "100%",
                cursor: hasStudents ? "pointer" : "not-allowed",
                transition: "all 0.3s ease",
                opacity: hasStudents ? 1 : 0.6,
                boxShadow: hasStudents
                  ? "0 4px 12px rgba(82, 196, 26, 0.1)"
                  : "none",
              }}
              bodyStyle={{
                padding: isMobile ? "16px" : "20px",
                textAlign: "center",
              }}
              hoverable={hasStudents}
              onClick={hasStudents ? handleCreateHomogen : undefined}
            >
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                  borderRadius: "50%",
                  width: isMobile ? 50 : 60,
                  height: isMobile ? 50 : 60,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  marginBottom: 12,
                  boxShadow: "0 4px 12px rgba(82, 196, 26, 0.3)",
                }}
              >
                <TeamOutlined
                  style={{
                    color: "white",
                    fontSize: isMobile ? 20 : 24,
                  }}
                />
              </div>

              <Title
                level={5}
                style={{ margin: 0, marginBottom: 8, color: "#52c41a" }}
              >
                Kelompok Homogen
              </Title>

              <Text style={{ fontSize: isMobile ? 11 : 12, color: "#666" }}>
                Siswa dengan tingkat motivasi yang <strong>sama</strong>
              </Text>

              <div style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  icon={
                    groupProcessing ? <LoadingOutlined /> : <GroupOutlined />
                  }
                  onClick={handleCreateHomogen}
                  loading={groupProcessing}
                  disabled={!hasStudents}
                  size={isMobile ? "middle" : "large"}
                  style={{
                    background:
                      "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    width: "100%",
                    height: 44,
                    fontSize: 14,
                  }}
                >
                  {groupProcessing ? "Membentuk..." : "Bentuk Homogen"}
                </Button>
              </div>

              <div style={{ marginTop: 8, fontSize: 11, color: "#999" }}>
                <AimOutlined style={{ marginRight: 4 }} />
                Mode: {selectedMode?.label}
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12}>
            <Card
              style={{
                borderRadius: 12,
                border: "1px solid #1677ff30",
                background: "white",
                height: "100%",
                cursor: hasStudents ? "pointer" : "not-allowed",
                transition: "all 0.3s ease",
                opacity: hasStudents ? 1 : 0.6,
                boxShadow: hasStudents
                  ? "0 4px 12px rgba(22, 119, 255, 0.1)"
                  : "none",
              }}
              bodyStyle={{
                padding: isMobile ? "16px" : "20px",
                textAlign: "center",
              }}
              hoverable={hasStudents}
              onClick={hasStudents ? handleCreateHeterogen : undefined}
            >
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #1677ff 0%, #096dd9 100%)",
                  borderRadius: "50%",
                  width: isMobile ? 50 : 60,
                  height: isMobile ? 50 : 60,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  marginBottom: 12,
                  boxShadow: "0 4px 12px rgba(22, 119, 255, 0.3)",
                }}
              >
                <ExperimentOutlined
                  style={{
                    color: "white",
                    fontSize: isMobile ? 20 : 24,
                  }}
                />
              </div>

              <Title
                level={5}
                style={{ margin: 0, marginBottom: 8, color: "#1677ff" }}
              >
                Kelompok Heterogen
              </Title>

              <Text style={{ fontSize: isMobile ? 11 : 12, color: "#666" }}>
                Siswa dengan tingkat motivasi yang <strong>beragam</strong>
              </Text>

              <div style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  icon={
                    groupProcessing ? (
                      <LoadingOutlined />
                    ) : (
                      <ExperimentOutlined />
                    )
                  }
                  onClick={handleCreateHeterogen}
                  loading={groupProcessing}
                  disabled={!hasStudents}
                  size={isMobile ? "middle" : "large"}
                  style={{
                    background:
                      "linear-gradient(135deg, #1677ff 0%, #096dd9 100%)",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    width: "100%",
                    height: 44,
                    fontSize: 14,
                  }}
                >
                  {groupProcessing ? "Membentuk..." : "Bentuk Heterogen"}
                </Button>
              </div>

              <div style={{ marginTop: 8, fontSize: 11, color: "#999" }}>
                <AimOutlined style={{ marginRight: 4 }} />
                Mode: {selectedMode?.label}
                {useAdaptive && (
                  <Tag color="#722ed1" size="small" style={{ marginLeft: 4 }}>
                    AI
                  </Tag>
                )}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Message */}
        {groupMessage && (
          <Alert
            message={groupMessage}
            type={groupMessage.includes("berhasil") ? "success" : "info"}
            showIcon
            style={{
              marginBottom: 20,
              borderRadius: 8,
              textAlign: "left",
            }}
            closable
          />
        )}

        {/* Class Analysis Modal */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <RobotOutlined style={{ color: "#722ed1" }} />
              <Text strong style={{ color: "#722ed1" }}>
                Analisis Karakteristik Kelas
              </Text>
            </div>
          }
          open={showClassAnalysis}
          onCancel={() => setShowClassAnalysis(false)}
          footer={[
            <Button key="close" onClick={() => setShowClassAnalysis(false)}>
              Tutup
            </Button>,
          ]}
          width={600}
        >
          {analyzingClass ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Spin size="large" />
              <div style={{ marginTop: 16, color: "#666" }}>
                Menganalisis karakteristik kelas...
              </div>
            </div>
          ) : classAnalysis && Object.keys(classAnalysis).length > 0 ? ( // FIX THIS CONDITION
            <div style={{ fontSize: 13 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>📊 Statistik Kelas:</Text>
                    <div style={{ marginTop: 8, color: "#666" }}>
                      • <strong>Total siswa:</strong>{" "}
                      {classAnalysis.total_students}
                      <br />• <strong>Teranalisis:</strong>{" "}
                      {classAnalysis.analyzed_students} (
                      {classAnalysis.analysis_percentage?.toFixed(1)}%)
                      <br />• <strong>Kualitas analisis:</strong>{" "}
                      {classAnalysis.analysis_quality}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>🎯 Distribusi Motivasi:</Text>
                    <div style={{ marginTop: 8, color: "#666" }}>
                      • <strong>Tinggi:</strong>{" "}
                      {classAnalysis.motivation_distribution?.High || 0}
                      <br />• <strong>Sedang:</strong>{" "}
                      {classAnalysis.motivation_distribution?.Medium || 0}
                      <br />• <strong>Rendah:</strong>{" "}
                      {classAnalysis.motivation_distribution?.Low || 0}
                    </div>
                  </div>
                </Col>
              </Row>

              <div style={{ marginBottom: 16 }}>
                <Text strong>📈 Indeks Karakteristik:</Text>
                <div style={{ marginTop: 8 }}>
                  <div style={{ marginBottom: 8 }}>
                    <Text>Keberagaman:</Text>
                    <Progress
                      percent={Math.round(classAnalysis.diversity_index * 100)}
                      size="small"
                      strokeColor="#52c41a"
                      style={{ marginLeft: 8 }}
                    />
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text>Potensi Uniformitas:</Text>
                    <Progress
                      percent={Math.round(
                        classAnalysis.uniformity_potential * 100
                      )}
                      size="small"
                      strokeColor="#1677ff"
                      style={{ marginLeft: 8 }}
                    />
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text>Potensi Heterogenitas:</Text>
                    <Progress
                      percent={Math.round(
                        classAnalysis.heterogeneity_potential * 100
                      )}
                      size="small"
                      strokeColor="#722ed1"
                      style={{ marginLeft: 8 }}
                    />
                  </div>
                </div>
              </div>

              {recommendedMode && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 16,
                    background: "#f0f7ff",
                    borderRadius: 8,
                    border: "1px solid #1677ff30",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <BulbOutlined style={{ color: "#1677ff" }} />
                    <Text strong style={{ color: "#1677ff" }}>
                      🎯 Rekomendasi Sistem:
                    </Text>
                    <Badge
                      count={`${Math.round(recommendedMode.confidence * 100)}%`}
                      style={{
                        backgroundColor:
                          recommendedMode.confidence > 0.7
                            ? "#52c41a"
                            : "#faad14",
                        color: "white",
                        fontSize: 10,
                      }}
                    />
                  </div>
                  <div style={{ marginTop: 8, color: "#666" }}>
                    <strong>Mode:</strong>{" "}
                    {getPriorityModeInfo(recommendedMode.mode)?.label ||
                      "Tidak Diketahui"}
                    <br />
                    <strong>Kepercayaan:</strong>{" "}
                    {Math.round(recommendedMode.confidence * 100)}%<br />
                    <strong>Alasan:</strong> {recommendedMode.reason}
                  </div>

                  {recommendedMode.alternatives &&
                    recommendedMode.alternatives.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <Text strong style={{ fontSize: 12, color: "#666" }}>
                          Alternatif lain:
                        </Text>
                        <div
                          style={{ fontSize: 11, color: "#999", marginTop: 4 }}
                        >
                          {recommendedMode.alternatives.map((alt, idx) => (
                            <div key={idx}>
                              •{" "}
                              {getPriorityModeInfo(alt.mode)?.label || alt.mode}{" "}
                              ({Math.round(alt.score * 100)}%)
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
              Data analisis tidak tersedia. Klik tombol "Lihat Analisis" untuk
              menganalisis kelas.
            </div>
          )}
        </Modal>

        {/* Info Card */}
        <Card
          size="small"
          style={{
            background: "rgba(255, 255, 255, 0.8)",
            borderRadius: 12,
            border: "1px solid #d6e4ff",
            textAlign: "left",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <InfoCircleOutlined
              style={{
                color: "#1677ff",
                fontSize: 16,
                marginTop: 2,
                flexShrink: 0,
              }}
            />
            <div>
              <Text
                strong
                style={{
                  color: "#1677ff",
                  fontSize: isMobile ? 12 : 13,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                💡 Informasi Penting:
              </Text>
              <div
                style={{
                  fontSize: isMobile ? 11 : 12,
                  color: "#666",
                  lineHeight: 1.5,
                }}
              >
                <div style={{ marginBottom: 6 }}>
                  <strong>Analisis Otomatis:</strong> Sistem menganalisis
                  karakteristik kelas dan merekomendasikan mode prioritas
                  terbaik
                </div>
                <div style={{ marginBottom: 6 }}>
                  <strong>Homogen:</strong> Cocok untuk pembelajaran yang
                  memerlukan tingkat motivasi yang seragam
                </div>
                <div style={{ marginBottom: 6 }}>
                  <strong>Heterogen:</strong> Ideal untuk pembelajaran
                  kolaboratif dan peer learning
                </div>
                <div style={{ marginBottom: 6 }}>
                  <strong>Mode Prioritas:</strong> Sesuaikan dengan
                  karakteristik dan kebutuhan kelas Anda
                </div>
                <div style={{ color: "#ff7875", fontStyle: "italic" }}>
                  * Pastikan profil motivasi ARCS siswa sudah dianalisis sebelum
                  membentuk kelompok
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Warning if no students */}
        {!hasStudents && (
          <Alert
            message="Tidak ada data siswa"
            description="Pastikan ada siswa yang terdaftar dalam kelas ini sebelum membentuk kelompok."
            type="warning"
            showIcon
            style={{
              marginTop: 20,
              borderRadius: 8,
              textAlign: "left",
            }}
          />
        )}
      </div>
    </Card>
  );
};

export default GroupFormationSection;
