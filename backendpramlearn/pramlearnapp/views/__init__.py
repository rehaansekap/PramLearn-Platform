from pramlearnapp.views.admin.userViewSet import UserViewSet, RegisterView
from pramlearnapp.views.admin.roleViewSet import RoleViewSet
from pramlearnapp.views.admin.authView import LoginView

from pramlearnapp.views.student.availableStudentView import AvailableStudentListView, AvailableAndRelatedStudentListView
from pramlearnapp.views.student.classStudentViewSet import ClassStudentViewSet, ClassStudentDetail
from pramlearnapp.views.student.studentMotivationProfileView import StudentMotivationProfileView, UploadARCSCSVView
from pramlearnapp.views.student.studentViewSet import StudentViewSet
from pramlearnapp.views.student.attendanceView import MaterialAttendanceListView, update_attendance, bulk_create_attendance
from pramlearnapp.views.student.studentAssignmentViewSet import (
    StudentAvailableAssignmentsView, StudentAssignmentQuestionsView,
    StudentAssignmentDraftView, StudentAssignmentSubmitView,
    StudentAssignmentSubmissionsView, StudentAssignmentBySlugView
)
from pramlearnapp.views.student.studentUpcomingDeadlinesView import StudentUpcomingDeadlinesView
from pramlearnapp.views.student.studentQuickActionsView import StudentQuickActionsView
from pramlearnapp.views.student.groupQuizView import (
    GroupQuizDetailView, SubmitGroupQuizView, GroupQuizResultsView, SaveGroupQuizAnswerView
)
from pramlearnapp.views.student.scheduleViewSet import ScheduleViewSet
from pramlearnapp.views.student.studentActivityViewSet import StudentActivityViewSet
from pramlearnapp.views.student.materialProgressView import StudentMaterialProgressView, StudentMaterialBookmarkView, StudentMaterialAccessView, StudentMaterialActivityView
# from pramlearnapp.views.student.studentGradesView import (
#     StudentGradesView, StudentGradeAnalyticsView,
#     QuizAttemptReviewView, AssignmentSubmissionFeedbackView
# )
from pramlearnapp.views.student.studentGradeView import (
    StudentGradeView, StudentGradeAnalyticsView, StudentAchievementView
)

from pramlearnapp.views.teacher.teacherViewSet import TeacherViewSet
from pramlearnapp.views.teacher.subjectViewSet import SubjectViewSet, SubjectDetailView
from pramlearnapp.views.teacher.quizViewSet import QuizViewSet
from pramlearnapp.views.teacher.quizRankingView import QuizRankingView
from pramlearnapp.views.teacher.materialViewSet import MaterialViewSet, MaterialDetailView, MaterialAccessView
from pramlearnapp.views.teacher.groupViewSet import (
    GroupViewSet, GroupMemberViewSet, GroupQuizViewSet,
    GroupQuizSubmissionViewSet, GroupQuizResultViewSet,
    AutoGroupStudentsView, AssignQuizToGroupsView
)
from pramlearnapp.views.teacher.fileView import FileUploadView, FileDeleteView
from pramlearnapp.views.teacher.classViewSet import (
    ClassViewSet, ClassDetailPage, ClassWithStudentsViewSet,
    SubjectClassViewSet, SubjectClassDetail
)
from pramlearnapp.views.teacher.assignmentViewSet import (
    AssignmentViewSet, AssignmentSubmissionViewSet,
    AssignmentQuestionViewSet, AssignmentAnswerViewSet, SubmitAssignmentView, AssignmentSubmissionDetailView,
)
from pramlearnapp.views.teacher.relatedUsersView import RelatedUsersForTeacherView, CurrentUserView
from pramlearnapp.views.student.studentDashboardView import StudentDashboardView
from pramlearnapp.views.student.studentSubjectsView import StudentSubjectsView
from pramlearnapp.views.student.quizViewSet import (
    StudentGroupQuizListView, GroupQuizDetailView, SubmitGroupQuizView, GroupQuizResultsView,
)
#     Custom permissions that allow access to a view based on the model's permissions

__all__ = [
    # Admin
    "UserViewSet", "RegisterView", "RoleViewSet", "LoginView",
    # Student
    "AvailableStudentListView", "AvailableAndRelatedStudentListView", "ClassStudentViewSet", "ClassStudentDetail",
    "StudentMotivationProfileView", "UploadARCSCSVView", "StudentViewSet",
    "MaterialAttendanceListView", "update_attendance", "bulk_create_attendance",
    "StudentAvailableAssignmentsView", "StudentAssignmentQuestionsView", "StudentAssignmentDraftView",
    "StudentAssignmentSubmitView", "StudentAssignmentSubmissionsView", "StudentAssignmentBySlugView",
    "StudentGradesView", "StudentGradeAnalyticsView", "QuizAttemptReviewView", "AssignmentSubmissionFeedbackView",
    "ScheduleViewSet", "StudentActivityViewSet", "StudentUpcomingDeadlinesView", "StudentQuickActionsView",
    "StudentMaterialProgressView", "StudentMaterialBookmarkView", "StudentMaterialAccessView", "StudentMaterialActivityView",
    "GroupQuizDetailView", "SubmitGroupQuizView", "GroupQuizResultsView", "StudentGroupQuizListView", "SaveGroupQuizAnswerView",
    "StudentGradeView", "StudentGradeAnalyticsView", "StudentAchievementView",
    # Teacher
    "TeacherViewSet", "SubjectViewSet", "SubjectDetailView", "QuizViewSet", "MaterialViewSet", "MaterialDetailView",
    "MaterialAccessView", "AssignQuizToGroupsView", "GroupViewSet", "GroupMemberViewSet", "GroupQuizViewSet", "GroupQuizSubmissionViewSet",
    "GroupQuizResultViewSet", "AutoGroupStudentsView", "FileUploadView", "FileDeleteView", "ClassViewSet",
    "ClassDetailPage", "ClassWithStudentsViewSet", "SubjectClassViewSet", "SubjectClassDetail",
    "AssignmentViewSet", "AssignmentSubmissionViewSet", "AssignmentQuestionViewSet", "AssignmentAnswerViewSet", "AssignmentSubmissionDetailView",
    "SubmitAssignmentView", "RelatedUsersForTeacherView", "CurrentUserView", "QuizRankingView", "StudentDashboardView",
    "StudentSubjectsView",
]
