import { useState, useContext } from "react";
import { message } from "antd";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";
import Swal from "sweetalert2";
// import "../styles/styles.css";

const useSessionGroupFormation = (materialSlug, onGroupsChanged) => {
  const { token } = useContext(AuthContext);
  const [groupMessage, setGroupMessage] = useState("");
  const [groupProcessing, setGroupProcessing] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false); // Add export state

  // Export group analysis as PDF
  const exportGroupAnalysis = async () => {
    if (!materialSlug) {
      message.error("Material tidak ditemukan");
      return;
    }

    setExportingPdf(true);

    try {
      // Construct the correct API URL
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const apiUrl = `${baseUrl}/api/teacher/sessions/material/${materialSlug}/auto-group/?export=pdf`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      // Get filename from Content-Disposition header or create default
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `analisis_kelompok_${materialSlug}_${
        new Date().toISOString().split("T")[0]
      }.pdf`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }

      // Convert response to blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;

      // Trigger download
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Show success message
      message.success("📄 Laporan analisis kelompok berhasil didownload!");
    } catch (error) {
      console.error("Error exporting PDF:", error);

      // Show detailed error message
      let errorMessage = "Gagal mengexport PDF. ";

      if (error.message.includes("404")) {
        errorMessage += "Kelompok belum dibuat atau tidak ditemukan.";
      } else if (error.message.includes("403")) {
        errorMessage +=
          "Anda tidak memiliki akses untuk mengexport analisis ini.";
      } else if (error.message.includes("500")) {
        errorMessage += "Terjadi kesalahan server. Silakan coba lagi.";
      } else {
        errorMessage += error.message;
      }

      await Swal.fire({
        title: "Export Gagal",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ff4d4f",
      });
    } finally {
      setExportingPdf(false);
    }
  };

  // Check if groups exist for export
  const checkGroupsExist = async () => {
    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get(
        `teacher/sessions/material/${materialSlug}/`
      );
      const groups = response.data.groups || [];
      return groups.length > 0;
    } catch (error) {
      console.error("Error checking groups:", error);
      return false;
    }
  };

  // Handle export with validation
  const handleExportAnalysis = async () => {
    const groupsExist = await checkGroupsExist();

    if (!groupsExist) {
      await Swal.fire({
        title: "Belum Ada Kelompok",
        text: "Belum ada kelompok yang dibuat untuk materi ini. Buat kelompok terlebih dahulu sebelum mengexport analisis.",
        icon: "warning",
        confirmButtonText: "Mengerti",
        confirmButtonColor: "#faad14",
      });
      return;
    }

    await exportGroupAnalysis();
  };

  const handleAutoGroup = async (mode) => {
    if (!materialSlug) {
      message.error("Material ID tidak ditemukan");
      return;
    }

    setGroupProcessing(true);
    setGroupMessage("");

    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await api.post(
        `teacher/sessions/material/${materialSlug}/auto-group/`,
        {
          n_clusters: 3,
          mode,
          force_overwrite: false,
        }
      );

      setGroupMessage(response.data.message);

      // Show success with detailed info
      if (response.data.motivation_distribution) {
        const dist = response.data.motivation_distribution;
        const distributionText = `
          Distribusi Motivasi:
          • Tinggi: ${dist.High} siswa
          • Sedang: ${dist.Medium} siswa  
          • Rendah: ${dist.Low} siswa
          ${
            dist.Unanalyzed > 0
              ? `• Belum Dianalisis: ${dist.Unanalyzed} siswa`
              : ""
          }
        `;

        await Swal.fire({
          title: "Kelompok Berhasil Dibuat! 🎉",
          html: `
            <div style="text-align: left;">
              <p><strong>${response.data.message}</strong></p>
              <p style="margin: 8px 0; color: #1677ff;"><strong>${
                response.data.quality_message || ""
              }</strong></p>
              <br/>
              
              <!-- Quality Analysis -->
              ${
                response.data.quality_analysis
                  ? `
                <div style="background: #f0f7ff; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
                  <strong>📊 Analisis Kualitas Kelompok:</strong><br/>
                  • Mode: ${response.data.quality_analysis.formation_mode}<br/>
                  • Keseimbangan: ${
                    response.data.quality_analysis.interpretation?.balance
                  } (${(
                      response.data.quality_analysis.balance_score * 100
                    ).toFixed(1)}%)<br/>
                  • Keberagaman: ${
                    response.data.quality_analysis.interpretation?.heterogeneity
                  } (${(
                      response.data.quality_analysis.heterogeneity_score * 100
                    ).toFixed(1)}%)<br/>
                  • Keseragaman: ${
                    response.data.quality_analysis.interpretation?.uniformity
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
                  <strong>👥 Ringkasan Kelompok (${
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
                  <strong>👥 Detail Kelompok:</strong><br/>
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
          confirmButtonColor: "#11418b",
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
      }

      if (onGroupsChanged) onGroupsChanged();
    } catch (error) {
      console.error("Error creating groups:", error);

      if (error.response?.status === 409) {
        // Kelompok sudah ada, tanyakan apakah ingin menimpa
        const result = await Swal.fire({
          title: "Kelompok Sudah Ada",
          text: "Kelompok untuk materi ini sudah dibuat sebelumnya. Apakah Anda ingin membuat ulang?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Timpa",
          cancelButtonText: "Batal",
        });

        if (result.isConfirmed) {
          await handleForceOverwrite(mode);
        } else {
          setGroupMessage("Pembuatan kelompok dibatalkan.");
        }
      } else if (error.response?.status === 400) {
        // Validation error - show detailed message
        const errorMessage = error.response.data.error;

        await Swal.fire({
          title: "Tidak Dapat Membuat Kelompok",
          html: `
            <div style="text-align: left;">
              <p style="color: #ff4d4f; margin-bottom: 16px;">
                <strong>❌ ${errorMessage}</strong>
              </p>
              <div style="background: #fff7e6; padding: 12px; border-radius: 6px; border-left: 4px solid #faad14;">
                <strong>💡 Saran:</strong><br/>
                1. Upload file CSV profil motivasi ARCS siswa terlebih dahulu<br/>
                2. Pastikan minimal 80% siswa sudah memiliki profil motivasi<br/>
                3. Gunakan fitur "Update Profil Motivasi ARCS Siswa" di tab Siswa
              </div>
            </div>
          `,
          icon: "warning",
          confirmButtonText: "Mengerti",
          confirmButtonColor: "#faad14",
        });

        setGroupMessage(errorMessage);
      } else {
        const errorMessage =
          error.response?.data?.error || "Gagal membentuk kelompok.";
        setGroupMessage(errorMessage);
        message.error(errorMessage);
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
      if (onGroupsChanged) onGroupsChanged();
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
    exportingPdf,
    handleAutoGroup,
    exportGroupAnalysis,
    handleExportAnalysis,
  };
};

export default useSessionGroupFormation;
