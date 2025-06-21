import React from "react";
import { Breadcrumb, Row, Col, Space, Tag, Typography, Button } from "antd";
import {
  HomeOutlined,
  FileTextOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const AssignmentSubmissionHeader = ({
  assignment,
  currentQuestionIndex,
  totalQuestions,
  timeRemaining,
  isOverdue,
  isMobile,
  onBack,
}) => (
  <>
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
              <FileTextOutlined />
              <span>Pengerjaan Tugas</span>
            </Space>
          ),
        },
      ]}
    />

    {/* Back Button */}
    <div style={{ marginBottom: 16 }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        style={{
          borderRadius: 8,
          fontWeight: 600,
        }}
      >
        Kembali ke Daftar Tugas
      </Button>
    </div>

    <div
      style={{
        background:
          "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
        borderRadius: 16,
        padding: isMobile ? "20px" : "24px",
        marginBottom: 24,
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
        <Col xs={24} md={16}>
          <Space direction="vertical" size="small">
            <Tag
              icon={<UserOutlined />}
              color="rgba(255, 255, 255, 0.2)"
              style={{
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                background: "rgba(255, 255, 255, 0.15)",
              }}
            >
              Tugas Individual
            </Tag>
            <Title
              level={isMobile ? 3 : 2}
              style={{ color: "white", margin: 0 }}
            >
              📝 {assignment.title}
            </Title>
            <Space>
              <Text style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                Soal {currentQuestionIndex + 1} dari {totalQuestions}
              </Text>
              <Text style={{ color: "rgba(255, 255, 255, 0.7)" }}>•</Text>
              <Text style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                Individual Assignment
              </Text>
            </Space>
          </Space>
        </Col>
        <Col
          xs={24}
          md={8}
          style={{
            textAlign: isMobile ? "left" : "right",
            marginTop: isMobile ? 16 : 0,
          }}
        >
          {!isOverdue && timeRemaining && (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                borderRadius: 12,
                padding: 16,
                backdropFilter: "blur(10px)",
                display: "inline-block",
              }}
            >
              <Space
                direction="vertical"
                size={4}
                style={{ textAlign: "center" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    justifyContent: "center",
                  }}
                >
                  <ClockCircleOutlined style={{ fontSize: 16 }} />
                  <Text
                    style={{
                      color: "white",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Deadline
                  </Text>
                </div>
                <Text style={{ color: "white", fontSize: 16, fontWeight: 700 }}>
                  {timeRemaining.text}
                </Text>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: 11,
                  }}
                >
                  {dayjs(assignment.due_date).format("DD MMM YYYY, HH:mm")}
                </Text>
              </Space>
            </div>
          )}
        </Col>
      </Row>
    </div>
  </>
);

export default AssignmentSubmissionHeader;
