import React from "react";
import { Card, List, Space, Tag, Typography, Progress, Button } from "antd";
import { EyeOutlined, BookOutlined, FileTextOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

const GradeMobileView = ({
  grades,
  pagination,
  getGradeColor,
  getGradeLetter,
  getPerformanceIndicator,
  onViewDetail,
}) => {
  return (
    <List
      grid={{ gutter: 16, xs: 1, sm: 1 }}
      dataSource={grades}
      renderItem={(grade, index) => {
        const performance = getPerformanceIndicator(grade.grade);
        return (
          <List.Item>
            <Card
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                overflow: "hidden",
                border: "1px solid #e8e8e8",
                transition: "all 0.3s ease",
              }}
              bodyStyle={{ padding: 0 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
              }}
            >
              {/* Header dengan Gradient */}
              <div
                style={{
                  background: `linear-gradient(135deg, ${getGradeColor(
                    grade.grade
                  )} 0%, ${getGradeColor(grade.grade)}CC 100%)`,
                  padding: "20px 24px",
                  color: "white",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative Elements */}
                <div
                  style={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.1)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: -20,
                    left: -20,
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.05)",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Text
                      strong
                      style={{ color: "white", fontSize: 16, display: "block" }}
                    >
                      {grade.title}
                    </Text>
                    <div style={{ marginTop: 8 }}>
                      <Tag
                        icon={
                          grade.type === "quiz" ? (
                            <BookOutlined />
                          ) : (
                            <FileTextOutlined />
                          )
                        }
                        color="rgba(255,255,255,0.2)"
                        style={{
                          color: "white",
                          fontSize: 12,
                          fontWeight: 500,
                          border: "1px solid rgba(255,255,255,0.3)",
                        }}
                      >
                        {grade.type === "quiz" ? "Kuis" : "Tugas"}
                      </Tag>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: 32,
                        fontWeight: "bold",
                        lineHeight: 1,
                      }}
                    >
                      {grade.grade?.toFixed(1)}
                    </div>
                    <div
                      style={{ fontSize: 16, fontWeight: "bold", marginTop: 4 }}
                    >
                      {getGradeLetter(grade.grade)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: "20px 24px" }}>
                <Space direction="vertical" style={{ width: "100%" }} size={16}>
                  {/* Subject & Date */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Tag
                      color="purple"
                      style={{
                        margin: 0,
                        padding: "4px 12px",
                        borderRadius: 8,
                        fontWeight: 500,
                      }}
                    >
                      {grade.subject_name}
                    </Tag>
                    <Text
                      type="secondary"
                      style={{ fontSize: 13, fontWeight: 500 }}
                    >
                      📅 {dayjs(grade.date).format("DD MMM YYYY")}
                    </Text>
                  </div>

                  {/* Performance Indicator */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      background: `${performance.color}15`,
                      borderRadius: 8,
                      border: `1px solid ${performance.color}30`,
                    }}
                  >
                    {performance.icon && (
                      <span style={{ color: performance.color, fontSize: 18 }}>
                        {performance.icon}
                      </span>
                    )}
                    <Text
                      style={{
                        fontSize: 14,
                        color: performance.color,
                        fontWeight: 600,
                      }}
                    >
                      {performance.text}
                    </Text>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div style={{ marginBottom: 8 }}>
                      <Text style={{ fontSize: 13, color: "#666" }}>
                        Pencapaian: {grade.grade}%
                      </Text>
                    </div>
                    <Progress
                      percent={grade.grade}
                      size="default"
                      showInfo={false}
                      strokeColor={{
                        "0%": getGradeColor(grade.grade),
                        "100%": getGradeColor(grade.grade) + "AA",
                      }}
                      strokeWidth={8}
                    />
                  </div>

                  {/* Feedback */}
                  {grade.teacher_feedback && (
                    <div
                      style={{
                        background: "#f6faff",
                        padding: "12px 16px",
                        borderRadius: 8,
                        borderLeft: "4px solid #1677ff",
                      }}
                    >
                      <Text
                        style={{ fontSize: 13, color: "#666", fontWeight: 500 }}
                      >
                        💬 Catatan Guru:
                      </Text>
                      <div style={{ marginTop: 4 }}>
                        <Text style={{ fontSize: 13, color: "#333" }}>
                          {grade.teacher_feedback.substring(0, 80)}
                          {grade.teacher_feedback.length > 80 && "..."}
                        </Text>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => onViewDetail(grade)}
                    style={{
                      width: "100%",
                      height: 44,
                      borderRadius: 12,
                      fontWeight: 600,
                      fontSize: 14,
                      background:
                        "linear-gradient(135deg, #11418b 0%, #1890ff 100%)",
                      border: "none",
                    }}
                  >
                    Lihat Detail & Feedback
                  </Button>
                </Space>
              </div>
            </Card>
          </List.Item>
        );
      }}
      pagination={
        pagination
          ? {
              pageSize: 5,
              showSizeChanger: false,
              showQuickJumper: false,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} nilai`,
              size: "small",
            }
          : false
      }
    />
  );
};

export default GradeMobileView;
