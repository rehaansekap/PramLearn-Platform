import React from "react";
import { Card, Row, Col, Statistic, Tag } from "antd";
import {
  TrophyOutlined,
  StarOutlined,
  BookOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

const GradeSummaryStats = ({
  averageGrade,
  gradeDistribution,
  totalGrades,
  isMobile,
}) => {
  if (isMobile) {
    return (
      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Row gutter={[8, 8]}>
          <Col span={12}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{ fontSize: 18, fontWeight: "bold", color: "#11418b" }}
              >
                {averageGrade.toFixed(1)}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>Rata-rata</div>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{ fontSize: 18, fontWeight: "bold", color: "#52c41a" }}
              >
                {totalGrades}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>Total Nilai</div>
            </div>
          </Col>
        </Row>
      </Card>
    );
  }

  return (
    <Card
      style={{
        marginBottom: 24,
        borderRadius: 16,
        background:
          "linear-gradient(135deg, #f6faff 0%, #e6f4ff 50%, #f0f7ff 100%)",
        border: "1px solid #d6e4ff",
      }}
    >
      <Row gutter={[24, 16]} align="middle">
        <Col xs={24} sm={6}>
          <div style={{ textAlign: "center", padding: "16px" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #11418b 0%, #1890ff 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <TrophyOutlined style={{ fontSize: 24, color: "white" }} />
            </div>
            <Statistic
              title="Rata-rata Nilai"
              value={averageGrade.toFixed(1)}
              valueStyle={{
                color: "#11418b",
                fontSize: 24,
                fontWeight: 700,
              }}
              suffix="/100"
            />
          </div>
        </Col>

        <Col xs={24} sm={18}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "#fff2e8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 8px",
                  }}
                >
                  <StarOutlined style={{ fontSize: 20, color: "#fa8c16" }} />
                </div>
                <div
                  style={{ fontSize: 18, fontWeight: "bold", color: "#fa8c16" }}
                >
                  {gradeDistribution.excellent}
                </div>
                <Tag color="gold" style={{ fontSize: 11, margin: 0 }}>
                  Sangat Baik (90-100)
                </Tag>
              </div>
            </Col>

            <Col xs={12} sm={6}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "#f6ffed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 8px",
                  }}
                >
                  <BookOutlined style={{ fontSize: 20, color: "#52c41a" }} />
                </div>
                <div
                  style={{ fontSize: 18, fontWeight: "bold", color: "#52c41a" }}
                >
                  {gradeDistribution.good}
                </div>
                <Tag color="green" style={{ fontSize: 11, margin: 0 }}>
                  Baik (80-89)
                </Tag>
              </div>
            </Col>

            <Col xs={12} sm={6}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "#fff7e6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 8px",
                  }}
                >
                  <BarChartOutlined
                    style={{ fontSize: 20, color: "#faad14" }}
                  />
                </div>
                <div
                  style={{ fontSize: 18, fontWeight: "bold", color: "#faad14" }}
                >
                  {gradeDistribution.fair}
                </div>
                <Tag color="orange" style={{ fontSize: 11, margin: 0 }}>
                  Cukup (60-79)
                </Tag>
              </div>
            </Col>

            <Col xs={12} sm={6}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "#fff2f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 8px",
                  }}
                >
                  <span style={{ fontSize: 20, color: "#ff4d4f" }}>📚</span>
                </div>
                <div
                  style={{ fontSize: 18, fontWeight: "bold", color: "#ff4d4f" }}
                >
                  {gradeDistribution.poor}
                </div>
                <Tag color="red" style={{ fontSize: 11, margin: 0 }}>
                  Perlu Perbaikan (&lt;60)
                </Tag>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

export default GradeSummaryStats;
