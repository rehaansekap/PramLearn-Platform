import React, { useEffect, useCallback } from "react";
import { Row, Col, Typography } from "antd";
import { YoutubeOutlined } from "@ant-design/icons";
import VideoCard from "./VideoCard";
import VideoEmptyState from "./VideoEmptyState";

const { Text, Title } = Typography;

const StudentVideoPlayer = ({
  youtubeVideos,
  progress,
  updateProgress,
  onActivity,
}) => {
  const handleVideoPlay = useCallback(
    async (video, index) => {
      // Record aktivitas play video
      if (onActivity) {
        await onActivity("video_played", {
          position: index,
          videoUrl: video.url,
        });
      }

      // Update last video position dengan updater function
      if (updateProgress) {
        updateProgress((prev) => ({
          ...prev,
          last_position: index,
          last_video_position: 0,
        }));
      }
    },
    [onActivity, updateProgress]
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

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    // Setup player after API ready
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

  const validVideos = youtubeVideos.filter(
    (video) => video.url && video.url.trim()
  );

  if (!validVideos || validVideos.length === 0) {
    return <VideoEmptyState />;
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

          return (
            <Col xs={24} sm={12} lg={12} key={index}>
              <VideoCard
                video={video}
                index={index}
                progress={progress}
                embedUrl={embedUrl}
                onVideoPlay={handleVideoPlay}
                onVideoProgress={handleVideoProgress}
              />
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default StudentVideoPlayer;
