import React from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Typography,
  Alert,
  Empty,
  Spin,
  Tag,
  Divider,
  Space,
} from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const { Title, Text } = Typography;

const ARCSAnalyticsDashboard = ({
  questionnaire,
  analytics,
  loading,
  isMobile = false,
}) => {
  if (!analytics && !loading) {
    return (
      <Alert
        message="Tidak Ada Data Analitik"
        description="Belum ada data respons untuk dianalisis"
        type="info"
        showIcon
        style={{ borderRadius: 12 }}
      />
    );
  }

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
          borderRadius: 16,
        }}
      >
        <Spin size="large" />
        <div style={{ marginTop: 16, color: "#666" }}>
          Memuat data analitik...
        </div>
      </div>
    );
  }

  const dimensionStats = analytics?.dimension_statistics || {};
  const overallStats = analytics?.overall_statistics || {};

  console.log("Analytics data:", analytics); // Debug log

  // Colors for ARCS dimensions
  const dimensionColors = {
    attention: "#1890ff",
    relevance: "#52c41a",
    confidence: "#faad14",
    satisfaction: "#722ed1",
  };

  // Prepare data for charts
  const dimensionData = Object.entries(dimensionStats).map(
    ([dimension, stats]) => ({
      dimension: dimension.charAt(0).toUpperCase() + dimension.slice(1),
      score: stats.average_score || 0,
      responses: stats.total_responses || 0,
      questions: stats.questions_count || 0,
      color: dimensionColors[dimension],
    })
  );

  const radarData = dimensionData.map((item) => ({
    dimension: item.dimension,
    score: item.score,
    fullMark: 5,
  }));

  // Distribution data
  const distributionData = Object.entries(dimensionStats).map(
    ([dimension, stats]) => ({
      name: dimension.charAt(0).toUpperCase() + dimension.slice(1),
      value: stats.total_responses || 0,
      color: dimensionColors[dimension],
    })
  );

  // Calculate overall statistics
  const totalResponses = Object.values(dimensionStats).reduce(
    (sum, stats) => sum + (stats.total_responses || 0),
    0
  );

  const averageScore =
    dimensionData.length > 0
      ? dimensionData.reduce((sum, item) => sum + item.score, 0) /
        dimensionData.length
      : 0;

  const highestDimension = dimensionData.reduce(
    (prev, current) => (prev.score > current.score ? prev : current),
    { dimension: "N/A", score: 0 }
  );

  const lowestDimension = dimensionData.reduce(
    (prev, current) => (prev.score < current.score ? prev : current),
    { dimension: "N/A", score: 5 }
  );

  return (
    <div>
      {/* Header */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 16,
          background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
          border: "1px solid #fbbf24",
        }}
        bodyStyle={{ padding: isMobile ? "16px" : "20px" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              borderRadius: "50%",
              width: isMobile ? 48 : 56,
              height: isMobile ? 48 : 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
            }}
          >
            <span style={{ fontSize: isMobile ? 20 : 24 }}>📊</span>
          </div>
          <div>
            <Title
              level={isMobile ? 5 : 4}
              style={{ margin: 0, color: "#92400e" }}
            >
              📈 Dashboard Analitik ARCS
            </Title>
            <Text style={{ color: "#b45309", fontSize: isMobile ? 12 : 14 }}>
              {questionnaire?.title || "Analisis Motivasi Pembelajaran"}
            </Text>
          </div>
        </div>
      </Card>

      {/* Overall Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              borderRadius: 12,
              textAlign: "center",
              background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
              height: "100%",
            }}
            bodyStyle={{ padding: isMobile ? "16px 8px" : "20px" }}
          >
            <Statistic
              title="Total Respons"
              value={totalResponses}
              valueStyle={{
                color: "#1e40af",
                fontSize: isMobile ? 16 : 20,
                fontWeight: "bold",
              }}
              prefix="📝"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              borderRadius: 12,
              textAlign: "center",
              background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
              height: "100%",
            }}
            bodyStyle={{ padding: isMobile ? "16px 8px" : "20px" }}
          >
            <Statistic
              title="Skor Rata-rata"
              value={averageScore}
              precision={2}
              suffix="/5.0"
              valueStyle={{
                color: "#15803d",
                fontSize: isMobile ? 16 : 20,
                fontWeight: "bold",
              }}
              prefix="⭐"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              borderRadius: 12,
              textAlign: "center",
              background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
              height: "100%",
            }}
            bodyStyle={{ padding: isMobile ? "16px 8px" : "20px" }}
          >
            <Statistic
              title="Kuesioner"
              value={questionnaire?.title || "ARCS"}
              valueStyle={{
                color: "#92400e",
                fontSize: isMobile ? 12 : 14,
                fontWeight: "bold",
              }}
              prefix="📋"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              borderRadius: 12,
              textAlign: "center",
              background: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)",
              height: "100%",
            }}
            bodyStyle={{ padding: isMobile ? "16px 8px" : "20px" }}
          >
            <Statistic
              title="Dimensi Tertinggi"
              value={highestDimension.dimension}
              valueStyle={{
                color: "#7c3aed",
                fontSize: isMobile ? 12 : 14,
                fontWeight: "bold",
              }}
              prefix="🏆"
            />
            <div style={{ marginTop: 4 }}>
              <Text
                style={{ fontSize: 14, color: "#7c3aed", fontWeight: "bold" }}
              >
                {highestDimension.score.toFixed(2)}/5.0
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        {/* Dimension Scores Bar Chart */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <span style={{ fontSize: 18 }}>📊</span>
                <span style={{ color: "#667eea", fontWeight: 600 }}>
                  Skor per Dimensi ARCS
                </span>
              </Space>
            }
            style={{ borderRadius: 16, height: isMobile ? 350 : 400 }}
            bodyStyle={{ padding: isMobile ? "16px" : "20px" }}
          >
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <BarChart
                data={dimensionData}
                margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="dimension"
                  fontSize={isMobile ? 10 : 12}
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? "end" : "middle"}
                  height={isMobile ? 60 : 40}
                  interval={0}
                />
                <YAxis fontSize={isMobile ? 10 : 12} domain={[0, 5]} />
                <Tooltip
                  formatter={(value, name) => [value.toFixed(2), "Skor"]}
                  labelStyle={{ color: "#666" }}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e6f7ff",
                    fontSize: isMobile ? 12 : 14,
                  }}
                />
                <Bar dataKey="score" fill="#667eea" radius={[4, 4, 0, 0]}>
                  {dimensionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Radar Chart */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <span style={{ fontSize: 18 }}>🎯</span>
                <span style={{ color: "#667eea", fontWeight: 600 }}>
                  Profil Motivasi ARCS
                </span>
              </Space>
            }
            style={{ borderRadius: 16, height: isMobile ? 350 : 400 }}
            bodyStyle={{ padding: isMobile ? "16px" : "20px" }}
          >
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <RadarChart
                data={radarData}
                margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
              >
                <PolarGrid />
                <PolarAngleAxis
                  dataKey="dimension"
                  fontSize={isMobile ? 10 : 12}
                  tick={{ fill: "#666" }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 5]}
                  fontSize={isMobile ? 8 : 10}
                  tick={{ fill: "#666" }}
                />
                <Radar
                  name="ARCS Score"
                  dataKey="score"
                  stroke="#667eea"
                  fill="#667eea"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip
                  formatter={(value) => [value.toFixed(2), "Skor"]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e6f7ff",
                    fontSize: isMobile ? 12 : 14,
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Response Distribution */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <span style={{ fontSize: 18 }}>🥧</span>
                <span style={{ color: "#667eea", fontWeight: 600 }}>
                  Distribusi Respons
                </span>
              </Space>
            }
            style={{ borderRadius: 16, height: isMobile ? 350 : 400 }}
            bodyStyle={{ padding: isMobile ? "16px" : "20px" }}
          >
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={isMobile ? 60 : 80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [value, "Respons"]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e6f7ff",
                    fontSize: isMobile ? 12 : 14,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Detailed Statistics - DIPERBAIKI */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <span style={{ fontSize: 18 }}>📋</span>
                <span style={{ color: "#667eea", fontWeight: 600 }}>
                  Statistik Detail
                </span>
              </Space>
            }
            style={{ borderRadius: 16, height: isMobile ? 350 : 400 }}
            bodyStyle={{ padding: isMobile ? "16px" : "20px" }}
          >
            <div
              style={{
                height: isMobile ? 250 : 300,
                overflowY: "auto",
                paddingRight: 8,
              }}
            >
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="middle"
              >
                {Object.entries(dimensionStats).map(([dimension, stats]) => (
                  <Card
                    key={dimension}
                    size="small"
                    style={{
                      background: `${dimensionColors[dimension]}08`,
                      border: `1px solid ${dimensionColors[dimension]}20`,
                      borderRadius: 8,
                    }}
                    bodyStyle={{ padding: "12px" }}
                  >
                    <Row align="middle" justify="space-between">
                      <Col flex="auto">
                        <div style={{ marginBottom: 8 }}>
                          <Space align="center">
                            <Tag
                              color={dimensionColors[dimension]}
                              style={{ margin: 0, fontWeight: 600 }}
                            >
                              {dimension.charAt(0).toUpperCase() +
                                dimension.slice(1)}
                            </Tag>
                            <Text
                              strong
                              style={{
                                color: dimensionColors[dimension],
                                fontSize: isMobile ? 14 : 16,
                              }}
                            >
                              {(stats.average_score || 0).toFixed(2)}/5.0
                            </Text>
                          </Space>
                        </div>

                        <Progress
                          percent={(stats.average_score || 0) * 20}
                          size="small"
                          strokeColor={dimensionColors[dimension]}
                          showInfo={false}
                          style={{ marginBottom: 8 }}
                        />

                        <Row gutter={[8, 4]}>
                          <Col xs={8}>
                            <Text style={{ fontSize: 11, color: "#666" }}>
                              <strong>Respons:</strong>{" "}
                              {stats.total_responses || 0}
                            </Text>
                          </Col>
                          <Col xs={8}>
                            <Text style={{ fontSize: 11, color: "#666" }}>
                              <strong>Soal:</strong>{" "}
                              {stats.questions_count || 0}
                            </Text>
                          </Col>
                          <Col xs={8}>
                            <Text style={{ fontSize: 11, color: "#666" }}>
                              <strong>Rata-rata:</strong>{" "}
                              {((stats.average_score || 0) * 20).toFixed(0)}%
                            </Text>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Insights & Recommendations - DIPERBAIKI */}
      <Card
        title={
          <Space>
            <span style={{ fontSize: 18 }}>💡</span>
            <span style={{ color: "#667eea", fontWeight: 600 }}>
              Insights & Rekomendasi
            </span>
          </Space>
        }
        style={{ marginTop: 24, borderRadius: 16 }}
        bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Alert
              message={
                <Space>
                  <span>🏆</span>
                  <span>
                    <strong>Dimensi Terkuat</strong>
                  </span>
                </Space>
              }
              description={
                <div style={{ marginTop: 8 }}>
                  <Space direction="vertical" size="small">
                    <div>
                      <Tag
                        color={
                          dimensionColors[
                            highestDimension.dimension.toLowerCase()
                          ]
                        }
                      >
                        {highestDimension.dimension}
                      </Tag>
                      <Text>memiliki skor tertinggi</Text>
                    </div>
                    <div>
                      <Text strong style={{ color: "#52c41a", fontSize: 16 }}>
                        {highestDimension.score.toFixed(2)}/5.0
                      </Text>
                      <Text style={{ marginLeft: 8, color: "#666" }}>
                        ({((highestDimension.score / 5) * 100).toFixed(0)}%)
                      </Text>
                    </div>
                  </Space>
                </div>
              }
              type="success"
              showIcon={false}
              style={{ borderRadius: 8 }}
            />
          </Col>

          <Col xs={24} md={12}>
            <Alert
              message={
                <Space>
                  <span>📈</span>
                  <span>
                    <strong>Area Pengembangan</strong>
                  </span>
                </Space>
              }
              description={
                <div style={{ marginTop: 8 }}>
                  <Space direction="vertical" size="small">
                    <div>
                      <Tag
                        color={
                          dimensionColors[
                            lowestDimension.dimension.toLowerCase()
                          ]
                        }
                      >
                        {lowestDimension.dimension}
                      </Tag>
                      <Text>perlu perhatian lebih</Text>
                    </div>
                    <div>
                      <Text strong style={{ color: "#faad14", fontSize: 16 }}>
                        {lowestDimension.score.toFixed(2)}/5.0
                      </Text>
                      <Text style={{ marginLeft: 8, color: "#666" }}>
                        ({((lowestDimension.score / 5) * 100).toFixed(0)}%)
                      </Text>
                    </div>
                  </Space>
                </div>
              }
              type="warning"
              showIcon={false}
              style={{ borderRadius: 8 }}
            />
          </Col>
        </Row>

        <Divider />

        {/* Summary Statistics */}
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Title level={5} style={{ color: "#667eea", marginBottom: 16 }}>
              📊 Ringkasan Analisis
            </Title>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              size="small"
              style={{ textAlign: "center", background: "#f6ffed" }}
            >
              <Statistic
                title="Total Dimensi"
                value={Object.keys(dimensionStats).length}
                valueStyle={{ color: "#52c41a" }}
                prefix="🎯"
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              size="small"
              style={{ textAlign: "center", background: "#f0f7ff" }}
            >
              <Statistic
                title="Partisipasi"
                value={totalResponses > 0 ? "Aktif" : "Tidak Ada"}
                valueStyle={{
                  color: totalResponses > 0 ? "#1890ff" : "#ff4d4f",
                }}
                prefix="📈"
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              size="small"
              style={{ textAlign: "center", background: "#fff7e6" }}
            >
              <Statistic
                title="Status Analisis"
                value={totalResponses > 0 ? "Lengkap" : "Menunggu"}
                valueStyle={{
                  color: totalResponses > 0 ? "#faad14" : "#bfbfbf",
                }}
                prefix="✅"
              />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ARCSAnalyticsDashboard;
