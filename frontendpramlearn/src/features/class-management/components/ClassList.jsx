import React from "react";
import { useNavigate } from "react-router-dom";
import useClassManagement from "../hooks/useClassManagement";

const ClassList = ({ classList, onSelectClass, onDeleteClass }) => {
  const { deleteClass } = useClassManagement();
  const navigate = useNavigate();

  const handleDelete = async (classId) => {
    const success = await deleteClass(classId);
    if (success !== false) {
      onDeleteClass(classId);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Classes</h1>
      <ul>
        {classList.map((classItem) => (
          <li key={classItem.id}>
            {classItem.name}
            <button onClick={() => onSelectClass(classItem.id)}>Update</button>
            <button onClick={() => handleDelete(classItem.id)}>Delete</button>
            <button
              onClick={() => navigate(`/management/class/${classItem.slug}`)}
            >
              View Details
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClassList;
