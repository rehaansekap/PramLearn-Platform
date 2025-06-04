# backendpramlearn/pramlearn_api/urls.py
from django.urls import re_path
from pramlearnapp.consumers import UserStatusConsumer, AttendanceConsumer, QuizRankingConsumer
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework import routers
from pramlearnapp.views import (RoleViewSet, UserViewSet, RegisterView, LoginView, ClassViewSet, MaterialDetailView, SubjectClassViewSet,
                                SubjectViewSet, MaterialViewSet, AssignmentViewSet, AssignmentSubmissionViewSet, AssignmentQuestionViewSet, AssignmentAnswerViewSet, QuizViewSet, GroupViewSet, GroupMemberViewSet, TeacherViewSet, SubjectClassDetail, FileUploadView, FileDeleteView,
                                AvailableAndRelatedStudentListView, AvailableStudentListView, ClassStudentViewSet, StudentViewSet,
                                ClassDetailPage, ClassStudentDetail, StudentMotivationProfileView, UploadARCSCSVView, SubjectDetailView,
                                AutoGroupStudentsView, AssignQuizToGroupsView, GroupQuizViewSet, SubmitAssignmentView, RelatedUsersForTeacherView,
                                MaterialAttendanceListView, update_attendance, bulk_create_attendance, QuizRankingView, StudentDashboardView, StudentSubjectsView,
                                StudentAvailableQuizzesView, StudentQuizDetailView, StudentQuizAttemptView, StudentQuizAnswersView, StudentQuizSubmitView, StudentQuizResultsView,
                                StudentAvailableAssignmentsView, StudentAssignmentQuestionsView, StudentAssignmentDraftView, StudentAssignmentSubmitView, StudentAssignmentSubmissionsView
                                )

from pramlearnapp.views.teacher.relatedUsersView import CurrentUserView

router = DefaultRouter()
router.register(r'roles', RoleViewSet)
router.register(r'users', UserViewSet)
router.register(r'teachers', TeacherViewSet, basename='teacher')
router.register(r'classes', ClassViewSet)
router.register(r'class-students', ClassStudentViewSet)
router.register(r'subject-classes', SubjectClassViewSet)
router.register(r'subjects', SubjectViewSet)
router.register(r'subjects/(?P<subject_id>\d+)/materials',
                MaterialViewSet, basename='subject-materials')
