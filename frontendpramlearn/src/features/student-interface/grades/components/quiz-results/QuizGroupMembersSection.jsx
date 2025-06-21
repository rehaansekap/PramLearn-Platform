import React from "react";
import { Card, Row, Col, Typography, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const QuizGroupMembersSection = ({ groupData }) => {
  if (!groupData?.members) return null;

  return (
    <Card
      style={{
        marginTop: 24,
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <Title level={5} style={{ marginBottom: 16, color: "#11418b" }}>
        👥 Anggota Kelompok
      </Title>
      <Row gutter={[16, 12]}>
        {groupData.members.map((member, index) => (
          <Col xs={24} sm={12} md={8} key={member.id || index}>
            <Card
              size="small"
              style={{
                borderRadius: 12,
                border: "1px solid #f0f0f0",
                transition: "all 0.3s ease",
                background: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)",
              }}
              bodyStyle={{ padding: "12px 16px" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                e.currentTarget.style.borderColor = "#1890ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "#f0f0f0";
              }}
            >
              <Space>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #1890ff 0%, #52c41a 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 14,
                  }}
                >
                  <UserOutlined />
                </div>
                <div>
                  <Text strong style={{ fontSize: 14, color: "#11418b" }}>
                    {member.name}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {member.student_id || member.username}
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default QuizGroupMembersSection;
