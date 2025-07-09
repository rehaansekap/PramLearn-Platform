import React from "react";
import { Card, Input, Button, Space, Select, Row, Col } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
  SortAscendingOutlined,
} from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;

const StudentsControlPanel = ({
  searchText,
  onSearchChange,
  onRefresh,
  refreshing = false,
  sortOrder,
  onSortChange,
  filterStatus,
  onFilterChange,
  isMobile = false,
}) => {
  return (
    <Card
      style={{
        borderRadius: 16,
        marginBottom: 24,
        background: "linear-gradient(135deg, #f8fafc 0%, #e6f3ff 100%)",
        border: "1px solid #e6f7ff",
      }}
      bodyStyle={{ padding: isMobile ? "16px" : "20px" }}
    >
      <Row gutter={[16, 16]} align="middle">
        {/* Search */}
        <Col xs={24} sm={12} md={8} lg={10}>
          <Search
            placeholder="🔍 Cari nama atau username siswa..."
            allowClear
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              borderRadius: 8,
            }}
            size={isMobile ? "middle" : "large"}
            prefix={<SearchOutlined style={{ color: "#1890ff" }} />}
          />
        </Col>

        {/* Filters */}
        <Col xs={24} sm={6} md={4} lg={4}>
          <Select
            placeholder="Status"
            allowClear
            value={filterStatus}
            onChange={onFilterChange}
            style={{ width: "100%" }}
            size={isMobile ? "middle" : "large"}
            suffixIcon={<FilterOutlined style={{ color: "#1890ff" }} />}
          >
            <Option value="online">
              <Space>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#52c41a",
                  }}
                />
                Online
              </Space>
            </Option>
            <Option value="offline">
              <Space>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#d9d9d9",
                  }}
                />
                Offline
              </Space>
            </Option>
            <Option value="excellent">🏆 Excellent (≥85)</Option>
            <Option value="needsAttention">⚠️ Perlu Perhatian</Option>
          </Select>
        </Col>

        {/* Sort */}
        <Col xs={12} sm={6} md={4} lg={4}>
          <Select
            placeholder="Urutkan"
            value={sortOrder}
            onChange={onSortChange}
            style={{ width: "100%" }}
            size={isMobile ? "middle" : "large"}
            suffixIcon={<SortAscendingOutlined style={{ color: "#1890ff" }} />}
          >
            <Option value="name">📝 Nama A-Z</Option>
            <Option value="grade">📊 Nilai Tertinggi</Option>
            <Option value="progress">📈 Progress Tertinggi</Option>
            <Option value="recent">⏰ Terbaru</Option>
          </Select>
        </Col>

        {/* Refresh Button */}
        <Col xs={12} sm={6} md={4} lg={6}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={refreshing}
              size={isMobile ? "middle" : "large"}
              style={{
                borderRadius: 8,
                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                border: "none",
                boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)",
                fontWeight: 600,
                minWidth: isMobile ? 80 : 120,
              }}
            >
              {refreshing ? "Memuat..." : isMobile ? "Refresh" : "Refresh Data"}
            </Button>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default StudentsControlPanel;
