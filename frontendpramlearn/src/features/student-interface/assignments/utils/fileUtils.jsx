// Konfigurasi tipe file yang diizinkan
export const FILE_TYPES = {
  DOCUMENTS: ["pdf", "doc", "docx", "txt"],
  SPREADSHEETS: ["xls", "xlsx"],
  IMAGES: ["jpg", "jpeg", "png", "gif", "bmp", "webp"],
  ALL: [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "jpg",
    "jpeg",
    "png",
    "txt",
    "gif",
    "bmp",
    "webp",
  ],
};

// Konfigurasi ukuran file
export const FILE_SIZE = {
  SMALL: 5, // 5MB
  MEDIUM: 10, // 10MB
  LARGE: 20, // 20MB
};

// Get MIME type dari ekstensi
export const getMimeType = (extension) => {
  const mimeTypes = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    txt: "text/plain",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    bmp: "image/bmp",
    webp: "image/webp",
  };

  return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
};

// Validasi apakah file adalah gambar
export const isImageFile = (fileName) => {
  const extension = fileName.split(".").pop().toLowerCase();
  return FILE_TYPES.IMAGES.includes(extension);
};

// Validasi apakah file adalah dokumen
export const isDocumentFile = (fileName) => {
  const extension = fileName.split(".").pop().toLowerCase();
  return FILE_TYPES.DOCUMENTS.includes(extension);
};

// Get kategori file
export const getFileCategory = (fileName) => {
  const extension = fileName.split(".").pop().toLowerCase();

  if (FILE_TYPES.IMAGES.includes(extension)) return "image";
  if (FILE_TYPES.DOCUMENTS.includes(extension)) return "document";
  if (FILE_TYPES.SPREADSHEETS.includes(extension)) return "spreadsheet";

  return "other";
};
