import React from "react";
import { Card, Row, Col, Typography, Space, Tag } from "antd";

const { Title, Text } = Typography;

const AssignmentSummaryCard = ({ assignment, assignmentTitle, submission }) => (
  <Card
    style={{
      marginBottom: 24,
      marginTop: 16,
      borderRadius: 12,
      background:
        "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
    }}
  >
    <div style={{ color: "white" }}>
      <Row gutter={[24, 16]} align="middle">
        <Col xs={24} md={16}>
          <Space direction="vertical" size="small">
            <Title level={4} style={{ color: "white", margin: 0 }}>
              🎯 Ringkasan Pencapaian
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.9)" }}>
              Assignment "{assignment?.title || assignmentTitle}" telah
              diselesaikan dengan baik
            </Text>
            <div style={{ marginTop: 12 }}>
              <Space wrap>
                <Tag
                  color={
                    submission?.final_score >= 85
                      ? "success"
                      : submission?.final_score >= 70
                      ? "warning"
                      : "error"
                  }
                  style={{ fontWeight: "bold" }}
                >
                  {submission?.final_score >= 85
                    ? "🌟 Sangat Baik"
                    : submission?.final_score >= 70
                    ? "👍 Baik"
                    : "📚 Perlu Perbaikan"}
                </Tag>
                <Tag color="blue">
                  {assignment?.subject_name || "Mata Pelajaran"}
                </Tag>
              </Space>
            </div>
          </Space>
        </Col>
        <Col xs={24} md={8}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 32,
                fontWeight: "bold",
                marginBottom: 8,
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              {submission?.final_score?.toFixed(0) || "0"}
            </div>
            <div
              style={{
                fontSize: 14,
                opacity: 0.9,
                textShadow: "0 1px 2px rgba(0,0,0,0.3)",
              }}
            >
              dari 100 poin
            </div>
          </div>
        </Col>
      </Row>
    </div>
  </Card>
);

export default AssignmentSummaryCard;
