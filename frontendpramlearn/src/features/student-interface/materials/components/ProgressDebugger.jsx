import React from "react";
import { Card, Button, Space, Typography, Divider } from "antd";

const { Text } = Typography;

const ProgressDebugger = ({ progress, recordActivity, materialId }) => {
  const handleTestActivity = async (activityType, data = {}) => {
    console.log(`🧪 Testing ${activityType}:`, data);
    await recordActivity(activityType, data);
  };

  return (
    <Card
      title="🔧 Progress Debugger"
      size="small"
      style={{
        position: "fixed",
        top: 80,
        left: 20,
        width: 300,
        zIndex: 1001,
        fontSize: 12,
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <Text strong>
          Current Progress: {(progress.completion_percentage || 0).toFixed(1)}%
        </Text>
        <br />
        <Text type="secondary">
          Time: {Math.floor((progress.time_spent || 0) / 60)}m
        </Text>
      </div>

      <Divider style={{ margin: "8px 0" }} />

      <Space direction="vertical" size={4} style={{ width: "100%" }}>
        <Button
          size="small"
          block
          onClick={() => handleTestActivity("pdf_opened", { position: 0 })}
        >
          Test PDF Open (+10%)
        </Button>

        <Button
          size="small"
          block
          onClick={() => handleTestActivity("pdf_page_viewed", { position: 0 })}
        >
          Test PDF Page (+2%)
        </Button>

        <Button
          size="small"
          block
          onClick={() =>
            handleTestActivity("video_progress", {
              currentTime: 180,
              duration: 200,
              position: 0,
            })
          }
        >
          Test Video 90% (+18%)
        </Button>

        <Button
          size="small"
          block
          onClick={() => handleTestActivity("form_interaction", {})}
        >
          Test Form (+25%)
        </Button>

        <Button
          size="small"
          block
          onClick={() => handleTestActivity("time_spent", { timeSpent: 300 })}
        >
          Test Time 5min (+2.5%)
        </Button>
      </Space>
    </Card>
  );
};

export default ProgressDebugger;
