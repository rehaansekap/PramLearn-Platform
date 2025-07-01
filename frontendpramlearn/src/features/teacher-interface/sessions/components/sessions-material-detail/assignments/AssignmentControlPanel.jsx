import React from "react";
import { Card, Button, Space, Row, Col } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const AssignmentControlPanel = ({
  onCreateAssignment,
  onRefresh,
  refreshing = false,
  hasAssignments = false,
  isMobile = false,
}) => {
  return (
    <Card
      style={{
        borderRadius: 16,
        marginBottom: 24,
        background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
        border: "1px solid #e6f7ff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
      bodyStyle={{ padding: isMobile ? "16px" : "20px" }}
    >
      <Row gutter={[16, 16]} align="middle" justify="space-between">
        {/* Left side - Info */}
        <Col xs={24} sm={12} md={14}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "50%",
                width: isMobile ? 40 : 48,
                height: isMobile ? 40 : 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileTextOutlined
                style={{
                  color: "white",
                  fontSize: isMobile ? 16 : 20,
                }}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: isMobile ? 14 : 16,
                  fontWeight: 600,
                  color: "#262626",
                  marginBottom: 2,
                }}
              >
                Assignment Management
              </div>
              <div
                style={{
                  fontSize: isMobile ? 11 : 12,
                  color: "#666",
                }}
              >
                Buat dan kelola assignment untuk siswa
              </div>
            </div>
          </div>
        </Col>

        {/* Right side - Actions */}
        <Col xs={24} sm={12} md={10}>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: isMobile ? "center" : "flex-end",
              flexWrap: "wrap",
            }}
          >
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={refreshing}
              size={isMobile ? "middle" : "large"}
              style={{
                borderRadius: 8,
                borderColor: "#667eea",
                color: "#667eea",
                background: "white",
                fontWeight: 600,
                minWidth: isMobile ? 80 : 120,
                height: isMobile ? 40 : 44,
                boxShadow: "0 2px 4px rgba(102, 126, 234, 0.1)",
              }}
            >
              {refreshing ? "Refresh..." : "🔄 Refresh"}
            </Button>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onCreateAssignment}
              size={isMobile ? "middle" : "large"}
              style={{
                borderRadius: 8,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                fontWeight: 600,
                minWidth: isMobile ? 120 : 160,
                height: isMobile ? 40 : 44,
              }}
            >
              {isMobile ? "➕ Buat" : "📝 Buat Assignment"}
            </Button>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default AssignmentControlPanel;
