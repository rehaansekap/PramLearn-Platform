import React from "react";
import { Row, Col, Card, Statistic } from "antd";
import {
  TrophyOutlined,
  FileTextOutlined,
  BarChartOutlined,
  StarOutlined,
} from "@ant-design/icons";

const GradeStats = ({ statistics, achievements, grades = [] }) => {
  // Konversi rata-rata ke skala 100 untuk sekolah
  const averageScore = statistics.average_grade || 0;

  // Hitung rata-rata dalam skala 0-100
  const getAverageDisplay = () => {
    if (averageScore === 0) return "0";
    // Jika sudah dalam skala 0-100, gunakan langsung
    if (averageScore <= 100) {
      return averageScore.toFixed(1);
    }
    // Jika dalam skala 0-4, konversi ke 0-100
    return ((averageScore / 4) * 100).toFixed(1);
  };

  const getHighestGrade = () => {
    if (!grades || grades.length === 0) return 0;
    return Math.max(...grades.map((g) => g.grade || 0));
  };

  const statsData = [
    {
      title: "Nilai Rata-rata",
      value: getAverageDisplay(),
      suffix: "/100",
      prefix: <TrophyOutlined style={{ color: "#1890ff" }} />,
      color: "#1890ff",
    },
    {
      title: "Total Tugas & Kuis",
      value: statistics.total_assessments || grades.length || 0,
      prefix: <FileTextOutlined style={{ color: "#52c41a" }} />,
      color: "#52c41a",
    },
    {
      title: "Nilai Tertinggi",
      value: getHighestGrade().toFixed(0),
      suffix: "/100",
      prefix: <BarChartOutlined style={{ color: "#faad14" }} />,
      color: "#faad14",
    },
    {
      title: "Prestasi Dicapai",
      value: achievements?.length || 0,
      prefix: <StarOutlined style={{ color: "#722ed1" }} />,
      color: "#722ed1",
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
      {statsData.map((stat, index) => (
        <Col key={index} xs={12} sm={6} md={6}>
          <Card
            style={{
              borderRadius: 12,
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              border: "1px solid #f0f0f0",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
            }}
            bodyStyle={{ padding: "20px 16px" }}
          >
            <Statistic
              title={
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#666",
                  }}
                >
                  {stat.title}
                </span>
              }
              value={stat.value}
              suffix={stat.suffix}
              prefix={stat.prefix}
              valueStyle={{
                color: stat.color,
                fontSize: 22,
                fontWeight: 700,
              }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default GradeStats;
