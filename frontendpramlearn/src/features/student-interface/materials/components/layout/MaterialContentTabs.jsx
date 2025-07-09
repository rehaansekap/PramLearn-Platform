import React from "react";
import { Card, Tabs, Space, Tag } from "antd";
import {
  FileTextOutlined,
  QuestionCircleOutlined,
  PlayCircleOutlined,
  EditOutlined,
  BookOutlined,
  FormOutlined,
} from "@ant-design/icons";

import StudentPDFViewer from "../pdfviewer/StudentPDFViewer";
import StudentVideoPlayer from "../videoplayer/StudentVideoPlayer";
import MaterialQuizList from "../MaterialQuizList";
import MaterialAssignmentList from "../MaterialAssignmentList";
import StudentARCSTab from "../arcs/StudentARCSTab";
import GoogleFormsTab from "./GoogleFormsTab";

const { TabPane } = Tabs;

const MaterialContentTabs = ({
  material,
  progress,
  activeTab,
  setActiveTab,
  updateProgress,
  recordActivity,
  recordQuizCompletion,
  recordAssignmentSubmission,
  completedActivities,
  arcsQuestionnaires = [],
  materialSlug,
}) => {
  const hasPDFs = material.pdf_files?.length > 0;
  const hasVideos = material.youtube_videos?.some((v) => v.url);
  // const hasGoogleForms =
  //   material.google_form_embed_arcs_awal ||
  //   material.google_form_embed_arcs_akhir;
  const hasActiveARCS = arcsQuestionnaires.some((q) => !q.is_completed);
  const completedARCS = arcsQuestionnaires.filter((q) => q.is_completed).length;
  const totalARCS = arcsQuestionnaires.length;

  return (
    <Card
      style={{
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        overflow: "hidden",
      }}
      bodyStyle={{ padding: 0 }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        size="large"
        tabBarStyle={{
          margin: 0,
          background: "#fafafa",
          borderBottom: "1px solid #f0f0f0",
        }}
        style={{ minHeight: "60vh" }}
      >
        {hasPDFs && (
          <TabPane
            tab={
              <Space>
                <FileTextOutlined />
                <span>Dokumen PDF</span>
                <Tag color="blue">{material.pdf_files.length}</Tag>
              </Space>
            }
            key="1"
          >
            <div style={{ padding: "24px" }}>
              <StudentPDFViewer
                pdfFiles={material.pdf_files}
                progress={progress}
                updateProgress={updateProgress}
                onActivity={recordActivity}
              />
            </div>
          </TabPane>
        )}

        {hasVideos && (
          <TabPane
            tab={
              <Space>
                <PlayCircleOutlined />
                <span>Video Pembelajaran</span>
                <Tag color="green">
                  {material.youtube_videos.filter((v) => v.url).length}
                </Tag>
              </Space>
            }
            key="2"
          >
            <div style={{ padding: "24px" }}>
              <StudentVideoPlayer
                youtubeVideos={material.youtube_videos}
                progress={progress}
                updateProgress={updateProgress}
                onActivity={recordActivity}
              />
            </div>
          </TabPane>
        )}

        <TabPane
          tab={
            <Space>
              <BookOutlined />
              <span>Kuis</span>
              <Tag color="purple">{(material.quizzes || []).length}</Tag>
            </Space>
          }
          key="quiz"
        >
          <div style={{ padding: "24px" }}>
            <MaterialQuizList
              quizzes={material.quizzes || []}
              material={material}
              recordQuizCompletion={recordQuizCompletion}
              completedActivities={completedActivities}
            />
          </div>
        </TabPane>

        <TabPane
          tab={
            <Space>
              <FileTextOutlined />
              <span>Tugas</span>
              <Tag color="orange">{(material.assignments || []).length}</Tag>
            </Space>
          }
          key="assignment"
        >
          <div style={{ padding: "24px" }}>
            <MaterialAssignmentList
              assignments={material.assignments || []}
              material={material}
              recordAssignmentSubmission={recordAssignmentSubmission}
              completedActivities={completedActivities}
            />
          </div>
        </TabPane>

        <TabPane
          tab={
            <Space>
              <FormOutlined />
              <span>ARCS</span>
              {totalARCS > 0 && (
                <Tag color={hasActiveARCS ? "processing" : "success"}>
                  {completedARCS}/{totalARCS}
                </Tag>
              )}
            </Space>
          }
          key="arcs"
        >
          <StudentARCSTab materialSlug={materialSlug} />
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default MaterialContentTabs;
