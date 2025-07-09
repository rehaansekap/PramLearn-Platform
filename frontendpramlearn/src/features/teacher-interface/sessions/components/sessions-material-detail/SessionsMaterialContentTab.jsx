import React, { useState, useEffect } from "react";
import { Collapse, Space, Typography, Spin, Card, Empty } from "antd";
import {
  FileOutlined,
  PlayCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import useSessionMaterialContent from "../../hooks/useSessionMaterialContent";

// Import komponen secara langsung (bukan dari index.js)
import ContentHeader from "./content/ContentHeader";
import PDFFilesSection from "./content/PDFFilesSection";
import VideoSection from "./content/VideoSection";

const { Text } = Typography;
const { Panel } = Collapse;

const SessionsMaterialContentTab = ({ materialSlug, materialDetail }) => {
  const { content, loading, error } = useSessionMaterialContent(materialSlug);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeKeys, setActiveKeys] = useState(["files", "videos"]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const videoId = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null;
  };

  const openPdfFile = (fileUrl) => {
    window.open(fileUrl, "_blank");
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: isMobile ? "40px 16px" : "60px 24px",
          background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
          borderRadius: 16,
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "50%",
            padding: 20,
            marginBottom: 16,
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          }}
        >
          <Spin indicator={antIcon} />
        </div>
        <Text
          style={{
            color: "#666",
            fontSize: isMobile ? 14 : 16,
            fontWeight: 500,
          }}
        >
          Memuat konten materi...
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <Card
        style={{
          borderRadius: 16,
          border: "2px dashed #ffccc7",
          background: "linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%)",
        }}
      >
        <Empty
          description={
            <Text style={{ color: "#ff4d4f", fontSize: isMobile ? 14 : 16 }}>
              Gagal memuat konten materi
            </Text>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  if (!content) {
    return (
      <Card
        style={{
          borderRadius: 16,
          border: "2px dashed #d9d9d9",
          background: "#fafafa",
        }}
      >
        <Empty
          description={
            <Text style={{ color: "#666", fontSize: isMobile ? 14 : 16 }}>
              Konten tidak tersedia
            </Text>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  const panelStyle = {
    marginBottom: 16,
    background: "white",
    borderRadius: 16,
    border: "1px solid #f0f0f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    overflow: "hidden",
  };

  return (
    <div
      style={{
        // background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
        minHeight: "100vh",
        padding: isMobile ? 16 : 24,
        borderRadius: 16,
      }}
    >
      <ContentHeader isMobile={isMobile} />

      <Collapse
        ghost
        activeKey={activeKeys}
        onChange={setActiveKeys}
        expandIconPosition="end"
        style={{ background: "transparent" }}
      >
        {/* PDF Files Panel */}
        <Panel
          header={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: isMobile ? "12px 16px" : "16px 20px",
                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                borderRadius: 12,
                color: "white",
                margin: 0,
                fontWeight: 600,
                fontSize: isMobile ? 14 : 16,
              }}
            >
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  width: isMobile ? 32 : 40,
                  height: isMobile ? 32 : 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileOutlined
                  style={{
                    fontSize: isMobile ? 16 : 18,
                    color: "white",
                  }}
                />
              </div>
              <span>File PDF ({content.pdf_files?.length || 0})</span>
            </div>
          }
          key="files"
          style={panelStyle}
        >
          <div style={{ padding: isMobile ? 16 : 20 }}>
            <PDFFilesSection
              files={content.pdf_files}
              onFileOpen={openPdfFile}
              isMobile={isMobile}
            />
          </div>
        </Panel>

        {/* Video Panel */}
        <Panel
          header={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: isMobile ? "12px 16px" : "16px 20px",
                background: "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)",
                borderRadius: 12,
                color: "white",
                margin: 0,
                fontWeight: 600,
                fontSize: isMobile ? 14 : 16,
              }}
            >
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  width: isMobile ? 32 : 40,
                  height: isMobile ? 32 : 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PlayCircleOutlined
                  style={{
                    fontSize: isMobile ? 16 : 18,
                    color: "white",
                  }}
                />
              </div>
              <span>Video YouTube ({content.youtube_videos?.length || 0})</span>
            </div>
          }
          key="videos"
          style={panelStyle}
        >
          <div style={{ padding: isMobile ? 16 : 20 }}>
            <VideoSection
              videos={content.youtube_videos}
              getYouTubeEmbedUrl={getYouTubeEmbedUrl}
              isMobile={isMobile}
            />
          </div>
        </Panel>
      </Collapse>
    </div>
  );
};

export default SessionsMaterialContentTab;
