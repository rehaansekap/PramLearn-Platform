import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Tabs,
  Alert,
  Spin,
  Button,
  Space,
  Row,
  Col,
  Statistic,
  Tag,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  TeamOutlined,
  BarChartOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  FileOutlined,
  LoadingOutlined,
  UserOutlined,
  FormOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import useSessionMaterialDetail from "./hooks/useSessionMaterialDetail";
import SessionMaterialContentTab from "./components/SessionMaterialContentTab";
import SessionMaterialStudentsTab from "./components/SessionMaterialStudentsTab";
import SessionMaterialGroupsTab from "./components/SessionMaterialGroupsTab";
import SessionMaterialQuizzesTab from "./components/SessionMaterialQuizzesTab";
import SessionMaterialAssignmentsTab from "./components/SessionMaterialAssignmentsTab";
import SessionMaterialAnalyticsTab from "./components/SessionMaterialAnalyticsTab";
import SessionMaterialARCSTab from "./components/SessionMaterialARCSTab";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const SessionMaterialDetailPage = () => {
  const { materialSlug } = useParams();
  const navigate = useNavigate();
  const { materialDetail, loading, error, refetch } =
    useSessionMaterialDetail(materialSlug);

  const [activeTab, setActiveTab] = useState("content");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleBack = () => {
    // Navigate back to sessions list or subject detail
    const subjectSlug = materialDetail?.material?.subject?.slug;
    if (subjectSlug) {
      navigate(`/teacher/sessions/${subjectSlug}`);
    } else {
      navigate("/teacher/sessions");
    }
  };

  const refreshMaterialDetail = async () => {
    await refetch(); // Ganti fetchMaterialDetail() dengan refetch()
  };

  const handleDataUpdate = async () => {
    try {
      await refreshMaterialDetail();
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  if (error) {
    return (
      <Card style={{ margin: "24px", borderRadius: 12 }}>
        <Alert
          message="Error"
          description="Gagal memuat detail materi. Silakan coba lagi."
          type="error"
          showIcon
          action={
            <Space>
              <Button onClick={() => refetch()}>Coba Lagi</Button>
              <Button onClick={handleBack}>Kembali</Button>
            </Space>
          }
        />
      </Card>
    );
  }

  if (loading && !materialDetail) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin indicator={antIcon} />
        <p style={{ marginTop: 16, color: "#666" }}>Memuat detail materi...</p>
      </div>
    );
  }

  if (!materialDetail) {
    return (
      <Card style={{ margin: "24px", borderRadius: 12 }}>
        <Alert
          message="Material Tidak Ditemukan"
          description="Material yang Anda cari tidak dapat ditemukan."
          type="warning"
          showIcon
          action={<Button onClick={handleBack}>Kembali</Button>}
        />
      </Card>
    );
  }

  const { material, statistics } = materialDetail;

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Back Button */}
      <div style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{ borderRadius: 8 }}
        >
          Kembali ke Pertemuan
        </Button>
      </div>

      {/* Material Header */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 12,
          background: "linear-gradient(135deg, #11418b 0%, #1677ff 100%)",
          border: "none",
          color: "white",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <Row align="middle" justify="space-between" gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileTextOutlined style={{ fontSize: 24, color: "white" }} />
                <Title level={3} style={{ color: "white", margin: 0 }}>
                  {material.title}
                </Title>
              </div>

              <Space wrap size="middle">
                <Tag
                  color="blue-inverse"
                  style={{ color: "#1677ff", background: "white" }}
                >
                  {material.subject.name}
                </Tag>
                <Tag
                  color="green-inverse"
                  style={{ color: "#52c41a", background: "white" }}
                >
                  {material.class.name}
                </Tag>
              </Space>

              <Text style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 14 }}>
                Dibuat:{" "}
                {new Date(material.created_at).toLocaleDateString("id-ID")}
              </Text>
            </Space>
          </Col>

          <Col xs={24} lg={8}>
            <Row gutter={[16, 8]}>
              <Col xs={12} sm={6} lg={12}>
                <Statistic
                  title="Total Siswa"
                  value={statistics.total_students}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: "white", fontSize: isMobile ? 18 : 24 }}
                />
              </Col>
              <Col xs={12} sm={6} lg={12}>
                <Statistic
                  title="Kehadiran"
                  value={statistics.attendance_rate}
                  suffix="%"
                  valueStyle={{ color: "white", fontSize: isMobile ? 18 : 24 }}
                />
              </Col>
              <Col xs={12} sm={6} lg={12}>
                <Statistic
                  title="Progress"
                  value={statistics.average_progress}
                  suffix="%"
                  valueStyle={{ color: "white", fontSize: isMobile ? 18 : 24 }}
                />
              </Col>
              <Col xs={12} sm={6} lg={12}>
                <Statistic
                  title="Konten"
                  value={
                    statistics.content_stats.pdf_files +
                    statistics.content_stats.videos +
                    statistics.content_stats.quizzes +
                    statistics.content_stats.assignments
                  }
                  valueStyle={{ color: "white", fontSize: isMobile ? 18 : 24 }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Content Tabs */}
      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          size="large"
          style={{ marginBottom: 0 }}
          tabBarStyle={{
            margin: 0,
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 16,
            background: "#fafafa",
            borderRadius: "12px 12px 0 0",
          }}
        >
          <TabPane
            tab={
              <span>
                <FileOutlined />
                {!isMobile && " Konten"}
              </span>
            }
            key="content"
          >
            <div style={{ padding: "24px" }}>
              <SessionMaterialContentTab
                materialSlug={materialSlug}
                materialDetail={materialDetail}
              />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <UserOutlined />
                {!isMobile && " Siswa"}
              </span>
            }
            key="students"
          >
            <div style={{ padding: "24px" }}>
              <SessionMaterialStudentsTab
                materialSlug={materialSlug}
                students={materialDetail.students}
                statistics={statistics}
                onDataUpdate={handleDataUpdate}
              />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <TeamOutlined />
                {!isMobile && " Kelompok"}
              </span>
            }
            key="groups"
          >
            <div style={{ padding: "24px" }}>
              <SessionMaterialGroupsTab
                materialSlug={materialSlug}
                groups={materialDetail.groups}
                students={materialDetail.students}
                onGroupsChanged={handleDataUpdate}
              />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <QuestionCircleOutlined />
                {!isMobile && " Quiz"}
              </span>
            }
            key="quizzes"
          >
            <div style={{ padding: "24px" }}>
              <SessionMaterialQuizzesTab
                materialSlug={materialSlug}
                quizzes={materialDetail.quizzes}
                groups={materialDetail.groups}
              />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <FileTextOutlined />
                {!isMobile && " Tugas"}
              </span>
            }
            key="assignments"
          >
            <div style={{ padding: "24px" }}>
              <SessionMaterialAssignmentsTab
                materialSlug={materialSlug}
                assignments={materialDetail.assignments}
                students={materialDetail.students}
              />
            </div>
          </TabPane>
          <TabPane
            tab={
              <span>
                <FormOutlined />
                {!isMobile && " Kuesioner ARCS"}
              </span>
            }
            key="arcs"
          >
            <div style={{ padding: "24px" }}>
              <SessionMaterialARCSTab materialSlug={materialSlug} />
            </div>
          </TabPane>
          <TabPane
            tab={
              <span>
                <BarChartOutlined />
                {!isMobile && " Analitik"}
              </span>
            }
            key="analytics"
          >
            <div style={{ padding: "24px" }}>
              <SessionMaterialAnalyticsTab
                materialSlug={materialSlug}
                materialDetail={materialDetail}
                statistics={statistics}
              />
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Loading overlay untuk refresh */}
      {loading && materialDetail && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <Spin indicator={antIcon} tip="Memperbarui data..." />
        </div>
      )}
    </div>
  );
};

export default SessionMaterialDetailPage;
