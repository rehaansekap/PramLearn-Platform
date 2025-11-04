from .teacherSerializer import TeacherSerializer
from .subjectSerializer import SubjectSerializer, SubjectDetailSerializer, SubjectClassSerializer
from .quizSerializer import QuizSerializer
from .materialSerializer import MaterialSerializer, FileSerializer, MaterialDetailSerializer, MaterialYoutubeVideoSerializer
from .groupSerializer import (
    GroupSerializer,
    GroupMemberSerializer,
    GroupQuizSerializer,
    GroupQuizSubmissionSerializer,
    GroupQuizResultSerializer,
)
from .classSerializer import ClassSerializer, ClassDetailSerializer
from .assignmentSerializer import AssignmentSerializer, AssignmentSubmissionSerializer, AssignmentQuestionSerializer, AssignmentAnswerSerializer, AssignmentSubmissionStudentInputSerializer, AssignmentAnswerStudentInputSerializer

__all__ = [
    "TeacherSerializer",
    "SubjectSerializer",
    "SubjectDetailSerializer",
    "SubjectClassSerializer",
    "QuizSerializer",
    "MaterialSerializer",
    "FileSerializer",
    "MaterialDetailSerializer",
    "MaterialYoutubeVideoSerializer",
    "GroupSerializer",
    "GroupMemberSerializer",
    "GroupQuizSerializer",
    "GroupQuizSubmissionSerializer",
    "GroupQuizResultSerializer",
    "ClassSerializer",
    "ClassDetailSerializer",
    "AssignmentSerializer",
    "AssignmentSubmissionSerializer",
    "AssignmentQuestionSerializer",
    "AssignmentAnswerSerializer",
    "AssignmentSubmissionStudentInputSerializer",
    "AssignmentAnswerStudentInputSerializer",
]
