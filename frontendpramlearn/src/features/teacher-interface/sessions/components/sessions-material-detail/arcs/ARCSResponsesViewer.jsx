import React from "react";
import {
  Card,
  Table,
  Tag,
  Typography,
  Empty,
  Progress,
  Space,
  Button,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  EyeOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const ARCSResponsesViewer = ({
  questionnaire,
  responses,
  loading,
  isMobile,
}) => {
  const handleViewDetail = (response) => {
    // TODO: Implement view detail modal
    console.log("View detail:", response);
  };

  const handleExportResponses = () => {
    // TODO: Implement export functionality
    console.log("Export responses");
  };

  const columns = [
    {
      title: "No",
      key: "no",
      render: (_, __, index) => index + 1,
      width: 50,
      align: "center",
    },
    {
      title: "Siswa",
      key: "student",
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: isMobile ? 12 : 14 }}>
            {record.student_name || record.student_username}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            @{record.student_username}
          </Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_completed",
      key: "status",
      width: 100,
      align: "center",
      render: (completed) => (
        <Tag
          color={completed ? "green" : "orange"}
          icon={completed ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
        >
          {completed ? "Selesai" : "Dalam Proses"}
        </Tag>
      ),
    },
    {
      title: "Progress",
      key: "progress",
      width: 120,
      render: (_, record) => {
        const totalQuestions = questionnaire.questions_count || 0;
        const answeredQuestions = record.answers ? record.answers.length : 0;
        const progress =
          totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

        return (
          <div style={{ textAlign: "center" }}>
            <Progress
              percent={progress}
              size="small"
              showInfo={false}
              strokeColor={progress === 100 ? "#52c41a" : "#1890ff"}
            />
            <Text style={{ fontSize: 10 }}>
              {answeredQuestions}/{totalQuestions}
            </Text>
          </div>
        );
      },
      responsive: ["md"],
    },
    {
      title: "Waktu Submit",
      dataIndex: "submitted_at",
      key: "submitted_at",
      width: 120,
      render: (date) => (
        <Text style={{ fontSize: isMobile ? 10 : 12 }}>
          {date ? dayjs(date).format("DD/MM/YY HH:mm") : "-"}
        </Text>
      ),
      responsive: ["lg"],
    },
    {
      title: "Aksi",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Lihat Detail">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              disabled={!record.is_completed}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Calculate statistics
  const totalResponses = responses.length;
  const completedResponses = responses.filter((r) => r.is_completed).length;
  const completionRate =
    totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0;

  if (responses.length === 0 && !loading) {
    return (
      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text>Belum ada respons untuk kuesioner ini.</Text>
              <br />
              <Text type="secondary">
                Siswa akan muncul di sini setelah mereka mulai mengisi
                kuesioner.
              </Text>
            </div>
          }
        />
      </Card>
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <Title level={5} style={{ margin: 0, color: "#11418b" }}>
            Respons Siswa
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Monitor progress pengisian kuesioner oleh siswa
          </Text>
        </div>
        {completedResponses > 0 && (
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportResponses}
            size={isMobile ? "small" : "middle"}
          >
            {isMobile ? "Export" : "Export Data"}
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div style={{ marginBottom: 16 }}>
        <Card size="small">
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              textAlign: "center",
            }}
          >
            <div>
              <Text strong style={{ color: "#11418b", fontSize: 16 }}>
                {totalResponses}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Total Respons
              </Text>
            </div>
            <div>
              <Text strong style={{ color: "#52c41a", fontSize: 16 }}>
                {completedResponses}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Selesai
              </Text>
            </div>
            <div>
              <Text strong style={{ color: "#faad14", fontSize: 16 }}>
                {completionRate.toFixed(1)}%
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Tingkat Selesai
              </Text>
            </div>
            <div>
              <Text strong style={{ color: "#1890ff", fontSize: 16 }}>
                {totalResponses - completedResponses}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Dalam Proses
              </Text>
            </div>
          </div>
        </Card>
      </div>

      {/* Responses Table */}
      <Table
        columns={columns}
        dataSource={responses.map((r) => ({ ...r, key: r.id }))}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} dari ${total} respons`,
        }}
        scroll={{ x: isMobile ? 600 : undefined }}
        size={isMobile ? "small" : "middle"}
      />
    </div>
  );
};

export default ARCSResponsesViewer;
