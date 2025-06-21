import React from "react";
import { Breadcrumb, Row, Col, Space, Tag, Typography } from "antd";
import {
  HomeOutlined,
  FileTextOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import QuizTimer from "../QuizTimer";

const { Title, Text } = Typography;

const GroupQuizHeader = ({
  quiz,
  currentQuestionIndex,
  timeRemaining,
  onTimeUp,
}) => (
  <>
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
              <TeamOutlined />
              <span>Kuis Kelompok</span>
            </Space>
          ),
        },
      ]}
    /> */}

    <div
      style={{
        background:
          "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
        borderRadius: 16,
        padding: "24px",
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
              icon={<TeamOutlined />}
              color="rgba(255, 255, 255, 0.2)"
              style={{
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                background: "rgba(255, 255, 255, 0.15)",
              }}
            >
              Kuis Kelompok
            </Tag>
            <Title level={2} style={{ color: "white", margin: 0 }}>
              {quiz.title}
            </Title>
            <Space>
              <Text style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                Soal {currentQuestionIndex + 1} dari {quiz.questions.length}
              </Text>
              <Text style={{ color: "rgba(255, 255, 255, 0.7)" }}>•</Text>
              <Text style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                Kelompok: {quiz.group?.name}
              </Text>
            </Space>
          </Space>
        </Col>
        <Col
          xs={24}
          md={8}
          style={{
            textAlign: "right",
            marginTop: 16,
          }}
        >
          {timeRemaining !== null && (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                borderRadius: 12,
                padding: 16,
                backdropFilter: "blur(10px)",
                display: "inline-block",
              }}
            >
              <QuizTimer
                timeRemaining={timeRemaining}
                onTimeUp={onTimeUp}
                style={{ color: "white" }}
              />
            </div>
          )}
        </Col>
      </Row>
    </div>
  </>
);

export default GroupQuizHeader;
