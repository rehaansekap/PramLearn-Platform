import React from "react";
import { Tabs, Badge } from "antd";
import {
  UnorderedListOutlined,
  BarChartOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { TabPane } = Tabs;

const SessionsDetailTabs = ({
  activeTab,
  onTabChange,
  sessionDetail,
  materialsCount = 0,
  isMobile,
}) => {
  if (!sessionDetail) return null;

  const { sessions_data = [], statistics = {} } = sessionDetail;

  // Use materialsCount prop if provided, otherwise fallback to sessions_data
  const materialCount = materialsCount || sessions_data.length;

  return (
    <div style={{ padding: isMobile ? "16px" : "20px 24px 0" }}>
      <Tabs
        activeKey={activeTab}
        onChange={onTabChange}
        type="card"
        size={isMobile ? "small" : "default"}
        style={{
          marginBottom: 0,
        }}
        tabBarStyle={{
          background: "transparent",
          border: "none",
          marginBottom: 0,
        }}
        tabBarGutter={16}
      >
        <TabPane
          tab={
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: isMobile ? 12 : 14,
                fontWeight: 600,
              }}
            >
              <UnorderedListOutlined />
              <span>Materi</span>
              <Badge
                count={materialCount}
                style={{
                  backgroundColor: "#667eea",
                  fontSize: 10,
                  height: 18,
                  minWidth: 18,
                  lineHeight: "18px",
                  boxShadow: "0 2px 4px rgba(102, 126, 234, 0.3)",
                }}
              />
            </span>
          }
          key="materials"
        />
        {/* <TabPane
          tab={
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: isMobile ? 12 : 14,
                fontWeight: 600,
              }}
            >
              <BarChartOutlined />
              <span>Analytics</span>
            </span>
          }
          key="analytics"
        /> */}
        <TabPane
          tab={
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: isMobile ? 12 : 14,
                fontWeight: 600,
              }}
            >
              <UserOutlined />
              <span>Siswa</span>
              <Badge
                count={statistics.students_count || 0}
                style={{
                  backgroundColor: "#764ba2",
                  fontSize: 10,
                  height: 18,
                  minWidth: 18,
                  lineHeight: "18px",
                  boxShadow: "0 2px 4px rgba(118, 75, 162, 0.3)",
                }}
              />
            </span>
          }
          key="students"
        />
      </Tabs>
    </div>
  );
};

export default SessionsDetailTabs;
