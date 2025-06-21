import React from "react";
import { Card, Typography } from "antd";

const { Title } = Typography;

const GoogleFormsTab = ({ embedUrl, title, description }) => {
  return (
    <div style={{ padding: "24px" }}>
      <Card title={`📝 ${title}`} style={{ borderRadius: 12 }}>
        <Title level={4}>{title}</Title>
        {description && (
          <p style={{ color: "#666", marginBottom: 16 }}>{description}</p>
        )}
        <div
          style={{
            position: "relative",
            paddingTop: "75%",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <iframe
            src={embedUrl}
            frameBorder="0"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
            title={`${title} Form`}
          />
        </div>
      </Card>
    </div>
  );
};

export default GoogleFormsTab;
