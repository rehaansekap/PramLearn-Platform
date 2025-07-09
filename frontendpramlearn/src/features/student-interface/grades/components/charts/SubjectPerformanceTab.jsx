import React from "react";
import { Card, Typography, List, Progress } from "antd";
import { BookOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const SubjectPerformanceTab = ({ subjectPerformance }) => {
  return (
    <div style={{ padding: "0 24px 24px" }}>
      <Title level={4} style={{ marginBottom: 24, color: "#11418b" }}>
        📊 Rata-rata Nilai per Mata Pelajaran
      </Title>

      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3 }}
        dataSource={subjectPerformance}
        renderItem={(subject) => (
          <List.Item>
            <Card
              size="small"
              style={{
                borderRadius: 12,
                border: `2px solid ${subject.color}`,
                textAlign: "center",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              hoverable
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = `0 8px 24px ${subject.color}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: `${subject.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <BookOutlined
                    style={{ fontSize: 20, color: subject.color }}
                  />
                </div>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: 14,
                    marginBottom: 4,
                    color: "#333",
                  }}
                >
                  {subject.name}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {subject.count} assessment
                </Text>
              </div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: subject.color,
                  marginBottom: 12,
                }}
              >
                {subject.average.toFixed(1)}
              </div>

              <Progress
                percent={subject.average}
                strokeColor={subject.color}
                showInfo={false}
                strokeWidth={8}
                style={{ margin: "0 8px" }}
              />
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default SubjectPerformanceTab;
