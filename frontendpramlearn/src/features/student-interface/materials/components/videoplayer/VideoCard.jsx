import React from "react";
import { Card, Typography, Space, Alert } from "antd";
import { YoutubeOutlined, PlayCircleOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

const VideoCard = ({
  video,
  index,
  progress,
  embedUrl,
  onVideoPlay,
  onVideoProgress,
}) => {
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

  const getVideoTitle = (url, index) => {
    return `Video Pembelajaran ${index + 1}`;
  };

  const playerId = `yt-player-${index}`;

  return (
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
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(255, 0, 0, 0.15)";
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
            "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
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
            <YoutubeOutlined style={{ fontSize: 24, marginBottom: 8 }} />
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
          <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 12 }}>
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
  );
};

export default VideoCard;
