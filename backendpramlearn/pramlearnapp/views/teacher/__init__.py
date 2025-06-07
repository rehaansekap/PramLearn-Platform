from pramlearnapp.views.teacher.teacherViewSet import TeacherViewSet

from pramlearnapp.views.teacher.subjectViewSet import (
    SubjectViewSet,
    SubjectDetailView,
)

from pramlearnapp.views.teacher.quizViewSet import QuizViewSet

from pramlearnapp.views.teacher.quizRankingView import QuizRankingView

from pramlearnapp.views.teacher.materialViewSet import (
    MaterialViewSet,
    MaterialDetailView,
)

from pramlearnapp.views.teacher.groupViewSet import (
    GroupViewSet,
    GroupMemberViewSet,
    GroupQuizViewSet,
    GroupQuizSubmissionViewSet,
    GroupQuizResultViewSet,
    AutoGroupStudentsView,
    AssignQuizToGroupsView,
)

from pramlearnapp.views.teacher.fileView import (
    FileUploadView,
    FileDeleteView,
)

from pramlearnapp.views.teacher.classViewSet import (
    ClassViewSet,
    ClassDetailPage,
    ClassWithStudentsViewSet,
    SubjectClassViewSet,
    SubjectClassDetail,
)

from pramlearnapp.views.teacher.assignmentViewSet import (
    AssignmentViewSet,
    AssignmentSubmissionViewSet,
    AssignmentQuestionViewSet,
    AssignmentAnswerViewSet,
    SubmitAssignmentView,
)

from pramlearnapp.views.teacher.relatedUsersView import (
    RelatedUsersForTeacherView,
    CurrentUserView,
)

__all__ = [
    "TeacherViewSet",
    "SubjectViewSet",
    "SubjectDetailView",
    "QuizRankingView",
    "QuizViewSet",
    "MaterialViewSet",
    "MaterialDetailView",
    "AssignQuizToGroupsView",
    "GroupViewSet",
    "GroupMemberViewSet",
    "GroupQuizViewSet",
    "GroupQuizSubmissionViewSet",
    "GroupQuizResultViewSet",
    "AutoGroupStudentsView",
    "FileUploadView",
    "FileDeleteView",
    "ClassWithStudentsViewSet",
    "ClassDetailPage",
    "ClassViewSet",
    "SubjectClassViewSet",
    "SubjectClassDetail",
    "AssignmentViewSet",
    "AssignmentSubmissionViewSet",
    "AssignmentQuestionViewSet",
    "AssignmentAnswerViewSet",
    "SubmitAssignmentView",
    "RelatedUsersForTeacherView",
    "CurrentUserView",
]
