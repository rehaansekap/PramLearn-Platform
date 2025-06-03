from pramlearnapp.serializers.admin.authSerializer import LoginSerializer
from pramlearnapp.serializers.admin.userSerializer import UserSerializer
from pramlearnapp.serializers.admin.roleSerializer import RoleSerializer

from pramlearnapp.serializers.student.classStudentSerializer import ClassStudentSerializer
from pramlearnapp.serializers.student.classSerializer import ClassSerializer
from pramlearnapp.serializers.student.classDetailSerializer import ClassDetailSerializer
from pramlearnapp.serializers.student.motivationProfileSerializer import StudentMotivationProfileSerializer
from pramlearnapp.serializers.student.studentSerializer import StudentSerializer, AvailableStudentSerializer
from pramlearnapp.serializers.student.attendanceSerializer import StudentAttendanceSerializer

from pramlearnapp.serializers.teacher.teacherSerializer import TeacherSerializer
from pramlearnapp.serializers.teacher.subjectSerializer import SubjectSerializer, SubjectDetailSerializer, SubjectClassSerializer
from pramlearnapp.serializers.teacher.quizSerializer import QuizSerializer, QuestionSerializer
from pramlearnapp.serializers.teacher.materialSerializer import (
    MaterialSerializer, MaterialDetailSerializer, MaterialYoutubeVideoSerializer, FileSerializer
)
from pramlearnapp.serializers.teacher.groupSerializer import (
    GroupSerializer, GroupMemberSerializer, GroupQuizSerializer,
    GroupQuizSubmissionSerializer, GroupQuizResultSerializer
)
from pramlearnapp.serializers.teacher.classSerializer import ClassSerializer as TeacherClassSerializer, ClassDetailSerializer as TeacherClassDetailSerializer
from pramlearnapp.serializers.teacher.assignmentSerializer import (
    AssignmentSerializer, AssignmentSubmissionSerializer, AssignmentQuestionSerializer,
    AssignmentAnswerSerializer, AssignmentSubmissionStudentInputSerializer, AssignmentAnswerStudentInputSerializer
)

from pramlearnapp.serializers.user.userSerializer import CustomUserSerializer, UserDetailSerializer
from pramlearnapp.serializers.user.roleSerializer import RoleSerializer as UserRoleSerializer

__all__ = [
    # Admin
    "LoginSerializer", "UserSerializer", "RoleSerializer",
    # Student
    "ClassStudentSerializer", "ClassSerializer", "ClassDetailSerializer",
    "StudentMotivationProfileSerializer", "StudentSerializer", "AvailableStudentSerializer",
    "StudentAttendanceSerializer",
    # Teacher
    "TeacherSerializer", "SubjectSerializer", "SubjectDetailSerializer", "SubjectClassSerializer",
    "QuizSerializer", "QuestionSerializer", "MaterialSerializer", "MaterialDetailSerializer",
    "MaterialYoutubeVideoSerializer", "FileSerializer", "GroupSerializer", "GroupMemberSerializer",
    "GroupQuizSerializer", "GroupQuizSubmissionSerializer", "GroupQuizResultSerializer",
    "TeacherClassSerializer", "TeacherClassDetailSerializer",
    "AssignmentSerializer", "AssignmentSubmissionSerializer", "AssignmentQuestionSerializer",
    "AssignmentAnswerSerializer", "AssignmentSubmissionStudentInputSerializer", "AssignmentAnswerStudentInputSerializer",
    # User
    "CustomUserSerializer", "UserDetailSerializer", "UserRoleSerializer",
]
