import React from "react";
import { Card, Alert, Typography } from "antd";

const { Title } = Typography;

const QuizImprovementSection = ({ score, isGroupQuiz }) => {
  return (
    <Card
      style={{
        marginTop: 24,
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <Title level={5} style={{ marginBottom: 16, color: "#11418b" }}>
        💡 Saran Pengembangan {isGroupQuiz ? "Tim" : ""}
      </Title>

      {score >= 90 ? (
        <Alert
          message={`${
            isGroupQuiz ? "Pencapaian Tim" : "Pencapaian"
          } Luar Biasa! 🎉`}
          description={
            <div>
              <p>
                {isGroupQuiz
                  ? "Selamat! Tim telah menunjukkan kerja sama dan pemahaman yang sangat baik pada quiz ini."
                  : "Selamat! Anda telah menunjukkan pemahaman yang sangat baik pada quiz ini."}
              </p>
              <p>
                <strong>Saran untuk langkah selanjutnya:</strong>
              </p>
              <ul>
                {isGroupQuiz ? (
                  <>
                    <li>
                      Pertahankan komunikasi dan kerja sama tim yang solid
                    </li>
                    <li>Berbagi strategi belajar yang efektif antar anggota</li>
                    <li>Bantu kelompok lain yang membutuhkan bantuan</li>
                    <li>Eksplorasi materi tambahan secara bersama-sama</li>
                  </>
                ) : (
                  <>
                    <li>Pertahankan konsistensi belajar yang sudah baik</li>
                    <li>Bantu teman-teman yang membutuhkan bantuan</li>
                    <li>
                      Eksplorasi materi tambahan untuk memperdalam pemahaman
                    </li>
                    <li>Pertimbangkan untuk mengikuti quiz kelompok</li>
                  </>
                )}
              </ul>
            </div>
          }
          type="success"
          showIcon
          style={{ borderRadius: 12 }}
        />
      ) : score >= 75 ? (
        <Alert
          message={`Hasil ${isGroupQuiz ? "Tim" : ""} yang Baik! 👍`}
          description={
            <div>
              <p>
                {isGroupQuiz
                  ? "Tim telah menunjukkan kerja sama dan pemahaman yang cukup baik pada quiz ini."
                  : "Anda telah menunjukkan pemahaman yang cukup baik pada quiz ini."}
              </p>
              <p>
                <strong>Saran untuk perbaikan:</strong>
              </p>
              <ul>
                {isGroupQuiz ? (
                  <>
                    <li>Review kembali materi bersama anggota tim</li>
                    <li>Diskusikan strategi menjawab yang lebih efektif</li>
                    <li>
                      Bagi tugas review materi berdasarkan kekuatan
                      masing-masing
                    </li>
                    <li>Konsultasi dengan guru untuk klarifikasi konsep</li>
                  </>
                ) : (
                  <>
                    <li>Review kembali materi yang terkait dengan quiz</li>
                    <li>
                      Konsultasi dengan guru untuk klarifikasi konsep yang belum
                      jelas
                    </li>
                    <li>Latihan soal tambahan untuk memperkuat pemahaman</li>
                    <li>Pertimbangkan bergabung dalam grup belajar</li>
                  </>
                )}
              </ul>
            </div>
          }
          type="info"
          showIcon
          style={{ borderRadius: 12 }}
        />
      ) : (
        <Alert
          message={`${isGroupQuiz ? "Tim" : ""} Perlu Perbaikan 📚`}
          description={
            <div>
              <p>
                {isGroupQuiz
                  ? "Ada beberapa area yang perlu diperbaiki dalam kerja sama dan pemahaman tim untuk quiz ini."
                  : "Ada beberapa area yang perlu diperbaiki untuk quiz ini."}
              </p>
              <p>
                <strong>Langkah yang disarankan:</strong>
              </p>
              <ul>
                {isGroupQuiz ? (
                  <>
                    <li>Evaluasi kembali strategi kerja sama tim</li>
                    <li>Pelajari kembali materi dasar secara bersama-sama</li>
                    <li>Buat jadwal study group yang teratur</li>
                    <li>Diskusikan pembagian peran yang lebih efektif</li>
                    <li>Minta bantuan guru untuk mentoring kelompok</li>
                    <li>Buat catatan ringkasan tim untuk memudahkan review</li>
                  </>
                ) : (
                  <>
                    <li>Pelajari kembali materi dasar yang terkait</li>
                    <li>
                      Minta bantuan guru atau teman untuk penjelasan lebih
                      detail
                    </li>
                    <li>Buat catatan ringkasan untuk memudahkan review</li>
                    <li>Kerjakan latihan soal tambahan</li>
                    <li>Bergabung dengan kelompok belajar</li>
                    <li>
                      Jangan ragu untuk bertanya jika ada yang tidak dipahami
                    </li>
                  </>
                )}
              </ul>
            </div>
          }
          type="warning"
          showIcon
          style={{ borderRadius: 12 }}
        />
      )}
    </Card>
  );
};

export default QuizImprovementSection;
