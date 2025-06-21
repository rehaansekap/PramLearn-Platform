import React, { useState } from "react";
import { useParams } from "react-router-dom";

import useStudentMaterialAccess from "./hooks/useStudentMaterialAccess";
import useSubjectData from "./hooks/useSubjectData";
import MaterialHeader from "./components/layout/MaterialHeader";
import MaterialBreadcrumb from "./components/layout/MaterialBreadcrumb";
import MaterialContentTabs from "./components/layout/MaterialContentTabs";
import MaterialLoadingState from "./components/layout/MaterialLoadingState";
import MaterialErrorState from "./components/layout/MaterialErrorState";
import MaterialProgressTracker from "./components/progress/MaterialProgressTracker";

const StudentMaterialViewer = () => {
  const { materialSlug } = useParams();
  const {
    material,
    progress,
    loading,
    error,
    updateProgress,
    recordActivity,
    recordQuizCompletion,
    recordAssignmentSubmission,
    completedActivities,
    isActivityCompleted,
  } = useStudentMaterialAccess(materialSlug);

  const { subjectData } = useSubjectData(material?.subject);
  const [activeTab, setActiveTab] = useState("1");

  if (loading) return <MaterialLoadingState />;
  if (error || !material) return <MaterialErrorState error={error} />;

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px 16px",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      {/* <MaterialBreadcrumb materialTitle={material.title} /> */}

      <MaterialHeader
        material={material}
        progress={progress}
        subjectData={subjectData}
      />

      <MaterialContentTabs
        material={material}
        progress={progress}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        updateProgress={updateProgress}
        recordActivity={recordActivity}
        recordQuizCompletion={recordQuizCompletion}
        recordAssignmentSubmission={recordAssignmentSubmission}
        completedActivities={completedActivities}
      />

      <MaterialProgressTracker
        progress={progress}
        updateProgress={updateProgress}
        isActive={true}
        material={material}
        isActivityCompleted={isActivityCompleted}
      />
    </div>
  );
};

export default StudentMaterialViewer;
