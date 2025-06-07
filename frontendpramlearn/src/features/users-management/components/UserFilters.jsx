import React, { useContext } from "react";
import { Input, Button, Select, Form, Row, Col } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { AuthContext } from "../../../context/AuthContext"; // Tambahkan ini

const { Option } = Select;

const UserFilters = ({
  roles,
  classes,
  roleFilter,
  classFilter,
  rowsPerPage,
  searchText,
  emailSearchText,
  statusFilter,
  handleRoleFilterChange,
  handleClassFilterChange,
  handleRowsPerPageChange,
  handleSearchTextChange,
  handleEmailSearchTextChange,
  handleStatusFilterChange,
  handleAddUserClick,
  fullNameSearchText,
  handleFullNameSearchTextChange,
}) => {
  const { user } = useContext(AuthContext); // Tambahkan ini

  return (
    <Form layout="vertical">
      <Row gutter={16}>
        {/* Filter Role hanya tampil jika bukan teacher */}
        {user?.role !== 2 && (
          <Col xs={24} sm={12} md={12}>
            <Form.Item label={<span style={{ fontWeight: "bold" }}>Role</span>}>
              <Select
                value={roleFilter}
                onChange={handleRoleFilterChange}
                style={{
                  width: "100%",
                  height: 40,
                }}
              >
                <Option value="">None</Option>
                {roles.map((role) => (
                  <Option key={role.id} value={role.id}>
                    {role.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        )}
        <Col
          xs={24}
          sm={12}
          md={user?.role === 2 ? 24 : 12} // Full width jika teacher
        >
          <Form.Item label={<span style={{ fontWeight: "bold" }}>Class</span>}>
            <Select
              value={classFilter}
              onChange={handleClassFilterChange}
              style={{
                width: "100%",
                height: 40,
              }}
            >
              <Option value="">None</Option>
              {classes.map((cls) => (
                <Option key={cls.id} value={cls.id}>
                  {cls.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label={
              <span style={{ fontWeight: "bold" }}>Search by full name</span>
            }
          >
            <Input
              value={fullNameSearchText}
              onChange={handleFullNameSearchTextChange}
              style={{
                height: 40,
                borderRadius: 8,
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label={<span style={{ fontWeight: "bold" }}>Search by email</span>}
          >
            <Input
              value={emailSearchText}
              onChange={handleEmailSearchTextChange}
              style={{
                height: 40,
                borderRadius: 8,
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label={<span style={{ fontWeight: "bold" }}>Status</span>}>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              style={{
                width: "100%",
                height: 40,
              }}
            >
              <Option value="">All</Option>
              <Option value="online">Online</Option>
              <Option value="offline">Offline</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={user?.role === 2 ? 12 : 8}>
          <Form.Item
            label={
              <span style={{ fontWeight: "bold" }}>Search by username</span>
            }
          >
            <Input
              value={searchText}
              onChange={handleSearchTextChange}
              style={{
                height: 40,
                borderRadius: 8,
              }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={user?.role === 2 ? 12 : 8}>
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
            >
              <Option value={5}>5</Option>
              <Option value={10}>10</Option>
              <Option value={25}>25</Option>
            </Select>
          </Form.Item>
        </Col>
        {user?.role !== 2 && (
          <Col xs={24} sm={12} md={8}>
            <Form.Item label=" ">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddUserClick}
                block
                style={{
                  height: 40,
                  fontWeight: 600,
                  borderRadius: 8,
                  backgroundColor: "#11418b",
                  borderColor: "#11418b",
                }}
              >
                Add User
              </Button>
            </Form.Item>
          </Col>
        )}
      </Row>
    </Form>
  );
};

export default UserFilters;
