import React, { useEffect, useState, useContext } from "react";
import { Breadcrumb } from "antd";
import { Link, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
  BarChartOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../api";

const TeacherBreadcrumb = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [dynamicCrumbs, setDynamicCrumbs] = useState([]);

  // Get role path
  const getRolePath = (roleId) => {
    switch (roleId) {
      case 1:
        return "admin";
      case 2:
        return "teacher";
      default:
        return "teacher";
    }
  };

  const userRolePath = user ? getRolePath(user.role) : "teacher";
  const roleDisplayName = user?.role === 1 ? "Admin" : "Teacher";

  useEffect(() => {
    const generateBreadcrumbs = async () => {
      const pathSnippets = location.pathname.split("/").filter((i) => i);
      const baseCrumbs = [
        {
          path: `/${userRolePath}`,
          breadcrumbName: "Dashboard",
          icon: <HomeOutlined />,
        },
      ];

      // Handle management routes: /teacher/management
      if (pathSnippets[1] === "management") {
        if (pathSnippets.length === 2) {
          setDynamicCrumbs([
            ...baseCrumbs,
            {
              path: `/${userRolePath}/management`,
              breadcrumbName: "Management",
              icon: <SettingOutlined />,
            },
          ]);
        } else if (pathSnippets[2] === "subject" && pathSnippets[3]) {
          // Subject detail page
          const subjectSlug = pathSnippets[3];
          try {
            const response = await api.get(`subjects/?slug=${subjectSlug}`);
            const subject = response.data.find((s) => s.slug === subjectSlug);
            if (subject) {
              setDynamicCrumbs([
                ...baseCrumbs,
                {
                  path: `/${userRolePath}/management`,
                  breadcrumbName: "Management",
                  icon: <SettingOutlined />,
                },
                {
                  path: `/${userRolePath}/management/subject/${subjectSlug}`,
                  breadcrumbName: subject.name,
                  icon: <BookOutlined />,
                },
              ]);
              return;
            }
          } catch (error) {
            console.error("Error fetching subject:", error);
          }
        } else if (pathSnippets[2] === "material" && pathSnippets[3]) {
          // Material detail page
          const materialSlug = pathSnippets[3];
          try {
            const response = await api.get(`materials/${materialSlug}/`);
            const material = response.data.find((m) => m.slug === materialSlug);
            if (material) {
              // Fetch subject info
              let subjectName = "Unknown Subject";
              let subjectSlug = "";
              if (material.subject) {
                try {
                  const subjectResponse = await api.get(
                    `subjects/${material.subject}/`
                  );
                  subjectName = subjectResponse.data.name;
                  subjectSlug = subjectResponse.data.slug;
                } catch (error) {
                  console.error("Error fetching subject for material:", error);
                }
              }

              setDynamicCrumbs([
                ...baseCrumbs,
                {
                  path: `/${userRolePath}/management`,
                  breadcrumbName: "Management",
                  icon: <SettingOutlined />,
                },
                {
                  path: `/${userRolePath}/management/subject/${subjectSlug}`,
                  breadcrumbName: subjectName,
                  icon: <BookOutlined />,
                },
                {
                  path: `/${userRolePath}/management/material/${materialSlug}`,
                  breadcrumbName: material.title,
                  icon: <FileTextOutlined />,
                },
              ]);
              return;
            }
          } catch (error) {
            console.error("Error fetching material:", error);
          }
        }
        return;
      }

      // Handle sessions routes: /teacher/sessions
      if (pathSnippets[1] === "sessions") {
        if (pathSnippets.length === 2) {
          setDynamicCrumbs([
            ...baseCrumbs,
            {
              path: `/${userRolePath}/sessions`,
              breadcrumbName: "Pertemuan",
              icon: <CalendarOutlined />,
            },
          ]);
        } else if (pathSnippets[2]) {
          // Sessions detail page
          const subjectSlug = pathSnippets[2];
          try {
            const response = await api.get(`teacher/sessions/${subjectSlug}/`);
            const sessionData = response.data;
            if (sessionData && sessionData.subject) {
              setDynamicCrumbs([
                ...baseCrumbs,
                {
                  path: `/${userRolePath}/sessions`,
                  breadcrumbName: "Pertemuan",
                  icon: <CalendarOutlined />,
                },
                {
                  path: `/${userRolePath}/sessions/${subjectSlug}`,
                  breadcrumbName: sessionData.subject.name,
                  icon: <BookOutlined />,
                },
              ]);

              // Handle material detail in sessions
              if (pathSnippets[3]) {
                const materialSlug = pathSnippets[3];
                try {
                  const materialRes = await api.get(
                    `teacher/sessions/material/${materialSlug}/`
                  );
                  const material = materialRes.data;
                  if (material) {
                    setDynamicCrumbs([
                      ...baseCrumbs,
                      {
                        path: `/${userRolePath}/sessions`,
                        breadcrumbName: "Pertemuan",
                        icon: <CalendarOutlined />,
                      },
                      {
                        path: `/${userRolePath}/sessions/${subjectSlug}`,
                        breadcrumbName: sessionData.subject.name,
                        icon: <BookOutlined />,
                      },
                      {
                        path: `/${userRolePath}/sessions/${subjectSlug}/${materialSlug}`,
                        breadcrumbName: material.material.title,
                        icon: <FileTextOutlined />,
                      },
                    ]);
                    return;
                  }
                } catch (error) {
                  console.error("Error fetching material in session:", error);
                }
              }
              return;
            }
          } catch (error) {
            console.error("Error fetching session:", error);
          }
        }
        return;
      }

      // Handle other static routes
      // Tambahkan di routeMap
      const routeMap = {
        analytics: {
          breadcrumbName: "Analytics",
          icon: <BarChartOutlined />,
        },
        students: {
          breadcrumbName: "Students",
          icon: <UserOutlined />,
        },
        reports: {
          breadcrumbName: "Reports",
          icon: <FileTextOutlined />,
        },
        classes: {
          breadcrumbName: "Kelas Saya",
          icon: <TeamOutlined />,
        },
      };

      // Tambahkan handling untuk class detail
      if (pathSnippets[1] === "classes" && pathSnippets[2]) {
        // Class detail page
        const classSlug = pathSnippets[2];
        try {
          const response = await api.get(`teacher/classes/${classSlug}/`);
          const classData = response.data.class;
          if (classData) {
            setDynamicCrumbs([
              ...baseCrumbs,
              {
                path: `/${userRolePath}/classes`,
                breadcrumbName: "Kelas Saya",
                icon: <TeamOutlined />,
              },
              {
                path: `/${userRolePath}/classes/${classSlug}`,
                breadcrumbName: classData.name,
                icon: <TeamOutlined />,
              },
            ]);
            return;
          }
        } catch (error) {
          console.error("Error fetching class:", error);
        }
      }

      if (pathSnippets[1] && routeMap[pathSnippets[1]]) {
        const route = routeMap[pathSnippets[1]];
        setDynamicCrumbs([
          ...baseCrumbs,
          {
            path: `/${userRolePath}/${pathSnippets[1]}`,
            breadcrumbName: route.breadcrumbName,
            icon: route.icon,
          },
        ]);
        return;
      }

      if (pathSnippets[1] === "subjects") {
        if (pathSnippets.length === 2) {
          setDynamicCrumbs([
            ...baseCrumbs,
            {
              path: `/${userRolePath}/subjects`,
              breadcrumbName: "Mata Pelajaran",
              icon: <BookOutlined />,
            },
          ]);
        } else if (pathSnippets[2]) {
          // Subject detail page
          const subjectSlug = pathSnippets[2];
          try {
            const subjectRes = await api.get(
              `teacher/subjects/${subjectSlug}/`
            );
            setDynamicCrumbs([
              ...baseCrumbs,
              {
                path: `/${userRolePath}/subjects`,
                breadcrumbName: "Mata Pelajaran",
                icon: <BookOutlined />,
              },
              {
                path: location.pathname,
                breadcrumbName: subjectRes.data.subject.name,
              },
            ]);
          } catch (error) {
            console.error("Failed to fetch subject data:", error);
            setDynamicCrumbs([
              ...baseCrumbs,
              {
                path: `/${userRolePath}/subjects`,
                breadcrumbName: "Mata Pelajaran",
                icon: <BookOutlined />,
              },
              {
                path: location.pathname,
                breadcrumbName: "Detail Mata Pelajaran",
              },
            ]);
          }
        }
        return;
      }

      // Default fallback - hanya dashboard
      setDynamicCrumbs(baseCrumbs);
    };

    generateBreadcrumbs();
  }, [location.pathname, userRolePath]);

  const breadcrumbItems = dynamicCrumbs.map((crumb, index) => {
    const isLast = index === dynamicCrumbs.length - 1;

    return {
      key: crumb.path,
      title: isLast ? (
        <span style={{ color: "#11418b", fontWeight: 500 }}>
          {crumb.icon && <span style={{ marginRight: 4 }}>{crumb.icon}</span>}
          {crumb.breadcrumbName}
        </span>
      ) : (
        <Link to={crumb.path} style={{ color: "#666" }}>
          {crumb.icon && <span style={{ marginRight: 4 }}>{crumb.icon}</span>}
          {crumb.breadcrumbName}
        </Link>
      ),
    };
  });

  return (
    <Breadcrumb
      items={breadcrumbItems}
      style={{
        margin: "16px 0",
        fontSize: "14px",
      }}
    />
  );
};

export default TeacherBreadcrumb;
