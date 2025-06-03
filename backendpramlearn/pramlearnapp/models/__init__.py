from .user import Role, CustomUser, StudentMotivationProfile
from .classes import Class, ClassStudent
from .subject import Subject, SubjectClass
from .group import Group, GroupMember, GroupQuiz, GroupQuizSubmission, GroupQuizResult
from .quiz import Quiz, Question, StudentQuizAttempt, StudentQuizAnswer
from .assignment import Assignment, AssignmentSubmission, AssignmentQuestion, AssignmentAnswer
from .material import Material, File, MaterialYoutubeVideo
from .attedance import StudentAttendance

__all__ = [
    "Role",
    "CustomUser",
    "StudentMotivationProfile",
    "Class",
    "ClassStudent",
    "Subject",
    "SubjectClass",
    "Group",
    "GroupMember",
    "GroupQuiz",
    "GroupQuizSubmission",
    "GroupQuizResult",
    "Quiz",
    "Question",
    "Assignment",
    "AssignmentSubmission",
    "AssignmentQuestion",
    "AssignmentAnswer",
    "Material",
    "File",
    "MaterialYoutubeVideo",
    "StudentAttendance"
    "StudentQuizAttempt",
    "StudentQuizAnswer",
]
