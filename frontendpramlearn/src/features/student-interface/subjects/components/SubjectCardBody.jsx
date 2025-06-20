import React from "react";
import { Typography, Button, Space } from "antd";
import MaterialStats from "./MaterialStats";
import LastMaterialSection from "./LastMaterialSection";
import ScheduleSection from "./ScheduleSection";

const { Text } = Typography;

const SubjectCardBody = ({ subject, onClick, onQuickAccessMaterial }) => {
  return (
    <div style={{ padding: "20px 24px 24px" }}>
      {/* Statistik Materi */}
      <MaterialStats subject={subject} />

      {/* Materi Terakhir */}
      {subject.last_material_title && (
        <LastMaterialSection
          subject={subject}
          onQuickAccessMaterial={onQuickAccessMaterial}

        />
      )}

      {/* Jadwal */}
      {subject.schedules && subject.schedules.length > 0 && (
        <ScheduleSection schedules={subject.schedules} />
      )}

      {/* Tombol Aksi */}
      <Button
        type="primary"
        block
        style={{
          borderRadius: 8,
          height: 36,
          fontWeight: 600,
          background:
            "linear-gradient(135deg, #001529 0%, #3a3f5c 60%, #43cea2 100%)",
          border: "none",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(subject);
        }}
      >
        Lihat Detail
      </Button>
    </div>
  );
};

export default SubjectCardBody;
