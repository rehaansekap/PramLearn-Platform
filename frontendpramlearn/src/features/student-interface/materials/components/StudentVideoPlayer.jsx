import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  List,
  Button,
  Typography,
  message,
  Alert,
  Row,
  Col,
  Tag,
  Space,
  Empty,
} from "antd";
import {
  PlayCircleOutlined,
  YoutubeOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

const StudentVideoPlayer = ({
  youtubeVideos,
  progress,
  onProgressUpdate,
  onActivity,
}) => {
  const playerRefs = useRef([]);
  const lastProgressUpdate = useRef({});

  // Handle video play callback
  const handleVideoPlay = useCallback(
    async (video, index) => {
      console.log(`🎬 Playing video at index ${index}:`, video.url);

      // Record aktivitas play video
      if (onActivity) {
        await onActivity("video_played", {
          position: index,
          videoUrl: video.url,
        });
      }

      // Update last video position
      if (onProgressUpdate) {
        onProgressUpdate({
          ...progress,
          last_position: index,
          last_video_position: 0,
        });
      }
    },
    [onActivity, onProgressUpdate, progress]
  );

  const handleVideoProgress = useCallback(
    (currentTime, duration, index) => {
      if (onActivity && duration > 0) {
        const progressPercent = (currentTime / duration) * 100;
        onActivity("video_progress", {
          currentTime,
          duration,
          position: index,
          progressPercent,
        });
      }
    },
    [onActivity]
  );

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  }, []);

  // Setup player after API ready
  useEffect(() => {
    window.onYouTubeIframeAPIReady = () => {
      youtubeVideos.forEach((video, index) => {
        const playerId = `yt-player-${index}`;
        const iframe = document.getElementById(playerId);
        if (iframe) {
          new window.YT.Player(playerId, {
            events: {
              onStateChange: (event) => {
                if (event.data === window.YT.PlayerState.PLAYING) {
                  handleVideoPlay(video, index);
                }
              },
            },
          });
        }
      });
    };
  }, [youtubeVideos, handleVideoPlay]);

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) return null;

    const startTime = progress.last_video_position || 0;
    return `https://www.youtube.com/embed/${videoId}?start=${startTime}&autoplay=0&rel=0&modestbranding=1&showinfo=0`;
  };

  const extractYouTubeVideoId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
      /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
      /(?:youtu\.be\/)([^&\n?#]+)/,
      /(?:youtube\.com\/v\/)([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const handleVideoTimeUpdate = useCallback(
    (event, index) => {
      const video = event.target;
      const currentTime = video.currentTime;
      const duration = video.duration;

      if (duration > 0) {
        const now = Date.now();
        if (
          !lastProgressUpdate.current[index] ||
          now - lastProgressUpdate.current[index] > 10000
        ) {
          handleVideoProgress(currentTime, duration, index);
          lastProgressUpdate.current[index] = now;
        }
      }
    },
    [handleVideoProgress]
  );

  const getVideoTitle = (url, index) => {
    return `YouTube Video ${index + 1}`;
  };

  const validVideos = youtubeVideos.filter(
    (video) => video.url && video.url.trim()
  );

  if (!validVideos || validVideos.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text style={{ fontSize: 16, color: "#666" }}>
                Tidak ada video tersedia
              </Text>
              <div style={{ marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Video pembelajaran akan tersedia setelah ditambahkan oleh guru
                </Text>
              </div>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <YoutubeOutlined
          style={{
            fontSize: 32,
            color: "#11418b",
            marginBottom: 12,
          }}
        />
        <Title
          level={4}
          style={{
            margin: 0,
            marginBottom: 8,
            color: "#11418b",
            fontSize: "20px",
            fontWeight: 700,
          }}
        >
          Video Pembelajaran
        </Title>
        <Text type="secondary" style={{ fontSize: "14px", color: "#666" }}>
          Tonton video pembelajaran untuk memahami materi dengan lebih baik
        </Text>
      </div>

      {/* Video Cards Grid */}
      <Row gutter={[16, 24]}>
        {validVideos.map((video, index) => {
          const embedUrl = getYouTubeEmbedUrl(video.url);
          const videoId = extractYouTubeVideoId(video.url);
          const playerId = `yt-player-${index}`;

          return (
            <Col xs={24} sm={12} lg={12} key={index}>
              <Card
                hoverable
                style={{
                  borderRadius: 16,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  height: "100%",
                  transition: "all 0.3s ease",
                }}
                bodyStyle={{ padding: "20px" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(255, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                }}
              >
                {/* Header dengan gradient YouTube */}
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #ff0000 0%, #ff4444 100%)",
                    padding: "16px",
                    margin: "-20px -20px 16px -20px",
                    color: "white",
                    borderRadius: "16px 16px 0 0",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: -5,
                      right: -5,
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.1)",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <YoutubeOutlined
                        style={{ fontSize: 24, marginBottom: 8 }}
                      />
                      <Title
                        level={5}
                        style={{
                          color: "white",
                          margin: 0,
                          fontSize: 16,
                          fontWeight: 600,
                        }}
                      >
                        {getVideoTitle(video.url, index)}
                      </Title>
                    </div>
                  </div>

                  {/* Video Info */}
                  <Space style={{ marginTop: 8 }}>
                    <PlayCircleOutlined style={{ fontSize: 12 }} />
                    <Text
                      style={{ color: "rgba(255,255,255,0.9)", fontSize: 12 }}
                    >
                      Video Pembelajaran
                    </Text>
                    {progress.last_position === index && (
                      <Text style={{ color: "#52c41a", fontSize: 12 }}>
                        📍 Terakhir diakses
                      </Text>
                    )}
                  </Space>
                </div>

                {/* Video Player */}
                <div style={{ marginBottom: 16 }}>
                  {embedUrl ? (
                    <div
                      style={{
                        position: "relative",
                        paddingTop: "56.25%",
                        borderRadius: 8,
                        overflow: "hidden",
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      <iframe
                        id={playerId}
                        src={`${embedUrl}&enablejsapi=1`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                        }}
                        title={`YouTube Video ${index + 1}`}
                        onTimeUpdate={(e) => handleVideoTimeUpdate(e, index)}
                      />
                    </div>
                  ) : (
                    <Alert
                      message="Video tidak dapat dimuat"
                      description="URL YouTube tidak valid atau video tidak tersedia"
                      type="warning"
                      showIcon
                      style={{ marginTop: 8 }}
                    />
                  )}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default StudentVideoPlayer;
