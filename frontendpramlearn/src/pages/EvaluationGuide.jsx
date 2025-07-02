import React from "react";
import { Helmet } from "react-helmet";
import {
  Card,
  Typography,
  Row,
  Col,
  Steps,
  Alert,
  Divider,
  Tag,
  Space,
  Button,
  List,
  Collapse,
  Timeline,
} from "antd";
import {
  BookOutlined,
  UserOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  ExperimentOutlined,
  TrophyOutlined,
  FileTextOutlined,
  RightOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const EvaluationGuide = () => {
  const evaluationScenarios = [
    {
      title: "Evaluasi Algoritma Clustering",
      icon: <BarChartOutlined />,
      color: "#52c41a",
      steps: [
        "Login sebagai teacher1 (password: 123)",
        "Navigasi ke Management → Class Management → XI TKJ 1 → Materials → Pengenalan Jaringan Komputer",
        "Klik tab Sessions → Upload ARCS Data",
        "Sistem akan menampilkan data ARCS dari 34 siswa yang sudah tersedia",
        "Jalankan algoritma clustering untuk mengelompokkan motivasi belajar siswa (High/Medium/Low)",
        "Analisis hasil clustering berdasarkan 4 dimensi ARCS (Attention, Relevance, Confidence, Satisfaction)",
        "Export laporan analisis clustering dalam format PDF",
      ],
    },
    {
      title: "Evaluasi Pembentukan Kelompok",
      icon: <TeamOutlined />,
      color: "#1890ff",
      steps: [
        "Setelah melakukan clustering ARCS dari 34 siswa",
        "Masuk ke tab Groups pada material",
        "Pilih Generate Groups dan pilih mode pembentukan:",
        "• Heterogen: Menggunakan DEAP Genetic Algorithm untuk keberagaman motivasi",
        "• Homogen: Berdasarkan tingkat motivasi yang sama (High/Medium/Low)",
        "Sistem akan membentuk kelompok optimal dari 34 siswa",
        "Analisis kualitas pembentukan kelompok (balance score, heterogeneity score)",
        "Export laporan pembentukan kelompok dalam format PDF",
      ],
    },
    {
      title: "Evaluasi Quiz Kelompok (Teams Games Tournament)",
      icon: <TrophyOutlined />,
      color: "#722ed1",
      steps: [
        "Setelah kelompok terbentuk, akses quiz kelompok yang tersedia",
        "Tersedia 6 quiz kelompok dengan tema jaringan komputer:",
        "• Quiz 1: Pengenalan Jaringan Komputer (8 soal, 30 menit)",
        "• Quiz 2: Topologi Jaringan (7 soal, 35 menit)",
        "• Quiz 3: Protokol Jaringan (10 soal, 40 menit)",
        "• Quiz 4: Perangkat Jaringan (6 soal, 25 menit)",
        "• Quiz 5: Keamanan Jaringan (9 soal, 45 menit)",
        "• Quiz 6: Instrument Soal Komprehensif (30 soal, 60 menit)",
        "Evaluasi kolaborasi real-time dalam kelompok",
      ],
    },
    {
      title: "Evaluasi Perspektif Siswa",
      icon: <UserOutlined />,
      color: "#faad14",
      steps: [
        "Login sebagai salah satu dari 34 akun student (student1-student34, password: 123)",
        "Akses material 'Pengenalan Jaringan Komputer' yang tersedia",
        "Lihat hasil analisis ARCS personal dari kuesioner yang sudah diisi",
        "Akses 5 assignment yang tersedia (belum dikerjakan):",
        "• Assignment 1: Analisis Konsep Jaringan Komputer",
        "• Assignment 2: Desain Topologi Jaringan",
        "• Assignment 3: Konfigurasi Protokol Jaringan",
        "• Assignment 4: Evaluasi Perangkat Jaringan",
        "• Assignment 5: Implementasi Keamanan Jaringan",
        "Evaluasi dashboard analytics untuk melihat progress belajar",
      ],
    },
  ];

  const technicalAspects = [
    {
      category: "Backend (Django REST API)",
      items: [
        "Algoritma Clustering: Implementasi K-Means dengan StandardScaler normalization",
        "Algoritma Genetika: DEAP library untuk optimasi pembentukan kelompok",
        "Database: PostgreSQL dengan 34 siswa mock data",
        "API Documentation: RESTful API dengan proper authentication",
        "ARCS Analysis: 20 pertanyaan dengan 4 dimensi motivasi",
      ],
    },
    {
      category: "Frontend (React.js)",
      items: [
        "Responsive Design: Mendukung desktop dan mobile",
        "User Experience: Interface yang intuitif untuk berbagai role",
        "Data Visualization: Chart dan grafik untuk analisis hasil clustering",
        "Real-time Collaboration: WebSocket untuk quiz kelompok",
        "PDF Generation: Laporan analisis dan pembentukan kelompok",
      ],
    },
    {
      category: "Implementasi Teams Games Tournament",
      items: [
        "6 Quiz Kelompok dengan berbagai tingkat kesulitan",
        "Real-time collaboration dalam pengerjaan quiz",
        "Pembentukan kelompok berdasarkan hasil clustering ARCS",
        "Analytics untuk monitoring performance kelompok",
        "Competitive scoring system untuk tournament",
      ],
    },
  ];

  const demoAccounts = [
    {
      role: "Teacher",
      username: "teacher1",
      password: "123",
      name: "Budi Santoso",
      access:
        "Dapat menggunakan semua fitur clustering dan pembentukan kelompok untuk 34 siswa",
      recommended: true,
    },
    {
      role: "Student",
      username: "student1 hingga student34",
      password: "123",
      name: "Ahmad Rizki, Siti Nurhaliza, dll (34 siswa)",
      access:
        "Dapat melihat hasil analisis ARCS personal dan mengakses quiz/assignment",
      recommended: false,
    },
    {
      role: "Admin",
      username: "admin1",
      password: "123",
      name: "Administrator System",
      access: "Full access ke semua fitur manajemen sistem",
      recommended: false,
    },
  ];

  const dataAvailable = [
    {
      category: "Data Siswa Tersedia",
      items: [
        "34 siswa dengan nama Indonesia (Ahmad Rizki, Siti Nurhaliza, dll)",
        "Data kuesioner ARCS lengkap (20 pertanyaan) yang sudah diisi semua siswa",
        "Student motivation profiles dengan klasifikasi High/Medium/Low",
        "Student attendance records untuk analisis kehadiran",
        "Student activities untuk learning analytics",
      ],
    },
    {
      category: "Konten Pembelajaran Siap Pakai",
      items: [
        "1 Material: Pengenalan Jaringan Komputer",
        "1 PDF file dan 2 YouTube video pembelajaran",
        "6 Quiz kelompok dengan total 40+ soal tentang jaringan komputer",
        "5 Assignment dengan berbagai jenis soal (essay dan pilihan ganda)",
        "2 Pengumuman kelas yang informatif",
      ],
    },
    {
      category: "Data untuk Clustering Analysis",
      items: [
        "ARCS questionnaire dengan 4 dimensi (Attention, Relevance, Confidence, Satisfaction)",
        "Real responses dari 34 siswa dengan variasi skor realistis",
        "Motivation profiles yang sudah diklasifikasi otomatis",
        "Data attendance untuk validasi analisis",
      ],
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
        padding: "24px",
      }}
    >
      <Helmet>
        <title>Panduan Evaluasi Sistem | PramLearn</title>
      </Helmet>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <Card
          style={{
            marginBottom: 32,
            borderRadius: 16,
            background: "linear-gradient(135deg, #11418b 0%, #1890ff 100%)",
            border: "none",
            color: "white",
          }}
          bodyStyle={{ padding: "40px" }}
        >
          <div style={{ textAlign: "center" }}>
            <ExperimentOutlined
              style={{ fontSize: 48, color: "white", marginBottom: 16 }}
            />
            <Title level={1} style={{ color: "white", margin: 0 }}>
              Panduan Evaluasi Sistem PramLearn
            </Title>
            <Paragraph
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "16px",
                marginTop: 16,
                marginBottom: 16,
              }}
            >
              Learning Management System Berbasis Algoritma Clustering untuk
              Pengelompokan Motivasi Belajar Siswa dalam Model Teams Games
              Tournament
            </Paragraph>
            <Paragraph
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "14px",
                marginBottom: 24,
              }}
            >
              Studi Kasus: Administrasi Sistem Jaringan - Kelas XI TKJ 1 (34
              Siswa)
            </Paragraph>
            <Tag
              color="gold"
              style={{
                fontSize: "14px",
                padding: "8px 16px",
                borderRadius: 20,
              }}
            >
              🌐 Akses: https://pramlearn.tech
            </Tag>
          </div>
        </Card>

        {/* System Overview */}
        <Card
          title={
            <Space>
              <InfoCircleOutlined style={{ color: "#1890ff" }} />
              Gambaran Umum Sistem
            </Space>
          }
          style={{ marginBottom: 24, borderRadius: 12 }}
        >
          <Alert
            message="Dataset Siap Evaluasi"
            description={
              <List
                size="small"
                dataSource={[
                  "34 siswa kelas XI TKJ 1 dengan data ARCS lengkap",
                  "6 quiz kelompok Teams Games Tournament (40+ soal jaringan komputer)",
                  "5 assignment individual dengan berbagai tingkat kesulitan",
                  "Algoritma K-Means clustering untuk pengelompokan motivasi ARCS",
                  "DEAP Genetic Algorithm untuk optimasi pembentukan kelompok heterogen/homogen",
                  "Real-time collaboration system untuk quiz kelompok",
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <CheckCircleOutlined
                      style={{ color: "#52c41a", marginRight: 8 }}
                    />
                    {item}
                  </List.Item>
                )}
              />
            }
            type="info"
            showIcon
            style={{ borderRadius: 8 }}
          />
        </Card>

        {/* Demo Accounts */}
        <Card
          title={
            <Space>
              <UserOutlined style={{ color: "#52c41a" }} />
              Akun Demo untuk Evaluasi
            </Space>
          }
          style={{ marginBottom: 24, borderRadius: 12 }}
        >
          <Row gutter={[16, 16]}>
            {demoAccounts.map((account, index) => (
              <Col xs={24} md={8} key={index}>
                <Card
                  size="small"
                  style={{
                    borderRadius: 8,
                    border: account.recommended
                      ? "2px solid #52c41a"
                      : "1px solid #f0f0f0",
                    background: account.recommended ? "#f6ffed" : "white",
                  }}
                  bodyStyle={{ padding: 16 }}
                >
                  <div style={{ textAlign: "center" }}>
                    <Title level={5} style={{ marginBottom: 8 }}>
                      {account.role}
                      {account.recommended && (
                        <Tag
                          color="success"
                          style={{ marginLeft: 8, fontSize: "10px" }}
                        >
                          REKOMENDASI
                        </Tag>
                      )}
                    </Title>
                    <Text strong>Username: </Text>
                    <Text code>{account.username}</Text>
                    <br />
                    <Text strong>Password: </Text>
                    <Text code>{account.password}</Text>
                    <br />
                    <Text strong>Nama: </Text>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {account.name}
                    </Text>
                    <Divider style={{ margin: "12px 0" }} />
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {account.access}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Evaluation Scenarios */}
        <Card
          title={
            <Space>
              <TrophyOutlined style={{ color: "#faad14" }} />
              Skenario Evaluasi yang Disarankan
            </Space>
          }
          style={{ marginBottom: 24, borderRadius: 12 }}
        >
          <Timeline>
            {evaluationScenarios.map((scenario, index) => (
              <Timeline.Item
                key={index}
                dot={
                  <div
                    style={{
                      background: scenario.color,
                      borderRadius: "50%",
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                    }}
                  >
                    {scenario.icon}
                  </div>
                }
              >
                <Card
                  size="small"
                  title={scenario.title}
                  style={{ marginBottom: 16, borderRadius: 8 }}
                  bodyStyle={{ padding: 16 }}
                >
                  <Steps
                    direction="vertical"
                    size="small"
                    current={-1}
                    items={scenario.steps.map((step, stepIndex) => ({
                      title: `Langkah ${stepIndex + 1}`,
                      description: step,
                    }))}
                  />
                </Card>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>

        {/* Technical Aspects */}
        {/* <Card
          title={
            <Space>
              <SettingOutlined style={{ color: "#722ed1" }} />
              Aspek Teknis yang Dapat Dievaluasi
            </Space>
          }
          style={{ marginBottom: 24, borderRadius: 12 }}
        >
          <Collapse
            defaultActiveKey={["0"]}
            items={technicalAspects.map((aspect, index) => ({
              key: index.toString(),
              label: aspect.category,
              children: (
                <List
                  size="small"
                  dataSource={aspect.items}
                  renderItem={(item) => (
                    <List.Item>
                      <RightOutlined
                        style={{
                          color: "#1890ff",
                          marginRight: 8,
                          fontSize: 12,
                        }}
                      />
                      {item}
                    </List.Item>
                  )}
                />
              ),
            }))}
          />
        </Card> */}

        {/* Data Available */}
        <Card
          title={
            <Space>
              <FileTextOutlined style={{ color: "#13c2c2" }} />
              Data yang Tersedia untuk Evaluasi
            </Space>
          }
          style={{ marginBottom: 24, borderRadius: 12 }}
        >
          <Collapse
            defaultActiveKey={["0"]}
            items={dataAvailable.map((data, index) => ({
              key: index.toString(),
              label: data.category,
              children: (
                <List
                  size="small"
                  dataSource={data.items}
                  renderItem={(item) => (
                    <List.Item>
                      <CheckCircleOutlined
                        style={{ color: "#52c41a", marginRight: 8 }}
                      />
                      {item}
                    </List.Item>
                  )}
                />
              ),
            }))}
          />
        </Card>

        {/* Current System Status */}
        <Card
          title={
            <Space>
              <BarChartOutlined style={{ color: "#ff7875" }} />
              Status Dataset Saat Ini
            </Space>
          }
          style={{ marginBottom: 24, borderRadius: 12 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Alert
                message="Data Tersedia ✅"
                description={
                  <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                    <li>34 siswa dengan profil ARCS lengkap</li>
                    <li>Data kuesioner pre-assessment sudah diisi</li>
                    <li>Student motivation profiles tersedia</li>
                    <li>6 quiz kelompok siap untuk dikerjakan</li>
                    <li>5 assignment individual tersedia</li>
                  </ul>
                }
                type="success"
                showIcon
                style={{ borderRadius: 8 }}
              />
            </Col>
            <Col xs={24} md={12}>
              <Alert
                message="Belum Dikerjakan ⏳"
                description={
                  <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                    <li>Quiz kelompok belum dikerjakan siswa</li>
                    <li>Assignment belum dikerjakan siswa</li>
                    <li>Kelompok belum dibentuk otomatis</li>
                    <li>ARCS post-assessment belum dibuat</li>
                    <li>Deadline semua: 2 Agustus 2025</li>
                  </ul>
                }
                type="warning"
                showIcon
                style={{ borderRadius: 8 }}
              />
            </Col>
          </Row>
        </Card>

        {/* Important Notes */}
        <Card
          title={
            <Space>
              <ExclamationCircleOutlined style={{ color: "#fa541c" }} />
              Catatan Penting untuk Evaluasi
            </Space>
          }
          style={{ marginBottom: 24, borderRadius: 12 }}
        >
          <Alert
            message="Fokus Evaluasi Algoritma Clustering dan Teams Games Tournament"
            description={
              <List
                size="small"
                dataSource={[
                  "Algoritma Clustering: Evaluasi efektivitas K-Means dalam mengelompokkan 34 siswa berdasarkan motivasi ARCS (High/Medium/Low)",
                  "Pembentukan Kelompok: Test DEAP Genetic Algorithm untuk optimasi kelompok heterogen vs homogen",
                  "Teams Games Tournament: Evaluasi 6 quiz kelompok dengan real-time collaboration",
                  "Learning Analytics: Analisis student activities, attendance, dan progress tracking",
                  "Usability Testing: Kemudahan penggunaan dari perspektif teacher (clustering) dan student (quiz collaboration)",
                  "Scalability: Test performa sistem dengan 34 siswa mock data",
                  "Educational Impact: Dampak clustering terhadap efektivitas pembelajaran kelompok",
                ]}
                renderItem={(item, index) => (
                  <List.Item>
                    <Text strong>{index + 1}. </Text>
                    {item}
                  </List.Item>
                )}
              />
            }
            type="warning"
            showIcon
            style={{ borderRadius: 8 }}
          />
        </Card>

        {/* Footer */}
        <Card
          style={{
            borderRadius: 12,
            background: "linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)",
            border: "1px solid #bae0ff",
            textAlign: "center",
          }}
        >
          <Space direction="vertical" size="small">
            <BookOutlined style={{ fontSize: 32, color: "#1890ff" }} />
            <Title level={4} style={{ color: "#11418b", margin: 0 }}>
              Sistem PramLearn Siap untuk Evaluasi
            </Title>
            <Paragraph style={{ margin: 0, color: "#666" }}>
              Dataset lengkap 34 siswa kelas XI TKJ 1 dengan implementasi
              algoritma clustering untuk optimasi Teams Games Tournament dalam
              pembelajaran Administrasi Sistem Jaringan.
            </Paragraph>
            <div style={{ marginTop: 16 }}>
              <Tag color="blue" style={{ margin: "4px" }}>
                📊 34 Siswa Mock Data
              </Tag>
              <Tag color="green" style={{ margin: "4px" }}>
                🧠 K-Means Clustering
              </Tag>
              <Tag color="purple" style={{ margin: "4px" }}>
                🧬 Genetic Algorithm
              </Tag>
              <Tag color="orange" style={{ margin: "4px" }}>
                🏆 6 Quiz TGT
              </Tag>
              <Tag color="red" style={{ margin: "4px" }}>
                📝 5 Assignment
              </Tag>
            </div>
            <Button
              type="primary"
              size="large"
              href="https://pramlearn.tech"
              target="_blank"
              style={{
                borderRadius: 8,
                background: "linear-gradient(135deg, #11418b 0%, #1890ff 100%)",
                border: "none",
                marginTop: 16,
              }}
            >
              Mulai Evaluasi Sistem PramLearn
            </Button>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default EvaluationGuide;
