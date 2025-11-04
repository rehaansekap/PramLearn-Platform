import React from "react";
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Button,
  Space,
  Typography,
  Input,
} from "antd";
import {
  FilterOutlined,
  SearchOutlined,
  CalendarOutlined,
  BookOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

const GradeFilters = ({
  subjects = [],
  filters = {},
  onApplyFilters,
  onClearFilters,
  loading = false,
}) => {
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
    if (safeFilters.search) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card
      style={{
        borderRadius: 12,
        marginBottom: 24,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
      bodyStyle={{ padding: "16px 24px" }}
    >
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={8}>
          <Input
            placeholder="Cari assessment..."
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            allowClear
            style={{ width: "100%" }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="Mata pelajaran"
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
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="Jenis penilaian"
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
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Button
            icon={<FilterOutlined />}
            onClick={handleClearFilters}
            disabled={loading || activeFilterCount === 0}
            style={{ width: "100%" }}
          >
            Reset
          </Button>
        </Col>
      </Row>

      {/* Active Filter Indicator */}
      {activeFilterCount > 0 && (
        <div style={{ marginTop: 12 }}>
          <Space wrap>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Filter aktif:
            </Text>
            <span
              style={{
                backgroundColor: "#11418b",
                color: "white",
                borderRadius: "12px",
                padding: "2px 8px",
                fontSize: 12,
                fontWeight: "bold",
              }}
            >
              {activeFilterCount}
            </span>
          </Space>
        </div>
      )}
    </Card>
  );
};

export default GradeFilters;
