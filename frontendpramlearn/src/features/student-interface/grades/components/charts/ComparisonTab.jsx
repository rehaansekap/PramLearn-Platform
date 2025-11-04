import React from "react";
import { Card, Typography, Row, Col, Progress } from "antd";
import { BookOutlined, FileTextOutlined } from "@ant-design/icons";

const { Title } = Typography;

const ComparisonTab = ({
  quizAvg,
  assignmentAvg,
  quizGrades,
  assignmentGrades,
}) => {
  return (
    <div style={{ padding: "0 24px 24px" }}>
      <Title level={4} style={{ marginBottom: 24, color: "#11418b" }}>
        ⚖️ Perbandingan Performa Kuis vs Tugas
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card
            size="small"
            style={{
              textAlign: "center",
              borderRadius: 16,
              background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
              color: "white",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative elements */}
            <div
              style={{
                position: "absolute",
                top: -15,
                right: -15,
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.1)",
              }}
            />

            <BookOutlined
              style={{
                fontSize: 36,
                marginBottom: 16,
                position: "relative",
                zIndex: 1,
              }}
            />
            <div style={{ fontSize: 28, fontWeight: "bold", marginBottom: 12 }}>
              {quizAvg.toFixed(1)}
            </div>
            <div style={{ fontSize: 18, marginBottom: 16, fontWeight: 500 }}>
              Rata-rata Kuis
            </div>
            <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 16 }}>
              Dari {quizGrades.length} kuis yang sudah dikerjakan
            </div>
            <Progress
              percent={quizAvg}
              strokeColor="rgba(255,255,255,0.8)"
              trailColor="rgba(255,255,255,0.2)"
              showInfo={false}
              strokeWidth={8}
            />
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            size="small"
            style={{
              textAlign: "center",
              borderRadius: 16,
              background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
              color: "white",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative elements */}
            <div
              style={{
                position: "absolute",
                top: -15,
                right: -15,
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.1)",
              }}
            />

            <FileTextOutlined
              style={{
                fontSize: 36,
                marginBottom: 16,
                position: "relative",
                zIndex: 1,
              }}
            />
            <div style={{ fontSize: 28, fontWeight: "bold", marginBottom: 12 }}>
              {assignmentAvg.toFixed(1)}
            </div>
            <div style={{ fontSize: 18, marginBottom: 16, fontWeight: 500 }}>
              Rata-rata Tugas
            </div>
            <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 16 }}>
              Dari {assignmentGrades.length} tugas yang sudah dikerjakan
            </div>
            <Progress
              percent={assignmentAvg}
              strokeColor="rgba(255,255,255,0.8)"
              trailColor="rgba(255,255,255,0.2)"
              showInfo={false}
              strokeWidth={8}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ComparisonTab;
