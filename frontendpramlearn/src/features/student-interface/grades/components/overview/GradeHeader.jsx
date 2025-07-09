import React from "react";
import { Breadcrumb, Space, Row, Col, Typography } from "antd";
import {
  TrophyOutlined,
  HomeOutlined,
  BarChartOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const GradeHeader = ({ statistics, totalGrades }) => {
  return (
    <>
      {/* Breadcrumb */}
      {/* <Breadcrumb
        style={{ marginBottom: 24 }}
        items={[
          {
            href: "/student",
            title: (
              <Space>
                <HomeOutlined />
                <span>Dashboard</span>
              </Space>
            ),
          },
          {
            title: (
              <Space>
                <TrophyOutlined />
                <span>Nilai Saya</span>
              </Space>
            ),
          },
        ]}
      /> */}

      {/* Header Section */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
          borderRadius: 16,
          padding: "32px 24px",
          marginBottom: 32,
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative Elements */}
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.05)",
          }}
        />

        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={16}>
            <Title
              level={2}
              style={{ color: "white", margin: 0, marginBottom: 12 }}
            >
              <TrophyOutlined style={{ marginRight: 12 }} />
              Nilai & Prestasi Saya
            </Title>

            <Space size={16} style={{ marginBottom: 16, flexWrap: "wrap" }}>
              <Space size={8}>
                <CalendarOutlined />
                <Text style={{ color: "rgba(255,255,255,0.9)" }}>
                  Total Penilaian: <strong>{totalGrades || 0}</strong>
                </Text>
              </Space>
              <Space size={8}>
                <BarChartOutlined />
                <Text style={{ color: "rgba(255,255,255,0.9)" }}>
                  Rata-rata:{" "}
                  <strong>{(statistics.average_grade || 0).toFixed(1)}</strong>
                </Text>
              </Space>
            </Space>
          </Col>

          <Col xs={24} md={8} style={{ textAlign: "center" }}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                borderRadius: 12,
                padding: 16,
                backdropFilter: "blur(10px)",
              }}
            >
              <TrophyOutlined style={{ fontSize: 32, marginBottom: 8 }} />
              <div style={{ fontSize: 14, opacity: 0.9 }}>
                Pelacakan Prestasi
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default GradeHeader;
