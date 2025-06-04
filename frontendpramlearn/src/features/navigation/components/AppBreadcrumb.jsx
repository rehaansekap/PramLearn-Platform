import React, { useEffect, useState, useContext } from "react";
import { Breadcrumb } from "antd";
import { Link, useLocation, matchPath } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../api";

const AppBreadcrumb = () => {
  const location = useLocation();
  const [dynamicCrumbs, setDynamicCrumbs] = useState([]);
  const { user } = useContext(AuthContext);

  // Get role path
  const getRolePath = (roleId) => {
    switch (roleId) {
      case 1:
        return "admin";
      case 2:
        return "teacher";
      case 3:
        return "student";
      default:
        return "user";
    }
  };

  const userRolePath = user ? getRolePath(user.role) : "user";
  const roleDisplayName =
    user?.role === 1 ? "Admin" : user?.role === 2 ? "Teacher" : "Management";

  useEffect(() => {
    const fetchDynamicData = async () => {
      // Subject Detail Page - NEW PATH: /admin/management/subject/:subjectSlug
      const subjectMatch = matchPath(
        { path: `/${userRolePath}/management/subject/:subjectSlug`, end: true },
        location.pathname
      );
      if (subjectMatch) {
        const { subjectSlug } = subjectMatch.params;
        try {
          const response = await api.get(`subjects/?slug=${subjectSlug}`);
          const subject = response.data.find((s) => s.slug === subjectSlug);
          if (subject) {
            setDynamicCrumbs([
              { path: "/", breadcrumbName: "Home" },
              { path: `/${userRolePath}`, breadcrumbName: roleDisplayName },
              {
                path: `/${userRolePath}/management`,
                breadcrumbName: "Management",
              },
              {
                path: `/${userRolePath}/management/subject/${subjectSlug}`,
                breadcrumbName: `${subject.name}`,
              },
            ]);
            return;
          }
        } catch (error) {
          console.error("Error fetching subject:", error);
        }
      }

      // Material Detail Page - NEW PATH: /admin/management/material/:materialId
      const materialMatch = matchPath(
        { path: `/${userRolePath}/management/material/:materialSlug`, end: true },
        location.pathname
      );
      if (materialMatch) {
        const { materialSlug } = materialMatch.params;
        try {
          const response = await api.get(`materials/?slug=${materialSlug}`);
          const material = response.data.find((m) => m.slug === materialSlug);
          if (material) {
            // Fetch subject info untuk breadcrumb yang lebih lengkap
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
              { path: "/", breadcrumbName: "Home" },
              { path: `/${userRolePath}`, breadcrumbName: roleDisplayName },
              {
                path: `/${userRolePath}/management`,
                breadcrumbName: "Management",
              },
              {
                path: `/${userRolePath}/management/subject/${subjectSlug}`,
                breadcrumbName: subjectName,
              },
              {
                path: `/${userRolePath}/management/material/${materialSlug}`,
                breadcrumbName: `${material.title}`,
              },
            ]);
            return;
          }
        } catch (error) {
          console.error("Error fetching material:", error);
        }
      }

      // Default breadcrumbs berdasarkan path
      const pathSegments = location.pathname.split("/").filter(Boolean);
      const crumbs = [{ path: "/", breadcrumbName: "Home" }];

      if (pathSegments[0] === userRolePath) {
        // Role home page
        crumbs.push({
          path: `/${userRolePath}`,
          breadcrumbName: roleDisplayName,
        });

        // Management page
        if (pathSegments[1] === "management") {
          crumbs.push({
            path: `/${userRolePath}/management`,
            breadcrumbName: "Management",
          });

          // Handle nested paths under management
          if (pathSegments[2] === "subject" && pathSegments[3]) {
            // We're in a subject detail page, but breadcrumb will be handled by dynamic fetch above
          } else if (pathSegments[2] === "material" && pathSegments[3]) {
            // We're in a material detail page, but breadcrumb will be handled by dynamic fetch above
          }
        }
        // Handle other paths at role level
        else if (pathSegments.length > 1) {
          const secondSegment = pathSegments[1];
          const formattedSegment =
            secondSegment.charAt(0).toUpperCase() + secondSegment.slice(1);
          crumbs.push({
            path: `/${userRolePath}/${secondSegment}`,
            breadcrumbName: formattedSegment,
          });
        }
      }
      // Handle legacy /management paths
      else if (pathSegments[0] === "management") {
        crumbs.push({
          path: `/${userRolePath}`,
          breadcrumbName: roleDisplayName,
        });
        crumbs.push({
          path: `/${userRolePath}/management`,
          breadcrumbName: "Management",
        });
      }

      setDynamicCrumbs(crumbs);
    };

    fetchDynamicData();
  }, [location.pathname, userRolePath, roleDisplayName]);

  // Convert breadcrumb items to Ant Design format
  const breadcrumbItems = dynamicCrumbs.map((crumb, index) => {
    const isLast = index === dynamicCrumbs.length - 1;

    return {
      key: index,
      title: isLast ? (
        <span style={{ color: "#666" }}>{crumb.breadcrumbName}</span>
      ) : (
        <Link
          to={crumb.path}
          style={{
            color: "#11418b",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
          onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
        >
          {crumb.breadcrumbName}
        </Link>
      ),
    };
  });

  return (
    <div style={{ marginBottom: 16 }}>
      <Breadcrumb
        items={breadcrumbItems}
        separator=">"
        style={{
          fontSize: "14px",
          padding: "8px 0",
        }}
      />
    </div>
  );
};

export default AppBreadcrumb;
