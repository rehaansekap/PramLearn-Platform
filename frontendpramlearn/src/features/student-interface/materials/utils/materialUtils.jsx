export const getProgressColor = (percent) => {
  if (percent >= 80) return "#52c41a";
  if (percent >= 60) return "#faad14";
  return "#ff4d4f";
};

export const formatTimeSpent = (timeInSeconds) => {
  return Math.floor((timeInSeconds || 0) / 60);
};

export const hasContentType = (material, type) => {
  switch (type) {
    case "pdf":
      return material.pdf_files?.length > 0;
    case "video":
      return material.youtube_videos?.some((v) => v.url);
    // case "forms":
    //   return (
    //     material.google_form_embed_arcs_awal ||
    //     material.google_form_embed_arcs_akhir
    //   );
    default:
      return false;
  }
};

export const getContentCount = (material, type) => {
  switch (type) {
    case "pdf":
      return material.pdf_files?.length || 0;
    case "video":
      return material.youtube_videos?.filter((v) => v.url).length || 0;
    case "quiz":
      return material.quizzes?.length || 0;
    case "assignment":
      return material.assignments?.length || 0;
    default:
      return 0;
  }
};
