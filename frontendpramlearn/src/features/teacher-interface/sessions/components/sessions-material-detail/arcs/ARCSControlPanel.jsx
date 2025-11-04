import React from "react";
import { Card, Button, Space, Row, Col, Alert } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  FormOutlined,
  InfoCircleOutlined,
  ExportOutlined,
} from "@ant-design/icons";

const ARCSControlPanel = ({
  onCreateQuestionnaire,
  onRefresh,
  onExportData,
  refreshing = false,
  hasQuestionnaires = false,
  hasResponses = false,
  isMobile = false,
}) => {
  return (
    <div style={{ marginBottom: 24 }}>
      {/* Info Card */}
      <Alert
        message="Tentang Kuesioner ARCS"
        description={
          <div>
            <p style={{ marginBottom: 8, fontSize: 13 }}>
              Kuesioner ARCS mengukur 4 dimensi motivasi pembelajaran:
            </p>
            <ul style={{ marginBottom: 0, paddingLeft: 20, fontSize: 12 }}>
              <li>
                <strong>Attention (Perhatian):</strong> Kemampuan menarik
                perhatian siswa
              </li>
              <li>
                <strong>Relevance (Relevansi):</strong> Kesesuaian dengan
                kebutuhan siswa
              </li>
              <li>
                <strong>Confidence (Percaya Diri):</strong> Tingkat keyakinan
                siswa
              </li>
              <li>
                <strong>Satisfaction (Kepuasan):</strong> Kepuasan terhadap
                pembelajaran
              </li>
            </ul>
          </div>
        }
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{
          borderRadius: 12,
          border: "1px solid #d6e4ff",
          backgroundColor: "#f0f9ff",
          marginBottom: 20,
        }}
      />

      {/* Control Panel */}
      <Card
        style={{
          borderRadius: 16,
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
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "50%",
                  width: isMobile ? 40 : 48,
                  height: isMobile ? 40 : 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                }}
              >
                <FormOutlined
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
                  📊 ARCS Management
                </div>
                <div
                  style={{
                    fontSize: isMobile ? 11 : 12,
                    color: "#666",
                  }}
                >
                  Buat dan kelola kuesioner motivasi siswa
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

              {hasResponses && (
                <Button
                  icon={<ExportOutlined />}
                  onClick={onExportData}
                  size={isMobile ? "middle" : "large"}
                  style={{
                    borderRadius: 8,
                    borderColor: "#52c41a",
                    color: "#52c41a",
                    background: "white",
                    fontWeight: 600,
                    minWidth: isMobile ? 80 : 120,
                    height: isMobile ? 40 : 44,
                    boxShadow: "0 2px 4px rgba(82, 196, 26, 0.1)",
                  }}
                >
                  {isMobile ? "Export" : "📊 Export Data"}
                </Button>
              )}

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={onCreateQuestionnaire}
                size={isMobile ? "middle" : "large"}
                style={{
                  borderRadius: 8,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                  fontWeight: 600,
                  minWidth: isMobile ? 120 : 160,
                  height: isMobile ? 40 : 44,
                }}
              >
                {isMobile ? "➕ Buat" : "📝 Buat Kuesioner"}
              </Button>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ARCSControlPanel;
