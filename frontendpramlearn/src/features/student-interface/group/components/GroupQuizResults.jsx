import React, { useState } from "react";
import {
  Card,
  Table,
  Tag,
  Progress,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Modal,
  List,
  Avatar,
  Tooltip,
  Badge,
} from "antd";
import {
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  CrownOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Title } = Typography;

const GroupQuizResults = ({ quizResults, rankings, loading }) => {
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  if (loading) {
    return (
      <Card loading title="🏆 Hasil Quiz Kelompok">
        <div style={{ height: 300 }} />
      </Card>
    );
  }

  const getRankColor = (rank) => {
    if (rank === 1) return "#faad14"; // Gold
    if (rank === 2) return "#52c41a"; // Silver
    if (rank === 3) return "#ff7a45"; // Bronze
    return "#1890ff"; // Default
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "🏅";
  };

  const handleViewDetail = (quiz) => {
    setSelectedQuiz(quiz);
    setDetailModalVisible(true);
  };

  // Quiz Results Table Columns
  const quizColumns = [
    {
      title: "Quiz",
      dataIndex: "quiz_title",
      key: "quiz_title",
      render: (title, record) => (
        <div>
          <Text strong>{title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(record.date).format("DD MMM YYYY")}
          </Text>
        </div>
      ),
    },
    {
      title: "Skor Kelompok",
      dataIndex: "group_score",
      key: "group_score",
      render: (score, record) => (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: getRankColor(record.rank),
            }}
          >
            {score.toFixed(1)}
          </div>
          <Progress
            percent={score}
            size="small"
            strokeColor={getRankColor(record.rank)}
            showInfo={false}
          />
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.correct_answers}/{record.total_questions} benar
          </Text>
        </div>
      ),
      width: 120,
      align: "center",
    },
    {
      title: "Peringkat",
      dataIndex: "rank",
      key: "rank",
      render: (rank, record) => (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>
            {getRankIcon(rank)}
          </div>
          <Tag color={getRankColor(rank)} style={{ margin: 0 }}>
            #{rank} dari {record.total_groups}
          </Tag>
        </div>
      ),
      width: 100,
      align: "center",
    },
    {
      title: "Waktu",
      dataIndex: "completion_time",
      key: "completion_time",
      render: (time) => (
        <Space>
          <ClockCircleOutlined style={{ color: "#1890ff" }} />
          <Text>{time} menit</Text>
        </Space>
      ),
      width: 100,
    },
    {
      title: "Detail",
      key: "action",
      render: (_, record) => (
        <EyeOutlined
          style={{ fontSize: 16, color: "#1890ff", cursor: "pointer" }}
          onClick={() => handleViewDetail(record)}
        />
      ),
      width: 60,
      align: "center",
    },
  ];

  // Ranking Table Columns
  const rankingColumns = [
    {
      title: "Peringkat",
      dataIndex: "rank",
      key: "rank",
      render: (rank, record) => (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>
            {getRankIcon(rank)}
          </div>
          <Text strong style={{ color: getRankColor(rank) }}>
            #{rank}
          </Text>
        </div>
      ),
      width: 80,
      align: "center",
    },
    {
      title: "Kelompok",
      dataIndex: "group_name",
      key: "group_name",
      render: (name, record) => (
        <div>
          <Space>
            <Text
              strong
              style={{ color: record.is_current_group ? "#1890ff" : "#000" }}
            >
              {name}
            </Text>
            {record.is_current_group && (
              <Tag color="blue" size="small">
                Kelompok Anda
              </Tag>
            )}
          </Space>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.group_code}
          </Text>
        </div>
      ),
    },
    {
      title: "Skor",
      dataIndex: "score",
      key: "score",
      render: (score) => (
        <div style={{ textAlign: "center" }}>
          <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
            {score.toFixed(1)}
          </Text>
          <br />
          <Progress percent={score} size="small" showInfo={false} />
        </div>
      ),
      width: 120,
      align: "center",
    },
    {
      title: "Anggota",
      dataIndex: "member_count",
      key: "member_count",
      render: (count, record) => (
        <Space>
          <TeamOutlined style={{ color: "#52c41a" }} />
          <Text>{count} orang</Text>
          <Badge
            count={record.quiz_completed}
            size="small"
            style={{ backgroundColor: "#1890ff" }}
          />
        </Space>
      ),
      width: 120,
    },
  ];

  // Calculate overall statistics
  const overallStats = {
    averageScore:
      quizResults.reduce((sum, q) => sum + q.group_score, 0) /
      (quizResults.length || 1),
    bestRank: Math.min(...quizResults.map((q) => q.rank)),
    totalQuizzes: quizResults.length,
    improvement:
      quizResults.length > 1
        ? quizResults[0].group_score -
          quizResults[quizResults.length - 1].group_score
        : 0,
  };

  return (
    <div>
      {/* Overall Statistics */}
      <Card
        title={
          <Space>
            <TrophyOutlined style={{ color: "#faad14" }} />
            <span>🏆 Statistik Quiz Kelompok</span>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={16}>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ textAlign: "center" }}>
              <Statistic
                title="Rata-rata Skor"
                value={overallStats.averageScore}
                precision={1}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ textAlign: "center" }}>
              <Statistic
                title="Peringkat Terbaik"
                value={overallStats.bestRank}
                prefix={getRankIcon(overallStats.bestRank)}
                valueStyle={{ color: getRankColor(overallStats.bestRank) }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ textAlign: "center" }}>
              <Statistic
                title="Total Quiz"
                value={overallStats.totalQuizzes}
                suffix="quiz"
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ textAlign: "center" }}>
              <Statistic
                title="Peningkatan"
                value={overallStats.improvement}
                precision={1}
                valueStyle={{
                  color: overallStats.improvement >= 0 ? "#52c41a" : "#ff4d4f",
                }}
                prefix={overallStats.improvement >= 0 ? "↗️" : "↘️"}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        {/* Quiz Results */}
        <Col xs={24} lg={14}>
          <Card
            title="📝 Riwayat Quiz"
            extra={
              <Badge
                count={quizResults.length}
                style={{ backgroundColor: "#1890ff" }}
              />
            }
          >
            <Table
              dataSource={quizResults}
              columns={quizColumns}
              rowKey="id"
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
                style: { textAlign: "center" },
              }}
              size="small"
            />
          </Card>
        </Col>

        {/* Group Rankings */}
        <Col xs={24} lg={10}>
          <Card
            title="🏅 Ranking Kelompok"
            extra={<CrownOutlined style={{ color: "#faad14" }} />}
          >
            <Table
              dataSource={rankings}
              columns={rankingColumns}
              rowKey="group_code"
              pagination={false}
              size="small"
              rowClassName={(record) =>
                record.is_current_group ? "current-group-row" : ""
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <TrophyOutlined style={{ color: "#faad14" }} />
            <span>Detail Quiz: {selectedQuiz?.quiz_title}</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedQuiz && (
          <div>
            {/* Quiz Info */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Card size="small" style={{ textAlign: "center" }}>
                  <Statistic
                    title="Skor Kelompok"
                    value={selectedQuiz.group_score}
                    precision={1}
                    valueStyle={{ color: getRankColor(selectedQuiz.rank) }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: "center" }}>
                  <Text strong style={{ display: "block" }}>
                    Peringkat
                  </Text>
                  <div style={{ fontSize: 20, margin: "8px 0" }}>
                    {getRankIcon(selectedQuiz.rank)}
                  </div>
                  <Text>
                    #{selectedQuiz.rank} dari {selectedQuiz.total_groups}
                  </Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: "center" }}>
                  <Statistic
                    title="Waktu"
                    value={selectedQuiz.completion_time}
                    suffix="menit"
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Individual Scores */}
            <Title level={5}>📊 Skor Individual</Title>
            <List
              dataSource={selectedQuiz.individual_scores}
              renderItem={(item) => (
                <List.Item
                  style={{
                    padding: "12px 16px",
                    borderRadius: 8,
                    marginBottom: 8,
                    backgroundColor: "#fafafa",
                  }}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={item.student_name}
                    description={
                      <Space>
                        <Text strong style={{ color: "#1890ff" }}>
                          {item.score}/100
                        </Text>
                        <Progress
                          percent={item.score}
                          size="small"
                          strokeColor="#1890ff"
                          style={{ width: 100 }}
                        />
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>

      <style jsx>{`
        .current-group-row {
          background-color: #f6ffed !important;
        }
        .current-group-row:hover {
          background-color: #f6ffed !important;
        }
      `}</style>
    </div>
  );
};

export default GroupQuizResults;
