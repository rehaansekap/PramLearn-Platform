import React, { useMemo } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Typography,
  Space,
  Modal,
  Progress,
  Row,
  Col,
  Statistic,
  Empty,
  Spin,
} from "antd";
import {
  EyeOutlined,
  DownloadOutlined,
  UserOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useState } from "react";

const { Text, Title } = Typography;

const ARCSResponsesViewer = ({
  questionnaire,
  responses,
  loading,
  isMobile = false,
}) => {
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Calculate dimension averages for each response
  const processedResponses = useMemo(() => {
    if (!responses || !Array.isArray(responses)) return [];

    return responses.map((response) => {
      const dimensionScores = {
        attention: [],
        relevance: [],
        confidence: [],
        satisfaction: [],
      };

      // Group answers by dimension
      if (response.answers && Array.isArray(response.answers)) {
        response.answers.forEach((answer) => {
          const dimension = answer.dimension?.toLowerCase();
          if (dimension && dimensionScores.hasOwnProperty(dimension)) {
            dimensionScores[dimension].push(answer.likert_value || 0);
          }
        });
      }

      // Calculate averages
      const dimensionAverages = {};
      Object.keys(dimensionScores).forEach((dimension) => {
        const scores = dimensionScores[dimension];
        dimensionAverages[dimension] =
          scores.length > 0
            ? scores.reduce((sum, score) => sum + score, 0) / scores.length
            : 0;
      });

      // Calculate total average
      const totalAverage =
        Object.values(dimensionAverages).length > 0
          ? Object.values(dimensionAverages).reduce(
              (sum, avg) => sum + avg,
              0
            ) / Object.values(dimensionAverages).length
          : 0;

      return {
        ...response,
        dimensionAverages,
        totalAverage,
        // Ensure we have proper student info
        student_name: response.student_name || "Unknown Student",
        student_username: response.student_username || "No username",
      };
    });
  }, [responses]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    if (!processedResponses.length) {
      return {
        attention: 0,
        relevance: 0,
        confidence: 0,
        satisfaction: 0,
      };
    }

    const dimensions = ["attention", "relevance", "confidence", "satisfaction"];
    const stats = {};

    dimensions.forEach((dimension) => {
      const scores = processedResponses
        .map((r) => r.dimensionAverages[dimension])
        .filter((score) => score > 0);

      stats[dimension] =
        scores.length > 0
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length
          : 0;
    });

    return stats;
  }, [processedResponses]);

  const handleViewDetail = (response) => {
    setSelectedResponse(response);
    setDetailModalVisible(true);
  };

  const getScoreColor = (score) => {
    if (score >= 4) return "#52c41a"; // Green
    if (score >= 3) return "#faad14"; // Orange
    return "#ff4d4f"; // Red
  };

  const getScoreText = (score) => {
    if (score >= 4) return "Tinggi";
    if (score >= 3) return "Sedang";
    return "Rendah";
  };

  const columns = [
    {
      title: "#",
      key: "index",
      render: (_, __, index) => index + 1,
      width: 50,
    },
    {
      title: "Siswa",
      key: "student",
      render: (_, record) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <UserOutlined style={{ color: "#1890ff" }} />
            <div>
              <div style={{ fontWeight: 500 }}>
                {record.student_name || "Unknown Student"}
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.student_username || "No username"}
              </Text>
            </div>
          </div>
        </div>
      ),
      width: isMobile ? 120 : 150,
    },
    {
      title: "Status",
      dataIndex: "is_completed",
      key: "status",
      render: (isCompleted) => (
        <Tag color={isCompleted ? "success" : "warning"}>
          {isCompleted ? "Selesai" : "Dalam Progress"}
        </Tag>
      ),
      width: 100,
    },
    {
      title: "Skor Total",
      key: "total_score",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: getScoreColor(record.totalAverage),
            }}
          >
            {record.totalAverage.toFixed(1)}/5.0
          </div>
          <Progress
            percent={(record.totalAverage / 5) * 100}
            size="small"
            showInfo={false}
            strokeColor={getScoreColor(record.totalAverage)}
          />
        </div>
      ),
      width: 120,
      sorter: (a, b) => a.totalAverage - b.totalAverage,
    },
    {
      title: "Dimensi ARCS",
      key: "dimensions",
      render: (_, record) => (
        <Space size="small" wrap>
          <Tag color="blue" style={{ margin: 2 }}>
            A: {record.dimensionAverages.attention?.toFixed(1) || "0.0"}
          </Tag>
          <Tag color="green" style={{ margin: 2 }}>
            R: {record.dimensionAverages.relevance?.toFixed(1) || "0.0"}
          </Tag>
          <Tag color="orange" style={{ margin: 2 }}>
            C: {record.dimensionAverages.confidence?.toFixed(1) || "0.0"}
          </Tag>
          <Tag color="purple" style={{ margin: 2 }}>
            S: {record.dimensionAverages.satisfaction?.toFixed(1) || "0.0"}
          </Tag>
        </Space>
      ),
      width: isMobile ? 160 : 200,
    },
    {
      title: "Waktu",
      key: "time",
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div>
            📅 {new Date(record.submitted_at).toLocaleDateString("id-ID")}
          </div>
          <div>
            🕐{" "}
            {new Date(record.submitted_at).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      ),
      width: 100,
    },
    {
      title: "Aksi",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewDetail(record)}
        >
          Detail
        </Button>
      ),
      width: 80,
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Memuat data respons...</div>
      </div>
    );
  }

  if (!responses || responses.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Belum ada respons untuk kuesioner ini"
      />
    );
  }

  return (
    <div>
      {/* Summary Statistics */}
      <Card style={{ marginBottom: 16 }}>
        <Title level={4} style={{ marginBottom: 16 }}>
          📊 Ringkasan Dimensi ARCS
        </Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={6}>
            <Card
              size="small"
              style={{ textAlign: "center", backgroundColor: "#e6f7ff" }}
            >
              <div
                style={{ fontSize: 24, color: "#1890ff", fontWeight: "bold" }}
              >
                A
              </div>
              <div
                style={{
                  fontSize: isMobile ? 12 : 14,
                  color: "#666",
                }}
              >
                Attention (Perhatian)
              </div>
              <div
                style={{
                  fontSize: isMobile ? 16 : 18,
                  fontWeight: "bold",
                  color: getScoreColor(overallStats.attention),
                }}
              >
                {overallStats.attention.toFixed(1)}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card
              size="small"
              style={{ textAlign: "center", backgroundColor: "#f6ffed" }}
            >
              <div
                style={{ fontSize: 24, color: "#52c41a", fontWeight: "bold" }}
              >
                R
              </div>
              <div style={{ fontSize: isMobile ? 12 : 14, color: "#666" }}>
                Relevance (Relevansi)
              </div>
              <div
                style={{
                  fontSize: isMobile ? 16 : 18,
                  fontWeight: "bold",
                  color: getScoreColor(overallStats.relevance),
                }}
              >
                {overallStats.relevance.toFixed(1)}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card
              size="small"
              style={{ textAlign: "center", backgroundColor: "#fff7e6" }}
            >
              <div
                style={{ fontSize: 24, color: "#faad14", fontWeight: "bold" }}
              >
                C
              </div>
              <div style={{ fontSize: isMobile ? 12 : 14, color: "#666" }}>
                Confidence (Percaya Diri)
              </div>
              <div
                style={{
                  fontSize: isMobile ? 16 : 18,
                  fontWeight: "bold",
                  color: getScoreColor(overallStats.confidence),
                }}
              >
                {overallStats.confidence.toFixed(1)}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card
              size="small"
              style={{ textAlign: "center", backgroundColor: "#f9f0ff" }}
            >
              <div
                style={{ fontSize: 24, color: "#722ed1", fontWeight: "bold" }}
              >
                S
              </div>
              <div style={{ fontSize: isMobile ? 12 : 14, color: "#666" }}>
                Satisfaction (Kepuasan)
              </div>
              <div
                style={{
                  fontSize: isMobile ? 16 : 18,
                  fontWeight: "bold",
                  color: getScoreColor(overallStats.satisfaction),
                }}
              >
                {overallStats.satisfaction.toFixed(1)}
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Responses Table */}
      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>📋 Data Respons Kuesioner ({processedResponses.length})</span>
            <Space>
              <Button icon={<DownloadOutlined />} type="default">
                Export Excel
              </Button>
              <Button icon={<DownloadOutlined />} type="primary">
                Export PDF
              </Button>
            </Space>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={processedResponses}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} respons`,
          }}
          scroll={{ x: isMobile ? 800 : undefined }}
          size={isMobile ? "small" : "middle"}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`Detail Respons - ${
          selectedResponse?.student_name || "Unknown"
        }`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
        style={{ top: 20 }}
        centered
      >
        {selectedResponse && (
          <div>
            {/* Student Info */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Text strong>Nama:</Text>
                  <div>{selectedResponse.student_name || "Unknown"}</div>
                </Col>
                <Col span={8}>
                  <Text strong>Username:</Text>
                  <div>
                    {selectedResponse.student_username || "No username"}
                  </div>
                </Col>
                <Col span={8}>
                  <Text strong>Status:</Text>
                  <div>
                    <Tag
                      color={
                        selectedResponse.is_completed ? "success" : "warning"
                      }
                    >
                      {selectedResponse.is_completed
                        ? "Selesai"
                        : "Dalam Progress"}
                    </Tag>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Detailed Answers */}
            <div>
              <Title level={5}>Jawaban Detail</Title>
              {selectedResponse.answers &&
                selectedResponse.answers.map((answer, index) => (
                  <Card
                    key={answer.id || index}
                    size="small"
                    style={{ marginBottom: 8 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <Text strong>{index + 1}. </Text>
                        <Text>{answer.question_text}</Text>
                        <div style={{ marginTop: 4 }}>
                          <Tag color="blue" size="small">
                            Dimensi: {answer.dimension || "Unknown"}
                          </Tag>
                        </div>
                      </div>
                      <div style={{ textAlign: "center", marginLeft: 16 }}>
                        <Text strong>Nilai:</Text>
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: "bold",
                            color: getScoreColor(answer.likert_value || 0),
                          }}
                        >
                          {answer.likert_value || 0}/5
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ARCSResponsesViewer;
