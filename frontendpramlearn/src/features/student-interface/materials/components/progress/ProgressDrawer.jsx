import React from "react";
import { Drawer, Button, Progress, Typography, Space } from "antd";
import {
  TrophyOutlined,
  CloseOutlined,
  FireOutlined,
  StarOutlined,
} from "@ant-design/icons";
import ProgressStats from "./ProgressStats";
import ProgressChecklist from "./ProgressChecklist";

const { Text, Title } = Typography;

const ProgressDrawer = ({
  open,
  onClose,
  progress,
  progressPercent,
  getProgressColor,
  getProgressText,
  formatTime,
  material,
  isActivityCompleted,
  expanded,
  setExpanded,
}) => {
  return (
    <Drawer
      title={null}
      placement="bottom"
      height="75vh"
      open={open}
      onClose={onClose}
      closable={false}
      headerStyle={{ display: "none" }}
      bodyStyle={{
        padding: 0,
        background:
          "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
      }}
      style={{
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: "hidden",
      }}
    >
      {/* Custom Header */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
          padding: "24px 20px 20px",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -50,
            left: -50,
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.05)",
          }}
        />

        {/* Header Content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Drag Handle */}
          <div
            style={{
              width: 40,
              height: 4,
              background: "rgba(255, 255, 255, 0.4)",
              borderRadius: 2,
              margin: "0 auto 20px",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <Space size={12}>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TrophyOutlined style={{ color: "#ffd700", fontSize: 24 }} />
              </div>
              <div>
                <Title
                  level={4}
                  style={{ color: "#fff", margin: 0, marginBottom: 4 }}
                >
                  Progress Pembelajaran
                </Title>
                <Space size={8}>
                  <FireOutlined style={{ color: "#ffd700", fontSize: 14 }} />
                  <Text
                    style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}
                  >
                    {getProgressText(progressPercent)}
                  </Text>
                </Space>
              </div>
            </Space>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={onClose}
              style={{
                color: "#fff",
                fontSize: 16,
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </div>

          {/* Progress Section */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                position: "relative",
                display: "inline-block",
                marginBottom: 16,
              }}
            >
              <Progress
                type="circle"
                percent={progressPercent}
                strokeColor={{
                  "0%": "#ffd700",
                  "50%": "#ff8c00",
                  "100%": "#ff6347",
                }}
                trailColor="rgba(255, 255, 255, 0.3)"
                strokeWidth={8}
                size={120}
                showInfo={false}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 24,
                    fontWeight: 700,
                    display: "block",
                  }}
                >
                  {progressPercent.toFixed(0)}%
                </Text>
                <StarOutlined style={{ color: "#ffd700", fontSize: 16 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div
        style={{
          background: "#fff",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: "24px 20px",
          minHeight: "50vh",
          marginTop: -24,
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Stats Cards */}
        <ProgressStats
          progress={progress}
          progressPercent={progressPercent}
          formatTime={formatTime}
          isMobile={true}
        />

        {/* Checklist Section */}
        <div
          style={{
            background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
            borderRadius: 16,
            padding: 20,
            border: "1px solid #dee2e6",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: 600, color: "#495057" }}>
              📋 Daftar Aktivitas Pembelajaran
            </Text>
            <Button
              type="text"
              size="small"
              onClick={() => setExpanded((v) => !v)}
              style={{
                color: "#667eea",
                fontSize: 13,
                fontWeight: 500,
                background: "rgba(102, 126, 234, 0.1)",
                borderRadius: 20,
                padding: "4px 12px",
                height: 28,
              }}
            >
              {expanded ? "Sembunyikan" : "Lihat Detail"}
            </Button>
          </div>

          {expanded && (
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              <ProgressChecklist
                material={material}
                isActivityCompleted={isActivityCompleted}
              />
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default ProgressDrawer;
