import React from "react";
import { Card, Progress, Typography, Tag, Tooltip, Button } from "antd";
import { BookOutlined, UserOutlined, FileTextOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const getProgressColor = (percent) => {
  if (percent >= 80) return "green";
  if (percent >= 60) return "orange";
  return "red";
};

const SubjectCard = ({
  subject,
  onClick,
  onQuickAccessMaterial,
  loading = false,
}) => (
  <Card
    hoverable
    loading={loading}
    style={{
      borderRadius: 12,
      marginBottom: 16,
      boxShadow: "0 2px 8px #f0f1f2",
      transition: "box-shadow 0.2s",
    }}
    onClick={() => onClick(subject)}
    bodyStyle={{ padding: 20 }}
  >
    <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
      <BookOutlined style={{ fontSize: 28, color: "#11418b", marginRight: 16 }} />
      <div>
        <Title level={4} style={{ margin: 0 }}>
          {subject.name}
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          <UserOutlined /> {subject.teacher_name || "-"}
        </Text>
      </div>
      <Tag
        color="blue"
        style={{ marginLeft: "auto", fontWeight: 500, fontSize: 13 }}
      >
        {subject.material_count || 0} Materials
      </Tag>
    </div>
    <div style={{ marginBottom: 12 }}>
      <Progress
        percent={subject.progress || 0}
        strokeColor={getProgressColor(subject.progress || 0)}
        status="active"
        showInfo
        style={{ width: 180 }}
      />
      <span style={{ marginLeft: 16, fontWeight: 500 }}>
        {subject.progress || 0}% Complete
      </span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Tooltip title="Material terakhir diakses">
        <FileTextOutlined style={{ color: "#1677ff", marginRight: 4 }} />
        <span style={{ fontSize: 13 }}>
          {subject.last_material_title || "-"}
        </span>
      </Tooltip>
      <Button
        size="small"
        type="primary"
        style={{ marginLeft: "auto" }}
        onClick={(e) => {
          e.stopPropagation();
          onQuickAccessMaterial(subject.last_material_id);
        }}
        disabled={!subject.last_material_id}
      >
        Quick Access
      </Button>
    </div>
  </Card>
);

export default SubjectCard;