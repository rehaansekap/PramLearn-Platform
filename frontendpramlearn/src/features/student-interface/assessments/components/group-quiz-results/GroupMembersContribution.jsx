import React from "react";
import {
  Card,
  Table,
  Avatar,
  Tag,
  Progress,
  Typography,
  Space,
  Grid,
} from "antd";
import { TeamOutlined, UserOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const GroupMembersContribution = ({ results }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const getContributionColor = (percentage) => {
    if (percentage === 0)
      return { color: "#ff4d4f", label: "Tidak Aktif", bgColor: "#fff2f0" };
    if (percentage < 25)
      return { color: "#ff7a45", label: "Kurang Aktif", bgColor: "#fff2e8" };
    if (percentage < 50)
      return { color: "#faad14", label: "Cukup Aktif", bgColor: "#fffbe6" };
    if (percentage < 75)
      return { color: "#1890ff", label: "Aktif", bgColor: "#e6f7ff" };
    return { color: "#52c41a", label: "Sangat Aktif", bgColor: "#f6ffed" };
  };

  const columns = [
    {
      title: "No",
      key: "index",
      render: (_, __, index) => (
        <div
          style={{
            textAlign: "center",
            fontWeight: 600,
            color: "#8c8c8c",
            fontSize: isMobile ? 12 : 14,
          }}
        >
          {index + 1}
        </div>
      ),
      width: isMobile ? 40 : 50,
      align: "center",
    },
    {
      title: "Nama Anggota",
      key: "name",
      render: (_, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 8 : 12,
            padding: isMobile ? "4px 0" : "8px 0",
          }}
        >
          <Avatar
            icon={<UserOutlined />}
            size={isMobile ? 32 : 40}
            style={{
              backgroundColor: "#1890ff",
              flexShrink: 0,
              fontSize: isMobile ? 14 : 16,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: isMobile ? 13 : 15,
                lineHeight: 1.3,
                color: "#262626",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                marginBottom: record.is_current_user ? 2 : 0,
              }}
            >
              {record.full_name || record.username}
            </div>
            {record.is_current_user && (
              <Tag
                color="blue"
                size="small"
                style={{
                  fontSize: 10,
                  lineHeight: "16px",
                  padding: "0 6px",
                  height: 16,
                  borderRadius: 8,
                  margin: 0,
                }}
              >
                Anda
              </Tag>
            )}
          </div>
        </div>
      ),
      width: isMobile ? 160 : 200,
    },
    {
      title: (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 600 }}>Soal</div>
          <div style={{ fontWeight: 600 }}>Dijawab</div>
        </div>
      ),
      key: "answered_count",
      render: (_, record) => {
        const answeredCount =
          record.answered_count !== undefined
            ? record.answered_count
            : results?.answers?.filter(
                (answer) => answer.answered_by_id === record.id
              ).length || 0;

        const percentage =
          results?.total_questions > 0
            ? (answeredCount / results.total_questions) * 100
            : 0;

        return (
          <div
            style={{
              textAlign: "center",
              padding: isMobile ? "8px 4px" : "12px 8px",
            }}
          >
            <div
              style={{
                fontSize: isMobile ? 20 : 24,
                fontWeight: 700,
                color: "#1890ff",
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {answeredCount}
            </div>
            <div
              style={{
                fontSize: isMobile ? 10 : 11,
                color: "#8c8c8c",
                marginBottom: 8,
                lineHeight: 1.2,
              }}
            >
              dari {results?.total_questions || 0}
            </div>
            <Progress
              percent={Math.round(percentage)}
              size="small"
              strokeColor="#1890ff"
              showInfo={false}
              style={{
                maxWidth: isMobile ? 50 : 70,
                margin: "0 auto",
              }}
              strokeWidth={isMobile ? 6 : 8}
            />
          </div>
        );
      },
      width: isMobile ? 80 : 100,
      align: "center",
    },
    {
      title: (
        <div style={{ textAlign: "center", fontWeight: 600 }}>Kontribusi</div>
      ),
      key: "contribution",
      render: (_, record) => {
        const answeredCount =
          record.answered_count !== undefined
            ? record.answered_count
            : results?.answers?.filter(
                (answer) => answer.answered_by_id === record.id
              ).length || 0;

        const percentage =
          results?.total_questions > 0
            ? (answeredCount / results.total_questions) * 100
            : 0;

        const { color, label, bgColor } = getContributionColor(percentage);

        return (
          <div style={{ textAlign: "center", padding: "4px" }}>
            <div
              style={{
                background: bgColor,
                color: color,
                fontWeight: 600,
                fontSize: isMobile ? 10 : 12,
                padding: isMobile ? "6px 8px" : "8px 12px",
                borderRadius: 12,
                border: `1px solid ${color}20`,
                lineHeight: 1.2,
                minWidth: isMobile ? 70 : 90,
                margin: "0 auto",
              }}
            >
              {isMobile ? (
                <>
                  <div style={{ fontSize: 9, marginBottom: 2 }}>
                    {percentage === 0
                      ? "Tidak"
                      : percentage < 25
                      ? "Kurang"
                      : percentage < 50
                      ? "Cukup"
                      : percentage < 75
                      ? "Aktif"
                      : "Sangat"}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>
                    {Math.round(percentage)}%
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>
                    ({Math.round(percentage)}%)
                  </div>
                </>
              )}
            </div>
          </div>
        );
      },
      width: isMobile ? 80 : 120,
      align: "center",
    },
  ];

  return (
    <Card
      title={
        <Space>
          <TeamOutlined style={{ color: "#722ed1" }} />
          <span>Kontribusi Anggota Kelompok</span>
        </Space>
      }
      style={{
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <Table
        dataSource={
          results?.group_members?.map((member, index) => ({
            key: member.id || index,
            ...member,
          })) || []
        }
        columns={columns}
        pagination={false}
        size="small"
        scroll={{ x: isMobile ? 400 : undefined }}
        locale={{
          emptyText: (
            <div style={{ padding: isMobile ? "24px 0" : "32px 0" }}>
              <UserOutlined
                style={{
                  fontSize: isMobile ? 32 : 48,
                  color: "#d9d9d9",
                  marginBottom: 8,
                }}
              />
              <div
                style={{
                  color: "#8c8c8c",
                  fontSize: isMobile ? 12 : 14,
                }}
              >
                Tidak ada data anggota kelompok
              </div>
            </div>
          ),
        }}
      />

      {/* Summary Info */}
      <div
        style={{
          marginTop: 16,
          padding: isMobile ? 12 : 16,
          background: "linear-gradient(135deg, #f0f7ff 0%, #e6f7ff 100%)",
          borderRadius: 12,
          border: "1px solid #d6e4ff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 16, marginRight: 8 }}>💡</span>
          <Text
            strong
            style={{
              color: "#1890ff",
              fontSize: isMobile ? 13 : 14,
            }}
          >
            Informasi Kontribusi
          </Text>
        </div>
        <Text
          type="secondary"
          style={{
            fontSize: isMobile ? 11 : 12,
            lineHeight: 1.5,
          }}
        >
          Anggota yang menjawab lebih banyak soal menunjukkan partisipasi yang
          lebih aktif dalam kerja kelompok. Tingkatkan kolaborasi untuk hasil
          yang optimal!
        </Text>
      </div>
    </Card>
  );
};

export default GroupMembersContribution;
