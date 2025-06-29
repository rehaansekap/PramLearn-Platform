import React from "react";
import { Card, Typography, Space, Tag, Button, Collapse, Divider } from "antd";
import {
  FileTextOutlined,
  YoutubeOutlined,
  LinkOutlined,
  EyeOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const SessionMaterialDetail = ({ material }) => {
  const openPdfFile = (fileUrl) => {
    window.open(fileUrl, "_blank");
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;

    const videoId = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null;
  };

  const getGoogleFormEmbedUrl = (url) => {
    if (!url) return null;

    if (url.includes("/viewform")) {
      return url.replace("/viewform", "/viewform?embedded=true");
    }
    return url;
  };

  return (
    <div style={{ padding: "24px 0" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <FileTextOutlined
          style={{ fontSize: 32, color: "#11418b", marginBottom: 16 }}
        />
        <Title level={3} style={{ color: "#11418b", margin: 0 }}>
          {material.title}
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Detail materi pembelajaran
        </Text>
      </div>

      {/* Content */}
      <Collapse defaultActiveKey={["files", "videos", "forms"]} ghost>
        {/* PDF Files */}
        <Panel
          header={
            <Space>
              <FileTextOutlined style={{ color: "#1890ff" }} />
              <Text strong>File PDF ({material.pdf_files?.length || 0})</Text>
            </Space>
          }
          key="files"
        >
          {material.pdf_files && material.pdf_files.length > 0 ? (
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              {material.pdf_files.map((file, index) => (
                <Card
                  key={index}
                  size="small"
                  style={{
                    border: "1px solid #e8e8e8",
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Space>
                      <FileTextOutlined style={{ color: "#1890ff" }} />
                      <Text>
                        {file.file?.split("/").pop() || `PDF File ${index + 1}`}
                      </Text>
                    </Space>
                    <Button
                      type="primary"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => openPdfFile(file.file)}
                    >
                      Buka
                    </Button>
                  </div>
                </Card>
              ))}
            </Space>
          ) : (
            <Text type="secondary">Tidak ada file PDF</Text>
          )}
        </Panel>

        {/* YouTube Videos */}
        <Panel
          header={
            <Space>
              <YoutubeOutlined style={{ color: "#ff4d4f" }} />
              <Text strong>
                Video YouTube ({material.youtube_videos?.length || 0})
              </Text>
            </Space>
          }
          key="videos"
        >
          {material.youtube_videos && material.youtube_videos.length > 0 ? (
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              {material.youtube_videos
                .filter((video) => video.url && video.url.trim())
                .map((video, index) => {
                  const embedUrl = getYouTubeEmbedUrl(video.url);
                  return (
                    <Card
                      key={index}
                      size="small"
                      style={{
                        border: "1px solid #e8e8e8",
                        borderRadius: 8,
                      }}
                    >
                      {embedUrl ? (
                        <div>
                          <div style={{ marginBottom: 12 }}>
                            <Space>
                              <YoutubeOutlined style={{ color: "#ff4d4f" }} />
                              <Text strong>Video {index + 1}</Text>
                            </Space>
                          </div>
                          <div
                            style={{
                              position: "relative",
                              paddingBottom: "56.25%",
                              height: 0,
                              overflow: "hidden",
                              borderRadius: 8,
                            }}
                          >
                            <iframe
                              src={embedUrl}
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                border: "none",
                                borderRadius: 8,
                              }}
                              allowFullScreen
                              title={`YouTube Video ${index + 1}`}
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Space>
                            <YoutubeOutlined style={{ color: "#ff4d4f" }} />
                            <Text>
                              Video {index + 1}: {video.url}
                            </Text>
                          </Space>
                          <div style={{ marginTop: 8 }}>
                            <Tag color="orange">URL tidak valid</Tag>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
            </Space>
          ) : (
            <Text type="secondary">Tidak ada video YouTube</Text>
          )}
        </Panel>

        {/* Google Forms */}
        {/* <Panel
          header={
            <Space>
              <LinkOutlined style={{ color: "#52c41a" }} />
              <Text strong>Google Form ARCS</Text>
            </Space>
          }
          key="forms"
        >
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <Card
              size="small"
              title={
                <Space>
                  <LinkOutlined style={{ color: "#52c41a" }} />
                  <Text strong>ARCS Assessment Awal</Text>
                </Space>
              }
              style={{ borderRadius: 8 }}
            >
              {material.google_form_embed_arcs_awal ? (
                <div>
                  <Paragraph>
                    <Text type="secondary">
                      Form untuk mengukur tingkat motivasi siswa sebelum
                      pembelajaran.
                    </Text>
                  </Paragraph>
                  <div
                    style={{
                      border: "1px solid #e8e8e8",
                      borderRadius: 8,
                      overflow: "hidden",
                      height: "400px",
                    }}
                  >
                    <iframe
                      src={getGoogleFormEmbedUrl(
                        material.google_form_embed_arcs_awal
                      )}
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                      }}
                      title="Google Form ARCS Awal"
                    />
                  </div>
                </div>
              ) : (
                <Text type="secondary">Tidak ada Google Form ARCS Awal</Text>
              )}
            </Card>

            <Card
              size="small"
              title={
                <Space>
                  <LinkOutlined style={{ color: "#52c41a" }} />
                  <Text strong>ARCS Assessment Akhir</Text>
                </Space>
              }
              style={{ borderRadius: 8 }}
            >
              {material.google_form_embed_arcs_akhir ? (
                <div>
                  <Paragraph>
                    <Text type="secondary">
                      Form untuk mengukur tingkat motivasi siswa setelah
                      pembelajaran.
                    </Text>
                  </Paragraph>
                  <div
                    style={{
                      border: "1px solid #e8e8e8",
                      borderRadius: 8,
                      overflow: "hidden",
                      height: "400px",
                    }}
                  >
                    <iframe
                      src={getGoogleFormEmbedUrl(
                        material.google_form_embed_arcs_akhir
                      )}
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                      }}
                      title="Google Form ARCS Akhir"
                    />
                  </div>
                </div>
              ) : (
                <Text type="secondary">Tidak ada Google Form ARCS Akhir</Text>
              )}
            </Card>
          </Space>
        </Panel> */}
      </Collapse>
    </div>
  );
};

export default SessionMaterialDetail;
