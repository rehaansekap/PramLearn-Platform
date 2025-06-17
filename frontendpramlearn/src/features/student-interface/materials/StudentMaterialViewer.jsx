import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Spin,
  Alert,
  Tabs,
  Card,
  Typography,
  Space,
  Row,
  Col,
  Progress,
  Breadcrumb,
  Tag,
} from "antd";
import {
  ArrowLeftOutlined,
  LoadingOutlined,
  BookOutlined,
  FileTextOutlined,
  FormOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import useStudentMaterialAccess from "./hooks/useStudentMaterialAccess";
import StudentPDFViewer from "./components/StudentPDFViewer";
import StudentVideoPlayer from "./components/StudentVideoPlayer";
import MaterialProgressTracker from "./components/MaterialProgressTracker";
import MaterialQuizList from "./components/MaterialQuizList";
import MaterialAssignmentList from "./components/MaterialAssignmentList";
import api from "../../../api";

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const StudentMaterialViewer = () => {
  const { materialSlug } = useParams();
  const {
    material,
    materialId,
    progress,
    bookmarks,
    loading,
    error,
    updateProgress,
    recordActivity,
    addBookmark,
    removeBookmark,
    isActivityCompleted,
  } = useStudentMaterialAccess(materialSlug);

  const [activeTab, setActiveTab] = useState("1");
  const [subjectData, setSubjectData] = useState(null);

  // Fetch subject data untuk info
  useEffect(() => {
    const fetchSubjectData = async () => {
      if (material && material.subject) {
        try {
          const response = await api.get(`subjects/${material.subject}/`);
          setSubjectData(response.data);
        } catch (error) {
          console.error("Failed to fetch subject data:", error);
        }
      }
    };
    fetchSubjectData();
  }, [material]);

  const handleBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />}
          tip="Memuat materi pembelajaran..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          margin: "24px",
          maxWidth: 1200,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Alert
          message="Gagal memuat materi"
          description={
            error.message || "Terjadi kesalahan saat mengambil data materi."
          }
          type="error"
          showIcon
          style={{ borderRadius: 12 }}
          action={
            <Space>
              <Button
                size="small"
                danger
                onClick={() => window.location.reload()}
              >
                Coba Lagi
              </Button>
              <Button size="small" onClick={handleBack}>
                Kembali
              </Button>
            </Space>
          }
        />
      </div>
    );
  }

  if (!material) {
    return (
      <div
        style={{
          margin: "24px",
          maxWidth: 1200,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Alert
          message="Materi tidak ditemukan"
          description="Materi yang Anda cari tidak tersedia."
          type="warning"
          showIcon
          style={{ borderRadius: 12 }}
        />
      </div>
    );
  }

  const hasPDFs = material.pdf_files && material.pdf_files.length > 0;
  const hasVideos =
    material.youtube_videos && material.youtube_videos.some((v) => v.url);
  const hasGoogleForms =
    material.google_form_embed_arcs_awal ||
    material.google_form_embed_arcs_akhir;

  const getProgressColor = (percent) => {
    if (percent >= 80) return "#52c41a";
    if (percent >= 60) return "#faad14";
    return "#ff4d4f";
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px 16px",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      {/* Breadcrumb - Konsisten dengan halaman lain */}
      <Breadcrumb
        style={{ marginBottom: 24 }}
        items={[
          {
            href: "/student",
            title: (
              <Space>
                <HomeOutlined />
                <span>Dashboard</span>
              </Space>
            ),
          },
          {
            href: "/student/subjects",
            title: (
              <Space>
                <BookOutlined />
                <span>My Subjects</span>
              </Space>
            ),
          },
          {
            title: (
              <Space>
                <FileTextOutlined />
                <span>{material.title}</span>
              </Space>
            ),
          },
        ]}
      />

      {/* Header Section - Konsisten dengan subjects */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)", // Sama dengan StudentLayout
          borderRadius: 16,
          padding: "32px 24px",
          marginBottom: 32,
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.05)",
          }}
        />

        <Row align="middle" style={{ position: "relative", zIndex: 1 }}>
          <Col xs={24} md={18}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "white",
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              Kembali
            </Button>

            <Title
              level={2}
              style={{ color: "white", margin: 0, marginBottom: 8 }}
            >
              {material.title}
            </Title>

            <Space
              size={16}
              wrap
              style={{
                marginBottom: 16,
                justifyContent: "center",
                width: "100%",
              }}
            >
              {subjectData && (
                <Space size={8}>
                  <BookOutlined />
                  <Text
                    style={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}
                  >
                    Mata Pelajaran: <strong>{subjectData.name}</strong>
                  </Text>
                </Space>
              )}
              <Space size={8}>
                <ClockCircleOutlined />
                <Text style={{ color: "rgba(255,255,255,0.9)" }}>
                  Waktu belajar: {Math.floor((progress.time_spent || 0) / 60)}{" "}
                  menit
                </Text>
              </Space>
            </Space>

            {/* Progress Section */}
            <div
              style={{
                marginBottom: 16,
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Space size={8} style={{ marginBottom: 8, marginRight: 16 }}>
                <TrophyOutlined />
                <Text
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  Progress Pembelajaran
                </Text>
              </Space>
              <Progress
                percent={Math.round(progress.completion_percentage || 0)}
                strokeColor={getProgressColor(
                  progress.completion_percentage || 0
                )}
                trailColor="rgba(255, 255, 255, 0.2)"
                showInfo={true}
                style={{
                  maxWidth: 400,
                  // Styling untuk teks persentase
                  color: "white",
                }}
                // Format teks persentase dengan style khusus
                format={(percent) => (
                  <span
                    style={{
                      color: "white",
                      fontWeight: 500,
                      fontSize: 14,
                      textShadow: "0 1px 2px rgba(0,0,0,0.3)", // Tambah shadow untuk kontras
                    }}
                  >
                    {percent}%
                  </span>
                )}
              />
            </div>
          </Col>
          <Col xs={24} md={6} style={{ textAlign: "center" }}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                borderRadius: 12,
                padding: 16,
                backdropFilter: "blur(10px)",
              }}
            >
              <PlayCircleOutlined style={{ fontSize: 32, marginBottom: 8 }} />
              <div style={{ fontSize: 14, opacity: 0.9 }}>
                Pembelajaran Interaktif
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Content Tabs - Redesigned */}
      <Card
        style={{
          borderRadius: 16,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          size="large"
          tabBarStyle={{
            margin: 0,
            background: "#fafafa",
            borderBottom: "1px solid #f0f0f0",
          }}
          style={{ minHeight: "60vh" }}
        >
          {hasPDFs && (
            <TabPane
              tab={
                <Space>
                  <FileTextOutlined />
                  <span>Dokumen PDF</span>
                  <Tag color="blue">{material.pdf_files.length}</Tag>
                </Space>
              }
              key="1"
            >
              <div style={{ padding: "24px" }}>
                <StudentPDFViewer
                  pdfFiles={material.pdf_files}
                  progress={progress}
                  updateProgress={updateProgress}
                  onActivity={recordActivity}
                />
              </div>
            </TabPane>
          )}

          {hasVideos && (
            <TabPane
              tab={
                <Space>
                  <PlayCircleOutlined />
                  <span>Video Pembelajaran</span>
                  <Tag color="green">
                    {material.youtube_videos.filter((v) => v.url).length}
                  </Tag>
                </Space>
              }
              key="2"
            >
              <div style={{ padding: "24px" }}>
                <StudentVideoPlayer
                  youtubeVideos={material.youtube_videos}
                  progress={progress}
                  updateProgress={updateProgress}
                  onActivity={recordActivity}
                />
              </div>
            </TabPane>
          )}

          <TabPane
            tab={
              <Space>
                <BookOutlined />
                <span>Quiz</span>
                <Tag color="purple">{(material.quizzes || []).length}</Tag>
              </Space>
            }
            key="quiz"
          >
            <div style={{ padding: "24px" }}>
              <MaterialQuizList
                quizzes={material.quizzes || []}
                material={material} // TAMBAHKAN INI - Pass material data
              />
            </div>
          </TabPane>

          <TabPane
            tab={
              <Space>
                <FileTextOutlined />
                <span>Assignment</span>
                <Tag color="orange">{(material.assignments || []).length}</Tag>
              </Space>
            }
            key="assignment"
          >
            <div style={{ padding: "24px" }}>
              <MaterialAssignmentList
                assignments={material.assignments || []}
                material={material} // TAMBAHKAN INI - Pass material data
              />
            </div>
          </TabPane>

          {hasGoogleForms && (
            <>
              {material.google_form_embed_arcs_awal && (
                <TabPane
                  tab={
                    <Space>
                      <FormOutlined />
                      <span>ARCS Awal</span>
                    </Space>
                  }
                  key="3"
                >
                  <div style={{ padding: "24px" }}>
                    <Card
                      title="📝 Google Form ARCS Awal"
                      style={{ borderRadius: 12 }}
                    >
                      <Title level={4}>ARCS Awal</Title>
                      <div
                        style={{
                          position: "relative",
                          paddingTop: "75%",
                          borderRadius: 8,
                          overflow: "hidden",
                        }}
                      >
                        <iframe
                          src={material.google_form_embed_arcs_awal}
                          frameBorder="0"
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                          }}
                          title="ARCS Awal Form"
                        />
                      </div>
                    </Card>
                  </div>
                </TabPane>
              )}

              {material.google_form_embed_arcs_akhir && (
                <TabPane
                  tab={
                    <Space>
                      <FormOutlined />
                      <span>ARCS Akhir</span>
                    </Space>
                  }
                  key="4"
                >
                  <div style={{ padding: "24px" }}>
                    <Card
                      title="📝 Google Form ARCS Akhir"
                      style={{ borderRadius: 12 }}
                    >
                      <Title level={4}>ARCS Akhir</Title>
                      <div
                        style={{
                          position: "relative",
                          paddingTop: "75%",
                          borderRadius: 8,
                          overflow: "hidden",
                        }}
                      >
                        <iframe
                          src={material.google_form_embed_arcs_akhir}
                          frameBorder="0"
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                          }}
                          title="ARCS Akhir Form"
                        />
                      </div>
                    </Card>
                  </div>
                </TabPane>
              )}
            </>
          )}
        </Tabs>
      </Card>

      {/* Progress Tracker - Updated position */}
      <MaterialProgressTracker
        progress={progress}
        updateProgress={updateProgress}
        isActive={true}
        material={material}
        isActivityCompleted={isActivityCompleted}
      />
    </div>
  );
};

export default StudentMaterialViewer;
