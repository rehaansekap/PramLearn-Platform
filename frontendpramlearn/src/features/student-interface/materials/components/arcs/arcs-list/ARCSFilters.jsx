import React from "react";
import { Card, Row, Col, Input, Select, Typography } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

const ARCSFilters = ({
  searchText,
  setSearchText,
  statusFilter,
  setStatusFilter,
  totalFiltered,
  totalQuestionnaires,
}) => {
  return (
    <Card
      style={{
        marginBottom: 24,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
      bodyStyle={{ padding: "16px 24px" }}
    >
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={8}>
          <Search
            placeholder="Cari kuesioner..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ width: "100%" }}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Select
            style={{ width: "100%" }}
            placeholder="Filter status"
            value={statusFilter}
            onChange={setStatusFilter}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="all">Semua Status</Option>
            <Option value="available">Tersedia</Option>
            <Option value="completed">Sudah Selesai</Option>
            <Option value="locked">Terkunci</Option>
          </Select>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Text type="secondary" style={{ fontSize: 14 }}>
            {totalFiltered} dari {totalQuestionnaires} kuesioner
          </Text>
        </Col>
      </Row>
    </Card>
  );
};

export default ARCSFilters;
