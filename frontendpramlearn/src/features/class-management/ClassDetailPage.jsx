// frontendpramlearn/src/pages/ClassDetailPage.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import ClassDetail from "./components/ClassDetail";
import SubjectManagement from "../subject-management/SubjectManagement";
import api from "../../api";
import { AuthContext } from "../../context/AuthContext";

const ClassDetailPage = () => {
  const { classSlug } = useParams();
  const [classId, setClassId] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchClassId = async () => {
      try {
        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const response = await api.get(`classes/?slug=${classSlug}`);
          const filteredClass = response.data.find(
            (classItem) => classItem.slug === classSlug
          );
          if (filteredClass) {
            setClassId(filteredClass.id);
          } else {
            console.error("No class found with the given slug");
          }
        } else {
          console.error("Token is not available");
        }
      } catch (error) {
        console.error("Error fetching class ID:", error);
      }
    };

    if (classSlug) {
      fetchClassId();
    }
  }, [classSlug, token]);

  if (!classId) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <ClassDetail classId={classId} />
    </div>
  );
};

export default ClassDetailPage;