router.register(r'materials', MaterialViewSet)
router.register(r'assignments', AssignmentViewSet)
router.register(r'assignment-submissions', AssignmentSubmissionViewSet)
router.register(r'assignment-questions', AssignmentQuestionViewSet)
router.register(r'assignment-answers', AssignmentAnswerViewSet)
router.register(r'quizzes', QuizViewSet)
router.register(r'groups', GroupViewSet)
router.register(r'group-members', GroupMemberViewSet)
router.register(r'students', StudentViewSet, basename='student')
router.register(r'group-quizzes', GroupQuizViewSet, basename='groupquiz')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/me/', CurrentUserView.as_view(), name='current-user'),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/student/dashboard/', StudentDashboardView.as_view(),
         name='student-dashboard'),
    path('api/student/subjects/', StudentSubjectsView.as_view(),
         name='student-subjects'),
    path('api/available-students/', AvailableStudentListView.as_view(),
         name='available-students'),
    path('api/student/quizzes/available/', StudentAvailableQuizzesView.as_view(),
         name='student-available-quizzes'),
    path('api/student/quiz/<str:quiz_slug>/',
         StudentQuizDetailView.as_view(), name='student-quiz-detail'),
    path('api/student/quiz/<str:quiz_slug>/attempt/',
         StudentQuizAttemptView.as_view(), name='student-quiz-attempt'),
    path('api/student/quiz/<str:quiz_slug>/results/',
         StudentQuizResultsView.as_view(), name='student-quiz-results'),
    path('api/student/quiz-attempt/<int:attempt_id>/answers/',
         StudentQuizAnswersView.as_view(), name='student-quiz-answers'),
    path('api/student/quiz-attempt/<int:attempt_id>/submit/',
         StudentQuizSubmitView.as_view(), name='student-quiz-submit'),
    path('api/student/assignments/available/',
         StudentAvailableAssignmentsView.as_view(),
         name='student-available-assignments'),
    path('api/student/assignment/<int:assignment_id>/questions/',
         StudentAssignmentQuestionsView.as_view(),
         name='student-assignment-questions'),
    path('api/student/assignment/<int:assignment_id>/draft/',
         StudentAssignmentDraftView.as_view(),
         name='student-assignment-draft'),
    path('api/student/assignment/<int:assignment_id>/submit/',
         StudentAssignmentSubmitView.as_view(),
         name='student-assignment-submit'),
    path('api/student/assignment/<int:assignment_id>/submissions/',
         StudentAssignmentSubmissionsView.as_view(),
         name='student-assignment-submissions'),
    path('api/available-and-related-students/<int:class_id>/',
         AvailableAndRelatedStudentListView.as_view(), name='available-and-related-students'),
    path('api/subjects/<int:subject_id>/materials/',
         MaterialViewSet.as_view({'post': 'create'}), name='subject-materials'),
    path('api/class-students/<int:class_id>/<int:student_id>/',
         ClassStudentDetail.as_view(), name='class-student-detail'),
    path('api/subject-classes/subject/<int:subject_id>/class/<int:class_id>/',
         SubjectClassDetail.as_view(), name='subject-class-detail'),
    path('subjects/<slug:slug>/',
         SubjectDetailView.as_view(), name='subject-detail'),
    path('materials/<slug:slug>/',
         MaterialDetailView.as_view(), name='material-detail'),
    path("api/assign-quiz-to-groups/", AssignQuizToGroupsView.as_view(),
         name="assign-quiz-to-groups"),
    path('classes/<slug:slug>/', ClassDetailPage.as_view(), name='class-detail'),
    path('api/materials/<int:material_id>/auto-group/',
         AutoGroupStudentsView.as_view(), name="auto_group_students"),
    path('api/materials/<int:material_id>/attendance/',
         MaterialAttendanceListView.as_view(),
         name='material-attendance-list'),
    path('api/materials/<int:material_id>/attendance/<int:student_id>/',
         update_attendance,
         name='update-attendance'),
    path('api/materials/<int:material_id>/attendance/bulk-create/',
         bulk_create_attendance,
         name='bulk-create-attendance'),
    path('api/quiz-ranking/<int:quiz_id>/',
         QuizRankingView.as_view(), name='quiz-ranking'),
    path('api/files/upload/', FileUploadView.as_view(), name='file-upload'),
    path('api/files/<int:pk>/delete/',
         FileDeleteView.as_view(), name='file-delete'),
    path('api/upload-arcs-csv/', UploadARCSCSVView.as_view(), name='upload_arcs_csv'),
    path('student/motivation-profile/', StudentMotivationProfileView.as_view(),
         name='student_motivation_profile'),
    path('api/class-students/<int:class_id>/with-profile/',
         ClassStudentViewSet.as_view({'get': 'by_class_with_profile'}),
         name='class-students-with-profile'),
    path('api/submit-assignment/', SubmitAssignmentView.as_view(),
         name='submit-assignment'),
    path('api/teacher/related-users/', RelatedUsersForTeacherView.as_view(),
         name='teacher-related-users'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', LoginView.as_view(), name='login'),
]

websocket_urlpatterns = [
    re_path(r'ws/attendance/(?P<material_id>\d+)/$',
            AttendanceConsumer.as_asgi()),
    re_path(r'ws/user-status/$',
            UserStatusConsumer.as_asgi()),
    re_path(r'ws/quiz-ranking/(?P<quiz_id>\d+)/(?P<material_id>\d+)/$',
            QuizRankingConsumer.as_asgi()),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
