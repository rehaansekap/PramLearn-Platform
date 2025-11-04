import React from "react";
import { Button, Typography, Breadcrumb, Space } from "antd";
import {
  ArrowLeftOutlined,
  HomeOutlined,
  FileTextOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const GroupQuizHeader = ({ results, onBack }) => {
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
                <span>Beranda</span>
              </Space>
            ),
          },
          {
            href: "/student/assessments",
            title: (
              <Space>
                <FileTextOutlined />
                <span>Penilaian</span>
              </Space>
            ),
          },
          {
            title: (
              <Space>
                <TrophyOutlined />
                <span>Hasil Kuis Kelompok</span>
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
        {/* Background Pattern */}
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

        <div style={{ position: "relative", zIndex: 1 }}>
          <Space direction="vertical" size="small">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                borderColor: "rgba(255, 255, 255, 0.3)",
                color: "white",
                backdropFilter: "blur(10px)",
              }}
            >
              Kembali ke Penilaian
            </Button>
            <Title
              level={2}
              style={{ color: "white", margin: 0, marginBottom: 8 }}
            >
              🏆 Hasil Kuis Kelompok: {results?.title || "Kuis"}
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 16 }}>
              Diselesaikan pada:{" "}
              {dayjs(results.submitted_at).format("DD MMMM YYYY, HH:mm")}
            </Text>
          </Space>
        </div>
      </div>
    </>
  );
};

export default GroupQuizHeader;
