import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import { Tabs, Divider, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { AuthContext } from "../../context/AuthContext";

// Import components
import MaterialDetail from "./components/MaterialDetail";
import AssignmentsTab from "../assignment-management/AssignmentsTab";
import GroupsTab from "./components/GroupsTab";
import QuizzesTab from "../quiz-management/QuizzesTab";
import StudentsTab from "./components/StudentsTab";
import AssignmentModal from "../assignment-management/components/AssignmentModal";
import QuizModal from "../quiz-management/components/QuizModal";

// Import hooks
import useMaterialData from "./hooks/useMaterialData";
import useAssignmentManagement from "./hooks/useAssignmentManagement";
import useGroupData from "./hooks/useGroupData";
import useClassStudents from "../class-management/hooks/useClassStudents";
import useModalManagement from "./hooks/useModalManagement";
import useQuizManagement from "./hooks/useQuizManagement";
import useAssignQuizToGroups from "../quiz-management/hooks/useAssignQuizToGroups";
import useGroupQuizAssignments from "../quiz-management/hooks/useGroupQuizAssignments";

// Import CSS
import "./style/material.css";

const { TabPane } = Tabs;

const MaterialDetailPage = () => {
  const { materialSlug } = useParams();
  const { token } = useContext(AuthContext);
  const { assignQuizToGroups } = useAssignQuizToGroups();

  // Custom hooks
  const { materialId, materialDetail, classId } = useMaterialData(materialSlug);
  const {
    classStudents,
    studentDetails: studentFullDetails,
    loading: studentsLoading,
  } = useClassStudents(classId);

  // Update untuk menggunakan loading dari useGroupData
  const {
    groups,
    groupMembers,
    fetchGroups,
    loading: groupsLoading,
    membersLoading,
  } = useGroupData(materialId);
  const { groupQuizAssignments, refetch: refetchGroupQuizAssignments } =
    useGroupQuizAssignments(materialId);

  const {
    quizModalOpen,
    assignmentModalOpen,
    openQuizModal,
    closeQuizModal,
    openAssignmentModal,
    closeAssignmentModal,
  } = useModalManagement();

  const {
    quizzes,
    editingQuiz,
    setEditingQuiz,
    handleDeleteQuiz,
    handleEditQuiz,
    handleSubmitQuiz,
    loading: quizzesLoading,
  } = useQuizManagement(materialId);

  // Assignment management
  const {
    assignments,
    editingAssignment,
    setEditingAssignment,
    selectedAssignment,
    setSelectedAssignment,
    assignmentSubmissions,
    assignmentQuestions,
    loading: assignmentsLoading,
    submissionsLoading,
    questionsLoading,
    handleDeleteAssignment,
    handleEditAssignment,
    handleSelectAssignment,
    handleSuccessAssignment,
  } = useAssignmentManagement(materialId);

  // Student details computation
  const studentDetails = classStudents?.map((s) => s.student) || [];

  const onQuizSubmit = async (formData) => {
    try {
      await handleSubmitQuiz(formData, groups, assignQuizToGroups);
      await refetchGroupQuizAssignments();
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  // Assignment handlers
  const handleCreateAssignment = () => {
    setEditingAssignment(null);
    openAssignmentModal();
  };

  const handleEditAssignmentClick = (assignment) => {
    handleEditAssignment(assignment);
    openAssignmentModal();
  };

  const handleAssignmentSuccess = () => {
    handleSuccessAssignment();
    closeAssignmentModal();
  };

  // Quiz handlers
  const handleCreateQuiz = () => {
    setEditingQuiz(null);
    openQuizModal();
  };

  const handleEditQuizClick = (quiz) => {
    handleEditQuiz(quiz);
    openQuizModal();
  };

  const handleQuizSuccess = () => {
    closeQuizModal();
    setEditingQuiz(null);
    refetchGroupQuizAssignments();
  };

  const handleQuizModalClose = () => {
    closeQuizModal();
    setEditingQuiz(null);
  };

  const handleViewAssignment = (assignment) => {
    setSelectedAssignment(assignment);
  };

  const handleViewRanking = (quiz) => {
  };

  // Loading state untuk MaterialDetail
  const materialDetailLoading = !materialId || !materialDetail;
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  if (materialDetailLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8 bg-white rounded-xl shadow-lg">
        <div className="flex justify-center items-center py-10">
          <Spin indicator={antIcon} />
          <span className="ml-3 text-gray-500">Memuat data material...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-blue-900 font-bold text-left material-detailpage-title">
        {materialDetail.title}
      </h1>
      <Divider className="my-2 border-gray-200" />

      <MaterialDetail
        materialId={materialId}
        className="material-detail-container"
      />

      <div className="bg-white rounded-xl shadow-lg mt-8 p-6">
        {/* Tambahkan className custom untuk styling tab */}
        <Tabs
          defaultActiveKey="1"
          className="material-detail-tabs"
          size="large"
          type="line"
          tabBarStyle={{
            marginBottom: "32px",
            borderBottom: "2px solid #f0f0f0",
          }}
        >
          {/* TAB 1: SISWA - DEFAULT ACTIVE (PERTAMA) */}
          <TabPane tab="Siswa" key="1">
            <StudentsTab
              studentDetails={studentFullDetails}
              classId={classId}
              loading={studentsLoading}
              materialId={materialId}
            />
          </TabPane>

          {/* TAB 2: KELOMPOK (KEDUA) */}
          <TabPane tab="Kelompok" key="2">
            <GroupsTab
              groups={groups}
              groupMembers={groupMembers}
              quizzes={quizzes}
              loading={groupsLoading || membersLoading}
              groupQuizAssignments={groupQuizAssignments}
              studentDetails={studentFullDetails}
              materialId={materialId}
              onGroupsChanged={fetchGroups}
            />
          </TabPane>

          {/* TAB 3: QUIZ (KETIGA) */}
          <TabPane tab="Quiz" key="3">
            <QuizzesTab
              quizzes={quizzes}
              selectedQuiz={editingQuiz}
              onCreateQuiz={handleCreateQuiz}
              onEditQuiz={handleEditQuizClick}
              onDeleteQuiz={handleDeleteQuiz}
              onSelectQuiz={setEditingQuiz}
              onViewRanking={handleViewRanking}
              loading={quizzesLoading}
              materialId={materialId}
              groupQuizAssignments={groupQuizAssignments}
              refetchGroupQuizAssignments={refetchGroupQuizAssignments}
            />
          </TabPane>

          {/* TAB 4: ASSIGNMENT (KEEMPAT) */}
          <TabPane tab="Assignment" key="4">
            <AssignmentsTab
              assignments={assignments}
              selectedAssignment={selectedAssignment}
              assignmentSubmissions={assignmentSubmissions}
              assignmentQuestions={assignmentQuestions}
              studentDetails={studentFullDetails}
              onCreateAssignment={handleCreateAssignment}
              onEditAssignment={handleEditAssignmentClick}
              onDeleteAssignment={handleDeleteAssignment}
              onSelectAssignment={handleSelectAssignment}
              onViewAssignment={handleViewAssignment}
              loading={assignmentsLoading}
              submissionsLoading={submissionsLoading}
            />
          </TabPane>
        </Tabs>

        <QuizModal
          open={quizModalOpen}
          onClose={handleQuizModalClose}
          onSubmit={async (formData) => {
            await onQuizSubmit(formData);
            await refetchGroupQuizAssignments();
          }}
          materialId={materialId}
          classId={classId}
          editingQuiz={editingQuiz}
        />
        <AssignmentModal
          open={assignmentModalOpen}
          onClose={() => {
            closeAssignmentModal();
            setEditingAssignment(null);
          }}
          materialId={materialId}
          editingAssignment={editingAssignment}
          onSuccess={handleAssignmentSuccess}
        />
      </div>
    </div>
  );
};

export default MaterialDetailPage;
