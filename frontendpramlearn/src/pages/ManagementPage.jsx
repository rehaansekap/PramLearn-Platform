import React from "react";
import { Tabs } from "antd";
import UserManagement from "../features/users-management/UserManagement";
import ClassManagement from "../features/class-management/ClassManagement";
import SubjectManagement from "../features/subject-management/SubjectManagement";

const { TabPane } = Tabs;

const ManagementPage = () => (
  <Tabs defaultActiveKey="users" tabPosition="top">
    <TabPane tab="User Management" key="users">
      <UserManagement />
    </TabPane>
    <TabPane tab="Class Management" key="classes">
      <ClassManagement />
    </TabPane>
    <TabPane tab="Subject Management" key="subjects">
      <SubjectManagement />
    </TabPane>
  </Tabs>
);

export default ManagementPage;
