import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button, Spin, Alert, Tabs, Card, Typography } from "antd";
import {
  ArrowLeftOutlined,
  LoadingOutlined,
  BookOutlined,
  FileTextOutlined,
  FormOutlined,
} from "@ant-design/icons";
import useStudentMaterialAccess from "./hooks/useStudentMaterialAccess";
import StudentPDFViewer from "./components/StudentPDFViewer";
import StudentVideoPlayer from "./components/StudentVideoPlayer";
import MaterialProgressTracker from "./components/MaterialProgressTracker";
import ProgressDebugger from "./components/ProgressDebugger";
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
    recordActivity, // Gunakan ini
    addBookmark,
    removeBookmark,
  } = useStudentMaterialAccess(materialSlug);

  const [activeTab, setActiveTab] = useState("1");
  const [subjectData, setSubjectData] = useState(null);

  // Tambahkan useEffect untuk debugging
  useEffect(() => {
    if (material && materialId) {
      console.log("📊 Material loaded:", {
        materialId,
        title: material.title,
        pdfCount: material.pdf_files?.length || 0,
        videoCount: material.youtube_videos?.filter((v) => v.url)?.length || 0,
        currentProgress: progress.completion_percentage,
      });
    }
  }, [material, materialId, progress.completion_percentage]);

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
      <Alert
        message="Gagal memuat materi"
        description={
          error.message || "Terjadi kesalahan saat mengambil data materi."
        }
        type="error"
        showIcon
        style={{ margin: 16 }}
        action={
          <Button size="small" danger onClick={() => window.location.reload()}>
            Coba Lagi
          </Button>
        }
      />
    );
  }

  if (!material) {
    return (
      <Alert
        message="Materi tidak ditemukan"
        description="Materi yang Anda cari tidak tersedia."
        type="warning"
        showIcon
        style={{ margin: 16 }}
      />
    );
  }

  const hasPDFs = material.pdf_files && material.pdf_files.length > 0;
  const hasVideos =
    material.youtube_videos && material.youtube_videos.some((v) => v.url);
  const hasGoogleForms =
    material.google_form_embed_arcs_awal ||
    material.google_form_embed_arcs_akhir;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
      {/* Header - TANPA breadcrumb */}
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{ marginBottom: 16 }}
        >
          Kembali
        </Button>

        <Title level={2} style={{ color: "#11418b", margin: 0 }}>
          {material.title}
        </Title>

        <div
          style={{
            marginTop: 8,
            display: "flex",
            gap: 16,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {subjectData && (
            <Text type="secondary" style={{ fontSize: 14 }}>
              📚 {subjectData.name}
            </Text>
          )}
          <Text type="secondary">
            Progress: {Math.round(progress.completion_percentage || 0)}%
          </Text>
          <Text type="secondary">
            Waktu belajar: {Math.floor((progress.time_spent || 0) / 60)} menit
          </Text>
          {bookmarks.length > 0 && (
            <Text type="secondary">{bookmarks.length} bookmark</Text>
          )}
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        style={{ marginBottom: 24 }}
      >
        {hasPDFs && (
          <TabPane
            tab={
              <span>
                <FileTextOutlined />
                PDF ({material.pdf_files.length})
              </span>
            }
            key="1"
          >
            <StudentPDFViewer
              pdfFiles={material.pdf_files}
              progress={progress}
              updateProgress={updateProgress}
              onActivity={recordActivity} // Pass ini
              bookmarks={bookmarks}
              onAddBookmark={addBookmark}
              onRemoveBookmark={removeBookmark}
            />
          </TabPane>
        )}

        {hasVideos && (
          <TabPane
            tab={
              <span>
                <BookOutlined />
                Video ({material.youtube_videos.filter((v) => v.url).length})
              </span>
            }
            key="2"
          >
            <StudentVideoPlayer
              youtubeVideos={material.youtube_videos} // Ubah dari videoUrls ke youtubeVideos
              progress={progress}
              updateProgress={updateProgress}
              onActivity={recordActivity}
              bookmarks={bookmarks}
              onAddBookmark={addBookmark}
              onRemoveBookmark={removeBookmark}
            />
          </TabPane>
        )}

        {hasGoogleForms && (
          <TabPane
            tab={
              <span>
                <FormOutlined />
                Google Forms
              </span>
            }
            key="3"
          >
            <Card title="📝 Google Forms ARCS" style={{ marginBottom: 16 }}>
              {material.google_form_embed_arcs_awal && (
                <div style={{ marginBottom: 24 }}>
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
                </div>
              )}

              {material.google_form_embed_arcs_akhir && (
                <div>
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
                </div>
              )}
              {/* {process.env.NODE_ENV === "development" && (
                <ProgressDebugger
                  progress={progress}
                  recordActivity={recordActivity}
                  materialId={materialId}
                />
              )} */}
            </Card>
          </TabPane>
        )}
      </Tabs>

      {/* Progress Tracker */}
      <MaterialProgressTracker
        progress={progress}
        updateProgress={updateProgress}
        isActive={true}
      />
    </div>
  );
};

export default StudentMaterialViewer;
