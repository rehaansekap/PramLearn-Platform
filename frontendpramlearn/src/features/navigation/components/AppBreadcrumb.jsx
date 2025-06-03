import React, { useEffect, useState } from "react";
import { Breadcrumb } from "antd";
import { Link, useLocation, matchPath } from "react-router-dom";
import api from "../../../api";

const breadcrumbNameMap = {
  "/": "Home",
  "/users": "User Management",
  "/classes": "Class Management",
  "/class/:classSlug": "Class Detail",
  "/subjects": "Subject Management",
  "/subject/:subjectSlug": "Subject Detail",
  "/material/:materialSlug": "Material Detail",
  "/management": "Management",
};

const AppBreadcrumb = () => {
  const location = useLocation();
  const fromManagement =
    location.state?.fromManagement ||
    new URLSearchParams(location.search).get("from") === "management";
  const [dynamicCrumbs, setDynamicCrumbs] = useState(null);

  useEffect(() => {
    const fetchBreadcrumbs = async () => {
      // Helper untuk prefix Management jika di /management
      const withManagementPrefix = (crumbs) => {
        if (fromManagement) {
          return [
            { path: "/", breadcrumbName: "Home" },
            { path: "/management", breadcrumbName: "Management" },
            ...crumbs,
          ];
        }
        return [{ path: "/", breadcrumbName: "Home" }, ...crumbs];
      };

      const managementSubjectMatch = matchPath(
        { path: "/management/subject/:subjectSlug", end: true },
        location.pathname
      );
      if (managementSubjectMatch) {
        const { subjectSlug } = managementSubjectMatch.params;
        try {
          const subjectRes = await api.get(`subjects/?slug=${subjectSlug}`);
          const subjectData = subjectRes.data.find(
            (s) => s.slug === subjectSlug
          );
          if (subjectData) {
            setDynamicCrumbs([
              { path: "/", breadcrumbName: "Home" },
              { path: "/management", breadcrumbName: "Management" },
              {
                path: `/management/${subjectSlug}`,
                breadcrumbName: `Subject Detail (${subjectData.name})`,
              },
            ]);
            return;
          }
        } catch {}
      }

      const managementClassMatch = matchPath(
        { path: "/management/class/:classSlug", end: true },
        location.pathname
      );
      if (managementClassMatch) {
        const { classSlug } = managementClassMatch.params;
        console.log("Breadcrumb received classSlug:", classSlug); // Log slug kelas
        try {
          const classRes = await api.get(`classes/?slug=${classSlug}`);
          const classData = classRes.data.find((c) => c.slug === classSlug);
          if (classData) {
            setDynamicCrumbs([
              { path: "/", breadcrumbName: "Home" },
              { path: "/management", breadcrumbName: "Management" },
              {
                path: `/management/${classSlug}`,
                breadcrumbName: `Class Detail (${classData.name})`,
              },
            ]);
            return;
          }
        } catch {}
      }

      // Material Detail
      const materialMatch = matchPath(
        { path: "/material/:materialSlug", end: true },
        location.pathname
      );
      if (materialMatch) {
        const { materialSlug } = materialMatch.params;
        try {
          const materialRes = await api.get(`materials/?slug=${materialSlug}`);
          const material = materialRes.data.find(
            (m) => m.slug === materialSlug
          );
          if (material && material.subject) {
            const subjectRes = await api.get(`subjects/${material.subject}/`);
            setDynamicCrumbs(
              withManagementPrefix([
                { path: "/management", breadcrumbName: "Management" },
                {
                  path: `/management/subject/${subjectRes.data.slug}`,
                  breadcrumbName: `Subject Detail (${subjectRes.data.name})`,
                },
                {
                  path: `/material/${materialSlug}`,
                  breadcrumbName: `Material Detail (${materialSlug})`,
                },
              ])
            );
            return;
          }
        } catch {}
      }

      // User Management (contoh, jika ada detail user)
      const userMatch = matchPath(
        { path: "/users/:userId", end: true },
        location.pathname
      );
      if (userMatch) {
        const { userId } = userMatch.params;
        setDynamicCrumbs(
          withManagementPrefix([
            { path: "/users", breadcrumbName: "User Management" },
            {
              path: `/users/${userId}`,
              breadcrumbName: `User Detail (${userId})`,
            },
          ])
        );
        return;
      }

      // Default: fallback ke path
      setDynamicCrumbs(null);
    };

    fetchBreadcrumbs();
  }, [location.pathname]);

  const toBreadcrumbItems = (crumbs) =>
    crumbs.map((bc, idx) => ({
      title:
        idx < crumbs.length - 1 ? (
          <Link to={bc.path}>{bc.breadcrumbName}</Link>
        ) : (
          bc.breadcrumbName
        ),
      key: bc.path,
    }));

  if (dynamicCrumbs) {
    return (
      <Breadcrumb
        style={{ margin: "16px 0" }}
        items={toBreadcrumbItems(dynamicCrumbs)}
      />
    );
  }

  // fallback: breadcrumb default
  const pathSnippets = location.pathname.split("/").filter((i) => i);
  let url = "";
  const breadcrumbs = [
    {
      path: "/",
      breadcrumbName: "Home",
    },
    ...pathSnippets.map((_, idx) => {
      url = `/${pathSnippets.slice(0, idx + 1).join("/")}`;
      let matchedKey = Object.keys(breadcrumbNameMap).find((key) =>
        matchPath({ path: key, end: true }, url)
      );
      let breadcrumbName = matchedKey
        ? breadcrumbNameMap[matchedKey]
        : url.replace("/", "");
      if (matchedKey && matchedKey.includes(":")) {
        breadcrumbName += ` (${pathSnippets[idx]})`;
      }
      return {
        path: url,
        breadcrumbName,
      };
    }),
  ];

  return (
    <Breadcrumb
      style={{ margin: "16px 0" }}
      items={toBreadcrumbItems(breadcrumbs)}
    />
  );
};

export default AppBreadcrumb;
