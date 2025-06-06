import React from "react";
import { Card, Row, Col, Button, Space, Typography, Badge } from "antd";
import {
  FileTextOutlined,
  BookOutlined,
  BellOutlined,
  CalendarOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const QuickActionsCard = ({ quickActions, loading }) => {
  const navigate = useNavigate();

  const actionItems = [
    {
      key: "submit_assignment",
      title: quickActions?.submit_assignment?.label || "Submit Assignment",
      description: quickActions?.submit_assignment?.description || "0 pending",
      icon: <UploadOutlined />,
      color: quickActions?.submit_assignment?.color || "#ff4d4f",
      action: () => navigate("/student/assignments"),
      count: quickActions?.submit_assignment?.count || 0,
    },
    {
      key: "browse_materials",
      title: quickActions?.browse_materials?.label || "Browse Materials",
      description: quickActions?.browse_materials?.description || "0 available",
      icon: <BookOutlined />,
      color: quickActions?.browse_materials?.color || "#1677ff",
      action: () => navigate("/student/subjects"),
      count: quickActions?.browse_materials?.count || 0,
    },
    {
      key: "announcements",
      title: quickActions?.announcements?.label || "Announcements",
      description: quickActions?.announcements?.description || "0 new",
      icon: <BellOutlined />,
      color: quickActions?.announcements?.color || "#faad14",
      action: () => navigate("/student/announcements"),
      count: quickActions?.announcements?.count || 0,
    },
    {
      key: "schedule",
      title: quickActions?.schedule?.label || "My Schedule",
      description: quickActions?.schedule?.description || "0 upcoming",
      icon: <CalendarOutlined />,
      color: quickActions?.schedule?.color || "#52c41a",
      action: () => navigate("/student/schedule"),
      count: quickActions?.schedule?.count || 0,
    },
  ];

  return (
    <Card
      title={
        <Space>
          <FileTextOutlined style={{ color: "#11418b" }} />
          <Text strong>Quick Actions</Text>
        </Space>
      }
      style={{ borderRadius: 12 }}
      size="large"
    >
      <Row gutter={[12, 12]}>
        {actionItems.map((item) => (
          <Col xs={12} sm={12} lg={12} xl={12} key={item.key}>
            <Badge count={item.count} size="small" offset={[-5, 5]}>
              <Button
                block
                onClick={item.action}
                loading={loading}
                style={{
                  height: "auto",
                  minHeight: 80,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px solid ${item.color}30`,
                  borderRadius: 8,
                  background: `${item.color}08`,
                  padding: "12px 8px",
                }}
                type="text"
              >
                <div
                  style={{
                    fontSize: 20,
                    color: item.color,
                    marginBottom: 6,
                  }}
                >
                  {item.icon}
                </div>
                <Text
                  strong
                  style={{
                    fontSize: 12,
                    textAlign: "center",
                    color: item.color,
                    lineHeight: 1.2,
                    marginBottom: 2,
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  type="secondary"
                  style={{
                    fontSize: 10,
                    textAlign: "center",
                    lineHeight: 1.1,
                  }}
                >
                  {item.description}
                </Text>
              </Button>
            </Badge>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default QuickActionsCard;
