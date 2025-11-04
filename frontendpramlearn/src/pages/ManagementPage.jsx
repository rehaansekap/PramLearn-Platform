import React, { useContext } from "react";
import { Tabs } from "antd";
import { AuthContext } from "../context/AuthContext";
import UserManagement from "../features/users-management/UserManagement";
import ClassManagement from "../features/class-management/ClassManagement";
import SubjectManagement from "../features/subject-management/SubjectManagement";
import ScheduleManagement from "../features/schedule-management/ScheduleManagement";
import StudentActivityMonitor from "../features/activity-monitor/StudentActivityMonitor";

const { TabPane } = Tabs;

const ManagementPage = () => {
  const { user } = useContext(AuthContext);

  // Teacher hanya bisa akses Subject dan Class Management
  // Admin bisa akses semua
  const isAdmin = user?.role === 1;
  const isTeacher = user?.role === 2;

  return (
    <Tabs
      defaultActiveKey={isTeacher ? "subjects" : "users"}
      tabPosition="top"
      size="large"
      style={{
        minHeight: "70vh",
      }}
    >
      {/* User Management - Hanya untuk Admin */}
      {isAdmin && (
        <TabPane tab="User Management" key="users">
          <UserManagement />
        </TabPane>
      )}

      {/* Class Management - Admin dan Teacher */}
      <TabPane tab="Class Management" key="classes">
        <ClassManagement />
      </TabPane>

      {/* Subject Management - Admin dan Teacher */}
      <TabPane tab="Subject Management" key="subjects">
        <SubjectManagement />
      </TabPane>
      <TabPane tab="Schedule Management" key="schedules">
        <ScheduleManagement />
      </TabPane>
      <TabPane tab="Student Activities" key="activities">
        <StudentActivityMonitor />
      </TabPane>
    </Tabs>
  );
};

export default ManagementPage;
