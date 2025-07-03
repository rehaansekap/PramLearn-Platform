import React from "react";
import {
  Card,
  Table,
  Avatar,
  Tag,
  Typography,
  Button,
  Tooltip,
  Empty,
} from "antd";
import {
  UserOutlined,
  EyeOutlined,
  TeamOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const GroupsTable = ({
  groups = [],
  onShowMembers,
  loading = false,
  isMobile = false,
}) => {
  const columns = [
    {
      title: "#",
      key: "index",
      render: (_, __, index) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {index + 1}
          </div>
        </div>
      ),
      width: 50,
      align: "center",
    },
    {
      title: "Kelompok",
      key: "group",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "50%",
              width: isMobile ? 40 : 48,
              height: isMobile ? 40 : 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.2)",
            }}
          >
            <TeamOutlined
              style={{
                color: "white",
                fontSize: isMobile ? 16 : 20,
              }}
            />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <Text
              strong
              style={{
                display: "block",
                fontSize: isMobile ? 14 : 16,
                color: "#262626",
                marginBottom: 2,
              }}
            >
              {record.name}
            </Text>
            <Text
              type="secondary"
              style={{
                fontSize: isMobile ? 11 : 12,
                display: "block",
              }}
            >
              Kode: {record.code}
            </Text>
          </div>
        </div>
      ),
      width: isMobile ? 160 : 200,
    },
    {
      title: "Anggota",
      key: "members",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar.Group
            maxCount={isMobile ? 2 : 3}
            size={isMobile ? "small" : "default"}
            style={{ marginRight: 8 }}
          >
            {record.members?.slice(0, isMobile ? 2 : 3).map((member, index) => (
              <Tooltip key={index} title={member.username}>
                <Avatar
                  size={isMobile ? "small" : "default"}
                  icon={<UserOutlined />}
                  style={{
                    background:
                      "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                    border: "2px solid white",
                  }}
                />
              </Tooltip>
            ))}
          </Avatar.Group>
          <Tag
            color="blue"
            style={{
              cursor: "pointer",
              fontWeight: 600,
              borderRadius: 12,
              padding: "4px 12px",
              fontSize: isMobile ? 11 : 12,
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
              border: "none",
              color: "white",
            }}
            onClick={() => onShowMembers(record)}
          >
            👥 {record.member_count || 0} Anggota
          </Tag>
        </div>
      ),
      width: isMobile ? 120 : 160,
    },
    {
      title: "Aktivitas",
      key: "activity",
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Tag
            color={record.quiz_count > 0 ? "green" : "default"}
            style={{
              fontSize: 13,
              padding: "2px 8px",
              borderRadius: 10,
              fontWeight: 600,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            📝 {record.quiz_count || 0} Quiz
          </Tag>
          {record.quiz_count > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <TrophyOutlined style={{ color: "#faad14", fontSize: 12 }} />
              <Text style={{ fontSize: 12, color: "#666" }}>Aktif</Text>
            </div>
          )}
        </div>
      ),
      width: 100,
      align: "center",
      responsive: ["md"],
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size={isMobile ? "small" : "middle"}
          onClick={() => onShowMembers(record)}
          style={{
            borderRadius: 8,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            fontWeight: 600,
            boxShadow: "0 2px 8px rgba(102, 126, 234, 0.2)",
          }}
        >
          {!isMobile && "Detail"}
        </Button>
      ),
      width: isMobile ? 70 : 100,
      align: "center",
    },
  ];

  if (!groups || groups.length === 0) {
    return (
      <Card
        style={{
          borderRadius: 16,
          border: "2px dashed #d9d9d9",
          background: "#fafafa",
          textAlign: "center",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            background: "rgba(102, 126, 234, 0.1)",
            width: isMobile ? 60 : 80,
            height: isMobile ? 60 : 80,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            marginBottom: 16,
          }}
        >
          <TeamOutlined
            style={{
              fontSize: isMobile ? 24 : 32,
              color: "#667eea",
            }}
          />
        </div>
        <Empty
          description={
            <Text style={{ color: "#666", fontSize: isMobile ? 14 : 16 }}>
              Belum ada kelompok dibuat
            </Text>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Card
      style={{
        borderRadius: 16,
        border: "none",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Header Info */}
      <div
        style={{
          padding: isMobile ? "16px 20px" : "24px 28px",
          background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
          borderBottom: "1px solid #f0f0f0",
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TeamOutlined style={{ color: "white", fontSize: 14 }} />
          </div>
          <div>
            <Text
              style={{
                fontSize: isMobile ? 14 : 16,
                fontWeight: 600,
                color: "#262626",
              }}
            >
              Daftar Kelompok ({groups.length})
            </Text>
            <Text
              style={{
                fontSize: isMobile ? 11 : 12,
                color: "#666",
                display: "block",
              }}
            >
              Kelompok yang terbentuk dalam materi ini
            </Text>
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={groups.map((group) => ({
          ...group,
          key: group.id,
        }))}
        loading={loading}
        pagination={{
          pageSize: isMobile ? 5 : 8,
          showSizeChanger: !isMobile,
          showQuickJumper: !isMobile,
          showTotal: (total, range) =>
            `Menampilkan ${range[0]}-${range[1]} dari ${total} kelompok`,
          style: {
            padding: "16px 24px",
            background: "#fafafa",
            borderTop: "1px solid #f0f0f0",
          },
        }}
        scroll={{ x: isMobile ? 600 : undefined }}
        size={isMobile ? "small" : "middle"}
        style={{
          background: "white",
        }}
        locale={{
          emptyText: (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <TeamOutlined
                style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
              />
              <Text type="secondary" style={{ fontSize: 16 }}>
                Belum ada kelompok yang dibentuk
              </Text>
            </div>
          ),
        }}
      />
    </Card>
  );
};

export default GroupsTable;
