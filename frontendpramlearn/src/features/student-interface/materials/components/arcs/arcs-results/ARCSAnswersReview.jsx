import React, { useState } from "react";
import {
  Card,
  List,
  Typography,
  Tag,
  Pagination,
  Space,
  Rate,
  Row,
  Col,
  Tabs,
} from "antd";
import {
  MessageOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  HeartOutlined,
  RocketOutlined,
  SmileOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const ARCSAnswersReview = ({ answers, questionnaire, isMobile }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const pageSize = isMobile ? 5 : 8;

  const getDimensionIcon = (dimension) => {
    const icons = {
      attention: <EyeOutlined />,
      relevance: <HeartOutlined />,
      confidence: <RocketOutlined />,
      satisfaction: <SmileOutlined />,
    };
    return icons[dimension] || <EyeOutlined />;
  };

  const getDimensionColor = (dimension) => {
    const colors = {
      attention: "#ff7875",
      relevance: "#73d13d",
      confidence: "#40a9ff",
      satisfaction: "#b37feb",
    };
    return colors[dimension] || "#1890ff";
  };

  const getDimensionName = (dimension) => {
    const names = {
      attention: "Attention",
      relevance: "Relevance",
      confidence: "Confidence",
      satisfaction: "Satisfaction",
    };
    return names[dimension] || dimension;
  };

  const getLikertText = (value) => {
    const texts = {
      1: isMobile ? "Sangat Tidak Setuju" : "Sangat Tidak Setuju",
      2: isMobile ? "Tidak Setuju" : "Tidak Setuju",
      3: "Netral",
      4: "Setuju",
      5: isMobile ? "Sangat Setuju" : "Sangat Setuju",
    };
    return texts[value] || "";
  };

  const getScoreColor = (score) => {
    if (score >= 4) return "#52c41a";
    if (score >= 3) return "#1890ff";
    if (score >= 2) return "#faad14";
    return "#ff4d4f";
  };

  // Group answers by dimension
  const answersByDimension = answers.reduce((acc, answer) => {
    const dim = answer.dimension;
    if (!acc[dim]) acc[dim] = [];
    acc[dim].push(answer);
    return acc;
  }, {});

  // Get filtered answers based on active tab
  const getFilteredAnswers = () => {
    if (activeTab === "all") return answers;
    return answersByDimension[activeTab] || [];
  };

  const filteredAnswers = getFilteredAnswers();
  const paginatedAnswers = filteredAnswers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Calculate statistics per dimension
  const dimensionStats = Object.entries(answersByDimension).map(
    ([dimension, dimAnswers]) => {
      const avgScore =
        dimAnswers.reduce((sum, ans) => sum + ans.answer_value, 0) /
        dimAnswers.length;
      return {
        dimension,
        count: dimAnswers.length,
        avgScore: avgScore.toFixed(1),
        color: getDimensionColor(dimension),
        icon: getDimensionIcon(dimension),
        name: getDimensionName(dimension),
      };
    }
  );

  const renderAnswerItem = (answer, index) => {
    const globalIndex =
      answers.findIndex((a) => a.question_id === answer.question_id) + 1;

    return (
      <List.Item
        key={answer.question_id}
        style={{ padding: 0, marginBottom: isMobile ? 12 : 16 }}
      >
        <Card
          size="small"
          style={{
            width: "100%",
            borderRadius: isMobile ? 12 : 16,
            border: `2px solid ${getDimensionColor(answer.dimension)}20`,
            background: `linear-gradient(135deg, ${getDimensionColor(
              answer.dimension
            )}08, #fff)`,
            transition: "all 0.3s ease",
          }}
          bodyStyle={{ padding: isMobile ? "16px" : "20px" }}
          hoverable
        >
          {/* Header */}
          <div style={{ marginBottom: isMobile ? 12 : 16 }}>
            <Row justify="space-between" align="middle" gutter={8}>
              <Col flex={1}>
                <Space size={isMobile ? "small" : "middle"} wrap>
                  <div
                    style={{
                      width: isMobile ? 20 : 28,
                      height: isMobile ? 20 : 28,
                      borderRadius: "50%",
                      background: getDimensionColor(answer.dimension),
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: isMobile ? 10 : 12,
                      fontWeight: 700,
                    }}
                  >
                    {globalIndex}
                  </div>
                  <div>
                    <Tag
                      color={getDimensionColor(answer.dimension)}
                      style={{
                        marginBottom: 4,
                        fontSize: isMobile ? 10 : 12,
                      }}
                    >
                      {getDimensionName(answer.dimension)}
                    </Tag>
                    <div>
                      <CheckCircleOutlined
                        style={{
                          color: "#52c41a",
                          marginRight: 4,
                          fontSize: isMobile ? 10 : 12,
                        }}
                      />
                      <Text
                        style={{
                          fontSize: isMobile ? 9 : 11,
                          color: "#666",
                        }}
                      >
                        Pertanyaan {answer.order}
                      </Text>
                    </div>
                  </div>
                </Space>
              </Col>
              <Col>
                <div
                  style={{
                    padding: isMobile ? "2px 6px" : "4px 8px",
                    borderRadius: isMobile ? 8 : 12,
                    background: `${getScoreColor(answer.answer_value)}15`,
                    color: getScoreColor(answer.answer_value),
                    fontSize: isMobile ? 9 : 11,
                    fontWeight: 600,
                  }}
                >
                  {answer.answer_value}/5
                </div>
              </Col>
            </Row>
          </div>

          {/* Question Text */}
          <div style={{ marginBottom: isMobile ? 12 : 16 }}>
            <Paragraph
              style={{
                margin: 0,
                fontSize: isMobile ? 12 : 14,
                fontWeight: 500,
                color: "#333",
                lineHeight: 1.5,
                background: "#fafafa",
                padding: isMobile ? "8px 12px" : "12px 16px",
                borderRadius: isMobile ? 8 : 12,
                border: "1px solid #f0f0f0",
              }}
            >
              "{answer.question_text}"
            </Paragraph>
          </div>

          {/* Answer Section */}
          <div
            style={{
              background: `${getDimensionColor(answer.dimension)}08`,
              padding: isMobile ? "12px" : "16px",
              borderRadius: isMobile ? 8 : 12,
              border: `1px solid ${getDimensionColor(answer.dimension)}20`,
            }}
          >
            <Text
              style={{
                fontSize: isMobile ? 10 : 12,
                color: "#666",
                display: "block",
                marginBottom: isMobile ? 8 : 12,
                fontWeight: 500,
              }}
            >
              💭 Jawaban Anda:
            </Text>

            {/* Likert Scale Answer */}
            <Row align="middle" justify="space-between" gutter={[8, 8]}>
              <Col xs={24} sm={16}>
                <Space align="center" wrap>
                  <Rate
                    disabled
                    count={5}
                    value={answer.answer_value}
                    style={{ fontSize: isMobile ? 14 : 18 }}
                  />
                  <Text
                    strong
                    style={{
                      color: getDimensionColor(answer.dimension),
                      fontSize: isMobile ? 14 : 16,
                    }}
                  >
                    {answer.answer_value}/5
                  </Text>
                </Space>
              </Col>
              <Col
                xs={24}
                sm={8}
                style={{ textAlign: isMobile ? "left" : "right" }}
              >
                <Tag
                  color={getScoreColor(answer.answer_value)}
                  style={{
                    fontSize: isMobile ? 10 : 12,
                    padding: isMobile ? "2px 8px" : "4px 12px",
                    fontWeight: 600,
                    borderRadius: isMobile ? 12 : 16,
                  }}
                >
                  {getLikertText(answer.answer_value)}
                </Tag>
              </Col>
            </Row>
          </div>
        </Card>
      </List.Item>
    );
  };

  return (
    <Card
      style={{
        marginBottom: 24,
        borderRadius: isMobile ? 16 : 20,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
      bodyStyle={{ padding: isMobile ? "20px 16px" : "32px" }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: isMobile ? 24 : 32 }}>
        <Space direction="vertical" size="small">
          <MessageOutlined
            style={{
              fontSize: isMobile ? 24 : 32,
              color: "#1890ff",
            }}
          />
          <Title
            level={isMobile ? 4 : 3}
            style={{
              margin: 0,
              color: "#1890ff",
              fontSize: isMobile ? 18 : undefined,
            }}
          >
            {isMobile ? "Review Jawaban Detail" : "Review Jawaban Detail"}
          </Title>
          <Text
            style={{
              color: "#666",
              fontSize: isMobile ? 14 : 16,
              textAlign: "center",
              display: "block",
              lineHeight: 1.4,
            }}
          >
            {isMobile
              ? "Semua jawaban yang telah Anda berikan"
              : "Lihat kembali semua jawaban yang telah Anda berikan"}
          </Text>
        </Space>
      </div>

      {/* Dimension Statistics Cards */}
      <div style={{ marginBottom: isMobile ? 20 : 24 }}>
        <Row gutter={[isMobile ? 8 : 16, isMobile ? 12 : 16]}>
          {dimensionStats.map((stat) => (
            <Col xs={12} sm={6} key={stat.dimension}>
              <Card
                size="small"
                style={{
                  textAlign: "center",
                  borderRadius: isMobile ? 8 : 12,
                  border: `1px solid ${stat.color}30`,
                  background: `${stat.color}08`,
                  height: "100%",
                }}
                bodyStyle={{ padding: isMobile ? "12px 8px" : "16px 12px" }}
              >
                <div style={{ marginBottom: isMobile ? 6 : 8 }}>
                  {React.cloneElement(stat.icon, {
                    style: {
                      fontSize: isMobile ? 16 : 20,
                      color: stat.color,
                    },
                  })}
                </div>
                <Text
                  strong
                  style={{
                    fontSize: isMobile ? 14 : 16,
                    color: stat.color,
                    display: "block",
                  }}
                >
                  {stat.avgScore}
                </Text>
                <Text
                  style={{
                    fontSize: isMobile ? 9 : 11,
                    color: "#666",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  {stat.name}
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Tag
                    size="small"
                    color={stat.color}
                    style={{
                      fontSize: isMobile ? 8 : 10,
                    }}
                  >
                    {stat.count} soal
                  </Tag>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Filter Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          setCurrentPage(1); // Reset to first page when changing tabs
        }}
        style={{ marginBottom: isMobile ? 16 : 24 }}
        tabBarStyle={{ marginBottom: isMobile ? 16 : 20 }}
        size={isMobile ? "small" : "default"}
      >
        <TabPane
          tab={
            <Space size={isMobile ? "small" : "middle"}>
              <MessageOutlined style={{ fontSize: isMobile ? 12 : 14 }} />
              <span style={{ fontSize: isMobile ? 12 : 14 }}>
                {isMobile
                  ? `Semua (${answers.length})`
                  : `Semua (${answers.length})`}
              </span>
            </Space>
          }
          key="all"
        />
        {Object.entries(answersByDimension).map(([dimension, dimAnswers]) => (
          <TabPane
            tab={
              <Space size={isMobile ? "small" : "middle"}>
                {getDimensionIcon(dimension)}
                <span style={{ fontSize: isMobile ? 12 : 14 }}>
                  {isMobile
                    ? `${getDimensionName(dimension)} (${dimAnswers.length})`
                    : `${getDimensionName(dimension)} (${dimAnswers.length})`}
                </span>
              </Space>
            }
            key={dimension}
          />
        ))}
      </Tabs>

      {/* Filter Info */}
      <div style={{ marginBottom: isMobile ? 16 : 20 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Text style={{ fontSize: isMobile ? 12 : 14, color: "#666" }}>
              Total {filteredAnswers.length} jawaban • Halaman {currentPage}{" "}
              dari {Math.ceil(filteredAnswers.length / pageSize)}
            </Text>
          </Col>
          <Col>
            <Space>
              <Text style={{ fontSize: isMobile ? 10 : 12, color: "#999" }}>
                Filter:{" "}
                {activeTab === "all"
                  ? "Semua Dimensi"
                  : getDimensionName(activeTab)}
              </Text>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Answers List */}
      <List
        dataSource={paginatedAnswers}
        renderItem={renderAnswerItem}
        style={{ marginBottom: isMobile ? 20 : 24 }}
      />

      {/* Pagination */}
      {filteredAnswers.length > pageSize && (
        <div style={{ textAlign: "center" }}>
          <Pagination
            current={currentPage}
            total={filteredAnswers.length}
            pageSize={pageSize}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
            showQuickJumper={!isMobile}
            showTotal={(total, range) =>
              isMobile
                ? `${range[0]}-${range[1]} dari ${total}`
                : `${range[0]}-${range[1]} dari ${total} jawaban`
            }
            style={{ marginTop: 16 }}
            size={isMobile ? "small" : "default"}
            simple={isMobile}
          />
        </div>
      )}
    </Card>
  );
};

export default ARCSAnswersReview;
