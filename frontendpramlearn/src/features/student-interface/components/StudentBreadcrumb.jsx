import React, { useEffect, useState } from "react";
import { Breadcrumb } from "antd";
import { Link, useLocation } from "react-router-dom";
import { HomeOutlined } from "@ant-design/icons";
import api from "../../../api";

const StudentBreadcrumb = () => {
  const location = useLocation();
  const [dynamicCrumbs, setDynamicCrumbs] = useState([]);

  useEffect(() => {
    const generateBreadcrumbs = async () => {
      const pathSnippets = location.pathname.split("/").filter((i) => i);
      const baseCrumbs = [
        {
          path: "/student",
          breadcrumbName: "Student Portal",
          icon: <HomeOutlined />,
        },
      ];

      // Handle material routes: /student/materials/:materialSlug
      if (pathSnippets[1] === "materials" && pathSnippets[2]) {
        const materialSlug = pathSnippets[2];
        try {
          const materialRes = await api.get(`materials/?slug=${materialSlug}`);
          const material = materialRes.data.find((m) => m.slug === materialSlug);
          
          if (material && material.subject) {
            const subjectRes = await api.get(`subjects/${material.subject}/`);
            setDynamicCrumbs([
              ...baseCrumbs,
              { path: "/student/subjects", breadcrumbName: "My Subjects" },
              {
                path: `/student/subjects/${subjectRes.data.slug}`,
                breadcrumbName: subjectRes.data.name,
              },
              {
                path: location.pathname,
                breadcrumbName: "Material",
              },
            ]);
            return;
          }
        } catch (error) {
          console.error("Failed to fetch material/subject data:", error);
        }
        
        // Fallback jika gagal fetch
        setDynamicCrumbs([
          ...baseCrumbs,
          { path: "/student/subjects", breadcrumbName: "My Subjects" },
          { path: location.pathname, breadcrumbName: "Material" },
        ]);
        return;
      }

      // Handle subjects routes: /student/subjects
      if (pathSnippets[1] === "subjects") {
        if (pathSnippets.length === 2) {
          setDynamicCrumbs([
            ...baseCrumbs,
            { path: "/student/subjects", breadcrumbName: "My Subjects" },
          ]);
        } else if (pathSnippets[2]) {
          // Dynamic subject detail
          try {
            const subjectRes = await api.get(`subjects/${pathSnippets[2]}/`);
            setDynamicCrumbs([
              ...baseCrumbs,
              { path: "/student/subjects", breadcrumbName: "My Subjects" },
              {
                path: `/student/subjects/${pathSnippets[2]}`,
                breadcrumbName: `${subjectRes.data.name}`,
              },
            ]);
          } catch {
            setDynamicCrumbs([
              ...baseCrumbs,
              { path: "/student/subjects", breadcrumbName: "My Subjects" },
              { path: location.pathname, breadcrumbName: "Subject Detail" },
            ]);
          }
        }
        return;
      }

      // Other static routes
      const routeMap = {
        dashboard: "Dashboard",
        assessments: "Assessments",
        progress: "Progress",
        group: "My Group",
      };

      if (pathSnippets[1] && routeMap[pathSnippets[1]]) {
        setDynamicCrumbs([
          ...baseCrumbs,
          {
            path: `/student/${pathSnippets[1]}`,
            breadcrumbName: routeMap[pathSnippets[1]],
          },
        ]);
        return;
      }

      // Default fallback
      setDynamicCrumbs(baseCrumbs);
    };

    generateBreadcrumbs();
  }, [location.pathname]);

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

export default StudentBreadcrumb;