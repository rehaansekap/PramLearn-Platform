// frontendpramlearn/src/components/SubjectList.jsx
import React from "react";
import useFetchSubjects from "../hooks/useFetchSubjects";
import { useNavigate } from "react-router-dom";

const SubjectList = ({ classId, onSelectSubject }) => {
  const { subjects, error, deleteSubject } = useFetchSubjects(classId);
  const navigate = useNavigate();

  if (error) {
    return <div>Error fetching subjects: {error.message}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Subjects</h1>
      <ul>
        {subjects.map((subject) => (
          <li key={subject.id}>
            {subject.name}
            <button onClick={() => onSelectSubject(subject.id)}>Update</button>
            <button onClick={() => deleteSubject(subject.id, subject.class_id)}>
              Delete
            </button>
            <button
              onClick={() => navigate(`/management/subject/${subject.slug}`)}
            >
              Detail Subject
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubjectList;
