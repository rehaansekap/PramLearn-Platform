import React from "react";
import { Card, Row, Col, Typography, Space, Statistic, Progress } from "antd";
import {
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
  BarChartOutlined,
  LineChartOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const TrendAnalysisCards = ({ trend, grades, isInsufficientData }) => {
  const getTrendIcon = () => {
    switch (trend.trend) {
      case "increasing":
        return <RiseOutlined style={{ color: "#52c41a", fontSize: 32 }} />;
      case "decreasing":
        return <FallOutlined style={{ color: "#ff4d4f", fontSize: 32 }} />;
      case "insufficient_data":
        return <BarChartOutlined style={{ color: "#faad14", fontSize: 32 }} />;
      default:
        return <MinusOutlined style={{ color: "#faad14", fontSize: 32 }} />;
    }
  };

  const getTrendColor = () => {
    switch (trend.trend) {
      case "increasing":
        return "#52c41a";
      case "decreasing":
        return "#ff4d4f";
      default:
        return "#faad14";
    }
  };

  const getTrendTitle = () => {
    if (isInsufficientData) return "Data Belum Cukup";
    switch (trend.trend) {
      case "increasing":
        return "Tren Meningkat";
      case "decreasing":
        return "Tren Menurun";
      default:
        return "Tren Stabil";
    }
  };

  const getConsistencyScore = () => {
    if (grades.length <= 1) return 100;
    const highest = Math.max(...grades.map((g) => g.grade || 0));
    const lowest = Math.min(...grades.map((g) => g.grade || 0));
    return 100 - ((highest - lowest) / highest) * 100;
  };

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {/* Trend Card */}
      <Col xs={24} md={8}>
        <Card
          style={{
            borderRadius: 16,
            textAlign: "center",
            background: isInsufficientData
              ? "linear-gradient(135deg, #fff7e6 0%, #fffbe6 100%)"
              : trend.trend === "increasing"
              ? "linear-gradient(135deg, #f6ffed 0%, #f0f9f0 100%)"
              : trend.trend === "decreasing"
              ? "linear-gradient(135deg, #fff2f0 0%, #fef1f0 100%)"
              : "linear-gradient(135deg, #fff7e6 0%, #fffbe6 100%)",
            border: `2px solid ${getTrendColor()}30`,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }} size={16}>
            <div style={{ marginTop: 8 }}>{getTrendIcon()}</div>
            <Title level={4} style={{ margin: 0, color: getTrendColor() }}>
              {getTrendTitle()}
            </Title>
            {!isInsufficientData ? (
              <>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Perubahan <strong>{trend.percentage}%</strong> dari periode
                  sebelumnya
                </Text>
                <div
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    padding: "8px 12px",
                    borderRadius: 8,
                    marginTop: 8,
                  }}
                >
                  <Text style={{ fontSize: 12, color: "#666" }}>
                    Periode lama: <strong>{trend.olderAvg}</strong> → Periode
                    baru: <strong>{trend.recentAvg}</strong>
                  </Text>
                </div>
              </>
            ) : (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Minimal 10 nilai diperlukan untuk analisis tren
              </Text>
            )}
          </Space>
        </Card>
      </Col>

      {/* Consistency Card */}
      <Col xs={24} md={8}>
        <Card
          style={{
            borderRadius: 16,
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <Statistic
            title={
              <span style={{ color: "#722ed1", fontWeight: 500 }}>
                Konsistensi Performa
              </span>
            }
            value={getConsistencyScore().toFixed(1)}
            suffix="%"
            prefix={<LineChartOutlined style={{ color: "#722ed1" }} />}
            valueStyle={{ color: "#722ed1", fontSize: 24, fontWeight: 700 }}
          />
          <Progress
            percent={getConsistencyScore()}
            strokeColor={{
              "0%": "#722ed1",
              "100%": "#b37feb",
            }}
            showInfo={false}
            strokeWidth={8}
            style={{ marginTop: 12 }}
          />
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Semakin tinggi semakin konsisten
            </Text>
          </div>
        </Card>
      </Col>

      {/* Best Score Card */}
      <Col xs={24} md={8}>
        <Card
          style={{
            borderRadius: 16,
            textAlign: "center",
            background: "linear-gradient(135deg, #fff8e1 0%, #fffde7 100%)",
            border: "2px solid #faad1430",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <Statistic
            title={
              <span style={{ color: "#faad14", fontWeight: 500 }}>
                Nilai Tertinggi
              </span>
            }
            value={Math.max(...grades.map((g) => g.grade || 0)).toFixed(1)}
            prefix={<TrophyOutlined style={{ color: "#faad14" }} />}
            valueStyle={{ color: "#faad14", fontSize: 24, fontWeight: 700 }}
          />
          <div
            style={{
              marginTop: 12,
              background: "rgba(255,255,255,0.7)",
              padding: "8px 12px",
              borderRadius: 8,
            }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              Terendah:{" "}
              <strong>
                {Math.min(...grades.map((g) => g.grade || 0)).toFixed(1)}
              </strong>
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Rentang:{" "}
              <strong>
                {(
                  Math.max(...grades.map((g) => g.grade || 0)) -
                  Math.min(...grades.map((g) => g.grade || 0))
                ).toFixed(1)}
              </strong>{" "}
              poin
            </Text>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default TrendAnalysisCards;
