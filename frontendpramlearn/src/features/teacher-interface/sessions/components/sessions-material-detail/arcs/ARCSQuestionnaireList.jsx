import React from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Popconfirm,
  Card,
  Empty,
  Progress,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  BarChartOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

const ARCSQuestionnaireList = ({
  questionnaires,
  loading,
  onEdit,
  onDelete,
  onSelect,
  onViewResponses,
  onViewAnalytics,
  isMobile,
}) => {
  const columns = [
    {
      title: "No",
      key: "no",
      render: (_, __, index) => index + 1,
      width: 50,
      align: "center",
    },
    {
      title: "Judul Kuesioner",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <Text strong style={{ fontSize: isMobile ? 12 : 14 }}>
            {text}
          </Text>
          <br />
          <Tag
            color={record.questionnaire_type === "pre" ? "blue" : "green"}
            size="small"
          >
            {record.questionnaire_type === "pre"
              ? "Pre-Assessment"
              : "Post-Assessment"}
          </Tag>
          {!record.is_active && (
            <Tag color="red" size="small">
              Tidak Aktif
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Pertanyaan",
      key: "questions_count",
      render: (_, record) => (
        <Tag color="blue">{record.questions_count} Pertanyaan</Tag>
      ),
      width: 120,
      align: "center",
      responsive: ["md"],
    },
    {
      title: "Respons",
      key: "responses",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          <Text style={{ fontSize: 12 }}>{record.responses_count} Respons</Text>
          <br />
          <Progress
            percent={record.completion_rate}
            size="small"
            showInfo={false}
            strokeColor="#52c41a"
          />

          {!isMobile && (
            <Text type="secondary" style={{ fontSize: 10 }}>
              {record.completion_rate}%
            </Text>
          )}
        </div>
      ),
      width: 100,
    },
    {
      title: "Dibuat",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => (
        <Text style={{ fontSize: isMobile ? 10 : 12 }}>
          {dayjs(date).format("DD/MM/YY")}
        </Text>
      ),
      width: 80,
      responsive: ["md"],
    },
    {
      title: "Periode Aktif",
      key: "period",
      render: (_, record) => {
        if (!record.start_date && !record.end_date) {
          return <Tag color="blue">Tanpa Batas</Tag>;
        }

        return (
          <div style={{ fontSize: 12 }}>
            {record.start_date && (
              <div>
                Mulai: {dayjs(record.start_date).format("DD/MM/YY HH:mm")}
              </div>
            )}
            {record.end_date && (
              <div>
                Berakhir: {dayjs(record.end_date).format("DD/MM/YY HH:mm")}
              </div>
            )}
            {record.duration_minutes && (
              <Tag color="orange" size="small">
                Max: {record.duration_minutes}m
              </Tag>
            )}
          </div>
        );
      },
      width: 140,
      responsive: ["lg"],
    },
    {
      title: "Aksi",
      key: "actions",
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            size="small"
            icon={<QuestionCircleOutlined />}
            onClick={() => onSelect(record)}
            title="Kelola Pertanyaan"
          />
          <Button
            size="small"
            icon={<UserOutlined />}
            onClick={() => onViewResponses(record)}
            title="Lihat Respons"
            disabled={record.responses_count === 0}
          />
          <Button
            size="small"
            icon={<BarChartOutlined />}
            onClick={() => onViewAnalytics(record)}
            title="Lihat Analitik"
            disabled={record.responses_count === 0}
          />
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            title="Edit"
          />
          <Popconfirm
            title="Hapus kuesioner ini?"
            description="Tindakan ini akan menghapus semua pertanyaan dan respons yang terkait."
            onConfirm={() => onDelete(record.id)}
            okText="Ya, Hapus"
            cancelText="Batal"
          >
            <Button
              size="small"
              icon={<DeleteOutlined />}
              danger
              title="Hapus"
            />
          </Popconfirm>
        </Space>
      ),
      width: isMobile ? 150 : 200,
    },
  ];

  if (questionnaires.length === 0 && !loading) {
    return (
      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              Belum ada kuesioner ARCS.
              <br />
              Buat kuesioner pertama untuk mengukur motivasi siswa.
            </span>
          }
        >
          <Button type="primary" icon={<QuestionCircleOutlined />}>
            Buat Kuesioner Pertama
          </Button>
        </Empty>
      </Card>
    );
  }

  return (
    <Table
      dataSource={questionnaires.map((q, idx) => ({
        ...q,
        key: q.id || idx,
      }))}
      columns={columns}
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: false,
        style: { textAlign: "center" },
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} dari ${total} kuesioner`,
      }}
      className="user-table-responsive"
      style={{ width: "100%" }}
      scroll={{ x: 600 }}
      size="middle"
    />
  );
};

export default ARCSQuestionnaireList;
