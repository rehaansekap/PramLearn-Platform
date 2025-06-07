import React from "react";
import { Input, Button, Form, Row, Col, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

const ClassFilters = ({
  searchText,
  rowsPerPage,
  handleSearchTextChange,
  handleRowsPerPageChange,
  handleAddClassClick,
  user,
  loading = false, // Tambahkan prop loading
}) => {
  const isMobile = window.innerWidth <= 768;
  // Jika teacher, 2 kolom; jika admin/operator, 3 kolom
  const colCount = user?.role !== 2 ? 3 : 2;
  const colSpan = 24 / colCount;

  return (
    <Form layout="vertical">
      <Row gutter={16} justify="space-between" align="middle">
        <Col xs={24} sm={12} md={colSpan}>
          <Form.Item
            label={
              <span style={{ fontWeight: "bold" }}>Search by class name</span>
            }
          >
            <Input
              placeholder="Enter class name"
              value={searchText}
              onChange={handleSearchTextChange}
              style={{
                height: 40,
                borderRadius: 8,
              }}
              disabled={loading}
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
              style={{
                width: "100%",
                height: 40,
              }}
              disabled={loading}
            >
              <Option value={5}>5</Option>
              <Option value={10}>10</Option>
              <Option value={25}>25</Option>
              <Option value={50}>50</Option>
            </Select>
          </Form.Item>
        </Col>

        {user?.role !== 2 && (
          <Col xs={24} sm={24} md={colSpan}>
            <Form.Item
              label={
                <span style={{ fontWeight: "bold", opacity: 0 }}>Action</span>
              }
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddClassClick}
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
                Add Class
              </Button>
            </Form.Item>
          </Col>
        )}
      </Row>
    </Form>
  );
};

export default ClassFilters;
