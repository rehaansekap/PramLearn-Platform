import React from "react";
import { Card, Alert, Typography } from "antd";

const { Title } = Typography;

const AssignmentImprovementCard = ({ score }) => (
  <Card style={{ marginTop: 24, borderRadius: 12 }}>
    <Title level={5} style={{ marginBottom: 16 }}>
      💡 Saran Pengembangan
    </Title>
    {score >= 90 ? (
      <Alert
        message="Pencapaian Luar Biasa! 🎉"
        description={
          <div>
            <p>
              Selamat! Anda telah menunjukkan pemahaman yang sangat baik pada
              assignment ini.
            </p>
            <p>
              <strong>Saran untuk langkah selanjutnya:</strong>
            </p>
            <ul>
              <li>Pertahankan konsistensi belajar yang sudah baik</li>
              <li>Bantu teman-teman yang membutuhkan bantuan</li>
              <li>Eksplorasi materi tambahan untuk memperdalam pemahaman</li>
            </ul>
          </div>
        }
        type="success"
        showIcon
      />
    ) : score >= 75 ? (
      <Alert
        message="Hasil yang Baik! 👍"
        description={
          <div>
            <p>
              Anda telah menunjukkan pemahaman yang cukup baik pada assignment
              ini.
            </p>
            <p>
              <strong>Saran untuk perbaikan:</strong>
            </p>
            <ul>
              <li>Review kembali materi yang terkait dengan assignment</li>
              <li>
                Konsultasi dengan guru untuk klarifikasi konsep yang belum jelas
              </li>
              <li>Latihan soal tambahan untuk memperkuat pemahaman</li>
            </ul>
          </div>
        }
        type="info"
        showIcon
      />
    ) : (
      <Alert
        message="Perlu Perbaikan 📚"
        description={
          <div>
            <p>Ada beberapa area yang perlu diperbaiki untuk assignment ini.</p>
            <p>
              <strong>Langkah yang disarankan:</strong>
            </p>
            <ul>
              <li>Pelajari kembali materi dasar yang terkait</li>
              <li>
                Minta bantuan guru atau teman untuk penjelasan lebih detail
              </li>
              <li>Buat catatan ringkasan untuk memudahkan review</li>
              <li>Kerjakan latihan soal tambahan</li>
              <li>Jangan ragu untuk bertanya jika ada yang tidak dipahami</li>
            </ul>
          </div>
        }
        type="warning"
        showIcon
      />
    )}
  </Card>
);

export default AssignmentImprovementCard;
