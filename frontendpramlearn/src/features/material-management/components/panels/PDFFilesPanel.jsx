import React from "react";

const PDFFilesPanel = ({ files, onFileOpen }) => {
  if (!files?.length) {
    return <div className="text-gray-500">Tidak ada file PDF.</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="cursor-pointer bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center transition-all"
          onClick={() => onFileOpen(file.file)}
        >
          <span className="text-3xl mb-2">📄</span>
          <span className="text-sm font-medium text-center line-clamp-2">
            {file.file_name || file.file?.split("/").pop() || "PDF File"}
          </span>
        </div>
      ))}
    </div>
  );
};

export default PDFFilesPanel;
