const useEmbedUrls = () => {
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1]?.split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("youtube.com/embed/")) {
      videoId = url.split("embed/")[1]?.split("?")[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const getGoogleFormEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("embedded=true")) return url;
    const match = url.match(
      /https:\/\/docs\.google\.com\/forms\/d\/e\/([^/]+)/
    );
    if (match) {
      return `https://docs.google.com/forms/d/e/${match[1]}/viewform?embedded=true`;
    }
    if (url.includes("forms.gle")) return "FORMS_GLE";
    return null;
  };

  return {
    getYouTubeEmbedUrl,
    getGoogleFormEmbedUrl,
  };
};

export default useEmbedUrls;
