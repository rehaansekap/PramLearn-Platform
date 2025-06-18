import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spin, Empty, Tabs, Statistic, Progress } from "antd";
import {
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

const { TabPane } = Tabs;

const GradeChart = ({ grades, subjects = [], analytics, loading, compact = false }) => {
  // Tambahkan state untuk subjects yang sudah diproses
  const [processedSubjects, setProcessedSubjects] = useState([]);

  // Generate subjects dari grades jika subjects kosong
  const getSubjectsToUse = () => {
    if (subjects && subjects.length > 0) {
      console.log("✅ Using provided subjects:", subjects);
      return subjects;
    }

    // Generate dari grades
    const uniqueSubjects = [
      ...new Set(grades?.map((g) => g.subject_name) || []),
    ];
    const generatedSubjects = uniqueSubjects.map((name) => ({
      id: name,
      name: name,
    }));

    console.log("🔄 Generated subjects from grades:", generatedSubjects);
    return generatedSubjects;
  };

  const subjectsToUse = getSubjectsToUse();

  useEffect(() => {
    console.log("🔍 GradeChart Debug:", {
      grades: grades?.length || 0,
      subjects: subjects?.length || 0,
      analytics: analytics,
      loading: loading,
      gradesStructure: grades?.[0],
      subjectsStructure: subjects?.[0],
    });
  }, [grades, subjects, analytics, loading]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Spin size="large" tip="Loading analytics..." />
      </div>
    );
  }

  // Add fallback for empty analytics
  if (!analytics && (!grades || grades.length === 0)) {
    return (
      <Empty
        description="No analytics data available yet"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  useEffect(() => {
    console.log("🔍 GradeChart Debug Detail:", {
      grades: {
        count: grades?.length || 0,
        sample: grades?.[0],
        subjects_in_grades: [
          ...new Set(grades?.map((g) => g.subject_name) || []),
        ],
      },
      subjects: {
        count: subjects?.length || 0,
        sample: subjects?.[0],
        list: subjects?.map((s) => s.name || s) || [],
      },
      subjectsToUse: {
        count: subjectsToUse?.length || 0,
        list: subjectsToUse?.map((s) => s.name || s) || [],
      },
      loading,
    });
  }, [grades, subjects, subjectsToUse, loading]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Spin size="large" tip="Loading chart..." />
      </div>
    );
  }

  if (!grades || grades.length === 0) {
    return <Empty description="No grade data available" />;
  }

  // Calculate stats
  const quizGrades = grades.filter((g) => g.type === "quiz" && g.grade);
  const assignmentGrades = grades.filter(
    (g) => g.type === "assignment" && g.grade
  );

  const quizAvg =
    quizGrades.length > 0
      ? quizGrades.reduce((sum, g) => sum + g.grade, 0) / quizGrades.length
      : 0;

  const assignmentAvg =
    assignmentGrades.length > 0
      ? assignmentGrades.reduce((sum, g) => sum + g.grade, 0) /
        assignmentGrades.length
      : 0;

  const overallAvg =
    grades.length > 0
      ? grades.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.length
      : 0;

  // Simple trend visualization using progress bars
  const getGradeColor = (score) => {
    if (score >= 80) return "#52c41a";
    if (score >= 60) return "#faad14";
    return "#ff4d4f";
  };

  // Tambahkan debugging
  useEffect(() => {
    console.log("🔍 GradeChart Debug:", {
      grades: grades?.length || 0,
      subjects: subjects?.length || 0,
      gradesStructure: grades?.[0],
      subjectsStructure: subjects?.[0],
    });
  }, [grades, subjects]);

  if (compact) {
    // Compact version for dashboard
    return (
      <div style={{ padding: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: getGradeColor(overallAvg),
                }}
              >
                {overallAvg.toFixed(1)}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>Overall</div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: getGradeColor(quizAvg),
                }}
              >
                {quizAvg.toFixed(1)}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>Quiz</div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: getGradeColor(assignmentAvg),
                }}
              >
                {assignmentAvg.toFixed(1)}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>Assignment</div>
            </div>
          </Col>
        </Row>

        <div style={{ marginTop: 16 }}>
          <Progress
            percent={overallAvg}
            strokeColor={getGradeColor(overallAvg)}
            showInfo={false}
          />
        </div>
      </div>
    );
  }

  // Full version with tabs
  return (
    <Tabs defaultActiveKey="overview" type="card">
      <TabPane
        tab={
          <span>
            <LineChartOutlined />
            Overview
          </span>
        }
        key="overview"
      >
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card size="small" style={{ textAlign: "center" }}>
              <Statistic
                title="Quiz Average"
                value={quizAvg}
                precision={1}
                suffix="/100"
                valueStyle={{ color: "#1890ff" }}
              />
              <Progress
                percent={quizAvg}
                strokeColor="#1890ff"
                showInfo={false}
                size="small"
                style={{ marginTop: 8 }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" style={{ textAlign: "center" }}>
              <Statistic
                title="Assignment Average"
                value={assignmentAvg}
                precision={1}
                suffix="/100"
                valueStyle={{ color: "#52c41a" }}
              />
              <Progress
                percent={assignmentAvg}
                strokeColor="#52c41a"
                showInfo={false}
                size="small"
                style={{ marginTop: 8 }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" style={{ textAlign: "center" }}>
              <Statistic
                title="Overall Average"
                value={overallAvg}
                precision={1}
                suffix="/100"
                valueStyle={{ color: "#722ed1" }}
              />
              <Progress
                percent={overallAvg}
                strokeColor="#722ed1"
                showInfo={false}
                size="small"
                style={{ marginTop: 8 }}
              />
            </Card>
          </Col>
        </Row>

        {/* Recent Grades Timeline */}
        <Card title="Recent Grades" size="small">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {grades.slice(0, 5).map((grade, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff",
                  borderRadius: 4,
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{grade.title}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {grade.subject_name} • {grade.type}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontWeight: "bold",
                      color: getGradeColor(grade.grade),
                      fontSize: 16,
                    }}
                  >
                    {grade.grade?.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {new Date(grade.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </TabPane>

      <TabPane
        tab={
          <span>
            <BarChartOutlined />
            Subject Performance
          </span>
        }
        key="subjects"
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" tip="Loading subject performance..." />
          </div>
        ) : subjectsToUse.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Empty
              description="No subjects data available"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            <p style={{ color: "#666", marginTop: 16 }}>
              Subjects count: {subjects.length}
              <br />
              Grades count: {grades?.length || 0}
              <br />
              Available subjects from grades:{" "}
              {[...new Set(grades?.map((g) => g.subject_name) || [])].join(
                ", "
              )}
            </p>
          </div>
        ) : (
          <Row gutter={16}>
            {subjectsToUse.map((subject) => {
              const subjectGrades = grades.filter(
                (g) => g.subject_name === (subject.name || subject)
              );

              if (subjectGrades.length === 0) {
                console.log(
                  `⚠️ No grades found for subject: ${subject.name || subject}`
                );
                return null;
              }

              const avgScore =
                subjectGrades.reduce((sum, g) => sum + (g.grade || 0), 0) /
                subjectGrades.length;

              console.log(
                `📊 Subject: ${
                  subject.name || subject
                }, Avg: ${avgScore}, Count: ${subjectGrades.length}`
              );

              return (
                <Col
                  xs={24}
                  sm={12}
                  md={8}
                  key={subject.id || subject}
                  style={{ marginBottom: 16 }}
                >
                  <Card size="small">
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>
                        {subject.name || subject}
                      </div>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        {subjectGrades.length} assessments
                      </div>
                    </div>

                    <div style={{ textAlign: "center", marginBottom: 12 }}>
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: "bold",
                          color: getGradeColor(avgScore),
                        }}
                      >
                        {avgScore.toFixed(1)}
                      </div>
                    </div>

                    <Progress
                      percent={avgScore}
                      strokeColor={getGradeColor(avgScore)}
                      showInfo={false}
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </TabPane>

      <TabPane
        tab={
          <span>
            <PieChartOutlined />
            Grade Distribution
          </span>
        }
        key="distribution"
      >
        <Card title="Grade Distribution Analysis">
          <Row
            gutter={16}
            style={{
              // make it center
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            {["A", "B", "C", "D", "E"].map((letter) => {
              const count = grades.filter((g) => {
                const score = g.grade || 0;
                if (letter === "A") return score >= 90;
                if (letter === "B") return score >= 80 && score < 90;
                if (letter === "C") return score >= 70 && score < 80;
                if (letter === "D") return score >= 60 && score < 70;
                return score < 60;
              }).length;

              const percentage =
                grades.length > 0 ? (count / grades.length) * 100 : 0;

              return (
                <Col
                  xs={24}
                  sm={8}
                  md={4}
                  key={letter}
                  style={{ marginBottom: 16 }}
                >
                  <Card size="small" style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: 32,
                        fontWeight: "bold",
                        marginBottom: 8,
                      }}
                    >
                      {count}
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color:
                          letter === "A"
                            ? "#52c41a"
                            : letter === "B"
                            ? "#1890ff"
                            : letter === "C"
                            ? "#faad14"
                            : "#ff4d4f",
                        marginBottom: 8,
                      }}
                    >
                      Grade {letter}
                    </div>
                    <Progress
                      percent={percentage}
                      size="small"
                      showInfo={false}
                      strokeColor={
                        letter === "A"
                          ? "#52c41a"
                          : letter === "B"
                          ? "#1890ff"
                          : letter === "C"
                          ? "#faad14"
                          : "#ff4d4f"
                      }
                    />
                    <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                      {percentage.toFixed(1)}%
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Card>
      </TabPane>
    </Tabs>
  );
};

export default GradeChart;
