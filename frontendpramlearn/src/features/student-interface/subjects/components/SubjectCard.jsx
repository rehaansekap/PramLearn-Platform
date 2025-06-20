import React from "react";
import { Card } from "antd";
import SubjectCardHeader from "./SubjectCardHeader";
import SubjectCardBody from "./SubjectCardBody";

const SubjectCard = ({ subject, onClick, onQuickAccessMaterial }) => {
  return (
    <Card
      hoverable
      style={{
        borderRadius: 16,
        overflow: "hidden",
        height: "100%",
        border: "1px solid #f0f0f0",
        transition: "all 0.3s ease",
        cursor: "pointer",
      }}
      styles={{
        body: { padding: 0 },
      }}
      onClick={() => onClick(subject)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(17, 65, 139, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
      }}
    >
      <SubjectCardHeader subject={subject} />
      <SubjectCardBody
        subject={subject}
        onClick={onClick}
        onQuickAccessMaterial={onQuickAccessMaterial}
      />
    </Card>
  );
};

export default SubjectCard;
