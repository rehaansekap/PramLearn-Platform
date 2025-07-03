import React from "react";
import { Card, Typography, Row, Col, Space, Alert, Tag, Progress } from "antd";
import {
  BulbOutlined,
  LineChartOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  RiseOutlined,
  WarningOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const ARCSAnalysisCard = ({ dimensionScores, motivationLevel, isMobile }) => {
  const getMotivationColor = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
      case "tinggi":
        return "#52c41a";
      case "medium":
      case "sedang":
        return "#faad14";
      case "low":
      case "rendah":
        return "#ff4d4f";
      default:
        return "#1890ff";
    }
  };

  const getMotivationText = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
        return "TINGGI";
      case "medium":
        return "SEDANG";
      case "low":
        return "RENDAH";
      default:
        return level?.toUpperCase() || "Belum Terukur";
    }
  };

  const getMotivationDescription = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
        return {
          title: isMobile
            ? "🎉 Motivasi Sangat Tinggi!"
            : "🎉 Luar Biasa! Motivasi Belajar Anda Sangat Tinggi!",
          description: isMobile
            ? "Motivasi excellent! Pertahankan semangat dan terus kembangkan potensi Anda."
            : "Anda memiliki motivasi belajar yang excellent! Pertahankan semangat belajar ini dan terus kembangkan potensi Anda. Anda siap menghadapi tantangan pembelajaran yang lebih kompleks.",
          type: "success",
        };
      case "medium":
        return {
          title: isMobile
            ? "👍 Motivasi Cukup Baik"
            : "👍 Motivasi Belajar Anda Cukup Baik",
          description: isMobile
            ? "Motivasi di jalur yang benar, namun bisa ditingkatkan. Fokus pada area yang perlu diperbaiki."
            : "Motivasi belajar Anda sudah di jalur yang benar, namun masih bisa ditingkatkan. Mari fokus pada area yang perlu diperbaiki untuk mencapai potensi maksimal Anda.",
          type: "warning",
        };
      case "low":
        return {
          title: isMobile
            ? "💪 Mari Tingkatkan Motivasi"
            : "💪 Mari Tingkatkan Motivasi Belajar Anda",
          description: isMobile
            ? "Motivasi perlu ditingkatkan. Dengan strategi tepat dan komitmen kuat, Anda bisa meningkatkannya."
            : "Motivasi belajar Anda perlu ditingkatkan, tapi jangan khawatir! Dengan strategi yang tepat dan komitmen yang kuat, Anda bisa meningkatkannya secara signifikan.",
          type: "info",
        };
      default:
        return {
          title: "📊 Analisis Motivasi Belajar",
          description: isMobile
            ? "Hasil kuesioner ARCS dengan rekomendasi untuk meningkatkan motivasi belajar."
            : "Berdasarkan hasil kuesioner ARCS, kami akan memberikan rekomendasi yang sesuai untuk meningkatkan motivasi belajar Anda.",
          type: "info",
        };
    }
  };

  const getStrengthsAndWeaknesses = (scores) => {
    const dimensions = Object.entries(scores);
    const sortedDimensions = dimensions.sort((a, b) => b[1] - a[1]);

    const strengths = sortedDimensions.slice(0, 2);
    const weaknesses = sortedDimensions.slice(-2);

    return { strengths, weaknesses, sortedDimensions };
  };

  const getRecommendations = (scores, motivationLevel) => {
    const { weaknesses } = getStrengthsAndWeaknesses(scores);
    const recommendations = [];

    // Add general recommendations based on motivation level
    if (motivationLevel?.toLowerCase() === "high") {
      recommendations.push({
        icon: <TrophyOutlined style={{ color: "#52c41a" }} />,
        title: "Pertahankan Momentum",
        description: isMobile
          ? "Tetap konsisten dengan pola belajar yang baik. Coba tantangan lebih advanced."
          : "Tetap konsisten dengan pola belajar yang sudah baik. Coba tantang diri dengan materi yang lebih advanced.",
        type: "success",
      });
    }

    weaknesses.forEach(([dimension, score]) => {
      if (score < 4.0) {
        switch (dimension) {
          case "attention":
            recommendations.push({
              icon: <BulbOutlined style={{ color: "#ff7875" }} />,
              title: isMobile
                ? "Tingkatkan Fokus"
                : "Tingkatkan Fokus & Perhatian",
              description: isMobile
                ? "Gunakan teknik pomodoro, buat catatan visual, dan cari lingkungan belajar yang tenang."
                : "Gunakan teknik pomodoro (25 menit fokus, 5 menit istirahat), buat catatan visual dengan mind mapping, atau cari lingkungan belajar yang lebih tenang dan bebas distraksi.",
              type: "attention",
              tips: [
                "Matikan notifikasi gadget saat belajar",
                "Buat jadwal belajar yang terstruktur",
                "Gunakan teknik active reading",
              ],
            });
            break;
          case "relevance":
            recommendations.push({
              icon: <LineChartOutlined style={{ color: "#73d13d" }} />,
              title: isMobile
                ? "Hubungkan dengan Nyata"
                : "Hubungkan Materi dengan Kehidupan Nyata",
              description: isMobile
                ? "Cari kaitan materi dengan kehidupan sehari-hari, hobi, atau cita-cita Anda."
                : "Cari kaitan materi dengan kehidupan sehari-hari, hobi, atau cita-cita Anda. Buat koneksi antara yang dipelajari dengan tujuan jangka panjang.",
              type: "relevance",
              tips: [
                "Tanyakan 'Untuk apa saya belajar ini?'",
                "Cari contoh aplikasi di dunia nyata",
                "Diskusikan dengan orang yang berpengalaman",
              ],
            });
            break;
          case "confidence":
            recommendations.push({
              icon: <RiseOutlined style={{ color: "#40a9ff" }} />,
              title: isMobile
                ? "Bangun Kepercayaan Diri"
                : "Bangun Kepercayaan Diri",
              description: isMobile
                ? "Mulai dari materi mudah, buat target kecil, dan rayakan pencapaian."
                : "Mulai dari materi yang mudah, buat target kecil yang achievable, dan rayakan setiap pencapaian. Bergabunglah dengan study group untuk saling mendukung.",
              type: "confidence",
              tips: [
                "Pecah materi besar jadi bagian kecil",
                "Lakukan latihan soal bertahap",
                "Minta feedback konstruktif dari guru",
              ],
            });
            break;
          case "satisfaction":
            recommendations.push({
              icon: <CheckCircleOutlined style={{ color: "#b37feb" }} />,
              title: isMobile
                ? "Tingkatkan Kepuasan"
                : "Tingkatkan Kepuasan Belajar",
              description: isMobile
                ? "Variasikan metode belajar, buat reward system, dan minta feedback regular."
                : "Variasikan metode belajar, bergabung dengan study group, buat reward system untuk diri sendiri, atau minta feedback regular dari guru/mentor.",
              type: "satisfaction",
              tips: [
                "Buat reward system personal",
                "Coba metode belajar yang berbeda",
                "Track progress belajar secara visual",
              ],
            });
            break;
        }
      }
    });

    return recommendations;
  };

  const { strengths, weaknesses, sortedDimensions } =
    getStrengthsAndWeaknesses(dimensionScores);
  const recommendations = getRecommendations(dimensionScores, motivationLevel);
  const motivationInfo = getMotivationDescription(motivationLevel);

  const getDimensionName = (dimension) => {
    const names = {
      attention: isMobile ? "Attention" : "Attention (Perhatian)",
      relevance: isMobile ? "Relevance" : "Relevance (Relevansi)",
      confidence: isMobile ? "Confidence" : "Confidence (Kepercayaan)",
      satisfaction: isMobile ? "Satisfaction" : "Satisfaction (Kepuasan)",
    };
    return names[dimension] || dimension;
  };

  const getDimensionColor = (dimension) => {
    const colors = {
      attention: "#ff7875",
      relevance: "#73d13d",
      confidence: "#40a9ff",
      satisfaction: "#b37feb",
    };
    return colors[dimension] || "#1890ff";
  };

  const averageScore =
    Object.values(dimensionScores).reduce((a, b) => a + b, 0) / 4;

  return (
    <Card
      style={{
        marginBottom: 24,
        borderRadius: isMobile ? 16 : 20,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
      bodyStyle={{ padding: isMobile ? "20px 16px" : "32px" }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: isMobile ? 24 : 32 }}>
        <Space direction="vertical" size="small">
          <BulbOutlined
            style={{
              fontSize: isMobile ? 24 : 32,
              color: "#1890ff",
            }}
          />
          <Title
            level={isMobile ? 4 : 3}
            style={{
              margin: 0,
              color: "#1890ff",
              fontSize: isMobile ? 18 : undefined,
            }}
          >
            {isMobile
              ? "Analisis & Rekomendasi"
              : "Analisis & Rekomendasi Personal"}
          </Title>
          <Text
            style={{
              color: "#666",
              fontSize: isMobile ? 14 : 16,
              textAlign: "center",
              display: "block",
              lineHeight: 1.4,
            }}
          >
            {isMobile
              ? "Insight dan saran peningkatan motivasi"
              : "Insight mendalam dan saran untuk meningkatkan motivasi belajar"}
          </Text>
        </Space>
      </div>

      {/* Motivation Level Analysis */}
      <Alert
        message={motivationInfo.title}
        description={
          <div>
            <Paragraph
              style={{
                marginBottom: 16,
                fontSize: isMobile ? 13 : 14,
                lineHeight: 1.5,
              }}
            >
              {motivationInfo.description}
            </Paragraph>
            <Row gutter={16} align="middle">
              <Col>
                <Space wrap>
                  <Tag
                    color={getMotivationColor(motivationLevel)}
                    style={{
                      fontSize: isMobile ? 10 : 12,
                      padding: isMobile ? "2px 8px" : "4px 12px",
                    }}
                  >
                    Level: {getMotivationText(motivationLevel)}
                  </Tag>
                  <Tag
                    color="blue"
                    style={{
                      fontSize: isMobile ? 10 : 12,
                      padding: isMobile ? "2px 8px" : "4px 12px",
                    }}
                  >
                    Skor: {averageScore.toFixed(1)}/5.0
                  </Tag>
                </Space>
              </Col>
            </Row>
          </div>
        }
        type={motivationInfo.type}
        showIcon
        style={{
          marginBottom: isMobile ? 24 : 32,
          borderRadius: isMobile ? 12 : 16,
          border: `2px solid ${getMotivationColor(motivationLevel)}30`,
        }}
      />

      {/* Strengths and Weaknesses */}
      <Row
        gutter={[isMobile ? 12 : 24, isMobile ? 16 : 24]}
        style={{ marginBottom: isMobile ? 24 : 32 }}
      >
        {/* Strengths */}
        <Col xs={24} lg={12}>
          <Card
            size="small"
            title={
              <Space>
                <CheckCircleOutlined style={{ color: "#52c41a" }} />
                <span
                  style={{
                    color: "#52c41a",
                    fontWeight: 600,
                    fontSize: isMobile ? 12 : 14,
                  }}
                >
                  🌟 {isMobile ? "Kekuatan" : "Kekuatan Anda"}
                </span>
              </Space>
            }
            style={{
              borderRadius: isMobile ? 12 : 16,
              border: "2px solid #b7eb8f",
              background: "linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)",
            }}
            bodyStyle={{ padding: isMobile ? "12px" : "20px" }}
          >
            <Space
              direction="vertical"
              style={{ width: "100%" }}
              size={isMobile ? "small" : "middle"}
            >
              {strengths.map(([dimension, score], index) => (
                <div key={dimension}>
                  <div style={{ marginBottom: 8 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        strong
                        style={{
                          color: "#52c41a",
                          fontSize: isMobile ? 12 : 14,
                        }}
                      >
                        #{index + 1} {getDimensionName(dimension)}
                      </Text>
                      <Tag
                        color="success"
                        style={{
                          fontSize: isMobile ? 9 : 11,
                        }}
                      >
                        {score.toFixed(1)}/5.0
                      </Tag>
                    </div>
                    <Progress
                      percent={(score / 5) * 100}
                      strokeColor="#52c41a"
                      size="small"
                      showInfo={false}
                      style={{ marginTop: 4 }}
                      strokeWidth={isMobile ? 4 : 6}
                    />
                  </div>
                  <Text
                    style={{
                      fontSize: isMobile ? 10 : 12,
                      color: "#666",
                      fontStyle: "italic",
                      lineHeight: 1.3,
                    }}
                  >
                    {isMobile
                      ? "Area excellent - pertahankan! 🎯"
                      : "Area yang sudah excellent - pertahankan momentum ini! 🎯"}
                  </Text>
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        {/* Areas for Improvement */}
        <Col xs={24} lg={12}>
          <Card
            size="small"
            title={
              <Space>
                <RiseOutlined style={{ color: "#faad14" }} />
                <span
                  style={{
                    color: "#faad14",
                    fontWeight: 600,
                    fontSize: isMobile ? 12 : 14,
                  }}
                >
                  📈 {isMobile ? "Pengembangan" : "Area Pengembangan"}
                </span>
              </Space>
            }
            style={{
              borderRadius: isMobile ? 12 : 16,
              border: "2px solid #ffd591",
              background: "linear-gradient(135deg, #fffbe6 0%, #fff2c6 100%)",
            }}
            bodyStyle={{ padding: isMobile ? "12px" : "20px" }}
          >
            <Space
              direction="vertical"
              style={{ width: "100%" }}
              size={isMobile ? "small" : "middle"}
            >
              {weaknesses.map(([dimension, score], index) => (
                <div key={dimension}>
                  <div style={{ marginBottom: 8 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        strong
                        style={{
                          color: "#faad14",
                          fontSize: isMobile ? 12 : 14,
                        }}
                      >
                        {getDimensionName(dimension)}
                      </Text>
                      <Tag
                        color="warning"
                        style={{
                          fontSize: isMobile ? 9 : 11,
                        }}
                      >
                        {score.toFixed(1)}/5.0
                      </Tag>
                    </div>
                    <Progress
                      percent={(score / 5) * 100}
                      strokeColor="#faad14"
                      size="small"
                      showInfo={false}
                      style={{ marginTop: 4 }}
                      strokeWidth={isMobile ? 4 : 6}
                    />
                  </div>
                  <Text
                    style={{
                      fontSize: isMobile ? 10 : 12,
                      color: "#666",
                      fontStyle: "italic",
                      lineHeight: 1.3,
                    }}
                  >
                    {isMobile
                      ? "Ruang berkembang - fokus di sini! 🚀"
                      : "Masih ada ruang untuk berkembang - fokus di sini! 🚀"}
                  </Text>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Detailed Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <Title
            level={isMobile ? 5 : 4}
            style={{
              marginBottom: 20,
              color: "#1890ff",
              fontSize: isMobile ? 16 : undefined,
            }}
          >
            💡{" "}
            {isMobile
              ? "Rekomendasi untuk Anda"
              : "Rekomendasi Khusus untuk Anda"}
          </Title>
          <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]}>
            {recommendations.map((rec, index) => (
              <Col xs={24} md={isMobile ? 24 : 12} key={index}>
                <Card
                  size="small"
                  style={{
                    borderRadius: isMobile ? 12 : 16,
                    border: "1px solid #e6f7ff",
                    background:
                      "linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)",
                    height: "100%",
                  }}
                  bodyStyle={{ padding: isMobile ? "16px" : "20px" }}
                >
                  <Space
                    align="start"
                    style={{ width: "100%" }}
                    size={isMobile ? "small" : "middle"}
                  >
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: isMobile ? 16 : 20,
                      }}
                    >
                      {rec.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <Title
                        level={5}
                        style={{
                          margin: 0,
                          marginBottom: isMobile ? 6 : 8,
                          color: "#1890ff",
                          fontSize: isMobile ? 14 : 16,
                          lineHeight: 1.3,
                        }}
                      >
                        {rec.title}
                      </Title>
                      <Paragraph
                        style={{
                          margin: 0,
                          marginBottom: isMobile ? 8 : 12,
                          fontSize: isMobile ? 12 : 13,
                          color: "#666",
                          lineHeight: 1.4,
                        }}
                      >
                        {rec.description}
                      </Paragraph>
                      {rec.tips && (
                        <div>
                          <Text
                            strong
                            style={{
                              fontSize: isMobile ? 11 : 12,
                              color: "#1890ff",
                              display: "block",
                              marginBottom: isMobile ? 6 : 8,
                            }}
                          >
                            💡 Tips Praktis:
                          </Text>
                          <ul
                            style={{
                              margin: 0,
                              paddingLeft: isMobile ? 12 : 16,
                            }}
                          >
                            {rec.tips
                              .slice(0, isMobile ? 2 : 3)
                              .map((tip, i) => (
                                <li
                                  key={i}
                                  style={{
                                    fontSize: isMobile ? 10 : 11,
                                    color: "#666",
                                    marginBottom: 3,
                                    lineHeight: 1.3,
                                  }}
                                >
                                  {tip}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </Card>
  );
};

export default ARCSAnalysisCard;
