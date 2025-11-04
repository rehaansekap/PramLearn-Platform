import { useState } from "react";
import api from "../../../api";
import Swal from "sweetalert2";

const useGroupFormation = (materialId, onGroupsChanged) => {
  const [groupMessage, setGroupMessage] = useState("");
  const [groupProcessing, setGroupProcessing] = useState(false);

  const handleAutoGroup = async (mode) => {
    setGroupProcessing(true);
    setGroupMessage("Processing...");

    try {
      const response = await api.post(`materials/${materialId}/auto-group/`, {
        n_clusters: 3,
        mode,
      });
      setGroupMessage(response.data.message);
      if (onGroupsChanged) onGroupsChanged();
    } catch (error) {
      if (error.response?.status === 409) {
        const result = await Swal.fire({
          title: "Kelompok sudah ada!",
          text: "Kelompok untuk materi ini sudah ada. Apakah Anda ingin menimpa kelompok yang sudah ada?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Timpa",
          cancelButtonText: "Batal",
        });

        if (result.isConfirmed) {
          await handleForceOverwrite(mode);
        } else {
          setGroupMessage("Pembuatan kelompok dibatalkan.");
        }
      } else {
        setGroupMessage(
          error.response?.data?.error || "Gagal membentuk kelompok."
        );
      }
    } finally {
      setGroupProcessing(false);
    }
  };

  const handleForceOverwrite = async (mode) => {
    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await api.post(
        `teacher/sessions/material/${materialSlug}/auto-group/`,
        {
          n_clusters: 3,
          mode,
          force_overwrite: true,
        }
      );

      setGroupMessage(response.data.message);
      message.success("Kelompok berhasil dibuat ulang!");

      // Show detailed success alert with data for overwrite
      let warningText = "";
      if (response.data.warning) {
        warningText = `
        <div style="background: #fff7e6; padding: 12px; border-radius: 6px; margin-bottom: 12px; border-left: 4px solid #faad14;">
          <strong>⚠️ Peringatan:</strong><br/>
          ${response.data.warning}
        </div>
      `;
      }

      if (response.data.motivation_distribution) {
        await Swal.fire({
          title: "Kelompok Berhasil Ditimpa! 🔄",
          html: `
          <div style="text-align: left;">
            <p><strong>${response.data.message}</strong></p>
            <p style="margin: 8px 0; color: #52c41a;"><strong>✅ Kelompok lama telah diganti dengan yang baru</strong></p>
            <p style="margin: 8px 0; color: #1677ff;"><strong>${
              response.data.quality_message || ""
            }</strong></p>
            
            ${warningText}
              
              <!-- Quality Analysis -->
             ${
               response.data.quality_analysis
                 ? `
              <div style="background: #f0f7ff; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
                <strong>📊 Analisis Kualitas Kelompok Baru:</strong><br/>
                • Mode: ${response.data.quality_analysis.formation_mode}<br/>
                • Keseimbangan: ${
                  response.data.quality_analysis.interpretation?.balance ||
                  "Tidak Tersedia"
                } (${(
                     response.data.quality_analysis.balance_score * 100
                   ).toFixed(1)}%)<br/>
                • Keberagaman: ${
                  response.data.quality_analysis.interpretation
                    ?.heterogeneity || "Tidak Tersedia"
                } (${(
                     response.data.quality_analysis.heterogeneity_score * 100
                   ).toFixed(1)}%)<br/>
                • Keseragaman: ${
                  response.data.quality_analysis.interpretation?.uniformity ||
                  "Tidak Tersedia"
                } (${(
                     response.data.quality_analysis.uniformity_score * 100
                   ).toFixed(1)}%)<br/>
              </div>
            `
                 : ""
             }
              
              <!-- Export Button -->
              <div style="text-align: center; margin: 16px 0; padding: 12px; background: #f8f9fa; border-radius: 6px;">
                <p style="margin: 0 0 8px 0; color: #1677ff; font-weight: 500;">
                  📄 Laporan analisis lengkap tersedia untuk didownload
                </p>
                <button 
                  onclick="window.exportGroupAnalysisFromSwal && window.exportGroupAnalysisFromSwal()"
                  style="
                    background: #11418b; 
                    color: white; 
                    border: none; 
                    padding: 8px 16px; 
                    border-radius: 6px; 
                    cursor: pointer; 
                    font-weight: 500;
                  "
                >
                  📥 Download Laporan PDF
                </button>
              </div>
              
              <!-- Group Summary -->
              ${
                response.data.groups && response.data.groups.length > 8
                  ? `
                <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
                  <strong>👥 Ringkasan Kelompok Baru (${
                    response.data.groups.length
                  } kelompok):</strong><br/>
                  <div style="max-height: 150px; overflow-y: auto; margin-top: 8px;">
                    ${response.data.groups
                      .map(
                        (group, index) => `
                      <div style="margin: 2px 0; padding: 4px; background: white; border-radius: 4px; font-size: 12px;">
                        <strong>${group.name}</strong> (${group.size} siswa): 
                        H:${group.motivation_distribution.High} 
                        M:${group.motivation_distribution.Medium} 
                        L:${group.motivation_distribution.Low}
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                </div>
              `
                  : `
                <div style="margin-top: 12px;">
                  <strong>👥 Detail Kelompok Baru:</strong><br/>
                  ${
                    response.data.groups
                      ?.map(
                        (group, index) => `
                    <div style="margin: 4px 0; padding: 8px; background: #f8f9fa; border-radius: 4px;">
                      <strong>${group.name}</strong> (${
                          group.size
                        } anggota)<br/>
                      <small style="color: #666;">
                        ${
                          group.motivation_distribution.High > 0
                            ? `Tinggi: ${group.motivation_distribution.High} `
                            : ""
                        }
                        ${
                          group.motivation_distribution.Medium > 0
                            ? `Sedang: ${group.motivation_distribution.Medium} `
                            : ""
                        }
                        ${
                          group.motivation_distribution.Low > 0
                            ? `Rendah: ${group.motivation_distribution.Low}`
                            : ""
                        }
                        ${group.size === 0 ? "Kosong" : ""}
                      </small>
                    </div>
                  `
                      )
                      .join("") || ""
                  }
                </div>
              `
              }
            </div>
          `,
          icon: "success",
          confirmButtonText: "Tutup",
          confirmButtonColor: "#52c41a",
          width: 700,
          didOpen: () => {
            // Make export function available to the button in SweetAlert
            window.exportGroupAnalysisFromSwal = () => {
              Swal.close();
              exportGroupAnalysis();
            };
          },
          willClose: () => {
            // Clean up the global function
            delete window.exportGroupAnalysisFromSwal;
          },
        });
      } else {
        // Fallback jika tidak ada data detail
        await Swal.fire({
          title: "Kelompok Berhasil Ditimpa! 🔄",
          text:
            response.data.message ||
            "Kelompok lama telah diganti dengan kelompok baru.",
          icon: "success",
          confirmButtonText: "Tutup",
          confirmButtonColor: "#52c41a",
        });
      }

      if (onGroupsChanged) {
        await onGroupsChanged();
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Gagal membentuk kelompok.";
      setGroupMessage(errorMessage);
      message.error(errorMessage);
    }
  };

  return {
    groupMessage,
    groupProcessing,
    handleAutoGroup,
  };
};

export default useGroupFormation;
