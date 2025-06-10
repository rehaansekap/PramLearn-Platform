import React from "react";
import { Card, Progress, Typography, Tag, Button, Tooltip, Space } from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

const getProgressColor = (percent) => {
  if (percent >= 80) return "#52c41a";
  if (percent >= 60) return "#faad14";
  return "#ff4d4f";
};

const SubjectCard = ({ subject, onClick, onQuickAccessMaterial }) => {
  return (
    <Card
      hoverable
      style={{
        borderRadius: 16,
        overflow: "hidden",
        height: "100%",
        border: "1px solid #f0f0f0",
        transition: "all 0.3s ease",
        cursor: "pointer",
      }}
      styles={{
        body: { padding: 0 },
      }}
      onClick={() => onClick(subject)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(17, 65, 139, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
      }}
    >
      {/* Header dengan gradient */}
      <div
        style={{
          background: "linear-gradient(135deg, #11418b 0%, #1890ff 100%)",
          padding: "20px 24px 16px",
          color: "white",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -10,
            right: -10,
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
          }}
        />

        <Title
          level={4}
          style={{
            color: "white",
            margin: 0,
            marginBottom: 8,
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          {subject.name}
        </Title>

        <Space size={8} style={{ marginBottom: 12 }}>
          <UserOutlined style={{ fontSize: 12 }} />
          <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 13 }}>
            {subject.teacher_name || "No Teacher"}
          </Text>
        </Space>

        {/* Progress Bar */}
        <div style={{ marginBottom: 8 }}>
          <Progress
            percent={subject.progress || 0}
            strokeColor="rgba(255,255,255,0.9)"
            trailColor="rgba(255,255,255,0.2)"
            size="small"
            showInfo={false}
          />
        </div>
        <Text
          style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          {subject.progress || 0}% Complete
        </Text>
      </div>

      {/* Body */}
      <div style={{ padding: "20px 24px 24px" }}>
        {/* Material Count */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Space size={4}>
            <FileTextOutlined style={{ color: "#1890ff", fontSize: 14 }} />
            <Text style={{ fontSize: 13, color: "#666" }}>
              {subject.material_count || 0} Materi
            </Text>
          </Space>
          <Tag
            color={
              subject.progress >= 80
                ? "green"
                : subject.progress >= 50
                ? "orange"
                : "red"
            }
            style={{ fontSize: 11, padding: "2px 8px" }}
          >
            {subject.progress >= 80
              ? "Excellent"
              : subject.progress >= 50
              ? "Good"
              : "Needs Focus"}
          </Tag>
        </div>

        {/* Last Material */}
        {subject.last_material_title && (
          <div
            style={{
              background: "#f8f9fa",
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                background: "#f8f9fa",
                borderRadius: 8,
                padding: 12,
                width: "100%",
                maxWidth: 220,
                textAlign: "center",
              }}
            >
              <ClockCircleOutlined style={{ color: "#666", fontSize: 12 }} />
              <Text style={{ fontSize: 12, color: "#666", fontWeight: 500 }}>
                Terakhir diakses:
              </Text>
            </div>
            <Text
              style={{
                fontSize: 13,
                color: "#333",
                display: "block",
                marginBottom: 8,
              }}
            >
              {subject.last_material_title}
            </Text>
            <Button
              size="small"
              type="primary"
              icon={<PlayCircleOutlined />}
              style={{
                height: 28,
                fontSize: 12,
                borderRadius: 6,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onQuickAccessMaterial(subject.last_material_slug);
              }}
              disabled={!subject.last_material_slug}
            >
              Lanjutkan
            </Button>
          </div>
        )}

        {/* Schedules */}
        {subject.schedules && subject.schedules.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <CalendarOutlined style={{ color: "#1890ff", fontSize: 12 }} />
              <Text style={{ fontSize: 12, color: "#666", fontWeight: 500 }}>
                Jadwal:
              </Text>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {subject.schedules.map((schedule, idx) => (
                <Tag
                  key={idx}
                  style={{
                    fontSize: 11,
                    margin: 0,
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}
                >
                  {schedule.day_of_week}, {schedule.time}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          type="primary"
          block
          style={{
            borderRadius: 8,
            height: 36,
            fontWeight: 600,
            background: "linear-gradient(135deg, #11418b 0%, #1890ff 100%)",
            border: "none",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClick(subject);
          }}
        >
          Lihat Detail
        </Button>
      </div>
    </Card>
  );
};

export default SubjectCard;
