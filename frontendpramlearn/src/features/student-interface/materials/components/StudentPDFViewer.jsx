import React, { useState, useEffect } from "react";
import { Card, Button, List, Typography, Tooltip, message } from "antd";
import {
  StarFilled,
  StarOutlined,
  FullscreenOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const StudentPDFViewer = ({
  pdfFiles,
  progress,
  onProgressUpdate,
  bookmarks,
  onActivity, // Tambahkan ini
  onAddBookmark,
  onRemoveBookmark,
}) => {
  const [currentPdf, setCurrentPdf] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // PERBAIKAN: Tambahkan async
  const handlePdfOpen = async (pdfUrl, index) => {
    // Record aktivitas buka PDF
    if (onActivity) {
      await onActivity("pdf_opened", { position: index });
    }

    // Update last position
    if (onProgressUpdate) {
      onProgressUpdate({
        ...progress,
        last_position: index,
      });
    }

    // Open PDF in new tab with full URL
    const fullUrl = pdfUrl.startsWith("http")
      ? pdfUrl
      : `${window.location.origin}${pdfUrl}`;
    window.open(fullUrl, "_blank");
  };

  const handleAddBookmark = async (pdfFile, index) => {
    try {
      await onAddBookmark({
        title: `PDF: ${pdfFile.original_filename || `File ${index + 1}`}`,
        content_type: "pdf",
        position: index,
        description: `Bookmark untuk ${pdfFile.original_filename}`,
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

  const isBookmarked = (index) => {
    return bookmarks.some(
      (b) => b.content_type === "pdf" && b.position === index
    );
  };

  const getBookmarkId = (index) => {
    const bookmark = bookmarks.find(
      (b) => b.content_type === "pdf" && b.position === index
    );
    return bookmark?.id;
  };

  if (!pdfFiles || pdfFiles.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Text type="secondary">Tidak ada file PDF tersedia</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card title="📄 File PDF" style={{ marginBottom: 16 }}>
      <List
        dataSource={pdfFiles}
        renderItem={(file, index) => (
          <List.Item
            key={file.id || index}
            actions={[
              <Tooltip
                title={
                  isBookmarked(index) ? "Hapus bookmark" : "Tambah bookmark"
                }
                key="bookmark"
              >
                <Button
                  type="text"
                  icon={isBookmarked(index) ? <StarFilled /> : <StarOutlined />}
                  onClick={() => {
                    if (isBookmarked(index)) {
                      handleRemoveBookmark(getBookmarkId(index));
                    } else {
                      handleAddBookmark(file, index);
                    }
                  }}
                  style={{ color: isBookmarked(index) ? "#faad14" : "#666" }}
                />
              </Tooltip>,
              <Button
                key="open"
                type="primary"
                icon={<FullscreenOutlined />}
                onClick={() => handlePdfOpen(file.file, index)}
                size="small"
              >
                Buka PDF
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={
                <Text strong style={{ color: "#11418b" }}>
                  {file.original_filename || `PDF File ${index + 1}`}
                </Text>
              }
              description={
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Ukuran:{" "}
                    {file.file_size
                      ? `${(file.file_size / 1024 / 1024).toFixed(2)} MB`
                      : "Unknown"}
                  </Text>
                  {progress.last_position === index && (
                    <div style={{ marginTop: 4 }}>
                      <Text style={{ color: "#52c41a", fontSize: 12 }}>
                        📍 Terakhir dibuka
                      </Text>
                    </div>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default StudentPDFViewer;
