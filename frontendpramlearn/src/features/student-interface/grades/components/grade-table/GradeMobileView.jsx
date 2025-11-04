import React from "react";
import {
  Card,
  List,
  Space,
  Tag,
  Typography,
  Progress,
  Button,
  Grid,
} from "antd";
import { EyeOutlined, BookOutlined, FileTextOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const GradeMobileView = ({
  grades,
  pagination,
  getGradeColor,
  getGradeLetter,
  getPerformanceIndicator,
  onViewDetail,
}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <List
      grid={{ gutter: [12, 12], xs: 1, sm: 1 }}
      dataSource={grades}
      renderItem={(grade, index) => {
        const performance = getPerformanceIndicator(grade.grade);
        return (
          <List.Item>
            <Card
              style={{
                borderRadius: isMobile ? 12 : 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                overflow: "hidden",
                border: "1px solid #e8e8e8",
                transition: "all 0.3s ease",
              }}
              bodyStyle={{ padding: 0 }}
            >
              {/* Header dengan Gradient - More Compact */}
              <div
                style={{
                  background: `linear-gradient(135deg, ${getGradeColor(
                    grade.grade
                  )} 0%, ${getGradeColor(grade.grade)}CC 100%)`,
                  padding: isMobile ? "16px 20px" : "20px 24px",
                  color: "white",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Simplified Decorative Elements */}
                <div
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    width: isMobile ? 40 : 60,
                    height: isMobile ? 40 : 60,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.1)",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: isMobile ? "flex-start" : "center",
                    position: "relative",
                    zIndex: 1,
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      strong
                      style={{
                        color: "white",
                        fontSize: isMobile ? 14 : 16,
                        display: "block",
                        lineHeight: 1.3,
                        wordBreak: "break-word",
                      }}
                    >
                      {grade.title}
                    </Text>
                    <div style={{ marginTop: isMobile ? 6 : 8 }}>
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
                          fontSize: isMobile ? 11 : 12,
                          fontWeight: 500,
                          border: "1px solid rgba(255,255,255,0.3)",
                          padding: isMobile ? "2px 8px" : "4px 12px",
                        }}
                      >
                        {grade.type === "quiz" ? "Kuis" : "Tugas"}
                      </Tag>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div
                      style={{
                        fontSize: isMobile ? 24 : 32,
                        fontWeight: "bold",
                        lineHeight: 1,
                      }}
                    >
                      {grade.grade?.toFixed(1)}
                    </div>
                    <div
                      style={{
                        fontSize: isMobile ? 14 : 16,
                        fontWeight: "bold",
                        marginTop: 2,
                      }}
                    >
                      {getGradeLetter(grade.grade)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content - More Compact */}
              <div style={{ padding: isMobile ? "16px 20px" : "20px 24px" }}>
                <Space
                  direction="vertical"
                  style={{ width: "100%" }}
                  size={isMobile ? 12 : 16}
                >
                  {/* Subject & Date - Stack on Mobile */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      justifyContent: "space-between",
                      alignItems: isMobile ? "flex-start" : "center",
                      gap: isMobile ? 8 : 0,
                    }}
                  >
                    <Tag
                      color="purple"
                      style={{
                        margin: 0,
                        padding: isMobile ? "3px 8px" : "4px 12px",
                        borderRadius: 6,
                        fontWeight: 500,
                        fontSize: isMobile ? 11 : 12,
                      }}
                    >
                      {grade.subject_name}
                    </Tag>
                    <Text
                      type="secondary"
                      style={{ fontSize: isMobile ? 12 : 13, fontWeight: 500 }}
                    >
                      📅 {dayjs(grade.date).format("DD MMM YYYY")}
                    </Text>
                  </div>

                  {/* Performance Indicator - More Compact */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: isMobile ? 8 : 12,
                      padding: isMobile ? "10px 12px" : "12px 16px",
                      background: `${performance.color}15`,
                      borderRadius: 6,
                      border: `1px solid ${performance.color}30`,
                    }}
                  >
                    {performance.icon && (
                      <span
                        style={{
                          color: performance.color,
                          fontSize: isMobile ? 16 : 18,
                        }}
                      >
                        {performance.icon}
                      </span>
                    )}
                    <Text
                      style={{
                        fontSize: isMobile ? 13 : 14,
                        color: performance.color,
                        fontWeight: 600,
                      }}
                    >
                      {performance.text}
                    </Text>
                  </div>

                  {/* Progress Bar - Simplified */}
                  <div>
                    <div style={{ marginBottom: 6 }}>
                      <Text
                        style={{ fontSize: isMobile ? 12 : 13, color: "#666" }}
                      >
                        Pencapaian: {grade.grade}%
                      </Text>
                    </div>
                    <Progress
                      percent={grade.grade}
                      size="small"
                      showInfo={false}
                      strokeColor={{
                        "0%": getGradeColor(grade.grade),
                        "100%": getGradeColor(grade.grade) + "AA",
                      }}
                      strokeWidth={isMobile ? 6 : 8}
                    />
                  </div>

                  {/* Feedback - More Compact */}
                  {grade.teacher_feedback && (
                    <div
                      style={{
                        background: "#f6faff",
                        padding: isMobile ? "10px 12px" : "12px 16px",
                        borderRadius: 6,
                        borderLeft: "3px solid #1677ff",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: isMobile ? 12 : 13,
                          color: "#666",
                          fontWeight: 500,
                        }}
                      >
                        💬 Catatan Guru:
                      </Text>
                      <div style={{ marginTop: 4 }}>
                        <Text
                          style={{
                            fontSize: isMobile ? 12 : 13,
                            color: "#333",
                            lineHeight: 1.4,
                          }}
                        >
                          {grade.teacher_feedback.substring(
                            0,
                            isMobile ? 60 : 80
                          )}
                          {grade.teacher_feedback.length >
                            (isMobile ? 60 : 80) && "..."}
                        </Text>
                      </div>
                    </div>
                  )}

                  {/* Action Button - More Compact */}
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => onViewDetail(grade)}
                    style={{
                      width: "100%",
                      height: isMobile ? 40 : 44,
                      borderRadius: isMobile ? 8 : 12,
                      fontWeight: 600,
                      fontSize: isMobile ? 13 : 14,
                      background:
                        "linear-gradient(135deg, #1677ff 0%, #1890ff 100%)",
                      border: "none",
                    }}
                  >
                    {isMobile ? "Lihat Detail" : "Lihat Detail & Feedback"}
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
              pageSize: isMobile ? 3 : 5,
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
