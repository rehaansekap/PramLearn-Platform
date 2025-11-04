import React from "react";
import { Input, Button, Form, Row, Col, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

const MaterialFilters = ({
  searchText,
  rowsPerPage,
  handleSearchTextChange,
  handleRowsPerPageChange,
  handleAddMaterialClick,
  user,
  loading = false,
}) => {
  const isMobile = window.innerWidth <= 768;
  // Untuk material, 3 kolom (search, rows per page, dan add button)
  const colCount = user?.role !== 2 ? 3 : 2;
  const colSpan = 24 / colCount;

  return (
    <Form layout="vertical" style={{ marginBottom: 16 }}>
      <Row gutter={16} justify="space-between" align="middle">
        <Col xs={24} sm={12} md={colSpan}>
          <Form.Item
            label={
              <span style={{ fontWeight: "bold" }}>
                Search by material title
              </span>
            }
          >
            <Input
              placeholder="Cari material..."
              value={searchText}
              onChange={handleSearchTextChange}
              disabled={loading}
              style={{
                height: 40,
                borderRadius: 8,
              }}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={colSpan}>
          <Form.Item
            label={<span style={{ fontWeight: "bold" }}>Rows per page</span>}
          >
            <Select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              disabled={loading}
              style={{
                width: "100%",
                height: 40,
              }}
            >
              <Option value={5}>5</Option>
              <Option value={10}>10</Option>
              <Option value={20}>20</Option>
              <Option value={50}>50</Option>
            </Select>
          </Form.Item>
        </Col>

        {user?.role !== 2 && (
          <Col xs={24} sm={12} md={colSpan}>
            <Form.Item
              label={
                <span style={{ fontWeight: "bold", opacity: 0 }}>Action</span>
              }
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddMaterialClick}
                disabled={loading}
                style={{
                  width: "100%",
                  height: 40,
                  fontWeight: 600,
                  borderRadius: 8,
                  backgroundColor: "#11418b",
                  borderColor: "#11418b",
                }}
              >
                Add Material
              </Button>
            </Form.Item>
          </Col>
        )}
      </Row>
    </Form>
  );
};

export default MaterialFilters;
