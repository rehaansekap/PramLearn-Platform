import React from "react";
import { Typography } from "antd";
import { FormOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const ARCSListHeader = ({ totalQuestionnaires }) => {
  return (
    <div style={{ marginBottom: 24, textAlign: "center" }}>
      <FormOutlined
        style={{
          fontSize: 32,
          color: "#11418b",
          marginBottom: 12,
        }}
      />
      <Title
        level={4}
        style={{
          margin: 0,
          marginBottom: 8,
          color: "#11418b",
          fontSize: "20px",
          fontWeight: 700,
        }}
      >
        Kuesioner ARCS
      </Title>
      <Text type="secondary" style={{ fontSize: "14px", color: "#666" }}>
        Kuesioner untuk mengukur tingkat motivasi belajar Anda
      </Text>
    </div>
  );
};

export default ARCSListHeader;