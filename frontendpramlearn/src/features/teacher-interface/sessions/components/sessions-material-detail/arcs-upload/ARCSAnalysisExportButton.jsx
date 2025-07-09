import React from "react";
import { Button, Tooltip } from "antd";
import { DownloadOutlined, LoadingOutlined } from "@ant-design/icons";
import useSessionsARCSAnalysisExport from "../../../hooks/useSessionsARCSAnalysisExport";

const ARCSAnalysisExportButton = ({ isMobile = false }) => {
  const { exportingPdf, exportARCSAnalysis } = useSessionsARCSAnalysisExport();

  return (
    <Tooltip title="Download laporan analisis clustering ARCS dalam format PDF">
      <Button
        type="primary"
        icon={exportingPdf ? <LoadingOutlined /> : <DownloadOutlined />}
        onClick={exportARCSAnalysis}
        loading={exportingPdf}
        disabled={exportingPdf}
        style={{
          borderRadius: 8,
          height: isMobile ? 36 : 40,
          fontSize: isMobile ? "13px" : "14px",
          fontWeight: 600,
          background: "linear-gradient(135deg, #11418b 0%, #1677ff 100%)",
          border: "none",
          boxShadow: "0 2px 8px rgba(17, 65, 139, 0.3)",
        }}
      >
        {exportingPdf ? "Memproses..." : "Export Analisis PDF"}
      </Button>
    </Tooltip>
  );
};

export default ARCSAnalysisExportButton;
