import React, { useState } from "react";
import {
  Card,
  Typography,
  Space,
  Button,
  Empty,
  Row,
  Col,
  Tag,
  Modal,
} from "antd";
import {
  PlayCircleOutlined,
  FullscreenOutlined,
  LinkOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const VideoSection = ({
  videos = [],
  getYouTubeEmbedUrl,
  isMobile = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const validVideos = videos.filter((video) => video.url && video.url.trim());

  const handleFullScreen = (video, embedUrl) => {
    setSelectedVideo({ ...video, embedUrl });
    setModalVisible(true);
  };

  const getVideoTitle = (video, index) => {
    if (video.title) return video.title;
    return `Video Pembelajaran ${index + 1}`;
  };

  const getVideoId = (url) => {
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    return match ? match[1] : null;
  };

  const getThumbnailUrl = (url) => {
    const videoId = getVideoId(url);
    return videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : null;
  };

  if (validVideos.length === 0) {
    return (
      <div
        style={{
          background: "linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%)",
          borderRadius: 16,
          padding: isMobile ? 24 : 32,
          textAlign: "center",
          border: "2px dashed #ffccc7",
        }}
      >
        <div
          style={{
            background: "rgba(255, 77, 77, 0.1)",
            width: isMobile ? 60 : 80,
            height: isMobile ? 60 : 80,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            marginBottom: 16,
          }}
        >
          <PlayCircleOutlined
            style={{
              fontSize: isMobile ? 24 : 32,
              color: "#ff4d4f",
            }}
          />
        </div>
        <Empty
          description={
            <Text style={{ color: "#666", fontSize: isMobile ? 14 : 16 }}>
              Belum ada video pembelajaran yang ditambahkan
            </Text>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          background: "linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%)",
          borderRadius: 16,
          padding: isMobile ? 16 : 24,
          border: "1px solid #ffecec",
        }}
      >
        <Row gutter={[16, 16]}>
          {validVideos.map((video, index) => {
            const embedUrl = video.embed_url || getYouTubeEmbedUrl(video.url);
            const thumbnailUrl = getThumbnailUrl(video.url);

            return (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card
                  style={{
                    borderRadius: 12,
                    border: "1px solid #f0f0f0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    overflow: "hidden",
                    background: "white",
                  }}
                  bodyStyle={{
                    padding: 0,
                  }}
                  hoverable
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 24px rgba(255, 77, 77, 0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0,0,0,0.06)";
                  }}
                >
                  {embedUrl ? (
                    <>
                      {/* Video Thumbnail/Preview */}
                      <div
                        style={{
                          position: "relative",
                          paddingBottom: "56.25%",
                          height: 0,
                          overflow: "hidden",
                          background: thumbnailUrl
                            ? `url(${thumbnailUrl}) center/cover`
                            : "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)",
                          cursor: "pointer",
                        }}
                        onClick={() => handleFullScreen(video, embedUrl)}
                      >
                        {/* Play Button Overlay */}
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            background: "rgba(0, 0, 0, 0.7)",
                            borderRadius: "50%",
                            width: isMobile ? 60 : 80,
                            height: isMobile ? 60 : 80,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.3s ease",
                            backdropFilter: "blur(4px)",
                          }}
                        >
                          <PlayCircleOutlined
                            style={{
                              fontSize: isMobile ? 24 : 32,
                              color: "white",
                            }}
                          />
                        </div>

                        {/* Duration Badge (if available) */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: 8,
                            right: 8,
                            background: "rgba(0, 0, 0, 0.8)",
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: 500,
                          }}
                        >
                          HD
                        </div>
                      </div>

                      {/* Video Info */}
                      <div style={{ padding: isMobile ? 12 : 16 }}>
                        <Space
                          direction="vertical"
                          size="small"
                          style={{ width: "100%" }}
                        >
                          <Text
                            strong
                            style={{
                              fontSize: isMobile ? 14 : 16,
                              color: "#262626",
                              display: "block",
                              wordBreak: "break-word",
                              lineHeight: 1.4,
                            }}
                          >
                            {getVideoTitle(video, index).length >
                            (isMobile ? 25 : 30)
                              ? `${getVideoTitle(video, index).substring(
                                  0,
                                  isMobile ? 25 : 30
                                )}...`
                              : getVideoTitle(video, index)}
                          </Text>

                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 6,
                            }}
                          >
                            <Tag
                              color="red"
                              style={{
                                fontSize: 11,
                                padding: "2px 8px",
                                borderRadius: 12,
                              }}
                            >
                              🎥 YouTube
                            </Tag>
                            <Tag
                              color="orange"
                              style={{
                                fontSize: 11,
                                padding: "2px 8px",
                                borderRadius: 12,
                              }}
                            >
                              📺 Video
                            </Tag>
                          </div>

                          {/* Action Buttons */}
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              marginTop: 8,
                              flexDirection: isMobile ? "column" : "row",
                            }}
                          >
                            <Button
                              type="primary"
                              icon={<FullscreenOutlined />}
                              onClick={() => handleFullScreen(video, embedUrl)}
                              style={{
                                borderRadius: 8,
                                fontWeight: 500,
                                flex: 1,
                                height: isMobile ? 32 : 36,
                                background:
                                  "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)",
                                border: "none",
                              }}
                              size={isMobile ? "small" : "middle"}
                            >
                              {isMobile ? "Tonton" : "Tonton Video"}
                            </Button>
                            <Button
                              icon={<LinkOutlined />}
                              onClick={() => window.open(video.url, "_blank")}
                              style={{
                                borderRadius: 8,
                                borderColor: "#ff4d4f",
                                color: "#ff4d4f",
                                fontWeight: 500,
                                height: isMobile ? 32 : 36,
                              }}
                              size={isMobile ? "small" : "middle"}
                            >
                              {!isMobile && "YouTube"}
                            </Button>
                          </div>
                        </Space>
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: isMobile ? 12 : 16 }}>
                      <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                      >
                        <div
                          style={{
                            background: "#fff2f0",
                            borderRadius: 8,
                            padding: 16,
                            textAlign: "center",
                            border: "1px dashed #ffccc7",
                          }}
                        >
                          <PlayCircleOutlined
                            style={{
                              fontSize: 32,
                              color: "#ff4d4f",
                              marginBottom: 8,
                            }}
                          />
                          <Text
                            style={{
                              display: "block",
                              fontSize: 14,
                              color: "#262626",
                              marginBottom: 8,
                            }}
                          >
                            {getVideoTitle(video, index)}
                          </Text>
                          <Tag color="orange">URL tidak valid</Tag>
                        </div>
                      </Space>
                    </div>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>

      {/* Full Screen Video Modal */}
      <Modal
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedVideo(null);
        }}
        footer={null}
        width="90%"
        style={{ maxWidth: 1200 }}
        centered
        destroyOnClose
        title={
          <Space>
            <PlayCircleOutlined style={{ color: "#ff4d4f" }} />
            <span>
              {selectedVideo ? getVideoTitle(selectedVideo, 0) : "Video"}
            </span>
          </Space>
        }
      >
        {selectedVideo && (
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
              src={selectedVideo.embedUrl}
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
              title={getVideoTitle(selectedVideo, 0)}
            />
          </div>
        )}
      </Modal>
    </>
  );
};

export default VideoSection;
