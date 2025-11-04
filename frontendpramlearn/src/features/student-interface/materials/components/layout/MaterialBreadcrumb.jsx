import React from "react";
import { Breadcrumb, Space } from "antd";
import {
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const MaterialBreadcrumb = ({ materialTitle }) => {
  return (
    <Breadcrumb
      style={{ marginBottom: 24 }}
      items={[
        {
          href: "/student",
          title: (
            <Space>
              <HomeOutlined />
              <span>Dashboard</span>
            </Space>
          ),
        },
        {
          href: "/student/subjects",
          title: (
            <Space>
              <BookOutlined />
              <span>Mata Pelajaran Saya</span>
            </Space>
          ),
        },
        {
          title: (
            <Space>
              <FileTextOutlined />
              <span>{materialTitle}</span>
            </Space>
          ),
        },
      ]}
    />
  );
};

export default MaterialBreadcrumb;