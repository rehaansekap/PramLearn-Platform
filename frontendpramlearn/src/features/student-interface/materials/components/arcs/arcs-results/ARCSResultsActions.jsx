import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  message,
} from "antd";
import {
  BookOutlined,
  ReloadOutlined,
  DownloadOutlined,
  PrinterOutlined,
  ShareAltOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

const ARCSResultsActions = ({ materialSlug, results, isMobile }) => {
  const navigate = useNavigate();

  const handleBackToMaterial = () => {
    navigate(`/student/materials/${materialSlug}`);
  };

  const handleViewOtherARCS = () => {
    navigate(`/student/materials/${materialSlug}`);
  };

  const handleDownloadResults = () => {
    try {
      // Download logic here
      message.success("Hasil berhasil diunduh!");
    } catch (error) {
      message.error("Gagal mengunduh hasil");
    }
  };

  const handlePrintResults = () => {
    try {
      window.print();
    } catch (error) {
      message.error("Gagal mencetak hasil");
    }
  };

  const handleShareResults = async () => {
    const shareData = {
      title: "Hasil Kuesioner ARCS",
      text: `Saya telah menyelesaikan kuesioner ARCS "${results.questionnaire.title}" dengan tingkat motivasi ${results.motivation_level}! 🎯`,
      url: window.location.href,
    };

    try {
      if (navigator.share && !isMobile) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.text}\n\n${shareData.url}`
        );
        message.success("Link berhasil disalin ke clipboard!");
      }
    } catch (error) {
      message.error("Gagal membagikan hasil");
    }
  };

  const averageScore =
    Object.values(results.dimension_scores).reduce((a, b) => a + b, 0) / 4;

  return (
    <Card
      style={{
        borderRadius: isMobile ? 16 : 20,
        background: "linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%)",
        border: "1px solid #e3f2fd",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
      bodyStyle={{ padding: isMobile ? "20px 16px" : "32px" }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: isMobile ? 24 : 32 }}>
        <Space direction="vertical" size="small">
          <div style={{ fontSize: isMobile ? 24 : 32 }}>🎯</div>
          <Title
            level={isMobile ? 4 : 3}
            style={{
              margin: 0,
              color: "#1890ff",
              fontSize: isMobile ? 18 : undefined,
            }}
          >
            {isMobile ? "Langkah Selanjutnya" : "Langkah Selanjutnya"}
          </Title>
          <Text
            style={{
              color: "#666",
              fontSize: isMobile ? 14 : 16,
              textAlign: "center",
              display: "block",
            }}
          >
            {isMobile
              ? "Apa yang ingin Anda lakukan?"
              : "Apa yang ingin Anda lakukan dengan hasil ini?"}
          </Text>
        </Space>
      </div>

      {/* Quick Stats */}
      <div
        style={{
          background: "white",
          borderRadius: isMobile ? 12 : 16,
          padding: isMobile ? "16px" : "20px",
          marginBottom: isMobile ? 24 : 32,
          border: "1px solid #e8f4fd",
        }}
      >
        <Row gutter={[isMobile ? 8 : 16, 16]} align="middle">
          <Col xs={24} sm={8} style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: isMobile ? 18 : 24,
                fontWeight: 700,
                color: "#1890ff",
              }}
            >
              {results.motivation_level.toUpperCase()}
            </div>
            <Text
              style={{
                fontSize: isMobile ? 10 : 12,
                color: "#666",
              }}
            >
              {isMobile ? "Motivasi" : "Motivasi Level"}
            </Text>
          </Col>
          <Col xs={24} sm={8} style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: isMobile ? 18 : 24,
                fontWeight: 700,
                color: "#52c41a",
              }}
            >
              {averageScore.toFixed(1)}/5.0
            </div>
            <Text
              style={{
                fontSize: isMobile ? 10 : 12,
                color: "#666",
              }}
            >
              {isMobile ? "Rata-rata" : "Skor Rata-rata"}
            </Text>
          </Col>
          <Col xs={24} sm={8} style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: isMobile ? 18 : 24,
                fontWeight: 700,
                color: "#faad14",
              }}
            >
              {Math.round(
                (results.response.answered_questions /
                  results.response.total_questions) *
                  100
              )}
              %
            </div>
            <Text
              style={{
                fontSize: isMobile ? 10 : 12,
                color: "#666",
              }}
            >
              Kelengkapan
            </Text>
          </Col>
        </Row>
      </div>

      {/* Action Buttons */}
      <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]}>
        {/* Primary Actions */}
        <Col xs={24} md={isMobile ? 24 : 12}>
          <Space
            direction="vertical"
            size={isMobile ? "middle" : "middle"}
            style={{ width: "100%" }}
          >
            <Button
              type="primary"
              icon={<BookOutlined />}
              onClick={handleBackToMaterial}
              size={isMobile ? "middle" : "large"}
              block
              style={{
                height: isMobile ? 44 : 56,
                borderRadius: isMobile ? 12 : 16,
                background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
                border: "none",
                fontWeight: 600,
                fontSize: isMobile ? 14 : 16,
                boxShadow: "0 4px 16px rgba(24, 144, 255, 0.3)",
              }}
            >
              {isMobile ? "Kembali ke Materi" : "Kembali ke Materi"}
            </Button>

            <Button
              icon={<ReloadOutlined />}
              onClick={handleViewOtherARCS}
              size={isMobile ? "middle" : "large"}
              block
              style={{
                height: isMobile ? 40 : 48,
                borderRadius: isMobile ? 10 : 12,
                fontWeight: 500,
                border: "2px solid #1890ff",
                color: "#1890ff",
                fontSize: isMobile ? 13 : 14,
              }}
            >
              {isMobile ? "Lihat ARCS Lain" : "Lihat Kuesioner ARCS Lain"}
            </Button>
          </Space>
        </Col>

        {/* Secondary Actions */}
        <Col xs={24} md={isMobile ? 24 : 12}>
          <Space
            direction="vertical"
            size={isMobile ? "middle" : "middle"}
            style={{ width: "100%" }}
          >
            {/* Download & Print Row */}
            <Row gutter={isMobile ? 8 : 8}>
              <Col span={12}>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadResults}
                  size={isMobile ? "middle" : "large"}
                  block
                  style={{
                    height: isMobile ? 40 : 48,
                    borderRadius: isMobile ? 10 : 12,
                    background: "#52c41a",
                    borderColor: "#52c41a",
                    color: "white",
                    fontWeight: 500,
                    fontSize: isMobile ? 12 : 14,
                  }}
                >
                  {isMobile ? "Download" : "Download"}
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  icon={<PrinterOutlined />}
                  onClick={handlePrintResults}
                  size={isMobile ? "middle" : "large"}
                  block
                  style={{
                    height: isMobile ? 40 : 48,
                    borderRadius: isMobile ? 10 : 12,
                    background: "#faad14",
                    borderColor: "#faad14",
                    color: "white",
                    fontWeight: 500,
                    fontSize: isMobile ? 12 : 14,
                  }}
                >
                  {isMobile ? "Print" : "Print"}
                </Button>
              </Col>
            </Row>

            {/* Share Button */}
            <Button
              icon={<ShareAltOutlined />}
              onClick={handleShareResults}
              size={isMobile ? "middle" : "large"}
              block
              style={{
                height: isMobile ? 40 : 48,
                borderRadius: isMobile ? 10 : 12,
                background: "#722ed1",
                borderColor: "#722ed1",
                color: "white",
                fontWeight: 500,
                fontSize: isMobile ? 13 : 14,
              }}
            >
              {isMobile ? "Bagikan" : "Bagikan Hasil"}
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Additional Info */}
      <div
        style={{
          marginTop: isMobile ? 24 : 32,
          padding: isMobile ? "16px" : "20px",
          background: "rgba(255, 255, 255, 0.7)",
          borderRadius: isMobile ? 10 : 12,
          border: "1px solid #e8f4fd",
        }}
      >
        <Row gutter={16} align="middle">
          <Col>
            <FileTextOutlined
              style={{
                fontSize: isMobile ? 16 : 20,
                color: "#1890ff",
              }}
            />
          </Col>
          <Col flex={1}>
            <Text
              style={{
                fontSize: isMobile ? 11 : 13,
                color: "#666",
                lineHeight: 1.5,
              }}
            >
              💡 <strong>Tips:</strong>{" "}
              {isMobile
                ? "Simpan hasil ini sebagai referensi untuk mengukur perkembangan motivasi belajar Anda."
                : "Simpan hasil ini sebagai referensi untuk mengukur perkembangan motivasi belajar Anda di masa mendatang. Anda juga bisa membagikannya dengan guru atau mentor untuk mendapatkan feedback yang lebih personal."}
            </Text>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default ARCSResultsActions;
