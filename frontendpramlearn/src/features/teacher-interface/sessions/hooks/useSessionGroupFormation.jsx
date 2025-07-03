import { useState, useContext, useCallback } from "react";
import { message } from "antd";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";
import Swal from "sweetalert2";

const useSessionGroupFormation = (materialSlug, onGroupsChanged) => {
  const { token } = useContext(AuthContext);
  const [groupMessage, setGroupMessage] = useState("");
  const [groupProcessing, setGroupProcessing] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  // States for adaptive algorithm
  const [analyzingClass, setAnalyzingClass] = useState(false);
  const [classAnalysis, setClassAnalysis] = useState(null);
  const [recommendedMode, setRecommendedMode] = useState(null);

  // Analyze class characteristics
  const analyzeClassCharacteristics = useCallback(async () => {
    if (!materialSlug) {
      message.error("Material tidak ditemukan");
      return null;
    }

    setAnalyzingClass(true);

    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await api.get(
        `teacher/sessions/material/${materialSlug}/class-analysis/`
      );

      setClassAnalysis(response.data.class_analysis);
      setRecommendedMode(response.data.recommended_mode);

      return response.data;
    } catch (error) {
      console.error("Error analyzing class:", error);
      const errorMessage =
        error.response?.data?.error || "Gagal menganalisis karakteristik kelas";
      message.error(errorMessage);
      return null;
    } finally {
      setAnalyzingClass(false);
    }
  }, [materialSlug, token]);

  // Helper function to get priority mode info
  const getPriorityModeInfo = (priorityMode) => {
    const modes = {
      balanced: {
        label: "Seimbang",
        description:
          "Untuk kondisi kelas normal dengan distribusi motivasi yang beragam",
        icon: "📊",
        color: "#1677ff",
        weights: "40% Ukuran, 40% Distribusi, 20% Keberagaman",
      },
      size_first: {
        label: "Ukuran Prioritas",
        description: "Untuk kelas dengan jumlah siswa yang tidak ideal",
        icon: "👥",
        color: "#52c41a",
        weights: "60% Ukuran, 25% Distribusi, 15% Keberagaman",
      },
      uniformity_first: {
        label: "Distribusi Prioritas",
        description: "Untuk kelas dengan data motivasi yang sangat beragam",
        icon: "🔄",
        color: "#faad14",
        weights: "25% Ukuran, 60% Distribusi, 15% Keberagaman",
      },
      heterogeneity_first: {
        label: "Keberagaman Prioritas",
        description: "Untuk pembelajaran kolaboratif yang maksimal",
        icon: "🚀",
        color: "#722ed1",
        weights: "25% Ukuran, 25% Distribusi, 50% Keberagaman",
      },
    };

    return modes[priorityMode] || modes.balanced;
  };

  // Export group analysis as PDF
  const exportGroupAnalysis = useCallback(async () => {
    if (!materialSlug) {
      message.error("Material tidak ditemukan");
      return;
    }

    setExportingPdf(true);

    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await api.get(
        `teacher/sessions/material/${materialSlug}/auto-group/`,
        {
          params: { export: "pdf" },
          responseType: "blob",
        }
      );

      if (
        response.data.type &&
        !response.data.type.includes("application/pdf")
      ) {
        throw new Error("Response is not a PDF file");
      }

      const contentDisposition = response.headers["content-disposition"];
      let filename = `analisis_kelompok_${materialSlug}_${
        new Date().toISOString().split("T")[0]
      }.pdf`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=["']?([^"';]+)["']?/
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const blob = response.data;

      if (blob.size === 0) {
        throw new Error("PDF file is empty");
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;

      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);

      message.success("📄 Laporan analisis kelompok berhasil didownload!");
    } catch (error) {
      console.error("Error exporting PDF:", error);

      let errorMessage = "Gagal mengexport PDF. ";

      if (error.response?.status === 404) {
        errorMessage += "Kelompok belum dibuat atau tidak ditemukan.";
      } else if (error.response?.status === 403) {
        errorMessage +=
          "Anda tidak memiliki akses untuk mengexport analisis ini.";
      } else if (error.response?.status === 500) {
        errorMessage += "Terjadi kesalahan server. Silakan coba lagi.";
      } else if (error.message.includes("empty")) {
        errorMessage += "File PDF kosong. Silakan coba lagi.";
      } else if (error.message.includes("not a PDF")) {
        errorMessage += "Response bukan file PDF. Silakan coba lagi.";
      } else {
        errorMessage += error.response?.data?.error || error.message;
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
  }, [materialSlug, token]);

  // Check if groups exist for export
  const checkGroupsExist = useCallback(async () => {
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
  }, [materialSlug, token]);

  // Handle export with validation
  const handleExportAnalysis = useCallback(async () => {
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
  }, [checkGroupsExist, exportGroupAnalysis]);

  // Handle force overwrite with adaptive support
  const handleForceOverwrite = useCallback(
    async (mode, priorityMode = "balanced", useAdaptive = false) => {
      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const response = await api.post(
          `teacher/sessions/material/${materialSlug}/auto-group/`,
          {
            n_clusters: 3,
            mode,
            priority_mode: priorityMode,
            use_adaptive: useAdaptive,
            force_overwrite: true,
          }
        );

        setGroupMessage(response.data.message);
        message.success("Kelompok berhasil dibuat ulang!");

        // Handle adaptive response
        const adaptiveInfo = response.data.adaptive_info;
        let adaptiveMessage = "";

        if (adaptiveInfo?.used_adaptive) {
          const recommended = adaptiveInfo.recommended_mode;
          adaptiveMessage = `
          <div style="background: #e6f7ff; padding: 12px; border-radius: 6px; margin-bottom: 12px; border-left: 4px solid #1677ff;">
            <strong>🤖 Analisis Otomatis Digunakan:</strong><br/>
            <div style="margin: 8px 0;">
              Mode yang dipilih: <strong>${
                getPriorityModeInfo(priorityMode).label
              }</strong><br/>
              Mode yang direkomendasikan: <strong>${
                getPriorityModeInfo(recommended.mode).label
              }</strong><br/>
              Tingkat kepercayaan: <strong>${(
                recommended.confidence * 100
              ).toFixed(1)}%</strong>
            </div>
            <div style="font-size: 12px; color: #666; margin-top: 8px;">
              <strong>Alasan:</strong> ${recommended.reason}
            </div>
          </div>
        `;
        }

        // Show detailed success alert with priority mode info
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
          const priorityInfo = getPriorityModeInfo(priorityMode);

          await Swal.fire({
            title: "Kelompok Berhasil Ditimpa! 🔄",
            html: `
          <div style="text-align: left; max-height: 60vh; overflow-y: auto; padding-right: 10px;">
            <p><strong>${response.data.message}</strong></p>
            <p style="margin: 8px 0; color: #52c41a;"><strong>✅ Kelompok lama telah diganti dengan yang baru</strong></p>
            <p style="margin: 8px 0; color: #1677ff;"><strong>${
              response.data.quality_message || ""
            }</strong></p>
            
            ${adaptiveMessage}
            ${warningText}
            
            <!-- Priority Mode Info -->
            <div style="background: #f0f7ff; padding: 12px; border-radius: 6px; margin-bottom: 12px; border-left: 4px solid #1677ff;">
              <strong>🎯 Mode Prioritas yang Digunakan:</strong><br/>
              <div style="display: flex; align-items: center; gap: 8px; margin: 4px 0;">
                <span style="color: ${priorityInfo.color};">${
              priorityInfo.icon
            }</span>
                <strong>${priorityInfo.label}</strong>
              </div>
              <small style="color: #666;">
                ${priorityInfo.description}<br/>
                Bobot: ${priorityInfo.weights}
              </small>
            </div>
              
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
                        (group) => `
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
                        (group) => `
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
            width: 600,
            heightAuto: false,
            customClass: {
              popup: "swal-scrollable-modal",
              htmlContainer: "swal-scrollable-content",
            },
            didOpen: () => {
              // Add custom CSS for scrolling
              const style = document.createElement("style");
              style.textContent = `
              .swal-scrollable-modal {
                max-height: 90vh !important;
                overflow: hidden !important;
              }
              .swal-scrollable-content {
                max-height: 60vh !important;
                overflow-y: auto !important;
                padding-right: 10px !important;
              }
              .swal-scrollable-content::-webkit-scrollbar {
                width: 6px;
              }
              .swal-scrollable-content::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 10px;
              }
              .swal-scrollable-content::-webkit-scrollbar-thumb {
                background: #c1c1c1;
                border-radius: 10px;
              }
              .swal-scrollable-content::-webkit-scrollbar-thumb:hover {
                background: #a8a8a8;
              }
            `;
              document.head.appendChild(style);

              // Make export function available to the button in SweetAlert
              window.exportGroupAnalysisFromSwal = () => {
                Swal.close();
                exportGroupAnalysis();
              };
            },
            willClose: () => {
              // Clean up the global function
              delete window.exportGroupAnalysisFromSwal;

              // Remove custom CSS
              const customStyle = document.querySelector(
                "style[data-swal-scrollable]"
              );
              if (customStyle) {
                customStyle.remove();
              }
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
    },
    [materialSlug, token, onGroupsChanged, exportGroupAnalysis]
  );

  // Handle auto group with adaptive support
  const handleAutoGroup = useCallback(
    async (mode, priorityMode = "balanced", useAdaptive = false) => {
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
            priority_mode: priorityMode,
            use_adaptive: useAdaptive,
            force_overwrite: false,
          }
        );

        setGroupMessage(response.data.message);

        // Handle adaptive response
        const adaptiveInfo = response.data.adaptive_info;
        let adaptiveMessage = "";

        if (adaptiveInfo?.used_adaptive) {
          const recommended = adaptiveInfo.recommended_mode;
          adaptiveMessage = `
          <div style="background: #e6f7ff; padding: 12px; border-radius: 6px; margin-bottom: 12px; border-left: 4px solid #1677ff;">
            <strong>🤖 Analisis Otomatis Digunakan:</strong><br/>
            <div style="margin: 8px 0;">
              Mode yang dipilih: <strong>${
                getPriorityModeInfo(priorityMode).label
              }</strong><br/>
              Mode yang direkomendasikan: <strong>${
                getPriorityModeInfo(recommended.mode).label
              }</strong><br/>
              Tingkat kepercayaan: <strong>${(
                recommended.confidence * 100
              ).toFixed(1)}%</strong>
            </div>
            <div style="font-size: 12px; color: #666; margin-top: 8px;">
              <strong>Alasan:</strong> ${recommended.reason}
            </div>
          </div>
        `;
        }

        let warningText = "";
        if (response.data.warning) {
          warningText = `
          <div style="background: #fff7e6; padding: 12px; border-radius: 6px; margin-bottom: 12px; border-left: 4px solid #faad14;">
            <strong>⚠️ Peringatan:</strong><br/>
            ${response.data.warning}
          </div>
        `;
        }

        // Show success with detailed info including adaptive info
        if (response.data.motivation_distribution) {
          const priorityInfo = getPriorityModeInfo(priorityMode);

          await Swal.fire({
            title: "Kelompok Berhasil Dibuat! 🎉",
            html: `
            <div style="text-align: left; max-height: 60vh; overflow-y: auto; padding-right: 10px;">
              <p><strong>${response.data.message}</strong></p>
              <p style="margin: 8px 0; color: #1677ff;"><strong>${
                response.data.quality_message || ""
              }</strong></p>
              
              ${adaptiveMessage}
              ${warningText}
              
              <!-- Priority Mode Info -->
              <div style="background: #f0f7ff; padding: 12px; border-radius: 6px; margin-bottom: 12px; border-left: 4px solid #1677ff;">
                <strong>🎯 Mode Prioritas yang Digunakan:</strong><br/>
                <div style="display: flex; align-items: center; gap: 8px; margin: 4px 0;">
                  <span style="color: ${priorityInfo.color};">${
              priorityInfo.icon
            }</span>
                  <strong>${priorityInfo.label}</strong>
                </div>
                <small style="color: #666;">
                  ${priorityInfo.description}<br/>
                  Bobot: ${priorityInfo.weights}
                </small>
              </div>
              
              <!-- Quality Analysis -->
             ${
               response.data.quality_analysis
                 ? `
              <div style="background: #f0f7ff; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
                <strong>📊 Analisis Kualitas Kelompok:</strong><br/>
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
                <strong>👥 Ringkasan Kelompok (${
                  response.data.groups.length
                } kelompok):</strong><br/>
                <div style="max-height: 150px; overflow-y: auto; margin-top: 8px;">
                  ${response.data.groups
                    .map(
                      (group) => `
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
                      (group) => `
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
            width: 600,
            heightAuto: false,
            customClass: {
              popup: "swal-scrollable-modal",
              htmlContainer: "swal-scrollable-content",
            },
            didOpen: () => {
              // Add custom CSS for scrolling
              const style = document.createElement("style");
              style.textContent = `
            .swal-scrollable-modal {
              max-height: 90vh !important;
              overflow: hidden !important;
            }
            .swal-scrollable-content {
              max-height: 60vh !important;
              overflow-y: auto !important;
              padding-right: 10px !important;
            }
            .swal-scrollable-content::-webkit-scrollbar {
              width: 6px;
            }
            .swal-scrollable-content::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 10px;
            }
            .swal-scrollable-content::-webkit-scrollbar-thumb {
              background: #c1c1c1;
              border-radius: 10px;
            }
            .swal-scrollable-content::-webkit-scrollbar-thumb:hover {
              background: #a8a8a8;
            }
          `;
              document.head.appendChild(style);

              // Make export function available to the button in SweetAlert
              window.exportGroupAnalysisFromSwal = () => {
                Swal.close();
                exportGroupAnalysis();
              };
            },
            willClose: () => {
              // Clean up the global function
              delete window.exportGroupAnalysisFromSwal;

              // Remove custom CSS
              const customStyle = document.querySelector(
                "style[data-swal-scrollable]"
              );
              if (customStyle) {
                customStyle.remove();
              }
            },
          });
        }

        if (onGroupsChanged) {
          await onGroupsChanged();
        }
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
            await handleForceOverwrite(mode, priorityMode, useAdaptive);
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
    },
    [
      materialSlug,
      token,
      onGroupsChanged,
      handleForceOverwrite,
      exportGroupAnalysis,
    ]
  );

  // Return all values and functions
  return {
    groupMessage,
    groupProcessing,
    exportingPdf,
    analyzingClass, // ADD: Missing state
    classAnalysis, // ADD: Missing state
    recommendedMode, // ADD: Missing state
    handleAutoGroup,
    exportGroupAnalysis,
    handleExportAnalysis,
    analyzeClassCharacteristics, // ADD: Missing function
  };
};

export default useSessionGroupFormation;
