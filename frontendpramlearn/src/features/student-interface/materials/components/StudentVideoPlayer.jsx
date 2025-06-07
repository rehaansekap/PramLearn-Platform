import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, List, Button, Typography, Tooltip, message, Alert } from "antd";
import {
  PlayCircleOutlined,
  StarOutlined,
  StarFilled,
} from "@ant-design/icons";

const { Text } = Typography;

const StudentVideoPlayer = ({
  youtubeVideos,
  progress,
  onProgressUpdate,
  bookmarks,
  onActivity,
  onAddBookmark,
  onRemoveBookmark,
}) => {
  const playerRefs = useRef([]);
  const lastProgressUpdate = useRef({});

  // 🔧 PERBAIKAN: Pindahkan handleVideoPlay ke atas sebelum useEffect
  const handleVideoPlay = useCallback(
    async (video, index) => {
      console.log(`🎬 Playing video at index ${index}:`, video.url);
      console.log(`🎬 Video activity key will be: video_played_${index}`);

      // Record aktivitas play video
      if (onActivity) {
        await onActivity("video_played", {
          position: index,
          videoUrl: video.url, // Tambahkan untuk debugging
        });
      }

      // Update last video position
      if (onProgressUpdate) {
        onProgressUpdate({
          ...progress,
          last_position: index,
          last_video_position: 0, // Reset video position
        });
      }
    },
    [onActivity, onProgressUpdate, progress]
  );

  // 🔧 PERBAIKAN: Pindahkan handleVideoProgress ke atas
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

  // Setup player after API ready - sekarang handleVideoPlay sudah defined
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
                  // ✅ Sekarang handleVideoPlay sudah available
                  handleVideoPlay(video, index);
                }
              },
            },
          });
        }
      });
    };
  }, [youtubeVideos, handleVideoPlay]); // Tambahkan handleVideoPlay ke dependencies

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) return null;

    // Add resume from last position if available
    const startTime = progress.last_video_position || 0;
    return `https://www.youtube.com/embed/${videoId}?start=${startTime}&autoplay=0&rel=0&modestbranding=1&showinfo=0`;
  };

  const extractYouTubeVideoId = (url) => {
    // Multiple regex patterns untuk berbagai format YouTube URL
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
        // Update progress setiap 10 detik
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

  const handleAddBookmark = async (video, index) => {
    try {
      await onAddBookmark({
        title: `Video: ${getVideoTitle(video.url)}`,
        content_type: "video",
        position: index,
        description: `Bookmark untuk video YouTube`,
      });
      message.success("Bookmark berhasil ditambahkan");
    } catch (error) {
      message.error("Gagal menambahkan bookmark");
    }
  };

  const handleRemoveBookmark = async (bookmarkId) => {
    try {
      await onRemoveBookmark(bookmarkId);
      message.success("Bookmark berhasil dihapus");
    } catch (error) {
      message.error("Gagal menghapus bookmark");
    }
  };

  const getVideoTitle = (url) => {
    const videoId = extractYouTubeVideoId(url);
    return videoId ? `YouTube Video (${videoId})` : "YouTube Video";
  };

  const isBookmarked = (index) => {
    return bookmarks.some(
      (b) => b.content_type === "video" && b.position === index
    );
  };

  const getBookmarkId = (index) => {
    const bookmark = bookmarks.find(
      (b) => b.content_type === "video" && b.position === index
    );
    return bookmark?.id;
  };

  const validVideos = youtubeVideos.filter(
    (video) => video.url && video.url.trim()
  );

  if (!validVideos || validVideos.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Text type="secondary">Tidak ada video tersedia</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card title="🎥 Video Pembelajaran" style={{ marginBottom: 16 }}>
      <List
        dataSource={validVideos}
        renderItem={(video, index) => {
          const embedUrl = getYouTubeEmbedUrl(video.url);
          const videoId = extractYouTubeVideoId(video.url);
          const playerId = `yt-player-${index}`;

          return (
            <List.Item
              key={index}
              actions={[
                <Tooltip
                  title={
                    isBookmarked(index) ? "Hapus bookmark" : "Tambah bookmark"
                  }
                  key="bookmark"
                >
                  <Button
                    type="text"
                    icon={
                      isBookmarked(index) ? <StarFilled /> : <StarOutlined />
                    }
                    onClick={() => {
                      if (isBookmarked(index)) {
                        handleRemoveBookmark(getBookmarkId(index));
                      } else {
                        handleAddBookmark(video, index);
                      }
                    }}
                    style={{ color: isBookmarked(index) ? "#faad14" : "#666" }}
                  />
                </Tooltip>,
              ]}
            >
              <div style={{ width: "100%" }}>
                <List.Item.Meta
                  title={
                    <Text strong style={{ color: "#11418b" }}>
                      {getVideoTitle(video.url)}
                    </Text>
                  }
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        URL: {video.url}
                      </Text>
                      <br />
                      {videoId && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Video ID: {videoId}
                        </Text>
                      )}
                      {progress.last_position === index && (
                        <div style={{ marginTop: 4 }}>
                          <Text style={{ color: "#52c41a", fontSize: 12 }}>
                            📍 Terakhir diakses
                          </Text>
                        </div>
                      )}
                    </div>
                  }
                />

                <div style={{ marginTop: 12 }}>
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
              </div>
            </List.Item>
          );
        }}
      />
    </Card>
  );
};

export default StudentVideoPlayer;
