import React, { useEffect, useState } from "react";
import { Breadcrumb } from "antd";
import { Link, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  EditOutlined,
  TrophyOutlined,
  TeamOutlined,
  BarChartOutlined,
  BellOutlined,
  FormOutlined,
} from "@ant-design/icons";
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
          breadcrumbName: "Dashboard",
          icon: <HomeOutlined />,
        },
      ];

      // Handle material routes: /student/materials/:materialSlug
      if (pathSnippets[1] === "materials" && pathSnippets[2]) {
        const materialSlug = pathSnippets[2];
        const arcsSlug = pathSnippets[3];
        const isResultsPage = pathSnippets[4] === "results";

        try {
          const materialRes = await api.get(`materials/?slug=${materialSlug}`);
          const material = Array.isArray(materialRes.data)
            ? materialRes.data.find((m) => m.slug === materialSlug)
            : materialRes.data;

          if (material && material.subject) {
            const subjectRes = await api.get(`subjects/${material.subject}/`);

            const crumbs = [
              ...baseCrumbs,
              {
                path: "/student/subjects",
                breadcrumbName: "Mata Pelajaran",
                icon: <BookOutlined />,
              },
              {
                path: `/student/subjects/${subjectRes.data.slug}`,
                breadcrumbName: subjectRes.data.name,
              },
              {
                path: `/student/materials/${materialSlug}`,
                breadcrumbName: material.title,
                icon: <FileTextOutlined />,
              },
            ];

            if (arcsSlug && isResultsPage) {
              setDynamicCrumbs([
                ...baseCrumbs,
                {
                  path: "/student/subjects",
                  breadcrumbName: "Mata Pelajaran",
                  icon: <BookOutlined />,
                },
                {
                  path: `/student/subjects/${subjectRes.data.slug}`,
                  breadcrumbName: subjectRes.data.name,
                },
                {
                  path: `/student/materials/${materialSlug}`,
                  breadcrumbName: material.title,
                  icon: <FileTextOutlined />,
                },
                {
                  path: location.pathname,
                  breadcrumbName: "Hasil Kuesioner",
                  icon: <TrophyOutlined style={{ color: "#11418b" }} />,
                },
              ]);
              return;
            }

            // Handle ARCS routes
            if (arcsSlug) {
              // Fetch ARCS questionnaire data
              try {
                const arcsRes = await api.get(
                  `/student/materials/${materialSlug}/arcs/`
                );
                const arcsQuestionnaire = arcsRes.data.find(
                  (arcs) => arcs.slug === arcsSlug
                );

                if (arcsQuestionnaire) {
                  crumbs.push({
                    path: `/student/materials/${materialSlug}/${arcsSlug}`,
                    breadcrumbName: arcsQuestionnaire.title,
                    icon: <FormOutlined />,
                  });

                  if (isResultsPage) {
                    crumbs.push({
                      path: location.pathname,
                      breadcrumbName: "Hasil Kuesioner",
                      icon: <TrophyOutlined />,
                    });
                  }
                } else {
                  // Fallback jika ARCS tidak ditemukan
                  crumbs.push({
                    path: `/student/materials/${materialSlug}/${arcsSlug}`,
                    breadcrumbName: "Kuesioner ARCS",
                    icon: <FormOutlined />,
                  });

                  if (isResultsPage) {
                    crumbs.push({
                      path: location.pathname,
                      breadcrumbName: "Hasil Kuesioner",
                      icon: <TrophyOutlined />,
                    });
                  }
                }
              } catch (error) {
                console.error(
                  "Failed to fetch ARCS questionnaire data:",
                  error
                );
                // Fallback untuk ARCS
                crumbs.push({
                  path: `/student/materials/${materialSlug}/${arcsSlug}`,
                  breadcrumbName: "Kuesioner ARCS",
                  icon: <FormOutlined />,
                });

                if (isResultsPage) {
                  crumbs.push({
                    path: location.pathname,
                    breadcrumbName: "Hasil Kuesioner",
                    icon: <TrophyOutlined />,
                  });
                }
              }
            }

            setDynamicCrumbs(crumbs);
            return;
          }
        } catch (error) {
          console.error("Failed to fetch material/subject data:", error);
        }

        // Fallback jika gagal fetch
        const fallbackCrumbs = [
          ...baseCrumbs,
          {
            path: "/student/subjects",
            breadcrumbName: "Mata Pelajaran",
            icon: <BookOutlined />,
          },
          {
            path: `/student/materials/${materialSlug}`,
            breadcrumbName: "Materi",
            icon: <FileTextOutlined />,
          },
        ];

        if (arcsSlug) {
          fallbackCrumbs.push({
            path: `/student/materials/${materialSlug}/${arcsSlug}`,
            breadcrumbName: "Kuesioner ARCS",
            icon: <FormOutlined />,
          });

          if (isResultsPage) {
            fallbackCrumbs.push({
              path: location.pathname,
              breadcrumbName: "Hasil Kuesioner",
              icon: <TrophyOutlined />,
            });
          }
        }

        setDynamicCrumbs(fallbackCrumbs);
        return;
      }

      // Handle subjects routes: /student/subjects
      if (pathSnippets[1] === "subjects") {
        if (pathSnippets.length === 2) {
          setDynamicCrumbs([
            ...baseCrumbs,
            {
              path: "/student/subjects",
              breadcrumbName: "Mata Pelajaran",
              icon: <BookOutlined />,
            },
          ]);
        } else if (pathSnippets[2]) {
          // Dynamic subject detail
          try {
            const subjectRes = await api.get(`subjects/${pathSnippets[2]}/`);
            setDynamicCrumbs([
              ...baseCrumbs,
              {
                path: "/student/subjects",
                breadcrumbName: "Mata Pelajaran",
                icon: <BookOutlined />,
              },
              {
                path: `/student/subjects/${pathSnippets[2]}`,
                breadcrumbName: subjectRes.data.name,
              },
            ]);
          } catch {
            setDynamicCrumbs([
              ...baseCrumbs,
              {
                path: "/student/subjects",
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

      // Handle assignments routes: /student/assignments
      if (pathSnippets[1] === "assignments") {
        if (pathSnippets.length === 2) {
          setDynamicCrumbs([
            ...baseCrumbs,
            {
              path: "/student/assignments",
              breadcrumbName: "Tugas Saya",
              icon: <EditOutlined />,
            },
          ]);
        } else if (pathSnippets[2]) {
          const assignmentSlug = pathSnippets[2];
          const isResultsPage = pathSnippets[3] === "results";

          try {
            // Fetch assignment data
            const assignmentsRes = await api.get(
              "/student/assignments/available/"
            );
            const assignment = assignmentsRes.data.find(
              (a) =>
                a.slug === assignmentSlug ||
                a.title
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "") === assignmentSlug
            );

            if (assignment) {
              const crumbs = [
                ...baseCrumbs,
                {
                  path: "/student/assignments",
                  breadcrumbName: "Tugas Saya",
                  icon: <EditOutlined />,
                },
                {
                  path: `/student/assignments/${assignmentSlug}`,
                  breadcrumbName: assignment.title,
                },
              ];

              if (isResultsPage) {
                crumbs.push({
                  path: location.pathname,
                  breadcrumbName: "Riwayat Pengumpulan",
                  icon: <TrophyOutlined />,
                });
              }

              setDynamicCrumbs(crumbs);
              return;
            }
          } catch (error) {
            console.error("Failed to fetch assignment data:", error);
          }

          // Fallback
          const crumbs = [
            ...baseCrumbs,
            {
              path: "/student/assignments",
              breadcrumbName: "Tugas Saya",
              icon: <EditOutlined />,
            },
            {
              path: location.pathname,
              breadcrumbName: isResultsPage
                ? "Riwayat Pengumpulan"
                : "Detail Tugas",
            },
          ];
          setDynamicCrumbs(crumbs);
        }
        return;
      }

      // Handle assessments/quiz routes: /student/assessments, /student/quiz/:quizSlug
      if (pathSnippets[1] === "assessments") {
        setDynamicCrumbs([
          ...baseCrumbs,
          {
            path: "/student/assessments",
            breadcrumbName: "Kuis & Penilaian",
            icon: <QuestionCircleOutlined />,
          },
        ]);
        return;
      }

      // Handle quiz routes: /student/quiz/:quizSlug
      if (pathSnippets[1] === "quiz" && pathSnippets[2]) {
        const quizSlug = pathSnippets[2];
        const isResultsPage = pathSnippets[3] === "results";

        try {
          // Fetch quiz data
          const quizRes = await api.get(`/student/quiz/${quizSlug}/`);
          const quiz = quizRes.data;

          const crumbs = [
            ...baseCrumbs,
            {
              path: "/student/assessments",
              breadcrumbName: "Kuis & Penilaian",
              icon: <QuestionCircleOutlined />,
            },
            {
              path: `/student/quiz/${quizSlug}`,
              breadcrumbName: quiz.title || "Quiz",
            },
          ];

          if (isResultsPage) {
            crumbs.push({
              path: location.pathname,
              breadcrumbName: "Hasil Kuis",
              icon: <TrophyOutlined />,
            });
          }

          setDynamicCrumbs(crumbs);
          return;
        } catch (error) {
          console.error("Failed to fetch quiz data:", error);
        }

        // Fallback
        const crumbs = [
          ...baseCrumbs,
          {
            path: "/student/assessments",
            breadcrumbName: "Kuis & Penilaian",
            icon: <QuestionCircleOutlined />,
          },
          {
            path: location.pathname,
            breadcrumbName: isResultsPage ? "Hasil Kuis" : "Detail Kuis",
          },
        ];
        setDynamicCrumbs(crumbs);
        return;
      }

      // Handle group quiz routes: /student/group-quiz/:quizSlug
      if (pathSnippets[1] === "group-quiz" && pathSnippets[2]) {
        const quizSlug = pathSnippets[2];
        const isResultsPage = pathSnippets[3] === "results";

        try {
          // Fetch group quiz data
          const quizRes = await api.get(`/student/group-quiz/${quizSlug}/`);
          const quiz = quizRes.data;

          const crumbs = [
            ...baseCrumbs,
            {
              path: "/student/assessments",
              breadcrumbName: "Kuis & Penilaian",
              icon: <QuestionCircleOutlined />,
            },
            {
              path: `/student/group-quiz/${quizSlug}`,
              breadcrumbName: `${quiz.title || "Group Quiz"} (Kelompok)`,
              icon: <TeamOutlined />,
            },
          ];

          if (isResultsPage) {
            crumbs.push({
              path: location.pathname,
              breadcrumbName: "Hasil Kuis Kelompok",
              icon: <TrophyOutlined />,
            });
          }

          setDynamicCrumbs(crumbs);
          return;
        } catch (error) {
          console.error("Failed to fetch group quiz data:", error);
        }

        // Fallback
        const crumbs = [
          ...baseCrumbs,
          {
            path: "/student/assessments",
            breadcrumbName: "Kuis & Penilaian",
            icon: <QuestionCircleOutlined />,
          },
          {
            path: location.pathname,
            breadcrumbName: isResultsPage
              ? "Hasil Kuis Kelompok"
              : "Kuis Kelompok",
            icon: <TeamOutlined />,
          },
        ];
        setDynamicCrumbs(crumbs);
        return;
      }

      // Handle other static routes
      const routeMap = {
        grades: {
          breadcrumbName: "Nilai Saya",
          icon: <TrophyOutlined />,
        },
        progress: {
          breadcrumbName: "Progress Belajar",
          icon: <BarChartOutlined />,
        },
        group: {
          breadcrumbName: "Kelompok Saya",
          icon: <TeamOutlined />,
        },
        analytics: {
          breadcrumbName: "Analitik",
          icon: <BarChartOutlined />,
        },
        notifications: {
          breadcrumbName: "Notifikasi",
          icon: <BellOutlined />,
        },
      };

      if (pathSnippets[1] && routeMap[pathSnippets[1]]) {
        const route = routeMap[pathSnippets[1]];
        setDynamicCrumbs([
          ...baseCrumbs,
          {
            path: `/student/${pathSnippets[1]}`,
            breadcrumbName: route.breadcrumbName,
            icon: route.icon,
          },
        ]);
        return;
      }

      // Default fallback - hanya dashboard
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
