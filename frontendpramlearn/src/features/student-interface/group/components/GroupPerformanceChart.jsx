import React from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Typography,
  Space,
  Tag,
  Tooltip,
} from "antd";
import {
  LineChartOutlined,
  ArrowUpOutlined,
  TeamOutlined,
  FireOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

const GroupPerformanceChart = ({ performance, loading }) => {
  if (loading) {
    return (
      <Card loading title="📊 Performa Kelompok">
        <div style={{ height: 200 }} />
      </Card>
    );
  }

  if (!performance) {
    return (
      <Card title="📊 Performa Kelompok">
        <Text type="secondary">Data performa tidak tersedia</Text>
      </Card>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 90) return "#52c41a";
    if (score >= 80) return "#faad14";
    if (score >= 70) return "#ff7a45";
    return "#ff4d4f";
  };

  const getTrendIcon = (rate) => {
    if (rate > 0) return "📈";
    if (rate < 0) return "📉";
    return "📊";
  };

  const getTrendColor = (rate) => {
    if (rate > 0) return "#52c41a";
    if (rate < 0) return "#ff4d4f";
    return "#1890ff";
  };

  return (
    <Card
      title={
        <Space>
          <LineChartOutlined style={{ color: "#1890ff" }} />
          <span>📊 Performa Kelompok</span>
        </Space>
      }
    >
      {/* Key Performance Indicators */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: "center" }}>
            <Statistic
              title="Skor Kolaborasi"
              value={performance.collaboration_score}
              suffix="/100"
              valueStyle={{
                color: getScoreColor(performance.collaboration_score),
              }}
              prefix={<TeamOutlined />}
            />
            <Progress
              percent={performance.collaboration_score}
              size="small"
              strokeColor={getScoreColor(performance.collaboration_score)}
              showInfo={false}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: "center" }}>
            <Statistic
              title="Konsistensi"
              value={performance.consistency_score}
              suffix="/100"
              valueStyle={{
                color: getScoreColor(performance.consistency_score),
              }}
              prefix={<FireOutlined />}
            />
            <Progress
              percent={performance.consistency_score}
              size="small"
              strokeColor={getScoreColor(performance.consistency_score)}
              showInfo={false}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: "center" }}>
            <Statistic
              title="Tingkat Peningkatan"
              value={performance.improvement_rate}
              suffix="%"
              valueStyle={{
                color: getTrendColor(performance.improvement_rate),
              }}
              prefix={getTrendIcon(performance.improvement_rate)}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: "center" }}>
            <div style={{ padding: "8px 0" }}>
              <Text strong style={{ display: "block", marginBottom: 8 }}>
                Status Kelompok
              </Text>
              <Tag
                color={getScoreColor(performance.collaboration_score)}
                style={{ fontSize: 12, padding: "4px 8px" }}
              >
                {performance.collaboration_score >= 90
                  ? "🔥 Excellent"
                  : performance.collaboration_score >= 80
                  ? "⭐ Good"
                  : performance.collaboration_score >= 70
                  ? "👍 Average"
                  : "💪 Needs Improvement"}
              </Tag>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Weekly Progress Chart (Simple representation) */}
      <Card
        size="small"
        title="📈 Progress Mingguan"
        style={{ marginBottom: 16 }}
      >
        <div style={{ padding: "16px 0" }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            {performance.weekly_progress?.map((week, index) => (
              <div key={index} style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <Text strong>{week.week}</Text>
                  <Space>
                    <Text style={{ color: getScoreColor(week.score) }}>
                      {week.score.toFixed(1)}
                    </Text>
                    <Tag color="blue" size="small">
                      {week.activities} aktivitas
                    </Tag>
                  </Space>
                </div>
                <Progress
                  percent={week.score}
                  strokeColor={getScoreColor(week.score)}
                  size="small"
                  style={{ marginBottom: 4 }}
                />
                <div style={{ height: 4 }} />
              </div>
            ))}
          </Space>
        </div>
      </Card>

      {/* Performance Insights */}
      <Card size="small" title="💡 Insight Performa">
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <Text strong style={{ color: "#1890ff" }}>
              🎯 Kekuatan:
            </Text>
            <Text style={{ marginLeft: 8 }}>
              {performance.collaboration_score >= 80
                ? "Kolaborasi tim yang sangat baik"
                : "Tim menunjukkan potensi berkembang"}
            </Text>
          </div>

          <div>
            <Text strong style={{ color: "#faad14" }}>
              📊 Tren:
            </Text>
            <Text style={{ marginLeft: 8 }}>
              {performance.improvement_rate > 0
                ? `Performa meningkat ${performance.improvement_rate.toFixed(
                    1
                  )}%`
                : performance.improvement_rate < 0
                ? `Performa menurun ${Math.abs(
                    performance.improvement_rate
                  ).toFixed(1)}%`
                : "Performa stabil"}
            </Text>
          </div>

          <div>
            <Text strong style={{ color: "#52c41a" }}>
              🎯 Rekomendasi:
            </Text>
            <Text style={{ marginLeft: 8 }}>
              {performance.consistency_score < 70
                ? "Tingkatkan konsistensi belajar kelompok"
                : performance.collaboration_score < 80
                ? "Optimalkan kolaborasi antar anggota"
                : "Pertahankan performa yang excellent!"}
            </Text>
          </div>
        </Space>
      </Card>
    </Card>
  );
};

export default GroupPerformanceChart;
