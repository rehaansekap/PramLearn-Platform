import React from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Progress,
  Statistic,
  Empty,
  Tag,
  Alert,
} from "antd";
import {
  BarChartOutlined,
  TrophyOutlined,
  UserOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const ARCSAnalyticsDashboard = ({
  questionnaire,
  analytics,
  loading,
  isMobile,
}) => {
  if (!analytics && !loading) {
    return (
      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text>Belum ada data analisis.</Text>
              <br />
              <Text type="secondary">
                Analisis akan muncul setelah ada respons yang selesai.
              </Text>
            </div>
          }
        />
      </Card>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <BarChartOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
        <p style={{ marginTop: 16, color: "#666" }}>Memuat analisis data...</p>
      </div>
    );
  }

  const dimensionStats = analytics?.dimension_statistics || {};
  const overallAverage =
    Object.values(dimensionStats).length > 0
      ? Object.values(dimensionStats).reduce(
          (sum, stat) => sum + stat.average_score,
          0
        ) / Object.values(dimensionStats).length
      : 0;

  const getScoreColor = (score) => {
    if (score >= 4) return "#52c41a"; // Green
    if (score >= 3) return "#faad14"; // Orange
    if (score >= 2) return "#ff7a45"; // Red-orange
    return "#ff4d4f"; // Red
  };

  const getScoreLevel = (score) => {
    if (score >= 4) return "Tinggi";
    if (score >= 3) return "Sedang";
    if (score >= 2) return "Rendah";
    return "Sangat Rendah";
  };

  const dimensionLabels = {
    attention: "Attention (Perhatian)",
    relevance: "Relevance (Relevansi)",
    confidence: "Confidence (Percaya Diri)",
    satisfaction: "Satisfaction (Kepuasan)",
  };

  const dimensionDescriptions = {
    attention:
      "Kemampuan materi untuk menarik dan mempertahankan perhatian siswa",
    relevance: "Kesesuaian materi dengan kebutuhan dan tujuan belajar siswa",
    confidence: "Tingkat keyakinan siswa dalam menguasai materi pembelajaran",
    satisfaction: "Kepuasan siswa terhadap proses dan hasil pembelajaran",
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <Title level={5} style={{ color: "#11418b", marginBottom: 8 }}>
          Analisis Hasil Kuesioner ARCS
        </Title>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {questionnaire.title} -{" "}
          {questionnaire.questionnaire_type === "pre"
            ? "Pre-Assessment"
            : "Post-Assessment"}
        </Text>
      </div>

      {/* Overall Score */}
      <Card size="small" style={{ marginBottom: 24, textAlign: "center" }}>
        <Statistic
          title="Skor Motivasi Keseluruhan"
          value={overallAverage}
          precision={2}
          suffix="/ 5"
          valueStyle={{
            color: getScoreColor(overallAverage),
            fontSize: isMobile ? 24 : 32,
            fontWeight: "bold",
          }}
          prefix={<TrophyOutlined />}
        />
        <Tag
          color={getScoreColor(overallAverage)}
          style={{ marginTop: 8, fontSize: 12 }}
        >
          {getScoreLevel(overallAverage)}
        </Tag>
      </Card>

      {/* Dimension Analysis */}
      <Row gutter={[16, 16]}>
        {Object.entries(dimensionStats).map(([dimension, stats]) => (
          <Col xs={24} sm={12} key={dimension}>
            <Card
              size="small"
              title={
                <div style={{ fontSize: isMobile ? 12 : 14 }}>
                  <QuestionCircleOutlined style={{ marginRight: 8 }} />
                  {dimensionLabels[dimension]}
                </div>
              }
              style={{ height: "100%" }}
            >
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <Progress
                  type="circle"
                  percent={(stats.average_score / 5) * 100}
                  format={() => (
                    <div>
                      <div
                        style={{
                          fontSize: isMobile ? 16 : 20,
                          fontWeight: "bold",
                          color: getScoreColor(stats.average_score),
                        }}
                      >
                        {stats.average_score}
                      </div>
                      <div style={{ fontSize: 10, color: "#666" }}>/ 5</div>
                    </div>
                  )}
                  strokeColor={getScoreColor(stats.average_score)}
                  size={isMobile ? 80 : 100}
                />
                <div style={{ marginTop: 8 }}>
                  <Tag color={getScoreColor(stats.average_score)} size="small">
                    {getScoreLevel(stats.average_score)}
                  </Tag>
                </div>
              </div>

              <div style={{ fontSize: 11, color: "#666", textAlign: "center" }}>
                {dimensionDescriptions[dimension]}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 16,
                  fontSize: 11,
                  color: "#999",
                }}
              >
                <span>
                  <UserOutlined style={{ marginRight: 4 }} />
                  {stats.total_responses} respons
                </span>
                <span>
                  <QuestionCircleOutlined style={{ marginRight: 4 }} />
                  {stats.questions_count} pertanyaan
                </span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Insights */}
      <Card
        title="Insights & Rekomendasi"
        size="small"
        style={{ marginTop: 24 }}
      >
        <div style={{ fontSize: 13 }}>
          {overallAverage >= 4 ? (
            <Alert
              message="Motivasi Siswa Sangat Baik!"
              description="Hasil menunjukkan tingkat motivasi siswa sangat tinggi. Pertahankan strategi pembelajaran yang sudah efektif ini."
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />
          ) : overallAverage >= 3 ? (
            <Alert
              message="Motivasi Siswa Cukup Baik"
              description="Ada ruang untuk peningkatan pada beberapa dimensi. Fokus pada area dengan skor rendah."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          ) : (
            <Alert
              message="Perlu Perhatian Khusus"
              description="Tingkat motivasi siswa perlu ditingkatkan. Pertimbangkan untuk merevisi strategi pembelajaran."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <div>
            <Text strong style={{ fontSize: 12 }}>
              Rekomendasi berdasarkan hasil:
            </Text>
            <ul style={{ marginTop: 8, paddingLeft: 16, fontSize: 12 }}>
              {Object.entries(dimensionStats).map(([dimension, stats]) => {
                if (stats.average_score < 3) {
                  return (
                    <li key={dimension} style={{ marginBottom: 4 }}>
                      <Text>
                        <strong>{dimensionLabels[dimension]}:</strong> Perlu
                        perbaikan (skor: {stats.average_score}/5)
                      </Text>
                    </li>
                  );
                }
                return null;
              })}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ARCSAnalyticsDashboard;
