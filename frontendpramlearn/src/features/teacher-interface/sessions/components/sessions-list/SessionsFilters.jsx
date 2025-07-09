import React from "react";
import { Input, Select, Form, Row, Col, Space } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";

const { Option } = Select;

const SessionsFilters = ({
  searchText,
  classFilter,
  availableClasses,
  onSearchChange,
  onClassFilterChange,
  loading = false,
}) => {
  return (
    <Form layout="vertical" style={{ marginBottom: 24 }}>
      <Row gutter={16} align="middle">
        <Col xs={24} sm={12} md={16}>
          <Form.Item
            label={
              <span style={{ fontWeight: "bold" }}>Cari Mata Pelajaran</span>
            }
            style={{ margin: 0 }}
          >
            <Input
              placeholder="Cari berdasarkan nama mata pelajaran atau kelas..."
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              prefix={<SearchOutlined style={{ color: "#666" }} />}
              disabled={loading}
              style={{ height: 40 }}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label={<span style={{ fontWeight: "bold" }}>Filter Kelas</span>}
            style={{ margin: 0 }}
          >
            <Select
              placeholder="Semua Kelas"
              value={classFilter}
              onChange={onClassFilterChange}
              disabled={loading}
              style={{ width: "100%", height: 40 }}
              allowClear
            >
              {availableClasses.map((cls) => (
                <Option key={cls.id} value={cls.id}>
                  <Space>
                    <FilterOutlined style={{ color: "#666" }} />
                    {cls.name}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default SessionsFilters;
