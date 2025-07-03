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
  WifiOutlined,
  ClockCircleOutlined,
  FormOutlined,
  DownloadOutlined,
  UploadOutlined,
  ArrowDownOutlined,
  WarningOutlined,
  SyncOutlined,
  PlayCircleOutlined,
  FileOutlined,
  QuestionCircleOutlined,
  EditOutlined,
  StarOutlined,
  FireOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const EvaluationGuide = () => {
  const evaluationScenarios = [
    {
      title: "Evaluasi Algoritma Clustering ARCS",
      icon: <BarChartOutlined />,
      color: "#52c41a",
      isMultiPath: true,
      steps: [
        "Login sebagai teacher1 (password: 123)",
        "Navigasi ke Management → Class Management → XI TKJ 1 → Materials → Pengenalan Jaringan Komputer",
        "Pilih salah satu metode untuk melakukan clustering ARCS:",
      ],
      pathOptions: [
        {
          title: "Metode 1: Data dari Kuesioner Siswa",
          icon: <FormOutlined />,
          color: "#1890ff",
          steps: [
            "Klik tab 'ARCS Questionnaire' untuk melihat kuesioner yang tersedia",
            "Lihat responses dari 34 siswa yang sudah mengisi kuesioner ARCS (20 pertanyaan)",
            "⚠️ CATATAN: Jika data siswa < 3, clustering tetap berjalan namun kualitas hasil kurang optimal",
            "Sistem otomatis melakukan clustering K-Means berdasarkan jawaban siswa",
            "Analisis hasil clustering otomatis berdasarkan 4 dimensi ARCS",
          ],
        },
        {
          title: "Metode 2: Upload File CSV",
          icon: <UploadOutlined />,
          color: "#fa8c16",
          steps: [
            "Download file template ARCS CSV dari: https://pramlearnstorage.blob.core.windows.net/media/arcs_data.csv",
            "Klik tab 'Upload ARCS Data' pada material",
            "Upload file CSV dengan data ARCS yang sudah didownload",
            "⚠️ PENTING: Upload CSV akan langsung memperbarui skor ARCS dan clustering semua siswa",
            "Sistem akan memproses file dan melakukan clustering K-Means",
            "Analisis hasil clustering berdasarkan data CSV yang diupload",
          ],
        },
      ],
      finalSteps: [
        "Lihat hasil clustering dengan klasifikasi motivasi (High/Medium/Low)",
        "Export laporan analisis clustering dalam format PDF",
        "Lanjutkan ke tahap pembentukan kelompok berdasarkan hasil clustering",
      ],
    },
    {
      title: "Evaluasi Pembentukan Kelompok",
      icon: <TeamOutlined />,
      color: "#1890ff",
      steps: [
        "Setelah clustering ARCS selesai (dari metode manapun)",
        "Masuk ke tab Groups pada material",
        "Pilih Generate Groups dan pilih mode pembentukan:",
        "• Heterogen: Menggunakan DEAP Genetic Algorithm untuk keberagaman motivasi",
        "• Homogen: Berdasarkan tingkat motivasi yang sama (High/Medium/Low)",
        "Sistem akan membentuk kelompok optimal dari 34 siswa berdasarkan hasil clustering",
        "Analisis kualitas pembentukan kelompok (balance score, heterogeneity score)",
        "Export laporan pembentukan kelompok dalam format PDF",
      ],
    },
    {
      title: "Evaluasi Quiz Kelompok Kolaboratif Real-Time",
      icon: <WifiOutlined />,
      color: "#722ed1",
      steps: [
        "Setelah kelompok terbentuk, akses quiz kelompok yang tersedia",
        "Sistem menggunakan teknologi WebSocket untuk koneksi real-time antar anggota kelompok",
        "Saat satu anggota kelompok menjawab soal, anggota lain langsung melihat jawaban tersebut",
        "Anggota kelompok dapat bernavigasi ke soal berbeda secara real-time",
        "Status online/offline setiap anggota kelompok terlihat secara langsung",
        "Jika salah satu anggota submit quiz, seluruh kelompok otomatis terhenti dan dialihkan ke hasil",
        "Tersedia 6 quiz dengan tema jaringan komputer (total 40+ soal)",
        "Evaluasi efektivitas kolaborasi dan komunikasi dalam pengerjaan kelompok",
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
        "Bergabung dengan kelompok untuk mengerjakan quiz kolaboratif",
        "Rasakan pengalaman real-time collaboration saat mengerjakan quiz bersama",
        "Akses 5 assignment individual yang tersedia",
        "Evaluasi dashboard analytics untuk melihat progress belajar",
      ],
    },
    {
      title: "Evaluasi Progress Siswa 100%",
      icon: <StarOutlined />,
      color: "#eb2f96",
      steps: [
        "Login sebagai salah satu akun student (misal: student1, password: 123)",
        "Masuk ke material 'Pengenalan Jaringan Komputer'",
        "Lakukan semua aktivitas pembelajaran berikut secara berurutan:",
        "• Buka dan baca semua PDF files (1 file) - otomatis tercatat sebagai aktivitas",
        "• Tonton semua video YouTube (2 video) hingga selesai - progress akan bertambah",
        "• Kerjakan semua quiz kelompok (6 quiz) - bergabung dengan kelompok dan selesaikan",
        "• Kerjakan semua assignment individual (5 assignment) - submit semua jawaban",
        "• Habiskan waktu pembelajaran minimal (sistem tracking time spent)",
        "Monitor progress tracker di pojok kanan bawah - akan menampilkan persentase real-time",
        "Progress 100% tercapai ketika semua komponen pembelajaran telah diselesaikan",
      ],
    },
  ];

  const progressAchievementGuide = [
    {
      step: 1,
      title: "Aktivitas PDF Reading",
      description: "Buka dan baca semua PDF files yang tersedia",
      icon: <FileOutlined />,
      color: "#1890ff",
      actions: [
        "Klik tab 'Dokumen PDF' di material",
        "Buka setiap PDF file yang tersedia (1 file)",
        "Sistem otomatis mencatat sebagai 'pdf_opened' activity",
        "Progress akan bertambah sesuai bobot PDF dalam total komponen",
      ],
    },
    {
      step: 2,
      title: "Video Learning",
      description: "Tonton semua video YouTube pembelajaran",
      icon: <PlayCircleOutlined />,
      color: "#52c41a",
      actions: [
        "Klik tab 'Video Pembelajaran' di material",
        "Tonton semua video YouTube yang tersedia (2 video)",
        "Pastikan menonton hingga selesai untuk progress optimal",
        "Sistem mencatat sebagai 'video_played' activity",
      ],
    },
    {
      step: 3,
      title: "Quiz Collaboration",
      description: "Kerjakan semua quiz kelompok yang tersedia",
      icon: <QuestionCircleOutlined />,
      color: "#722ed1",
      actions: [
        "Klik tab 'Kuis' di material",
        "Bergabung dengan kelompok untuk quiz kolaboratif",
        "Selesaikan semua quiz yang tersedia (6 quiz)",
        "Sistem mencatat sebagai 'quiz_completed' activity",
        "Progress akan bertambah signifikan setelah quiz selesai",
      ],
    },
    {
      step: 4,
      title: "Assignment Submission",
      description: "Kerjakan dan submit semua assignment individual",
      icon: <EditOutlined />,
      color: "#fa8c16",
      actions: [
        "Klik tab 'Tugas' di material",
        "Kerjakan semua assignment yang tersedia (5 assignment)",
        "Submit jawaban untuk setiap assignment",
        "Sistem mencatat sebagai 'assignment_submitted' activity",
        "Progress akan mencapai 100% setelah semua assignment di-submit",
      ],
    },
  ];

  const progressSystemDetails = [
    {
      category: "Komponen Yang Mempengaruhi Progress",
      items: [
        "PDF Files: Setiap PDF yang dibuka akan menambah progress (activity_type: 'pdf_opened')",
        "YouTube Videos: Setiap video yang ditonton akan menambah progress (activity_type: 'video_played')",
        "Quiz Completion: Setiap quiz kelompok yang diselesaikan menambah progress signifikan",
        "Assignment Submission: Setiap assignment yang di-submit menambah progress",
        "Time Spent: Waktu yang dihabiskan dalam pembelajaran juga mempengaruhi progress",
        "Material Access: Akses ke material secara konsisten akan meningkatkan engagement",
      ],
    },
    {
      category: "Cara Kerja Perhitungan Progress",
      items: [
        "Sistem menggunakan StudentMaterialProgress model untuk tracking",
        "Progress dihitung berdasarkan StudentMaterialActivity yang tercatat",
        "Setiap aktivitas memiliki bobot yang sama dalam perhitungan total progress",
        "Progress diupdate secara real-time melalui API calls",
        "Progress 100% dicapai ketika semua komponen pembelajaran diselesaikan",
        "Sistem menggunakan completion_percentage field untuk menyimpan progress",
      ],
    },
    {
      category: "Monitoring Progress Real-Time",
      items: [
        "Progress Tracker tampil di pojok kanan bawah (desktop) atau floating button (mobile)",
        "Real-time update setiap kali siswa melakukan aktivitas pembelajaran",
        "Progress Card menampilkan detail breakdown aktivitas yang sudah diselesaikan",
        "Time tracking otomatis berjalan selama siswa aktif di halaman material",
        "Progress Drawer (mobile) menampilkan checklist aktivitas yang sudah selesai",
        "Visual feedback dengan warna hijau untuk aktivitas yang sudah completed",
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
      category: "Sistem ARCS dan Clustering",
      items: [
        "Dual Input Method: Kuesioner siswa dan upload CSV file",
        "K-Means Clustering: Otomatis berdasarkan kedua sumber data",
        "ARCS Questionnaire: 20 pertanyaan dengan 4 dimensi motivasi",
        "CSV Processing: Template file untuk import data eksternal",
        "Motivation Profiling: Klasifikasi High/Medium/Low motivation",
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
        "Dapat melihat hasil analisis ARCS personal dan mengakses quiz/assignment kolaboratif",
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
      category: "Data ARCS untuk Clustering",
      items: [
        "34 siswa sudah mengisi kuesioner ARCS lengkap (20 pertanyaan)",
        "File CSV template tersedia untuk download dan testing upload",
        "ARCS responses dengan 4 dimensi: Attention, Relevance, Confidence, Satisfaction",
        "Hasil clustering otomatis dari kedua metode input",
        "Student motivation profiles dengan klasifikasi High/Medium/Low",
      ],
    },
    {
      category: "Data Siswa Tersedia",
      items: [
        "34 siswa dengan nama Indonesia (Ahmad Rizki, Siti Nurhaliza, dll)",
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
  ];

  const renderMultiPathScenario = (scenario) => {
    return (
      <Card
        size="small"
        title={scenario.title}
        style={{ marginBottom: 16, borderRadius: 8 }}
        bodyStyle={{ padding: 16 }}
      >
        {/* Initial Steps */}
        <Steps
          direction="vertical"
          size="small"
          current={-1}
          items={scenario.steps.map((step, stepIndex) => ({
            title: `Langkah ${stepIndex + 1}`,
            description: step,
          }))}
        />

        {/* Path Options */}
        <div style={{ margin: "16px 0", textAlign: "center" }}>
          <ArrowDownOutlined style={{ fontSize: 20, color: "#1890ff" }} />
          <Text strong style={{ display: "block", margin: "8px 0" }}>
            Pilih salah satu metode berikut:
          </Text>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          {scenario.pathOptions.map((path, pathIndex) => (
            <Col xs={24} md={12} key={pathIndex}>
              <Card
                size="small"
                title={
                  <Space>
                    <div
                      style={{
                        background: path.color,
                        borderRadius: "50%",
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 12,
                      }}
                    >
                      {path.icon}
                    </div>
                    {path.title}
                  </Space>
                }
                style={{
                  height: "100%",
                  border: `2px solid ${path.color}20`,
                  borderRadius: 8,
                }}
              >
                <List
                  size="small"
                  dataSource={path.steps}
                  renderItem={(step, stepIndex) => (
                    <List.Item style={{ padding: "4px 0" }}>
                      <Text
                        style={{
                          fontSize: "13px",
                          fontWeight: step.includes("⚠️ PENTING")
                            ? "bold"
                            : "normal",
                          color: step.includes("⚠️ PENTING")
                            ? "#fa8c16"
                            : "inherit",
                        }}
                      >
                        {stepIndex + 1}. {step}
                      </Text>
                    </List.Item>
                  )}
                />

                {/* Download Button for CSV Method */}
                {pathIndex === 1 && (
                  <div style={{ marginTop: 12, textAlign: "center" }}>
                    <Button
                      type="primary"
                      size="small"
                      icon={<DownloadOutlined />}
                      href="https://pramlearnstorage.blob.core.windows.net/media/arcs_data.csv"
                      target="_blank"
                      style={{
                        background: path.color,
                        borderColor: path.color,
                        borderRadius: 6,
                      }}
                    >
                      Download Template CSV
                    </Button>
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>

        {/* Important Warning Alert */}
        <Alert
          message={
            <Space>
              <WarningOutlined />
              Perbedaan Penting Antara Kedua Metode Input
            </Space>
          }
          description={
            <div>
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ color: "#1890ff" }}>
                  Metode 1 (Kuesioner Siswa):
                </Text>
                <Text style={{ marginLeft: 8 }}>
                  Siswa mengisi kuesioner → Data tersimpan sebagai ARCSResponse
                  → Clustering manual/otomatis
                </Text>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ color: "#fa8c16" }}>
                  Metode 2 (Upload CSV):
                </Text>
                <Text style={{ marginLeft: 8 }}>
                  Upload CSV → Langsung update StudentMotivationProfile →
                  Clustering otomatis dijalankan
                </Text>
              </div>
              <div
                style={{
                  background: "#fff2e8",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #ffd591",
                  marginTop: 8,
                }}
              >
                <Text strong style={{ color: "#d46b08" }}>
                  <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                  Catatan Penting:
                </Text>
                <Text style={{ color: "#d46b08", marginLeft: 4 }}>
                  Jika siswa mengisi kuesioner setelah upload CSV, hasil
                  clustering tidak otomatis berubah. Upload CSV akan menimpa
                  data motivasi siswa yang sudah ada.
                </Text>
              </div>
            </div>
          }
          type="warning"
          showIcon
          style={{ marginTop: 16, borderRadius: 8 }}
        />

        {/* Final Steps */}
        <div style={{ margin: "16px 0", textAlign: "center" }}>
          <ArrowDownOutlined style={{ fontSize: 20, color: "#52c41a" }} />
          <Text strong style={{ display: "block", margin: "8px 0" }}>
            Langkah selanjutnya (dari metode manapun):
          </Text>
        </div>

        <Steps
          direction="vertical"
          size="small"
          current={-1}
          items={scenario.finalSteps.map((step, stepIndex) => ({
            title: `Langkah ${stepIndex + 4}`,
            description: step,
          }))}
        />
      </Card>
    );
  };

  const renderRegularScenario = (scenario) => {
    return (
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
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F5F5",
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
            message="Dataset Siap Evaluasi dengan Dual Input Method"
            description={
              <List
                size="small"
                dataSource={[
                  "34 siswa kelas XI TKJ 1 dengan data ARCS lengkap",
                  "Dual input method: Kuesioner siswa dan upload CSV file",
                  "6 quiz kelompok Teams Games Tournament (40+ soal jaringan komputer)",
                  "Real-time collaborative quiz menggunakan teknologi WebSocket",
                  "5 assignment individual dengan berbagai tingkat kesulitan",
                  "Algoritma K-Means clustering untuk pengelompokan motivasi ARCS",
                  "DEAP Genetic Algorithm untuk optimasi pembentukan kelompok heterogen/homogen",
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

        {/* ARCS Dual Input Method */}
        <Card
          title={
            <Space>
              <FormOutlined style={{ color: "#52c41a" }} />
              Dual Method Input untuk Clustering ARCS
            </Space>
          }
          style={{ marginBottom: 24, borderRadius: 12 }}
        >
          <Alert
            message="Sistem Mendukung Dua Metode Input Data ARCS"
            description="Sistem PramLearn mendukung dua cara untuk mendapatkan data ARCS yang akan digunakan dalam clustering: (1) Pengisian kuesioner langsung oleh siswa di dalam sistem, atau (2) Upload file CSV dengan data ARCS dari sumber eksternal."
            type="info"
            showIcon
            style={{ borderRadius: 8, marginBottom: 16 }}
          />

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card
                title={
                  <Space>
                    <FormOutlined style={{ color: "#1890ff" }} />
                    Metode 1: Kuesioner Siswa
                  </Space>
                }
                size="small"
                style={{
                  height: "100%",
                  borderRadius: 8,
                  border: "2px solid #1890ff20",
                }}
              >
                <List
                  size="small"
                  dataSource={[
                    "✅ 34 siswa sudah mengisi kuesioner ARCS (20 pertanyaan)",
                    "📊 Data tersimpan sebagai ARCSResponse & ARCSAnswer",
                    "⚠️ Clustering K-Means tetap berjalan meski data < 3 siswa",
                    "🔄 Perlu sinkronisasi manual ke StudentMotivationProfile",
                    "🎯 Data asli dari pengalaman siswa",
                    "📈 Terintegrasi dengan sistem learning analytics",
                  ]}
                  renderItem={(item) => (
                    <List.Item style={{ padding: "4px 0" }}>
                      <Text
                        style={{
                          fontSize: "14px",
                          fontWeight: item.includes("⚠️ Clustering")
                            ? "bold"
                            : "normal",
                          color: item.includes("⚠️ Clustering")
                            ? "#fa8c16"
                            : "inherit",
                        }}
                      >
                        {item}
                      </Text>
                    </List.Item>
                  )}
                />
                {/* New Alert about clustering with insufficient data */}
                <Alert
                  message={
                    <Space>
                      <InfoCircleOutlined />
                      Perilaku Clustering dengan Data Terbatas
                    </Space>
                  }
                  description={
                    <div>
                      <div style={{ marginBottom: 12 }}>
                        <Text strong style={{ color: "#1890ff" }}>
                          Apa yang terjadi jika data siswa kurang dari 3?
                        </Text>
                      </div>
                      <div style={{ marginLeft: 16, marginBottom: 8 }}>
                        <Text>
                          • <Text strong>Sistem tetap berjalan:</Text> K-Means
                          clustering tidak akan error
                        </Text>
                      </div>
                      <div style={{ marginLeft: 16, marginBottom: 8 }}>
                        <Text>
                          • <Text strong>Kualitas clustering buruk:</Text>{" "}
                          Beberapa cluster akan kosong atau duplikat
                        </Text>
                      </div>
                      <div style={{ marginLeft: 16, marginBottom: 8 }}>
                        <Text>
                          • <Text strong>Klasifikasi tidak optimal:</Text> Label
                          High/Medium/Low mungkin tidak representatif
                        </Text>
                      </div>
                      <div style={{ marginLeft: 16, marginBottom: 12 }}>
                        <Text>
                          • <Text strong>Pembentukan kelompok terganggu:</Text>{" "}
                          Genetic Algorithm dapat menghasilkan kelompok tidak
                          seimbang
                        </Text>
                      </div>
                      <div
                        style={{
                          background: "#f0f9ff",
                          padding: "12px",
                          borderRadius: 6,
                          border: "1px solid #bae0ff",
                        }}
                      >
                        <Text strong style={{ color: "#1890ff" }}>
                          Rekomendasi untuk Evaluasi:
                        </Text>
                        <ul style={{ margin: "8px 0 0 16px", paddingLeft: 0 }}>
                          <li>
                            <Text style={{ color: "#1890ff" }}>
                              Dataset saat ini (34 siswa) sudah optimal untuk
                              clustering
                            </Text>
                          </li>
                          <li>
                            <Text style={{ color: "#1890ff" }}>
                              Untuk testing edge case, bisa coba edit & upload
                              CSV dengan 1-2 data saja
                            </Text>
                          </li>
                        </ul>
                      </div>
                    </div>
                  }
                  type="info"
                  showIcon
                  style={{ borderRadius: 8, marginTop: 16 }}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                title={
                  <Space>
                    <UploadOutlined style={{ color: "#fa8c16" }} />
                    Metode 2: Upload CSV File
                  </Space>
                }
                size="small"
                style={{
                  height: "100%",
                  borderRadius: 8,
                  border: "2px solid #fa8c1620",
                }}
              >
                <List
                  size="small"
                  dataSource={[
                    "📁 Template CSV tersedia untuk download",
                    "⚡ Langsung update StudentMotivationProfile",
                    "🔄 Otomatis trigger clustering K-Means",
                    "🧪 Berguna untuk testing dengan data berbeda",
                    "📋 Mendukung bulk update data ARCS",
                  ]}
                  renderItem={(item) => (
                    <List.Item style={{ padding: "4px 0" }}>
                      <Text style={{ fontSize: "14px" }}>{item}</Text>
                    </List.Item>
                  )}
                />
                <div style={{ marginTop: 12, textAlign: "center" }}>
                  <Button
                    type="primary"
                    size="small"
                    icon={<DownloadOutlined />}
                    href="https://pramlearnstorage.blob.core.windows.net/media/arcs_data.csv"
                    target="_blank"
                    style={{
                      background: "#fa8c16",
                      borderColor: "#fa8c16",
                      borderRadius: 6,
                    }}
                  >
                    Download Template CSV
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>

          {/* New Critical Warning Alert */}
          <Alert
            message={
              <Space>
                <ExclamationCircleOutlined />
                Peringatan Penting untuk Evaluasi Dual Input Method
              </Space>
            }
            description={
              <div>
                <div style={{ marginBottom: 12 }}>
                  <Text strong style={{ color: "#d46b08" }}>
                    <SyncOutlined style={{ marginRight: 4 }} />
                    Perbedaan Alur Data:
                  </Text>
                </div>
                <div style={{ marginLeft: 16, marginBottom: 8 }}>
                  <Text>
                    • <Text strong>Kuesioner:</Text> ARCSResponse → (manual
                    sync) → StudentMotivationProfile → Clustering
                  </Text>
                </div>
                <div style={{ marginLeft: 16, marginBottom: 12 }}>
                  <Text>
                    • <Text strong>Upload CSV:</Text> File CSV → (langsung) →
                    StudentMotivationProfile → Auto Clustering
                  </Text>
                </div>
                <div
                  style={{
                    background: "#fff7e6",
                    padding: "12px",
                    borderRadius: 6,
                    border: "1px solid #ffd591",
                  }}
                >
                  <Text strong style={{ color: "#d46b08" }}>
                    Implikasi untuk Evaluasi:
                  </Text>
                  <ul style={{ margin: "8px 0 0 16px", paddingLeft: 0 }}>
                    <li>
                      <Text style={{ color: "#d46b08" }}>
                        Upload CSV akan menimpa data motivasi siswa yang sudah
                        ada
                      </Text>
                    </li>
                    <li>
                      <Text style={{ color: "#d46b08" }}>
                        Kuesioner siswa tidak otomatis memperbarui clustering
                      </Text>
                    </li>
                    <li>
                      <Text style={{ color: "#d46b08" }}>
                        Untuk akurasi evaluasi, pilih satu metode dan gunakan
                        konsisten
                      </Text>
                    </li>
                  </ul>
                </div>
              </div>
            }
            type="warning"
            showIcon
            style={{ borderRadius: 8, marginTop: 16 }}
          />
        </Card>

        {/* Real-time Collaboration Feature */}
        <Card
          title={
            <Space>
              <WifiOutlined style={{ color: "#722ed1" }} />
              Fitur Unggulan: Kuis Kolaboratif Real-Time
            </Space>
          }
          style={{ marginBottom: 24, borderRadius: 12 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card
                title="Bagaimana Cara Kerja Kolaborasi Real-Time?"
                size="small"
                style={{ height: "100%", borderRadius: 8 }}
              >
                <List
                  size="small"
                  dataSource={[
                    "Anggota kelompok terhubung secara langsung melalui internet",
                    "Ketika satu siswa menjawab soal, jawaban langsung terlihat oleh anggota lain",
                    "Siswa dapat melihat siapa yang sedang online dan mengerjakan quiz",
                    "Navigasi soal (pindah ke soal lain) juga terlihat secara real-time",
                    "Sistem menampilkan nama siswa yang menjawab setiap soal",
                  ]}
                  renderItem={(item) => (
                    <List.Item style={{ padding: "4px 0" }}>
                      <Text style={{ fontSize: "14px" }}>• {item}</Text>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                title="Apa yang Terjadi Saat Quiz Berakhir?"
                size="small"
                style={{ height: "100%", borderRadius: 8 }}
              >
                <List
                  size="small"
                  dataSource={[
                    "Jika salah satu anggota menekan tombol 'Submit', seluruh kelompok otomatis berhenti",
                    "Semua anggota kelompok langsung dialihkan ke halaman hasil quiz",
                    "Quiz juga berhenti otomatis jika waktu habis",
                    "Sistem menampilkan notifikasi kepada semua anggota",
                    "Hasil quiz kelompok tersimpan untuk semua anggota",
                  ]}
                  renderItem={(item) => (
                    <List.Item style={{ padding: "4px 0" }}>
                      <Text style={{ fontSize: "14px" }}>• {item}</Text>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>

          <Alert
            message={
              <Space>
                <ClockCircleOutlined />
                Tips untuk Evaluasi Real-Time Collaboration
              </Space>
            }
            description={
              <div style={{ marginTop: 8 }}>
                <Text strong>Untuk menguji fitur kolaborasi:</Text>
                <ol style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
                  <li>Buka 2-3 browser atau tab berbeda</li>
                  <li>
                    Login dengan akun student yang berbeda (misal: student1,
                    student2, student3)
                  </li>
                  <li>Bergabung dalam quiz kelompok yang sama</li>
                  <li>
                    Amati bagaimana jawaban dan navigasi soal tersinkronisasi
                    secara real-time
                  </li>
                  <li>
                    Coba submit quiz dari salah satu akun dan lihat efeknya pada
                    akun lain
                  </li>
                </ol>
              </div>
            }
            type="success"
            showIcon
            style={{ borderRadius: 8, marginTop: 16 }}
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

        {/* TAMBAHAN BARU: Progress Achievement Guide */}
        <Card
          title={
            <Space>
              <FireOutlined style={{ color: "#eb2f96" }} />
              Panduan Mencapai 100% Progress Siswa
            </Space>
          }
          style={{ marginBottom: 24, borderRadius: 12 }}
        >
          <Alert
            message="Cara Mencapai Progress Pembelajaran 100%"
            description="Progress siswa dihitung berdasarkan completion dari berbagai aktivitas pembelajaran. Untuk mencapai 100%, siswa harus menyelesaikan semua komponen pembelajaran yang tersedia di dalam material."
            type="info"
            showIcon
            style={{ borderRadius: 8, marginBottom: 16 }}
          />

          <Timeline>
            {progressAchievementGuide.map((guide, index) => (
              <Timeline.Item
                key={index}
                dot={
                  <div
                    style={{
                      background: guide.color,
                      borderRadius: "50%",
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                    }}
                  >
                    {guide.icon}
                  </div>
                }
              >
                <Card
                  size="small"
                  title={`Step ${guide.step}: ${guide.title}`}
                  style={{ marginBottom: 16, borderRadius: 8 }}
                  bodyStyle={{ padding: 16 }}
                >
                  <Text
                    style={{ fontSize: 14, marginBottom: 12, display: "block" }}
                  >
                    {guide.description}
                  </Text>
                  <List
                    size="small"
                    dataSource={guide.actions}
                    renderItem={(action, actionIndex) => (
                      <List.Item style={{ padding: "4px 0" }}>
                        <Text style={{ fontSize: 13 }}>
                          {actionIndex + 1}. {action}
                        </Text>
                      </List.Item>
                    )}
                  />
                </Card>
              </Timeline.Item>
            ))}
          </Timeline>

          <Alert
            message={
              <Space>
                <StarOutlined />
                Tips untuk Monitoring Progress Real-Time
              </Space>
            }
            description={
              <div>
                <div style={{ marginBottom: 12 }}>
                  <Text strong style={{ color: "#eb2f96" }}>
                    Cara Melihat Progress Real-Time:
                  </Text>
                </div>
                <div style={{ marginLeft: 16, marginBottom: 8 }}>
                  <Text>
                    • <Text strong>Desktop:</Text> Progress Card di pojok kanan
                    bawah menampilkan persentase progress
                  </Text>
                </div>
                <div style={{ marginLeft: 16, marginBottom: 8 }}>
                  <Text>
                    • <Text strong>Mobile:</Text> Progress Drawer bisa dibuka
                    dengan tap floating button
                  </Text>
                </div>
                <div style={{ marginLeft: 16, marginBottom: 8 }}>
                  <Text>
                    • <Text strong>Real-time Update:</Text> Progress langsung
                    terupdate setiap kali aktivitas selesai
                  </Text>
                </div>
                <div style={{ marginLeft: 16, marginBottom: 8 }}>
                  <Text>
                    • <Text strong>Checklist:</Text> Aktivitas yang sudah
                    completed akan menampilkan checkmark hijau
                  </Text>
                </div>
                <div style={{ marginLeft: 16, marginBottom: 12 }}>
                  <Text>
                    • <Text strong>Time Tracking:</Text> Waktu pembelajaran
                    tercatat otomatis selama siswa aktif
                  </Text>
                </div>
                <div
                  style={{
                    background: "#fff0f6",
                    padding: "12px",
                    borderRadius: 6,
                    border: "1px solid #ffadd2",
                  }}
                >
                  <Text strong style={{ color: "#eb2f96" }}>
                    Target untuk Evaluasi:
                  </Text>
                  <ul style={{ margin: "8px 0 0 16px", paddingLeft: 0 }}>
                    <li>
                      <Text style={{ color: "#eb2f96" }}>
                        Test dengan minimal 2-3 akun student untuk melihat
                        variasi progress
                      </Text>
                    </li>
                    <li>
                      <Text style={{ color: "#eb2f96" }}>
                        Satu akun lakukan semua aktivitas (target 100%)
                      </Text>
                    </li>
                    <li>
                      <Text style={{ color: "#eb2f96" }}>
                        Akun lain lakukan sebagian aktivitas (target 25%, 50%,
                        75%)
                      </Text>
                    </li>
                  </ul>
                </div>
              </div>
            }
            type="success"
            showIcon
            style={{ borderRadius: 8, marginTop: 16 }}
          />
        </Card>

        {/* TAMBAHAN BARU: Progress System Details */}
        <Card
          title={
            <Space>
              <BarChartOutlined style={{ color: "#13c2c2" }} />
              Detail Sistem Progress Pembelajaran
            </Space>
          }
          style={{ marginBottom: 24, borderRadius: 12 }}
        >
          <Collapse
            items={progressSystemDetails.map((detail, index) => ({
              key: index.toString(),
              label: detail.category,
              children: (
                <List
                  size="small"
                  dataSource={detail.items}
                  renderItem={(item) => (
                    <List.Item>
                      <RightOutlined
                        style={{
                          color: "#13c2c2",
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
                {scenario.isMultiPath
                  ? renderMultiPathScenario(scenario)
                  : renderRegularScenario(scenario)}
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>

        {/* Technical Aspects */}
        <Card
          title={
            <Space>
              <SettingOutlined style={{ color: "#722ed1" }} />
              Aspek Teknis yang Dapat Dievaluasi
            </Space>
          }
          style={{ marginBottom: 24, borderRadius: 12 }}
        >
          <Collapse
            // defaultActiveKey={["0"]}
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
        </Card>

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
            // defaultActiveKey={["0"]}
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
                    <li>Template CSV tersedia untuk download</li>
                    <li>Student motivation profiles tersedia</li>
                    <li>6 quiz kelompok siap untuk dikerjakan</li>
                    <li>5 assignment individual tersedia</li>
                    <li>Real-time collaboration system aktif</li>
                    <li>Progress tracking system berjalan real-time</li>
                    <li>1 PDF dan 2 video pembelajaran tersedia</li>
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
                    <li>
                      Progress siswa masih 0% (belum ada yang mengerjakan)
                    </li>
                    <li>Quiz kelompok belum dikerjakan siswa</li>
                    <li>Assignment belum dikerjakan siswa</li>
                    <li>Kelompok belum dibentuk otomatis</li>
                    <li>Testing upload CSV belum dilakukan</li>
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
            message="Fokus Evaluasi: Dual Input Method, Teams Games Tournament, dan Progress Tracking"
            description={
              <List
                size="small"
                dataSource={[
                  "Dual Input Method: Evaluasi kedua metode input data ARCS (kuesioner vs upload CSV) dan perbedaan alur datanya",
                  "Algoritma Clustering: Evaluasi efektivitas K-Means dari kedua sumber data dengan memahami limitasi sinkronisasi",
                  "Pembentukan Kelompok: Test DEAP Genetic Algorithm untuk optimasi kelompok heterogen vs homogen",
                  "Teams Games Tournament: Evaluasi 6 quiz kelompok dengan real-time collaboration menggunakan WebSocket",
                  "Progress Tracking: Test sistem progress real-time dengan berbagai aktivitas pembelajaran untuk mencapai 100%",
                  "CSV Processing: Test fitur upload file CSV dengan template yang disediakan dan dampaknya pada clustering",
                  "Real-time Features: Test sinkronisasi jawaban, navigasi soal, dan auto-submit dalam kelompok",
                  "Learning Analytics: Analisis student activities, attendance, dan progress tracking dengan visualisasi real-time",
                  "Usability Testing: Kemudahan penggunaan dari perspektif teacher (clustering) dan student (quiz collaboration + progress monitoring)",
                  "Educational Impact: Dampak clustering, kolaborasi real-time, dan progress tracking terhadap efektivitas pembelajaran kelompok",
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
              Dataset lengkap 34 siswa kelas XI TKJ 1 dengan dual input method
              untuk clustering ARCS dan implementasi Teams Games Tournament
              dengan fitur kolaborasi real-time.
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
                🏆 3 Quiz TGT
              </Tag>
              <Tag color="red" style={{ margin: "4px" }}>
                📝 5 Assignment
              </Tag>
              <Tag color="cyan" style={{ margin: "4px" }}>
                📡 Real-time WebSocket
              </Tag>
              <Tag color="gold" style={{ margin: "4px" }}>
                📁 Dual Input Method
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
