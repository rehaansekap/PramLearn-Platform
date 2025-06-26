import React from "react";
import {
  Card,
  Typography,
  Collapse,
  Space,
  Button,
  Tag,
  Spin,
  Empty,
} from "antd";
import {
  FileOutlined,
  PlayCircleOutlined,
  FormOutlined,
  EyeOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import useSessionMaterialContent from "../hooks/useSessionMaterialContent";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const SessionMaterialContentTab = ({ materialSlug, materialDetail }) => {
  const { content, loading, error } = useSessionMaterialContent(materialSlug);

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

  // Component untuk wrapper konten accordion
  const AccordionContent = ({ children }) => (
    <div
      style={{
        border: "2px dashed #d9d9d9",
        borderRadius: "8px",
        padding: "24px",
        margin: "16px 0",
        backgroundColor: "#fafafa",
        minHeight: "200px",
      }}
    >
      {children}
    </div>
  );

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin indicator={antIcon} />
        <p style={{ marginTop: 16, color: "#666" }}>Memuat konten materi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card style={{ borderRadius: 12 }}>
        <Empty
          description="Gagal memuat konten materi"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  if (!content) {
    return (
      <Card style={{ borderRadius: 12 }}>
        <Empty
          description="Konten tidak tersedia"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <FileOutlined
          style={{ fontSize: 32, color: "#11418b", marginBottom: 16 }}
        />
        <Title level={3} style={{ color: "#11418b", margin: 0 }}>
          Konten Pembelajaran
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Kelola dan lihat semua konten dalam materi ini
        </Text>
      </div>

      {/* Content Sections */}
      <Collapse ghost>
        {/* PDF Files */}
        <Panel
          header={
            <Space>
              <FileOutlined style={{ color: "#1890ff" }} />
              <Text strong>File PDF ({content.pdf_files?.length || 0})</Text>
            </Space>
          }
          key="files"
        >
          <AccordionContent>
            {content.pdf_files && content.pdf_files.length > 0 ? (
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="middle"
              >
                {content.pdf_files.map((file, index) => (
                  <Card
                    key={index}
                    size="small"
                    style={{
                      border: "1px solid #e8e8e8",
                      borderRadius: 8,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    hoverable
                    onClick={() => openPdfFile(file.url)}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Space>
                        <FileOutlined
                          style={{ color: "#1890ff", fontSize: 20 }}
                        />
                        <div>
                          <Text strong style={{ display: "block" }}>
                            {file.name}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {file.size
                              ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                              : "Unknown size"}{" "}
                            • Diupload:{" "}
                            {new Date(file.uploaded_at).toLocaleDateString(
                              "id-ID"
                            )}
                          </Text>
                        </div>
                      </Space>
                      <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          openPdfFile(file.url);
                        }}
                      >
                        Buka
                      </Button>
                    </div>
                  </Card>
                ))}
              </Space>
            ) : (
              <Empty
                description="Tidak ada file PDF"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </AccordionContent>
        </Panel>

        {/* YouTube Videos */}
        <Panel
          header={
            <Space>
              <PlayCircleOutlined style={{ color: "#ff4d4f" }} />
              <Text strong>
                Video YouTube ({content.youtube_videos?.length || 0})
              </Text>
            </Space>
          }
          key="videos"
        >
          <AccordionContent>
            {content.youtube_videos && content.youtube_videos.length > 0 ? (
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="large"
              >
                {content.youtube_videos
                  .filter((video) => video.url && video.url.trim())
                  .map((video, index) => {
                    const embedUrl =
                      video.embed_url || getYouTubeEmbedUrl(video.url);
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
                                <PlayCircleOutlined
                                  style={{ color: "#ff4d4f" }}
                                />
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
                              <PlayCircleOutlined
                                style={{ color: "#ff4d4f" }}
                              />
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
              <Empty
                description="Tidak ada video YouTube"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </AccordionContent>
        </Panel>

        {/* Google Forms */}
        <Panel
          header={
            <Space>
              <FormOutlined style={{ color: "#52c41a" }} />
              <Text strong>Google Form ARCS</Text>
            </Space>
          }
          key="forms"
        >
          <AccordionContent>
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              {/* ARCS Awal */}
              <Card
                size="small"
                title={
                  <Space>
                    <FormOutlined style={{ color: "#52c41a" }} />
                    <Text strong>ARCS Assessment Awal</Text>
                  </Space>
                }
                style={{ borderRadius: 8 }}
              >
                {content.google_forms?.arcs_awal ? (
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
                          content.google_forms.arcs_awal
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
                  <Empty
                    description="Tidak ada Google Form ARCS Awal"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </Card>

              {/* ARCS Akhir */}
              <Card
                size="small"
                title={
                  <Space>
                    <FormOutlined style={{ color: "#52c41a" }} />
                    <Text strong>ARCS Assessment Akhir</Text>
                  </Space>
                }
                style={{ borderRadius: 8 }}
              >
                {content.google_forms?.arcs_akhir ? (
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
                          content.google_forms.arcs_akhir
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
                  <Empty
                    description="Tidak ada Google Form ARCS Akhir"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </Card>
            </Space>
          </AccordionContent>
        </Panel>
      </Collapse>
    </div>
  );
};

export default SessionMaterialContentTab;
