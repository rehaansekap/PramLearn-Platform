from .user import Role, CustomUser, StudentMotivationProfile
from .classes import Class, ClassStudent
from .subject import Subject, SubjectClass
from .group import Group, GroupMember, GroupQuiz, GroupQuizSubmission, GroupQuizResult
from .quiz import Quiz, Question, StudentQuizAttempt, StudentQuizAnswer
from .assignment import Assignment, AssignmentSubmission, AssignmentQuestion, AssignmentAnswer, StudentAssignmentDraft
from .material import Material, File, MaterialYoutubeVideo, StudentMaterialProgress, StudentMaterialBookmark, StudentMaterialActivity
from .attedance import StudentAttendance
from .studentActivity import StudentActivity
from .schedule import Schedule
from .announcement import Announcement

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
    "StudentAssignmentDraft",
    "Material",
    "File",
    "MaterialYoutubeVideo",
    "StudentMaterialProgress",
    "StudentMaterialBookmark",
    "StudentMaterialActivity",
    "StudentAttendance",
    "StudentQuizAttempt",
    "StudentQuizAnswer",
    "StudentActivity",
    "Schedule",
    "Announcement",
]
