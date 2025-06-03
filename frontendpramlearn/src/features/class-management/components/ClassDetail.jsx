import React from "react";
import useFetchClassDetail from "../hooks/useFetchClassDetail";
import useClassStudents from "../hooks/useClassStudents";
import useFetchSubjects from "../../subject-management/hooks/useFetchSubjects";

const ClassDetail = ({ classId }) => {
  const { classDetail, error, setClassDetail } = useFetchClassDetail(classId);
  const { classStudents, deleteStudent } = useClassStudents(classId);
  const { subjects, deleteSubject } = useFetchSubjects(classId);

  const handleDeleteStudent = async (studentId) => {
    await deleteStudent(studentId);
    setClassDetail((prevDetail) => ({
      ...prevDetail,
      students: prevDetail.students.filter(
        (student) => student.id !== studentId
      ),
    }));
  };

  const handleDeleteSubjectClass = async (subjectId, subjectClassId) => {
    await deleteSubject(subjectId);
    setClassDetail((prevDetail) => ({
      ...prevDetail,
      subjects: prevDetail.subjects.filter(
        (subject) => subject.id !== subjectId
      ),
    }));
  };

  if (error) {
    return <div>Error fetching class detail: {error.message}</div>;
  }

  if (!classDetail) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Class Detail: {classDetail.name}</h1>
      <h2 className="text-xl font-bold">Subjects</h2>
      <ul>
        {(classDetail.subjects || []).map((subject, index) => (
          <li key={`${subject.id}-${index}`}>
            {subject.name}
            <button
              onClick={() => handleDeleteSubjectClass(subject.id, classId)}
            >
              Hapus
            </button>
          </li>
        ))}
      </ul>
      <h2 className="text-xl font-bold">Students</h2>
      <ul>
        {(classDetail.students || []).map((student, index) => (
          <li key={`${student.id}-${index}`}>
            {student.username}
            <button onClick={() => handleDeleteStudent(student.id)}>
              Hapus
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClassDetail;
