import React from "react";

const YouTubeVideoPanel = ({ videos, getYouTubeEmbedUrl }) => {
  if (!videos?.length) {
    return <div className="text-gray-500">Tidak ada video YouTube.</div>;
  }

  return (
    <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
      {videos.map((video, idx) => (
        <div key={idx} className="aspect-video">
          <iframe
            src={getYouTubeEmbedUrl(video.url)}
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            title={`YouTube Video ${idx + 1}`}
            className="rounded-lg shadow"
          />
        </div>
      ))}
    </div>
  );
};

export default YouTubeVideoPanel;
