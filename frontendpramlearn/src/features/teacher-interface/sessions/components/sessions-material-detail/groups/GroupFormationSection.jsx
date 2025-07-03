import React, { useState } from "react";
import {
  Card,
  Button,
  Alert,
  Typography,
  Space,
  Tooltip,
  Row,
  Col,
} from "antd";
import {
  TeamOutlined,
  LoadingOutlined,
  UsergroupAddOutlined,
  InfoCircleOutlined,
  ExperimentOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import useSessionGroupFormation from "../../../hooks/useSessionGroupFormation";

const { Title, Text } = Typography;

const GroupFormationSection = ({
  materialSlug,
  students,
  onGroupsChanged,
  isMobile = false,
}) => {
  const { groupMessage, groupProcessing, handleAutoGroup } =
    useSessionGroupFormation(materialSlug, onGroupsChanged);

  const handleCreateHomogen = async () => {
    try {
      await handleAutoGroup("homogen");
      if (onGroupsChanged) onGroupsChanged();
    } catch (error) {
      console.error("Error creating homogeneous groups:", error);
    }
  };

  const handleCreateHeterogen = async () => {
    try {
      await handleAutoGroup("heterogen");
      if (onGroupsChanged) onGroupsChanged();
    } catch (error) {
      console.error("Error creating heterogeneous groups:", error);
    }
  };

  const hasStudents = students && students.length > 0;

  return (
    <Card
      style={{
        borderRadius: 16,
        border: "2px dashed #e6f7ff",
        background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
        overflow: "hidden",
        position: "relative",
        marginTop: 24,
      }}
      bodyStyle={{ padding: isMobile ? "20px" : "32px" }}
    >
      {/* Background Pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "url(data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23667eea' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='8'/%3E%3Ccircle cx='10' cy='10' r='4'/%3E%3Ccircle cx='50' cy='50' r='4'/%3E%3C/g%3E%3C/svg%3E)",
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        {/* Header */}
        <div style={{ marginBottom: isMobile ? 24 : 32 }}>
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "50%",
              width: isMobile ? 80 : 100,
              height: isMobile ? 80 : 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              marginBottom: isMobile ? 16 : 20,
              boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
            }}
          >
            <UsergroupAddOutlined
              style={{
                fontSize: isMobile ? 32 : 40,
                color: "white",
              }}
            />
          </div>

          <Title
            level={isMobile ? 5 : 4}
            style={{
              margin: 0,
              marginBottom: 8,
              color: "#262626",
              fontSize: isMobile ? 18 : 22,
              fontWeight: 700,
            }}
          >
            Pembentukan Kelompok Otomatis
          </Title>

          <Text
            style={{
              fontSize: isMobile ? 13 : 15,
              color: "#666",
              display: "block",
              maxWidth: 400,
              margin: "0 auto",
            }}
          >
            Bentuk kelompok berdasarkan profil motivasi ARCS siswa secara
            otomatis
          </Text>
        </div>

        {/* Formation Methods */}
        <Row gutter={[16, 16]} style={{ marginBottom: isMobile ? 24 : 32 }}>
          <Col xs={24} sm={12}>
            <Card
              style={{
                borderRadius: 12,
                border: "1px solid #52c41a30",
                background: "white",
                height: "100%",
                cursor: hasStudents ? "pointer" : "not-allowed",
                transition: "all 0.3s ease",
                opacity: hasStudents ? 1 : 0.6,
              }}
              bodyStyle={{
                padding: isMobile ? "16px" : "20px",
                textAlign: "center",
              }}
              hoverable={hasStudents}
              onClick={hasStudents ? handleCreateHomogen : undefined}
            >
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                  borderRadius: "50%",
                  width: isMobile ? 50 : 60,
                  height: isMobile ? 50 : 60,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  marginBottom: 12,
                }}
              >
                <TeamOutlined
                  style={{
                    color: "white",
                    fontSize: isMobile ? 20 : 24,
                  }}
                />
              </div>

              <Title
                level={5}
                style={{ margin: 0, marginBottom: 8, color: "#52c41a" }}
              >
                Kelompok Homogen
              </Title>

              <Text style={{ fontSize: isMobile ? 11 : 12, color: "#666" }}>
                Siswa dengan tingkat motivasi yang <strong>sama</strong>
              </Text>

              <div style={{ marginTop: 12 }}>
                <Button
                  type="primary"
                  icon={
                    groupProcessing ? <LoadingOutlined /> : <SyncOutlined />
                  }
                  onClick={handleCreateHomogen}
                  loading={groupProcessing}
                  disabled={!hasStudents}
                  size={isMobile ? "middle" : "large"}
                  style={{
                    background:
                      "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    width: "100%",
                  }}
                >
                  Bentuk Homogen
                </Button>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12}>
            <Card
              style={{
                borderRadius: 12,
                border: "1px solid #1677ff30",
                background: "white",
                height: "100%",
                cursor: hasStudents ? "pointer" : "not-allowed",
                transition: "all 0.3s ease",
                opacity: hasStudents ? 1 : 0.6,
              }}
              bodyStyle={{
                padding: isMobile ? "16px" : "20px",
                textAlign: "center",
              }}
              hoverable={hasStudents}
              onClick={hasStudents ? handleCreateHeterogen : undefined}
            >
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #1677ff 0%, #096dd9 100%)",
                  borderRadius: "50%",
                  width: isMobile ? 50 : 60,
                  height: isMobile ? 50 : 60,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  marginBottom: 12,
                }}
              >
                <ExperimentOutlined
                  style={{
                    color: "white",
                    fontSize: isMobile ? 20 : 24,
                  }}
                />
              </div>

              <Title
                level={5}
                style={{ margin: 0, marginBottom: 8, color: "#1677ff" }}
              >
                Kelompok Heterogen
              </Title>

              <Text style={{ fontSize: isMobile ? 11 : 12, color: "#666" }}>
                Siswa dengan tingkat motivasi yang <strong>beragam</strong>
              </Text>

              <div style={{ marginTop: 12 }}>
                <Button
                  type="primary"
                  icon={
                    groupProcessing ? (
                      <LoadingOutlined />
                    ) : (
                      <ExperimentOutlined />
                    )
                  }
                  onClick={handleCreateHeterogen}
                  loading={groupProcessing}
                  disabled={!hasStudents}
                  size={isMobile ? "middle" : "large"}
                  style={{
                    background:
                      "linear-gradient(135deg, #1677ff 0%, #096dd9 100%)",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    width: "100%",
                  }}
                >
                  Bentuk Heterogen
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Message */}
        {groupMessage && (
          <Alert
            message={groupMessage}
            type={groupMessage.includes("berhasil") ? "success" : "info"}
            showIcon
            style={{
              marginBottom: 20,
              borderRadius: 8,
              textAlign: "left",
            }}
          />
        )}

        {/* Info Card */}
        <Card
          size="small"
          style={{
            background: "rgba(255, 255, 255, 0.8)",
            borderRadius: 12,
            border: "1px solid #d6e4ff",
            textAlign: "left",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <InfoCircleOutlined
              style={{
                color: "#1677ff",
                fontSize: 16,
                marginTop: 2,
                flexShrink: 0,
              }}
            />
            <div>
              <Text
                strong
                style={{
                  color: "#1677ff",
                  fontSize: isMobile ? 12 : 13,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                💡 Informasi Penting:
              </Text>
              <div
                style={{
                  fontSize: isMobile ? 11 : 12,
                  color: "#666",
                  lineHeight: 1.5,
                }}
              >
                <div style={{ marginBottom: 6 }}>
                  <strong>Homogen:</strong> Cocok untuk pembelajaran yang
                  memerlukan tingkat motivasi yang seragam
                </div>
                <div style={{ marginBottom: 6 }}>
                  <strong>Heterogen:</strong> Ideal untuk pembelajaran
                  kolaboratif dan peer learning
                </div>
                <div style={{ color: "#ff7875", fontStyle: "italic" }}>
                  * Pastikan profil motivasi ARCS siswa sudah dianalisis sebelum
                  membentuk kelompok
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Warning if no students */}
        {!hasStudents && (
          <Alert
            message="Tidak ada data siswa"
            description="Pastikan ada siswa yang terdaftar dalam kelas ini sebelum membentuk kelompok."
            type="warning"
            showIcon
            style={{
              marginTop: 20,
              borderRadius: 8,
              textAlign: "left",
            }}
          />
        )}
      </div>
    </Card>
  );
};

export default GroupFormationSection;
