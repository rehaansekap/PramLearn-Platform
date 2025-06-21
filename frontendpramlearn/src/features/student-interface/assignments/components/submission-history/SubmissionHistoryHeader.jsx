import React from "react";
import { Typography, Space, Button, Breadcrumb } from "antd";
import {
  HomeOutlined,
  FileTextOutlined,
  HistoryOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const SubmissionHistoryHeader = ({
  assignment,
  latestSubmission,
  isMobile,
}) => {
  const navigate = useNavigate();

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
            href: "/student/assignments",
            title: (
              <Space>
                <FileTextOutlined />
                <span>Tugas</span>
              </Space>
            ),
          },
          {
            title: (
              <Space>
                <HistoryOutlined />
                <span>Riwayat Pengumpulan</span>
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
          padding: isMobile ? "24px 16px" : "32px 24px",
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
        <div style={{ position: "relative", zIndex: 1 }}>
          <Space direction="vertical" size={4}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/student/assignments")}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                borderColor: "rgba(255, 255, 255, 0.3)",
                color: "white",
                backdropFilter: "blur(10px)",
              }}
            >
              Kembali ke Tugas
            </Button>
            <Title
              level={isMobile ? 3 : 2}
              style={{ color: "white", margin: 0, marginBottom: 8 }}
            >
              📊 Hasil Tugas
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 16 }}>
              {assignment?.title || "Tugas"}
            </Text>
            <Text style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 14 }}>
              Diselesaikan pada:{" "}
              {latestSubmission
                ? dayjs(latestSubmission.submission_date).format(
                    "DD MMMM YYYY, HH:mm"
                  )
                : "Belum ada"}
            </Text>
          </Space>
        </div>
      </div>
    </>
  );
};

export default SubmissionHistoryHeader;
