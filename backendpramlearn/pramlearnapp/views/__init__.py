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
    StudentAssignmentSubmissionsView
)

from pramlearnapp.views.teacher.teacherViewSet import TeacherViewSet
from pramlearnapp.views.teacher.subjectViewSet import SubjectViewSet, SubjectDetailView
from pramlearnapp.views.teacher.quizViewSet import QuizViewSet
from pramlearnapp.views.teacher.quizRankingView import QuizRankingView
from pramlearnapp.views.teacher.materialViewSet import MaterialViewSet, MaterialDetailView
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
    AssignmentQuestionViewSet, AssignmentAnswerViewSet, SubmitAssignmentView
)
from pramlearnapp.views.teacher.relatedUsersView import RelatedUsersForTeacherView, CurrentUserView
from pramlearnapp.views.student.studentDashboardView import StudentDashboardView
from pramlearnapp.views.student.studentSubjectsView import StudentSubjectsView
from pramlearnapp.views.student.quizViewSet import StudentAvailableQuizzesView, StudentQuizDetailView, StudentQuizAttemptView, StudentQuizAnswersView, StudentQuizSubmitView, StudentQuizResultsView
from pramlearnapp.views.student.studentGradesView import StudentGradesView, StudentGradeAnalyticsView, QuizAttemptReviewView, AssignmentSubmissionFeedbackView
#     Custom permissions that allow access to a view based on the model's permissions

__all__ = [
    # Admin
    "UserViewSet", "RegisterView", "RoleViewSet", "LoginView",
    # Student
    "AvailableStudentListView", "AvailableAndRelatedStudentListView", "ClassStudentViewSet", "ClassStudentDetail",
    "StudentMotivationProfileView", "UploadARCSCSVView", "StudentViewSet",
    "MaterialAttendanceListView", "update_attendance", "bulk_create_attendance",
    "StudentAvailableAssignmentsView", "StudentAssignmentQuestionsView", "StudentAssignmentDraftView",
    "StudentAssignmentSubmitView", "StudentAssignmentSubmissionsView",
    "StudentGradesView", "StudentGradeAnalyticsView", "QuizAttemptReviewView", "AssignmentSubmissionFeedbackView",
    # Teacher
    "TeacherViewSet", "SubjectViewSet", "SubjectDetailView", "QuizViewSet", "MaterialViewSet", "MaterialDetailView",
    "AssignQuizToGroupsView", "GroupViewSet", "GroupMemberViewSet", "GroupQuizViewSet", "GroupQuizSubmissionViewSet",
    "GroupQuizResultViewSet", "AutoGroupStudentsView", "FileUploadView", "FileDeleteView", "ClassViewSet",
    "ClassDetailPage", "ClassWithStudentsViewSet", "SubjectClassViewSet", "SubjectClassDetail",
    "AssignmentViewSet", "AssignmentSubmissionViewSet", "AssignmentQuestionViewSet", "AssignmentAnswerViewSet",
    "SubmitAssignmentView", "RelatedUsersForTeacherView", "CurrentUserView", "QuizRankingView", "StudentDashboardView",
    "StudentSubjectsView", "StudentAvailableQuizzesView", "StudentQuizDetailView", "StudentQuizAttemptView", "StudentQuizAnswersView", "StudentQuizSubmitView", "StudentQuizResultsView"
]
