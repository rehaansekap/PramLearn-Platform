import React from "react";
import { Input, Select, Row, Col, Card } from "antd";
import { SearchOutlined, CalendarOutlined } from "@ant-design/icons";

const SubjectListFilters = ({
  search,
  setSearch,
  dayFilter,
  setDayFilter,
  dayOptions,
}) => {
  const isMobile = window.innerWidth <= 768;

  return (
    <Card
      style={{
        marginBottom: 24,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
      bodyStyle={{ padding: "20px 24px" }}
    >
      <Row gutter={16} align="middle">
        <Col
          xs={24}
          sm={24}
          md={12}
          lg={16}
          style={{ marginBottom: isMobile ? 16 : 0 }}
        >
          <Input
            placeholder="Cari mata pelajaran..."
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="large"
            style={{
              borderRadius: 8,
              fontSize: 14,
            }}
          />
        </Col>

        <Col xs={24} sm={24} md={12} lg={8}>
          <Select
            placeholder="Filter berdasarkan hari"
            value={dayFilter}
            onChange={setDayFilter}
            size="large"
            style={{
              width: "100%",
              borderRadius: 8,
            }}
            suffixIcon={<CalendarOutlined style={{ color: "#bfbfbf" }} />}
          >
            {dayOptions.map((option) => (
              <Select.Option
                key={option.value}
                value={option.value}
                style={{ fontSize: isMobile ? 14 : 16 }}
              >
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
    </Card>
  );
};

export default SubjectListFilters;
