import React from "react";
import { Card, Space, Typography } from "antd";
import { RiseOutlined, FallOutlined, MinusOutlined } from "@ant-design/icons";

const { Text } = Typography;

const TrendCard = ({ trendData }) => {
  const getTrendIcon = () => {
    switch (trendData.trend) {
      case "increasing":
        return <RiseOutlined style={{ color: "#52c41a", fontSize: 24 }} />;
      case "decreasing":
        return <FallOutlined style={{ color: "#ff4d4f", fontSize: 24 }} />;
      default:
        return <MinusOutlined style={{ color: "#faad14", fontSize: 24 }} />;
    }
  };

  const getTrendText = () => {
    switch (trendData.trend) {
      case "increasing":
        return "Meningkat";
      case "decreasing":
        return "Menurun";
      default:
        return "Stabil";
    }
  };

  const getTrendColor = () => {
    switch (trendData.trend) {
      case "increasing":
        return "#52c41a";
      case "decreasing":
        return "#ff4d4f";
      default:
        return "#faad14";
    }
  };

  return (
    <Card
      style={{
        borderRadius: 16,
        textAlign: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        border: "1px solid #f0f0f0",
        height: "100%",
        justifyContent: "center",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Space direction="vertical" style={{ width: "100%" }} size={12}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {getTrendIcon()}
          <Text strong style={{ fontSize: 16, color: "#333" }}>
            Tren Performa
          </Text>
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: getTrendColor(),
            marginBottom: 4,
          }}
        >
          {getTrendText()}
        </div>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {trendData.percentage}% dari periode sebelumnya
        </Text>
      </Space>
    </Card>
  );
};

export default TrendCard;
