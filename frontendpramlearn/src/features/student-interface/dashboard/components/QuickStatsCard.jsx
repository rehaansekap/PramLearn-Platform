import React from "react";
import { Card, Row, Col, Statistic, Button, Skeleton } from "antd";
import {
  BookOutlined,
  FileTextOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const QuickStatsCard = ({ stats, loading }) => {
  const navigate = useNavigate();

  return (
    <Card style={{ marginBottom: 16, borderRadius: 12 }}>
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Statistic
            title="Subjects"
            value={
              loading ? (
                <Skeleton.Input active size="small" />
              ) : (
                stats?.subjects || 0
              )
            }
            prefix={<BookOutlined style={{ color: "#11418b" }} />}
          />
        </Col>
        <Col xs={12} md={6}>
          <Statistic
            title="Pending Assignments"
            value={
              loading ? (
                <Skeleton.Input active size="small" />
              ) : (
                stats?.pending_assignments || 0
              )
            }
            prefix={<FileTextOutlined style={{ color: "#faad14" }} />}
          />
        </Col>
        <Col xs={12} md={6}>
          <Statistic
            title="Available Quizzes"
            value={
              loading ? (
                <Skeleton.Input active size="small" />
              ) : (
                stats?.available_quizzes || 0
              )
            }
            prefix={<BarChartOutlined style={{ color: "#52c41a" }} />}
          />
        </Col>
        <Col xs={12} md={6}>
          <Statistic
            title="Progress"
            value={
              loading ? (
                <Skeleton.Input active size="small" />
              ) : (
                `${stats?.progress || 0}%`
              )
            }
            prefix={<CheckCircleOutlined style={{ color: "#1677ff" }} />}
          />
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col xs={24} md={8}>
          <Button
            block
            type="primary"
            onClick={() => navigate("/student/subjects")}
          >
            Lihat Mata Pelajaran
          </Button>
        </Col>
        <Col xs={24} md={8}>
          <Button block onClick={() => navigate("/student/assessments")}>
            Lihat Tugas & Quiz
          </Button>
        </Col>
        <Col xs={24} md={8}>
          <Button block onClick={() => navigate("/student/progress")}>
            Lihat Progress
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default QuickStatsCard;
