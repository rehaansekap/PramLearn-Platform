import React from "react";
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Button,
  Space,
  Form,
  Typography,
} from "antd";
import {
  FilterOutlined,
  ClearOutlined,
  CalendarOutlined,
  BookOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

const GradeFilters = ({
  subjects = [], // Tambahkan default value array kosong
  filters = {},
  onApplyFilters,
  onClearFilters,
  loading = false,
}) => {
  const [form] = Form.useForm();

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    if (typeof onApplyFilters === "function") {
      onApplyFilters(newFilters);
    }
  };

  const handleDateRangeChange = (dates) => {
    const newFilters = {
      ...filters,
      date_from: dates && dates[0] ? dates[0].format("YYYY-MM-DD") : null,
      date_to: dates && dates[1] ? dates[1].format("YYYY-MM-DD") : null,
    };
    if (typeof onApplyFilters === "function") {
      onApplyFilters(newFilters);
    }
  };

  const handleClearFilters = () => {
    if (typeof onClearFilters === "function") {
      onClearFilters();
    }
  };

  const safeFilters = filters || {};
  const getActiveFilterCount = () => {
    let count = 0;
    if (safeFilters.subject_id) count++;
    if (safeFilters.type && safeFilters.type !== "all") count++;
    if (safeFilters.date_from || safeFilters.date_to) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card
      title={
        <Space>
          <FilterOutlined style={{ color: "#11418b" }} />
          <Text strong>Filter Nilai</Text>
          {activeFilterCount > 0 && (
            <span
              style={{
                backgroundColor: "#11418b",
                color: "white",
                borderRadius: "50%",
                padding: "2px 8px",
                fontSize: 12,
                fontWeight: "bold",
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </Space>
      }
      size="small"
      style={{ marginBottom: 16 }}
    >
      <Form form={form} layout="vertical">
        <Row gutter={[16, 16]}>
          {/* Subject Filter */}
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Mata Pelajaran" style={{ marginBottom: 8 }}>
              <Select
                placeholder="Semua mata pelajaran"
                allowClear
                value={filters.subject_id}
                onChange={(value) => handleFilterChange("subject_id", value)}
                disabled={loading}
                style={{ width: "100%" }}
                suffixIcon={<BookOutlined />}
              >
                {subjects.map((subject) => (
                  <Option key={subject.id} value={subject.id}>
                    {subject.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Assessment Type Filter */}
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Jenis Penilaian" style={{ marginBottom: 8 }}>
              <Select
                placeholder="Semua jenis"
                value={filters.type}
                onChange={(value) => handleFilterChange("type", value)}
                disabled={loading}
                style={{ width: "100%" }}
                suffixIcon={<FileTextOutlined />}
              >
                <Option value="all">Semua</Option>
                <Option value="quiz">Quiz</Option>
                <Option value="assignment">Assignment</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Date Range Filter */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Rentang Tanggal" style={{ marginBottom: 8 }}>
              <RangePicker
                style={{ width: "100%" }}
                placeholder={["Tanggal mulai", "Tanggal akhir"]}
                value={
                  filters.date_from && filters.date_to
                    ? [dayjs(filters.date_from), dayjs(filters.date_to)]
                    : null
                }
                onChange={handleDateRangeChange}
                disabled={loading}
                suffixIcon={<CalendarOutlined />}
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>

          {/* Clear Button */}
          <Col xs={24} sm={12} md={4}>
            <Form.Item
              label=" "
              style={{ marginBottom: 8, visibility: "hidden" }}
            >
              <div style={{ visibility: "visible" }}>
                <Button
                  icon={<ClearOutlined />}
                  onClick={handleClearFilters}
                  disabled={loading || activeFilterCount === 0}
                  style={{ width: "100%" }}
                >
                  Reset Filter
                </Button>
              </div>
            </Form.Item>
          </Col>
        </Row>

        {/* Quick Filters */}
        <Row style={{ marginTop: 8 }}>
          <Col span={24}>
            <Text type="secondary" style={{ fontSize: 12, marginBottom: 8 }}>
              Filter Cepat:
            </Text>
            <Space wrap>
              <Button
                size="small"
                onClick={() =>
                  handleDateRangeChange([dayjs().subtract(7, "day"), dayjs()])
                }
                disabled={loading}
              >
                7 Hari Terakhir
              </Button>
              <Button
                size="small"
                onClick={() =>
                  handleDateRangeChange([dayjs().subtract(1, "month"), dayjs()])
                }
                disabled={loading}
              >
                1 Bulan Terakhir
              </Button>
              <Button
                size="small"
                onClick={() =>
                  handleDateRangeChange([dayjs().subtract(3, "month"), dayjs()])
                }
                disabled={loading}
              >
                3 Bulan Terakhir
              </Button>
              <Button
                size="small"
                onClick={() => handleFilterChange("type", "quiz")}
                disabled={loading}
                type={filters.type === "quiz" ? "primary" : "default"}
              >
                Quiz Saja
              </Button>
              <Button
                size="small"
                onClick={() => handleFilterChange("type", "assignment")}
                disabled={loading}
                type={filters.type === "assignment" ? "primary" : "default"}
              >
                Assignment Saja
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default GradeFilters;
