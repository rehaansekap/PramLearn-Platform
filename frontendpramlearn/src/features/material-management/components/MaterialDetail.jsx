import React from "react";
import { Spin, Alert, Collapse } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import useFetchMaterialDetail from "../hooks/useFetchMaterialDetail";
import useEmbedUrls from "../hooks/useEmbedUrls";
import YouTubeVideoPanel from "./panels/YouTubeVideoPanel";
import PDFFilesPanel from "./panels/PDFFilesPanel";
import GoogleFormsPanel from "./panels/GoogleFormsPanel";
import "../style/material.css";

const { Panel } = Collapse;

const MaterialDetail = ({ materialId }) => {
  const { materialDetail, error } = useFetchMaterialDetail(materialId);
  const { getYouTubeEmbedUrl, getGoogleFormEmbedUrl } = useEmbedUrls();

  const handleOpenPdfReader = (pdfUrl) => {
    window.open(pdfUrl, "_blank");
  };

  // Component untuk wrapper konten accordion dengan dashed border
  const AccordionContent = ({ children }) => (
    <div
      style={{
        border: "2px dashed #d9d9d9",
        borderRadius: "8px",
        padding: "24px",
        margin: "16px 0",
        backgroundColor: "#fafafa",
        minHeight: "200px",
      }}
    >
      {children}
    </div>
  );

  const antIcon = <LoadingOutlined style={{ fontSize: 36 }} spin />;

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-8 bg-white rounded-xl shadow-lg">
        <Alert
          type="error"
          showIcon
          message="Error"
          description={`Error fetching material detail: ${error.message}`}
        />
      </div>
    );
  }

  if (!materialDetail) {
    return (
      <div className="max-w-7xl mx-auto p-8 bg-white rounded-xl shadow-lg flex flex-col items-center justify-center min-h-[300px]">
        <Spin indicator={antIcon} />
        <p className="mt-4" style={{ marginTop: 16, color: "#666" }}>
          Loading material data...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white rounded-xl shadow-lg relative">
      <Collapse
        accordion={false}
        bordered={false}
        expandIconPosition="end"
        className="mb-4"
      >
        <Panel
          header={
            <span
              style={{
                textAlign: "left",
                display: "flex",
                alignItems: "center",
              }}
            >
              📺 YouTube Videos
            </span>
          }
          key="youtube"
        >
          <AccordionContent>
            <YouTubeVideoPanel
              videos={materialDetail.youtube_videos}
              getYouTubeEmbedUrl={getYouTubeEmbedUrl}
            />
          </AccordionContent>
        </Panel>

        <Panel
          header={
            <span
              style={{
                textAlign: "left",
                display: "flex",
                alignItems: "center",
              }}
            >
              📄 PDF Files
            </span>
          }
          key="pdf"
        >
          <AccordionContent>
            <PDFFilesPanel
              files={materialDetail.pdf_files}
              onFileOpen={handleOpenPdfReader}
            />
          </AccordionContent>
        </Panel>

        <Panel
          header={
            <span
              style={{
                textAlign: "left",
                display: "flex",
                alignItems: "center",
              }}
            >
              📝 Google Form ARCS
            </span>
          }
          key="arcs"
        >
          {/* <AccordionContent>
            <GoogleFormsPanel
              arcsAwal={materialDetail.google_form_embed_arcs_awal}
              arcsAkhir={materialDetail.google_form_embed_arcs_akhir}
              getGoogleFormEmbedUrl={getGoogleFormEmbedUrl}
            />
          </AccordionContent> */}
        </Panel>
      </Collapse>
    </div>
  );
};

export default MaterialDetail;
