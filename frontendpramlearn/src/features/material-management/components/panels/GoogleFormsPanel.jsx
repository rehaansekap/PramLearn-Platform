import React from "react";

const GoogleFormSection = ({ title, url, getEmbedUrl }) => {
  const embedUrl = getEmbedUrl(url);
  if (!embedUrl || embedUrl === "FORMS_GLE") {
    return (
      <div className="flex-1">
        <div className="font-semibold mb-2">{title}</div>
        <div className="text-red-500">
          Link Google Form tidak valid atau menggunakan shortlink forms.gle!
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1">
      <div className="font-semibold mb-2">{title}</div>
      <iframe
        src={embedUrl}
        width="100%"
        height="500"
        frameBorder="0"
        marginHeight="0"
        marginWidth="0"
        title={title}
        style={{ background: "#fff", borderRadius: 8 }}
      >
        Loading…
      </iframe>
    </div>
  );
};

const GoogleFormsPanel = ({ arcsAwal, arcsAkhir, getGoogleFormEmbedUrl }) => {
  if (!arcsAwal && !arcsAkhir) {
    return <div className="text-gray-500">Tidak ada Google Form.</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {arcsAwal && (
        <GoogleFormSection
          title="Google Form ARCS Awal"
          url={arcsAwal}
          getEmbedUrl={getGoogleFormEmbedUrl}
        />
      )}
      {arcsAkhir && (
        <GoogleFormSection
          title="Google Form ARCS Akhir"
          url={arcsAkhir}
          getEmbedUrl={getGoogleFormEmbedUrl}
        />
      )}
    </div>
  );
};

export default GoogleFormsPanel;
