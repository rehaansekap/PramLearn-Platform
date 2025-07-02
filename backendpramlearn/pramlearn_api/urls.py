# backendpramlearn/pramlearn_api/urls.py
from django.urls import re_path
from pramlearnapp.consumers import (
    UserStatusConsumer,
    AttendanceConsumer,
    QuizRankingConsumer,
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
import os
from rest_framework.routers import DefaultRouter
from rest_framework import routers
from pramlearnapp.views import (
    RoleViewSet,
    UserViewSet,
    RegisterView,
    LoginView,
    ClassViewSet,
    MaterialDetailView,
    SubjectClassViewSet,
    SubjectViewSet,
    MaterialViewSet,
    AssignmentViewSet,
    AssignmentSubmissionViewSet,
    AssignmentQuestionViewSet,
    AssignmentAnswerViewSet,
    QuizViewSet,
    GroupViewSet,
    GroupMemberViewSet,
    TeacherViewSet,
    SubjectClassDetail,
    FileUploadView,
    FileDeleteView,
    AvailableAndRelatedStudentListView,
    AvailableStudentListView,
    ClassStudentViewSet,
    StudentViewSet,
    ClassDetailPage,
    ClassStudentDetail,
    StudentMotivationProfileView,
    UploadARCSCSVView,
    SubjectDetailView,
    AutoGroupStudentsView,
    AssignQuizToGroupsView,
    GroupQuizViewSet,
    SubmitAssignmentView,
    RelatedUsersForTeacherView,
    MaterialAttendanceListView,
    update_attendance,
    bulk_create_attendance,
    QuizRankingView,
    StudentDashboardView,
    StudentSubjectsView,
    StudentAvailableAssignmentsView,
    StudentAssignmentQuestionsView,
    StudentAssignmentDraftView,
    StudentAssignmentSubmitView,
    StudentAssignmentSubmissionsView,
    StudentAssignmentAnswersView,
    StudentGradeAnalyticsView,
    ScheduleViewSet,
    StudentActivityViewSet,
    MaterialAccessView,
    StudentUpcomingDeadlinesView,
    StudentQuickActionsView,
    StudentMaterialProgressView,
    StudentMaterialBookmarkView,
    StudentMaterialAccessView,
    StudentMaterialActivityView,
    GroupQuizDetailView,
    SubmitGroupQuizView,
    GroupQuizResultsView,
    StudentGroupQuizListView,
    SaveGroupQuizAnswerView,
    AssignmentSubmissionDetailView,
    StudentAssignmentBySlugView,
    StudentAchievementView,
    StudentGradeView,
    AssignmentFeedbackByGradeView,
    QuizReviewView,
    GroupQuizReviewView,
)
from pramlearnapp.views.teacher.relatedUsersView import CurrentUserView
from pramlearnapp.views.teacher.dashboard.teacherDashboardView import (
    TeacherDashboardView,
)
from pramlearnapp.views.teacher.classes.teacherClassesListView import (
    TeacherClassesListView,
)
from pramlearnapp.views.teacher.classes.teacherClassDetailView import (
    TeacherClassDetailView,
)
from pramlearnapp.views.teacher.subjects.teacherSubjectsView import TeacherSubjectsView
from pramlearnapp.views.teacher.subjects.teacherSubjectDetailView import (
    TeacherSubjectDetailView,
)
from pramlearnapp.views.teacher.sessions.teacherSessionsView import TeacherSessionsView
from pramlearnapp.views.teacher.sessions.teacherSessionDetailView import (
    TeacherSessionDetailView,
)
from pramlearnapp.views.teacher.sessions.teacherSessionMaterialDetail import (
    TeacherSessionMaterialDetailView,
    TeacherSessionMaterialContentView,
    TeacherSessionMaterialAttendanceView,
)
from pramlearnapp.views.teacher.sessions.teacherSessionAutoGroupFormationView import (
    TeacherSessionAutoGroupFormationView,
)
from pramlearnapp.views.teacher.sessions.teacherSessionsARCSUploadView import (
    TeacherSessionsARCSUploadView,
    TeacherSessionsARCSSampleView,
)
from pramlearnapp.views.teacher.sessions.teacherSessionsARCSAnalysisExportView import (
    TeacherSessionsARCSAnalysisExportView,
)
from pramlearnapp.views.teacher.sessions.teacherSessionMaterialQuizView import (
    TeacherSessionMaterialQuizView,
    TeacherSessionQuizDetailView,
    TeacherSessionQuizRankingView,
    TeacherSessionQuizAssignmentView,
)
from pramlearnapp.views.teacher.sessions.teacherSessionAssignmentView import (
    TeacherSessionAssignmentView,
    TeacherSessionAssignmentDetailView,
    TeacherSessionAssignmentGradingView,
    TeacherSessionAssignmentAnalyticsView,
)
from pramlearnapp.views.teacher.sessions.teacherSessionARCSManagementView import (
    TeacherSessionARCSQuestionnaireListView,
    TeacherSessionARCSQuestionnaireDetailView,
    TeacherSessionARCSQuestionManagementView,
    TeacherSessionARCSResponsesView,
    TeacherSessionARCSAnalyticsView,
)
from pramlearnapp.views.student.arcs.studentARCSQuestionnaireView import (
    StudentARCSQuestionnaireListView,
    StudentARCSQuestionnaireDetailView,
    StudentARCSResponseSubmitView,
    StudentARCSBySlugView,
    StudentARCSResultsView,
)


router = DefaultRouter()
router.register(
    r"student-activities", StudentActivityViewSet, basename="studentactivity"
)
router.register(r"schedules", ScheduleViewSet, basename="schedule")
router.register(r"roles", RoleViewSet)
router.register(r"users", UserViewSet)
router.register(r"teachers", TeacherViewSet, basename="teacher")
router.register(r"classes", ClassViewSet)
router.register(r"class-students", ClassStudentViewSet)
router.register(r"subject-classes", SubjectClassViewSet)
router.register(r"subjects", SubjectViewSet)
router.register(
    r"subjects/(?P<subject_id>\d+)/materials",
    MaterialViewSet,
    basename="subject-materials",
)
router.register(r"materials", MaterialViewSet, basename="materials")
router.register(r"assignments", AssignmentViewSet)
router.register(r"assignment-submissions", AssignmentSubmissionViewSet)
router.register(r"assignment-questions", AssignmentQuestionViewSet)
router.register(r"quizzes", QuizViewSet)
router.register(r"groups", GroupViewSet)
router.register(r"group-members", GroupMemberViewSet)
router.register(r"students", StudentViewSet, basename="student")
router.register(r"group-quizzes", GroupQuizViewSet, basename="groupquiz")

urlpatterns = [
    path("admin/", admin.site.urls),
    path(
        "api/teacher/sessions/arcs-analysis/export/",
        TeacherSessionsARCSAnalysisExportView.as_view(),
        name="sessions-arcs-analysis-export",
    ),
    path(
        "api/teacher/sessions/upload-arcs/",
        TeacherSessionsARCSUploadView.as_view(),
        name="sessions-arcs-upload",
    ),
    path(
        "api/teacher/sessions/arcs-sample/",
        TeacherSessionsARCSSampleView.as_view(),
        name="sessions-arcs-sample",
    ),
    path("api/users/me/", CurrentUserView.as_view(), name="current-user"),
    path("api-auth/", include("rest_framework.urls", namespace="rest_framework")),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path(
        "api/student/dashboard/",
        StudentDashboardView.as_view(),
        name="student-dashboard",
    ),
    path(
        "api/student/subjects/", StudentSubjectsView.as_view(), name="student-subjects"
    ),
    path(
        "api/available-students/",
        AvailableStudentListView.as_view(),
        name="available-students",
    ),
    path(
        "api/student/group-quiz/",
        StudentGroupQuizListView.as_view(),
        name="student-group-quiz-list",
    ),
    path(
        "api/student/group-quiz/<slug:quiz_slug>/",
        GroupQuizDetailView.as_view(),
        name="group-quiz-detail",
    ),
    path(
        "api/student/group-quiz/<slug:quiz_slug>/submit/",
        SubmitGroupQuizView.as_view(),
        name="submit-group-quiz",
    ),
    path(
        "api/student/group-quiz/<slug:quiz_slug>/results/",
        GroupQuizResultsView.as_view(),
        name="group-quiz-results",
    ),
    path(
        "api/student/group-quiz/<slug:quiz_slug>/save-answer/",
        SaveGroupQuizAnswerView.as_view(),
        name="save-group-quiz-answer",
    ),
    path(
        "api/assignment-answers/",
        AssignmentAnswerViewSet.as_view(),
        name="assignment-answers",
    ),
    path(
        "api/student/assignment/<int:assignment_id>/answers/",
        StudentAssignmentAnswersView.as_view(),
        name="student-assignment-answers",
    ),
    path(
        "api/student/assignments/available/",
        StudentAvailableAssignmentsView.as_view(),
        name="student-available-assignments",
    ),
    path(
        "api/student/assignment/<int:assignment_id>/questions/",
        StudentAssignmentQuestionsView.as_view(),
        name="student-assignment-questions",
    ),
    path(
        "api/student/assignment/<int:assignment_id>/draft/",
        StudentAssignmentDraftView.as_view(),
        name="student-assignment-draft",
    ),
    path(
        "api/student/assignment/<int:assignment_id>/submit/",
        StudentAssignmentSubmitView.as_view(),
        name="student-assignment-submit",
    ),
    path(
        "api/student/assignment/<int:assignment_id>/submissions/",
        StudentAssignmentSubmissionsView.as_view(),
        name="student-assignment-submissions",
    ),
    path(
        "api/student/assignments/<str:assignment_slug>/results/",
        StudentAssignmentBySlugView.as_view(),
        name="student-assignment-by-slug",
    ),
    #     path('api/student/assignment-submission/<int:submission_id>/feedback/',
    #          AssignmentFeedbackByGradeView.as_view(), name='assignment-submission-feedback'),
    path(
        "api/student/assignment-submission/<int:submission_id>/details/",
        AssignmentSubmissionDetailView.as_view(),
        name="assignment-submission-details",
    ),
    path(
        "api/student/analytics/",
        StudentGradeAnalyticsView.as_view(),
        name="student-analytics",
    ),
    path("api/student/grades/", StudentGradeView.as_view(), name="student-grades"),
    path(
        "api/student/analytics/grade-trends/",
        StudentGradeAnalyticsView.as_view(),
        name="student-grade-analytics",
    ),
    path(
        "api/student/achievements/",
        StudentAchievementView.as_view(),
        name="student-achievements",
    ),
    path(
        "api/student/assignment-feedback/grade/<int:grade_id>/",
        AssignmentFeedbackByGradeView.as_view(),
        name="assignment-submission-feedback",
    ),
    path(
        "api/student/quiz-review/<int:attempt_id>/",
        QuizReviewView.as_view(),
        name="quiz-review",
    ),
    path(
        "api/student/group-quiz-review/<int:attempt_id>/",
        GroupQuizReviewView.as_view(),
        name="group-quiz-review",
    ),
    #     path('api/student/grades/', StudentGradesView.as_view(), name='student-grades'),
    #     path('api/student/analytics/grade-trends/',
    #          StudentGradeAnalyticsView.as_view(), name='student-grade-analytics'),
    path(
        "api/student/materials/<int:material_id>/access/",
        MaterialAccessView.as_view(),
        name="material-access",
    ),
    path(
        "api/student/upcoming-deadlines/",
        StudentUpcomingDeadlinesView.as_view(),
        name="student-upcoming-deadlines",
    ),
    path(
        "api/student/quick-actions/",
        StudentQuickActionsView.as_view(),
        name="student-quick-actions",
    ),
    path(
        "api/student/materials/<int:material_id>/progress/",
        StudentMaterialProgressView.as_view(),
        name="student-material-progress",
    ),
    path(
        "api/student/materials/<int:material_id>/bookmarks/",
        StudentMaterialBookmarkView.as_view(),
        name="student-material-bookmarks",
    ),
    path(
        "api/student/materials/<int:material_id>/bookmarks/<int:bookmark_id>/",
        StudentMaterialBookmarkView.as_view(),
        name="student-material-bookmark-detail",
    ),
    path(
        "api/student/materials/<int:material_id>/access/",
        StudentMaterialAccessView.as_view(),
        name="student-material-access",
    ),
    path(
        "api/student/materials/<int:material_id>/activities/",
        StudentMaterialActivityView.as_view(),
    ),
    path(
        "api/student/materials/<slug:material_slug>/arcs-questionnaires/",
        StudentARCSQuestionnaireListView.as_view(),
        name="student-arcs-questionnaires",
    ),
    path(
        "api/student/materials/<slug:material_slug>/arcs-questionnaires/<int:questionnaire_id>/",
        StudentARCSQuestionnaireDetailView.as_view(),
        name="student-arcs-questionnaire-detail",
    ),
    path(
        "api/student/materials/<slug:material_slug>/arcs-questionnaires/<int:questionnaire_id>/submit/",
        StudentARCSResponseSubmitView.as_view(),
        name="student-arcs-questionnaire-submit",
    ),
    path(
        "api/student/materials/<slug:material_slug>/arcs/<slug:arcs_slug>/",
        StudentARCSBySlugView.as_view(),
        name="student-arcs-by-slug",
    ),
    path(
        "api/student/materials/<slug:material_slug>/arcs/<slug:arcs_slug>/submit/",
        StudentARCSResponseSubmitView.as_view(),
        name="student-arcs-submit-by-slug",
    ),
    path(
        "api/student/materials/<slug:material_slug>/arcs/<slug:arcs_slug>/results/",
        StudentARCSResultsView.as_view(),
        name="student-arcs-results-by-slug",
    ),
    path(
        "api/teacher/dashboard/",
        TeacherDashboardView.as_view(),
        name="teacher-dashboard",
    ),
    path(
        "api/teacher/classes/",
        TeacherClassesListView.as_view(),
        name="teacher-classes-list",
    ),
    path(
        "api/teacher/classes/<str:class_slug>/",
        TeacherClassDetailView.as_view(),
        name="teacher-class-detail",
    ),
    path(
        "api/teacher/subjects/", TeacherSubjectsView.as_view(), name="teacher-subjects"
    ),
    path(
        "api/teacher/subjects/<str:subject_slug>/",
        TeacherSubjectDetailView.as_view(),
        name="teacher-subject-detail",
    ),
    path(
        "api/teacher/sessions/", TeacherSessionsView.as_view(), name="teacher-sessions"
    ),
    path(
        "api/teacher/sessions/<slug:subject_slug>/",
        TeacherSessionDetailView.as_view(),
        name="teacher-session-detail",
    ),
    path(
        "api/teacher/sessions/material/<slug:material_slug>/",
        TeacherSessionMaterialDetailView.as_view(),
        name="session-material-detail",
    ),
    path(
        "api/teacher/sessions/material/<slug:material_slug>/attendance/<int:student_id>/",
        TeacherSessionMaterialAttendanceView.as_view(),
        name="teacher-session-material-attendance",
    ),
    path(
        "api/teacher/sessions/material/<slug:material_slug>/content/",
        TeacherSessionMaterialContentView.as_view(),
        name="session-material-content",
    ),
    path(
        "api/teacher/sessions/material/<slug:material_slug>/auto-group/",
        TeacherSessionAutoGroupFormationView.as_view(),
        name="session-auto-group-formation",
    ),
    path(
        "api/teacher/sessions/material/<str:material_slug>/quizzes/",
        TeacherSessionMaterialQuizView.as_view(),
        name="session-material-quizzes",
    ),
    path(
        "api/teacher/sessions/material/<slug:material_slug>/quizzes/<int:quiz_id>/update",
        TeacherSessionMaterialQuizView.as_view(),
        name="teacher-session-material-quiz-update",
    ),
    path(
        "api/teacher/sessions/material/<str:material_slug>/quizzes/<int:quiz_id>/",
        TeacherSessionQuizDetailView.as_view(),
        name="session-quiz-detail",
    ),
    path(
        "api/teacher/sessions/material/<str:material_slug>/quizzes/<int:quiz_id>/ranking/",
        TeacherSessionQuizRankingView.as_view(),
        name="session-quiz-ranking",
    ),
    path(
        "api/teacher/sessions/material/<str:material_slug>/quiz-assignment/",
        TeacherSessionQuizAssignmentView.as_view(),
        name="session-quiz-assignment",
    ),
    path(
        "api/teacher/sessions/material/<str:material_slug>/assignments/",
        TeacherSessionAssignmentView.as_view(),
        name="teacher-session-assignments",
    ),
    path(
        "api/teacher/sessions/material/<str:material_slug>/assignments/<int:assignment_id>/",
        TeacherSessionAssignmentDetailView.as_view(),
        name="teacher-session-assignment-detail",
    ),
    path(
        "api/teacher/sessions/material/<str:material_slug>/assignments/<int:assignment_id>/submissions/<int:submission_id>/grade/",
        TeacherSessionAssignmentGradingView.as_view(),
        name="teacher-session-assignment-grading",
    ),
    path(
        "api/teacher/sessions/material/<str:material_slug>/assignments/analytics/",
        TeacherSessionAssignmentAnalyticsView.as_view(),
        name="teacher-session-assignment-analytics",
    ),
    path(
        "api/teacher/sessions/<slug:material_slug>/arcs-questionnaires/",
        TeacherSessionARCSQuestionnaireListView.as_view(),
        name="teacher-session-arcs-questionnaires",
    ),
    path(
        "api/teacher/sessions/<slug:material_slug>/arcs-questionnaires/<int:questionnaire_id>/",
        TeacherSessionARCSQuestionnaireDetailView.as_view(),
        name="teacher-session-arcs-questionnaire-detail",
    ),
    path(
        "api/teacher/sessions/<slug:material_slug>/arcs-questionnaires/<int:questionnaire_id>/questions/",
        TeacherSessionARCSQuestionManagementView.as_view(),
        name="teacher-session-arcs-questions",
    ),
    path(
        "api/teacher/sessions/<slug:material_slug>/arcs-questionnaires/<int:questionnaire_id>/responses/",
        TeacherSessionARCSResponsesView.as_view(),
        name="teacher-session-arcs-responses",
    ),
    path(
        "api/teacher/sessions/<slug:material_slug>/arcs-questionnaires/<int:questionnaire_id>/analytics/",
        TeacherSessionARCSAnalyticsView.as_view(),
        name="teacher-session-arcs-analytics",
    ),
    #     path('api/student/quiz-attempt/<int:attempt_id>/review/',
    #          QuizAttemptReviewView.as_view(), name='quiz-attempt-review'),
    path(
        "api/available-and-related-students/<int:class_id>/",
        AvailableAndRelatedStudentListView.as_view(),
        name="available-and-related-students",
    ),
    path(
        "api/subjects/<int:subject_id>/materials/",
        MaterialViewSet.as_view({"post": "create"}),
        name="subject-materials",
    ),
    path(
        "api/class-students/<int:class_id>/<int:student_id>/",
        ClassStudentDetail.as_view(),
        name="class-student-detail",
    ),
    path(
        "api/subject-classes/subject/<int:subject_id>/class/<int:class_id>/",
        SubjectClassDetail.as_view(),
        name="subject-class-detail",
    ),
    path("subjects/<slug:slug>/", SubjectDetailView.as_view(), name="subject-detail"),
    #     path('materials/<slug:slug>/',
    #          MaterialDetailView.as_view(), name='material-detail'),
    path(
        "api/assign-quiz-to-groups/",
        AssignQuizToGroupsView.as_view(),
        name="assign-quiz-to-groups",
    ),
    path("classes/<slug:slug>/", ClassDetailPage.as_view(), name="class-detail"),
    path(
        "api/materials/<int:material_id>/auto-group/",
        AutoGroupStudentsView.as_view(),
        name="auto_group_students",
    ),
    path(
        "api/materials/<int:material_id>/attendance/",
        MaterialAttendanceListView.as_view(),
        name="material-attendance-list",
    ),
    path(
        "api/materials/<int:material_id>/attendance/<int:student_id>/",
        update_attendance,
        name="update-attendance",
    ),
    path(
        "api/materials/<int:material_id>/attendance/bulk-create/",
        bulk_create_attendance,
        name="bulk-create-attendance",
    ),
    path(
        "api/quiz-ranking/<int:quiz_id>/",
        QuizRankingView.as_view(),
        name="quiz-ranking",
    ),
    path("api/files/upload/", FileUploadView.as_view(), name="file-upload"),
    path("api/files/<int:pk>/delete/", FileDeleteView.as_view(), name="file-delete"),
    #     path('api/upload-arcs-csv/', UploadARCSCSVView.as_view(), name='upload_arcs_csv'),
    path(
        "student/motivation-profile/",
        StudentMotivationProfileView.as_view(),
        name="student_motivation_profile",
    ),
    path(
        "api/class-students/<int:class_id>/with-profile/",
        ClassStudentViewSet.as_view({"get": "by_class_with_profile"}),
        name="class-students-with-profile",
    ),
    path(
        "api/submit-assignment/",
        SubmitAssignmentView.as_view(),
        name="submit-assignment",
    ),
    path(
        "api/teacher/related-users/",
        RelatedUsersForTeacherView.as_view(),
        name="teacher-related-users",
    ),
    path("api/register/", RegisterView.as_view(), name="register"),
    path("api/login/", LoginView.as_view(), name="login"),
]

websocket_urlpatterns = [
    re_path(r"ws/attendance/(?P<material_id>\d+)/$", AttendanceConsumer.as_asgi()),
    re_path(r"ws/user-status/$", UserStatusConsumer.as_asgi()),
    re_path(
        r"ws/quiz-ranking/(?P<quiz_id>\d+)/(?P<material_id>\d+)/$",
        QuizRankingConsumer.as_asgi(),
    ),
]

if not settings.DEBUG or os.environ.get("SERVE_MEDIA", "False") == "True":
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
