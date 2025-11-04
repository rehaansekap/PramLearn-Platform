import React from "react";
import { Input, Button, Form, Row, Col, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

const SubjectFilters = ({
  searchText,
  rowsPerPage,
  handleSearchTextChange,
  handleRowsPerPageChange,
  handleAddSubjectClick,
  user,
  classFilter,
  handleClassFilterChange,
  classList,
  loading = false, // Tambahkan prop loading
}) => {
  const isMobile = window.innerWidth <= 768;
  // Jika teacher, 3 kolom; jika admin/operator, 4 kolom
  const colCount = user?.role !== 2 ? 4 : 3;
  const colSpan = 24 / colCount;

  return (
    <Form layout="vertical">
      <Row gutter={16} justify="space-between" align="middle">
        <Col xs={24} sm={12} md={colSpan}>
          <Form.Item
            label={
              <span style={{ fontWeight: "bold" }}>Search by subject name</span>
            }
          >
            <Input
              placeholder="Enter subject name"
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

        <Col xs={24} sm={12} md={colSpan}>
          <Form.Item label={<span style={{ fontWeight: "bold" }}>Class</span>}>
            <Select
              value={classFilter}
              onChange={handleClassFilterChange}
              style={{
                width: "100%",
                height: 40,
              }}
              disabled={loading}
            >
              <Option value="">All Classes</Option>
              {classList.map((cls) => (
                <Option key={cls.id} value={cls.id}>
                  {cls.name}
                </Option>
              ))}
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
                onClick={handleAddSubjectClick}
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
                Add Subject
              </Button>
            </Form.Item>
          </Col>
        )}
      </Row>
    </Form>
  );
};

export default SubjectFilters;
