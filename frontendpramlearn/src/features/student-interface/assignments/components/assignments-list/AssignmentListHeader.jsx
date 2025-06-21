import React from "react";
import { Typography, Row, Col, Breadcrumb, Space } from "antd";
import { HomeOutlined, FileTextOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const AssignmentListHeader = ({ totalAssignments }) => {
  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 24 }}
        items={[
          {
            href: "/student",
            title: (
              <Space>
                <HomeOutlined />
                <span>Beranda</span>
              </Space>
            ),
          },
          {
            title: (
              <Space>
                <FileTextOutlined />
                <span>Tugas</span>
              </Space>
            ),
          },
        ]}
      />

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

        <Row align="middle" style={{ position: "relative", zIndex: 1 }}>
          <Col xs={24} md={18}>
            <Title
              level={2}
              style={{ color: "white", margin: 0, marginBottom: 8 }}
            >
              📝 Tugas Saya
            </Title>
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: 16,
                display: "block",
                marginBottom: 4,
              }}
            >
              Kerjakan tugas untuk mengasah kemampuan Anda
            </Text>
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: 14,
              }}
            >
              Total {totalAssignments} tugas tersedia
            </Text>
          </Col>
          <Col xs={24} md={6} style={{ marginTop: 16, textAlign: "center" }}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                borderRadius: 12,
                padding: 16,
                backdropFilter: "blur(10px)",
              }}
            >
              <FileTextOutlined style={{ fontSize: 32, marginBottom: 8 }} />
              <div style={{ fontSize: 14, opacity: 0.9 }}>Pusat Tugas</div>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default AssignmentListHeader;
