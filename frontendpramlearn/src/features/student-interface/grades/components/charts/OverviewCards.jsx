import React from "react";
import {
  Card,
  Row,
  Col,
  Progress,
  Typography,
  Space,
  Statistic,
  Tag,
} from "antd";
import {
  TrophyOutlined,
  BookOutlined,
  FileTextOutlined,
  BarChartOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import TrendCard from "./TrendCard";

const { Text } = Typography;

const OverviewCards = ({
  overallAvg,
  quizAvg,
  assignmentAvg,
  quizGrades,
  assignmentGrades,
  getGradeColor,
  trendData,
  grades,
  compact = false,
}) => {
  if (compact) {
    return (
      <>
        <Col xs={24} sm={12} md={8}>
          <Card
            style={{
              borderRadius: 12,
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: "1px solid #f0f0f0",
            }}
          >
            <Statistic
              title={
                <span style={{ fontSize: 13, fontWeight: 500, color: "#666" }}>
                  Rata-rata Keseluruhan
                </span>
              }
              value={overallAvg.toFixed(1)}
              prefix={
                <TrophyOutlined style={{ color: getGradeColor(overallAvg) }} />
              }
              valueStyle={{
                color: getGradeColor(overallAvg),
                fontSize: 24,
                fontWeight: 700,
              }}
            />
            <Progress
              percent={overallAvg}
              strokeColor={getGradeColor(overallAvg)}
              showInfo={false}
              style={{ marginTop: 12 }}
              strokeWidth={8}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            style={{
              borderRadius: 12,
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: "1px solid #f0f0f0",
            }}
          >
            <Statistic
              title={
                <span style={{ fontSize: 13, fontWeight: 500, color: "#666" }}>
                  Rata-rata Kuis
                </span>
              }
              value={quizAvg.toFixed(1)}
              prefix={
                <BookOutlined style={{ color: getGradeColor(quizAvg) }} />
              }
              valueStyle={{
                color: getGradeColor(quizAvg),
                fontSize: 22,
                fontWeight: 700,
              }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Dari {quizGrades.length} kuis
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            style={{
              borderRadius: 12,
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: "1px solid #f0f0f0",
            }}
          >
            <Statistic
              title={
                <span style={{ fontSize: 13, fontWeight: 500, color: "#666" }}>
                  Rata-rata Tugas
                </span>
              }
              value={assignmentAvg.toFixed(1)}
              prefix={
                <FileTextOutlined
                  style={{ color: getGradeColor(assignmentAvg) }}
                />
              }
              valueStyle={{
                color: getGradeColor(assignmentAvg),
                fontSize: 22,
                fontWeight: 700,
              }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Dari {assignmentGrades.length} tugas
              </Text>
            </div>
          </Card>
        </Col>
      </>
    );
  }

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
      <Col xs={24} sm={8}>
        <Card
          style={{
            borderRadius: 16,
            textAlign: "center",
            background:
              "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
            color: "white",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            border: "none",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative elements */}
          <div
            style={{
              position: "absolute",
              top: -20,
              right: -20,
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -30,
              left: -30,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.05)",
            }}
          />

          <div
            style={{
              color: "white",
              position: "relative",
              zIndex: 1,
              padding: "8px 0",
            }}
          >
            <TrophyOutlined style={{ fontSize: 32, marginBottom: 12 }} />
            <div style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
              {overallAvg.toFixed(1)}
            </div>
            <div style={{ fontSize: 16, opacity: 0.9, marginBottom: 16 }}>
              Rata-rata Keseluruhan
            </div>
            <Progress
              percent={overallAvg}
              strokeColor="rgba(255,255,255,0.8)"
              trailColor="rgba(255,255,255,0.2)"
              showInfo={false}
              strokeWidth={6}
            />
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={8}>
        <TrendCard trendData={trendData} />
      </Col>

      <Col xs={24} sm={8}>
        <Card
          style={{
            borderRadius: 16,
            textAlign: "center",
            height: "100%",
            justifyContent: "center",
            display: "flex",
            alignItems: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            border: "1px solid #f0f0f0",
          }}
        >
          <Statistic
            title={
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#666",
                }}
              >
                Total Assessment
              </span>
            }
            value={grades.length}
            prefix={<BarChartOutlined style={{ color: "#722ed1" }} />}
            valueStyle={{ color: "#722ed1", fontSize: 24, fontWeight: 700 }}
          />
          <div style={{ marginTop: 12 }}>
            <Space>
              <Tag
                color="blue"
                style={{
                  borderRadius: 6,
                  padding: "4px 12px",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                {quizGrades.length} Kuis
              </Tag>
              <Tag
                color="green"
                style={{
                  borderRadius: 6,
                  padding: "4px 12px",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                {assignmentGrades.length} Tugas
              </Tag>
            </Space>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default OverviewCards;
