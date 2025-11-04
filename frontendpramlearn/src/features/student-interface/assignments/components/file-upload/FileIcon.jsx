import React from "react";
import {
  FileOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const FileIcon = ({ fileName, size = 24 }) => {
  const extension = fileName.split(".").pop().toLowerCase();

  const iconStyle = { fontSize: size };

  switch (extension) {
    case "pdf":
      return <FilePdfOutlined style={{ ...iconStyle, color: "#ff4d4f" }} />;
    case "doc":
    case "docx":
      return <FileWordOutlined style={{ ...iconStyle, color: "#1890ff" }} />;
    case "xls":
    case "xlsx":
      return <FileExcelOutlined style={{ ...iconStyle, color: "#52c41a" }} />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
    case "webp":
      return <FileImageOutlined style={{ ...iconStyle, color: "#722ed1" }} />;
    case "txt":
      return <FileTextOutlined style={{ ...iconStyle, color: "#faad14" }} />;
    default:
      return <FileOutlined style={{ ...iconStyle, color: "#666" }} />;
  }
};

export default FileIcon;
