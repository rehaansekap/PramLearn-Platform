import React, { useState } from "react";
import { Card, Typography, Collapse, Divider } from "antd";
import {
  InfoCircleOutlined,
  FileTextOutlined,
  DownOutlined,
  RightOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;
const { Panel } = Collapse;

const ARCSFormatGuide = ({ isMobile = false }) => {
  const [activePanel, setActivePanel] = useState(null);

  const formatExamples = [
    {
      title: "Format 1 - Dengan Dimensi (20 Pertanyaan)",
      description:
        "File CSV berisi jawaban per pertanyaan untuk setiap dimensi ARCS",
      headers:
        "username,dim_A_q1,dim_A_q2,dim_A_q3,dim_A_q4,dim_A_q5,dim_R_q1,dim_R_q2,dim_R_q3,dim_R_q4,dim_R_q5,dim_C_q1,dim_C_q2,dim_C_q3,dim_C_q4,dim_C_q5,dim_S_q1,dim_S_q2,dim_S_q3,dim_S_q4,dim_S_q5",
      example: "student001,4,5,4,5,4,3,4,4,3,4,5,4,5,4,5,4,5,4,4,5",
      color: "#1677ff",
    },
    {
      title: "Format 2 - Nilai ARCS Langsung",
      description: "File CSV berisi rata-rata nilai untuk setiap dimensi ARCS",
      headers: "username,attention,relevance,confidence,satisfaction",
      example: "student001,4.2,3.6,4.6,4.4\nstudent002,3.8,4.0,3.2,3.9",
      color: "#52c41a",
    },
  ];

  return (
    <Card
      style={{
        borderRadius: 12,
        border: "1px solid #e6f4ff",
        backgroundColor: "#fafcff",
      }}
      bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
    >
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              backgroundColor: "#e6f4ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <InfoCircleOutlined style={{ color: "#1677ff", fontSize: 16 }} />
          </div>
          <Title
            level={4}
            style={{
              margin: 0,
              color: "#11418b",
              fontSize: isMobile ? "16px" : "18px",
              fontWeight: 600,
            }}
          >
            📋 Panduan Format File CSV
          </Title>
        </div>
        <Text
          type="secondary"
          style={{
            fontSize: isMobile ? "13px" : "14px",
            lineHeight: 1.5,
            display: "block",
          }}
        >
          Sistem mendukung dua format file CSV. Pilih format yang sesuai dengan
          data Anda.
        </Text>
      </div>

      <Collapse
        activeKey={activePanel}
        onChange={setActivePanel}
        ghost
        expandIcon={({ isActive }) =>
          isActive ? (
            <DownOutlined style={{ color: "#11418b" }} />
          ) : (
            <RightOutlined style={{ color: "#11418b" }} />
          )
        }
        style={{ backgroundColor: "transparent" }}
      >
        {formatExamples.map((format, index) => (
          <Panel
            key={index}
            header={
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <FileTextOutlined
                  style={{ color: format.color, fontSize: 16 }}
                />
                <div>
                  <Text
                    strong
                    style={{
                      color: format.color,
                      fontSize: isMobile ? "14px" : "15px",
                      display: "block",
                    }}
                  >
                    {format.title}
                  </Text>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: isMobile ? "12px" : "13px",
                      display: "block",
                      marginTop: 2,
                    }}
                  >
                    {format.description}
                  </Text>
                </div>
              </div>
            }
            style={{
              marginBottom: 8,
              backgroundColor: "#ffffff",
              border: `1px solid ${format.color}20`,
              borderRadius: 8,
            }}
          >
            <div style={{ padding: isMobile ? "12px" : "16px" }}>
              <div style={{ marginBottom: 16 }}>
                <Text
                  strong
                  style={{ display: "block", marginBottom: 8, color: "#333" }}
                >
                  Header Kolom:
                </Text>
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    padding: isMobile ? 8 : 12,
                    fontFamily: "monospace",
                    fontSize: isMobile ? 10 : 11,
                    color: "#475569",
                    overflowX: "auto",
                    whiteSpace: "nowrap",
                  }}
                >
                  {format.headers}
                </div>
              </div>

              <div>
                <Text
                  strong
                  style={{ display: "block", marginBottom: 8, color: "#333" }}
                >
                  Contoh Data:
                </Text>
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    padding: isMobile ? 8 : 12,
                    fontFamily: "monospace",
                    fontSize: isMobile ? 10 : 11,
                    color: "#475569",
                    overflowX: "auto",
                    whiteSpace: "pre-line",
                  }}
                >
                  {format.example}
                </div>
              </div>

              {index === 0 && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    backgroundColor: "#fff7e6",
                    border: "1px solid #ffd591",
                    borderRadius: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: isMobile ? "11px" : "12px",
                      color: "#d46b08",
                      display: "block",
                    }}
                  >
                    💡 <strong>Tips:</strong> Setiap dimensi (A, R, C, S)
                    memiliki 5 pertanyaan dengan skala 1-5.
                  </Text>
                </div>
              )}
            </div>
          </Panel>
        ))}
      </Collapse>

      <Divider style={{ margin: "20px 0 16px 0" }} />

      <div
        style={{
          padding: isMobile ? 12 : 16,
          backgroundColor: "#f0f9ff",
          border: "1px solid #bae0ff",
          borderRadius: 8,
        }}
      >
        <Text
          strong
          style={{
            color: "#0369a1",
            fontSize: isMobile ? "12px" : "13px",
            display: "block",
            marginBottom: 8,
          }}
        >
          ⚠️ Catatan Penting:
        </Text>
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          <li>
            <Text
              style={{
                fontSize: isMobile ? "11px" : "12px",
                color: "#0369a1",
                lineHeight: 1.4,
              }}
            >
              Username siswa harus sesuai dengan data yang ada di sistem
            </Text>
          </li>
          <li>
            <Text
              style={{
                fontSize: isMobile ? "11px" : "12px",
                color: "#0369a1",
                lineHeight: 1.4,
              }}
            >
              Nilai ARCS menggunakan skala 1-5 (1=Sangat Rendah, 5=Sangat
              Tinggi)
            </Text>
          </li>
          <li>
            <Text
              style={{
                fontSize: isMobile ? "11px" : "12px",
                color: "#0369a1",
                lineHeight: 1.4,
              }}
            >
              Sistem akan otomatis melakukan clustering menjadi Low, Medium,
              High
            </Text>
          </li>
        </ul>
      </div>
    </Card>
  );
};

export default ARCSFormatGuide;
