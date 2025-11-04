import React from "react";
import { Tabs, Badge } from "antd";
import {
  BookOutlined,
  TeamOutlined,
  UserOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  BarChartOutlined,
  FormOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const { TabPane } = Tabs;

const SessionsMaterialDetailTabs = ({
  activeTab,
  onTabChange,
  materialDetail,
  isMobile,
}) => {
  if (!materialDetail) return null;

  const { statistics = {} } = materialDetail;

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
              <BookOutlined />
              <span>Konten</span>
            </span>
          }
          key="content"
        />

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
                count={statistics.total_students || 0}
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
          key="students"
        />

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
              <TeamOutlined />
              <span>Kelompok</span>
              <Badge
                count={statistics.total_groups || 0}
                style={{
                  backgroundColor: "#52c41a",
                  fontSize: 10,
                  height: 18,
                  minWidth: 18,
                  lineHeight: "18px",
                  boxShadow: "0 2px 4px rgba(82, 196, 26, 0.3)",
                }}
              />
            </span>
          }
          key="groups"
        />

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
              <QuestionCircleOutlined />
              <span>Quiz</span>
              <Badge
                count={statistics.total_quizzes || 0}
                style={{
                  backgroundColor: "#faad14",
                  fontSize: 10,
                  height: 18,
                  minWidth: 18,
                  lineHeight: "18px",
                  boxShadow: "0 2px 4px rgba(250, 173, 20, 0.3)",
                }}
              />
            </span>
          }
          key="quizzes"
        />

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
              <FileTextOutlined />
              <span>Assignment</span>
              <Badge
                count={statistics.total_assignments || 0}
                style={{
                  backgroundColor: "#722ed1",
                  fontSize: 10,
                  height: 18,
                  minWidth: 18,
                  lineHeight: "18px",
                  boxShadow: "0 2px 4px rgba(114, 46, 209, 0.3)",
                }}
              />
            </span>
          }
          key="assignments"
        />

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
              <FormOutlined />
              <span>ARCS</span>
            </span>
          }
          key="arcs"
        />

        {/* Tab baru untuk Upload ARCS */}
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
              <UploadOutlined />
              <span>Upload Hasil ARCS</span>
            </span>
          }
          key="upload-arcs"
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
      </Tabs>
    </div>
  );
};

export default SessionsMaterialDetailTabs;
