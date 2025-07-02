import { useState, useContext } from "react";
import { message } from "antd";
import api from "../../../../api";
import { AuthContext } from "../../../../context/AuthContext";

const useSessionsARCSAnalysisExport = () => {
  const { token } = useContext(AuthContext);
  const [exportingPdf, setExportingPdf] = useState(false);

  const exportARCSAnalysis = async () => {
    console.log("🚀 Function exportARCSAnalysis called");
    setExportingPdf(true);

    try {
      if (!token) {
        throw new Error("Token tidak valid");
      }

      console.log("🔐 Starting ARCS Analysis export...");
      console.log("🌐 API Base URL:", api.defaults.baseURL);

      // Show loading message
      message.loading(
        "Sedang menghasilkan laporan analisis clustering ARCS...",
        0
      );

      console.log("📡 Making API request...");

      const response = await api.get("teacher/sessions/arcs-analysis/export/", {
        // Hapus params: { format: "pdf" },
        responseType: "blob",
        timeout: 60000,
        // headers: {
        //   Accept: "application/pdf",
        // },
      });

      console.log("✅ API Response received:", {
        status: response.status,
        statusText: response.statusText,
        dataSize: response.data ? response.data.size : 0,
      });

      // Hide loading message
      message.destroy();

      // Verify response data
      if (!response.data || response.data.size === 0) {
        throw new Error("File PDF kosong");
      }

      // Extract filename from response headers
      const contentDisposition =
        response.headers.get("Content-Disposition") ||
        response.headers["content-disposition"];
      let filename = `analisis_clustering_arcs_${
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

      console.log("💾 Final filename:", filename);

      // Create download link
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;

      // Trigger download
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);

      // Show success message
      message.success(
        "📄 Laporan analisis clustering ARCS berhasil didownload!"
      );
      console.log("🎉 Export completed successfully!");
    } catch (error) {
      console.error("❌ Error exporting ARCS analysis:", error);

      // Hide loading message
      message.destroy();

      let errorMessage = "Gagal mengexport analisis clustering. ";

      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        errorMessage += "Request timeout. Silakan coba lagi.";
      } else if (error.response?.status === 404) {
        errorMessage += "Endpoint tidak ditemukan.";
      } else if (error.response?.status === 403) {
        errorMessage +=
          "Anda tidak memiliki akses untuk mengexport analisis ini.";
      } else if (error.response?.status === 500) {
        errorMessage += "Terjadi kesalahan server. Silakan coba lagi.";
      } else {
        errorMessage += error.message;
      }

      message.error(errorMessage);
    } finally {
      console.log("🏁 Finally block executed, setting exportingPdf to false");
      setExportingPdf(false);
    }
  };

  return {
    exportingPdf,
    exportARCSAnalysis,
  };
};

export default useSessionsARCSAnalysisExport;
